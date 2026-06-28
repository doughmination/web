/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * File size limit middleware.
 * Prevents uploads larger than the configured maximum.
 *
 * Starlette's BaseHTTPMiddleware wraps the whole app; in Express this
 * becomes a regular middleware function mounted with app.use(). Same
 * Content-Length pre-check, same fallback-through-on-bad-header behavior.
 */

import type { Request, Response, NextFunction } from 'express';

import { MAX_AVATAR_SIZE } from '../core/config.js';

/**
 * Limit file upload sizes for avatar endpoints.
 * Checks the Content-Length header before the body is processed.
 */
export function fileSizeLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Only check POST requests to avatar endpoints
  if (req.method === 'POST' && req.path.includes('/avatar')) {
    const contentLength = req.header('content-length');

    if (contentLength) {
      const parsed = Number(contentLength);
      // If we can't parse content-length, let it through -
      // the actual upload handler will catch oversized files
      if (!Number.isNaN(parsed) && parsed > MAX_AVATAR_SIZE) {
        res.status(413).json({
          detail: `File size exceeds the limit of ${Math.floor(MAX_AVATAR_SIZE / (1024 * 1024))}MB`,
        });
        return;
      }
    }
  }

  next();
}