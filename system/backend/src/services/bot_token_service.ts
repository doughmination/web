/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * Bot token service.
 * Manages secure access tokens for Discord bot integration.
 */

import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { randomBytes, timingSafeEqual } from 'node:crypto';

import { BOT_TOKEN_FILE } from '../core/config.js';

interface StoredBotToken {
  token: string;
  created_at: string;
  version: string;
}

/** Generate a secure random token for bot access */
export function generateBotToken(): string {
  return randomBytes(32).toString('base64url');
}

/** Get the current bot access token */
export async function getBotToken(): Promise<string | null> {
  if (!existsSync(BOT_TOKEN_FILE)) {
    return null;
  }

  try {
    const raw = await readFile(BOT_TOKEN_FILE, 'utf-8');
    const data = JSON.parse(raw) as Partial<StoredBotToken>;
    return data.token ?? null;
  } catch (err) {
    console.error(`Error reading bot token: ${String(err)}`);
    return null;
  }
}

/** Save the bot access token to file */
export async function saveBotToken(token: string): Promise<void> {
  const data: StoredBotToken = {
    token,
    created_at: new Date().toISOString(),
    version: '1.0.0',
  };

  await writeFile(BOT_TOKEN_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/** Initialize bot token on startup, creating a new one if it doesn't exist */
export async function initializeBotToken(): Promise<string> {
  const existingToken = await getBotToken();

  if (existingToken) {
    console.info('✓ Bot access token loaded from file');
    console.info(`  Token: ${existingToken}`);
    return existingToken;
  }

  // Generate new token
  const newToken = generateBotToken();
  await saveBotToken(newToken);

  console.info('='.repeat(60));
  console.info('NEW BOT ACCESS TOKEN GENERATED');
  console.info('='.repeat(60));
  console.info(`Token: ${newToken}`);
  console.info('');
  console.info("IMPORTANT: Save this token to your Discord bot's .env file as:");
  console.info(`DOUGH_API_TOKEN=${newToken}`);
  console.info('='.repeat(60));

  return newToken;
}

/** Regenerate the bot access token (effectively terminating the old one) */
export async function regenerateBotToken(): Promise<string> {
  const newToken = generateBotToken();
  await saveBotToken(newToken);

  console.info('='.repeat(60));
  console.info('BOT ACCESS TOKEN REGENERATED');
  console.info('='.repeat(60));
  console.info(`New Token: ${newToken}`);
  console.info('');
  console.info("IMPORTANT: Update your Discord bot's .env file with the new token:");
  console.info(`DOUGH_API_TOKEN=${newToken}`);
  console.info('='.repeat(60));

  return newToken;
}

/** Verify if the provided token matches the current bot token (constant-time) */
export async function verifyBotToken(providedToken: string): Promise<boolean> {
  const currentToken = await getBotToken();

  if (!currentToken) {
    return false;
  }

  const bufA = Buffer.from(currentToken, 'utf-8');
  const bufB = Buffer.from(providedToken, 'utf-8');

  if (bufA.length !== bufB.length) {
    return false;
  }

  return timingSafeEqual(bufA, bufB);
}