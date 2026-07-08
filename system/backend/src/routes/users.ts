/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { extname, basename, join } from 'node:path';
import { existsSync } from 'node:fs';
import { unlink, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

import { Router, type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';

import { UserCreateSchema, UserUpdateSchema, toUserResponse } from '../models/user.js';
import { asString } from '../utils/request.js';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
} from '../services/user_service.js';
import { requireAuth, requireAdmin } from '../dependencies/auth.js';
import { DATA_DIR, MAX_AVATAR_SIZE, ALLOWED_AVATAR_EXTENSIONS, BASE_URL } from '../core/config.js';
import { HttpError } from '../core/errors.js';
import type { User } from '../models/user.js';

export const usersRouter = Router();

const upload = multer({ storage: multer.memoryStorage() });

/** Get all users (admin only) */
usersRouter.get('/users', requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  const users = await getUsers();
  res.json(users.map(toUserResponse));
});

/** Create a new user (admin only) */
usersRouter.post(
  '/users',
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = UserCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ detail: parsed.error.issues });
      return;
    }

    try {
      const newUser = await createUser(parsed.data, req.user ?? null);
      res.json(toUserResponse(newUser));
    } catch (err) {
      // Mirrors Python's except ValueError -> 400 (createUser throws
      // plain Error for things like "username already exists")
      next(new HttpError(400, String(err instanceof Error ? err.message : err)));
    }
  },
);

/** Update user information (admin or self) */
usersRouter.put(
  '/users/:user_id',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = asString(req.params.user_id);
    const currentUser = req.user as User;

    // Only admins or the user themselves can update their info
    if (!currentUser.is_admin && currentUser.id !== userId) {
      next(new HttpError(403, 'Not authorized to update this user'));
      return;
    }

    const parsed = UserUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ detail: parsed.error.issues });
      return;
    }

    try {
      const updatedUser = await updateUser(userId, parsed.data, currentUser);
      if (!updatedUser) {
        next(new HttpError(404, 'User not found'));
        return;
      }

      res.json(toUserResponse(updatedUser));
    } catch (err) {
      // updateUser throws plain Error for both the ValueError and
      // PermissionError cases in the Python version. Without a distinct
      // error type to tell them apart, 400 is the closer default — the
      // PermissionError messages ("Only the owner can...") still come
      // through in the detail text either way.
      next(new HttpError(400, String(err instanceof Error ? err.message : err)));
    }
  },
);

/** Delete a user (admin only) */
usersRouter.delete(
  '/users/:user_id',
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = asString(req.params.user_id);
    const currentUser = req.user as User;

    // Prevent self-deletion
    if (userId === currentUser.id) {
      next(new HttpError(400, 'Cannot delete your own account'));
      return;
    }

    try {
      const success = await deleteUser(userId, currentUser);
      if (!success) {
        next(new HttpError(404, 'User not found'));
        return;
      }

      res.json({ message: 'User deleted successfully' });
    } catch (err) {
      next(new HttpError(403, String(err instanceof Error ? err.message : err)));
    }
  },
);

/** Upload user avatar (admin or self) */
usersRouter.post(
  '/users/:user_id/avatar',
  requireAuth,
  upload.single('avatar'),
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = asString(req.params.user_id);
    const currentUser = req.user as User;

    // Only admins or the user themselves can update their avatar
    if (!currentUser.is_admin && currentUser.id !== userId) {
      next(new HttpError(403, 'Not authorized to update this user'));
      return;
    }

    // Verify user exists
    const user = await getUserById(userId);
    if (!user) {
      next(new HttpError(404, 'User not found'));
      return;
    }

    const file = req.file;
    if (!file) {
      next(new HttpError(400, "Missing 'avatar' file"));
      return;
    }

    // Validate file extension
    const fileExt = extname(file.originalname).toLowerCase();
    if (!(ALLOWED_AVATAR_EXTENSIONS as readonly string[]).includes(fileExt)) {
      next(
        new HttpError(
          400,
          `Invalid file type. Allowed types: ${ALLOWED_AVATAR_EXTENSIONS.join(', ')}`,
        ),
      );
      return;
    }

    // Validate file size (multer already buffered it in memory at this point)
    if (file.size > MAX_AVATAR_SIZE) {
      next(
        new HttpError(
          413,
          `File size exceeds the limit of ${Math.floor(MAX_AVATAR_SIZE / (1024 * 1024))}MB`,
        ),
      );
      return;
    }

    try {
      // Generate unique filename
      const uniqueFilename = `${userId}_${randomUUID()}${fileExt}`;
      const filePath = join(DATA_DIR, uniqueFilename);

      // Remove old avatar if exists
      if (user.avatar_url) {
        try {
          const oldFilename = basename(user.avatar_url);
          const oldPath = join(DATA_DIR, oldFilename);
          if (existsSync(oldPath)) {
            await unlink(oldPath);
          }
        } catch (err) {
          console.error(`Error removing old avatar: ${String(err)}`);
        }
      }

      // Save new file
      await writeFile(filePath, file.buffer);

      // Construct avatar URL
      const avatarUrl = `${BASE_URL}/avatars/${uniqueFilename}`;

      // Update user with avatar URL
      const updatedUser = await updateUser(userId, { avatar_url: avatarUrl }, currentUser);

      if (!updatedUser) {
        next(new HttpError(500, 'Failed to update user with avatar URL'));
        return;
      }

      res.json({ success: true, avatar_url: avatarUrl });
    } catch (err) {
      if (err instanceof HttpError) {
        next(err);
        return;
      }
      next(new HttpError(500, `Error uploading avatar: ${String(err)}`));
    }
  },
);