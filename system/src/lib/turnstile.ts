/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

export const TURNSTILE_SITE_KEY = "0x4AAAAAAB08ZhSxKn5rAD3d";

export interface TurnstileApi {
  render: (
    container: string | HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "error-callback"?: () => void;
      "expired-callback"?: () => void;
      theme?: "light" | "dark" | "auto";
      size?: "normal" | "compact";
    },
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile: TurnstileApi;
  }
}

/** Load the Cloudflare Turnstile script (no-op if already present). */
export function loadTurnstileScript(onLoad: () => void, onError: () => void): void {
  if (typeof window !== "undefined" && window.turnstile) {
    onLoad();
    return;
  }

  const existing = document.querySelector<HTMLScriptElement>("script[data-turnstile]");
  if (existing) {
    existing.addEventListener("load", onLoad);
    return;
  }

  const script = document.createElement("script");
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
  script.async = true;
  script.defer = true;
  script.dataset.turnstile = "true";
  script.onload = onLoad;
  script.onerror = onError;
  document.head.appendChild(script);
}
