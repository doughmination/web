import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clove Twilight",
  description:
    "A collection of the 88x31 pixel buttons featured across Clove Twilight's site — grab one and link back.",
  keywords: [
    "Clove Twilight",
    "c.stupid.cat",
    "88x31",
    "buttons",
    "web buttons",
    "personal",
  ],
  alternates: { canonical: "https://c.stupid.cat/88x31" },
  openGraph: {
    type: "website",
    siteName: "c.stupid.cat",
    title: "Clove Twilight",
    description:
      "A collection of the 88x31 pixel buttons featured across Clove Twilight's site — grab one and link back.",
    url: "https://c.stupid.cat/88x31",
    locale: "en_GB",
    images: [
      {
        url: "https://c.stupid.cat/assets/favicon/favicon.png",
        alt: "Clove Twilight logo",
      },
    ],
  },
};

type Button = {
  img: string;
  alt: string;
  href?: string;
  internal?: boolean;
  eager?: boolean;
};

const BUTTONS: Button[] = [
  // coding / web
  { href: "https://doughmination.uk", img: "doughmination.png", alt: "Doughmination", eager: true },
  { href: "https://code.visualstudio.com", img: "vscbutton.png", alt: "Made with Visual Studio Code" },
  { img: "htmldream.png", alt: "I dream in HTML" },
  { href: "https://validator.w3.org/", img: "valid-html5.png", alt: "Valid HTML5" },
  { href: "https://jigsaw.w3.org/css-validator/", img: "valid-css.png", alt: "Valid CSS" },
  { href: "https://yesterweb.org/no-to-web3/", img: "noweb32.png", alt: "Keep the web free" },
  { img: "nft.png", alt: "No NFTs, no thanks" },
  { img: "nowebp.png", alt: "No WEBp" },
  // software / os
  { href: "https://www.linux.org/", img: "linux.png", alt: "Made on GNU/Linux" },
  { href: "https://archlinux.org/", img: "arch.png", alt: "Arch Linux" },
  { href: "https://kde.org/plasma-desktop/", img: "kde.png", alt: "KDE Plasma" },
  { href: "https://www.mozilla.org/firefox/", img: "firefox.png", alt: "Firefox" },
  { img: "no-chrome.png", alt: "Anything but Chrome" },
  { href: "https://support.apple.com/en-gb/121552", img: "macbutton.png", alt: "Made on a Mac" },
  { href: "https://www.win-rar.com/", img: "winrar4.png", alt: "WinRAR" },
  { href: "https://microslop.com/", img: "microslop.png", alt: "Stop Microsoft" },
  { img: "linuxisbetterthanwindows.png", alt: "Linux is better than Windows" },
  { img: "dark-mode.png", alt: "Made for dark mode" },
  // pride / identity
  { href: "https://valerie.vg/", img: "estrogen.png", alt: "Powered by estrogen" },
  { img: "trans.png", alt: "Transgender" },
  { img: "fae-faer.png", alt: "Fae/Faer Pronouns" },
  { img: "transnow.png", alt: "Trans rights now" },
  { img: "queerpride.png", alt: "Queer pride" },
  { img: "girlsnow.png", alt: "Girls Now" },
  { img: "skirt.png", alt: "Let boys wear skirts" },
  { img: "cutesocks.png", alt: "I wear cute socks!" },
  // causes
  { href: "https://archive.org/details/zines-anti-fascism", img: "antifa.png", alt: "No fascism, no bigotry" },
  { href: "https://www.youtube.com/watch?v=7AQbhes-Ntw", img: "meltice.png", alt: "Melt ICE" },
  { href: "https://www.map.org.uk/", img: "palestine.png", alt: "Free Palestine" },
  { href: "https://u24.gov.ua/", img: "ukraine.png", alt: "Slava Ukraini" },
  // misc
  { href: "/discord", img: "discord.png", alt: "Discord", internal: true },
  { img: "bestvieweddesktop.png", alt: "Best viewed on desktop" },
  { img: "killmenow.png", alt: "Kill me now" },
  { href: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", img: "no.png", alt: "Don't click here, no!" },
  { href: "https://www.minecraft.net", img: "minecraft.png", alt: "Minecraft" },
  // anime
  { img: "pokemon.png", alt: "Pokémon" },
  { href: "https://www.youtube.com/watch?v=VEj0cuqVJ-I", img: "caramelldansen.png", alt: "Caramelldansen" },
  { img: "femboy.png", alt: "Femboy" },
  { img: "blink.png", alt: "Anime blink" },
  { href: "https://www.youtube.com/watch?v=_-2dIuV34cs", img: "miku.png", alt: "This site is Miku approved" },
  { img: "tummy.png", alt: "Anime tummy supporter" },
  { href: "https://www.youtube.com/watch?v=9lNZ_Rnr7Jc", img: "badapple.png", alt: "Bad Apple!!" },
];

function ButtonImg({ b }: { b: Button }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/assets/88x31/${b.img}`}
      alt={b.alt}
      loading={b.eager ? "eager" : "lazy"}
    />
  );
}

export default function ButtonsPage() {
  return (
    <>
      <link rel="stylesheet" href="/css/pages/88x31.css" precedence="page" />
      <div className="hub">
        <header className="hub-header">
          <h1>88x31 Buttons</h1>
          <p className="tagline">The little badges from around my site, all in one spot</p>
        </header>

        <div className="button-page">
          <main className="button-wall" aria-label="88x31 buttons">
            {BUTTONS.map((b) =>
              b.href ? (
                <a
                  key={b.img}
                  href={b.href}
                  {...(b.internal
                    ? {}
                    : { target: "_blank", rel: "noopener noreferrer" })}
                >
                  <ButtonImg b={b} />
                </a>
              ) : (
                <ButtonImg key={b.img} b={b} />
              )
            )}
          </main>
        </div>
      </div>
    </>
  );
}
