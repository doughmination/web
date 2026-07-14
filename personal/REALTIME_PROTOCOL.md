# Realtime WebSocket protocol (`/v2/ws`)

How the site frontend (`public/js/realtime.js`, exposed as `window.DM`) talks to
the doughmination.uk API. This documents the **actual** protocol the API
implements (the old `/v2/lanyard/ws` op-code socket and `/v2/plural/ws` are
gone — there is now one socket).

---

## Transport

- **URL:** `wss://doughmination.uk/v2/ws`
- **Frames:** JSON `{ "type": string, "data": any }`, plus two bare-string
  control frames for keepalive (`"ping"` / `"pong"`).
- On connect the server sends `{ "type": "connection_established" }`.
- Unknown `type` values are ignored by the client (forward-compatible).

---

## Server → client

Pushed automatically, **no subscription needed**:

| `type`                 | `data` | Meaning |
|------------------------|--------|---------|
| `connection_established` | — | Socket is ready. |
| `fronters_update`      | same shape as `GET /v2/plural/fronters` (`{ members: [...] }`) | Current fronter list changed. Full list, not a diff. |
| `mental_state_update`  | mental-state object | Mental state changed. |
| `device_update`        | `{ device, level, charging, lowPowerMode, wifi, updated_at }` **or** `{ device, deleted: true }` | **One device at a time** (or a removal). |
| `force_refresh`        | `{ message }` | Admin-triggered; clients resync. |

Presence (opt-in, see below):

| `type`            | `data` | Meaning |
|-------------------|--------|---------|
| `init_state`      | `{ [userId]: presence, … }` | Sent right after you subscribe. A user **absent** here is offline. |
| `presence_update` | `<presence>` | One user's presence changed. |

Keepalive: server replies to the client's `"ping"` with the bare string
`"pong"`.

> ⚠️ **Open question — `presence_update` user id.** `init_state` is keyed by
> user id, but `presence_update.data` is a bare presence object. `realtime.js`
> currently derives the id defensively (`userId` / `user_id` / `id` /
> `user.id` / `discord_user.id`). Confirm the real field against the live
> socket and pin it down here.

> ⚠️ **Required — presence payload shape.** `discord.js` and `music.js` read
> presence through `DM` and expect **the same object shape the REST endpoint
> returns in its `data` field**, i.e.:
>
> ```jsonc
> { "user": { "id": "…", "username": "…", /* …profile… */ },
>   "presence": { "status": "online", "activities": [],
>                 "listening_to_spotify": true, "spotify": { /* … */ },
>                 "platform": { "desktop": true } },
>   "timezone": { … }, "badges": [], "clientBadges": [],
>   "connected_accounts": [], "pronoundb": "…", "wishlist": [] }
> ```
>
> Both `init_state` values and `presence_update.data` **must** be this object
> (not a raw Lanyard frame). The client wraps it as `{ id, data }` internally.
> `music.js` reads `data.presence.spotify`; `discord.js` reads `data.user` +
> `data.presence`. If the socket sends a different shape, presence renders blank.

---

## Client → server

**Presence subscription** (the only thing the client sends besides keepalive):

```js
ws.send(JSON.stringify({ type: "subscribe", ids: ["userid1", "userid2"] }));
// or everyone:
ws.send(JSON.stringify({ type: "subscribe", all: true }));
```

You immediately receive `init_state` for those users, then `presence_update`
frames for them only. The client batches every `DM.on("presence:…")` in a tick
into **one** `subscribe` frame.

**Keepalive:** send the bare string `"ping"` (not JSON); expect `"pong"`.

---

## How the client uses REST (request budget)

The API is rate-sensitive, so `realtime.js` is deliberately frugal:

- **No interval polling anywhere.** The socket is the source of truth.
- Auto feeds (fronters/devices/mental) hit REST **at most once for first paint**,
  and **once on reconnect** to resync anything missed while disconnected.
- Presence paints from `init_state` over the socket — **no REST** — whenever the
  socket is connected; it only falls back to `GET /v2/discord/users/:id` if the
  socket is unavailable.
- **On-demand lookups are cached** (`DM.request`, below): in-memory for the
  session **and** mirrored to `sessionStorage`, so soft-navigating between pages
  — or reloading — reuses the result with **zero** new requests until the TTL
  expires.
- Background tabs open no socket and make no requests; they prime on first show.

REST endpoints used only for paint / resync / on-demand:

| Purpose | Endpoint | Client cache |
|---------|----------|--------------|
| fronters first paint / resync   | `GET /v2/plural/fronters` | — (socket feed) |
| devices first paint / resync    | `GET /v2/devices` | — (socket feed; deltas merged) |
| presence fallback only          | `GET /v2/discord/users/:id` | — |
| minecraft profile (per card)    | `GET /v2/minecraft/general/:uuid` | 30 min, persisted |
| guild card                      | `GET /v2/discord/guilds/:id` | 5 min, persisted |
| member (on demand)              | `GET /v2/plural/member/:name` | opt-in |
| contrib (on demand)             | `GET /v2/contribapi` | opt-in |

> **Optional server win:** if the server pushed current `fronters` / `devices` /
> `mental` state in (or right after) `connection_established`, the client could
> drop the first-paint REST calls entirely and hit REST *zero* times for those
> feeds. Not required — noted for later.

### Caching notes from the API (so the client doesn't fight it)

- Presence: never cached, always live (socket).
- PluralKit (fronters/members/system): 30s in-memory, busted instantly on
  change → socket is truth, REST may lag ≤30s.
- Profiles/badges: KV ~300s (jittered); `?fresh` / `?nocache` / `?refresh` bypass.
- Devices: no read cache; prefer the socket.
- JSON is `Cache-Control: no-store`; only `/docs` and `/v2/contribapi` are
  edge-cached (1h).

---

## Client API (`window.DM`)

Feature scripts never touch the socket — they use `DM`:

```js
DM.on("fronters", render);              // { members: [...] }
DM.on("devices",  render);              // merged { [deviceId]: record } map
DM.on("mental",   render);              // mental-state object
DM.on("presence:" + id, render);        // { id, data: <presence> }; opt-in
DM.on("force_refresh", () => {/*…*/});  // admin refresh signal

DM.get("devices");                      // cached value or undefined
await DM.request("minecraft", { uuid }, { maxAge: 1800000, persist: true });
DM.status;                              // "connecting" | "open" | "closed"
await DM.ready;                         // resolves on connection_established
```

`DM.on` fires immediately with the cached value if one exists, then on every
update. It is **page-scoped**: subscriptions auto-clear on soft navigation.

`DM.request(resource, params, opts)` — `opts.maxAge` (ms) enables caching;
`opts.persist` also mirrors to `sessionStorage`. In-flight duplicate requests
for the same key are de-duplicated.

### Topic → server frame mapping

| DM topic         | fed by | consumers |
|------------------|--------|-----------|
| `fronters`       | `fronters_update` (+ REST paint) | `fronting.js` |
| `devices`        | `device_update` deltas onto REST paint map | `devices.js` |
| `mental`         | `mental_state_update` (no REST paint wired) | — |
| `presence:<id>`  | `init_state` / `presence_update` after `subscribe` | `discord.js`, `music.js` |
| `force_refresh`  | `force_refresh` | — |
