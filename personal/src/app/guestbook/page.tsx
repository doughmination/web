import type { Metadata } from "next";
import PageScripts from "../_components/PageScripts";

export const metadata: Metadata = {
  title: "Clove Twilight",
  description: "Sign Clove Twilight's guestbook — leave a message and say hello.",
  keywords: ["Clove Twilight", "c.stupid.cat", "guestbook", "messages", "sign"],
  alternates: { canonical: "https://c.stupid.cat/guestbook" },
  openGraph: {
    type: "website",
    siteName: "c.stupid.cat",
    title: "Clove Twilight",
    description:
      "Sign Clove Twilight's guestbook — leave a message and say hello.",
    url: "https://c.stupid.cat/guestbook",
    locale: "en_GB",
    images: [
      {
        url: "https://c.stupid.cat/assets/favicon/favicon.png",
        alt: "Clove Twilight logo",
      },
    ],
  },
};

export default function GuestbookPage() {
  return (
    <>
      {/* Warm up the origins this page's JS fetches on load */}
      <link rel="preconnect" href="https://doughmination.uk" crossOrigin="" />
      <link rel="dns-prefetch" href="https://doughmination.uk" />
      <link rel="preconnect" href="https://challenges.cloudflare.com" />
      <link rel="dns-prefetch" href="https://challenges.cloudflare.com" />

      <div className="hub friends-wrap guestbook-wrap">
        <header className="hub-header">
          <h1>Guestbook</h1>
          <p className="tagline">Leave a little note before you go &lt;3</p>
        </header>

        {/* Sign form */}
        <form id="gb-form" className="gb-form" autoComplete="off" noValidate>
          <div className="gb-field">
            <label htmlFor="gb-name">Name</label>
            <input
              type="text"
              id="gb-name"
              name="name"
              maxLength={40}
              required
              placeholder="what should I call you?"
            />
          </div>
          <div className="gb-field">
            <label htmlFor="gb-website">
              Website <span className="gb-optional">(optional)</span>
            </label>
            <input
              type="url"
              id="gb-website"
              name="website"
              maxLength={200}
              placeholder="https://your-cool-site.com"
            />
          </div>
          <div className="gb-field">
            <label htmlFor="gb-message">Message</label>
            <textarea
              id="gb-message"
              name="message"
              maxLength={500}
              rows={3}
              required
              placeholder="say hi!"
            ></textarea>
            <span className="gb-counter" id="gb-counter">
              0 / 500
            </span>
          </div>

          {/* Honeypot: hidden from humans, bots tend to fill it. */}
          <div className="gb-hp" aria-hidden="true">
            <label htmlFor="gb-url2">Leave this empty</label>
            <input
              type="text"
              id="gb-url2"
              name="url2"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Turnstile widget renders here when a site key is configured. */}
          <div id="gb-turnstile" className="gb-turnstile"></div>

          <div className="gb-actions">
            <button type="submit" id="gb-submit">
              Sign guestbook
            </button>
            <span className="gb-status" id="gb-status" role="status"></span>
          </div>
        </form>

        {/* Entries rendered by js/guestbook.js */}
        <div id="gb-entries" className="gb-entries" aria-live="polite">
          <p className="gb-empty">Loading messages…</p>
        </div>
      </div>

      <PageScripts
        scripts={[
          {
            src: "/js/guestbook.js",
            attrs: {
              "data-api": "https://doughmination.uk/v2/guestbook",
              "data-turnstile-key": "0x4AAAAAAB08ZhSxKn5rAD3d",
            },
          },
        ]}
      />
    </>
  );
}
