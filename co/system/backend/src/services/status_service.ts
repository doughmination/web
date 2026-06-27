/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * Member status service.
 * Manages custom status messages for members.
 */

import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';

import { MEMBER_STATUS_FILE } from '../core/config.js';

interface MemberStatus {
  text: string;
  emoji: string | null;
  updated_at: string;
}

type StatusMap = Record<string, MemberStatus>;

// Generic PluralKit-shaped member object, same rationale as pluralkit.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PKObject = Record<string, any>;

/** Get all member statuses */
export async function getAllStatuses(): Promise<StatusMap> {
  if (!existsSync(MEMBER_STATUS_FILE)) {
    return {};
  }

  const raw = await readFile(MEMBER_STATUS_FILE, 'utf-8');
  return JSON.parse(raw) as StatusMap;
}

/** Save all member statuses to file */
export async function saveAllStatuses(statuses: StatusMap): Promise<void> {
  await writeFile(MEMBER_STATUS_FILE, JSON.stringify(statuses, null, 2), 'utf-8');
}

/** Get status for a specific member by ID or name */
export async function getMemberStatus(memberIdentifier: string): Promise<MemberStatus | null> {
  const statuses = await getAllStatuses();
  return statuses[memberIdentifier] ?? null;
}

/**
 * Set or update status for a member.
 *
 * @param memberIdentifier - Member ID or name
 * @param statusText - The status message
 * @param emoji - Optional emoji to display with the status
 * @returns The created/updated status object
 */
export async function setMemberStatus(
  memberIdentifier: string,
  statusText: string,
  emoji?: string | null,
): Promise<MemberStatus> {
  const statuses = await getAllStatuses();

  const statusObj: MemberStatus = {
    text: statusText,
    emoji: emoji ?? null,
    updated_at: new Date().toISOString(),
  };

  statuses[memberIdentifier] = statusObj;
  await saveAllStatuses(statuses);

  return statusObj;
}

/**
 * Clear status for a member.
 *
 * @returns true if a status was found and removed, false otherwise
 */
export async function clearMemberStatus(memberIdentifier: string): Promise<boolean> {
  const statuses = await getAllStatuses();

  if (memberIdentifier in statuses) {
    delete statuses[memberIdentifier];
    await saveAllStatuses(statuses);
    return true;
  }

  return false;
}

/**
 * Add status information to a member object.
 * Tries to find a status by ID first, then by name.
 */
export async function enrichMemberWithStatus(member: PKObject): Promise<PKObject> {
  const memberId = member.id;
  const memberName = member.name;

  let status: MemberStatus | null = null;
  if (memberId) {
    status = await getMemberStatus(String(memberId));
  }
  if (!status && memberName) {
    status = await getMemberStatus(memberName);
  }

  return { ...member, status };
}

/** Add status information to a list of members */
export async function enrichMembersWithStatus(members: PKObject[]): Promise<PKObject[]> {
  return Promise.all(members.map((member) => enrichMemberWithStatus(member)));
}

/** Initialize the status storage file if it doesn't exist */
export async function initializeStatusStorage(): Promise<void> {
  if (!existsSync(MEMBER_STATUS_FILE)) {
    await saveAllStatuses({});
    console.info('Initialized member status storage');
  }
}