/* app/Tagline.tsx */

"use client";

import { useEffect, useState } from "react";

import { tagline, cursor } from "@styles/home.css";

// Edit me: first line is the real tagline, the rest are for fun.
const lines = [
  "A little map to everything I make and run.",
  "A little map to everything I make and (occasionally) break.",
  "Basically a linktree with root access.",
  "Powered by caffeine and questionable commit messages.",
];

const typeMs = 45;

const deleteMs = 22;

const holdMs = 2200;

export default function Tagline() {
  // Start on the full first line so SSR shows the real tagline with no flash.
  const [text, setText] = useState(lines[0]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let line = 0;
    let count = lines[0].length;
    let deleting = false;
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (!alive) return;
      const full = lines[line];
      let delay = typeMs;

      if (!deleting && count < full.length) {
        count += 1;
      } else if (!deleting && count === full.length) {
        deleting = true;
        delay = holdMs;
      } else if (deleting && count > 0) {
        count -= 1;
        delay = deleteMs;
      } else {
        deleting = false;
        line = (line + 1) % lines.length;
        count = 0;
      }

      setText(lines[line].slice(0, count));
      timer = setTimeout(tick, delay);
    };

    timer = setTimeout(tick, typeMs);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <p className={tagline}>
      {text}
      <span className={cursor} aria-hidden>
        ▌
      </span>
    </p>
  );
}
