import { mkdir } from "node:fs/promises";
import path from "node:path";
import * as webpush from "web-push";
import type { PushSubscription } from "web-push";

const DATA_DIR = process.env.DATA_DIR ?? "./data";
const SUBS_FILE = path.join(DATA_DIR, "subscriptions.json");

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:admin@localhost";

// Push is entirely optional: without VAPID keys the endpoints still respond,
// they just report "not configured" instead of 500-ing.
export function pushConfigured(): boolean {
  return Boolean(VAPID_PUBLIC && VAPID_PRIVATE);
}

export function vapidPublicKey(): string {
  return VAPID_PUBLIC;
}

let vapidReady = false;
function ensureVapid(): boolean {
  if (vapidReady) return true;
  if (!pushConfigured()) return false;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
  vapidReady = true;
  return true;
}

export type PushPayload = { title: string; body: string; url?: string; tag?: string };

let queue: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const result = queue.then(fn, fn);
  queue = result.catch(() => {});
  return result;
}

function isSubscription(x: unknown): x is PushSubscription {
  if (!x || typeof x !== "object") return false;
  const s = x as Record<string, unknown>;
  return typeof s.endpoint === "string" && !!s.keys && typeof s.keys === "object";
}

async function ensureFile(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const file = Bun.file(SUBS_FILE);
  if (!(await file.exists())) await Bun.write(SUBS_FILE, "[]");
}

async function readAll(): Promise<PushSubscription[]> {
  await ensureFile();
  try {
    const parsed = JSON.parse(await Bun.file(SUBS_FILE).text());
    return Array.isArray(parsed) ? parsed.filter(isSubscription) : [];
  } catch {
    return [];
  }
}

async function writeAll(subs: PushSubscription[]): Promise<void> {
  await Bun.write(SUBS_FILE, JSON.stringify(subs, null, 2));
}

// Endpoint is the stable unique id for a subscription, so we dedupe on it.
export function addSubscription(sub: PushSubscription): Promise<void> {
  return withLock(async () => {
    if (!isSubscription(sub)) throw new Error("Invalid subscription");
    const subs = await readAll();
    const rest = subs.filter((s) => s.endpoint !== sub.endpoint);
    rest.push(sub);
    await writeAll(rest);
  });
}

export function removeSubscription(endpoint: string): Promise<void> {
  return withLock(async () => {
    const subs = await readAll();
    await writeAll(subs.filter((s) => s.endpoint !== endpoint));
  });
}

export function listSubscriptions(): Promise<PushSubscription[]> {
  return withLock(readAll);
}

export function subscriptionCount(): Promise<number> {
  return withLock(async () => (await readAll()).length);
}

// Fans a payload out to every registered device. Subscriptions the push
// service reports as gone (404/410) are pruned so the file doesn't rot.
export async function sendToAll(payload: PushPayload): Promise<{ sent: number; pruned: number }> {
  if (!ensureVapid()) return { sent: 0, pruned: 0 };

  const subs = await listSubscriptions();
  const data = JSON.stringify(payload);
  const dead: string[] = [];
  let sent = 0;

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, data);
        sent++;
      } catch (err) {
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) {
          dead.push(sub.endpoint);
        } else {
          console.error("Push send failed", status ?? "", (err as { body?: string })?.body ?? err);
        }
      }
    })
  );

  for (const endpoint of dead) await removeSubscription(endpoint);
  return { sent, pruned: dead.length };
}
