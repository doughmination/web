/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * System information API endpoints.
 * Handles system info and mental state.
 *
 * Note: FastAPI validates the `state: MentalState` request body
 * automatically before the handler runs, returning 422 on failure.
 * Express has no equivalent, so the POST handler below validates with
 * MentalStateSchema.safeParse() up front and returns 422 itself to match.
 */

import { Router, type Request, type Response, type NextFunction } from 'express';

import { MentalStateSchema } from '../models/index.js';
import { getSystem } from '../services/pluralkit.js';
import { getMentalState, saveMentalState } from '../services/mental_state_service.js';
import { requireAuth, requireAdmin } from '../dependencies/auth.js';
import { broadcastMentalStateUpdate } from '../core/websocket.js';
import { HttpError } from '../core/errors.js';

export const systemRouter = Router();

/** Get PluralKit system information with mental state */
systemRouter.get('/system', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Get system data from PluralKit
    const systemData = await getSystem();

    // Get mental state
    const mentalState = await getMentalState();

    // Add mental state to system data
    systemData.mental_state = mentalState;

    res.json(systemData);
  } catch (err) {
    next(new HttpError(500, `Failed to fetch system info: ${String(err)}`));
  }
});

/** Get current mental state */
systemRouter.get('/mental-state', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const state = await getMentalState();
    res.json(state);
  } catch (err) {
    next(new HttpError(500, `Failed to fetch mental state: ${String(err)}`));
  }
});

/** Update mental state (admin only) */
systemRouter.post(
  '/mental-state',
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = MentalStateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ detail: parsed.error.issues });
      return;
    }
    const state = parsed.data;

    try {
      const success = await saveMentalState(state);

      if (!success) {
        next(new HttpError(500, 'Failed to save mental state'));
        return;
      }

      // Broadcast the mental state update
      const stateData = { ...state, updated_at: state.updated_at.toISOString() };
      await broadcastMentalStateUpdate(stateData);

      res.json({ success: true, message: 'Mental state updated' });
    } catch (err) {
      next(new HttpError(500, `Failed to update mental state: ${String(err)}`));
    }
  },
);