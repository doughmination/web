/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import { useEffect, useState } from "react";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const [flavor, setFlavor] = useState("cherry");

  useEffect(() => {
    setFlavor(document.documentElement.getAttribute("data-flavor") ?? "cherry");
    const onChange = (e: Event) =>
      setFlavor((e as CustomEvent<{ theme: string }>).detail.theme);
    document.addEventListener("themeChanged", onChange);
    return () => document.removeEventListener("themeChanged", onChange);
  }, []);

  return (
    <Sonner
      theme={flavor === "latte" ? "light" : "dark"}
      style={
        {
          "--normal-bg": "var(--bg)",
          "--normal-text": "var(--text)",
          "--normal-border": "var(--surface)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster, toast };
