"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/* Ported from blogs.js — fetches /js/on/posts.json and renders blog cards.
   The date shown is parsed from the slug (DDMMYYYY-name), so there's no
   separate date field to keep in sync. */

type Post = { slug: string; title?: string; excerpt?: string; thumbnail?: string };
type Parsed = { day: number; month: number; year: number; name: string; timestamp: number };

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function parseSlug(slug: string): Parsed | null {
  const m = /^(\d{2})(\d{2})(\d{4})-(.+)$/.exec(slug);
  if (!m) return null;
  const [, dd, mm, yyyy, name] = m;
  const day = parseInt(dd, 10);
  const month = parseInt(mm, 10); // 1-indexed
  const year = parseInt(yyyy, 10);
  return { day, month, year, name, timestamp: new Date(year, month - 1, day).getTime() };
}

function formatDate({ day, month, year }: Parsed): string {
  return `${day} ${MONTHS[month - 1] || ""} ${year}`;
}

function titleCaseFromSlugName(name: string): string {
  return name
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

type State =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "error" }
  | { status: "ready"; cards: { post: Post; parsed: Parsed }[] };

export default function BlogCards() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch("/js/on/posts.json", { cache: "no-cache" })
      .then((r) => {
        if (!r.ok) throw new Error(`posts.json ${r.status}`);
        return r.json();
      })
      .then((posts: unknown) => {
        if (cancelled) return;
        if (!Array.isArray(posts) || posts.length === 0) {
          setState({ status: "empty" });
          return;
        }
        const cards = (posts as Post[])
          .map((post) => ({ post, parsed: parseSlug(post.slug) }))
          .filter((x): x is { post: Post; parsed: Parsed } => x.parsed !== null)
          .sort((a, b) => b.parsed.timestamp - a.parsed.timestamp);
        setState(cards.length ? { status: "ready", cards } : { status: "empty" });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return <div id="blog-cards" className="is-loading" aria-busy="true" />;
  }
  if (state.status === "empty") {
    return (
      <div id="blog-cards">
        <p className="blog-empty">No posts yet — check back soon!</p>
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div id="blog-cards">
        <p className="blog-empty">Couldn&apos;t load posts right now. Try refreshing.</p>
      </div>
    );
  }

  return (
    <div id="blog-cards">
      {state.cards.map(({ post, parsed }) => {
        const title = post.title || titleCaseFromSlugName(parsed.name);
        const iso = `${parsed.year}-${String(parsed.month).padStart(2, "0")}-${String(parsed.day).padStart(2, "0")}`;
        return (
          <Link key={post.slug} className="blog-card" href={`/blog/${post.slug}`}>
            {post.thumbnail ? (
              <div className="blog-card-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.thumbnail} alt="" loading="lazy" />
              </div>
            ) : null}
            <div className="blog-card-body">
              <time className="blog-card-date" dateTime={iso}>
                {formatDate(parsed)}
              </time>
              <h3 className="blog-card-title">{title}</h3>
              {post.excerpt ? <p className="blog-card-excerpt">{post.excerpt}</p> : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
