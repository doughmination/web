/* personal/src/components/SoundLink.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/*
 * A plain <a> that plays the click sound, usable from Server Component pages
 * (which can't attach onClick to a raw <a> themselves — that needs a Client
 * Component boundary). Forwards all standard anchor props.
 */

"use client";

import type { AnchorHTMLAttributes } from "react";
import { playClickSound } from "@lib/sound";

export default function SoundLink({
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...props}
      onClick={(e) => {
        playClickSound();
        onClick?.(e);
      }}
    />
  );
}
