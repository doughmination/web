"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Award, BoxArrowUpRight, Feather, Layers, Stars, XLg } from "react-bootstrap-icons";
import { createWave } from "./skinAnimations";

/* Ported from minecraft.js — account cards + a detail modal (Overview / 3D
   Model / Hypixel). The 3D tab uses the lazy-loaded skinview3d WebGL viewer,
   which is inherently imperative, so it's driven through refs/effects. */

const API_BASE = "https://doughmination.uk/v2/minecraft/general/";
const MC_HEADS = "https://mc-heads.net/";
const CAPE_W = 60;
const CAPE_H = 96;

/**
 * Per-account identity colours. `accent` is a CSS custom-property name — it goes
 * straight into `var(--${accent})` below, so these must match the token names in
 * styles/themes.css.ts exactly. A typo here fails silently (the var just doesn't
 * resolve), which is why they're listed against the contract rather than guessed.
 */
const ROLE_META: Record<string, { label: string; accent: string }> = {
  main: { label: "Main", accent: "sapphire" },
  furina: { label: "Furina", accent: "sky" },
  rose: { label: "Rose", accent: "accent" },
  luna: { label: "Luna", accent: "teal" },
  uzi: { label: "Uzi", accent: "accent-alt" },
  alt: { label: "Alt", accent: "maroon" },
};

export type Cfg = { role: string; uid: string };
type ProfileData = {
  uuid?: string;
  name?: string;
  skin_url?: string;
  skin_model?: string;
  cape_url?: string | string[];
  capes?: unknown;
  render?: Record<string, string>;
};
type AcctState = { uid: string; cfg: Cfg; data: ProfileData };
type Cape = { url: string; name: string | null };

// ---- skinview3d (npm package, code-split) ---------------------------------
// Loaded via dynamic import() so the WebGL viewer stays out of the main bundle
// and only downloads when someone opens the 3D tab. Types come from the package.
type Skinview3d = typeof import("skinview3d");
type SkinViewerInstance = InstanceType<Skinview3d["SkinViewer"]>;

let skinviewPromise: Promise<Skinview3d> | null = null;
function loadSkinview(): Promise<Skinview3d> {
  if (!skinviewPromise) {
    skinviewPromise = import("skinview3d").catch((err) => {
      skinviewPromise = null; // let a later attempt retry
      throw err;
    });
  }
  return skinviewPromise;
}

// ---- helpers --------------------------------------------------------------
function shortUuid(uid: string) {
  return String(uid || "").replace(/-/g, "");
}
function roleMeta(role: string) {
  return ROLE_META[role] || ROLE_META.alt;
}
function cap(s: string) {
  s = String(s || "");
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function baseRender(state: AcctState, kind: string): string {
  const r = state.data?.render;
  if (r && r[kind]) return r[kind];
  return MC_HEADS + kind + "/" + state.uid;
}
function renderUrl(base: string, size: number, flat: boolean): string {
  if (!base) return base;
  let u = base.replace(/\/+$/, "").replace(/\/nohelm$/, "");
  if (size) u += "/" + size;
  if (flat) u += "/nohelm";
  return u;
}
function capeList(d: ProfileData | null): Cape[] {
  const c = d && (d.capes != null ? d.capes : d.cape_url);
  if (!c) return [];
  const arr = Array.isArray(c) ? c : [c];
  return arr
    .map((x): Cape | null => {
      if (typeof x === "string") return { url: x, name: null };
      if (x && typeof x === "object") {
        const o = x as { url?: string; cape_url?: string; texture?: string; name?: string; title?: string; source?: string };
        const url = o.url || o.cape_url || o.texture || null;
        return url ? { url, name: o.name || o.title || o.source || null } : null;
      }
      return null;
    })
    .filter((x): x is Cape => !!x && !!x.url);
}
function capeGridWidth(w: number, h: number) {
  const ratio = w / h;
  return Math.abs(ratio - 46 / 22) < Math.abs(ratio - 64 / 32) ? 46 : 64;
}
function drawCapeFront(canvas: HTMLCanvasElement, url: string) {
  const img = new Image();
  img.referrerPolicy = "no-referrer";
  img.onload = () => {
    const scale = img.naturalWidth / capeGridWidth(img.naturalWidth, img.naturalHeight);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 1 * scale, 1 * scale, 10 * scale, 16 * scale, 0, 0, canvas.width, canvas.height);
  };
  img.src = url;
}

// ---- little pieces --------------------------------------------------------
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="mc-row">
      <span className="mc-row-k">{k}</span>
      <span className="mc-row-v">{v}</span>
    </div>
  );
}
function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="mc-copy mc-row-v"
      type="button"
      title="Click to copy"
      onClick={() => {
        if (navigator.clipboard) {
          navigator.clipboard
            .writeText(value)
            .then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            })
            .catch(() => {});
        }
      }}
    >
      {copied ? "Copied!" : value}
    </button>
  );
}
function CapeCanvas({ url }: { url: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const dpr = window.devicePixelRatio || 1;
    cv.width = CAPE_W * dpr;
    cv.height = CAPE_H * dpr;
    drawCapeFront(cv, url);
  }, [url]);
  return <canvas className="mc-cape-cv" ref={ref} />;
}

// ---- 3D model tab ---------------------------------------------------------
function Skin3D({ data }: { data: ProfileData }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewerRef = useRef<SkinViewerInstance | null>(null);
  const svRef = useRef<Skinview3d | null>(null);
  const [ready, setReady] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState<string | null>("Loading 3D…");

  const capes = capeList(data);
  const [capeIdx, setCapeIdx] = useState(capes.length ? 1 : 0);
  const [elytraOn, setElytraOn] = useState(false);
  const [animIdx, setAnimIdx] = useState(0);

  // create the viewer + load the skin (once per mount)
  useEffect(() => {
    let disposed = false;
    loadSkinview()
      .then((sv) => {
        if (disposed || !canvasRef.current) return;
        svRef.current = sv;
        if (!data.skin_url) {
          setLoadingMsg("No skin available");
          return;
        }
        const viewer = new sv.SkinViewer({ canvas: canvasRef.current, width: 300, height: 400 });
        viewer.controls.enableZoom = true;
        viewerRef.current = viewer;
        setReady(true);
        viewer
          .loadSkin(data.skin_url, { model: data.skin_model === "slim" ? "slim" : "default" })
          .then(() => setLoadingMsg(null))
          .catch(() => setLoadingMsg("Couldn't load skin"));
      })
      .catch(() => setLoadingMsg("3D viewer failed to load"));
    return () => {
      disposed = true;
      if (viewerRef.current) {
        try {
          viewerRef.current.dispose();
        } catch {
          /* already gone */
        }
        viewerRef.current = null;
      }
    };
  }, [data]);

  // apply cape / elytra
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!ready || !viewer) return;
    const list = capeList(data);
    const url = capeIdx > 0 ? list[capeIdx - 1]?.url : null;
    if (!url) {
      viewer.resetCape();
      return;
    }
    const back = elytraOn ? "elytra" : "cape";
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled || !viewerRef.current) return;
      try {
        viewerRef.current.loadCape(img, { backEquipment: back });
      } catch {
        /* rejected source */
      }
    };
    img.onerror = () => {};
    img.src = url;
    return () => {
      cancelled = true;
    };
  }, [ready, capeIdx, elytraOn, data]);

  // apply animation
  useEffect(() => {
    const viewer = viewerRef.current;
    const sv = svRef.current;
    if (!ready || !viewer || !sv) return;
    // Wave is ours, not sv.WaveAnimation — see skinAnimations.ts for why.
    const makers = [
      () => new sv.IdleAnimation(),
      () => new sv.WalkingAnimation(),
      () => new sv.RunningAnimation(),
      () => createWave(sv, "right"),
    ];
    viewer.animation = makers[animIdx]();
  }, [ready, animIdx]);

  const capeOptions = [
    { label: "No cape", url: null as string | null },
    ...capes.map((c, i) => ({
      label: c.name ? cap(c.name) : capes.length > 1 ? `Cape ${i + 1}` : "Cape",
      url: c.url,
    })),
  ];

  return (
    <>
      <div className="mc-3d-wrap">
        <canvas className="mc-3d-canvas" ref={canvasRef} />
        <div className="mc-3d-loading" hidden={!loadingMsg}>
          {loadingMsg}
        </div>
      </div>
      <p className="mc-3d-hint">Drag to spin · scroll to zoom</p>

      {capeOptions.length > 1 ? (
        <div className="mc-cape-select mc-ctl-group">
          <span className="mc-ctl-label">Cape</span>
          {capeOptions.map((opt, i) => (
            <button
              key={i}
              type="button"
              className={`mc-pill${i === capeIdx ? " is-active" : ""}`}
              onClick={() => setCapeIdx(i)}
            >
              {opt.label}
            </button>
          ))}
          {capes.length ? (
            <>
              <span className="mc-flex-break" aria-hidden="true" />
              <button
                type="button"
                className={`mc-pill mc-elytra${elytraOn ? " is-active" : ""}`}
                onClick={() =>
                  setElytraOn((v) => {
                    const nv = !v;
                    if (nv && capeIdx === 0 && capes.length) setCapeIdx(1);
                    return nv;
                  })
                }
              >
                <Feather aria-hidden="true" /> Elytra
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      <div className="mc-anim-select mc-ctl-group">
        <span className="mc-ctl-label">Animation</span>
        {["Idle", "Walk", "Run", "Wave"].map((label, i) => (
          <button
            key={i}
            type="button"
            className={`mc-pill${i === animIdx ? " is-active" : ""}`}
            onClick={() => setAnimIdx(i)}
          >
            {label}
          </button>
        ))}
      </div>
    </>
  );
}

// ---- detail modal ---------------------------------------------------------
function AccountModal({
  cfg,
  uid,
  data,
  onClose,
}: {
  cfg: Cfg;
  uid: string;
  data: ProfileData;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"ext" | "model" | "hypixel">("ext");
  const [showHat, setShowHat] = useState(true);
  const lastFocus = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const requestClose = useCallback(() => setOpen(false), []);

  useEffect(() => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    const r = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(r);
  }, []);
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [requestClose]);

  const state: AcctState = { uid, cfg, data };
  const meta = roleMeta(cfg.role);
  const accent = `var(--${meta.accent})`;
  const heroSrc = renderUrl(baseRender(state, "player"), 360, !showHat);
  const skullSrc = renderUrl(baseRender(state, "head"), 104, !showHat);
  const capes = capeList(data);
  const dashed = data.uuid || cfg.uid;
  const capeVal =
    capes.length === 0 ? "None" : capes.length === 1 ? "Yes" : `${capes.length} capes`;

  return (
    <div
      className={`mc-overlay${open ? " is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
      onTransitionEnd={() => {
        if (!open) {
          onClose();
          lastFocus.current?.focus?.();
        }
      }}
    >
      <div className="mc-dialog">
        <button ref={closeRef} className="mc-close" type="button" aria-label="Close" onClick={requestClose}>
          <XLg aria-hidden="true" />
        </button>

        <div className="mc-d-head">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="mc-skull" alt="head" referrerPolicy="no-referrer" src={skullSrc} />
          <div className="mc-d-title">
            <span className="mc-d-role" style={{ background: accent }}>
              {meta.label}
            </span>
            <span className="mc-d-name">{data.name || "Loading…"}</span>
          </div>
        </div>

        <div className="mc-tabs" role="tablist">
          {(["ext", "model", "hypixel"] as const).map((t) => (
            <button
              key={t}
              className={`mc-tab${tab === t ? " is-active" : ""}`}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
            >
              {t === "ext" ? "Overview" : t === "model" ? "3D Model" : "Hypixel"}
            </button>
          ))}
        </div>

        <div className="mc-panels">
          <div className={`mc-panel${tab === "ext" ? " is-active" : ""}`}>
            <div className="mc-ext-hero">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="mc-hero" alt="" referrerPolicy="no-referrer" src={heroSrc} />
              <button className="mc-hat" type="button" onClick={() => setShowHat((v) => !v)}>
                <Layers aria-hidden="true" /> {showHat ? "Hide hat layer" : "Show hat layer"}
              </button>
            </div>
            <div className="mc-tex" hidden={!data.skin_url && capes.length === 0}>
              {data.skin_url ? (
                <figure>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={data.skin_url} alt="skin texture" width={80} height={80} referrerPolicy="no-referrer" />
                  <figcaption>Skin</figcaption>
                </figure>
              ) : null}
              {capes.map((c, i) => {
                const label = c.name
                  ? c.name.charAt(0).toUpperCase() + c.name.slice(1)
                  : capes.length > 1
                    ? `Cape ${i + 1}`
                    : "Cape";
                return (
                  <figure key={i}>
                    <CapeCanvas url={c.url} />
                    <figcaption>{label}</figcaption>
                  </figure>
                );
              })}
            </div>
            <div className="mc-rows">
              <Row k="Username" v={data.name || "—"} />
              <Row
                k="Skin model"
                v={data.skin_model ? (data.skin_model === "slim" ? "Slim (Alex)" : "Classic (Steve)") : "—"}
              />
              <Row k={capes.length > 1 ? "Capes" : "Cape"} v={capeVal} />
              <div className="mc-row">
                <span className="mc-row-k">UUID</span>
                <CopyBtn value={dashed} />
              </div>
            </div>
            <a
              className="mc-namemc"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://namemc.com/profile/${encodeURIComponent(uid)}`}
            >
              View on NameMC <BoxArrowUpRight aria-hidden="true" />
            </a>
          </div>

          <div className={`mc-panel${tab === "model" ? " is-active" : ""}`}>
            {tab === "model" ? <Skin3D data={data} /> : null}
          </div>

          <div className={`mc-panel${tab === "hypixel" ? " is-active" : ""}`}>
            <div className="mc-section-t">Hypixel Stats</div>
            <div className="mc-soon">
              Coming soon <Stars aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- account card ---------------------------------------------------------
function AccountCard({ cfg, data, onOpen }: { cfg: Cfg; data: ProfileData; onOpen: () => void }) {
  const uid = shortUuid(cfg.uid);
  const meta = roleMeta(cfg.role);
  const accent = `var(--${meta.accent})`;
  const bodySrc = renderUrl(baseRender({ uid, cfg, data }, "body"), 300, false);
  const capes = capeList(data);
  return (
    <a
      className="mc-card"
      style={{ borderTop: `3px solid ${accent}` }}
      href={`https://namemc.com/profile/${encodeURIComponent(uid)}`}
      data-uuid={uid}
      onClick={(e) => {
        e.preventDefault();
        onOpen();
      }}
    >
      <span className="mc-role" style={{ background: accent }}>
        {meta.label}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="mc-body" alt="" referrerPolicy="no-referrer" src={bodySrc} />
      <span className="mc-name">{data.name || cfg.uid}</span>
      <span className="mc-cape" hidden={capes.length === 0}>
        <Award aria-hidden="true" /> {capes.length}{" "}
        {capes.length === 1 ? "cape" : "capes"}
      </span>
    </a>
  );
}

// ---- root -----------------------------------------------------------------
export default function MinecraftAccounts({ accounts }: { accounts: Cfg[] }) {
  const [dataMap, setDataMap] = useState<Record<string, ProfileData>>({});
  const [openUid, setOpenUid] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    accounts.forEach((cfg) => {
      const uid = shortUuid(cfg.uid);
      const p: Promise<unknown> = window.DM?.request
        ? window.DM.request("minecraft", { uuid: uid }, { maxAge: 1800000, persist: true })
        : fetch(API_BASE + encodeURIComponent(uid), { cache: "no-store" })
            .then((r) => (r.ok ? r.json().catch(() => null) : null))
            .then((j) => (j && j.success ? j.data : null));
      p.then((data) => {
        if (!cancelled && data) setDataMap((m) => ({ ...m, [uid]: data as ProfileData }));
      }).catch(() => {});
    });
    return () => {
      cancelled = true;
    };
  }, [accounts]);

  const openCfg = openUid ? accounts.find((a) => shortUuid(a.uid) === openUid) : null;

  return (
    <>
      <div className="mc-grid">
        {accounts.map((cfg) => {
          const uid = shortUuid(cfg.uid);
          return (
            <AccountCard
              key={uid}
              cfg={cfg}
              data={dataMap[uid] || { uuid: cfg.uid }}
              onOpen={() => setOpenUid(uid)}
            />
          );
        })}
      </div>
      {openCfg && openUid ? (
        <AccountModal
          key={openUid}
          cfg={openCfg}
          uid={openUid}
          data={dataMap[openUid] || { uuid: openCfg.uid }}
          onClose={() => setOpenUid(null)}
        />
      ) : null}
    </>
  );
}
