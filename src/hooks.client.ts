/* src/hooks.client.ts
 * DASL-1.2 — (c) Clove Twilight
 */

// Registers <iconsax-icon>. Client-only: the package extends HTMLElement, which doesn't exist during SSR
import 'iconsax';

import { connectLive } from '#lib/scripts/discord.ts';
import { discordId } from '#lib';

// Open the live socket once for the whole visit, rather than per page
connectLive([discordId]);
