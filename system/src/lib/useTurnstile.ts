/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TURNSTILE_SITE_KEY, loadTurnstileScript } from "./turnstile";

export interface UseTurnstileResult {
  /** Attach to the <div> the widget should render into. */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Non-null once the user has passed the challenge. */
  token: string | null;
  /** False until the Cloudflare script has loaded. */
  loaded: boolean;
  /** Set when the widget errors, expires, or fails to load. */
  error: string;
  /** Clear the widget and require a fresh challenge. Call after a failed
   *  submit — Turnstile tokens are single-use server-side. */
  reset: () => void;
}

/**
 * Renders a Turnstile widget and tracks its token.
 *
 * The login page predates this and still inlines the same logic; the recovery
 * pages share it here rather than copying it three more times.
 */
export function useTurnstile(): UseTurnstileResult {
  const [token, setToken] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    loadTurnstileScript(
      () => setLoaded(true),
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

  useEffect(() => {
    if (!loaded || !containerRef.current || widgetId.current) return;

    try {
      widgetId.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (t: string) => {
          setToken(t);
          setError("");
        },
        "error-callback": () => {
          setError("Security verification failed. Please try again.");
          setToken(null);
        },
        "expired-callback": () => {
          setError("Security verification expired. Please verify again.");
          setToken(null);
        },
        theme: "auto",
        size: "normal",
      });
    } catch (err) {
      console.error("Error rendering Turnstile:", err);
      setError("Failed to initialize security verification.");
    }
  }, [loaded]);

  const reset = useCallback(() => {
    if (widgetId.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetId.current);
      } catch {
        // widget already gone
      }
    }
    setToken(null);
  }, []);

  return { containerRef, token, loaded, error, reset };
}
