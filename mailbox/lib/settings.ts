import { mkdir } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = process.env.DATA_DIR ?? "./data";
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

// User-managed configuration. Right now that's just the list of addresses the
// account is allowed to send as, plus which one is the default. It lives next
// to emails.json so it rides along on the same persistent volume.
export type Settings = {
  fromAddresses: string[]; // "Name <addr@domain>" or bare "addr@domain"
  defaultFrom: string | null;
};

// Pulls a bare, lowercased address out of "Name <addr@domain>" or "addr@domain".
export function bareAddress(input: string | undefined | null): string {
  if (!input) return "";
  const match = input.match(/<([^>]+)>/);
  return (match?.[1] ? match[1] : input).trim().toLowerCase();
}

// Light structural check only — real deliverability is enforced by Resend at
// send time, which rejects unverified domains.
export function isValidAddress(input: string): boolean {
  const bare = bareAddress(input);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bare);
}

export function parseAddressList(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return raw
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Same single-writer lock discipline as the email store, so two concurrent
// settings writes can't interleave read-modify-write cycles.
let queue: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const result = queue.then(fn, fn);
  queue = result.catch(() => {});
  return result;
}

function dedupe(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const a of list) {
    const key = bareAddress(a);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(a);
  }
  return out;
}

// First-run defaults come from the SEND_FROM env var so existing single-address
// setups carry over without any manual migration.
function seedFromEnv(): Settings {
  const seeded = dedupe(parseAddressList(process.env.SEND_FROM));
  return { fromAddresses: seeded, defaultFrom: seeded[0] ?? null };
}

function normalize(raw: unknown): Settings {
  const r = (raw ?? {}) as Record<string, unknown>;
  const fromAddresses = Array.isArray(r.fromAddresses)
    ? dedupe(r.fromAddresses.filter((x): x is string => typeof x === "string"))
    : [];

  let defaultFrom = typeof r.defaultFrom === "string" ? r.defaultFrom : null;
  const df = defaultFrom;
  // Keep defaultFrom pointing at an address that still exists.
  if (df && !fromAddresses.some((a) => bareAddress(a) === bareAddress(df))) {
    defaultFrom = null;
  }
  if (!defaultFrom && fromAddresses.length) defaultFrom = fromAddresses[0] ?? null;

  return { fromAddresses, defaultFrom };
}

async function ensureFile(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const file = Bun.file(SETTINGS_FILE);
  if (!(await file.exists())) {
    await Bun.write(SETTINGS_FILE, JSON.stringify(seedFromEnv(), null, 2));
  }
}

async function read(): Promise<Settings> {
  await ensureFile();
  try {
    return normalize(JSON.parse(await Bun.file(SETTINGS_FILE).text()));
  } catch {
    return seedFromEnv();
  }
}

async function write(s: Settings): Promise<void> {
  await Bun.write(SETTINGS_FILE, JSON.stringify(s, null, 2));
}

export function getSettings(): Promise<Settings> {
  return withLock(read);
}

export function addFromAddress(address: string): Promise<Settings> {
  return withLock(async () => {
    const clean = address.trim();
    if (!isValidAddress(clean)) throw new Error("Invalid email address");
    const s = await read();
    if (!s.fromAddresses.some((a) => bareAddress(a) === bareAddress(clean))) {
      s.fromAddresses.push(clean);
    }
    if (!s.defaultFrom) s.defaultFrom = s.fromAddresses[0] ?? null;
    await write(s);
    return s;
  });
}

export function removeFromAddress(address: string): Promise<Settings> {
  return withLock(async () => {
    const s = await read();
    const key = bareAddress(address);
    s.fromAddresses = s.fromAddresses.filter((a) => bareAddress(a) !== key);
    if (s.defaultFrom && bareAddress(s.defaultFrom) === key) {
      s.defaultFrom = s.fromAddresses[0] ?? null;
    }
    await write(s);
    return s;
  });
}

export function setDefaultFrom(address: string): Promise<Settings> {
  return withLock(async () => {
    const s = await read();
    const match = s.fromAddresses.find((a) => bareAddress(a) === bareAddress(address));
    if (!match) throw new Error("Address is not in the list");
    s.defaultFrom = match;
    await write(s);
    return s;
  });
}

// The address a message should actually be sent from: honour the caller's
// choice if it's allowlisted, else fall back to the default, else the env seed.
export async function resolveFrom(requested?: string | null): Promise<string> {
  const s = await read();
  if (requested) {
    const match = s.fromAddresses.find((a) => bareAddress(a) === bareAddress(requested));
    if (match) return match;
  }
  if (s.defaultFrom) return s.defaultFrom;
  if (s.fromAddresses[0]) return s.fromAddresses[0];
  return parseAddressList(process.env.SEND_FROM)[0] ?? "";
}

// Every bare address that counts as "us", so threading can pick out the other
// party in a conversation regardless of which of our addresses was involved.
export async function getMyAddresses(): Promise<string[]> {
  const s = await read();
  const set = new Set<string>();
  for (const a of [...s.fromAddresses, ...parseAddressList(process.env.SEND_FROM)]) {
    const bare = bareAddress(a);
    if (bare) set.add(bare);
  }
  return [...set];
}
