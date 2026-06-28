/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
import { Router, type Request, type Response, type NextFunction } from 'express';

import { requireAuth, requireAdmin } from '../dependencies/auth.js';
import { broadcastFrontendUpdate } from '../core/websocket.js';
import { HttpError } from '../core/errors.js';

export const adminRouter = Router();

/** Force refresh all connected clients (admin only) */
adminRouter.post('/admin/refresh', requireAuth, requireAdmin, async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Broadcast refresh command to all WebSocket clients
    await broadcastFrontendUpdate('force_refresh', { message: 'Admin initiated refresh' });

    res.json({ success: true, message: 'Refresh broadcast sent' });
  } catch (err) {
    next(new HttpError(500, `Failed to broadcast refresh: ${String(err)}`));
  }
});