/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * Security utilities for authentication and authorization.
 * Handles JWT tokens, password hashing, and Turnstile verification.
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';

import { JWT_SECRET, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, TURNSTILE_SECRET } from './config.js';
import { HttpError } from './errors.js';

const BCRYPT_ROUNDS = 10;

// ============================================================================
// PASSWORD HASHING
// ============================================================================

/**
 * Hash a password using bcrypt.
 *
 * bcrypt only considers the first 72 bytes of input. We truncate to 72
 * bytes to keep behaviour stable and avoid errors on long passwords,
 * mirroring the Python implementation.
 */
export async function hashPassword(password: string): Promise<string> {
  const truncated = Buffer.from(password, 'utf-8').subarray(0, 72).toString('utf-8');
  return bcrypt.hash(truncated, BCRYPT_ROUNDS);
}

/**
 * Verify a password against a hash.
 *
 * Returns false (rather than throwing) if the stored hash is missing or
 * malformed, e.g. a record left behind by a failed startup.
 */
export async function verifyPassword(plainPassword: string, hashedPassword?: string | null): Promise<boolean> {
  if (!hashedPassword) {
    return false;
  }
  try {
    const truncated = Buffer.from(plainPassword, 'utf-8').subarray(0, 72).toString('utf-8');
    return await bcrypt.compare(truncated, hashedPassword);
  } catch {
    return false;
  }
}

// ============================================================================
// JWT TOKEN MANAGEMENT
// ============================================================================

/** Create a JWT access token */
export function createAccessToken(data: Record<string, unknown>): string {
  return jwt.sign(data, JWT_SECRET, {
    algorithm: JWT_ALGORITHM,
    expiresIn: `${ACCESS_TOKEN_EXPIRE_MINUTES}m`,
  });
}

/** Decode and validate a JWT token */
export function decodeAccessToken(token: string): jwt.JwtPayload {
  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALGORITHM] });
    if (typeof payload === 'string') {
      throw new Error('Unexpected string payload');
    }
    return payload;
  } catch {
    throw new HttpError(401, 'Invalid or expired token', { 'WWW-Authenticate': 'Bearer' });
  }
}

// ============================================================================
// TURNSTILE VERIFICATION
// ============================================================================

interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
}

/**
 * Verify a Cloudflare Turnstile token.
 *
 * @param token - Turnstile response token
 * @param remoteIp - Client IP address (optional)
 * @returns true if verification succeeds
 * @throws HttpError if verification fails or a server error occurs
 */
export async function verifyTurnstileToken(token: string, remoteIp?: string): Promise<boolean> {
  if (!TURNSTILE_SECRET) {
    console.error('TURNSILE_SECRET environment variable not set');
    throw new HttpError(500, 'Server configuration error');
  }

  const verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

  const params = new URLSearchParams({
    secret: TURNSTILE_SECRET,
    response: token,
  });

  if (remoteIp) {
    params.set('remoteip', remoteIp);
  }

  try {
    const { data } = await axios.post<TurnstileResponse>(verifyUrl, params);

    if (!data.success) {
      console.warn(`Turnstile verification failed: ${JSON.stringify(data['error-codes'] ?? [])}`);
      return false;
    }

    console.info('Turnstile verification successful');
    return true;
  } catch (err) {
    if (err instanceof HttpError) {
      throw err;
    }
    console.error(`Failed to verify Turnstile token: ${String(err)}`);
    throw new HttpError(500, 'Failed to verify security token');
  }
}