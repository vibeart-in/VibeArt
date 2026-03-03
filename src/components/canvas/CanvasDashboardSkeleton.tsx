"use client";

import { Search, LayoutGrid, List, Sparkles, Globe, ArrowRight, Plus } from "lucide-react";

export default function CanvasDashboardSkeleton() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white selection:bg-purple-500/30">
      <div className="relative z-10 mx-auto max-w-[1800px] p-6 pt-24 md:p-8 lg:p-12">
        {/* Hero Header Skeleton */}
        <div className="relative mb-16 overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/30 p-8 backdrop-blur-2xl md:p-16">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5" />
          <div className="absolute inset-0 ml-60 bg-[url('https://i.pinimg.com/1200x/c1/c4/dc/c1c4dc5e235f85579f4d51abc05a7259.jpg')] bg-cover bg-right opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />

          <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md">
                <Sparkles className="size-4 text-accent/80" />
                <span className="text-sm font-medium text-accent/80">
                  AI-Powered Infinity Canvas
                </span>
              </div>

              <div className="space-y-4">
                <div className="h-16 w-96 max-w-full animate-pulse rounded-lg bg-white/5" />
                <div className="h-24 w-full max-w-xl animate-pulse rounded-lg bg-white/5" />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="h-14 w-48 animate-pulse rounded-full bg-white/10" />
                <div className="h-14 w-56 animate-pulse rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        </div>

        {/* Templates Slider Skeleton */}
        <div className="mb-12">
          <div className="mb-4 flex items-center gap-4">
            <div className="h-7 w-32 animate-pulse rounded bg-white/5" />
          </div>
          <div className="group/slider relative -mx-6 overflow-hidden px-6 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12">
            <div className="flex gap-4 overflow-x-hidden pb-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-48 w-72 flex-shrink-0 animate-pulse rounded-2xl bg-neutral-800/50"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Toolbar Skeleton */}
        <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex w-full items-center gap-1 rounded-2xl border border-white/10 bg-black/40 p-1.5 backdrop-blur-xl md:w-auto">
            {["Projects", "Community", "Templates"].map((tab) => (
              <div key={tab} className="h-10 w-28 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>

          <div className="flex w-full items-center gap-4 md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
              <div className="h-11 w-full animate-pulse rounded-2xl border border-white/10 bg-black/40" />
            </div>

            <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-black/40 p-1.5 backdrop-blur-xl">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-white/5" />
              <div className="h-10 w-10 animate-pulse rounded-xl bg-white/5" />
            </div>
          </div>
        </div>

        {/* Projects Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {/* New Canvas Card Skeleton */}
          <div className="relative aspect-video overflow-hidden rounded-3xl border border-white/10 bg-black/40">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="flex size-16 animate-pulse items-center justify-center rounded-full bg-white/5" />
              <div className="h-5 w-40 animate-pulse rounded bg-white/5" />
            </div>
          </div>

          {/* Project Cards Skeleton */}
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="relative flex flex-col overflow-hidden rounded-3xl border border-white/5 bg-neutral-900/50"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                <div className="size-full animate-pulse bg-neutral-800" />
              </div>

              <div className="relative p-5">
                <div className="absolute -top-6 right-5 h-6 w-20 animate-pulse rounded-full bg-neutral-900/80" />
                <div className="h-6 w-3/4 animate-pulse rounded bg-white/5" />
                <div className="mt-2 h-4 w-full animate-pulse rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
