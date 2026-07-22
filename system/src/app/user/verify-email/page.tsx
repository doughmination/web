/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useVerifyEmail, isDoughminationError } from "@doughmination/react-api";
import * as s from "../auth.css";

type State = "checking" | "verified" | "failed" | "missing";

const VerifyEmail: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token") ?? "";

  const [state, setState] = useState<State>("checking");
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");

  const verifyEmail = useVerifyEmail();

  // Verification spends the token, so this must fire exactly once. React 18
  // StrictMode double-invokes effects in dev, which would otherwise consume
  // the token on the first call and report failure on the second.
  const attempted = useRef(false);

  useEffect(() => {
    if (!token) {
      setState("missing");
      return;
    }
    if (attempted.current) return;
    attempted.current = true;

    (async () => {
      try {
        const data = await verifyEmail.mutateAsync(token);
        setUsername(data?.username ?? "");
        setState("verified");
        setTimeout(() => router.replace("/user/login"), 3000);
      } catch (err) {
        console.error("Verify email error:", err);
        setError(
          isDoughminationError(err)
            ? err.message
            : "Network error. Please check your connection and try again.",
        );
        setState("failed");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, router]);

  if (state === "checking") {
    return (
      <div className={s.card}>
        <div className={s.centerState}>
          <div className={s.spinnerWrap}>
            <div className={s.spinner} />
          </div>
          <p className={s.mutedNote}>Confirming your email address...</p>
        </div>
      </div>
    );
  }

  if (state === "verified") {
    return (
      <div className={s.card}>
        <div className={s.sentInner}>
          <div className={s.sentEmoji}>✅</div>
          <h2 className={s.sentTitle}>Email confirmed</h2>
          <p className={s.sentText}>
            {username ? (
              <>
                <strong>{username}</strong> is all set. You can log in now.
              </>
            ) : (
              "Your account is all set. You can log in now."
            )}
          </p>
          <div className={s.spinnerWrap}>
            <div className={s.spinner} />
          </div>
          <p className={s.mutedNote}>Taking you to the login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={s.card}>
      <div className={s.centerState}>
        <div className={s.stateEmoji}>{state === "missing" ? "🔗" : "⏳"}</div>
        <h2 className={s.stateTitleBad}>
          {state === "missing" ? "No confirmation link found" : "Couldn't confirm that link"}
        </h2>
        <p className={s.sentText}>
          {state === "missing"
            ? "Open the link from your confirmation email to finish setting up your account."
            : error}
        </p>
        <p className={s.helperText}>
          Confirmation links last 24 hours and can only be used once. If yours has expired, you can
          send a new one from the login page.
        </p>
        <Link href="/user/login" className={s.backLink}>
          Go to login
        </Link>
      </div>
    </div>
  );
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmail />
    </Suspense>
  );
}
