"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const MobileHero = () => {
  return (
    // Changed justify-end to justify-center to center all the content
    <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-start overflow-hidden bg-[#050505] px-6 py-20">
      {/* ── Surreal Background Image ── */}
      <div className="absolute inset-0 z-0">
        {/* <Image
          src="https://i.pinimg.com/736x/9e/1a/44/9e1a441114f8d31a101643bc437bb036.jpg"
          alt="Surreal abstract background"
          fill
          priority
          className="object-cover opacity-90"
        /> */}
        <video autoPlay muted loop playsInline className="h-full w-full object-cover opacity-60">
          <source
            src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/mobile-hero-video2.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* ── Gradient Overlays ── */}
      {/* 1. Dark vignette at the top so any header nav stays readable */}
      <div className="absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-[#050505]/80 to-transparent" />

      {/* 2. Vibrant Blue Gradient rising from the bottom */}
      {/* <div className="absolute inset-x-0 bottom-0 z-10 h-3/4 bg-gradient-to-t from-blue-700/80 via-blue-900/30 to-transparent mix-blend-color-burn" /> */}
      {/* <div className="absolute inset-x-0 bottom-0 z-10 h-2/3 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" /> */}
      <div
        className="absolute inset-x-0 top-0 h-3/4 backdrop-blur-sm"
        style={{
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* An extra pop of blue light directly behind the text to help it stand out */}
      <div className="absolute left-1/2 top-1/2 z-10 h-[60vw] w-[100vw] -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-blue-600/20 blur-[100px]" />

      {/* ── Content ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 flex w-full max-w-sm flex-col items-center justify-center text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md"
        >
          <Sparkles className="size-4 text-[#d9e92b]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white">
            Interactive Canvas
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-sakire text-[4rem] font-medium tracking-wider text-white drop-shadow-2xl sm:text-7xl"
        >
          Vibe<span className="text-accent">Art</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mx-auto mb-10 mt-2 max-w-full text-base font-medium leading-relaxed tracking-wide text-neutral-400 text-white/80 drop-shadow-md"
        >
          The ultimate AI playground. Create, Connect, and Generate in one seamless flow.
        </motion.p>

        {/* ── Minimal Glassmorphism Action Button ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex w-full justify-center"
        >
          <Link
            href="/auth/signup"
            className="group relative flex w-full max-w-[240px] items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-accent/20 px-4 py-4 text-base font-medium tracking-wide text-white shadow-lg backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:bg-accent/20 active:scale-[0.98]"
          >
            Start Creating
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};
