/* Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DoughminationProvider } from "@doughmination/react-api";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * Reads the auth token from localStorage on every request, so a token that
 * arrives after a PocketID login (or is cleared on logout) is always current
 * without rebuilding the client.
 */
function readToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <DoughminationProvider token={readToken}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {children}
        </TooltipProvider>
      </DoughminationProvider>
    </QueryClientProvider>
  );
}
