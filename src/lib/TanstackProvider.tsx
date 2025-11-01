"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import DialogRotator from "../components/home/DialogRotator";

interface TanStackProviderProps {
  children: React.ReactNode;
}

export const TanStackProvider = ({ children }: TanStackProviderProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // avoid instant refetch on mount after SSR or previous nav
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <DialogRotator
        minDelaySec={30}
        maxDelaySec={300}
        cacheTtlSec={60 * 60}
        delayAfterCycleSec={60 * 60}
      />
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
};
