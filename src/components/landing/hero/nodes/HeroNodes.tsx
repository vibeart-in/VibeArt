"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { TextShimmer } from "@/src/components/ui/text-shimmer";

export const HeroTitleNode = ({ data }: any) => {
  return (
    <div className="relative z-10 flex w-[860px] flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-5 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm"
        >
          <span className="size-1.5 rounded-full bg-accent shadow-[0_0_6px_#d9e92b]" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400">
            AI&nbsp;Creative&nbsp;Canvas
          </span>
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex items-end gap-0 leading-none"
        >
          <h1 className="font-sakire text-[80px] font-thin leading-none tracking-[-0.02em] text-white md:text-[120px]">
            VIBE
          </h1>
          {/* ART — TextShimmer with brand yellow palette */}
          <TextShimmer
            as="span"
            duration={2.5}
            spread={4}
            className="font-sakire text-[80px] font-thin leading-none tracking-[-0.02em] dark:[--base-color:#d9e747] dark:[--base-gradient-color:#ffffff] md:text-[120px]"
          >
            ART
          </TextShimmer>
        </motion.div>

        {/* Accent glow bar */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-3 h-[3px] w-full origin-left rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, #d9e92b 30%, #d9e92b 70%, transparent)",
          }}
        />

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mt-7 max-w-[600px] text-center text-base font-medium leading-relaxed tracking-wide text-neutral-400"
        >
          Turn ideas into high-quality visuals using AI‑powered creative workflows.{" "}
          <span className="text-neutral-200">Generate faster — without breaking your flow.</span>
        </motion.p>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.7 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="group relative mt-8 overflow-hidden rounded-full bg-accent px-8 py-3.5 text-sm font-black uppercase tracking-widest text-black shadow-[0_0_0_0_rgba(217,233,43,0.4)] transition-shadow duration-300 hover:shadow-[0_0_24px_6px_rgba(217,233,43,0.35)]"
        >
          <span className="relative z-10">Start Creating</span>
          {/* Shine sweep on hover */}
          <span className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/30 transition-transform duration-500 group-hover:translate-x-[150%]" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export const HeroImageNode = ({ data }: any) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isRapid, setIsRapid] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const movementAccumulator = React.useRef(0);
  const rapidTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const BASE_URL =
    "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing";

  const frames = [`${BASE_URL}/1.webp`, `${BASE_URL}/2.webp`, `${BASE_URL}/3.webp`];
  const rapidImage = `${BASE_URL}/4.webp`;
  const scrollImage = `${BASE_URL}/5.webp`;

  // Preload images
  useEffect(() => {
    const imageUrls = [...frames, rapidImage, scrollImage];
    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50; // Threshold for "scroll down action"
      setIsScrolled(scrolled);
    };

    const handleMouseMove = (e: MouseEvent) => {
      // 1. Detect Rapid Movement
      const speed = Math.abs(e.movementX);
      if (speed > 100) {
        // increased threshold
        setIsRapid(true);
        if (rapidTimeoutRef.current) clearTimeout(rapidTimeoutRef.current);
        rapidTimeoutRef.current = setTimeout(() => {
          setIsRapid(false);
        }, 500); // 500ms duration for rapid state
      }

      // 2. Cycle Frames based on movement
      // Sensitivity: Amount of pixels to move to switch frame
      // Increased to 150 for slower, smoother feel
      const sensitivity = 150;
      movementAccumulator.current += e.movementX;

      const steps = Math.trunc(movementAccumulator.current / sensitivity);

      if (steps !== 0) {
        setCurrentFrame((prev) => {
          const count = frames.length;
          let next = (prev + steps) % count;
          if (next < 0) next += count;
          return next;
        });
        movementAccumulator.current -= steps * sensitivity;
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      if (rapidTimeoutRef.current) clearTimeout(rapidTimeoutRef.current);
    };
  }, []);

  // Prepare a list of all unique images to manage transitions
  const allImages = [
    { src: frames[0], active: !isScrolled && !isRapid && currentFrame === 0 },
    { src: frames[1], active: !isScrolled && !isRapid && currentFrame === 1 },
    { src: frames[2], active: !isScrolled && !isRapid && currentFrame === 2 },
    { src: rapidImage, active: !isScrolled && isRapid },
    { src: scrollImage, active: isScrolled },
  ];

  return (
    <div className="relative -z-10 flex flex-col items-center justify-center">
      <div className="relative">
        {/* Spacer image to maintain dimensions */}
        <img
          src={frames[0]}
          className="pointer-events-none relative h-[70vh] w-auto opacity-0"
          alt="Spacer"
        />

        {/* Stacked images with fade transitions */}
        {allImages.map((img, idx) => (
          <motion.img
            key={img.src}
            src={img.src}
            initial={{ opacity: 0 }}
            animate={{ opacity: img.active ? 1 : 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }} // Smooth fade
            className="pointer-events-none absolute inset-0 h-full w-full object-contain"
            alt="Hero"
          />
        ))}
      </div>
    </div>
  );
};
