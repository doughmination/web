import type { Metadata } from "next";
import PageScripts from "../_components/PageScripts";

export const metadata: Metadata = {
  title: "ASCII — Clove Twilight",
  description: "ASCII art of Clove Twilight, rendered in full colour.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://c.stupid.cat/ascii" },
};

// Fetch /ascii.txt and render its ANSI colour codes to HTML via ansi_up (ESM
// from CDN). Injected as a module script so top-level import/await work; runs
// fresh on each visit (writes into #ascii-art).
const ASCII_RENDER = `
import * as mod from "https://cdn.jsdelivr.net/npm/ansi_up@6.0.0/+esm";
const AnsiUp = mod.AnsiUp;
const el = document.getElementById('ascii-art');
if (el) {
  try {
    const res = await fetch('/ascii.txt', { cache: 'no-store' });
    if (!res.ok) throw new Error('fetch failed: ' + res.status);
    const raw = await res.text();
    const ansi_up = new AnsiUp();
    ansi_up.use_classes = false;
    el.innerHTML = ansi_up.ansi_to_html(raw);
    el.removeAttribute('aria-busy');
  } catch (err) {
    el.textContent = "couldn't load ascii.txt :(";
    console.error(err);
  }
}
`;

export default function AsciiPage() {
  return (
    <>
      <main className="ascii-wrap">
        <header className="hub-header">
          <h1>ASCII Me</h1>
          <h2 className="pronouns">rendered straight from ascii.txt</h2>
        </header>

        <div className="ascii-frame">
          <div className="ascii-frame-bar">
            <span className="ascii-dot red"></span>
            <span className="ascii-dot yellow"></span>
            <span className="ascii-dot green"></span>
            <span className="ascii-frame-title">ascii.txt</span>
          </div>

          <pre className="ascii-art" id="ascii-art" aria-busy="true">
            loading…
          </pre>
        </div>
      </main>

      <PageScripts scripts={[{ inline: ASCII_RENDER, module: true }]} />
    </>
  );
}
