/* personal/src/app/projects/page.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import type { Metadata } from "next";
import { Tr } from "@components/chrome/i18nText";
import type { TranslationKey } from "@/i18n/translate";
import "@styles/pages/projects.css";

export const metadata: Metadata = {
  title: "Clove Nytrix Doughmination Twilight",
  description:
    "Explore the projects Clove Nytrix Doughmination Twilight actively builds and contributes to, from web apps to Discord bots.",
  keywords: [
    "Clove Nytrix Doughmination Twilight",
    "doughmination.gay",
    "projects",
    "portfolio",
    "developer",
    "open source",
  ],
  alternates: { canonical: "https://doughmination.gay/projects" },
  openGraph: {
    type: "website",
    siteName: "doughmination.gay",
    title: "Clove Nytrix Doughmination Twilight",
    description:
      "Explore the projects Clove Nytrix Doughmination Twilight actively builds and contributes to, from web apps to Discord bots.",
    url: "https://doughmination.gay/projects",
    locale: "en_GB",
    images: [
      {
        url: "https://m.doughmination.gay/img/avatars/favicon.png",
        alt: "Clove Nytrix Doughmination Twilight logo",
      },
    ],
  },
};

type Project = {
  href: string;
  img: string;
  alt: string;
  title: string;
  statusKey: TranslationKey;
  closed?: boolean;
  bioKey: TranslationKey;
  live?: string;
};

const GIRLS_NETWORK: Project[] = [
  {
    href: "https://security.girlsnetwork.dev",
    img: "https://m.doughmination.gay/img/projects/ghostwire.png",
    alt: "Ghostwire",
    title: "Ghostwire",
    statusKey: "projects.closedSource",
    closed: true,
    bioKey: "projects.bioGhostwire",
  },
  {
    href: "https://github.com/Girls-Network/GayBot-v2",
    img: "https://m.doughmination.gay/img/projects/gaybot.png",
    alt: "GayBot",
    title: "GayBot",
    statusKey: "projects.openSource",
    bioKey: "projects.bioGaybot",
  },
  {
    href: "https://github.com/Girls-Network/bansync",
    img: "https://m.doughmination.gay/img/projects/bansync.png",
    alt: "BanSync",
    title: "BanSync",
    statusKey: "projects.openSource",
    bioKey: "projects.bioBansync",
  },
];

const PERSONAL: Project[] = [
  {
    href: "https://github.com/doughmination/web/tree/main/mailbox",
    img: "https://m.doughmination.gay/img/avatars/favicon.png",
    alt: "Doughmination Mail",
    title: "Doughmination Mail",
    statusKey: "projects.openSource",
    bioKey: "projects.bioMail",
    live: "https://doughmination.tech",
  },
  {
    href: "https://github.com/doughmination/api",
    img: "https://m.doughmination.gay/img/avatars/favicon.png",
    alt: "API",
    title: "Doughmination API",
    statusKey: "projects.openSource",
    bioKey: "projects.bioApi",
    live: "https://doughmination.uk",
  },
  {
    href: "https://github.com/doughmination/utils",
    img: "https://m.doughmination.gay/img/avatars/favicon.png",
    alt: "Shortcuts Bot",
    title: "Shortcuts Bot",
    statusKey: "projects.openSource",
    bioKey: "projects.bioShortcuts",
  },
  {
    href: "https://github.com/doughmination/cf-error-worker",
    img: "https://m.doughmination.gay/img/projects/cf.png",
    alt: "CF Error Worker",
    title: "CF Error Worker",
    statusKey: "projects.openSource",
    bioKey: "projects.bioCfError",
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
              <Tr k={p.statusKey} />
            </span>
          </div>
          <p className={`project-card-bio`}>
            <Tr k={p.bioKey} />
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
          <Tr k="projects.viewLive" />
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
          src="https://m.doughmination.gay/img/avatars/favicon.png"
          alt="Clove Nytrix Doughmination Twilight avatar"
        />
        <h1>Clove Nytrix Doughmination Twilight</h1>
        <h2 className="pronouns">(fae/faer)</h2>
      </header>

      <br />
      <br />
      <br />

      <section className="section" id="personal-projects">
        <h2 className="section-title"><Tr k="projects.personalProjects" /></h2>
        <div className="project-grid">
          {PERSONAL.map((p) => (
            <ProjectCard key={p.href} p={p} />
          ))}
        </div>
      </section>

      <section className="section" id="girls-network">
        <h2 className="section-title"><Tr k="projects.girlsNetwork" /></h2>
        <div className="project-grid">
          {GIRLS_NETWORK.map((p) => (
            <ProjectCard key={p.href} p={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
