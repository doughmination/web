/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * Simple in-memory caching utility.
 */

interface CacheEntry {
  value: unknown;
  expireAt: number; // epoch ms
}

const cache = new Map<string, CacheEntry>();

/**
 * Get a value from cache if it exists and hasn't expired.
 *
 * @param key - Cache key
 * @returns Cached value, or undefined if expired/not found
 */
export function getFromCache<T = unknown>(key: string): T | undefined {
  const entry = cache.get(key);
  if (entry) {
    if (Date.now() < entry.expireAt) {
      return entry.value as T;
    }
    cache.delete(key); // Clean up expired entry
  }
  return undefined;
}

/**
 * Set a value in cache with a TTL.
 *
 * @param key - Cache key
 * @param value - Value to cache
 * @param ttlSeconds - Time to live in seconds (default: 30)
 */
export function setInCache(key: string, value: unknown, ttlSeconds = 30): void {
  cache.set(key, { value, expireAt: Date.now() + ttlSeconds * 1000 });
}

/**
 * Clear a cache entry, or the entire cache.
 *
 * @param key - Specific key to clear, or omit to clear all
 */
export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}