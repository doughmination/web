/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { API_BASE, errorMessage } from "@/lib/api";
import { useTurnstile } from "@/lib/useTurnstile";
import * as s from "../auth.css";

const ForgotUsername: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const turnstile = useTurnstile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (!turnstile.token) {
      setError("Please complete the security verification");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/forgot-username`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          turnstile_token: turnstile.token,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(errorMessage(data, "Couldn't send that email. Please try again."));
        turnstile.reset();
        return;
      }

      setSentTo(data?.sent_to ?? null);
    } catch (err) {
      console.error("Forgot username error:", err);
      setError("Network error. Please check your connection and try again.");
      turnstile.reset();
    } finally {
      setLoading(false);
    }
  };

  if (sentTo !== null) {
    return (
      <div className={s.card}>
        <div className={s.sentInner}>
          <div className={s.sentEmoji}>✉️</div>
          <h2 className={s.sentTitle}>Username sent</h2>
          <p className={s.sentText}>We&apos;ve emailed your username to</p>
          <span className={s.maskedAddress}>{sentTo}</span>
          <p className={s.sentText}>
            Once you have it, you can reset your password if you need to.
          </p>
          <Link href="/user/forgot-password" className={s.backLink}>
            Reset my password
          </Link>
          <Link href="/user/login" className={s.blueLink}>
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={s.card}>
      <h2 className={s.heading}>Forgot your username?</h2>
      <p className={s.subtitle}>
        Enter the email address on your account and we&apos;ll send your username to it.
      </p>

      {(error || turnstile.error) && <div className={s.errorBox}>{error || turnstile.error}</div>}

      <form onSubmit={handleSubmit} className={s.form}>
        <div>
          <label htmlFor="email" className={s.fieldLabel}>
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className={s.textInput}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
            inputMode="email"
          />
        </div>

        <div className={s.turnstileBlock}>
          <label className={s.fieldLabel}>Security Verification</label>
          <div ref={turnstile.containerRef} className={s.turnstileCenter} />
          {!turnstile.loaded && (
            <div className={s.mutedNote}>Loading security verification...</div>
          )}
        </div>

        <button type="submit" className={s.submitBtn} disabled={loading || !turnstile.token}>
          {loading ? "Sending..." : "Email me my username"}
        </button>
      </form>

      <div className={s.linkRow}>
        <Link href="/user/login" className={s.blueLink}>
          ← Back to login
        </Link>
        <Link href="/user/forgot-password" className={s.blueLink}>
          Reset password
        </Link>
      </div>
    </div>
  );
};

export default ForgotUsername;
