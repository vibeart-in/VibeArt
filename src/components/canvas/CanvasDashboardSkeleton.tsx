"use client";

import { Search, LayoutGrid, List, Plus } from "lucide-react";
import { BackgroundPlus } from "../ui/BackgroundPlus";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
// import AnimatedGradientBackground from "../ui/animated-gradient-background";

export default function CanvasDashboardSkeleton() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <BackgroundPlus className="absolute inset-0 opacity-50" />
      {/* <AnimatedGradientBackground /> */}

      <div className="relative z-10 flex h-full flex-col p-6 lg:p-10">
        {/* Header Skeleton */}
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="h-10 w-48 animate-pulse rounded-lg bg-white/5" />
            <div className="mt-2 h-5 w-64 animate-pulse rounded bg-white/5" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-10 w-32 animate-pulse rounded-lg bg-white/5" />
          </div>
        </header>

        {/* Toolbar Skeleton */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              disabled
              placeholder="Search projects..."
              className="pl-10 bg-white/5 border-white/10"
            />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
              <LayoutGrid className="h-4 w-4 opacity-50" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
              <List className="h-4 w-4 opacity-50" />
            </Button>
          </div>
        </div>

        {/* Projects Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5"
            >
              <div className="aspect-[4/3] w-full animate-pulse bg-white/5" />
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-white/5" />
                  <div className="h-4 w-4 animate-pulse rounded bg-white/5" />
                </div>
                <div className="h-4 w-1/2 animate-pulse rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
