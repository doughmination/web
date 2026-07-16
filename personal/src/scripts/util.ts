/* Shared helpers for the homepage status widgets (ported from the vanilla JS). */

/** Real null/undefined AND the literal strings "null"/"undefined"/blank -> "". */
export function realText(v: unknown): string {
  if (v == null) return "";
  const s = String(v).trim();
  const l = s.toLowerCase();
  return l === "" || l === "null" || l === "undefined" ? "" : s;
}

/** "3m ago" / "2h ago" / "just now" from an ISO timestamp ("" if unparseable). */
export function relTime(iso?: string): string {
  const t = Date.parse(iso ?? "");
  if (!Number.isFinite(t)) return "";
  let s = Math.round((Date.now() - t) / 1000);
  if (s < 0) s = 0;
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
