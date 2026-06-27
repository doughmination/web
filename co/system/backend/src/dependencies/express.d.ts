/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * Express doesn't have FastAPI's dependency-injection return values, so
 * the authenticated user (when present) is attached directly to the
 * request object instead. This augments the Express types so
 * `req.user` is recognised everywhere without casting.
 */

import type { User } from '../models/user.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};