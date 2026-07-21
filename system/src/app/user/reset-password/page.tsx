/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE, errorMessage } from "@/lib/api";
import { useTurnstile } from "@/lib/useTurnstile";
import * as s from "../auth.css";

const MIN_PASSWORD_LENGTH = 10;

type TokenState = "checking" | "valid" | "invalid" | "missing";

const ResetPassword: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token") ?? "";

  const [tokenState, setTokenState] = useState<TokenState>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const turnstile = useTurnstile();

  // Validate the token before showing the form, so an expired link says so
  // immediately instead of after the user has typed a new password.
  useEffect(() => {
    if (!token) {
      setTokenState("missing");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/reset-password/check?token=${encodeURIComponent(token)}`,
        );
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        setTokenState(res.ok && data?.valid ? "valid" : "invalid");
      } catch (err) {
        console.error("Token check error:", err);
        if (!cancelled) setTokenState("invalid");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const longEnough = password.length >= MIN_PASSWORD_LENGTH;
  const matches = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!longEnough) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
      return;
    }
    if (!matches) {
      setError("Passwords do not match");
      return;
    }
    if (!turnstile.token) {
      setError("Please complete the security verification");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          new_password: password,
          turnstile_token: turnstile.token,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(errorMessage(data, "Couldn't reset your password. Please try again."));
        turnstile.reset();
        return;
      }

      // The old session, if any, is for the pre-reset password.
      localStorage.removeItem("token");
      setDone(true);
      setTimeout(() => router.replace("/user/login"), 3000);
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Network error. Please check your connection and try again.");
      turnstile.reset();
    } finally {
      setLoading(false);
    }
  };

  if (tokenState === "checking") {
    return (
      <div className={s.card}>
        <div className={s.centerState}>
          <div className={s.spinnerWrap}>
            <div className={s.spinner} />
          </div>
          <p className={s.mutedNote}>Checking your reset link...</p>
        </div>
      </div>
    );
  }

  if (tokenState === "missing" || tokenState === "invalid") {
    return (
      <div className={s.card}>
        <div className={s.centerState}>
          <div className={s.stateEmoji}>⏳</div>
          <h2 className={s.stateTitleBad}>
            {tokenState === "missing" ? "No reset link found" : "This link has expired"}
          </h2>
          <p className={s.sentText}>
            {tokenState === "missing"
              ? "Open the link from your reset email, or request a new one."
              : "Reset links last 15 minutes and can only be used once. Request a fresh one to continue."}
          </p>
          <Link href="/user/forgot-password" className={s.backLink}>
            Request a new link
          </Link>
          <Link href="/user/login" className={s.blueLink}>
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className={s.card}>
        <div className={s.sentInner}>
          <div className={s.sentEmoji}>🎉</div>
          <h2 className={s.sentTitle}>Password updated</h2>
          <p className={s.sentText}>You can now log in with your new password.</p>
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
      <h2 className={s.heading}>Choose a new password</h2>
      <p className={s.subtitle}>Pick something you haven&apos;t used on this account before.</p>

      {(error || turnstile.error) && <div className={s.errorBox}>{error || turnstile.error}</div>}

      <form onSubmit={handleSubmit} className={s.form}>
        <div>
          <label htmlFor="password" className={s.fieldLabel}>
            New password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter a new password"
            className={s.textInput}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="new-password"
          />
          <ul className={s.ruleList}>
            <li className={longEnough ? s.ruleMet : s.ruleItem}>
              {longEnough ? "✓" : "○"} At least {MIN_PASSWORD_LENGTH} characters
            </li>
            <li className={matches ? s.ruleMet : s.ruleItem}>
              {matches ? "✓" : "○"} Both passwords match
            </li>
          </ul>
        </div>

        <div>
          <label htmlFor="confirmPassword" className={s.fieldLabel}>
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Enter it again"
            className={s.textInput}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            autoComplete="new-password"
          />
          {confirmPassword.length > 0 && !matches && (
            <p className={s.hintBad}>Passwords do not match</p>
          )}
        </div>

        <div className={s.turnstileBlock}>
          <label className={s.fieldLabel}>Security Verification</label>
          <div ref={turnstile.containerRef} className={s.turnstileCenter} />
          {!turnstile.loaded && (
            <div className={s.mutedNote}>Loading security verification...</div>
          )}
        </div>

        <button
          type="submit"
          className={s.submitBtn}
          disabled={loading || !turnstile.token || !longEnough || !matches}
        >
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>

      <div className={s.bottomNote}>
        <Link href="/user/login" className={s.blueLink}>
          ← Back to login
        </Link>
      </div>
    </div>
  );
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
}
