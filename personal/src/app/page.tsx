/* personal/src/app/page.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import { Github } from "react-bootstrap-icons";
import Fronting from "@scripts/Fronting";
import Devices from "@scripts/Devices";
import Location from "@scripts/Location";
import VisitorCounter from "@scripts/VisitorCounter";
import { useLanguage } from "@/i18n/LanguageProvider";
import "@styles/pages/index.css";

export default function Home() {
  const { t } = useLanguage();

  return (
    <>
      <main className="hub">
        <header className="hub-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="pfp"
            src="https://m.doughmination.gay/img/avatars/favicon.png"
            alt={t("home.title")}
          />
          <h1>{t("home.title")}</h1>
          <h2 className="pronouns">(fae/faer)</h2>
        </header>
        <section className="about">
          <p className="about-bio">{t("home.bio")}</p>
          <a
            className="about-source"
            href="https://github.com/doughmination/web/tree/main/personal"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github aria-hidden="true" />
            {t("home.viewSource")}
          </a>
        </section>

        <Fronting />
        <Devices />
        <Location />
        <VisitorCounter namespace="dough" hitKey="hits" />
      </main>

      
    </>
  );
}
