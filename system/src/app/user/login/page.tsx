/* system/src/app/user/login/page.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDoughminationClient } from "@doughmination/react-api";
import * as s from "../auth.css";

const Login: React.FC = () => {
  const client = useDoughminationClient();
  const searchParams = useSearchParams();
  const [redirecting, setRedirecting] = useState(false);

  // Where to send the user after a successful login. /admin/login is an alias
  // for the dashboard, kept for backwards-compatible bookmarks.
  const rawFrom = searchParams?.get("from") || "/";
  const from = rawFrom === "/admin/login" ? "/admin/dash" : rawFrom;

  // The callback route bounces failures back here as ?error=…
  const error = searchParams?.get("error");

  const handleLogin = () => {
    setRedirecting(true);
    // Full navigation (not fetch): the API 302s to PocketID, which sends the
    // browser back to our callback page with a token in the URL fragment.
    window.location.href = client.pocketIdLoginUrl(from);
  };

  return (
    <div className={s.card}>
      <h2 className={s.heading}>Sign in</h2>
      <p className={s.subtitle}>Use your SSO account to continue.</p>

      {error && <div className={s.errorBox}>{error}</div>}

      <div className={s.actions}>
        <button
          type="button"
          className={s.submitBtn}
          onClick={handleLogin}
          disabled={redirecting}
        >
          {redirecting ? "Redirecting to SSO…" : "🔑 Sign in with SSO"}
        </button>

        <p className={s.mutedNote}>
          You&apos;ll be taken to your SSO provider to sign in, then brought right back here.
        </p>
      </div>
    </div>
  );
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}
