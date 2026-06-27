/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * Configuration management for the application.
 * Centralizes all environment variables and settings.
 */

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

// Directories
// __dirname equivalent for ESM: this file lives at src/core/config.ts,
// so going up two levels gets us to the project root (matches the Python
// BASE_DIR = Path(__file__).resolve().parent.parent.parent from app/core/config.py)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const BASE_DIR = join(__dirname, '..', '..');
export const DATA_DIR = join(BASE_DIR, 'dough-data');
export const STATIC_DIR = join(BASE_DIR, 'static');

// Ensure directories exist
mkdirSync(DATA_DIR, { recursive: true });
mkdirSync(STATIC_DIR, { recursive: true });

// Data files
export const USERS_FILE = join(DATA_DIR, 'users.json');
export const MENTAL_STATE_FILE = join(DATA_DIR, 'mental_state.json');
export const MEMBER_TAGS_FILE = join(DATA_DIR, 'member_tags.json');
export const MEMBER_STATUS_FILE = join(DATA_DIR, 'member_status.json');
export const BOT_TOKEN_FILE = join(DATA_DIR, 'bot_access_token.json');
export const BATTERY_KEY_FILE = join(DATA_DIR, 'battery_access_key.json');
export const BATTERY_LEVELS_FILE = join(DATA_DIR, 'battery_levels.json');

// PluralKit API
export const PLURALKIT_BASE_URL = 'https://api.pluralkit.me/v2';
export const SYSTEM_TOKEN = process.env.SYSTEM_TOKEN;
export const CACHE_TTL = Number(process.env.CACHE_TTL ?? 30);

// JWT Authentication
export const JWT_SECRET = process.env.JWT_SECRET ?? 'your-secret-key-for-jwt';
export const JWT_ALGORITHM = 'HS256' as const;
export const ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24; // 24 hours

// Cloudflare Turnstile
export const TURNSTILE_SECRET = process.env.DOUGH_TURNSILE_SECRET;

// Admin user (for initial setup)
export const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? 'admin';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
export const ADMIN_DISPLAY_NAME = process.env.ADMIN_DISPLAY_NAME ?? 'Administrator';

// File upload
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
export const ALLOWED_AVATAR_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'] as const;

// Default avatar
export const DEFAULT_AVATAR =
  'https://raw.githubusercontent.com/doughmination/Doughmination/main/icon.png';

// Base URL
export const BASE_URL = (process.env.BASE_URL ?? 'https://doughmination.co.uk').replace(/\/+$/, '');

/** Get CORS allowed origins */
export function getCorsOrigins(): string[] {
  return [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'https://www.doughmination.co.uk',
    'http://www.doughmination.co.uk',
    'http://frontend',
    'http://frontend:80',
    'http://doughmination.co.uk',
    'https://doughmination.co.uk',
  ];
}

/** Get headers for PluralKit API requests */
export function getPluralkitHeaders(): Record<string, string | undefined> {
  return { Authorization: SYSTEM_TOKEN };
}