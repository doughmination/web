/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * Authentication dependencies.
 * Reusable Express middleware for authentication and authorization.
 *
 * FastAPI's `Depends(get_current_user)` returns a value that route
 * handlers receive as a parameter. Express has no equivalent return
 * channel, so these middlewares attach the user to `req.user` instead
 * (see ../types/express.d.ts) and call `next()`.
 *
 * NOTE: depends on `getUserByUsername` from ../services/user_service.ts,
 * which hasn't been ported yet — this file won't compile until that
 * exists.
 */

import type { Request, Response, NextFunction } from 'express';

import { decodeAccessToken } from '../core/security.js';
import { HttpError } from '../core/errors.js';
import { getUserByUsername } from '../services/user_service.js';
import type { User } from '../models/user.js';

/**
 * Extract a Bearer token from the Authorization header.
 * Equivalent to FastAPI's OAuth2PasswordBearer(tokenUrl="/api/login").
 */
function extractBearerToken(req: Request): string | undefined {
  const header = req.header('Authorization');
  if (!header) {
    return undefined;
  }
  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return undefined;
  }
  return parts[1];
}

/**
 * Resolve the current authenticated user from a JWT, without touching
 * the request/response. Shared by requireAuth and optionalAuth below.
 *
 * @throws HttpError(401) if the token is missing, invalid, or the user no longer exists
 */
async function resolveCurrentUser(req: Request): Promise<User> {
  const token = extractBearerToken(req);
  if (!token) {
    throw new HttpError(401, 'Not authenticated', { 'WWW-Authenticate': 'Bearer' });
  }

  // decodeAccessToken throws HttpError(401) itself on invalid/expired tokens
  const payload = decodeAccessToken(token);
  const username = payload.sub;

  if (!username || typeof username !== 'string') {
    throw new HttpError(401, 'Invalid token', { 'WWW-Authenticate': 'Bearer' });
  }

  const user = await getUserByUsername(username);
  if (!user) {
    throw new HttpError(401, 'User not found', { 'WWW-Authenticate': 'Bearer' });
  }

  return user;
}

/**
 * Require an authenticated user for the route.
 * On success, attaches the user to `req.user` and calls next().
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    req.user = await resolveCurrentUser(req);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Attach the current user to `req.user` if authenticated, otherwise
 * leave it undefined. Never rejects the request — useful for routes
 * that behave differently with/without auth but don't require it.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    req.user = await resolveCurrentUser(req);
  } catch {
    req.user = undefined;
  }
  next();
}

/**
 * Require the current user to be an admin.
 * Must run after requireAuth in the middleware chain.
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user?.is_admin) {
    next(new HttpError(403, 'Admin privileges required'));
    return;
  }
  next();
}

/**
 * Require the current user to be the owner.
 * Must run after requireAuth in the middleware chain.
 */
export function requireOwner(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user?.is_owner) {
    next(new HttpError(403, 'Owner privileges required'));
    return;
  }
  next();
}

/**
 * Require the current user to be a pet account.
 * Must run after requireAuth in the middleware chain.
 */
export function requirePet(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user?.is_pet) {
    next(new HttpError(403, 'Pet privileges required'));
    return;
  }
  next();
}