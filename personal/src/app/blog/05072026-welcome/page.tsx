import type { Metadata } from "next";
import "@styles/pages/blog.css";

export const metadata: Metadata = {
  title: "Welcome to the blog | Clove Twilight",
  description:
    "Kicking off the blog with a quick intro to what I'll be posting here.",
  alternates: { canonical: "https://c.stupid.cat/blog/05072026-welcome" },
  openGraph: {
    type: "article",
    siteName: "c.stupid.cat",
    title: "Welcome to the blog",
    description:
      "Kicking off the blog with a quick intro to what I'll be posting here.",
    url: "https://c.stupid.cat/blog/05072026-welcome",
    locale: "en_GB",
    images: [
      {
        url: "https://c.stupid.cat/assets/favicon/favicon.png",
        alt: "Clove Twilight logo",
      },
    ],
  },
};

export default function WelcomePost() {
  return (
    <main className="blog-contents">
      <header className="blog-header">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="pfp"
          src="/assets/favicon/avatar.png"
          alt="Clove Twilight avatar"
        />
        <h1>Welcome</h1>
        <h2 className="pronouns">to my blog</h2>
      </header>

      <p>
        So Hi!
        <br />
        <br />
        I&apos;m Clove, and this will be moreso my own personal space to talk
        about what&apos;s going on in my life and what&apos;s new, what&apos;s
        not, etc.
        <br />
        <br />
        To introduce myself fully, I&apos;m a 21 year old developer from the UK,
        I am dating fiancèe, Ari. I am a transgender person and live as the
        online alias, Doughmination. I have various disorders, like CPTSD,
        Autism, Dyslexia and a few others I won&apos;t share here.
        <br />
        <br />
        I am a plural system, openly, and have (as of writing), 65 headmates,
        including myself. They may also write blogs, so hence why I mention them.
      </p>
    </main>
  );
}
