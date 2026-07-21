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
  const [flavor, setFlavor] = useState("mocha");

  useEffect(() => {
    setFlavor(document.documentElement.getAttribute("data-flavor") ?? "mocha");
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
          "--normal-bg": "var(--background)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster, toast };
