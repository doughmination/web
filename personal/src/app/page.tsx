import PageScripts from "./_components/PageScripts";

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
        <div className="terminal" id="terminal"></div>
        <div id="fronting"></div>
        <div id="battery"></div>
      </main>

      <div id="visitor-counter" role="status" aria-label="Visitor count"></div>

      {/* Home-page widgets (vanilla scripts ported from the original site) */}
      <PageScripts
        scripts={[
          "/js/terminal.js",
          "/js/fronting.js",
          "/js/battery.js",
          {
            src: "/js/visitor-counter.js",
            attrs: {
              "data-target": "#visitor-counter",
              "data-namespace": "clove-is-a-dev",
              "data-key": "hits",
              "data-label": "visitors",
            },
          },
        ]}
      />
    </>
  );
}
