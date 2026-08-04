/* personal/src/i18n/dictionaries.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import en from "./locales/en";
import ja from "./locales/ja";
import es from "./locales/es";
import type { Dictionary } from "./locales/en";
import type { Language } from "./config";

export const dictionaries: Record<Language, Dictionary> = { en, ja, es };