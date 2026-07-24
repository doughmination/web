import {
  page,
  header,
  name,
  tagline,
  grid,
  card,
  cardTitle,
  cardArrow,
  cardDesc,
  footer,
} from "@styles/home.css";

// ── Edit me ──────────────────────────────────────────────
// Add / change your sites here. That's the only part you touch.
const SITES = [
  {
    title: "Site One",
    desc: "Short description of what lives here.",
    href: "https://example.com",
  },
  {
    title: "Site Two",
    desc: "Short description of what lives here.",
    href: "https://example.com",
  },
  {
    title: "Site Three",
    desc: "Short description of what lives here.",
    href: "https://example.com",
  },
  {
    title: "Site Four",
    desc: "Short description of what lives here.",
    href: "https://example.com",
  },
];

const ME = {
  name: "Clove",
  tagline: "A little map to everything I make.",
};
// ─────────────────────────────────────────────────────────

export default function Page() {
  return (
    <main className={page}>
      <header className={header}>
        <h1 className={name}>{ME.name}</h1>
        <p className={tagline}>{ME.tagline}</p>
      </header>

      <nav className={grid}>
        {SITES.map((site) => (
          <a
            key={site.href + site.title}
            className={card}
            href={site.href}
            target="_blank"
            rel="noreferrer"
          >
            <span className={cardTitle}>
              {site.title}
              <span className={cardArrow} aria-hidden>
                →
              </span>
            </span>
            <span className={cardDesc}>{site.desc}</span>
          </a>
        ))}
      </nav>

      <footer className={footer}>© {new Date().getFullYear()} Clove</footer>
    </main>
  );
}
