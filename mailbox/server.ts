import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { Resend } from "resend";
import { addEmail, getEmail, listEmails, listByThreadKey } from "./lib/store";
import {
  verifyCredentials,
  createSession,
  isValidSession,
  destroySession,
  ADMIN_DISPLAY_NAME,
} from "./lib/auth";

const resend = new Resend(process.env.RESEND_API_KEY);
const webhookSecret = process.env.RESEND_WEBHOOK_SECRET ?? "";
const sendFrom = process.env.SEND_FROM ?? "";

// --- Threading helpers ---

// Pulls a bare address out of "Name <addr@domain>" or plain "addr@domain"
function bareAddress(input: string | undefined | null): string {
  if (!input) return "";
  const match = input.match(/<([^>]+)>/);
  return (match ? match[1] : input).trim().toLowerCase();
}

// Groups inbound + outbound messages into one conversation using
// subject (Re:/Fwd: stripped) + the other party's address, since we
// can't always guarantee an unbroken Message-ID chain across clients.
function computeThreadKey(subject: string, from: string, to: string[]): string {
  const cleanSubject = (subject || "")
    .replace(/^\s*(re|fwd?)\s*:\s*/i, "")
    .trim()
    .toLowerCase();

  const me = bareAddress(sendFrom);
  const participants = [bareAddress(from), ...to.map(bareAddress)]
    .filter((addr) => addr && addr !== me)
    .sort();

  const counterpart = participants[0] ?? bareAddress(from);
  return `${cleanSubject}::${counterpart}`;
}

function buildReferences(original: { references: string | null; messageId: string | null }): string {
  const prior = original.references ? original.references.split(/\s+/).filter(Boolean) : [];
  if (original.messageId) prior.push(original.messageId);
  return prior.join(" ");
}

const app = new Hono();

// --- Auth gate ---
// Everything requires a valid session except: the webhook (Resend
// authenticates via signature, not cookies) and the login page/assets.
const PUBLIC_PATHS = new Set(["/login", "/login.html", "/login.js", "/style.css", "/api/login"]);

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

app.post("/api/login", async (c) => {
  const body = await c.req.json().catch(() => null);
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

  await addEmail({
    id: full.id,
    from: full.from,
    to,
    subject,
    html: full.html ?? null,
    text: full.text ?? null,
    receivedAt: full.created_at,
    attachments: full.attachments ?? [],
    direction: "inbound",
    messageId: full.message_id ?? null,
    inReplyTo,
    references,
    threadKey: computeThreadKey(subject, full.from, to),
  });

  return c.json({ ok: true });
});

// --- API for the frontend ---
app.get("/api/emails", async (c) => {
  const emails = await listEmails();
  return c.json(emails);
});

app.get("/api/emails/:id", async (c) => {
  const email = await getEmail(c.req.param("id"));
  if (!email) return c.json({ error: "Not found" }, 404);
  return c.json(email);
});

app.post("/api/send", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.to || !body?.subject || !body?.html) {
    return c.json({ error: "to, subject, and html are required" }, 400);
  }

  const { data, error } = await resend.emails.send({
    from: sendFrom,
    to: body.to,
    subject: body.subject,
    html: body.html,
  });

  if (error) return c.json({ error: error.message }, 400);

  const to = [body.to];
  await addEmail({
    id: data.id,
    from: sendFrom,
    to,
    subject: body.subject,
    html: body.html,
    text: null,
    receivedAt: new Date().toISOString(),
    attachments: [],
    direction: "outbound",
    messageId: null, // Resend doesn't hand back the RFC Message-ID it assigned
    inReplyTo: null,
    references: null,
    threadKey: computeThreadKey(body.subject, sendFrom, to),
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

  const { data, error } = await resend.emails.send({
    from: sendFrom,
    to,
    subject,
    html: body.html,
    headers,
  });

  if (error) return c.json({ error: error.message }, 400);

  await addEmail({
    id: data.id,
    from: sendFrom,
    to: [to],
    subject,
    html: body.html,
    text: null,
    receivedAt: new Date().toISOString(),
    attachments: [],
    direction: "outbound",
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

  if (original.direction === "inbound") {
    const { data, error } = await resend.emails.receiving.forward({
      emailId: original.id,
      to: body.to,
      from: sendFrom,
    });
    if (error) return c.json({ error: error.message }, 400);
    return c.json(data);
  }

  const { data, error } = await resend.emails.send({
    from: sendFrom,
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
  return c.json(thread);
});

const port = process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : 3000;
console.log(`Listening on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};