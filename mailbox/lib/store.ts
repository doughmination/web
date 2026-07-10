import { mkdir } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = process.env.DATA_DIR ?? "./data";
const DATA_FILE = path.join(DATA_DIR, "emails.json");

export type StoredAttachment = {
  id: string; // used to fetch the raw bytes back via lib/attachments
  filename: string;
  contentType: string;
  size: number; // bytes
  contentId?: string | null; // RFC Content-ID for inline (cid:) images, if any
};

export type Folder = "inbox" | "sent" | "drafts";

export type StoredEmail = {
  id: string;
  from: string;
  to: string[];
  subject: string;
  html: string | null;
  text: string | null;
  receivedAt: string;
  attachments: StoredAttachment[];
  direction: "inbound" | "outbound";
  status: "sent" | "draft"; // drafts live in the same table as real mail
  messageId: string | null; // RFC Message-ID of this email, if known
  inReplyTo: string | null; // Message-ID this email is replying to
  references: string | null; // space-separated chain of Message-IDs
  threadKey: string; // our own grouping key (subject + counterpart)
};

// A draft doesn't have most of the threading/delivery metadata yet —
// callers only need to supply the fields a person can actually edit.
export type DraftInput = {
  to: string[];
  subject: string;
  html: string;
  attachments: StoredAttachment[];
  from?: string; // chosen send-from address, resolved/validated at send time
  inReplyTo?: string | null;
  references?: string | null;
  threadKey?: string | null;
};

export function folderOf(email: Pick<StoredEmail, "direction" | "status">): Folder {
  if (email.status === "draft") return "drafts";
  return email.direction === "inbound" ? "inbox" : "sent";
}

// Bun is single-threaded, but two concurrent webhook deliveries could still
// interleave their read-modify-write cycles. This chains every write onto
// the same promise so they run one at a time, in order.
let queue: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const result = queue.then(fn, fn);
  queue = result.catch(() => {});
  return result;
}

async function ensureFile() {
  await mkdir(DATA_DIR, { recursive: true });
  const file = Bun.file(DATA_FILE);
  if (!(await file.exists())) {
    await Bun.write(DATA_FILE, "[]");
  }
}

// Older records predate the drafts/attachments rework, so backfill sane
// defaults instead of forcing a migration script.
function normalize(raw: any): StoredEmail {
  return {
    ...raw,
    attachments: Array.isArray(raw.attachments) ? raw.attachments : [],
    status: raw.status === "draft" ? "draft" : "sent",
  };
}

async function readAll(): Promise<StoredEmail[]> {
  await ensureFile();
  const text = await Bun.file(DATA_FILE).text();
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed.map(normalize) : [];
  } catch {
    return [];
  }
}

async function writeAll(emails: StoredEmail[]) {
  await Bun.write(DATA_FILE, JSON.stringify(emails, null, 2));
}

export function addEmail(email: StoredEmail) {
  return withLock(async () => {
    const emails = await readAll();
    emails.unshift(email); // newest first
    await writeAll(emails);
    return email;
  });
}

export function listEmails(folder?: Folder) {
  return withLock(async () => {
    const emails = await readAll();
    const filtered = folder ? emails.filter((e) => folderOf(e) === folder) : emails;
    // Don't ship full HTML bodies to the list view
    return filtered.map(({ html, text, ...meta }) => meta);
  });
}

export function getEmail(id: string) {
  return withLock(async () => {
    const emails = await readAll();
    return emails.find((e) => e.id === id) ?? null;
  });
}

export function findByMessageId(messageId: string) {
  return withLock(async () => {
    const emails = await readAll();
    return emails.find((e) => e.messageId === messageId) ?? null;
  });
}

export function listByThreadKey(threadKey: string) {
  return withLock(async () => {
    const emails = await readAll();
    return emails
      .filter((e) => e.threadKey === threadKey)
      .sort((a, b) => a.receivedAt.localeCompare(b.receivedAt));
  });
}

// --- Drafts ---
// Drafts are ordinary StoredEmail rows with status "draft" and
// direction "outbound"; they're excluded from threads until sent.

export function createDraft(input: DraftInput) {
  return withLock(async () => {
    const emails = await readAll();
    const draft: StoredEmail = {
      id: crypto.randomUUID(),
      from: input.from ?? "",
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: null,
      receivedAt: new Date().toISOString(),
      attachments: input.attachments,
      direction: "outbound",
      status: "draft",
      messageId: null,
      inReplyTo: input.inReplyTo ?? null,
      references: input.references ?? null,
      threadKey: input.threadKey ?? `draft::${crypto.randomUUID()}`,
    };
    emails.unshift(draft);
    await writeAll(emails);
    return draft;
  });
}

export function updateDraft(id: string, input: DraftInput) {
  return withLock(async () => {
    const emails = await readAll();
    const idx = emails.findIndex((e) => e.id === id && e.status === "draft");
    if (idx === -1) return null;
    const existing = emails[idx]!;
    const updated: StoredEmail = {
      ...existing,
      to: input.to,
      subject: input.subject,
      html: input.html,
      attachments: input.attachments,
      from: input.from ?? existing.from,
      receivedAt: new Date().toISOString(),
    };
    emails[idx] = updated;
    await writeAll(emails);
    return updated;
  });
}

export function deleteDraft(id: string) {
  return withLock(async () => {
    const emails = await readAll();
    const idx = emails.findIndex((e) => e.id === id && e.status === "draft");
    if (idx === -1) return false;
    emails.splice(idx, 1);
    await writeAll(emails);
    return true;
  });
}

// --- General deletion ---
// Unlike deleteDraft, these remove any row regardless of status and hand the
// removed record(s) back so the caller can clean up attachment files on disk.

export function deleteEmail(id: string) {
  return withLock(async () => {
    const emails = await readAll();
    const idx = emails.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    const [removed] = emails.splice(idx, 1);
    await writeAll(emails);
    return removed ?? null;
  });
}

export function deleteByThreadKey(threadKey: string) {
  return withLock(async () => {
    const emails = await readAll();
    const removed = emails.filter((e) => e.threadKey === threadKey);
    if (removed.length === 0) return [];
    await writeAll(emails.filter((e) => e.threadKey !== threadKey));
    return removed;
  });
}
