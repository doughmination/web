/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * Mental state service.
 * Manages system mental state tracking.
 */

import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';

import { MENTAL_STATE_FILE } from '../core/config.js';
import type { MentalState } from '../models/index.js';
import { parseTimestamp } from '../utils/datetime.js';

function defaultState(): MentalState {
  return {
    level: 'safe',
    updated_at: new Date(),
    notes: null,
  };
}

/** Get current mental state from storage */
export async function getMentalState(): Promise<MentalState> {
  try {
    if (existsSync(MENTAL_STATE_FILE)) {
      const raw = await readFile(MENTAL_STATE_FILE, 'utf-8');
      const stateData = JSON.parse(raw) as { level: string; updated_at: string; notes?: string | null };

      return {
        level: stateData.level,
        updated_at: parseTimestamp(stateData.updated_at),
        notes: stateData.notes ?? null,
      };
    }

    // Return default state
    return defaultState();
  } catch (err) {
    console.error(`Error loading mental state: ${String(err)}`);
    return defaultState();
  }
}

/** Save mental state to storage */
export async function saveMentalState(state: MentalState): Promise<boolean> {
  try {
    const stateData = {
      level: state.level,
      updated_at: state.updated_at.toISOString(),
      notes: state.notes ?? null,
    };

    await writeFile(MENTAL_STATE_FILE, JSON.stringify(stateData, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error saving mental state: ${String(err)}`);
    return false;
  }
}

/**
 * Update mental state with a new level and notes.
 *
 * @param level - Mental state level (safe, unstable, idealizing, self-harming, highly at risk)
 * @param notes - Optional notes about the state
 */
export async function updateMentalState(level: string, notes?: string | null): Promise<MentalState> {
  const state: MentalState = {
    level,
    updated_at: new Date(),
    notes: notes ?? null,
  };

  await saveMentalState(state);
  return state;
}