import type { Metadata } from "next";
import type { CSSProperties } from "react";
import DevInfo from "@/scripts/DevInfo";

export const metadata: Metadata = {
  title: "Clove Twilight",
  description:
    "What Clove Twilight has been coding lately — a live contribution heatmap and WakaTime coding stats.",
  keywords: [
    "Clove Twilight",
    "c.stupid.cat",
    "dev info",
    "coding stats",
    "WakaTime",
    "contributions",
    "developer",
  ],
  alternates: { canonical: "https://c.stupid.cat/dev-info" },
  openGraph: {
    type: "website",
    siteName: "c.stupid.cat",
    title: "Clove Twilight",
    description:
      "What Clove Twilight has been coding lately — a live contribution heatmap and WakaTime coding stats.",
    url: "https://c.stupid.cat/dev-info",
    locale: "en_GB",
    images: [
      {
        url: "https://c.stupid.cat/assets/favicon/favicon.png",
        alt: "Clove Twilight logo",
      },
    ],
  },
};

// [catppuccin color class, simpleicons slug, aria-label]
const TECH: [string, string, string][] = [
  ["red", "python", "Python"],
  ["mauve", "openjdk", "Java"],
  ["pink", "javascript", "JavaScript"],
  ["peach", "typescript", "TypeScript"],
  ["yellow", "gnubash", "Bash Script"],
  ["lavender", "html5", "HTML5"],
  ["teal", "css", "CSS"],
  ["blue", "markdown", "Markdown"],
  ["teal", "latex", "LaTeX"],
  ["blue", "react", "React"],
  ["sapphire", "vuedotjs", "Vue.js"],
  ["rosewater", "nextdotjs", "Next JS"],
  ["blue", "ejs", "EJS"],
  ["teal", "electron", "Electron.js"],
  ["red", "tailwindcss", "TailwindCSS"],
  ["lavender", "bootstrap", "Bootstrap"],
  ["pink", "nodedotjs", "NodeJS"],
  ["green", "express", "Express.js"],
  ["peach", "fastapi", "FastAPI"],
  ["maroon", "jsonwebtokens", "JWT"],
  ["rosewater", "wordpress", "WordPress"],
  ["teal", "postgresql", "Postgres"],
  ["lavender", "mysql", "MySQL"],
  ["blue", "sqlite", "SQLite"],
  ["green", "redis", "Redis"],
  ["sapphire", "npm", "NPM"],
  ["lavender", "pnpm", "PNPM"],
  ["maroon", "vite", "Vite"],
  ["mauve", "nodemon", "Nodemon"],
  ["green", "gradle", "Gradle"],
  ["blue", "eslint", "ESLint"],
  ["sapphire", "git", "Git"],
  ["sky", "github", "GitHub"],
  ["maroon", "githubactions", "GitHub Actions"],
  ["rosewater", "gitea", "Gitea"],
  ["lavender", "docker", "Docker"],
  ["mauve", "nginx", "Nginx"],
  ["sapphire", "cloudflare", "Cloudflare"],
  ["mauve", "vercel", "Vercel"],
  ["blue", "vscodium", "VSCodium"],
  ["red", "insomnia", "Insomnia"],
  ["teal", "ffmpeg", "FFmpeg"],
  ["red", "inkscape", "Inkscape"],
  ["pink", "arduino", "Arduino"],
  ["red", "raspberrypi", "Raspberry Pi"],
];

// [label, JSX value] — hardware rows
function HardwareRow({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  return (
    <div className="hw-row">
      <dt>{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export default function DevInfoPage() {
  return (
    <>
      {/* Warm up the origins this page's JS fetches on load */}
      <link rel="preconnect" href="https://doughmination.uk" crossOrigin="" />
      <link rel="dns-prefetch" href="https://doughmination.uk" />
      <link rel="preconnect" href="https://wakatime.com" />
      <link rel="dns-prefetch" href="https://wakatime.com" />

      <main className="waka">
        <header className="hub-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="pfp"
            src="/assets/favicon/avatar.png"
            alt="Clove Twilight avatar"
          />
          <h1>Clove Twilight</h1>
          <h2 className="pronouns">(fae/faer)</h2>
          <p className="tagline">Dev Info</p>
        </header>

        <details className="waka-section tech-stack" id="tech-stack">
          <summary className="section-title">Tech Stack</summary>
          <div className="dev-info" role="region" aria-label="Tech stack">
            {TECH.map(([color, slug, label]) => (
              <span
                key={slug}
                className={`tech-icon ${color}`}
                style={
                  {
                    "--si": `url('https://cdn.simpleicons.org/${slug}')`,
                  } as CSSProperties
                }
                role="img"
                aria-label={label}
              ></span>
            ))}
          </div>
        </details>

        <details className="waka-section hardware" id="waka-section-hardware">
          <summary className="section-title">Hardware</summary>
          <p className="hw-intro">This is the beast setup I daily-drive. ✨</p>
          <dl className="hw-list">
            <HardwareRow term="CPU">
              <a
                className="hw-item"
                href="https://uk.pcpartpicker.com/product/Pk62FT/amd-ryzen-9-9950x3d-43-ghz-16-core-processor-100-100000719wof"
              >
                AMD Ryzen 9 9950x3d 4.3 GHz 16-Core Processor
              </a>
            </HardwareRow>
            <HardwareRow term="GPU">
              <a
                className="hw-item"
                href="https://uk.pcpartpicker.com/product/GtXJ7P/xfx-speedster-merc-310-black-edition-radeon-rx-7900-xtx-24-gb-video-card-rx-79xmercb9"
              >
                XFX Speedster MERC 310 Black Edition Radeon RX 7900 XTX 24 GB
                Video Card
              </a>
            </HardwareRow>
            <HardwareRow term="RAM">
              <a
                className="hw-item"
                href="https://uk.pcpartpicker.com/product/LWVmP6/corsair-vengeance-64-gb-2-x-32-gb-ddr5-6000-cl40-memory-cmk64gx5m2b6000z40"
              >
                Corsair Vengeance 64 GB (2 x 32 GB) DDR5-6000 CL40 Memory
              </a>
            </HardwareRow>
            <HardwareRow term="Storage">
              <a
                className="hw-item"
                href="https://uk.pcpartpicker.com/product/YPKscf/acer-predator-gm7-1-tb-m2-2280-pcie-40-x4-nvme-solid-state-drive-bl9bwwr118"
              >
                2x 1TB NVMe
              </a>{" "}
              +{" "}
              <a
                className="hw-item"
                href="https://uk.pcpartpicker.com/product/fmfhP6/seagate-exos-x14-12-tb-35-7200-rpm-internal-hard-drive-st12000nm0008"
              >
                10TB HDD
              </a>
            </HardwareRow>
            <HardwareRow term="Motherboard">
              <a
                className="hw-item"
                href="https://uk.pcpartpicker.com/product/Q8KnTW/gigabyte-b850m-aorus-elite-wifi6e-ice-micro-atx-am5-motherboard-b850m-aorus-elite-wifi6e-ice"
              >
                Gigabyte B850M AORUS ELITE WIFI6E ICE Micro ATX AM5 Motherboard
              </a>
            </HardwareRow>
            <HardwareRow term="Cooling">
              <a
                className="hw-item"
                href="https://uk.pcpartpicker.com/product/YXFmP6/thermalright-aqua-elite-v3-6617-cfm-liquid-cpu-cooler-aqua-elite-360-white-v3"
              >
                Thermalright Aqua Elite V3 66.17 CFM Liquid CPU Cooler
              </a>
            </HardwareRow>
            <HardwareRow term="Keyboard">
              <a
                className="hw-item"
                href="https://en.akkogear.com/product/sakura-miku-5108b-plus-mechanical-keyboard/"
              >
                Akko Sakura Miku 5108B Plus
              </a>
            </HardwareRow>
            <HardwareRow term="Mouse">
              <a
                className="hw-item"
                href="https://www.logitechg.com/en-gb/shop/p/g502-x-plus-wireless-lightforce.910-006163"
              >
                Logitech G502 X Gaming Lightspeed Wireless
              </a>
            </HardwareRow>
            <HardwareRow term="Monitor(s)">
              <a
                className="hw-item"
                href="https://uk.pcpartpicker.com/product/XpVfrH/gigabyte-g34wqcp-340-3440-x-1440-180-hz-curved-monitor-g34wqcp"
              >
                Gigabyte G34WQCP 34.0&quot; 3440 x 1440 180 Hz Curved Monitor
              </a>
            </HardwareRow>
            <HardwareRow term="Headphones">
              <a className="hw-item" href="https://m.yowu.com/product/detail?sku=3588">
                Yowu Cat Ear Headphones Hatsune Miku NX
              </a>
            </HardwareRow>
            <HardwareRow term="Microphone">
              <a className="hw-item" href="https://amzn.eu/d/00FjYEzR">
                Aokeo AK-60 USB Microphone
              </a>
            </HardwareRow>
            <HardwareRow term="OS">
              <a className="hw-item" href="https://archlinux.org/download/">
                Arch Linux
              </a>{" "}
              |{" "}
              <a
                className="hw-item"
                href="https://www.microsoft.com/en-us/software-download/windows11"
              >
                Windows 11
              </a>
            </HardwareRow>
          </dl>
          {/* hidden pokéball: find & click it to unlock the Pokémon cats */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            id="pokeball-secret"
            src="/assets/misc/pokeball.svg"
            alt=""
            aria-hidden="true"
          />
        </details>

        <DevInfo />
      </main>
    </>
  );
}
