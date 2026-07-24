/*
 * Who owns which address.
 *
 * The mailbox is multi-user. Every user automatically owns their own
 * `username@domain` address. Admins can additionally *reserve* extra addresses
 * (admin@, ctf@, …) for a user from the dashboard. Admins see everything; mail
 * to an unreserved address falls to the catch-all owner so nothing is lost.
 *
 * State lives in a writable file on the data volume (owners.json), seeded once
 * from the copy committed in the repo, so dashboard edits persist across
 * restarts without a redeploy.
 */

import path from "node:path";
import {
  readFileSync,
  existsSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import { bareAddress } from "./settings";

const DATA_DIR   = process.env.DATA_DIR ?? "./data";
const STORE_FILE = path.join(DATA_DIR, "owners.json");
const SEED_FILE  = path.join(import.meta.dir, "..", "owners.json");

interface OwnersConfig {
  domain:   string;
  admins:   string[];
  catchAll: string;
  // Extra addresses reserved per user, *beyond* their automatic username@domain.
  owners:   Record<string, string[]>;
}

// --------------------
// Load / persist
// --------------------

function loadRaw(): OwnersConfig {
  try {
    if (existsSync(STORE_FILE)) {
      return JSON.parse(readFileSync(STORE_FILE, "utf8")) as OwnersConfig;
    }
  } catch (err) {
    console.error("owners.json (data) unreadable, reseeding:", err);
  }
  const seed = JSON.parse(readFileSync(SEED_FILE, "utf8")) as OwnersConfig;
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(STORE_FILE, JSON.stringify(seed, null, 2));
  } catch (err) {
    console.error("Could not seed owners.json into data dir:", err);
  }
  return seed;
}

function normalize(raw: OwnersConfig): OwnersConfig {
  const domain = (raw.domain || "").toLowerCase();
  const owners: Record<string, string[]> = {};
  for (const [user, entries] of Object.entries(raw.owners || {})) {
    owners[user.toLowerCase()] = Array.from(
      new Set((entries || []).map((e) => e.trim().toLowerCase()).filter(Boolean)),
    );
  }
  return {
    domain,
    admins:   (raw.admins || []).map((a) => a.toLowerCase()),
    catchAll: (raw.catchAll || "").toLowerCase(),
    owners,
  };
}

let cfg: OwnersConfig | null = null;

function state(): OwnersConfig {
  if (!cfg) cfg = normalize(loadRaw());
  return cfg;
}

function save(): void {
  writeFileSync(STORE_FILE, JSON.stringify(state(), null, 2));
}

// --------------------
// Address expansion
// --------------------

/** A bare local-part becomes local@domain; a full address is used as-is. */
function expand(entry: string): string {
  const e = entry.trim().toLowerCase();
  if (!e) return "";
  return e.includes("@") ? e : `${e}@${state().domain}`;
}

function autoAddress(username: string): string {
  return `${username.toLowerCase()}@${state().domain}`;
}

function knownUsers(): string[] {
  const s = state();
  return Array.from(new Set([...Object.keys(s.owners), ...s.admins, s.catchAll].filter(Boolean)));
}

/** bare address -> owning username (autos + explicit reservations). */
function ownerIndex(): Map<string, string> {
  const s = state();
  const map = new Map<string, string>();
  // Automatic self-addresses first…
  for (const user of knownUsers()) {
    map.set(bareAddress(autoAddress(user)), user);
  }
  // …then explicit reservations, which win on conflict.
  for (const [user, entries] of Object.entries(s.owners)) {
    for (const entry of entries) map.set(bareAddress(expand(entry)), user);
  }
  return map;
}

// --------------------
// Queries
// --------------------

export function isAdmin(username: string): boolean {
  return state().admins.includes(username.toLowerCase());
}

/** Which user owns a given address; unreserved addresses go to the catch-all. */
export function ownerOf(address: string): string {
  return ownerIndex().get(bareAddress(address)) ?? state().catchAll;
}

/**
 * For an inbound message with several recipients, the owner is whoever owns the
 * first recognised recipient; if none is recognised, the catch-all user.
 */
export function ownerForRecipients(recipients: string[]): string {
  const idx = ownerIndex();
  for (const r of recipients) {
    const owner = idx.get(bareAddress(r));
    if (owner) return owner;
  }
  return state().catchAll;
}

/** The addresses a user may send as: their own set (admins get all). */
export function addressesFor(username: string): string[] {
  const s = state();
  const u = username.toLowerCase();
  if (s.admins.includes(u)) return allAddresses();
  const extras = (s.owners[u] ?? []).map(expand);
  return Array.from(new Set([autoAddress(u), ...extras].filter(Boolean)));
}

/** Every reserved/automatic address across all users. */
export function allAddresses(): string[] {
  return Array.from(new Set(ownerIndex().keys()));
}

export function canSendAs(username: string, address: string): boolean {
  const bare = bareAddress(address);
  return addressesFor(username).some((a) => bareAddress(a) === bare);
}

/** Can this user see this owner's mail? The owner themselves, or any admin. */
export function canAccessOwner(username: string, owner: string): boolean {
  const u = username.toLowerCase();
  return isAdmin(u) || u === (owner || "").toLowerCase();
}

/** Send-from for this user: their choice if they own it, else their first address. */
export function resolveFromFor(username: string, requested?: string | null): string {
  const owned = addressesFor(username);
  if (requested) {
    const bare = bareAddress(requested);
    const match = owned.find((a) => bareAddress(a) === bare);
    if (match) return match;
  }
  return owned[0] ?? "";
}

// --------------------
// Mutations (admin dashboard)
// --------------------

/** Make sure a freshly-seen user exists so they own their username@domain. */
export function ensureUser(username: string): void {
  const s = state();
  const u = username.toLowerCase();
  if (!u) return;
  if (s.admins.includes(u) || u === s.catchAll || u in s.owners) return;
  s.owners[u] = [];
  save();
}

/** Reserve an extra address for a user. Returns the current dashboard state. */
export function assignAddress(username: string, address: string): OwnersState {
  const s = state();
  const u = username.toLowerCase();
  const full = expand(address);
  if (!full || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(full)) {
    throw new Error("Invalid email address");
  }
  if (!(u in s.owners) && !s.admins.includes(u) && u !== s.catchAll) {
    s.owners[u] = [];
  }
  // Drop any prior owner's claim, then assign here (idempotent, no duplicates).
  for (const key of Object.keys(s.owners)) {
    s.owners[key] = (s.owners[key] ?? []).filter((e) => bareAddress(expand(e)) !== bareAddress(full));
  }
  if (bareAddress(full) !== bareAddress(autoAddress(u))) {
    (s.owners[u] ??= []).push(full);
  }
  save();
  return dashboardState();
}

/** Remove an extra reservation (a user's automatic address can't be removed). */
export function unassignAddress(username: string, address: string): OwnersState {
  const s = state();
  const u = username.toLowerCase();
  const bare = bareAddress(expand(address));
  const list = s.owners[u];
  if (list) {
    s.owners[u] = list.filter((e) => bareAddress(expand(e)) !== bare);
  }
  save();
  return dashboardState();
}

export interface OwnersUser {
  username:  string;
  isAdmin:   boolean;
  auto:      string;
  reserved:  string[];
  addresses: string[];
}
export interface OwnersState {
  domain:   string;
  catchAll: string;
  users:    OwnersUser[];
}

/** Everything the dashboard needs to render the ownership table. */
export function dashboardState(): OwnersState {
  const s = state();
  const users = knownUsers().map((u) => ({
    username:  u,
    isAdmin:   s.admins.includes(u),
    auto:      autoAddress(u),
    reserved:  (s.owners[u] ?? []).map(expand),
    addresses: addressesFor(u),
  }));
  return { domain: s.domain, catchAll: s.catchAll, users };
}
