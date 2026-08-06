/* personal/src/proxy.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/*
 * Locale routing (Next's `proxy` convention, formerly `middleware`). The active
 * language lives in the URL under a language prefix (/en/discord, /nl/discord,
 * …). This proxy:
 *
 *   1. Prefixed request  -> rewrites to the flat route (/en/discord serves
 *      the /discord page) and records the language in the `lang` cookie.
 *   2. Bare request      -> redirects to the visitor's language: the saved
 *      cookie if present, otherwise their browser's Accept-Language, otherwise
 *      the default. This is the first-visit auto-detect, and the cookie makes
 *      it stick.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  LOCALE_PREFIXES,
  isLanguage,
  localeFromPathname,
  matchLanguage,
  parseAcceptLanguage,
  stripLocalePrefix,
} from "@/i18n/config";

const LANG_COOKIE = "lang";

// A year, in seconds.
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function proxy(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;

  const language = localeFromPathname(pathname);

  // Already localized: serve the flat route, keep the cookie in sync.
  if (language) {
    const url = request.nextUrl.clone();
    url.pathname = stripLocalePrefix(pathname);

    const response = NextResponse.rewrite(url);
    response.cookies.set(LANG_COOKIE, language, {
      path: "/",
      maxAge: COOKIE_MAX_AGE,
      sameSite: "lax",
    });
    return response;
  }

  // Bare path: pick the visitor's language and redirect to the prefixed URL.
  const savedLang = request.cookies.get(LANG_COOKIE)?.value;

  const preferred =
    savedLang && isLanguage(savedLang)
      ? savedLang
      : matchLanguage(parseAcceptLanguage(request.headers.get("accept-language")));

  const suffix = pathname === "/" ? "" : pathname;

  const url = request.nextUrl.clone();
  url.pathname = `/${LOCALE_PREFIXES[preferred]}${suffix}`;
  url.search = search;
  return NextResponse.redirect(url);
}

// Run on everything except Next internals, the API, and files with an
// extension (favicon.png, https://m.doughmination.gay/glb/*.glb, images, …).
export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
