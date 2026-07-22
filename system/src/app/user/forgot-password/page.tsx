/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForgotPassword, isDoughminationError } from "@doughmination/react-api";
import { useTurnstile } from "@/lib/useTurnstile";
import * as s from "../auth.css";

const ForgotPassword: React.FC = () => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const turnstile = useTurnstile();
  const forgotPassword = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Please enter your username");
      return;
    }
    if (!turnstile.token) {
      setError("Please complete the security verification");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await forgotPassword.mutateAsync({
        username: username.trim(),
        turnstileToken: turnstile.token,
      });
      setSentTo(data?.sent_to ?? null);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(
        isDoughminationError(err)
          ? err.message
          : "Couldn't send the reset link. Please try again.",
      );
      // Turnstile tokens are single-use, so a retry needs a fresh challenge.
      turnstile.reset();
    } finally {
      setLoading(false);
    }
  };

  if (sentTo !== null) {
    return (
      <div className={s.card}>
        <div className={s.sentInner}>
          <div className={s.sentEmoji}>📬</div>
          <h2 className={s.sentTitle}>Reset link sent</h2>
          <p className={s.sentText}>We&apos;ve emailed a reset link to</p>
          <span className={s.maskedAddress}>{sentTo}</span>
          <p className={s.sentText}>
            The link expires in 15 minutes and can only be used once.
          </p>
          <Link href="/user/login" className={s.backLink}>
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={s.card}>
      <h2 className={s.heading}>Reset your password</h2>
      <p className={s.subtitle}>
        Enter your username and we&apos;ll email a reset link to the address on your account.
      </p>

      {(error || turnstile.error) && <div className={s.errorBox}>{error || turnstile.error}</div>}

      <form onSubmit={handleSubmit} className={s.form}>
        <div>
          <label htmlFor="username" className={s.fieldLabel}>
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            className={s.textInput}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            autoComplete="username"
          />
          <p className={s.helperText}>
            Not sure what your username is?{" "}
            <Link href="/user/forgot-username" className={s.blueLink}>
              Look it up with your email
            </Link>
            .
          </p>
        </div>

        <div className={s.turnstileBlock}>
          <label className={s.fieldLabel}>Security Verification</label>
          <div ref={turnstile.containerRef} className={s.turnstileCenter} />
          {!turnstile.loaded && (
            <div className={s.mutedNote}>Loading security verification...</div>
          )}
        </div>

        <button type="submit" className={s.submitBtn} disabled={loading || !turnstile.token}>
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <div className={s.linkRow}>
        <Link href="/user/login" className={s.blueLink}>
          ← Back to login
        </Link>
        <Link href="/user/signup" className={s.blueLink}>
          Create an account
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
