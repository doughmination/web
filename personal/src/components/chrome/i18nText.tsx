/* personal/src/components/chrome/i18nText.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/*
 * Tiny client helpers that let server-component pages (the ones exporting
 * `metadata`) show translated text without themselves becoming client
 * components. `<Tr>` renders one dictionary string; `<TrLink>` renders a
 * sentence with a single embedded link, splitting the translated string on a
 * "{link}" placeholder so the anchor lands in the right spot regardless of
 * the target language's word order.
 */

"use client";

import type { ReactNode } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { TranslationKey } from "@/i18n/translate";

/** Renders a single translated string. Optional `{token}` replacements. */
export function Tr({
  k,
  vars,
}: {
  k: TranslationKey;
  vars?: Record<string, string | number>;
}): ReactNode {
  const { t } = useLanguage();
  let text = t(k);
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replace(`{${name}}`, String(value));
    }
  }
  return <>{text}</>;
}

/**
 * Renders a translated sentence containing exactly one link. The dictionary
 * string must include a literal "{link}" marker where the anchor goes; the
 * surrounding text is kept as-is so translations control word order.
 */
export function TrLink({
  k,
  href,
  linkText,
  external = true,
}: {
  k: TranslationKey;
  href: string;
  linkText: string;
  external?: boolean;
}): ReactNode {
  const { t } = useLanguage();
  const [before, after = ""] = t(k).split("{link}");
  return (
    <>
      {before}
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener" } : {})}
      >
        {linkText}
      </a>
      {after}
    </>
  );
}
