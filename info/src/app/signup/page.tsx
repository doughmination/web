"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";

import {
  page,
  card,
  title,
  subtitle,
  form,
  label,
  input,
  button,
  ghost,
  divider,
  error as errorClass,
} from "@styles/auth.css";

// Where PocketID lives. Its onboarding links look like <POCKETID>/st/<token>.
const POCKETID = process.env.NEXT_PUBLIC_POCKETID_URL || "https://doughmination.xyz";

// Accept a raw token, or a full pasted URL — pull the bit after /st/ either way.
function normalizeCode(raw: string): string {
  const trimmed = raw.trim();
  const marker = trimmed.lastIndexOf("/st/");
  const code = marker >= 0 ? trimmed.slice(marker + 4) : trimmed;
  return code.replace(/[^A-Za-z0-9._-]/g, "");
}

function SignupForm() {
  const params = useSearchParams();
  const [code, setCode] = useState(params.get("code") ?? "");
  const [err, setErr] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const clean = normalizeCode(code);
    if (!clean) {
      setErr("Enter your invite code.");
      return;
    }
    // Hand off to PocketID, which validates the token and runs passkey setup.
    window.location.href = `${POCKETID}/st/${encodeURIComponent(clean)}`;
  }

  return (
    <main className={page}>
      <div className={card}>
        <h1 className={title}>Sign up</h1>
        <p className={subtitle}>
          Enter the invite code you were given to set up your passkey.
        </p>

        <form className={form} onSubmit={handleSubmit}>
          <label className={label} htmlFor="code">Invite code</label>
          <input
            id="code"
            className={input}
            value={code}
            onChange={(e) => { setCode(e.target.value); setErr(""); }}
            placeholder="hqm4k9a1VubBGckh"
            autoComplete="off"
            autoFocus
          />
          {err ? <p className={errorClass}>{err}</p> : null}
          <button type="submit" className={button}>Continue →</button>
        </form>

        <p className={divider}>Already have an account?</p>
        <a href={POCKETID} className={ghost}>Log in</a>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
