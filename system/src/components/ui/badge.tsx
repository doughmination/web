/* system/src/components/ui/badge.tsx
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { badge } from "./ui.css";

type BadgeVariants = NonNullable<Parameters<typeof badge>[0]>;

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariants["variant"];
}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badge({ variant }), className)} {...props} />;
}

export { Badge, badge as badgeVariants };
