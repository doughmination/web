"use client";

import { useDMFeed } from "./useDMFeed";
import { realText, relTime } from "./util";

type DeviceMap = Record<string, { location?: string | null; updated_at?: string }>;

/* "A,B,C" -> "A, B, C", dropping empty/null-ish parts. */
function fmtLocation(raw: string): string {
  return raw
    .split(",")
    .map((p) => realText(p))
    .filter(Boolean)
    .join(", ");
}

/* location may be a plain place-name string or a map URL. */
function parseLocation(v: unknown): { url: string | null; label: string; query: string } | null {
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
      label = "View on map";
    }
    return { url: raw, label: label || "View on map", query };
  }
  const label = fmtLocation(raw);
  return { url: null, label, query: label };
}

export default function Location() {
  const data = useDMFeed<DeviceMap>(
    "devices",
    "https://doughmination.uk/v2/devices",
    (raw) => (raw && typeof raw === "object" ? (raw as DeviceMap) : null),
  );

  if (!data) return null;
  const ip = data.iphone; // location lives on the iPhone entry only
  const loc = parseLocation(ip?.location);
  if (!loc || !loc.label) return null;

  const when = relTime(ip?.updated_at);
  const linkUrl =
    loc.url || (loc.query ? "https://www.google.com/maps?q=" + encodeURIComponent(loc.query) : "");

  return (
    <section className="location-card" aria-label="Current location">
      <div className="loc-head">
        <i className="bi bi-geo-alt-fill" aria-hidden="true" />
        <span className="loc-label">Location</span>
      </div>
      <div className="loc-body">
        {loc.query ? (
          <iframe
            className="loc-map"
            title={`Map showing ${loc.label}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${encodeURIComponent(loc.query)}&z=12&output=embed`}
          />
        ) : null}
        <div className="loc-cap">
          {linkUrl ? (
            <a
              className="loc-place loc-link"
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {loc.label} <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
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
