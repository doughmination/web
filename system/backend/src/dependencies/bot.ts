/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * Bot authentication dependency. For Discord bot API access.
 *
 * NOTE: depends on `verifyBotToken` from ../services/bot_token_service.ts,
 * which hasn't been ported yet — this file won't compile until that exists.
 */

import type { Request, Response, NextFunction } from 'express';

import { HttpError } from '../core/errors.js';
import { verifyBotToken } from '../services/bot_token_service.js';

/**
 * Verify bot access via the Authorization header and User-Agent.
 *
 * Expected format:
 * - Authorization: Bearer <token>
 * - User-Agent: CloveShortcuts/<version>
 *
 * On success, calls next(). On failure, forwards an HttpError.
 */
export async function verifyBotAccess(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const userAgent = req.header('User-Agent');
  const authorization = req.header('Authorization');

  // Validate User-Agent
  if (!userAgent || !userAgent.startsWith('CloveShortcuts/')) {
    next(new HttpError(403, "Invalid User-Agent. Expected 'CloveShortcuts/<version>'"));
    return;
  }

  // Validate Authorization header
  if (!authorization) {
    next(new HttpError(401, 'Missing Authorization header', { 'WWW-Authenticate': 'Bearer' }));
    return;
  }

  // Extract token from "Bearer <token>" format
  const parts = authorization.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    next(
      new HttpError(401, "Invalid Authorization header format. Expected 'Bearer <token>'", {
        'WWW-Authenticate': 'Bearer',
      }),
    );
    return;
  }

  const token = parts[1];

  // Verify token
  if (!(await verifyBotToken(token))) {
    next(new HttpError(401, 'Invalid bot access token', { 'WWW-Authenticate': 'Bearer' }));
    return;
  }

  next();
}