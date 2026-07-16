import PageScripts from "./_components/PageScripts";
import Model3D from "@/components/chrome/Model3D";

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
        {/* 3D filigree frame (terminal.glb) as the border; the live terminal
            content is overlaid in the screen area by terminal.js below. */}
        <div className="terminal-3d">
          <Model3D
            src="/models/terminal.glb"
            alt="Ornate terminal frame"
            autoRotate={false}
            interactive={false}
            loading="eager"
            cameraOrbit="0deg 90deg 50%"
            className="terminal-frame"
            style={{
              position: "absolute",
              inset: 0,
              minHeight: 0,
              pointerEvents: "none",
            }}
          />
          <div className="terminal" id="terminal"></div>
        </div>
        <div id="fronting"></div>
        <div id="devices"></div>
        <div id="location"></div>
      </main>

      <div id="visitor-counter" role="status" aria-label="Visitor count"></div>

      {/* Home-page widgets (vanilla scripts ported from the original site) */}
      <PageScripts
        scripts={[
          "/js/terminal.js",
          "/js/fronting.js",
          "/js/devices.js",
          "/js/location.js",
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
