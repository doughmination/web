import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { Resend } from "resend";
import {
  addEmail,
  getEmail,
  listEmails,
  listByThreadKey,
  createDraft,
  updateDraft,
  deleteDraft,
  deleteEmail,
  deleteByThreadKey,
  type Folder,
  type StoredEmail,
  type StoredAttachment,
} from "./lib/store";
import {
  readAttachment,
  saveAttachment,
  deleteAttachment,
  toResendAttachment,
  persistInboundAttachments,
} from "./lib/attachments";
import {
  verifyCredentials,
  createSession,
  isValidSession,
  destroySession,
  ADMIN_DISPLAY_NAME,
} from "./lib/auth";
import {
  bareAddress,
  getSettings,
  resolveFrom,
  getMyAddresses,
  addFromAddress,
  removeFromAddress,
  setDefaultFrom,
} from "./lib/settings";
import {
  pushConfigured,
  vapidPublicKey,
  addSubscription,
  removeSubscription,
  subscriptionCount,
  sendToAll,
} from "./lib/push";
import type { PushSubscription } from "web-push";

// Attachments the frontend uploads arrive as base64; this turns them into
// StoredAttachment rows on disk and, in parallel, the shape Resend wants.
type UploadedAttachment = { filename: string; contentType: string; content: string };

async function persistUploads(uploads: UploadedAttachment[] | undefined): Promise<StoredAttachment[]> {
  if (!uploads?.length) return [];
  return Promise.all(uploads.map((u) => saveAttachment(u.filename, u.contentType, u.content)));
}

// A draft's attachment list, once loaded back into the compose form, is a
// mix of already-stored attachments (only an id/filename/contentType/size —
// no bytes) and freshly-picked files (base64 content, no id yet). Only the
// latter need to be written to disk; the former are kept as-is.
type MixedAttachment =
  | { id: string; filename: string; contentType: string; size: number }
  | UploadedAttachment;

async function resolveAttachments(items: MixedAttachment[] | undefined): Promise<StoredAttachment[]> {
  if (!items?.length) return [];
  const resolved = await Promise.all(
    items.map((item) =>
      "id" in item && item.id
        ? Promise.resolve(item as StoredAttachment)
        : saveAttachment((item as UploadedAttachment).filename, (item as UploadedAttachment).contentType, (item as UploadedAttachment).content)
    )
  );
  return resolved;
}

async function toResendAttachments(attachments: StoredAttachment[]) {
  const resolved = await Promise.all(attachments.map(toResendAttachment));
  return resolved.filter((a): a is { filename: string; content: string } => a !== null);
}

function parseFolder(value: string | undefined): Folder | undefined {
  return value === "inbox" || value === "sent" || value === "drafts" ? value : undefined;
}

const resend = new Resend(process.env.RESEND_API_KEY);
const webhookSecret = process.env.RESEND_WEBHOOK_SECRET ?? "";
// Last-resort fallback only (settings.json is the real source of from-addresses).
// SEND_FROM may be a comma/newline list now, so take the first entry.
const sendFrom = (process.env.SEND_FROM ?? "").split(/[,\n]/)[0]?.trim() ?? "";
const turnstileSecret = process.env.TURNSILE_SECRET ?? "";

// Verifies a Cloudflare Turnstile token against Cloudflare's siteverify
// endpoint. Fails closed: no secret configured or no token supplied both
// result in a rejected login rather than silently skipping the check.
async function verifyTurnstile(token: unknown, remoteIp: string | undefined): Promise<boolean> {
  if (!turnstileSecret) {
    console.error("TURNSILE_SECRET is not set — refusing all logins.");
    return false;
  }
  if (typeof token !== "string" || !token) return false;

  const form = new URLSearchParams();
  form.set("secret", turnstileSecret);
  form.set("response", token);
  if (remoteIp) form.set("remoteip", remoteIp);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error("Turnstile verification request failed", err);
    return false;
  }
}

// --- Threading helpers ---
// bareAddress lives in lib/settings so the address-matching logic is shared.

// Groups inbound + outbound messages into one conversation using
// subject (Re:/Fwd: stripped) + the other party's address, since we
// can't always guarantee an unbroken Message-ID chain across clients.
// `myAddresses` is the set of bare addresses that count as "us", so the
// counterpart is picked correctly no matter which of our identities was used.
function computeThreadKey(subject: string, from: string, to: string[], myAddresses: string[]): string {
  const cleanSubject = (subject || "")
    .replace(/^\s*(re|fwd?)\s*:\s*/i, "")
    .trim()
    .toLowerCase();

  const me = new Set(myAddresses);
  const participants = [bareAddress(from), ...to.map(bareAddress)]
    .filter((addr) => addr && !me.has(addr))
    .sort();

  const counterpart = participants[0] ?? bareAddress(from);
  return `${cleanSubject}::${counterpart}`;
}

// Picks which of our addresses a reply/forward should come from: the caller's
// explicit choice if it's allowlisted, otherwise whichever of our addresses the
// original message involved, otherwise the configured default.
async function pickReplyFrom(original: StoredEmail, requested?: string | null): Promise<string> {
  const settings = await getSettings();
  const inList = (addr: string | undefined | null) =>
    settings.fromAddresses.find((a) => bareAddress(a) === bareAddress(addr));

  if (requested) {
    const match = inList(requested);
    if (match) return match;
  }
  const targets = original.direction === "inbound" ? original.to : [original.from];
  for (const t of targets) {
    const match = inList(t);
    if (match) return match;
  }
  return settings.defaultFrom ?? settings.fromAddresses[0] ?? sendFrom;
}

function buildReferences(original: { references: string | null; messageId: string | null }): string {
  const prior = original.references ? original.references.split(/\s+/).filter(Boolean) : [];
  if (original.messageId) prior.push(original.messageId);
  return prior.join(" ");
}

// --- Deletion / image helpers ---

// Removes the on-disk bytes for every attachment on the given emails. Safe to
// call with rows that have no attachments or metadata-only ones (id === "").
async function purgeAttachmentFiles(emails: StoredEmail[]): Promise<void> {
  const ids = emails.flatMap((e) => e.attachments).map((a) => a.id).filter(Boolean);
  await Promise.all(ids.map((id) => deleteAttachment(id)));
}

// An inline image in an HTML body is referenced as <img src="cid:CONTENT-ID">.
// This rewrites those refs to point at our own attachment endpoint so the
// browser can actually load them, and flags which attachments were consumed
// inline so the UI can avoid also listing them as separate downloads.
type ServableAttachment = StoredAttachment & { inline?: boolean };
type ServableEmail = Omit<StoredEmail, "attachments"> & { attachments: ServableAttachment[] };

function inlineCidImages(email: StoredEmail): ServableEmail {
  const attachments: ServableAttachment[] = email.attachments.map((a) => ({ ...a }));

  const byContentId = new Map<string, StoredAttachment>();
  for (const a of email.attachments) {
    if (a.id && a.contentId) byContentId.set(a.contentId.toLowerCase(), a);
  }

  if (!email.html || !email.html.includes("cid:") || byContentId.size === 0) {
    return { ...email, attachments };
  }

  const usedIds = new Set<string>();
  const html = email.html.replace(/cid:([^"'\s>)]+)/gi, (whole, rawId: string) => {
    const key = rawId.replace(/^<|>$/g, "").trim().toLowerCase();
    const match = byContentId.get(key);
    if (!match) return whole; // unknown cid — leave as-is (shows a broken image)
    usedIds.add(match.id);
    return `/api/emails/${email.id}/attachments/${match.id}?inline=1`;
  });

  return {
    ...email,
    html,
    attachments: attachments.map((a) => (usedIds.has(a.id) ? { ...a, inline: true } : a)),
  };
}

const app = new Hono();

// --- Auth gate ---
// Everything requires a valid session except: the webhook (Resend
// authenticates via signature, not cookies) and the login page/assets.
const PUBLIC_PATHS = new Set([
  "/login",
  "/login.html",
  "/login-test",
  "/login-test.html",
  "/login.js",
  "/style.css",
  "/favicon.ico",
  "/apple-touch-icon.png",
  "/api/login",
  // Service worker + manifest must be fetchable for PWA install / push to
  // register cleanly; neither exposes anything sensitive.
  "/sw.js",
  "/manifest.webmanifest",
]);

app.use("/*", async (c, next) => {
  const path = c.req.path;
  if (path === "/webhook/inbound" || PUBLIC_PATHS.has(path)) {
    return next();
  }

  const token = getCookie(c, "session");
  if (!isValidSession(token)) {
    if (path.startsWith("/api/")) return c.json({ error: "Unauthorized" }, 401);
    return c.redirect("/login");
  }

  return next();
});

app.get("/login", async (c) => {
  return c.html(await Bun.file("./public/login.html").text());
});

// Temporary — Proton Pass detector bisection. Remove once autofill is fixed.
app.get("/login-test", async (c) => {
  return c.html(await Bun.file("./public/login-test.html").text());
});

// These are client-side "routes" — the SPA in public/app.js reads the path
// to decide which folder to show and updates it via history.pushState.
// The server just needs to hand back the same shell for all of them.
app.get("/", async (c) => c.html(await Bun.file("./public/index.html").text()));
app.get("/inbox", async (c) => c.html(await Bun.file("./public/index.html").text()));
app.get("/sent", async (c) => c.html(await Bun.file("./public/index.html").text()));
app.get("/drafts", async (c) => c.html(await Bun.file("./public/index.html").text()));
app.get("/settings", async (c) => c.html(await Bun.file("./public/settings.html").text()));

app.post("/api/login", async (c) => {
  const body = await c.req.json().catch(() => null);

  // Honeypot: invisible to real users, so anything filling it in is
  // automation. Fail the same way as bad credentials — don't let a bot
  // distinguish "caught by honeypot" from "wrong password".
  if (body?.website) {
    return c.json({ error: "Incorrect username or password" }, 401);
  }

  const remoteIp = c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? undefined;
  const turnstileOk = await verifyTurnstile(body?.turnstileToken, remoteIp);
  if (!turnstileOk) {
    return c.json({ error: "Verification failed. Please try again." }, 401);
  }

  if (!body?.username || !body?.password || !verifyCredentials(body.username, body.password)) {
    return c.json({ error: "Incorrect username or password" }, 401);
  }

  const token = createSession();
  setCookie(c, "session", token, {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return c.json({ ok: true });
});

app.post("/api/logout", async (c) => {
  destroySession(getCookie(c, "session"));
  deleteCookie(c, "session", { path: "/" });
  return c.json({ ok: true });
});

app.get("/api/me", (c) => c.json({ displayName: ADMIN_DISPLAY_NAME }));

// --- Static frontend ---
app.use("/*", serveStatic({ root: "./public" }));

// --- Inbound webhook (Resend calls this when an email arrives) ---
app.post("/webhook/inbound", async (c) => {
  const payload = await c.req.text();

  let event: any;
  try {
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: c.req.header("svix-id") ?? "",
        timestamp: c.req.header("svix-timestamp") ?? "",
        signature: c.req.header("svix-signature") ?? "",
      },
      webhookSecret,
    });
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return c.text("Invalid signature", 401);
  }

  if (event.type !== "email.received") {
    return c.json({ ok: true, ignored: event.type });
  }

  const emailId = event.data.email_id;

  // Webhook payload is metadata only — fetch the actual body separately
  const { data: full, error } = await resend.emails.receiving.get(emailId);
  if (error || !full) {
    console.error("Failed to fetch received email content", error);
    return c.json({ ok: false }, 500);
  }

  const subject = full.subject ?? "(no subject)";
  const to = full.to ?? [];
  const inReplyTo = full.headers?.["in-reply-to"] ?? null;
  const references = full.headers?.["references"] ?? null;
  const attachments = await persistInboundAttachments(full.attachments ?? []);
  const myAddresses = await getMyAddresses();

  await addEmail({
    id: full.id,
    from: full.from,
    to,
    subject,
    html: full.html ?? null,
    text: full.text ?? null,
    receivedAt: full.created_at,
    attachments,
    direction: "inbound",
    status: "sent",
    messageId: full.message_id ?? null,
    inReplyTo,
    references,
    threadKey: computeThreadKey(subject, full.from, to, myAddresses),
  });

  // Best-effort push. Never let a notification error fail the webhook —
  // Resend would otherwise retry delivery of an email we already stored.
  try {
    await sendToAll({
      title: full.from ? `New email from ${full.from}` : "New email",
      body: subject,
      url: "/inbox",
      tag: full.id,
    });
  } catch (err) {
    console.error("Push notification failed", err);
  }

  return c.json({ ok: true });
});

// --- API for the frontend ---
app.get("/api/emails", async (c) => {
  const folder = parseFolder(c.req.query("folder"));
  const emails = await listEmails(folder);
  return c.json(emails);
});

// --- Attachment download ---
app.get("/api/emails/:id/attachments/:attachmentId", async (c) => {
  const email = await getEmail(c.req.param("id"));
  if (!email) return c.json({ error: "Not found" }, 404);

  const attachmentId = c.req.param("attachmentId");
  const meta = email.attachments.find((a) => a.id === attachmentId);
  if (!meta || !meta.id) return c.json({ error: "Not found" }, 404);

  const bytes = await readAttachment(meta.id);
  if (!bytes) return c.json({ error: "Not found" }, 404);

  // ?inline=1 is used for image previews and rewritten cid: images, which need
  // to render in-page rather than trigger a download.
  const disposition = c.req.query("inline") === "1" ? "inline" : "attachment";

  return new Response(bytes, {
    headers: {
      "Content-Type": meta.contentType,
      "Content-Disposition": `${disposition}; filename="${meta.filename.replace(/"/g, "")}"`,
      "Content-Length": String(meta.size),
    },
  });
});

app.get("/api/emails/:id", async (c) => {
  const email = await getEmail(c.req.param("id"));
  if (!email) return c.json({ error: "Not found" }, 404);
  return c.json(inlineCidImages(email));
});

// --- Delete a single message (works in any folder) ---
app.delete("/api/emails/:id", async (c) => {
  const removed = await deleteEmail(c.req.param("id"));
  if (!removed) return c.json({ error: "Not found" }, 404);
  await purgeAttachmentFiles([removed]);
  return c.json({ ok: true });
});

// --- Delete an entire conversation at once ---
app.delete("/api/emails/:id/thread", async (c) => {
  const original = await getEmail(c.req.param("id"));
  if (!original) return c.json({ error: "Not found" }, 404);
  const removed = await deleteByThreadKey(original.threadKey);
  await purgeAttachmentFiles(removed);
  return c.json({ ok: true, count: removed.length });
});

app.post("/api/send", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.to || !body?.subject || !body?.html) {
    return c.json({ error: "to, subject, and html are required" }, 400);
  }

  const from = await resolveFrom(body.from);
  const stored = await persistUploads(body.attachments);
  const resendAttachments = await toResendAttachments(stored);

  const { data, error } = await resend.emails.send({
    from,
    to: body.to,
    subject: body.subject,
    html: body.html,
    attachments: resendAttachments.length ? resendAttachments : undefined,
  });

  if (error) return c.json({ error: error.message }, 400);

  const to = [body.to];
  const myAddresses = await getMyAddresses();
  await addEmail({
    id: data.id,
    from,
    to,
    subject: body.subject,
    html: body.html,
    text: null,
    receivedAt: new Date().toISOString(),
    attachments: stored,
    direction: "outbound",
    status: "sent",
    messageId: null, // Resend doesn't hand back the RFC Message-ID it assigned
    inReplyTo: null,
    references: null,
    threadKey: computeThreadKey(body.subject, from, to, myAddresses),
  });

  return c.json(data);
});

// --- Reply: keeps the recipient's mail client threading correct via
// In-Reply-To / References, and groups the reply with the original
// in our own UI via threadKey ---
app.post("/api/emails/:id/reply", async (c) => {
  const original = await getEmail(c.req.param("id"));
  if (!original) return c.json({ error: "Not found" }, 404);

  const body = await c.req.json().catch(() => null);
  if (!body?.html) return c.json({ error: "html is required" }, 400);

  const to = body.to ?? original.from;
  const subject = /^\s*re\s*:/i.test(original.subject)
    ? original.subject
    : `Re: ${original.subject}`;

  const headers: Record<string, string> = {};
  if (original.messageId) {
    headers["In-Reply-To"] = original.messageId;
    headers["References"] = buildReferences(original);
  }

  const from = await pickReplyFrom(original, body.from);
  const stored = await persistUploads(body.attachments);
  const resendAttachments = await toResendAttachments(stored);

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html: body.html,
    headers,
    attachments: resendAttachments.length ? resendAttachments : undefined,
  });

  if (error) return c.json({ error: error.message }, 400);

  await addEmail({
    id: data.id,
    from,
    to: [to],
    subject,
    html: body.html,
    text: null,
    receivedAt: new Date().toISOString(),
    attachments: stored,
    direction: "outbound",
    status: "sent",
    messageId: null,
    inReplyTo: original.messageId,
    references: headers["References"] ?? null,
    threadKey: original.threadKey,
  });

  return c.json(data);
});

// --- Forward: for inbound mail, use Resend's built-in forward() so the
// original body + attachments are preserved exactly; for something we
// sent ourselves, just re-send the stored HTML to a new recipient ---
app.post("/api/emails/:id/forward", async (c) => {
  const original = await getEmail(c.req.param("id"));
  if (!original) return c.json({ error: "Not found" }, 404);

  const body = await c.req.json().catch(() => null);
  if (!body?.to) return c.json({ error: "to is required" }, 400);

  const from = await pickReplyFrom(original, body.from);

  if (original.direction === "inbound") {
    const { data, error } = await resend.emails.receiving.forward({
      emailId: original.id,
      to: body.to,
      from,
    });
    if (error) return c.json({ error: error.message }, 400);
    return c.json(data);
  }

  const { data, error } = await resend.emails.send({
    from,
    to: body.to,
    subject: /^\s*fwd?\s*:/i.test(original.subject) ? original.subject : `Fwd: ${original.subject}`,
    html: original.html ?? `<pre>${original.text ?? ""}</pre>`,
  });
  if (error) return c.json({ error: error.message }, 400);
  return c.json(data);
});

// --- Full conversation for the detail view ---
app.get("/api/emails/:id/thread", async (c) => {
  const original = await getEmail(c.req.param("id"));
  if (!original) return c.json({ error: "Not found" }, 404);
  const thread = await listByThreadKey(original.threadKey);
  return c.json(thread.map(inlineCidImages));
});

// --- Drafts ---
// Stored as ordinary email rows with status "draft"; they don't hit
// Resend until explicitly sent via /api/drafts/:id/send.
app.post("/api/drafts", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.subject && !body?.html && !body?.to) {
    return c.json({ error: "Nothing to save" }, 400);
  }

  const stored = await resolveAttachments(body.attachments);
  const draft = await createDraft({
    to: body.to ? [body.to].flat() : [],
    subject: body.subject ?? "",
    html: body.html ?? "",
    from: typeof body.from === "string" ? body.from : undefined,
    attachments: stored,
  });

  return c.json(draft);
});

app.put("/api/drafts/:id", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: "Invalid body" }, 400);

  const stored = await resolveAttachments(body.attachments);
  const draft = await updateDraft(c.req.param("id"), {
    to: body.to ? [body.to].flat() : [],
    subject: body.subject ?? "",
    html: body.html ?? "",
    from: typeof body.from === "string" ? body.from : undefined,
    attachments: stored,
  });

  if (!draft) return c.json({ error: "Not found" }, 404);
  return c.json(draft);
});

app.delete("/api/drafts/:id", async (c) => {
  const draft = await getEmail(c.req.param("id"));
  if (!draft || draft.status !== "draft") return c.json({ error: "Not found" }, 404);
  await deleteDraft(draft.id);
  await purgeAttachmentFiles([draft]);
  return c.json({ ok: true });
});

app.post("/api/drafts/:id/send", async (c) => {
  const draft = await getEmail(c.req.param("id"));
  if (!draft || draft.status !== "draft") return c.json({ error: "Not found" }, 404);
  if (!draft.to.length || !draft.subject || !draft.html) {
    return c.json({ error: "to, subject, and html are required" }, 400);
  }

  const from = await resolveFrom(draft.from || undefined);
  const resendAttachments = await toResendAttachments(draft.attachments);

  const { data, error } = await resend.emails.send({
    from,
    to: draft.to,
    subject: draft.subject,
    html: draft.html,
    attachments: resendAttachments.length ? resendAttachments : undefined,
  });

  if (error) return c.json({ error: error.message }, 400);

  const myAddresses = await getMyAddresses();
  await deleteDraft(draft.id);
  await addEmail({
    id: data.id,
    from,
    to: draft.to,
    subject: draft.subject,
    html: draft.html,
    text: null,
    receivedAt: new Date().toISOString(),
    attachments: draft.attachments,
    direction: "outbound",
    status: "sent",
    messageId: null,
    inReplyTo: null,
    references: null,
    threadKey: computeThreadKey(draft.subject, from, draft.to, myAddresses),
  });

  return c.json(data);
});

// --- Settings API: manage the send-from address list ---
app.get("/api/settings", async (c) => c.json(await getSettings()));

app.post("/api/settings/from", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.address || typeof body.address !== "string") {
    return c.json({ error: "address is required" }, 400);
  }
  try {
    return c.json(await addFromAddress(body.address));
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400);
  }
});

app.post("/api/settings/from/remove", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.address || typeof body.address !== "string") {
    return c.json({ error: "address is required" }, 400);
  }
  return c.json(await removeFromAddress(body.address));
});

app.post("/api/settings/default", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.address || typeof body.address !== "string") {
    return c.json({ error: "address is required" }, 400);
  }
  try {
    return c.json(await setDefaultFrom(body.address));
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400);
  }
});

// --- Web Push API ---
// The client needs the VAPID public key to build a subscription, then POSTs
// the resulting subscription here so the webhook can notify it later.
app.get("/api/push/status", async (c) =>
  c.json({
    configured: pushConfigured(),
    publicKey: vapidPublicKey(),
    count: await subscriptionCount(),
  })
);

app.post("/api/push/subscribe", async (c) => {
  const body = await c.req.json().catch(() => null);
  const sub = body?.subscription ?? body;
  if (!sub?.endpoint || !sub?.keys) return c.json({ error: "Invalid subscription" }, 400);
  await addSubscription(sub as PushSubscription);
  return c.json({ ok: true });
});

app.post("/api/push/unsubscribe", async (c) => {
  const body = await c.req.json().catch(() => null);
  const endpoint = body?.endpoint ?? body?.subscription?.endpoint;
  if (!endpoint || typeof endpoint !== "string") {
    return c.json({ error: "endpoint is required" }, 400);
  }
  await removeSubscription(endpoint);
  return c.json({ ok: true });
});

app.post("/api/push/test", async (c) => {
  if (!pushConfigured()) {
    return c.json({ error: "Push is not configured on the server." }, 400);
  }
  const result = await sendToAll({
    title: "Test notification",
    body: "Your inbox notifications are working.",
    url: "/inbox",
    tag: "mailbox-test",
  });
  return c.json(result);
});

const port = process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : 3000;
console.log(`Listening on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};