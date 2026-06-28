/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * Battery API authentication dependency.
 * Simple header-based static key check, designed to be trivially callable
 * from Apple Shortcuts ("Get Contents of URL") and curl.
 *
 * NOTE: depends on `verifyBatteryKey` from ../services/battery_key_service.ts,
 * which hasn't been ported yet — this file won't compile until that exists.
 */

import type { Request, Response, NextFunction } from 'express';

import { HttpError } from '../core/errors.js';
import { verifyBatteryKey } from '../services/battery_key_service.js';

/**
 * Verify battery API access via the X-Battery-Key header.
 * On success, calls next(). On failure, forwards a 401 HttpError.
 */
export async function verifyBatteryAccess(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const xBatteryKey = req.header('X-Battery-Key');

  if (!xBatteryKey) {
    next(new HttpError(401, 'Missing X-Battery-Key header'));
    return;
  }

  if (!(await verifyBatteryKey(xBatteryKey))) {
    next(new HttpError(401, 'Invalid battery API key'));
    return;
  }

  next();
}