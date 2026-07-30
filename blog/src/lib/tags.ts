/* src/lib/tags.ts
 * Client-safe tag helpers (no filesystem imports, so this can be used in both
 * server components and "use client" components).
 */

/**
 * Canonical categories, shown as filter chips in a fixed order even before a
 * post uses them. Any extra tags found in posts are appended after these.
 * Add or reorder freely — the filter bar and post frontmatter both read this.
 */
export const CATEGORIES = [
  "Dev Notes",
  "General Life",
  "Personal",
  "Projects",
  "Mental Health",
  "Meta",
] as const;

/** URL-safe slug used for filtering + the ?tag= query ("General Life" -> "general-life"). */
export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/** Display form of a tag as a hashtag ("General Life" -> "#GeneralLife"). */
export function tagHash(tag: string): string {
  return "#" + tag.replace(/\s+/g, "");
}
