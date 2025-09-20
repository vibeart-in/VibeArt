"use client";

import { cn } from "@/src/lib/utils";
import { useState, useEffect } from "react";
import UnicornScene from "unicornstudio-react";
import SplitText from "./SplitText";

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1280,
    height: typeof window !== "undefined" ? window.innerHeight : 720,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

export const RaycastComponent = () => {
  const { width, height } = useWindowSize();

  return (
    <div
      className={cn(
        "relative w-full min-h-screen overflow-hidden"
      )}
      role="region"
      aria-label="Hero"
      style={{ height: height || "100vh" }}
    >
      {/* Background scene (behind everything) */}
      <UnicornScene
        production={true}
        projectId="MiiqZiDaKUOWbdlhlARE"
        width={width || "100%"}
        height={height || "100vh"}
        scale={1}
        dpi={1.5}
        fps={60}
        lazyLoad={true}
        altText="Interactive hero scene for multi‑model AI image agent"
        ariaLabel="Unicorn Studio canvas scene for the AI image agent hero"
        className="absolute inset-0 z-0"
      />
  
      {/* Contrast overlay for text readability */}
      <div
        className="absolute inset-0 z-[4] pointer-events-none bg-gradient-to-t from-black/50 via-black/20 to-transparent"
        aria-hidden="true"
      />
  
      {/* Content overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-white pointer-events-none">
        <SplitText
          text="The First Multi-Model AI Image Agent!"
          // className="text-2xl font-semibold text-center"
          className={cn(
            "text-center font-gothic font-medium text-wrap",
            "text-4xl sm:text-6xl lg:text-7xl xl:text-8xl"
          )}
          delay={100}
          duration={0.4}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="center"
          // onLetterAnimationComplete={handleAnimationComplete}
        />
  
        <p className="mt-10 max-w-2xl text-center text-base sm:text-lg text-white/90">
          From idea to gallery-ready visuals in seconds—automatic model selection, expert prompt enhancement, and one‑click upscaling.
        </p>
  
        <div className="mt-12 flex items-center gap-3 pointer-events-auto">
          <button className="px-6 py-3 rounded-lg border border-white/30 text-white font-medium hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
            See How It Works
          </button>
        </div>
  
        <div className="mt-10 flex items-center gap-3 text-white/70 text-sm">
          <span className="px-2 py-1 rounded bg-white/10">Flux</span>
          <span className="px-2 py-1 rounded bg-white/10">Imagen 4</span>
          <span className="px-2 py-1 rounded bg-white/10">Seedream 4</span>
          <span className="px-2 py-1 rounded bg-white/10">Nano Banana</span>
          <span className="px-2 py-1 rounded bg-white/10">More</span>
        </div>
  
        <ul className="mt-8 grid gap-3 text-white/85 text-sm sm:text-base">
          <li>Auto Model Orchestration — selects the optimal model for style, fidelity, and speed.</li>
          <li>Prompt Intelligence — turns simple ideas into production‑grade prompts.</li>
          <li>Instant Finishing — one‑click upscale and cleanup for publish‑ready assets.</li>
        </ul>
      </div>
    </div>
  );
  
};
