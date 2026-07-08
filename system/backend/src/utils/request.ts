/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * Request parameter utilities.
 *
 * Express 5's route params and query values are typed as
 * `string | string[]` to account for repeated wildcard segments
 * (e.g. `/files/*splat`) and repeated query keys (e.g. `?tag=a&tag=b`).
 * Most routes here only ever expect a single value, so this helper
 * normalizes to a plain string, taking the first entry if an array
 * is somehow provided.
 */

/**
 * Coerce a `string | string[] | undefined` request value to a single string.
 *
 * @param value - The raw param/query value from Express
 * @param fallback - Value to return if `value` is undefined or an empty array
 * @returns A single string
 */
export function asString(value: string | string[] | undefined, fallback = ''): string {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }
  return value ?? fallback;
}
