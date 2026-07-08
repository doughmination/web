import { mkdir } from "node:fs/promises";
import path from "node:path";
import type { StoredAttachment } from "./store";

const DATA_DIR = process.env.DATA_DIR ?? "./data";
const ATTACHMENTS_DIR = path.join(DATA_DIR, "attachments");

async function ensureDir() {
  await mkdir(ATTACHMENTS_DIR, { recursive: true });
}

function filePath(attachmentId: string): string {
  return path.join(ATTACHMENTS_DIR, attachmentId);
}

// Saves base64-encoded content to disk and returns the metadata that gets
// stored on the email record. Used both for files a person attaches when
// composing and for attachments pulled off an inbound webhook payload.
export async function saveAttachment(
  filename: string,
  contentType: string,
  base64Content: string
): Promise<StoredAttachment> {
  await ensureDir();
  const id = crypto.randomUUID();
  const bytes = Buffer.from(base64Content, "base64");
  await Bun.write(filePath(id), bytes);
  return {
    id,
    filename: filename || "attachment",
    contentType: contentType || "application/octet-stream",
    size: bytes.length,
  };
}

export async function readAttachment(attachmentId: string): Promise<Uint8Array | null> {
  const file = Bun.file(filePath(attachmentId));
  if (!(await file.exists())) return null;
  return new Uint8Array(await file.arrayBuffer());
}

export async function deleteAttachment(attachmentId: string): Promise<void> {
  const file = Bun.file(filePath(attachmentId));
  if (await file.exists()) {
    await file.delete();
  }
}

// Round-trips a stored attachment back into the shape Resend's send() API
// expects (base64 content alongside the filename).
export async function toResendAttachment(
  att: StoredAttachment
): Promise<{ filename: string; content: string } | null> {
  const bytes = await readAttachment(att.id);
  if (!bytes) return null;
  return { filename: att.filename, content: Buffer.from(bytes).toString("base64") };
}

// Resend's inbound webhook hands back attachment metadata plus base64
// content per attachment. The exact field names have shifted across Resend
// API versions, so this reads defensively and skips anything it can't
// make sense of rather than throwing and dropping the whole email.
export async function persistInboundAttachments(attachments: unknown): Promise<StoredAttachment[]> {
  if (!Array.isArray(attachments)) return [];

  const results: StoredAttachment[] = [];
  for (const raw of attachments) {
    if (!raw || typeof raw !== "object") continue;
    const a = raw as Record<string, unknown>;
    const content = typeof a.content === "string" ? a.content : null;
    const filename =
      (typeof a.filename === "string" && a.filename) ||
      (typeof a.name === "string" && a.name) ||
      "attachment";
    const contentType =
      (typeof a.contentType === "string" && a.contentType) ||
      (typeof a.content_type === "string" && a.content_type) ||
      (typeof a.type === "string" && a.type) ||
      "application/octet-stream";

    if (!content) {
      // No inline bytes available from the webhook — skip persisting to
      // disk but keep the metadata so the UI can still show the filename.
      results.push({ id: "", filename, contentType, size: 0 });
      continue;
    }

    try {
      results.push(await saveAttachment(filename, contentType, content));
    } catch (err) {
      console.error("Failed to persist inbound attachment", filename, err);
    }
  }
  return results;
}
