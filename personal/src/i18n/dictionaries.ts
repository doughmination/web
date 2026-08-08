/* personal/src/i18n/dictionaries.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import en from "./locales/en";
import ja from "./locales/ja";
import es from "./locales/es";
import nl from "./locales/nl";
import de from "./locales/de";
import zh from "./locales/zh";
import pt from "./locales/pt";
import ko from "./locales/ko";
import it from "./locales/it";
import ru from "./locales/ru";
import pl from "./locales/pl";
import tr from "./locales/tr";
import ar from "./locales/ar";
import type { Dictionary } from "./locales/en";
import type { Language } from "./config";

export const dictionaries: Record<Language, Dictionary> = {
  en,
  ja,
  es,
  nl,
  de,
  zh,
  pt,
  ko,
  it,
  ru,
  pl,
  tr,
  ar,
};