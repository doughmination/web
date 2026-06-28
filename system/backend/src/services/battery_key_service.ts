/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * Battery API key service.
 * Manages the static access key used by devices to report battery levels.
 *
 * Behaviour mirrors bot_token_service: a key is generated on first boot,
 * persisted to a JSON file, and verified with a constant-time comparison.
 *
 * An optional BATTERY_API_KEYS environment variable (comma-separated) takes
 * precedence if set, so multiple keys / externally-managed keys are possible
 * without code changes.
 */

import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { randomBytes, timingSafeEqual } from 'node:crypto';

import { BATTERY_KEY_FILE } from '../core/config.js';

interface StoredBatteryKey {
  key: string;
  created_at: string;
  version: string;
}

/** Return keys from the BATTERY_API_KEYS env var, if any. */
function envKeys(): string[] {
  const raw = process.env.BATTERY_API_KEYS ?? '';
  return raw
    .split(',')
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
}

/** Generate a secure random key for battery access */
export function generateBatteryKey(): string {
  return randomBytes(32).toString('base64url');
}

/** Get the current battery access key from file */
export async function getStoredKey(): Promise<string | null> {
  if (!existsSync(BATTERY_KEY_FILE)) {
    return null;
  }

  try {
    const raw = await readFile(BATTERY_KEY_FILE, 'utf-8');
    const data = JSON.parse(raw) as Partial<StoredBatteryKey>;
    return data.key ?? null;
  } catch (err) {
    console.error(`Error reading battery key: ${String(err)}`);
    return null;
  }
}

/** Save the battery access key to file */
export async function saveBatteryKey(key: string): Promise<void> {
  const data: StoredBatteryKey = {
    key,
    created_at: new Date().toISOString(),
    version: '1.0.0',
  };

  await writeFile(BATTERY_KEY_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Return all keys currently accepted.
 * Env-provided keys take precedence; otherwise the generated/stored key.
 */
export async function getValidKeys(): Promise<string[]> {
  const env = envKeys();
  if (env.length > 0) {
    return env;
  }

  const stored = await getStoredKey();
  return stored ? [stored] : [];
}

/** Initialize battery key on startup, creating one if it doesn't exist */
export async function initializeBatteryKey(): Promise<string | null> {
  const env = envKeys();
  if (env.length > 0) {
    console.info(`✓ Battery API key(s) loaded from BATTERY_API_KEYS env (${env.length} key(s))`);
    return env[0];
  }

  const existing = await getStoredKey();
  if (existing) {
    console.info('✓ Battery access key loaded from file');
    console.info(`  Key: ${existing}`);
    return existing;
  }

  const newKey = generateBatteryKey();
  await saveBatteryKey(newKey);

  console.info('='.repeat(60));
  console.info('NEW BATTERY ACCESS KEY GENERATED');
  console.info('='.repeat(60));
  console.info(`Key: ${newKey}`);
  console.info('');
  console.info("Send this as the 'X-Battery-Key' header from your devices.");
  console.info('='.repeat(60));

  return newKey;
}

/** Regenerate the stored battery access key (invalidates the old one) */
export async function regenerateBatteryKey(): Promise<string> {
  const newKey = generateBatteryKey();
  await saveBatteryKey(newKey);

  console.info('='.repeat(60));
  console.info('BATTERY ACCESS KEY REGENERATED');
  console.info('='.repeat(60));
  console.info(`New Key: ${newKey}`);
  console.info('='.repeat(60));

  return newKey;
}

/** Constant-time string comparison, tolerant of differing lengths. */
function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/** Verify the provided key against any valid key (constant-time) */
export async function verifyBatteryKey(providedKey: string): Promise<boolean> {
  if (!providedKey) {
    return false;
  }

  const validKeys = await getValidKeys();
  let valid = false;
  for (const key of validKeys) {
    if (constantTimeEqual(key, providedKey)) {
      valid = true;
    }
  }
  return valid;
}