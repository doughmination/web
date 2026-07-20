import type { Metadata } from "next";
import "@styles/pages/projects.css";

export const metadata: Metadata = {
  title: "Clove Twilight",
  description:
    "Explore the projects Clove Twilight actively builds and contributes to, from web apps to Discord bots.",
  keywords: [
    "Clove Twilight",
    "c.stupid.cat",
    "projects",
    "portfolio",
    "developer",
    "open source",
  ],
  alternates: { canonical: "https://c.stupid.cat/projects" },
  openGraph: {
    type: "website",
    siteName: "c.stupid.cat",
    title: "Clove Twilight",
    description:
      "Explore the projects Clove Twilight actively builds and contributes to, from web apps to Discord bots.",
    url: "https://c.stupid.cat/projects",
    locale: "en_GB",
    images: [
      {
        url: "https://c.stupid.cat/assets/favicon/favicon.png",
        alt: "Clove Twilight logo",
      },
    ],
  },
};

type Project = {
  href: string;
  img: string;
  alt: string;
  title: string;
  status: string;
  closed?: boolean;
  bio: string;
  live?: string;
};

const GIRLS_NETWORK: Project[] = [
  {
    href: "https://security.girlsnetwork.dev",
    img: "/assets/projects/ghostwire.png",
    alt: "Ghostwire",
    title: "Ghostwire",
    status: "Closed Source",
    closed: true,
    bio: "The private security bot and brains behind everything major in Girls.",
  },
  {
    href: "https://github.com/Girls-Network/GayBot-v2",
    img: "/assets/projects/gaybot.png",
    alt: "GayBot",
    title: "GayBot",
    status: "Open Source",
    bio: "A Discord bot for LGBTQIA+ servers — keyword emoji reactions, identity profiles, lookups, and a few fun extras.",
  },
  {
    href: "https://github.com/Girls-Network/bansync",
    img: "/assets/projects/bansync.png",
    alt: "BanSync",
    title: "BanSync",
    status: "Open Source",
    bio: "Syncs bans from Girls to our partner servers.",
  },
];

const PERSONAL: Project[] = [
  {
    href: "https://github.com/doughmination/web/tree/main/mailbox",
    img: "/assets/favicon/avatar.png",
    alt: "Doughmination Mail",
    title: "Doughmination Mail",
    status: "Open Source",
    bio: "My personal inbox, themed on Catppuchin Mocha, pink accent",
    live: "https://doughmination.tech",
  },
  {
    href: "https://github.com/doughmination/api",
    img: "/assets/favicon/avatar.png",
    alt: "API",
    title: "Doughmination API",
    status: "Open Source",
    bio: "My personal API, which I dont mind people hooking into",
    live: "https://doughmination.uk",
  },
  {
    href: "https://github.com/doughmination/utils",
    img: "/assets/favicon/favicon.png",
    alt: "Shortcuts Bot",
    title: "Shortcuts Bot",
    status: "Open Source",
    bio: "My personal Discord bot I use for utilies",
  },
  {
    href: "https://github.com/doughmination/cf-error-worker",
    img: "/assets/projects/cf.png",
    alt: "CF Error Worker",
    title: "CF Error Worker",
    status: "Open Source",
    bio: "This is what displays the error 500-600 when a page goes down",
  },
];

function ProjectCard({ p }: { p: Project }) {
  return (
    <div className="project-card">
      {/* Main body links to the repo; the Live button is a separate link
          (anchors can't be nested inside another anchor). */}
      <a
        className="project-card-main"
        href={p.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="project-card-img" src={p.img} alt={p.alt} />
        <div className="project-card-body">
          <div className="project-card-head">
            <span className="project-card-title">{p.title}</span>
            <span className={`project-card-status${p.closed ? " closed" : ""}`}>
              {p.status}
            </span>
          </div>
          <p className={`project-card-bio`}>
            {p.bio}
          </p>
        </div>
      </a>
      {p.live && (
        <a
          className="project-card-live"
          href={p.live}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Live ↗
        </a>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <main>
      <header className="hub-header">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="pfp"
          src="/assets/favicon/avatar.png"
          alt="Clove Twilight avatar"
        />
        <h1>Clove Twilight</h1>
        <h2 className="pronouns">(fae/faer)</h2>
      </header>

      <br />
      <br />
      <br />

      <section className="section" id="personal-projects">
        <h2 className="section-title">Personal Projects</h2>
        <div className="project-grid">
          {PERSONAL.map((p) => (
            <ProjectCard key={p.href} p={p} />
          ))}
        </div>
      </section>

      <section className="section" id="girls-network">
        <h2 className="section-title">Girls Network</h2>
        <div className="project-grid">
          {GIRLS_NETWORK.map((p) => (
            <ProjectCard key={p.href} p={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
