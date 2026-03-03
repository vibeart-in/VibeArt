"use client";

import { Loader2 } from "lucide-react";
import { NavbarLogo } from "@/src/components/ui/resizable-navbar";

export default function Loading() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black font-sans">
      {/* Mock Dot Background to match ReactFlow background */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: "radial-gradient(#555 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Mock Header Panels for seamless transition */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-3xl bg-black/50 px-4 py-2 backdrop-blur-md">
        <NavbarLogo href="/canvas" className="!mr-0 !pr-0 opacity-70" />
        <span className="text-white/30">/</span>
        <div className="h-6 w-32 animate-pulse rounded-md bg-white/10" />
      </div>

      <div className="absolute right-4 top-4 z-10 rounded-3xl bg-black/50 p-3 backdrop-blur-md">
        <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
      </div>

      {/* Centered Loading Indicator */}
      <div className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-6">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />
          <div className="absolute inset-0 animate-pulse rounded-2xl border border-accent/20" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="animate-pulse text-lg font-bold tracking-wide text-white/90">
            Loading Workspace...
          </p>
          <p className="text-sm font-medium text-white/40">Preparing your canvas</p>
        </div>
      </div>
    </div>
  );
}
