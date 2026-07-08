import { mkdir } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = process.env.DATA_DIR ?? "./data";
const DATA_FILE = path.join(DATA_DIR, "emails.json");

export type StoredEmail = {
  id: string;
  from: string;
  to: string[];
  subject: string;
  html: string | null;
  text: string | null;
  receivedAt: string;
  attachments: unknown[];
  direction: "inbound" | "outbound";
  messageId: string | null; // RFC Message-ID of this email, if known
  inReplyTo: string | null; // Message-ID this email is replying to
  references: string | null; // space-separated chain of Message-IDs
  threadKey: string; // our own grouping key (subject + counterpart)
};

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

async function readAll(): Promise<StoredEmail[]> {
  await ensureFile();
  const text = await Bun.file(DATA_FILE).text();
  try {
    return JSON.parse(text);
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

export function listEmails() {
  return withLock(async () => {
    const emails = await readAll();
    // Don't ship full HTML bodies to the list view
    return emails.map(({ html, text, ...meta }) => meta);
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