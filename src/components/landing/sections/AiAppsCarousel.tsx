"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import React, { useRef } from "react";

import { AI_APPS } from "../../../constants/aiApps";
import { cn } from "../../../lib/utils";

export const AiAppsCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);

  // Auto-scroll effect
  React.useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isHovered) return;

    const scrollSpeed = 1; // pixels per frame
    let animationFrameId: number;

    const autoScroll = () => {
      if (scrollContainer) {
        scrollContainer.scrollLeft += scrollSpeed;

        // Reset to start when reaching the end for infinite loop
        if (
          scrollContainer.scrollLeft >=
          scrollContainer.scrollWidth - scrollContainer.clientWidth
        ) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isHovered]);

  // Start auto-scroll after a delay to ensure DOM is ready
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = 1;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === "left" ? -400 : 400;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const getAppVisuals = (index: number) => {
    const patterns = [
      { gradient: "from-purple-600 via-purple-800 to-blue-900", icon: "🎨" },
      { gradient: "from-green-600 via-teal-700 to-cyan-900", icon: "⚡" },
      { gradient: "from-pink-600 via-rose-700 to-red-900", icon: "✨" },
      { gradient: "from-orange-600 via-amber-700 to-yellow-900", icon: "🎯" },
      { gradient: "from-indigo-600 via-violet-700 to-purple-900", icon: "🚀" },
    ];
    return patterns[index % patterns.length];
  };

  return (
    <section className="relative overflow-hidden bg-black py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black" />
      <div className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block text-xs font-bold uppercase tracking-widest text-[#d9e92b] sm:text-sm">
            Explore
          </span>
          <h2 className="font-satoshi text-3xl font-black text-white sm:text-4xl md:text-5xl lg:text-6xl">
            AI Power{" "}
            <span className="bg-gradient-to-r from-[#d9e92b] to-[#d9e92b] bg-clip-text text-transparent">
              Tools
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-neutral-400 sm:text-base md:text-lg">
            Transform your creativity with our suite of AI-powered applications
          </p>
        </motion.div>

        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 z-20 hidden size-12 -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/10 bg-black/80 text-white shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all hover:scale-110 hover:border-[#d9e92b]/50 hover:bg-[#d9e92b]/20 hover:shadow-[0_0_40px_rgba(250,204,21,0.4)] active:scale-95 sm:flex md:size-16"
          >
            <ChevronLeft className="size-6 md:size-8" />
          </button>

          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 z-20 hidden size-12 -translate-y-1/2 translate-x-4 items-center justify-center rounded-full border-2 border-white/10 bg-black/80 text-white shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all hover:scale-110 hover:border-[#d9e92b]/50 hover:bg-[#d9e92b]/20 hover:shadow-[0_0_40px_rgba(250,204,21,0.4)] active:scale-95 sm:flex md:size-16"
          >
            <ChevronRight className="size-6 md:size-8" />
          </button>

          <div
            ref={scrollRef}
            className="scrollbar-hide flex snap-x gap-6 overflow-x-auto px-2 pb-8"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {[...AI_APPS, ...AI_APPS].map((app, i) => {
              const originalIndex = i % AI_APPS.length;
              const visuals = getAppVisuals(originalIndex);

              return (
                <motion.div
                  key={`${app.id}-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 5) * 0.05 }}
                  className="w-[280px] flex-none snap-start sm:w-[300px] md:w-[320px]"
                >
                  <Link href={`/ai-apps/${app.id}`} className="group block h-full">
                    <div className="h-full overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-2 transition-all duration-500 hover:-translate-y-2 hover:border-[#d9e92b]/50 hover:shadow-[0_20px_60px_rgba(250,204,21,0.3)]">
                      <div className="relative h-72 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-neutral-900 to-black">
                        <motion.div
                          className={cn(
                            "absolute inset-0 bg-gradient-to-br opacity-50 transition-all duration-700 group-hover:opacity-70",
                            visuals.gradient,
                          )}
                          animate={{
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            duration: 8,
                            repeat: Infinity,
                            repeatType: "reverse",
                          }}
                        />
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                        <div className="absolute inset-0 opacity-10">
                          <div
                            className="size-full"
                            style={{
                              backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                              backgroundSize: "30px 30px",
                            }}
                          />
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                          <motion.div
                            className="relative mb-4"
                            whileHover={{ scale: 1.15, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <div className="flex size-24 items-center justify-center rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md">
                              <span className="text-5xl">{visuals.icon}</span>
                            </div>
                            <div className="absolute inset-0 rounded-3xl bg-white/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
                          </motion.div>
                          <div className="text-center">
                            <p className="line-clamp-2 font-satoshi text-sm font-bold text-white/90 drop-shadow-lg">
                              {app.app_name}
                            </p>
                          </div>
                        </div>
                        <div className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/70 px-4 py-1.5 text-xs font-black tracking-wider text-white shadow-lg backdrop-blur-md">
                          AI APP
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="mb-3 line-clamp-2 min-h-[3.5rem] font-satoshi text-xl font-bold leading-tight text-white">
                          {app.app_name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm font-bold text-neutral-400 transition-colors group-hover:text-[#d9e92b]">
                          <span>Try now</span>
                          <ArrowRight className="size-4 transition-transform group-hover:translate-x-2" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            href="/ai-apps"
            className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-8 py-4 font-bold text-white backdrop-blur-md transition-all hover:border-[#d9e92b]/50 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(250,204,21,0.3)]"
          >
            <span>View All Apps</span>
            <ArrowRight className="size-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
