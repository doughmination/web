/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * Discord Bot API endpoints.
 * Secure API for bot integration.
 *
 * Like battery.py, this router's prefix ("/api/bot") was baked into the
 * Python APIRouter itself rather than added at include_router() time, so
 * paths here are absolute and this router should be mounted directly with
 * app.use(botRouter).
 */

import { Router, type Request, type Response, type NextFunction } from 'express';

import { regenerateBotToken } from '../services/bot_token_service.js';
import { getSystem, getMembers, getFronters, setFront } from '../services/pluralkit.js';
import { enrichMembersWithTags } from '../services/tag_service.js';
import { enrichMembersWithStatus } from '../services/status_service.js';
import { requireAuth, requireOwner } from '../dependencies/auth.js';
import { verifyBotAccess } from '../dependencies/bot.js';
import { HttpError } from '../core/errors.js';
import { MultiSwitchRequestSchema } from '../models/index.js';

export const botRouter = Router();

// ============================================================================
// HEALTH & TOKEN MANAGEMENT
// ============================================================================

/** Health check endpoint for the bot */
botRouter.get('/api/bot/health', verifyBotAccess, async (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Bot API is operational', authenticated: true });
});

/** Regenerate bot access token (owner only) */
botRouter.post(
  '/api/bot/token/regenerate',
  requireAuth,
  requireOwner,
  async (_req: Request, res: Response) => {
    const newToken = await regenerateBotToken();

    res.json({
      success: true,
      message: "Bot access token has been regenerated. Update your bot's .env file.",
      new_token: newToken,
    });
  },
);

/** Regenerate bot access token using the current bot token */
botRouter.post(
  '/api/bot/token/regenerate-self',
  verifyBotAccess,
  async (_req: Request, res: Response) => {
    const newToken = await regenerateBotToken();

    res.json({
      success: true,
      message: 'Bot access token has been regenerated. The old token is now invalid.',
      new_token: newToken,
    });
  },
);

// ============================================================================
// SYSTEM INFO ENDPOINTS
// ============================================================================

/** Get system information */
botRouter.get(
  '/api/bot/system/info',
  verifyBotAccess,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const systemData = await getSystem();
      res.json({ success: true, data: systemData });
    } catch (err) {
      next(new HttpError(500, `Failed to fetch system info: ${String(err)}`));
    }
  },
);

/** Get all members with tags and status */
botRouter.get(
  '/api/bot/members',
  verifyBotAccess,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const membersData = await getMembers();
      const membersWithTags = await enrichMembersWithTags(membersData);
      const membersWithStatus = await enrichMembersWithStatus(membersWithTags);

      res.json({ success: true, data: membersWithStatus });
    } catch (err) {
      next(new HttpError(500, `Failed to fetch members: ${String(err)}`));
    }
  },
);

/** Get current fronters */
botRouter.get(
  '/api/bot/fronters',
  verifyBotAccess,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const frontersData = await getFronters();
      res.json({ success: true, data: frontersData });
    } catch (err) {
      next(new HttpError(500, `Failed to fetch fronters: ${String(err)}`));
    }
  },
);

// ============================================================================
// FRONTING CONTROL ENDPOINTS
// ============================================================================

/** Switch the system fronts */
botRouter.post(
  '/api/bot/switch',
  verifyBotAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = MultiSwitchRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ detail: parsed.error.issues });
      return;
    }
    const { member_ids } = parsed.data;

    try {
      // Validate member IDs
      const allMembers = await getMembers();
      const validMemberIds = new Set(allMembers.map((m) => m.id));

      const invalidIds = member_ids.filter((mid) => !validMemberIds.has(mid));
      if (invalidIds.length > 0) {
        next(new HttpError(400, `Invalid member IDs: ${invalidIds.join(', ')}`));
        return;
      }

      // Set the front
      await setFront(member_ids);

      // Get updated fronters
      const updatedFronters = await getFronters();

      res.json({
        status: 'success',
        message: 'Fronters updated successfully',
        fronters: updatedFronters.members ?? [],
        count: member_ids.length,
      });
    } catch (err) {
      if (err instanceof HttpError) {
        next(err);
        return;
      }
      next(new HttpError(500, `Failed to switch fronters: ${String(err)}`));
    }
  },
);