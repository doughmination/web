import { config } from "../config.ts";
import { sql } from "../db/index.ts";
import { destroyAllSessions } from "../auth/session.ts";

interface PocketIdUser {
  id: string;
  username: string;
  disabled: boolean;
}

interface PocketIdUserPage {
  data: PocketIdUser[];
}

async function fetchDisabledUserIds(): Promise<string[]> {
  const disabledIds: string[] = [];
  const limit = 100;
  let page = 1;

  for (;;) {
    const url = new URL(`${config.oidc.issuer}/api/users`);
    url.searchParams.set("pagination[page]", String(page));
    url.searchParams.set("pagination[limit]", String(limit));

    const res = await fetch(url, {
      headers: { "X-API-KEY": config.pocketId.apiKey },
    });
    if (!res.ok) {
      throw new Error(
        `PocketID user list request failed: ${res.status} ${res.statusText}`,
      );
    }

    const body = (await res.json()) as PocketIdUserPage;
    for (const u of body.data) {
      if (u.disabled) disabledIds.push(u.id);
    }

    if (body.data.length < limit) break; // last page
    page++;
  }

  return disabledIds;
}

export async function pollDisabledUsers(): Promise<void> {
  if (!config.pocketId.apiKey) return;

  const disabledIds = await fetchDisabledUserIds();
  if (disabledIds.length === 0) return;

  const rows = await sql<{ id: string }[]>`
    SELECT id FROM users WHERE oidc_sub = ANY(${disabledIds})
  `;
  if (rows.length === 0) return;

  for (const row of rows) {
    await destroyAllSessions(row.id);
  }
  console.log(
    `pocketid-guard: revoked sessions for ${rows.length} disabled user(s)`,
  );
}

export function startPocketIdGuard(): void {
  if (!config.pocketId.apiKey) {
    console.log(
      "pocketid-guard: MUSIC_POCKETID_API_KEY not set, disabled-user polling is off",
    );
    return;
  }

  const run = () => {
    pollDisabledUsers().catch((err) => {
      console.error("pocketid-guard: poll failed", err);
    });
  };

  run(); // catch anyone already disabled before this process started
  setInterval(run, config.pocketId.pollIntervalMs);
}