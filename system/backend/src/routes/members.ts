/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';

import { getMembers } from '../services/pluralkit.js';
import {
  getMemberTags,
  updateMemberTags,
  addMemberTag,
  removeMemberTag,
  enrichMembersWithTags,
} from '../services/tag_service.js';
import { enrichMembersWithStatus } from '../services/status_service.js';
import { requireAuth, requireAdmin } from '../dependencies/auth.js';
import { setInCache } from '../utils/cache.js';
import { HttpError } from '../core/errors.js';

export const membersRouter = Router();

/** Get all members with tags and status information */
membersRouter.get('/members', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Get members from PluralKit
    const membersData = await getMembers();

    // Enrich with tags
    const membersWithTags = await enrichMembersWithTags(membersData);

    // Enrich with status information
    const membersWithStatus = await enrichMembersWithStatus(membersWithTags);

    res.json(membersWithStatus);
  } catch (err) {
    next(new HttpError(500, `Failed to fetch members: ${String(err)}`));
  }
});

/** Get details for a specific member */
membersRouter.get('/member/:member_id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const memberId = req.params.member_id;
    const members = await getMembers();

    // Find member by ID or name
    const member = members.find(
      (m) => m.id === memberId || String(m.name ?? '').toLowerCase() === memberId.toLowerCase(),
    );

    if (!member) {
      next(new HttpError(404, 'Member not found'));
      return;
    }

    // Enrich with tags and status
    const [memberWithTags] = await enrichMembersWithTags([member]);
    const [memberWithStatus] = await enrichMembersWithStatus([memberWithTags]);

    res.json(memberWithStatus);
  } catch (err) {
    if (err instanceof HttpError) {
      next(err);
      return;
    }
    next(new HttpError(500, `Failed to fetch member details: ${String(err)}`));
  }
});

// ============================================================================
// MEMBER TAGS ENDPOINTS
// ============================================================================

/** Get all member tag assignments (admin only) */
membersRouter.get(
  '/member-tags',
  requireAuth,
  requireAdmin,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const memberTags = await getMemberTags();
      res.json({ status: 'success', member_tags: memberTags });
    } catch (err) {
      next(new HttpError(500, `Failed to fetch member tags: ${String(err)}`));
    }
  },
);

/** Update the complete tag list for a member (admin only) */
membersRouter.post(
  '/member-tags/:member_identifier',
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = z.array(z.string()).safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ detail: parsed.error.issues });
      return;
    }
    const tags = parsed.data;
    const memberIdentifier = req.params.member_identifier;

    try {
      const success = await updateMemberTags(memberIdentifier, tags);

      if (success) {
        // Clear member cache to reflect changes
        setInCache('members_raw', null, 0);

        res.json({ status: 'success', message: `Updated tags for ${memberIdentifier}`, tags });
      } else {
        next(new HttpError(500, 'Failed to update member tags'));
      }
    } catch (err) {
      next(new HttpError(500, `Failed to update member tags: ${String(err)}`));
    }
  },
);

/** Add a single tag to a member (admin only) */
membersRouter.post(
  '/member-tags/:member_identifier/add',
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    const tag = req.body?.tag;
    const memberIdentifier = req.params.member_identifier;

    if (typeof tag !== 'string') {
      res.status(422).json({ detail: "Body must include a 'tag' string field" });
      return;
    }

    try {
      const success = await addMemberTag(memberIdentifier, tag);

      if (success) {
        // Clear member cache
        setInCache('members_raw', null, 0);

        res.json({ status: 'success', message: `Added tag '${tag}' to ${memberIdentifier}` });
      } else {
        res.json({ status: 'info', message: `Tag '${tag}' already exists for ${memberIdentifier}` });
      }
    } catch (err) {
      next(new HttpError(500, `Failed to add member tag: ${String(err)}`));
    }
  },
);

/** Remove a single tag from a member (admin only) */
membersRouter.delete(
  '/member-tags/:member_identifier/:tag',
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    const { member_identifier: memberIdentifier, tag } = req.params;

    try {
      const success = await removeMemberTag(memberIdentifier, tag);

      if (success) {
        // Clear member cache
        setInCache('members_raw', null, 0);

        res.json({ status: 'success', message: `Removed tag '${tag}' from ${memberIdentifier}` });
      } else {
        next(new HttpError(404, `Tag '${tag}' not found for ${memberIdentifier}`));
      }
    } catch (err) {
      if (err instanceof HttpError) {
        next(err);
        return;
      }
      next(new HttpError(500, `Failed to remove member tag: ${String(err)}`));
    }
  },
);