/* src/app/providers.tsx
 * ESAL-2.3
 */

"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DoughminationProvider } from "@doughmination/react-api";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <DoughminationProvider>{children}</DoughminationProvider>
    </QueryClientProvider>
  );
}
