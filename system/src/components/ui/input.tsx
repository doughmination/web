/*
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import * as s from "./ui.css";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return <input type={type} className={cn(s.input, className)} ref={ref} {...props} />;
  },
);
Input.displayName = "Input";

export { Input };
