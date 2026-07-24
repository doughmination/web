import {
  page,
  header,
  name,
  letter,
  tagline,
  actions,
  btnPrimary,
  btnSecondary,
  grid,
  card,
  cardTitle,
  cardArrow,
  cardDesc,
  footer,
} from "@styles/home.css";

// PocketID login lives here; the signup page is on this site at /signup.
const POCKETID = "https://doughmination.xyz";

// ── Edit me ──────────────────────────────────────────────
// Add / change your sites here. That's the only part you touch.
const SITES = [
  {
    title: "Clove Stupid cat",
    desc: "My personal website",
    href: "https://c.stupid.cat",
  },
  {
    title: "Doughmination Mail",
    desc: "My private email service",
    href: "https://doughmination.tech",
  },
  {
    title: "Doughmination System",
    desc: "System Tracker and Headmate Management",
    href: "https://doughmination.co.uk",
  },
  {
    title: "Doughmination API",
    desc: "Public API have made",
    href: "https://doughmination.uk",
  },
];

const ME = {
  name: "doughmination.info",
  tagline: "A little map to everything I make.",
};
// ─────────────────────────────────────────────────────────

export default function Page() {
  return (
    <main className={page}>
      <div className={actions}>
        <a className={btnSecondary} href={POCKETID}>Log in</a>
        <a className={btnPrimary} href="/signup">Sign up</a>
      </div>

      <header className={header}>
        <h1 className={name} aria-label={ME.name}>
          {[...ME.name].map((ch, i) => (
            <span
              key={i}
              className={letter}
              aria-hidden
              style={{ animationDelay: `${(i * 0.06).toFixed(2)}s` }}
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
        </h1>
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

      <footer className={footer}>© {new Date().getFullYear()} Doughmination System</footer>
    </main>
  );
}
