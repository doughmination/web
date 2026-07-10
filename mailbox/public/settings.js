// --- Settings page logic: send-from addresses + Web Push enrolment ---

const fromListEl = document.getElementById("fromList");
const addFromForm = document.getElementById("addFromForm");
const addFromInput = document.getElementById("addFromInput");
const fromError = document.getElementById("fromError");

const pushStatusEl = document.getElementById("pushStatus");
const pushToggleBtn = document.getElementById("pushToggleBtn");
const pushTestBtn = document.getElementById("pushTestBtn");
const pushError = document.getElementById("pushError");

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function bareAddr(s) {
  if (!s) return "";
  const m = String(s).match(/<([^>]+)>/);
  return (m ? m[1] : s).trim().toLowerCase();
}

function showFromError(msg) {
  fromError.textContent = msg;
  fromError.classList.remove("hidden");
}

// --- Send-from addresses ---

function renderFromList(settings) {
  const list = settings.fromAddresses || [];
  if (list.length === 0) {
    fromListEl.innerHTML = '<li class="muted">No addresses yet. Add one below.</li>';
    return;
  }

  fromListEl.innerHTML = list
    .map((addr) => {
      const isDefault = settings.defaultFrom && bareAddr(settings.defaultFrom) === bareAddr(addr);
      return `
        <li class="from-row">
          <button class="star ${isDefault ? "on" : ""}" data-default="${escapeHtml(addr)}"
                  title="${isDefault ? "Default sender" : "Make default"}"
                  aria-label="${isDefault ? "Default sender" : "Make default"}">${isDefault ? "★" : "☆"}</button>
          <span class="from-addr">${escapeHtml(addr)}</span>
          <button class="btn-ghost from-remove" data-remove="${escapeHtml(addr)}">Remove</button>
        </li>`;
    })
    .join("");

  fromListEl.querySelectorAll(".star").forEach((btn) => {
    btn.addEventListener("click", () => setDefault(btn.dataset.default));
  });
  fromListEl.querySelectorAll(".from-remove").forEach((btn) => {
    btn.addEventListener("click", () => removeFrom(btn.dataset.remove));
  });
}

async function loadSettings() {
  const res = await fetch("/api/settings");
  renderFromList(await res.json());
}

async function addFrom(address) {
  fromError.classList.add("hidden");
  const res = await fetch("/api/settings/from", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    showFromError(err.error || "Couldn't add that address.");
    return;
  }
  renderFromList(await res.json());
  addFromInput.value = "";
}

async function removeFrom(address) {
  const res = await fetch("/api/settings/from/remove", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  });
  if (res.ok) renderFromList(await res.json());
}

async function setDefault(address) {
  const res = await fetch("/api/settings/default", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  });
  if (res.ok) renderFromList(await res.json());
}

addFromForm.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const value = addFromInput.value.trim();
  if (value) addFrom(value);
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST" });
  window.location.href = "/login";
});

// --- Web Push ---

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

const pushSupported =
  "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

// iOS only allows Web Push from an installed (Home Screen) PWA.
const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone =
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

let serverPush = { configured: false, publicKey: "", count: 0 };
let swReg = null;

function setPushStatus(msg, kind) {
  pushStatusEl.textContent = msg;
  pushStatusEl.className = "push-status" + (kind ? " " + kind : "");
}

function showPushError(msg) {
  pushError.textContent = msg;
  pushError.classList.remove("hidden");
}

async function initPush() {
  pushError.classList.add("hidden");

  if (!pushSupported) {
    setPushStatus("This browser doesn't support notifications.", "muted");
    pushToggleBtn.disabled = true;
    return;
  }

  if (isIos && !isStandalone) {
    setPushStatus(
      "Add this site to your Home Screen first (Share → Add to Home Screen), then open it from there to enable notifications.",
      "muted"
    );
    pushToggleBtn.disabled = true;
    return;
  }

  try {
    serverPush = await (await fetch("/api/push/status")).json();
  } catch (_) {
    setPushStatus("Couldn't reach the server.", "muted");
    return;
  }

  if (!serverPush.configured) {
    setPushStatus("Push isn't configured on the server (missing VAPID keys).", "muted");
    pushToggleBtn.disabled = true;
    return;
  }

  swReg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  const sub = await swReg.pushManager.getSubscription();
  reflectSubscription(!!sub);
}

function reflectSubscription(isSubscribed) {
  pushToggleBtn.disabled = false;
  if (isSubscribed) {
    setPushStatus("Notifications are on for this device.", "ok");
    pushToggleBtn.textContent = "Disable notifications";
    pushToggleBtn.classList.remove("btn-accent");
    pushToggleBtn.classList.add("btn-ghost");
    pushTestBtn.classList.remove("hidden");
  } else {
    setPushStatus("Notifications are off for this device.", "muted");
    pushToggleBtn.textContent = "Enable notifications";
    pushToggleBtn.classList.add("btn-accent");
    pushToggleBtn.classList.remove("btn-ghost");
    pushTestBtn.classList.add("hidden");
  }
}

async function enablePush() {
  pushError.classList.add("hidden");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    showPushError("Notification permission was not granted.");
    return;
  }

  const sub = await swReg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(serverPush.publicKey),
  });

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: sub }),
  });
  if (!res.ok) {
    showPushError("Couldn't save the subscription on the server.");
    return;
  }
  reflectSubscription(true);
}

async function disablePush() {
  const sub = await swReg.pushManager.getSubscription();
  if (sub) {
    await fetch("/api/push/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });
    await sub.unsubscribe();
  }
  reflectSubscription(false);
}

pushToggleBtn.addEventListener("click", async () => {
  pushToggleBtn.disabled = true;
  try {
    const sub = await swReg.pushManager.getSubscription();
    if (sub) await disablePush();
    else await enablePush();
  } catch (err) {
    showPushError("Something went wrong: " + (err && err.message ? err.message : err));
  } finally {
    pushToggleBtn.disabled = false;
  }
});

pushTestBtn.addEventListener("click", async () => {
  pushError.classList.add("hidden");
  pushTestBtn.disabled = true;
  try {
    const res = await fetch("/api/push/test", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) showPushError(data.error || "Test failed.");
    else setPushStatus(`Test sent to ${data.sent} device(s).`, "ok");
  } finally {
    pushTestBtn.disabled = false;
  }
});

loadSettings();
initPush();
