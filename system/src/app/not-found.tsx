/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import * as s from "./not-found.css";

const NotFound = () => {
  const pathname = usePathname();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <div className={s.page}>
      <div className={s.inner}>
        <h1 className={s.title}>404</h1>
        <p className={s.text}>Oops! Page not found</p>
        <a href="/" className={s.link}>
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
