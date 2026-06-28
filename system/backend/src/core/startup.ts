/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { initializeAdminUser } from '../services/user_service.js';
import { initializeDefaultTags } from '../services/tag_service.js';
import { initializeStatusStorage } from '../services/status_service.js';
import { initializeBotToken } from '../services/bot_token_service.js';
import { initializeBatteryKey } from '../services/battery_key_service.js';
import { initializeBatteryStorage } from '../services/battery_service.js';

/**
 * Run all startup tasks in order.
 * These tasks ensure the application is properly configured.
 */
export async function startupTasks(): Promise<void> {
  console.info('='.repeat(60));
  console.info('Starting Doughmination System Backend');
  console.info('='.repeat(60));

  // Initialize bot access token
  console.info('\n[1/6] Initializing bot access token...');
  await initializeBotToken();

  // Initialize admin user
  console.info('\n[2/6] Initializing admin user...');
  await initializeAdminUser();

  // Initialize member tags
  console.info('\n[3/6] Initializing member tags...');
  await initializeDefaultTags();

  // Initialize member status storage
  console.info('\n[4/6] Initializing member status storage...');
  await initializeStatusStorage();

  // Initialize battery access key
  console.info('\n[5/6] Initializing battery access key...');
  await initializeBatteryKey();

  // Initialize battery levels storage
  console.info('\n[6/6] Initializing battery levels storage...');
  await initializeBatteryStorage();

  console.info('\n' + '='.repeat(60));
  console.info('Startup complete! Server is ready.');
  console.info('='.repeat(60) + '\n');
}