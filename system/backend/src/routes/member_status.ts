/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * Member status API endpoints.
 * Handles custom status messages for members.
 *
 * Relative paths — mounted under "/api" in main.ts, matching
 * app.include_router(member_status.router, prefix="/api") in the Python app.
 */

import { Router, type Request, type Response, type NextFunction } from 'express';

import { getMemberStatus, setMemberStatus, clearMemberStatus } from '../services/status_service.js';
import { requireAuth, requireAdmin } from '../dependencies/auth.js';
import { HttpError } from '../core/errors.js';

export const memberStatusRouter = Router();

/** Get status for a specific member (public endpoint) */
memberStatusRouter.get(
  '/members/:member_identifier/status',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const memberIdentifier = req.params.member_identifier;
      const status = await getMemberStatus(memberIdentifier);

      res.json({ success: true, member_identifier: memberIdentifier, status });
    } catch (err) {
      next(new HttpError(500, `Failed to fetch member status: ${String(err)}`));
    }
  },
);

/** Set or update status for a member (admin only) */
memberStatusRouter.post(
  '/members/:member_identifier/status',
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    const memberIdentifier = req.params.member_identifier;
    const statusData = req.body ?? {};
    const statusText = statusData.text;
    const emoji = statusData.emoji;

    if (!statusText) {
      next(new HttpError(400, 'Status text is required'));
      return;
    }

    // Validate status text length
    if (String(statusText).length > 100) {
      next(new HttpError(400, 'Status text must be 100 characters or less'));
      return;
    }

    try {
      const status = await setMemberStatus(memberIdentifier, statusText, emoji);

      res.json({
        success: true,
        message: `Status updated for ${memberIdentifier}`,
        status,
      });
    } catch (err) {
      next(new HttpError(500, `Failed to set member status: ${String(err)}`));
    }
  },
);

/** Clear status for a member (admin only) */
memberStatusRouter.delete(
  '/members/:member_identifier/status',
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const memberIdentifier = req.params.member_identifier;
      const success = await clearMemberStatus(memberIdentifier);

      if (success) {
        res.json({ success: true, message: `Status cleared for ${memberIdentifier}` });
      } else {
        res.json({ success: false, message: `No status found for ${memberIdentifier}` });
      }
    } catch (err) {
      next(new HttpError(500, `Failed to clear member status: ${String(err)}`));
    }
  },
);