/* status/src/lib/store.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/*
 * File-backed service list. One JSON file under DATA_DIR. Deliberately small:
 * for a single-instance status page this is plenty. Swap for Postgres later
 * (mailbox already runs one) by reimplementing these four functions.
 */

import { randomUUID } from "node:crypto";
import {
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import type { Service } from "./services";

const dataDir = process.env.STATUS_DATA_DIR || "./data";
const storeFile = path.join(dataDir, "services.json");

// Seed shown on first run, before anything is added via /admin. Container
// names match compose.yml `container_name:` values (mailbox runs as "inbox").
const seed: Service[] = [
  {
    id: "personal",
    name: "Personal",
    url: "https://doughmination.gay",
    container: "personal",
  },
  {
    id: "blog",
    name: "Blog",
    url: "https://doughmination.site",
    container: "blog",
  },
  {
    id: "info",
    name: "Info",
    url: "https://doughmination.info",
    container: "info",
  },
  {
    id: "system",
    name: "System",
    url: "https://doughmination.co.uk",
    container: "system",
  },
  {
    id: "mailbox",
    name: "Mailbox",
    url: "https://doughmination.tech",
    container: "inbox",
  },
];

async function load(): Promise<Service[]> {
  try {
    const raw = await readFile(storeFile, "utf8");
    return JSON.parse(raw) as Service[];
  } catch {
    // No file yet: write the seed and return it.
    await save(seed);
    return seed;
  }
}

async function save(services: Service[]): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await writeFile(storeFile, JSON.stringify(services, null, 2), "utf8");
}

export async function listServices(): Promise<Service[]> {
  return load();
}

export async function addService(
  input: {
    name: string;
    url?: string;
    container?: string;
    expectBelow?: number;
  },
): Promise<Service> {
  const services = await load();
  const service: Service = {
    id: randomUUID(),
    name: input.name.trim(),
    url: input.url?.trim() || undefined,
    container: input.container?.trim() || undefined,
    expectBelow: input.expectBelow,
  };
  services.push(service);
  await save(services);
  return service;
}

export async function removeService(id: string): Promise<void> {
  const services = await load();
  await save(services.filter((service) => service.id !== id));
}
