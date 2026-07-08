/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */



import { Router, type Request, type Response } from 'express';

import { getAllLevels, getDeviceLevel, setDeviceLevel } from '../services/battery_service.js';
import { verifyBatteryAccess } from '../dependencies/battery.js';
import { asString } from '../utils/request.js';

export const batteryRouter = Router();

/**
 * Store the latest battery level for a device.
 * Example: POST /api/battery?device=iphone&level=25
 */
batteryRouter.post('/api/battery', verifyBatteryAccess, async (req: Request, res: Response) => {
  const device = req.query.device;
  const levelRaw = req.query.level;

  if (typeof device !== 'string' || device.length < 1 || device.length > 64) {
    res.status(422).json({ detail: "Query param 'device' must be a string between 1 and 64 characters" });
    return;
  }

  const level = Number(levelRaw);
  if (typeof levelRaw !== 'string' || Number.isNaN(level) || level < 0 || level > 100) {
    res.status(422).json({ detail: "Query param 'level' must be an integer between 0 and 100" });
    return;
  }

  const record = await setDeviceLevel(device, level);
  res.json({ success: true, ...record });
});

/** Get the latest battery level for all known devices. (Public) */
batteryRouter.get('/api/battery', async (_req: Request, res: Response) => {
  const levels = await getAllLevels();
  const result: Record<string, unknown> = {};
  for (const [device, record] of Object.entries(levels)) {
    result[device] = { device, ...record };
  }
  res.json(result);
});

/** Get the latest battery level for a single device. (Public) */
batteryRouter.get('/api/battery/:device', async (req: Request, res: Response) => {
  const { device } = req.params;
  const record = await getDeviceLevel(asString(device));
  if (record === null) {
    res.status(404).json({ detail: `No battery level recorded for device '${device}'` });
    return;
  }
  res.json({ device, ...record });
});