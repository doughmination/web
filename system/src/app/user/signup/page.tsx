/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE, errorMessage, unwrap } from "@/lib/api";
import { TURNSTILE_SITE_KEY, loadTurnstileScript } from "@/lib/turnstile";
import * as s from "../auth.css";

type Availability = "unknown" | "checking" | "available" | "taken";

const SignUp: React.FC = () => {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [availability, setAvailability] = useState<Availability>("unknown");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const [created, setCreated] = useState(false);

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
        const res = await fetch(
          `${API_BASE}/users/check-username?username=${encodeURIComponent(name)}`,
        );
        if (res.ok) {
          const data = unwrap(await res.json());
          setAvailability(data.available ? "available" : "taken");
        } else {
          setAvailability("unknown");
        }
      } catch {
        setAvailability("unknown");
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [username]);

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
      const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
          display_name: displayName.trim() || undefined,
          turnstile_token: turnstileToken,
        }),
      });

      const json = await res.json().catch(() => null);

      if (res.ok && json?.success !== false) {
        setCreated(true);
        // Send them to login after a short pause
        setTimeout(() => router.replace("/user/login"), 2500);
      } else {
        setError(errorMessage(json, "Sign up failed. Please try again."));
        resetTurnstile();
      }
    } catch (err: unknown) {
      console.error("Sign up error:", err);
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Network error. Please check your connection and try again.",
      );
      resetTurnstile();
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (created) {
    return (
      <div className={s.card}>
        <div className={s.welcomeInner}>
          <div className={s.welcomeEmoji}>🎉</div>
          <h2 className={s.welcomeTitle}>Account created!</h2>
          <p className={s.welcomeName}>{displayName.trim() || username.trim()}</p>
          <p className={s.mutedNote}>
            Roles (admin, pet, etc.) are granted by the system owner after sign up.
          </p>
          <div className={s.spinnerWrap}>
            <div className={s.spinner}></div>
          </div>
          <p className={s.mutedNote}>Taking you to the login page...</p>
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