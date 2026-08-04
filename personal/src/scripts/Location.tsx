/* personal/src/scripts/Location.tsx
* Copyright (c) 2026 Clove Nytrix Doughmination Twilight
* Licensed under the DASL-1.0 Licence.
* See LICENCE.md in the project root for full licence information.
*/

"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useDeviceState } from "@doughmination/react-api";

import { realText, relTime } from "./util";
import { useLanguage } from "@/i18n/LanguageProvider";
import { BoxArrowUpRight, GeoAltFill } from "react-bootstrap-icons";
import "leaflet/dist/leaflet.css";

// Leaflet touches `window` at import time — must be client-only, no SSR.
const CityMap = dynamic(() => import("./CityMap"), { ssr: false });

/* "A,B,C" -> "A, B, C", dropping empty/null-ish parts. */
function fmtLocation(raw: string): string {
  return raw
    .split(",")
    .map((p) => realText(p))
    .filter(Boolean)
    .join(", ");
}

/* location may be a plain place-name string or a map URL. viewOnMapFallback
   is passed in (rather than imported/hooked here) since this is a plain
   function, not a component — it can't call useLanguage() itself. */
function parseLocation(
  v: unknown,
  viewOnMapFallback: string,
): { url: string | null; label: string; query: string } | null {
  const raw = realText(v);
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) {
    let label = "";
    let query = "";
    try {
      const u = new URL(raw);
      const ll = u.searchParams.get("ll") || u.searchParams.get("sll") || "";
      const q = u.searchParams.get("q") || u.searchParams.get("address") || "";
      label = fmtLocation(decodeURIComponent((q || "").replace(/\+/g, " ")));
      if (!label && ll) label = ll;
      if (!label) label = u.hostname.replace(/^www\./, "");
      query = ll || label;
    } catch {
      label = viewOnMapFallback;
    }
    return { url: raw, label: label || viewOnMapFallback, query };
  }
  const label = fmtLocation(raw);
  return { url: null, label, query: label };
}

export default function Location() {
  const { t, dict } = useLanguage();
  const { device: pixel } = useDeviceState("pixel");

  if (!pixel) return null;
  const loc = parseLocation(pixel.location, t("location.viewOnMap"));
  if (!loc || !loc.label) return null;

  const when = relTime(pixel.updated_at, dict.time);
  // Only offer a link-out for plain place names (no source URL provided).
  // We don't know what precision a pasted map URL encodes, so we just show
  // the label as-is rather than treating it as a coordinate source.
  const linkUrl =
    loc.url ||
    (loc.query ? "https://www.openstreetmap.org/search?query=" + encodeURIComponent(loc.query) : "");

  return (
    <section className="location-card" aria-label={t("location.ariaLabel")}>
      <div className="loc-head">
        <GeoAltFill aria-hidden="true" />
        <span className="loc-label">{t("location.heading")}</span>
      </div>
      <div className="loc-body">
        {/* Only render a map for plain place-name locations, not arbitrary URLs */}
        {!loc.url && loc.query ? (
          <CityMap className="loc-map" query={loc.query} label={loc.label} />
        ) : null}
        <div className="loc-cap">
          {linkUrl ? (
            <a className="loc-place loc-link" href={linkUrl} target="_blank" rel="noopener noreferrer">
              {loc.label} <BoxArrowUpRight aria-hidden="true" />
            </a>
          ) : (
            <span className="loc-place">{loc.label}</span>
          )}
          {when ? <span className="loc-when">{when}</span> : null}
        </div>
      </div>
    </section>
  );
}