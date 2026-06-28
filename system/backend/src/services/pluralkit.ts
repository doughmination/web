/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * PluralKit API integration service.
 * Handles all interactions with the PluralKit API.
 */

import axios from 'axios';

import { PLURALKIT_BASE_URL, getPluralkitHeaders, CACHE_TTL } from '../core/config.js';
import { getFromCache, setInCache } from '../utils/cache.js';

// Generic PluralKit JSON object — the upstream schema is large and not
// fully modeled here, mirroring the Python service's use of plain dicts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PKObject = Record<string, any>;

// Special member display names
const SPECIAL_DISPLAY_NAMES: Record<string, string> = {
  answer: 'Answer Machine',
  system: 'Unsure',
  sleeping: 'I am sleeping',
};

/** Get system information from PluralKit */
export async function getSystem(): Promise<PKObject> {
  const cacheKey = 'system';
  const cached = getFromCache<PKObject>(cacheKey);
  if (cached) {
    return cached;
  }

  const { data } = await axios.get<PKObject>(`${PLURALKIT_BASE_URL}/systems/@me`, {
    headers: getPluralkitHeaders(),
  });
  setInCache(cacheKey, data, CACHE_TTL);
  return data;
}

/** Get all system members from PluralKit */
export async function getMembers(): Promise<PKObject[]> {
  const cacheKey = 'members';
  const cached = getFromCache<PKObject[]>(cacheKey);
  if (cached) {
    return cached;
  }

  // Get raw members from API
  const baseCacheKey = 'members_raw';
  let cachedRaw = getFromCache<PKObject[]>(baseCacheKey);
  if (!cachedRaw) {
    const { data } = await axios.get<PKObject[]>(`${PLURALKIT_BASE_URL}/systems/@me/members`, {
      headers: getPluralkitHeaders(),
    });
    cachedRaw = data;
    setInCache(baseCacheKey, cachedRaw, CACHE_TTL);
  }

  // Process special members
  const processedMembers: PKObject[] = cachedRaw.map((member) => {
    const memberName = member.name;

    if (memberName in SPECIAL_DISPLAY_NAMES) {
      return {
        ...member,
        display_name: SPECIAL_DISPLAY_NAMES[memberName],
        is_special: true,
        original_name: memberName,
      };
    }
    return member;
  });

  setInCache(cacheKey, processedMembers, CACHE_TTL);
  return processedMembers;
}

/** Get current fronters from PluralKit */
export async function getFronters(): Promise<PKObject> {
  const cacheKey = 'fronters';
  const cached = getFromCache<PKObject>(cacheKey);
  if (cached) {
    return cached;
  }

  const { data } = await axios.get<PKObject>(`${PLURALKIT_BASE_URL}/systems/@me/fronters`, {
    headers: getPluralkitHeaders(),
  });

  // Process special members in fronters
  if ('members' in data) {
    const allMembers = await getMembers();

    const processedFronters = (data.members as PKObject[]).map((member) => {
      return allMembers.find((m) => m.id === member.id) ?? member;
    });

    data.members = processedFronters;
  }

  setInCache(cacheKey, data, CACHE_TTL);
  return data;
}

/**
 * Set the current front to the provided list of member IDs.
 *
 * @param memberIds - List of member IDs to set as fronting
 * @returns Response body from the PluralKit API (or null if empty)
 * @throws Error if the PluralKit API call fails
 */
export async function setFront(memberIds: string[]): Promise<unknown> {
  // Clear fronters cache
  setInCache('fronters', null, 0);

  const resp = await axios.post(
    `${PLURALKIT_BASE_URL}/systems/@me/switches`,
    { members: memberIds },
    {
      headers: getPluralkitHeaders(),
      validateStatus: () => true, // handle non-2xx ourselves, like resp.raise_for_status() didn't run here
    },
  );

  if (resp.status !== 200 && resp.status !== 204) {
    throw new Error(`Failed to set front: ${resp.status} - ${JSON.stringify(resp.data)}`);
  }

  return resp.data ?? null;
}

/** Get recent switches from PluralKit */
export async function getSwitches(limit = 1000): Promise<PKObject[]> {
  const cacheKey = `switches_${limit}`;
  const cached = getFromCache<PKObject[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const { data } = await axios.get<PKObject[]>(`${PLURALKIT_BASE_URL}/systems/@me/switches`, {
    headers: getPluralkitHeaders(),
    params: { limit },
  });
  setInCache(cacheKey, data, CACHE_TTL);
  return data;
}