/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * Member tagging service.
 * Manages tags/categories for system members.
 */

import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';

import { MEMBER_TAGS_FILE } from '../core/config.js';

// Generic PluralKit-shaped member object, same rationale as pluralkit.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PKObject = Record<string, any>;

type MemberTagsMap = Record<string, string[]>;

// Default member tag assignments
const DEFAULT_MEMBER_TAGS: MemberTagsMap = {
  C1: ['Host'],
};

/** Get all member tag assignments */
export async function getMemberTags(): Promise<MemberTagsMap> {
  if (!existsSync(MEMBER_TAGS_FILE)) {
    await saveMemberTags(DEFAULT_MEMBER_TAGS);
    return { ...DEFAULT_MEMBER_TAGS };
  }

  const raw = await readFile(MEMBER_TAGS_FILE, 'utf-8');
  return JSON.parse(raw) as MemberTagsMap;
}

/** Save member tags to file */
export async function saveMemberTags(memberTags: MemberTagsMap): Promise<void> {
  await writeFile(MEMBER_TAGS_FILE, JSON.stringify(memberTags, null, 2), 'utf-8');
}

/** Get tags for a specific member by ID or name */
export async function getMemberTagsById(memberId: string, memberName: string): Promise<string[]> {
  const memberTags = await getMemberTags();

  // Try by member name first
  if (memberName in memberTags) {
    return memberTags[memberName];
  }

  // Then try by member ID
  if (memberId in memberTags) {
    return memberTags[memberId];
  }

  return [];
}

/** Update tags for a member (can use ID or name) */
export async function updateMemberTags(memberIdentifier: string, tags: string[]): Promise<boolean> {
  const memberTags = await getMemberTags();
  memberTags[memberIdentifier] = tags;
  await saveMemberTags(memberTags);
  return true;
}

/** Add a single tag to a member */
export async function addMemberTag(memberIdentifier: string, tag: string): Promise<boolean> {
  const memberTags = await getMemberTags();
  if (!(memberIdentifier in memberTags)) {
    memberTags[memberIdentifier] = [];
  }

  if (!memberTags[memberIdentifier].includes(tag)) {
    memberTags[memberIdentifier].push(tag);
    await saveMemberTags(memberTags);
    return true;
  }

  return false;
}

/** Remove a single tag from a member */
export async function removeMemberTag(memberIdentifier: string, tag: string): Promise<boolean> {
  const memberTags = await getMemberTags();
  const tags = memberTags[memberIdentifier];

  if (tags && tags.includes(tag)) {
    memberTags[memberIdentifier] = tags.filter((t) => t !== tag);
    await saveMemberTags(memberTags);
    return true;
  }

  return false;
}

/** Add tag information to all members */
export async function enrichMembersWithTags(members: PKObject[]): Promise<PKObject[]> {
  const enrichedMembers: PKObject[] = [];

  for (const member of members) {
    const memberName = member.name ?? '';
    const memberId = member.id ?? '';

    const tags = await getMemberTagsById(memberId, memberName);

    enrichedMembers.push({ ...member, tags });
  }

  return enrichedMembers;
}

/** Initialize default member tags if they don't exist */
export async function initializeDefaultTags(): Promise<void> {
  if (!existsSync(MEMBER_TAGS_FILE)) {
    await saveMemberTags(DEFAULT_MEMBER_TAGS);
    console.info('Initialized default member tags');
  }
}