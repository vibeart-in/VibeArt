import React from "react";
import { cn } from "@/src/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-white/5", className)} {...props} />;
}

export default function Loading() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-black pb-40">
      {/* background grid */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "#000000",
          backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.2) 1.5px, transparent 1.5px)`,
          backgroundSize: "30px 30px",
          backgroundPosition: "0 0",
        }}
      />

      {/* content container */}
      <div className="z-10 my-8 mt-20 flex w-full flex-col items-center justify-center px-4">
        {/* main card */}
        <div className="flex w-full max-w-6xl flex-col justify-between gap-8 rounded-[50px] bg-[#111111] p-6 lg:flex-row">
          {/* Mobile: Cover image first */}
          <div className="flex flex-grow items-center justify-center lg:hidden">
            <Skeleton className="h-[400px] w-full max-w-[400px] rounded-[44px]" />
          </div>

          {/* left column - content */}
          <div className="flex w-full flex-shrink-0 flex-col gap-4 lg:w-[500px]">
            {/* title + description */}
            <Skeleton className="h-10 w-3/4 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>

            {/* tags + author + duration */}
            <div className="mr-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-16 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-14 rounded-full" />
              </div>

              <div className="flex flex-row gap-4 sm:flex-row sm:items-center">
                {/* duration */}
                <Skeleton className="h-10 w-24 rounded-full" />
                {/* author */}
                <Skeleton className="h-10 w-32 rounded-full" />
              </div>
            </div>

            {/* examples */}
            <div className="mr-8 mt-4">
              <Skeleton className="mb-2 h-6 w-24" />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-xl" />
                ))}
              </div>
            </div>
          </div>

          {/* Desktop: Cover image on right */}
          <div className="hidden lg:flex lg:flex-grow lg:items-center lg:justify-center">
            <Skeleton className="h-[500px] w-[500px] rounded-[44px]" />
          </div>
        </div>

        {/* generation history */}
        <div className="mt-8 w-full max-w-[80vw]">
          <Skeleton className="mb-4 h-8 w-48" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* input box footer */}
      <footer className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 justify-center px-2">
        <Skeleton className="h-16 w-[90vw] max-w-2xl rounded-full" />
      </footer>
    </div>
  );
}
