/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * Metrics/analytics API endpoints.
 * Provides fronting time and switch frequency statistics.
 *
 * Note: FastAPI's `days: int = 30` query param is parsed/validated
 * automatically. Express query params arrive as strings, so we parse
 * and fall back to the default manually below.
 */

import { Router, type Request, type Response, type NextFunction } from 'express';

import { getFrontingTimeMetrics, getSwitchFrequencyMetrics } from '../services/metrics_service.js';
import { requireAuth } from '../dependencies/auth.js';
import { HttpError } from '../core/errors.js';

export const metricsRouter = Router();

function parseDays(req: Request): number {
  const raw = req.query.days;
  const parsed = Number(raw);
  return raw !== undefined && !Number.isNaN(parsed) ? parsed : 30;
}

/** Get fronting time metrics for each member over different timeframes */
metricsRouter.get(
  '/metrics/fronting-time',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const metrics = await getFrontingTimeMetrics(parseDays(req));
      res.json(metrics);
    } catch (err) {
      next(new HttpError(500, `Failed to fetch fronting metrics: ${String(err)}`));
    }
  },
);

/** Get switch frequency metrics over different timeframes */
metricsRouter.get(
  '/metrics/switch-frequency',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const metrics = await getSwitchFrequencyMetrics(parseDays(req));
      res.json(metrics);
    } catch (err) {
      next(new HttpError(500, `Failed to fetch switch frequency metrics: ${String(err)}`));
    }
  },
);