/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * Data models package.
 *
 * As in user.ts, field names stay snake_case to match the existing
 * data files and frontend wire format.
 */

import { z } from 'zod';

// Re-export user models, matching the Python __init__.py's re-export of
// app.models.user contents.
export {
  UserSchema,
  UserCreateSchema,
  UserResponseSchema,
  UserUpdateSchema,
  LoginRequestSchema,
  toUserResponse,
} from './user.js';
export type { User, UserCreate, UserResponse, UserUpdate, LoginRequest } from './user.js';

/** Mental state tracking model */
export const MentalStateSchema = z.object({
  level: z.string(), // safe, unstable, idealizing, self-harming, highly at risk
  updated_at: z.coerce.date().default(() => new Date()),
  notes: z.string().nullable().optional(),
});
export type MentalState = z.infer<typeof MentalStateSchema>;

/** PluralKit system information */
export const SystemInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  tag: z.string().nullable(),
  mental_state: MentalStateSchema.nullable().optional(),
});
export type SystemInfo = z.infer<typeof SystemInfoSchema>;

// ============================================================================
// BOT MODELS
// ============================================================================

/** Response for bot token regeneration */
export const TokenRegenerateResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  new_token: z.string(),
});
export type TokenRegenerateResponse = z.infer<typeof TokenRegenerateResponseSchema>;

/** Bot health check response */
export const HealthResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  authenticated: z.boolean(),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

/** Request to update a single fronter */
export const FronterUpdateRequestSchema = z.object({
  member_id: z.string(),
});
export type FronterUpdateRequest = z.infer<typeof FronterUpdateRequestSchema>;

/** Request to switch multiple fronters */
export const MultiSwitchRequestSchema = z.object({
  member_ids: z.array(z.string()),
});
export type MultiSwitchRequest = z.infer<typeof MultiSwitchRequestSchema>;

/** Response from fronter update */
export const FronterUpdateResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  fronters: z.array(z.unknown()),
});
export type FronterUpdateResponse = z.infer<typeof FronterUpdateResponseSchema>;

/** Response from multi-switch */
export const MultiSwitchResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  fronters: z.array(z.unknown()),
  count: z.number().int(),
});
export type MultiSwitchResponse = z.infer<typeof MultiSwitchResponseSchema>;

// ============================================================================
// BATTERY MODELS
// ============================================================================

/** Latest battery level for a single device */
export const BatteryLevelSchema = z.object({
  device: z.string(),
  level: z.number().int().min(0).max(100),
  updated_at: z.coerce.date(),
});
export type BatteryLevel = z.infer<typeof BatteryLevelSchema>;

/** Response after storing a battery level */
export const BatteryUpdateResponseSchema = z.object({
  success: z.boolean(),
  device: z.string(),
  level: z.number().int(),
  updated_at: z.coerce.date(),
});
export type BatteryUpdateResponse = z.infer<typeof BatteryUpdateResponseSchema>;