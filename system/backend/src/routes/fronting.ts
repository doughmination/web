/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { Router, type Request, type Response, type NextFunction } from 'express';

import { getFronters, setFront, getMembers } from '../services/pluralkit.js';
import { enrichMembersWithTags } from '../services/tag_service.js';
import { enrichMembersWithStatus } from '../services/status_service.js';
import { requireAuth } from '../dependencies/auth.js';
import { broadcastFrontingUpdate } from '../core/websocket.js';
import { HttpError } from '../core/errors.js';

export const frontingRouter = Router();

/** Get current fronters with tags and status */
frontingRouter.get('/fronters', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const frontersData = await getFronters();

    // Enrich fronters with tags and status
    if ('members' in frontersData) {
      const membersWithTags = await enrichMembersWithTags(frontersData.members);
      frontersData.members = await enrichMembersWithStatus(membersWithTags);
    }

    res.json(frontersData);
  } catch (err) {
    next(new HttpError(500, `Failed to fetch fronters: ${String(err)}`));
  }
});

/** Switch fronters (multiple members) */
frontingRouter.post('/switch', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  const memberIds = req.body?.members ?? [];

  if (!Array.isArray(memberIds)) {
    next(new HttpError(400, "'members' must be a list of member IDs"));
    return;
  }

  try {
    await setFront(memberIds);

    // Broadcast the fronting update
    const frontersData = await getFronters();
    await broadcastFrontingUpdate(frontersData);

    res.json({ status: 'success', message: 'Front updated successfully' });
  } catch (err) {
    next(new HttpError(500, String(err)));
  }
});

/** Switch to a single fronter */
frontingRouter.post(
  '/switch_front',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    const memberId = req.body?.member_id;

    if (!memberId) {
      next(new HttpError(400, 'member_id is required'));
      return;
    }

    try {
      const result = await setFront([memberId]);

      // Broadcast the update
      const frontersData = await getFronters();
      await broadcastFrontingUpdate(frontersData);

      res.json({ success: true, message: 'Front updated', data: result });
    } catch (err) {
      next(new HttpError(500, `Failed to switch front: ${String(err)}`));
    }
  },
);

/**
 * Switch to multiple fronters at once.
 * Alternative to /switch with more detailed feedback.
 */
frontingRouter.post(
  '/multi_switch',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    const memberIds = req.body?.member_ids ?? [];

    if (!Array.isArray(memberIds)) {
      next(new HttpError(400, "'member_ids' must be a list"));
      return;
    }

    try {
      // Get members to show their names in the response
      const allMembers = await getMembers();
      const switchingMembers: Array<{ id: unknown; name: unknown; display_name: unknown }> = [];

      for (const memberId of memberIds) {
        const member = allMembers.find((m) => m.id === memberId);
        if (member) {
          switchingMembers.push({
            id: member.id,
            name: member.name,
            display_name: member.display_name ?? member.name,
          });
        }
      }

      // Switch the fronters
      await setFront(memberIds);

      // Broadcast the fronting update
      const frontersData = await getFronters();
      await broadcastFrontingUpdate(frontersData);

      // Return detailed information
      res.json({
        status: 'success',
        message: 'Fronters updated successfully',
        fronters: switchingMembers,
        count: switchingMembers.length,
      });
    } catch (err) {
      next(new HttpError(500, String(err)));
    }
  },
);