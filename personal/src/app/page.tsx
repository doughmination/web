import { Git } from "react-bootstrap-icons";
import Fronting from "@scripts/Fronting";
import Devices from "@scripts/Devices";
import Location from "@scripts/Location";
import VisitorCounter from "@scripts/VisitorCounter";

export default function Home() {
  return (
    <>
      <link rel="stylesheet" href="/css/pages/index.css" precedence="page" />
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
            href="https://codeberg.org/clove/web/src/branch/main/personal"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Git aria-hidden="true" />
            View source on Codeberg
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
