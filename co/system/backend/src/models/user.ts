/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * User data models.
 *
 * Pydantic's BaseModel does double duty in the Python app: it's both the
 * runtime validator (for request bodies) and the static type. zod gives us
 * the same thing here — define the schema once, validate with `.parse()`,
 * and derive the TS type from it with `z.infer<>` so the two never drift
 * apart.
 *
 * Field names are kept snake_case (not camelCase) on purpose: existing
 * data files (users.json etc.) and the frontend both speak snake_case
 * JSON, and changing that here would silently break compatibility.
 */

import { z } from 'zod';

/** Internal user model with password hash */
export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  password_hash: z.string(),
  display_name: z.string().nullable().optional(),
  is_admin: z.boolean().default(false),
  is_owner: z.boolean().default(false),
  is_pet: z.boolean().default(false),
  avatar_url: z.string().nullable().optional(),
});
export type User = z.infer<typeof UserSchema>;

/** Model for creating a new user */
export const UserCreateSchema = z.object({
  username: z.string(),
  password: z.string(),
  display_name: z.string().nullable().optional(),
  is_admin: z.boolean().default(false),
  is_pet: z.boolean().default(false),
});
export type UserCreate = z.infer<typeof UserCreateSchema>;

/** Public user model (no password hash) */
export const UserResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  display_name: z.string().nullable().optional(),
  is_admin: z.boolean().default(false),
  is_owner: z.boolean().default(false),
  is_pet: z.boolean().default(false),
  avatar_url: z.string().nullable().optional(),
});
export type UserResponse = z.infer<typeof UserResponseSchema>;

/** Model for updating user information */
export const UserUpdateSchema = z.object({
  display_name: z.string().nullable().optional(),
  current_password: z.string().nullable().optional(),
  new_password: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  is_admin: z.boolean().nullable().optional(),
  is_pet: z.boolean().nullable().optional(),
});
export type UserUpdate = z.infer<typeof UserUpdateSchema>;

/** Model for login with Turnstile */
export const LoginRequestSchema = z.object({
  username: z.string(),
  password: z.string(),
  turnstile_token: z.string(),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

/**
 * Strip the password hash off a User for any response that should be
 * public-facing. Equivalent to constructing a UserResponse from a User
 * in the Python app.
 */
export function toUserResponse(user: User): UserResponse {
  const { password_hash: _password_hash, ...rest } = user;
  return rest;
}