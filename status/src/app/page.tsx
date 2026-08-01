/* status/src/app/page.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/* app/page.tsx — public, read-only status. */

import {
  page,
  header,
  title,
  subtitle,
  actions,
  btnSecondary,
  footer,
} from "@styles/status.css";
import StatusGrid from "@app/StatusGrid";
import { readSession } from "@lib/session";

// Always render fresh — this is a live status view.
export const dynamic = "force-dynamic";

const siteName = "doughmination.org";

export default async function Page() {
  const session = await readSession();

  return (
    <main className={page}>
      <div className={actions}>
        {session ? (
          <a className={btnSecondary} href="/admin">
            Admin
          </a>
        ) : (
          <a className={btnSecondary} href="/api/auth/login">
            Log in
          </a>
        )}
      </div>

      <header className={header}>
        <h1 className={title}>{siteName}</h1>
        <p className={subtitle}>Live status of everything I host.</p>
      </header>

      <StatusGrid />

      <footer className={footer}>
        © {new Date().getFullYear()} Doughmination System
      </footer>
    </main>
  );
}
