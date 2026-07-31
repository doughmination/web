/* system/src/app/user/login/callback/page.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as s from "../../auth.css";

/**
 * PocketID login landing page.
 *
 * The API's OIDC callback mints a JWT and redirects here with the token in the
 * URL fragment (`#token=…&from=…`) so it never touches a server log. We read it
 * from `location.hash`, store it where the provider's client picks it up, then
 * forward the user to wherever they were headed.
 */

/** Only allow returning to same-site app paths — never "//host" or a full URL. */
function safeFrom(raw: string | null): string {
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

const Callback: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // The fragment (everything after #) never reaches the server.
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hash);

    const errParam = params.get("error");
    if (errParam) {
      setError(errParam);
      return;
    }

    const token = params.get("token");
    if (!token) {
      setError("No sign-in token was returned. Please try again.");
      return;
    }

    // The provider reads the token from here on every request.
    localStorage.setItem("token", token);

    // Strip the token from the address bar before moving on.
    const dest = safeFrom(params.get("from"));
    window.history.replaceState(null, "", window.location.pathname);
    router.replace(dest);
  }, [router]);

  if (error) {
    return (
      <div className={s.card}>
        <h2 className={s.heading}>Sign-in failed</h2>
        <div className={s.errorBox}>{error}</div>
        <div className={s.actions}>
          <Link href="/user/login" className={s.submitBtn}>
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={s.card}>
      <div className={s.welcomeInner}>
        <div className={s.spinnerWrap}>
          <div className={s.spinner}></div>
        </div>
        <p className={s.mutedNote}>Signing you in…</p>
      </div>
    </div>
  );
};

export default function LoginCallbackPage() {
  return (
    <Suspense fallback={null}>
      <Callback />
    </Suspense>
  );
}
