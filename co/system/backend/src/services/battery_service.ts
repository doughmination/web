/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * Battery level service.
 * Stores the latest known battery level for each device.
 *
 * Storage is a single JSON file keyed by device name, each value:
 *     { level: <int 0-100>, updated_at: <ISO 8601 UTC> }
 *
 * Only the latest value per device is kept (no history). Adding history
 * would be a small change: make each value an array and append instead
 * of overwrite.
 */

import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';

import { BATTERY_LEVELS_FILE } from '../core/config.js';

interface BatteryRecord {
  level: number;
  updated_at: string;
}

type LevelsMap = Record<string, BatteryRecord>;

/** Get the latest battery level for all devices */
export async function getAllLevels(): Promise<LevelsMap> {
  if (!existsSync(BATTERY_LEVELS_FILE)) {
    return {};
  }

  const raw = await readFile(BATTERY_LEVELS_FILE, 'utf-8');
  return JSON.parse(raw) as LevelsMap;
}

/** Save all battery levels to file */
export async function saveAllLevels(levels: LevelsMap): Promise<void> {
  await writeFile(BATTERY_LEVELS_FILE, JSON.stringify(levels, null, 2), 'utf-8');
}

/** Get the latest battery level for a single device, or null */
export async function getDeviceLevel(device: string ): Promise<BatteryRecord | null> {
  const levels = await getAllLevels();
  return levels[device] ?? null;
}

/**
 * Store the latest battery level for a device.
 *
 * @param device - Arbitrary device name (e.g. "iphone", "macbook")
 * @param level - Battery percentage, 0-100
 * @returns The stored record, including the device name
 */
export async function setDeviceLevel(
  device: string,
  level: number,
): Promise<{ device: string } & BatteryRecord> {
  const levels = await getAllLevels();

  const record: BatteryRecord = {
    level,
    updated_at: new Date().toISOString(),
  };

  levels[device] = record;
  await saveAllLevels(levels);

  return { device, ...record };
}

/** Initialize the battery levels storage file if it doesn't exist */
export async function initializeBatteryStorage(): Promise<void> {
  if (!existsSync(BATTERY_LEVELS_FILE)) {
    await saveAllLevels({});
    console.info('Initialized battery levels storage');
  }
}