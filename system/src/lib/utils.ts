/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { clsx, type ClassValue } from "clsx";

// tailwind-merge is no longer needed — styles are vanilla-extract classes now.
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
