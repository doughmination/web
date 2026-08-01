/* status/src/app/admin/page.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/* app/admin/page.tsx — OIDC-gated. Guards, then renders the manager. */

import { redirect } from "next/navigation";

import {
  page,
  header,
  title,
  subtitle,
  actions,
  btnSecondary,
  footer,
} from "@styles/status.css";
import AdminPanel from "@app/admin/AdminPanel";
import {
  readSession,
  isAdmin,
} from "@lib/session";
import { listServices } from "@lib/store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await readSession();

  // Not logged in: send them through PocketID and back here.
  if (!session) {
    redirect("/api/auth/login?returnTo=/admin");
  }
  // Logged in but not on the allowlist.
  if (!isAdmin(session)) {
    return (
      <main className={page}>
        <header className={header}>
          <h1 className={title}>No access</h1>
          <p className={subtitle}>
            Signed in as {session.username}, but not an admin.
          </p>
        </header>
        <div className={actions}>
          <a className={btnSecondary} href="/api/auth/logout">
            Log out
          </a>
        </div>
      </main>
    );
  }

  const services = await listServices();

  return (
    <main className={page}>
      <div className={actions}>
        <a className={btnSecondary} href="/">
          View status
        </a>
        <a className={btnSecondary} href="/api/auth/logout">
          Log out
        </a>
      </div>

      <header className={header}>
        <h1 className={title}>Admin</h1>
        <p className={subtitle}>
          Signed in as {session.username} — add or remove monitored services.
        </p>
      </header>

      <AdminPanel initialServices={services} />

      <footer className={footer}>
        © {new Date().getFullYear()} Doughmination System
      </footer>
    </main>
  );
}
