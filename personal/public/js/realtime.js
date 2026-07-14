/* realtime.js — one shared realtime client for the whole site.
 *
 * Loaded once, globally, in layout.tsx (right after core.js) so a single
 * WebSocket to the API serves every page. Feature scripts (fronting, devices,
 * music, discord, …) stop polling and subscribe through window.DM instead:
 *
 *     const off = DM.on("devices", render);          // fires with current value, then updates
 *     const off = DM.on("fronters", render);
 *     const off = DM.on("presence:" + id, render);    // opt-in, keyed feed
 *     await DM.request("minecraft", { uuid });        // on-demand REST lookup
 *
 * REQUEST BUDGET (this is deliberate — the API is rate-sensitive):
 *   - There is NO interval polling. Ever.
 *   - REST is hit at most ONCE per feed for the first paint, and once per feed
 *     on a *reconnect* to resync anything missed while disconnected.
 *   - The socket carries every live update after that. Ping/pong keepalive is a
 *     socket frame, not a REST call.
 *   - Values are cached on `window.DM` for the whole session, so soft-navigating
 *     between pages re-uses the cached value with zero new requests.
 *   - Background tabs never open the socket or fetch; they prime on first show.
 *
 * Wire protocol (see REALTIME_PROTOCOL.md): frames are JSON `{ type, data }`.
 *   server -> client: connection_established | fronters_update |
 *     mental_state_update | device_update | presence_update | init_state |
 *     force_refresh ; keepalive reply is the literal string "pong".
 *   client -> server: { type:"subscribe", ids:[…] } | { type:"subscribe", all:true }
 *     ; keepalive is the literal string "ping".
 *
 * Subscriptions are page-scoped: cleared on soft navigation via the same
 * ctpClearPageState() hook core.js uses to sweep per-page intervals, so a page
 * that unmounts stops receiving. realtime.js itself is global and never torn
 * down, which is what keeps the one socket alive across navigations.
 */
(function () {
  "use strict";

  if (window.DM) return; // guard against double-load

  var WS_URL = "wss://doughmination.uk/v2/ws";
  var REST_BASE = "https://doughmination.uk/v2";
  var HEARTBEAT_MS = 25000;
  var PONG_GRACE_MS = 10000;
  var BACKOFF_MAX_MS = 30000;

  // Singleton feeds pushed automatically by the server. Maps the DM topic to the
  // REST endpoint used ONLY for first paint + reconnect resync. A topic without
  // a `url` gets live socket updates but no REST paint (endpoint not wired yet).
  var SINGLETON = {
    fronters: { url: REST_BASE + "/plural/fronters", pick: function (j) { return j; } },
    devices:  { url: REST_BASE + "/devices",         pick: function (j) { return seedDevices(j); } },
    mental:   { url: null,                            pick: function (j) { return j; } },
  };
  // On-demand REST lookups (never over the socket in this protocol).
  var RESOURCES = {
    minecraft: { url: function (p) { return REST_BASE + "/minecraft/general/" + encodeURIComponent(p.uuid); }, pick: function (j) { return j && j.data; } },
    member:    { url: function (p) { return REST_BASE + "/plural/member/" + encodeURIComponent(p.name); },     pick: function (j) { return j; } },
    guild:     { url: function (p) { return REST_BASE + "/discord/guilds/" + encodeURIComponent(p.id); },      pick: function (j) { return j && j.data; } },
    contrib:   { url: function () { return REST_BASE + "/contribapi"; },                                       pick: function (j) { return j; } },
  };

  // ---- internal state --------------------------------------------------------
  var ws = null;
  var status = "connecting";        // "connecting" | "open" | "closed"
  var everConnected = false;
  var snapshot = {};                // topic -> last known value (session cache)
  var primed = {};                  // topic -> true once first paint has landed
  var subs = {};                    // topic -> [handler, …]
  var pageScoped = [];              // unsubscribe fns cleared on soft-nav
  var deviceMap = {};               // merged device state (device id -> record)
  var presenceIds = {};             // discord id -> subscriber count
  var subscribeQueued = false;      // debounce for the presence subscribe frame
  var backoff = 1000;
  var pingTimer = null;
  var pongTimer = null;
  var reconnectTimer = null;
  var readyResolve;
  var ready = new Promise(function (res) { readyResolve = res; });

  // ---- pub/sub ---------------------------------------------------------------
  function emit(topic, value) {
    snapshot[topic] = value;
    primed[topic] = true;
    var list = subs[topic];
    if (!list) return;
    list.slice().forEach(function (h) {
      try { h(value); } catch { /* a bad handler shouldn't kill the feed */ }
    });
  }

  function subscribe(topic, handler) {
    (subs[topic] || (subs[topic] = [])).push(handler);

    // Late subscribers get the cached value immediately — no request.
    if (Object.prototype.hasOwnProperty.call(snapshot, topic)) {
      try { handler(snapshot[topic]); } catch {}
    }

    // Presence topics ("presence:<id>") are opt-in: track the id and (re)send
    // the subscribe frame. No REST unless the socket can't deliver.
    var pid = presenceKey(topic);
    if (pid) {
      presenceIds[pid] = (presenceIds[pid] || 0) + 1;
      if (status === "open") queueSubscribe();
    }

    // First paint: at most one REST fetch, and only when visible.
    primeOnce(topic);

    var off = function () {
      var list = subs[topic];
      if (list) {
        var i = list.indexOf(handler);
        if (i !== -1) list.splice(i, 1);
        if (!list.length) delete subs[topic];
      }
      if (pid && presenceIds[pid]) {
        if (--presenceIds[pid] <= 0) { delete presenceIds[pid]; if (status === "open") queueSubscribe(); }
      }
    };
    return off;
  }

  function presenceKey(topic) {
    return topic.indexOf("presence:") === 0 ? topic.slice("presence:".length) : null;
  }

  // ---- first paint / resync (the only REST this client makes for feeds) ------
  function primeOnce(topic) {
    if (primed[topic]) return;            // already have a value
    if (document.hidden) return;          // wait until the tab is actually shown
    var pid = presenceKey(topic);
    if (pid) {
      // Presence paints from the socket's init_state when we're connected;
      // only fall back to REST if the socket isn't up.
      if (status === "open") return;
      fetchInto(topic, REST_BASE + "/discord/users/" + encodeURIComponent(pid), function (j) {
        return j && j.data ? { id: pid, data: j.data } : null;
      });
      return;
    }
    var spec = SINGLETON[topic];
    if (spec && spec.url) fetchInto(topic, spec.url, spec.pick);
  }

  // Resync a topic we already have subscribers for (used on reconnect / force
  // refresh to catch changes missed while the socket was down). One request.
  function resync(topic) {
    if (document.hidden) return;
    var spec = SINGLETON[topic];
    if (spec && spec.url) fetchInto(topic, spec.url, spec.pick, true);
    // presence resyncs for free via the subscribe -> init_state round-trip.
  }

  function fetchInto(topic, url, pick, force) {
    fetch(url, { headers: { Accept: "application/json" } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (j == null) return;
        // Don't clobber a fresher socket value that arrived while we were
        // fetching (unless this is an explicit forced resync).
        if (!force && primed[topic] && status === "open") return;
        var v = pick(j);
        if (v != null) emit(topic, v);
      })
      .catch(function () { /* keep whatever we have */ });
  }

  function primeVisibleSubs() {
    Object.keys(subs).forEach(primeOnce);
  }

  // ---- device delta merge ----------------------------------------------------
  // Initial REST returns a full map keyed by device id; socket sends one device
  // at a time (or a deletion). Keep a merged map and re-emit the whole thing.
  function seedDevices(j) {
    deviceMap = {};
    if (j && typeof j === "object") {
      Object.keys(j).forEach(function (k) {
        var v = j[k] || {};
        deviceMap[v.device || k] = v;
      });
    }
    return shallow(deviceMap);
  }
  function applyDeviceUpdate(d) {
    if (!d || !d.device) return;
    if (d.deleted) delete deviceMap[d.device];
    else deviceMap[d.device] = d;
    emit("devices", shallow(deviceMap));
  }
  function shallow(o) { var c = {}; Object.keys(o).forEach(function (k) { c[k] = o[k]; }); return c; }

  // ---- presence subscribe frame (debounced, batched) -------------------------
  function queueSubscribe() {
    if (subscribeQueued) return;
    subscribeQueued = true;
    // Coalesce several DM.on("presence:…") calls in the same tick into one frame.
    Promise.resolve().then(function () {
      subscribeQueued = false;
      if (status !== "open") return;
      var ids = Object.keys(presenceIds);
      if (ids.length) send({ type: "subscribe", ids: ids });
    });
  }

  // ---- on-demand REST lookups (cached) ---------------------------------------
  // These persist for the whole session, so soft-navigating between pages reuses
  // the result with zero new requests. `opts.maxAge` (ms) enables caching;
  // `opts.persist` also mirrors it to sessionStorage so it survives a reload.
  // In-flight requests for the same key are de-duplicated.
  var reqCache = {};       // key -> { t, data }
  var reqInflight = {};    // key -> Promise
  var STORE_PREFIX = "dm.req.";

  function stableStringify(o) {
    if (!o || typeof o !== "object") return JSON.stringify(o);
    return JSON.stringify(Object.keys(o).sort().reduce(function (a, k) { a[k] = o[k]; return a; }, {}));
  }
  function cacheKey(resource, params) { return resource + ":" + stableStringify(params || {}); }
  function readStore(key) {
    try { var s = sessionStorage.getItem(STORE_PREFIX + key); return s ? JSON.parse(s) : null; } catch { return null; }
  }
  function writeStore(key, rec) {
    try { sessionStorage.setItem(STORE_PREFIX + key, JSON.stringify(rec)); } catch { /* private mode / quota */ }
  }

  function request(resource, params, opts) {
    params = params || {}; opts = opts || {};
    var r = RESOURCES[resource];
    if (!r) return Promise.reject(new Error("unknown resource: " + resource));
    var key = cacheKey(resource, params);
    var maxAge = opts.maxAge || 0;
    var now = Date.now();

    if (maxAge > 0) {
      var mem = reqCache[key];
      if (mem && (now - mem.t) < maxAge) return Promise.resolve(mem.data);
      if (opts.persist) {
        var st = readStore(key);
        if (st && (now - st.t) < maxAge) { reqCache[key] = st; return Promise.resolve(st.data); }
      }
    }
    if (reqInflight[key]) return reqInflight[key];

    var p = fetch(r.url(params), { headers: { Accept: "application/json" } })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (j) {
        var data = r.pick(j);
        if (data != null && maxAge > 0) {
          var rec = { t: Date.now(), data: data };
          reqCache[key] = rec;
          if (opts.persist) writeStore(key, rec);
        }
        delete reqInflight[key];
        return data;
      })
      .catch(function (e) { delete reqInflight[key]; throw e; });
    reqInflight[key] = p;
    return p;
  }

  // ---- socket lifecycle ------------------------------------------------------
  function send(obj) {
    if (ws && ws.readyState === 1) {
      try { ws.send(typeof obj === "string" ? obj : JSON.stringify(obj)); return true; } catch {}
    }
    return false;
  }

  function onFrame(raw) {
    if (raw === "pong") { if (pongTimer) { clearTimeout(pongTimer); pongTimer = null; } return; }
    if (raw === "ping") { send("pong"); return; }

    var msg;
    try { msg = JSON.parse(raw); } catch { return; }
    if (!msg || typeof msg.type !== "string") return;
    var d = msg.data;

    switch (msg.type) {
      case "connection_established":
        onConnected();
        break;

      case "fronters_update":
        emit("fronters", d);
        break;

      case "mental_state_update":
        emit("mental", d);
        break;

      case "device_update":
        applyDeviceUpdate(d);
        break;

      case "init_state":
        // { userId: presence, … } — a user absent here is offline.
        if (d && typeof d === "object") {
          Object.keys(d).forEach(function (id) { emit("presence:" + id, { id: id, data: d[id] }); });
        }
        break;

      case "presence_update":
        var id = presenceUserId(d);
        if (id) emit("presence:" + id, { id: id, data: d });
        break;

      case "force_refresh":
        // Admin-triggered. Resync active feeds (cheap) rather than hard-reload.
        Object.keys(subs).forEach(resync);
        emit("force_refresh", d || {});
        break;

      default:
        // Forward-compat: treat any other type as a generic topic update.
        emit(msg.type, d);
    }
  }

  // The socket `presence_update` carries a bare presence object; the user id can
  // sit in a few places depending on shape. Derive it defensively.
  // TODO(verify): confirm the exact field once discord.js/music.js are moved to
  // DM against the live socket.
  function presenceUserId(p) {
    if (!p || typeof p !== "object") return null;
    return p.userId || p.user_id || p.id ||
      (p.user && p.user.id) ||
      (p.discord_user && p.discord_user.id) ||
      (p.data && p.data.user && p.data.user.id) || null;
  }

  function onConnected() {
    status = "open";
    backoff = 1000;
    startHeartbeat();
    readyResolve();
    // (Re)subscribe presence in one frame.
    if (Object.keys(presenceIds).length) queueSubscribe();
    // On a *reconnect*, resync singleton feeds to catch missed changes. On the
    // very first connect, first paint already covered them — don't double-fetch.
    if (everConnected) Object.keys(subs).forEach(function (t) { if (!presenceKey(t)) resync(t); });
    everConnected = true;
  }

  function connect() {
    if (document.hidden) return;      // never open a socket for a background tab
    if (ws) return;
    status = "connecting";
    var sock;
    try { sock = new WebSocket(WS_URL); }
    catch { scheduleReconnect(); return; }
    ws = sock;
    sock.addEventListener("message", function (ev) { onFrame(ev.data); });
    sock.addEventListener("close", function () {
      if (ws === sock) ws = null;
      status = "closed";
      stopHeartbeat();
      scheduleReconnect();
    });
    sock.addEventListener("error", function () { try { sock.close(); } catch {} });
  }

  function scheduleReconnect() {
    if (reconnectTimer || document.hidden) return;
    var wait = Math.round(Math.min(backoff, BACKOFF_MAX_MS) * (0.7 + Math.random() * 0.6));
    reconnectTimer = setTimeout(function () {
      reconnectTimer = null;
      backoff = Math.min(backoff * 2, BACKOFF_MAX_MS);
      connect();
    }, wait);
  }

  function startHeartbeat() {
    stopHeartbeat();
    pingTimer = setInterval(function () {
      if (!send("ping")) return;
      if (pongTimer) return;
      pongTimer = setTimeout(function () {
        pongTimer = null;
        if (ws) try { ws.close(); } catch {}   // no pong -> force reconnect
      }, PONG_GRACE_MS);
    }, HEARTBEAT_MS);
  }
  function stopHeartbeat() {
    if (pingTimer) { clearInterval(pingTimer); pingTimer = null; }
    if (pongTimer) { clearTimeout(pongTimer); pongTimer = null; }
  }

  // Pause when hidden; wake, prime, and reconnect when shown again.
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) return;
    if (!ws && !reconnectTimer) { backoff = 1000; connect(); }
    primeVisibleSubs();               // paint anything a hidden tab deferred
  });

  // ---- page-scoped subscription cleanup (soft navigation) --------------------
  function clearPageSubs() {
    var list = pageScoped; pageScoped = [];
    list.forEach(function (off) { try { off(); } catch {} });
  }
  function hookPageClear() {
    var prev = window.ctpClearPageState;
    if (typeof prev === "function" && prev.__dmWrapped) return true;
    if (typeof prev !== "function") return false;
    var wrapped = function () { clearPageSubs(); return prev.apply(this, arguments); };
    wrapped.__dmWrapped = true;
    window.ctpClearPageState = wrapped;
    return true;
  }
  if (!hookPageClear()) {
    var tries = 0;
    var h = setInterval(function () { if (hookPageClear() || ++tries > 50) clearInterval(h); }, 100);
  }

  // ---- public API ------------------------------------------------------------
  window.DM = {
    on: function (topic, handler) {
      var off = subscribe(topic, handler);
      pageScoped.push(off);           // auto-cleared on next soft nav
      return off;
    },
    get: function (topic) { return snapshot[topic]; },
    request: request,
    get status() { return status; },
    ready: ready,
  };

  connect();
})();
