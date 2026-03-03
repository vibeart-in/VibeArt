"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import React from "react";

export const MobileHero = () => {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#050505] px-4 pb-40 pt-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#d9e92b]/5 via-transparent to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 space-y-8 text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
          <Sparkles className="size-4 text-[#d9e92b]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#d9e92b] text-white">
            Interactive Canvas
          </span>
        </div>

        <h1 className="font-satoshi text-6xl font-black leading-[0.9] tracking-tighter text-white">
          Vibe<span className="text-[#d9e92b]">Art</span>
        </h1>

        <p className="mx-auto max-w-xs text-lg font-light leading-relaxed text-neutral-400">
          The ultimate AI playground. Create, Connect, and Generate in one seamless flow.
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href="/dashboard"
            className="rounded-2xl bg-white px-8 py-4 text-lg font-bold text-black shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            Get Started Free
          </Link>
          <Link
            href="/ai-apps"
            className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold text-white backdrop-blur-md"
          >
            Explore Apps
          </Link>
        </div>
      </motion.div>

      {/* Floaties for Mobile */}
      <div className="absolute left-[5%] top-[20%] size-12 rotate-12 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
      <div className="absolute bottom-[25%] right-[10%] size-16 animate-pulse rounded-full bg-[#d9e92b]/10 blur-xl" />
    </div>
  );
};
