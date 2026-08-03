/* personal/src/i18n/translate.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/*
 * Derives "nav.home"-style dotted keys from the Dictionary shape at the type
 * level, so `t("nav.hmoe")` is a compile error instead of a silent blank
 * string. resolve() does the matching runtime walk.
 */

import type { Dictionary } from "./locales/en";

type Join<K extends string, P extends string> = P extends "" ? K : `${K}.${P}`;

type Paths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : Join<K, Paths<T[K]>>;
}[keyof T & string];

export type TranslationKey = Paths<Dictionary>;

export function resolve(dict: Dictionary, key: TranslationKey): string {
  const value = (key as string)
    .split(".")
    .reduce<unknown>(
      (acc, part) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined),
      dict,
    );
  // Falls back to the raw key if a locale is ever missing an entry —
  // `satisfies Dictionary` on each locale file should make that unreachable,
  // but a visible key beats a blank label if it ever happens.
  return typeof value === "string" ? value : key;
}
