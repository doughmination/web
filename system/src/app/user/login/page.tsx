/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { unwrap } from "@/lib/api";
import { TURNSTILE_SITE_KEY, loadTurnstileScript } from "@/lib/turnstile";
import * as s from "../auth.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [, setWelcomeUsername] = useState("");
  const [welcomeDisplayName, setWelcomeDisplayName] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  const from = searchParams?.get("from") || "/";

  // Load Turnstile script
  useEffect(() => {
    loadTurnstileScript(
      () => setTurnstileLoaded(true),
      () => {
        console.error("Failed to load Turnstile script");
        setError("Failed to load security verification. Please refresh the page.");
      },
    );

    // Cleanup function
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
            setError(""); // Clear any previous errors
          },
          "error-callback": () => {
            setError("Security verification failed. Please try again.");
            setTurnstileToken(null);
          },
          "expired-callback": () => {
            setError("Security verification expired. Please verify again.");
            setTurnstileToken(null);
          },
          theme: "auto", // Automatically match the page theme
          size: "normal",
        });
      } catch (err) {
        console.error("Error rendering Turnstile:", err);
        setError("Failed to initialize security verification.");
      }
    }
  }, [turnstileLoaded]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic form validation
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    // Check for Turnstile token
    if (!turnstileToken) {
      setError("Please complete the security verification");
      return;
    }

    setLoading(true);
    setError("");

    const redirect = () => {
      const redirectTo = from === "/admin/login" ? "/admin/dash" : from;
      router.replace(redirectTo);
    };

    try {
      const res = await fetch("https://doughmination.uk/v2/plural/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          turnstile_token: turnstileToken,
        }),
      });

      // Read the response as text first to handle any parsing errors
      const responseText = await res.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse login response:", parseError);
        throw new Error("Invalid response from server. Please try again.");
      }

      if (res.ok && data.access_token) {
        // Store the token
        localStorage.setItem("token", data.access_token);

        // Fetch user info for welcome message
        try {
          const userResponse = await fetch("https://doughmination.uk/v2/plural/user_info", {
            headers: {
              Authorization: `Bearer ${data.access_token}`,
            },
          });

          if (userResponse.ok) {
            const userData = unwrap(await userResponse.json());
            setWelcomeUsername(userData.username);
            setWelcomeDisplayName(userData.display_name || userData.username);

            // Show welcome message
            setShowWelcome(true);

            // Redirect after 2 seconds
            setTimeout(redirect, 2000);
          } else {
            // If we can't get user info, just redirect immediately
            redirect();
          }
        } catch (userError) {
          console.error("Error fetching user info:", userError);
          // Still redirect on error
          redirect();
        }
      } else {
        // Handle login failure
        const errorMessage =
          data.detail || data.message || "Login failed. Please check your credentials.";
        setError(errorMessage);

        // Reset Turnstile on login failure
        if (widgetId.current && window.turnstile) {
          window.turnstile.reset(widgetId.current);
          setTurnstileToken(null);
        }
      }
    } catch (err: unknown) {
      console.error("Login error:", err);

      // Better error message handling
      let errorMessage = "Network error. Please check your connection and try again.";

      if (err instanceof Error && err.message) {
        errorMessage = err.message;
      } else if (err && String(err) !== "[object Object]") {
        errorMessage = String(err);
      }

      setError(errorMessage);

      // Reset Turnstile on error
      if (widgetId.current && window.turnstile) {
        window.turnstile.reset(widgetId.current);
        setTurnstileToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Show welcome screen after successful login
  if (showWelcome) {
    return (
      <div className={s.card}>
        <div className={s.welcomeInner}>
          <div className={s.welcomeEmoji}>👋</div>
          <h2 className={s.welcomeTitle}>Welcome back!</h2>
          <p className={s.welcomeName}>{welcomeDisplayName}</p>
          <div className={s.spinnerWrap}>
            <div className={s.spinner}></div>
          </div>
          <p className={s.mutedNote}>Redirecting you now...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={s.card}>
      <h2 className={s.heading}>User Login</h2>

      {error && <div className={s.errorBox}>{error}</div>}

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
        </div>

        <div>
          <label htmlFor="password" className={s.fieldLabel}>
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            className={s.textInput}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
          />
        </div>

        {/* Forgot Password Link */}
        <div className={s.linkRight}>
          <Link href="/user/forgot-password" className={s.blueLink}>
            Forgot password?
          </Link>
        </div>

        {/* Turnstile Widget */}
        <div className={s.turnstileBlock}>
          <label className={s.fieldLabel}>Security Verification</label>
          <div ref={turnstileRef} className={s.turnstileCenter} />
          {!turnstileLoaded && (
            <div className={s.mutedNote}>Loading security verification...</div>
          )}
        </div>

        <button type="submit" className={s.submitBtn} disabled={loading || !turnstileToken}>
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      {/* Sign Up Link */}
      <div className={s.bottomNote}>
        Don&apos;t have an account?{" "}
        <Link href="/user/signup" className={s.blueLink}>
          Sign up here
        </Link>
      </div>

      {loading && <div className={s.loadingNote}>Please wait while we log you in...</div>}
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