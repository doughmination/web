"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

/**
 * Model3D — drop a rotatable 3D model anywhere an image would go.
 *
 * Wraps Google's <model-viewer> web component. The 3D always loads; the `poster`
 * image is shown only while the model streams in (and as the fallback if WebGL
 * is unavailable), so from the visitor's side an image simply "becomes" 3D.
 *
 * <model-viewer> is a custom element, so it's registered once via a lazily
 * injected module script (cached across mounts on window). This mirrors the
 * skinview3d lazy-load already used on the Minecraft page — no bundler wiring,
 * loads only on routes that actually use a model.
 *
 * Usage:
 *   <Model3D src="/models/poc-knot.glb" poster="/assets/x.png" alt="…" />
 */

// Vendored locally (public/js) so the site stays self-hosted — no CDN dependency.
const MV_SRC = "/js/model-viewer.min.js";

// Register the <model-viewer> element once per page load.
function loadModelViewer(): Promise<void> {
  const w = window as unknown as { __mvPromise?: Promise<void> };
  if (customElements.get("model-viewer")) return Promise.resolve();
  if (w.__mvPromise) return w.__mvPromise;
  w.__mvPromise = new Promise<void>((resolve) => {
    const s = document.createElement("script");
    s.type = "module";
    s.src = MV_SRC;
    s.addEventListener("load", () => resolve(), { once: true });
    s.addEventListener("error", () => resolve(), { once: true });
    document.head.appendChild(s);
  });
  return w.__mvPromise;
}

type Model3DProps = {
  /** URL of the .glb / .gltf model. */
  src: string;
  /** Image shown while the model loads / if WebGL is unavailable. */
  poster?: string;
  alt?: string;
  /** Slowly spin on its own. Default true. */
  autoRotate?: boolean;
  /** Let the visitor orbit with drag. Default true. */
  interactive?: boolean;
  /** "lazy" defers loading until scrolled into view (good for galleries);
   *  "eager" loads immediately. Default "lazy". */
  loading?: "lazy" | "eager";
  /** Fixed camera-orbit, e.g. "0deg 90deg 50%". A radius under 100% zooms in
   *  so the model fills more of its box (useful when using a model as a frame). */
  cameraOrbit?: string;
  className?: string;
  style?: CSSProperties;
};

export default function Model3D({
  src,
  poster,
  alt = "3D model",
  autoRotate = true,
  interactive = true,
  loading = "lazy",
  cameraOrbit,
  className,
  style,
}: Model3DProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    loadModelViewer();
  }, []);

  // model-viewer is a custom element; set its attributes imperatively so we
  // don't need JSX intrinsic-element typings for it.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.setAttribute("src", src);
    if (poster) el.setAttribute("poster", poster);
    el.setAttribute("alt", alt);
    el.setAttribute("loading", loading);
    el.setAttribute("reveal", "auto");
    el.setAttribute("shadow-intensity", "1");
    el.setAttribute("exposure", "1");
    if (autoRotate) el.setAttribute("auto-rotate", "");
    else el.removeAttribute("auto-rotate");
    if (interactive) el.setAttribute("camera-controls", "");
    else el.removeAttribute("camera-controls");
    if (cameraOrbit) {
      el.setAttribute("camera-orbit", cameraOrbit);
      el.setAttribute("min-camera-orbit", cameraOrbit);
      el.setAttribute("max-camera-orbit", cameraOrbit);
    }
  }, [src, poster, alt, autoRotate, interactive, loading, cameraOrbit]);

  // Cast the custom tag through `as` so TS accepts it without global JSX augmentation.
  const Tag = "model-viewer" as unknown as React.ElementType;

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "20rem",
        display: "block",
        "--poster-color": "transparent",
        ...style,
      }}
    />
  );
}
