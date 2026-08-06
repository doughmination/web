/* personal/src/app/dev-info/page.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import DevInfo from "@scripts/DevInfo";
import SoundLink from "@components/SoundLink";
import { Tr } from "@components/chrome/i18nText";
import "@styles/pages/dev-info.css";

export const metadata: Metadata = {
  title: "Clove Nytrix Doughmination Twilight",
  description:
    "What Clove Nytrix Doughmination Twilight has been coding lately — a live contribution heatmap and WakaTime coding stats.",
  keywords: [
    "Clove Nytrix Doughmination Twilight",
    "doughmination.gay",
    "dev info",
    "coding stats",
    "WakaTime",
    "contributions",
    "developer",
  ],
  alternates: { canonical: "https://doughmination.gay/dev-info" },
  openGraph: {
    type: "website",
    siteName: "doughmination.gay",
    title: "Clove Nytrix Doughmination Twilight",
    description:
      "What Clove Nytrix Doughmination Twilight has been coding lately — a live contribution heatmap and WakaTime coding stats.",
    url: "https://doughmination.gay/dev-info",
    locale: "en_GB",
    images: [
      {
        url: "https://m.doughmination.gay/img/avatars/favicon.png",
        alt: "Clove Nytrix Doughmination Twilight logo",
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
  term: ReactNode;
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
            src="https://m.doughmination.gay/img/avatars/favicon.png"
            alt="Clove Nytrix Doughmination Twilight avatar"
          />
          <h1>Clove Nytrix Doughmination Twilight</h1>
          <h2 className="pronouns">(fae/faer)</h2>
          <p className="tagline"><Tr k="devInfo.tagline" /></p>
        </header>

        <details className="waka-section tech-stack" id="tech-stack">
          <summary className="section-title"><Tr k="devInfo.techStack" /></summary>
          <div className="dev-info" role="region" aria-label="Tech stack">
            {TECH.map(([color, slug, label]) => (
              <span
                key={slug}
                className={`tech-icon ${color}`}
                style={
                  {
                    "--si": `url('https://m.doughmination.gay/img/icons/${slug}.svg')`,
                  } as CSSProperties
                }
                role="img"
                aria-label={label}
              ></span>
            ))}
          </div>
        </details>

        <details className="waka-section hardware" id="waka-section-hardware">
          <summary className="section-title"><Tr k="devInfo.hardware" /></summary>
          <p className="hw-intro"><Tr k="devInfo.hardwareIntro" /></p>
          <dl className="hw-list">
            <HardwareRow term="CPU">
              <SoundLink
                className="hw-item"
                href="https://uk.pcpartpicker.com/product/Pk62FT/amd-ryzen-9-9950x3d-43-ghz-16-core-processor-100-100000719wof"
              >
                AMD Ryzen 9 9950x3d 4.3 GHz 16-Core Processor
              </SoundLink>
            </HardwareRow>
            <HardwareRow term="GPU">
              <SoundLink
                className="hw-item"
                href="https://uk.pcpartpicker.com/product/GtXJ7P/xfx-speedster-merc-310-black-edition-radeon-rx-7900-xtx-24-gb-video-card-rx-79xmercb9"
              >
                XFX Speedster MERC 310 Black Edition Radeon RX 7900 XTX 24 GB
                Video Card
              </SoundLink>
            </HardwareRow>
            <HardwareRow term="RAM">
              <SoundLink
                className="hw-item"
                href="https://uk.pcpartpicker.com/product/LWVmP6/corsair-vengeance-64-gb-2-x-32-gb-ddr5-6000-cl40-memory-cmk64gx5m2b6000z40"
              >
                Corsair Vengeance 64 GB (2 x 32 GB) DDR5-6000 CL40 Memory
              </SoundLink>
            </HardwareRow>
            <HardwareRow term={<Tr k="devInfo.hwStorage" />}>
              <SoundLink
                className="hw-item"
                href="https://uk.pcpartpicker.com/product/YPKscf/acer-predator-gm7-1-tb-m2-2280-pcie-40-x4-nvme-solid-state-drive-bl9bwwr118"
              >
                2x 1TB NVMe
              </SoundLink>{" "}
              +{" "}
              <SoundLink
                className="hw-item"
                href="https://uk.pcpartpicker.com/product/fmfhP6/seagate-exos-x14-12-tb-35-7200-rpm-internal-hard-drive-st12000nm0008"
              >
                10TB HDD
              </SoundLink>
            </HardwareRow>
            <HardwareRow term={<Tr k="devInfo.hwMotherboard" />}>
              <SoundLink
                className="hw-item"
                href="https://uk.pcpartpicker.com/product/Q8KnTW/gigabyte-b850m-aorus-elite-wifi6e-ice-micro-atx-am5-motherboard-b850m-aorus-elite-wifi6e-ice"
              >
                Gigabyte B850M AORUS ELITE WIFI6E ICE Micro ATX AM5 Motherboard
              </SoundLink>
            </HardwareRow>
            <HardwareRow term={<Tr k="devInfo.hwCooling" />}>
              <SoundLink
                className="hw-item"
                href="https://uk.pcpartpicker.com/product/YXFmP6/thermalright-aqua-elite-v3-6617-cfm-liquid-cpu-cooler-aqua-elite-360-white-v3"
              >
                Thermalright Aqua Elite V3 66.17 CFM Liquid CPU Cooler
              </SoundLink>
            </HardwareRow>
            <HardwareRow term={<Tr k="devInfo.hwKeyboard" />}>
              <SoundLink
                className="hw-item"
                href="https://en.akkogear.com/product/sakura-miku-5108b-plus-mechanical-keyboard/"
              >
                Akko Sakura Miku 5108B Plus
              </SoundLink>
            </HardwareRow>
            <HardwareRow term={<Tr k="devInfo.hwMouse" />}>
              <SoundLink
                className="hw-item"
                href="https://www.logitechg.com/en-gb/shop/p/g502-x-plus-wireless-lightforce.910-006163"
              >
                Logitech G502 X Gaming Lightspeed Wireless
              </SoundLink>
            </HardwareRow>
            <HardwareRow term={<Tr k="devInfo.hwMonitors" />}>
              <SoundLink
                className="hw-item"
                href="https://uk.pcpartpicker.com/product/XpVfrH/gigabyte-g34wqcp-340-3440-x-1440-180-hz-curved-monitor-g34wqcp"
              >
                Gigabyte G34WQCP 34.0&quot; 3440 x 1440 180 Hz Curved Monitor
              </SoundLink>
            </HardwareRow>
            <HardwareRow term={<Tr k="devInfo.hwHeadphones" />}>
              <SoundLink className="hw-item" href="https://m.yowu.com/product/detail?sku=3588">
                Yowu Cat Ear Headphones Hatsune Miku NX
              </SoundLink>
            </HardwareRow>
            <HardwareRow term={<Tr k="devInfo.hwMicrophone" />}>
              <SoundLink className="hw-item" href="https://amzn.eu/d/00FjYEzR">
                Aokeo AK-60 USB Microphone
              </SoundLink>
            </HardwareRow>
            <HardwareRow term="OS">
              <SoundLink className="hw-item" href="https://archlinux.org/download/">
                Arch Linux
              </SoundLink>{" "}
              |{" "}
              <SoundLink
                className="hw-item"
                href="https://www.microsoft.com/en-us/software-download/windows11"
              >
                Windows 11
              </SoundLink>
            </HardwareRow>
          </dl>
        </details>

        <DevInfo />
      </main>
    </>
  );
}