/* src/app/page.tsx
 * ESAL-2.3
 */

import { Github } from "react-bootstrap-icons";
import Fronting from "@scripts/Fronting";
import Devices from "@scripts/Devices";
import Location from "@scripts/Location";
import VisitorCounter from "@scripts/VisitorCounter";
import "@styles/pages/index.css";

export default function Home() {
  return (
    <>
      <main className="hub">
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
        <section className="about">
          <p className="about-bio">
            Transfem developer from Southampton, UK. I make projects,
            personal-site nonsense, and run a small corner of the internet under
            the trade mark &ldquo;doughmination system&rdquo;. Big on Linux,
            Catppuccin, and cats.
          </p>
          <a
            className="about-source"
            href="hhttps://github.com/doughmination/web/tree/main/personal"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github aria-hidden="true" />
            View source on GitHub
          </a>
        </section>

        <Fronting />
        <Devices />
        <Location />
      </main>

      <VisitorCounter namespace="clove-is-a-dev" hitKey="hits" label="visitors" />
    </>
  );
}
