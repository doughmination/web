import type { Metadata } from "next";

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
  placeholder?: boolean;
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
    href: "https://git.gay/doughmination/shortcuts-bot",
    img: "/assets/favicon/favicon.png",
    alt: "Shortcuts Bot",
    title: "Shortcuts Bot",
    status: "Open Source",
    bio: "Add a short description for Shortcuts Bot here.",
    placeholder: true,
  },
  {
    href: "https://git.gay/doughmination/ModUpdateChecker",
    img: "/assets/projects/modupdatechecker.png",
    alt: "Mod Update Checker",
    title: "Mod Update Checker",
    status: "Open Source",
    bio: "Add a short description for Mod Update Checker here.",
    placeholder: true,
  },
  {
    href: "https://git.gay/doughmination/Uzi-DOORman",
    img: "/assets/projects/uzi-doorman.png",
    alt: "Uzi Doorman",
    title: "Uzi Doorman",
    status: "Open Source",
    bio: "Add a short description for Uzi Doorman here.",
    placeholder: true,
  },
  {
    href: "https://git.gay/doughmination/widget-script",
    img: "/assets/favicon/avatar.png",
    alt: "Widget-v2 Script",
    title: "Widget-v2 Script",
    status: "Open Source",
    bio: "Add a short description for Widget-v2 Script here.",
    placeholder: true,
  },
];

function ProjectCard({ p }: { p: Project }) {
  return (
    <a className="project-card" href={p.href}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="project-card-img" src={p.img} alt={p.alt} />
      <div className="project-card-body">
        <div className="project-card-head">
          <span className="project-card-title">{p.title}</span>
          <span className={`project-card-status${p.closed ? " closed" : ""}`}>
            {p.status}
          </span>
        </div>
        <p className={`project-card-bio${p.placeholder ? " is-placeholder" : ""}`}>
          {p.bio}
        </p>
      </div>
    </a>
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

      <section className="section" id="girls-network">
        <h2 className="section-title">Girls Network</h2>
        <div className="project-grid">
          {GIRLS_NETWORK.map((p) => (
            <ProjectCard key={p.href} p={p} />
          ))}
        </div>
      </section>

      <section className="section" id="personal-projects">
        <h2 className="section-title">Personal Projects</h2>
        <div className="project-grid">
          {PERSONAL.map((p) => (
            <ProjectCard key={p.href} p={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
