/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */


import { Router, type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';

import { UserResponseSchema, LoginRequestSchema } from '../models/user.js';
import { verifyUser, createUser, getUsers } from '../services/user_service.js';
import { createAccessToken, verifyTurnstileToken } from '../core/security.js';
import { requireAuth } from '../dependencies/auth.js';
import { HttpError } from '../core/errors.js';
import type { User } from '../models/user.js';

export const authRouter = Router();

const formParser = multer().none();

function toUserResponseJson(user: User) {
  return UserResponseSchema.parse({
    id: user.id,
    username: user.username,
    display_name: user.display_name,
    is_admin: user.is_admin,
    is_owner: user.is_owner,
    is_pet: user.is_pet,
    avatar_url: user.avatar_url ?? null,
  });
}

function clientIp(req: Request): string | undefined {
  return req.ip;
}

/**
 * Unified login endpoint that handles both JSON (with Turnstile) and
 * form data (legacy).
 */
authRouter.post('/api/login', formParser, async (req: Request, res: Response, next: NextFunction) => {
  const contentType = req.header('content-type') ?? '';

  let username: string | undefined;
  let password: string | undefined;

  if (contentType.includes('application/json')) {
    const parsed = LoginRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      next(new HttpError(400, 'Invalid request format'));
      return;
    }
    const loginData = parsed.data;

    const isValid = await verifyTurnstileToken(loginData.turnstile_token, clientIp(req));
    if (!isValid) {
      next(new HttpError(400, 'Security verification failed'));
      return;
    }

    username = loginData.username;
    password = loginData.password;
  } else {
    // Legacy form data path (urlencoded or multipart, no files)
    username = req.body?.username;
    password = req.body?.password;

    if (!username || !password) {
      next(new HttpError(400, 'Username and password required'));
      return;
    }
  }

  // Authenticate user
  const user = await verifyUser(username, password);
  if (!user) {
    next(new HttpError(401, 'Invalid credentials', { 'WWW-Authenticate': 'Bearer' }));
    return;
  }

  // Create JWT token
  const token = createAccessToken({
    sub: user.username,
    id: user.id,
    display_name: user.display_name,
    admin: user.is_admin,
    owner: user.is_owner,
    pet: user.is_pet,
    avatar_url: user.avatar_url ?? null,
  });

  res.json({ access_token: token, token_type: 'bearer', success: true });
});

/**
 * Public endpoint for user signup with Turnstile verification.
 * Creates a new user account without admin privileges.
 */
authRouter.post('/api/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body ?? {};

    // Extract and validate required fields
    const username: string = String(body.username ?? '').trim();
    const password: string = body.password ?? '';
    const displayName: string | null = String(body.display_name ?? '').trim() || null;
    const turnstileToken: string = body.turnstile_token ?? '';

    if (!username) {
      next(new HttpError(400, 'Username is required'));
      return;
    }

    if (!password) {
      next(new HttpError(400, 'Password is required'));
      return;
    }

    if (password.length < 10) {
      next(new HttpError(400, 'Password must be at least 10 characters long'));
      return;
    }

    if (!turnstileToken) {
      next(new HttpError(400, 'Security verification is required'));
      return;
    }

    // Verify Turnstile token
    const isValid = await verifyTurnstileToken(turnstileToken, clientIp(req));
    if (!isValid) {
      next(new HttpError(400, 'Security verification failed'));
      return;
    }

    // Check if username already exists (case-insensitive)
    const users = await getUsers();
    const usernameLower = username.toLowerCase();
    if (users.some((u) => u.username.toLowerCase() === usernameLower)) {
      next(new HttpError(400, 'Username already exists'));
      return;
    }

    // Create the user (explicitly set is_admin=False for signup users)
    const newUser = await createUser(
      {
        username,
        password,
        display_name: displayName,
        is_admin: false, // Signup users never get admin privileges
        is_pet: false, // Signup users never get pet privileges
      },
      null,
    );

    res.json({
      success: true,
      message: 'Account created successfully',
      user: toUserResponseJson(newUser),
    });
  } catch (err) {
    if (err instanceof HttpError) {
      next(err);
      return;
    }
    // Mirrors the Python except ValueError -> 400 (createUser throws
    // plain Error for things like "username already exists")
    next(new HttpError(400, String(err instanceof Error ? err.message : err)));
  }
});

/**
 * Public endpoint to check if a username is available (case-insensitive).
 * Used during signup to provide real-time feedback.
 */
authRouter.get(
  '/api/users/check-username',
  async (req: Request, res: Response, next: NextFunction) => {
    const username = typeof req.query.username === 'string' ? req.query.username : '';

    if (!username || !username.trim()) {
      next(new HttpError(400, 'Username parameter is required'));
      return;
    }

    const users = await getUsers();
    const usernameLower = username.trim().toLowerCase();

    const exists = users.some((u) => u.username.toLowerCase() === usernameLower);

    res.json({ username, exists, available: !exists });
  },
);

/** Get current authenticated user's information */
authRouter.get('/api/user_info', requireAuth, (req: Request, res: Response) => {
  res.json(toUserResponseJson(req.user as User));
});

/** Check if current user is admin */
authRouter.get('/api/auth/is_admin', requireAuth, (req: Request, res: Response) => {
  res.json({ isAdmin: req.user?.is_admin ?? false });
});

/** Check if current user is pet */
authRouter.get('/api/auth/is_pet', requireAuth, (req: Request, res: Response) => {
  res.json({ isPet: req.user?.is_pet ?? false });
});

/** Check if current user is owner */
authRouter.get('/api/auth/is_owner', requireAuth, (req: Request, res: Response) => {
  res.json({ isOwner: req.user?.is_owner ?? false });
});