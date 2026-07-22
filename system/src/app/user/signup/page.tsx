/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useSignup,
  useCorrectEmail,
  useDoughminationClient,
  isDoughminationError,
} from "@doughmination/react-api";
import { TURNSTILE_SITE_KEY, loadTurnstileScript } from "@/lib/turnstile";
import * as s from "../auth.css";

type Availability = "unknown" | "checking" | "available" | "taken";

/** Loose client-side sanity check only — the API does the real validation. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignUp: React.FC = () => {
  const client = useDoughminationClient();
  const signup = useSignup();
  const correctEmail = useCorrectEmail();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [availability, setAvailability] = useState<Availability>("unknown");
  const [emailAvailability, setEmailAvailability] = useState<Availability>("unknown");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const [created, setCreated] = useState(false);
  // Returned by signup; the only thing that authorises correcting a mistyped
  // address without a password. Deliberately kept in memory only — it dies
  // with the tab, which is the point.
  const [correctionToken, setCorrectionToken] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(true);
  const [correcting, setCorrecting] = useState(false);
  const [correctedEmail, setCorrectedEmail] = useState("");
  const [correctionMessage, setCorrectionMessage] = useState("");
  const [correctionError, setCorrectionError] = useState("");
  const [correctionBusy, setCorrectionBusy] = useState(false);

  const router = useRouter();
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  // Load Turnstile script
  useEffect(() => {
    loadTurnstileScript(
      () => setTurnstileLoaded(true),
      () => {
        console.error("Failed to load Turnstile script");
        setError("Failed to load security verification. Please refresh the page.");
      },
    );

    return () => {
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          // widget already gone
        }
        widgetId.current = null;
      }
    };
  }, []);

  // Render Turnstile widget when loaded
  useEffect(() => {
    if (turnstileLoaded && turnstileRef.current && !widgetId.current) {
      try {
        widgetId.current = window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => {
            setTurnstileToken(token);
            setError("");
          },
          "error-callback": () => {
            setError("Security verification failed. Please try again.");
            setTurnstileToken(null);
          },
          "expired-callback": () => {
            setError("Security verification expired. Please verify again.");
            setTurnstileToken(null);
          },
          theme: "auto",
          size: "normal",
        });
      } catch (err) {
        console.error("Error rendering Turnstile:", err);
        setError("Failed to initialize security verification.");
      }
    }
  }, [turnstileLoaded]);

  // Debounced username availability check
  useEffect(() => {
    const name = username.trim();
    if (!name) {
      setAvailability("unknown");
      return;
    }

    setAvailability("checking");
    const timeout = setTimeout(async () => {
      try {
        const data = await client.checkUsername(name);
        setAvailability(data.available ? "available" : "taken");
      } catch {
        setAvailability("unknown");
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [username, client]);

  // Debounced email availability check, mirroring the username one above.
  // Only fires once the address looks well-formed, so we aren't querying on
  // every keystroke of a half-typed address.
  useEffect(() => {
    const value = email.trim();
    if (!value || !EMAIL_PATTERN.test(value)) {
      setEmailAvailability("unknown");
      return;
    }

    setEmailAvailability("checking");
    const timeout = setTimeout(async () => {
      try {
        const data = await client.checkEmail(value);
        setEmailAvailability(data.available ? "available" : "taken");
      } catch {
        setEmailAvailability("unknown");
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [email, client]);

  const resetTurnstile = () => {
    if (widgetId.current && window.turnstile) {
      window.turnstile.reset(widgetId.current);
      setTurnstileToken(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      setError("Please enter a username and password");
      return;
    }

    if (availability === "taken") {
      setError("That username is already taken");
      return;
    }

    if (!EMAIL_PATTERN.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    if (emailAvailability === "taken") {
      setError("That email address is already in use");
      return;
    }

    if (password.length < 10) {
      setError("Password must be at least 10 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!turnstileToken) {
      setError("Please complete the security verification");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const json = await signup.mutateAsync({
        username: username.trim(),
        password,
        email: email.trim(),
        displayName: displayName.trim() || undefined,
        turnstileToken,
      });

      setCorrectionToken(json?.correction_token ?? null);
      setEmailSent(json?.email_sent !== false);
      setCreated(true);
      // No auto-redirect any more: the user has to act on the confirmation
      // email, and may need the "wrong address?" escape hatch on this screen.
    } catch (err: unknown) {
      console.error("Sign up error:", err);
      setError(
        isDoughminationError(err)
          ? err.message
          : "Network error. Please check your connection and try again.",
      );
      resetTurnstile();
    } finally {
      setLoading(false);
    }
  };

  const handleCorrectEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setCorrectionError("");
    setCorrectionMessage("");

    if (!correctionToken) {
      setCorrectionError("This correction link has expired. Contact @doughmination for help.");
      return;
    }
    if (!EMAIL_PATTERN.test(correctedEmail.trim())) {
      setCorrectionError("Please enter a valid email address");
      return;
    }
    if (!turnstileToken) {
      setCorrectionError("Please complete the security verification");
      return;
    }

    setCorrectionBusy(true);
    try {
      await correctEmail.mutateAsync({
        correctionToken,
        email: correctedEmail.trim(),
        turnstileToken,
      });

      setEmail(correctedEmail.trim());
      setCorrectionMessage(`Confirmation email sent to ${correctedEmail.trim()}.`);
      setCorrecting(false);
      setCorrectedEmail("");
      resetTurnstile();
    } catch (err) {
      console.error("Correct email error:", err);
      setCorrectionError(
        isDoughminationError(err) ? err.message : "Network error. Please try again.",
      );
      resetTurnstile();
    } finally {
      setCorrectionBusy(false);
    }
  };

  // Success screen — the account exists but is unconfirmed until the emailed
  // link is used, so this screen has to explain that and offer a way to fix a
  // mistyped address.
  if (created) {
    return (
      <div className={s.card}>
        <div className={s.sentInner}>
          <div className={s.sentEmoji}>{emailSent ? "📬" : "⚠️"}</div>
          <h2 className={s.sentTitle}>Account created</h2>
          <p className={s.welcomeName}>{displayName.trim() || username.trim()}</p>

          {emailSent ? (
            <>
              <p className={s.sentText}>We&apos;ve sent a confirmation link to</p>
              <span className={s.maskedAddress}>{email.trim()}</span>
              <p className={s.sentText}>
                Click it to finish setting up your account — you won&apos;t be able to log in until
                you do.
              </p>
            </>
          ) : (
            <p className={s.sentText}>
              Your account exists, but we couldn&apos;t send the confirmation email. Try correcting
              the address below, or contact @doughmination.
            </p>
          )}

          <p className={s.helperText}>
            The link expires in 24 hours, and unconfirmed accounts are removed after 24 hours.
          </p>

          {correctionMessage && <div className={s.successBox}>{correctionMessage}</div>}

          {!correcting ? (
            <>
              <button
                type="button"
                className={s.blueLink}
                style={{ background: "none", border: "none", cursor: "pointer" }}
                onClick={() => {
                  setCorrecting(true);
                  setCorrectionError("");
                  setCorrectionMessage("");
                }}
              >
                Wrong email address? Fix it here
              </button>
              <Link href="/user/login" className={s.backLink}>
                Go to login
              </Link>
            </>
          ) : (
            <form onSubmit={handleCorrectEmail} className={s.form} style={{ width: "100%" }}>
              {correctionError && <div className={s.errorBox}>{correctionError}</div>}
              <div>
                <label htmlFor="corrected-email" className={s.fieldLabel}>
                  Correct email address
                </label>
                <input
                  id="corrected-email"
                  type="email"
                  placeholder="you@example.com"
                  className={s.textInput}
                  value={correctedEmail}
                  onChange={(e) => setCorrectedEmail(e.target.value)}
                  disabled={correctionBusy}
                  autoComplete="email"
                />
                <p className={s.helperText}>
                  You can only do this before confirming, and only from this page.
                </p>
              </div>

              <div className={s.turnstileBlock}>
                <label className={s.fieldLabel}>Security Verification</label>
                <div ref={turnstileRef} className={s.turnstileCenter} />
              </div>

              <button
                type="submit"
                className={s.submitBtn}
                disabled={correctionBusy || !turnstileToken}
              >
                {correctionBusy ? "Updating..." : "Update and resend"}
              </button>
              <button
                type="button"
                className={s.blueLink}
                style={{ background: "none", border: "none", cursor: "pointer" }}
                onClick={() => setCorrecting(false)}
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={s.card}>
      <h2 className={s.heading}>Sign Up</h2>

      {error && <div className={s.errorBox}>{error}</div>}

      <form onSubmit={handleSubmit} className={s.form}>
        <div>
          <label htmlFor="username" className={s.fieldLabel}>
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Choose a username"
            className={s.textInput}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            autoComplete="username"
          />
          {username.trim() && (
            <div className={s.mutedNote} style={{ textAlign: "left", marginTop: "0.25rem" }}>
              {availability === "checking" && "Checking availability..."}
              {availability === "available" && "✓ Username is available"}
              {availability === "taken" && "✗ Username is already taken"}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="email" className={s.fieldLabel}>
            Email
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
          {email.trim() && !EMAIL_PATTERN.test(email.trim()) && (
            <p className={s.hintMuted}>Enter a full email address, e.g. you@example.com</p>
          )}
          {emailAvailability === "checking" && <p className={s.hintMuted}>Checking...</p>}
          {emailAvailability === "available" && <p className={s.hintOk}>&#10003; Email is available</p>}
          {emailAvailability === "taken" && (
            <p className={s.hintBad}>&#10007; That email already has an account</p>
          )}
          <p className={s.helperText}>
            We&apos;ll send a confirmation link here — you&apos;ll need it to log in. Used for
            account recovery, and you can change it later from your profile.
          </p>
        </div>

        <div>
          <label htmlFor="displayName" className={s.fieldLabel}>
            Display Name (optional)
          </label>
          <input
            id="displayName"
            type="text"
            placeholder="How your name is shown"
            className={s.textInput}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password" className={s.fieldLabel}>
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="At least 10 characters"
            className={s.textInput}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="new-password"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className={s.fieldLabel}>
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            className={s.textInput}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            autoComplete="new-password"
          />
        </div>

        {/* Turnstile Widget */}
        <div className={s.turnstileBlock}>
          <label className={s.fieldLabel}>Security Verification</label>
          <div ref={turnstileRef} className={s.turnstileCenter} />
          {!turnstileLoaded && (
            <div className={s.mutedNote}>Loading security verification...</div>
          )}
        </div>

        <button
          type="submit"
          className={s.submitBtn}
          disabled={loading || !turnstileToken || availability === "taken"}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <div className={s.bottomNote}>
        Already have an account?{" "}
        <Link href="/user/login" className={s.blueLink}>
          Log in here
        </Link>
      </div>

      <div className={s.loadingNote}>
        New accounts start without any roles — the system owner assigns admin/pet roles after
        you sign up.
      </div>
    </div>
  );
};

export default function SignUpPage() {
  return <SignUp />;
}