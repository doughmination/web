/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

/**
 * User management service.
 * Handles user CRUD operations, authentication, and permissions.
 *
 * Note: hashPassword/verifyPassword are async here (bcrypt's promise API),
 * unlike the sync Python bcrypt calls, so most of this file is async where
 * the Python original wasn't. File I/O is also async (fs/promises) to match.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

import type { User, UserCreate, UserUpdate } from '../models/user.js';
import { USERS_FILE, ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_DISPLAY_NAME } from '../core/config.js';
import { hashPassword, verifyPassword } from '../core/security.js';

const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d+\$.+/;

/** Get the owner username from configuration */
export function getOwnerUsername(): string {
  return ADMIN_USERNAME;
}

/** Check if a username matches the owner username */
export function isOwnerUsername(username: string): boolean {
  return username.toLowerCase() === getOwnerUsername().toLowerCase();
}

/** Get all users from storage */
export async function getUsers(): Promise<User[]> {
  if (!existsSync(USERS_FILE)) {
    return [];
  }

  const raw = await readFile(USERS_FILE, 'utf-8');
  const usersData = JSON.parse(raw) as Array<Record<string, unknown>>;

  return usersData.map((userDict) => {
    // Handle migration from old format
    if (!('is_owner' in userDict)) userDict.is_owner = false;
    if (!('is_pet' in userDict)) userDict.is_pet = false;

    // Force is_owner=True for the owner username
    if (isOwnerUsername(String(userDict.username ?? ''))) {
      userDict.is_owner = true;
      userDict.is_admin = true;
      userDict.is_pet = true;
    }

    return userDict as unknown as User;
  });
}

/** Save users to storage */
export async function saveUsers(users: User[]): Promise<void> {
  // Ensure owner always has full access
  for (const user of users) {
    if (isOwnerUsername(user.username)) {
      user.is_owner = true;
      user.is_admin = true;
      user.is_pet = true;
    }
  }

  await writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

/** Find a user by username (case-insensitive) */
export async function getUserByUsername(username: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase()) ?? null;
}

/** Find a user by ID */
export async function getUserById(userId: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.id === userId) ?? null;
}

/**
 * Create a new user with owner protection.
 *
 * @throws Error if username exists, or if attempting to create the owner
 *   username outside of initial setup
 */
export async function createUser(userCreate: UserCreate, requestingUser?: User | null): Promise<User> {
  const users = await getUsers();

  // Check if username already exists
  if (await getUserByUsername(userCreate.username)) {
    throw new Error(`Username '${userCreate.username}' already exists`);
  }

  // BLOCK: Prevent creating owner username unless this is initial setup
  if (isOwnerUsername(userCreate.username) && requestingUser != null) {
    throw new Error('Cannot create user with owner username. Owner account must be created via initial setup.');
  }

  // Determine permissions
  let isOwner: boolean;
  let isAdmin: boolean;
  let isPet: boolean;

  if (isOwnerUsername(userCreate.username)) {
    // This is the initial owner creation
    isOwner = true;
    isAdmin = true;
    isPet = false;
  } else {
    // Regular user creation
    isOwner = false;
    isAdmin = userCreate.is_admin;
    isPet = userCreate.is_pet;
  }

  const newUser: User = {
    id: randomUUID(),
    username: userCreate.username,
    password_hash: await hashPassword(userCreate.password),
    display_name: userCreate.display_name ?? null,
    is_admin: isAdmin,
    is_owner: isOwner,
    is_pet: isPet,
    avatar_url: null,
  };

  users.push(newUser);
  await saveUsers(users);

  return newUser;
}

/**
 * Update a user with owner protection.
 *
 * @returns the updated user, or null if not found
 * @throws Error if unauthorized changes attempted or current password is incorrect
 */
export async function updateUser(
  userId: string,
  userUpdate: UserUpdate,
  requestingUser?: User | null,
): Promise<User | null> {
  const users = await getUsers();

  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) {
    return null;
  }

  const user = users[index];

  // BLOCK: Prevent changing owner's is_owner or is_admin flags
  if (user.is_owner && userUpdate.is_admin === false) {
    throw new Error('Cannot remove admin privileges from owner');
  }

  // BLOCK: Only owner can modify admin accounts (except themselves)
  if (requestingUser && user.is_admin && requestingUser.id !== user.id) {
    if (!requestingUser.is_owner) {
      throw new Error('Only the owner can modify admin accounts');
    }
  }

  // Verify current password if attempting to change password
  let passwordHash = user.password_hash;
  if (userUpdate.current_password && userUpdate.new_password) {
    if (!(await verifyPassword(userUpdate.current_password, user.password_hash))) {
      throw new Error('Current password is incorrect');
    }
    passwordHash = await hashPassword(userUpdate.new_password);
  }

  // Determine new permissions
  const newIsOwner = isOwnerUsername(user.username);
  const newIsAdmin = newIsOwner ? true : userUpdate.is_admin ?? user.is_admin;
  const newIsPet = userUpdate.is_pet ?? user.is_pet;

  const updatedUser: User = {
    id: user.id,
    username: user.username,
    password_hash: passwordHash,
    display_name: userUpdate.display_name ?? user.display_name,
    is_admin: newIsAdmin,
    is_owner: newIsOwner,
    is_pet: newIsPet,
    avatar_url: userUpdate.avatar_url ?? user.avatar_url ?? null,
  };

  users[index] = updatedUser;
  await saveUsers(users);
  return updatedUser;
}

/**
 * Delete a user with owner protection.
 *
 * @returns true if deleted, false if not found
 * @throws Error if trying to delete the owner, or deleting an admin without owner rights
 */
export async function deleteUser(userId: string, requestingUser?: User | null): Promise<boolean> {
  const users = await getUsers();

  const userToDelete = users.find((u) => u.id === userId);
  if (!userToDelete) {
    return false;
  }

  // BLOCK: Prevent deleting the owner
  if (userToDelete.is_owner) {
    throw new Error('Cannot delete the owner account');
  }

  // BLOCK: Only owner can delete admins
  if (requestingUser && userToDelete.is_admin && !requestingUser.is_owner) {
    throw new Error('Only the owner can delete admin accounts');
  }

  const remaining = users.filter((u) => u.id !== userId);

  if (remaining.length < users.length) {
    await saveUsers(remaining);
    return true;
  }

  return false;
}

/** Verify user credentials */
export async function verifyUser(username: string, password: string): Promise<User | null> {
  const user = await getUserByUsername(username);
  if (user && (await verifyPassword(password, user.password_hash))) {
    return user;
  }
  return null;
}

/** Creates the admin user from environment variables if no users exist */
export async function initializeAdminUser(): Promise<void> {
  const users = await getUsers();
  if (users.length > 0) {
    return;
  }

  const adminUsername = ADMIN_USERNAME;
  let adminPasswordOrHash = ADMIN_PASSWORD;
  const adminDisplayName = ADMIN_DISPLAY_NAME;

  if (!adminPasswordOrHash) {
    console.warn("Warning: No ADMIN_PASSWORD set in environment. Using default password 'admin'");
    adminPasswordOrHash = 'admin';
  }

  try {
    const isHash = BCRYPT_HASH_PATTERN.test(adminPasswordOrHash);

    if (isHash) {
      // If it's already a hash, create the user directly
      const newUser: User = {
        id: randomUUID(),
        username: adminUsername,
        password_hash: adminPasswordOrHash,
        display_name: adminDisplayName,
        is_admin: true,
        is_owner: true,
        is_pet: false,
        avatar_url: null,
      };
      users.push(newUser);
      await saveUsers(users);
      console.info(`Created owner user with provided hash: ${adminUsername} (Display name: ${adminDisplayName})`);
    } else {
      // If it's not a hash, create the user normally
      await createUser({
        username: adminUsername,
        password: adminPasswordOrHash,
        display_name: adminDisplayName,
        is_admin: true,
        is_pet: false,
      });
      console.info(`Created owner user: ${adminUsername} (Display name: ${adminDisplayName})`);
    }
  } catch (err) {
    console.error(`Error creating owner user: ${String(err)}`);
  }
}