"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionTemplate, useMotionValue } from "framer-motion";
import { ArrowRight, Check, Star, Play, ShoppingBag, Layout, Camera, Share2, Monitor, Sparkles, ChevronDown } from "lucide-react";
import Link from "next/link";
import { cn } from "../../lib/utils";
import { AI_APPS } from "../../constants/aiApps";
import { ChevronLeft, ChevronRight } from "lucide-react";

// --- Hero Section ---


export const Hero = () => {
  /** ------------------------------
   *  Cursor spotlight (Enhanced)
   *  ------------------------------ */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { damping: 15, stiffness: 150 });
  const smoothY = useSpring(mouseY, { damping: 15, stiffness: 150 });

  function handleMouseMove(e: React.MouseEvent) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  // Enhanced spotlight with dual gradients
  const spotlightStyle = useTransform(
    [smoothX, smoothY],
    ([x, y]) => {
      const intensity = 0.3; // Increased intensity
      return `
        radial-gradient(800px circle at ${x}px ${y}px, 
          rgba(217,233,43,${intensity}) 0%, 
          rgba(217,233,43,${intensity * 0.5}) 30%,
          transparent 70%),
        radial-gradient(600px circle at ${x}px ${y}px, 
          rgba(255,255,255,0.1) 0%,
          transparent 60%)
      `;
    }
  );

  /** ------------------------------
   *  Measure V ↔ A distance
   *  ------------------------------ */
  const vRef = useRef<HTMLDivElement>(null);
  const aRef = useRef<HTMLDivElement>(null);
  const [swapX, setSwapX] = useState(0);
  const [swapY, setSwapY] = useState(0);

  useLayoutEffect(() => {
    if (vRef.current && aRef.current) {
      const vBox = vRef.current.getBoundingClientRect();
      const aBox = aRef.current.getBoundingClientRect();
      setSwapX(aBox.left - vBox.left);
      setSwapY(aBox.top - vBox.top);
    }
  }, []);

  // New: Particle effect for the swap
  const [particles, setParticles] = useState<Array<{ x: number; y: number; id: number }>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Add particles along swap path
      const newParticles = Array.from({ length: 5 }).map((_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      }));
      setParticles(prev => [...prev.slice(-20), ...newParticles]);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // New: Glitch effect state
  const [glitch, setGlitch] = useState(false);

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden
                 bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-[#111111] text-center selection:bg-[#d9e92b]/30"
    >
      {/* ---------------- Enhanced Video Layer ---------------- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-transparent to-black/60" />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-40 mix-blend-overlay"
        >
          <source src="/your-abstract-ai-video.mp4" type="video/mp4" />
        </video>
      </div>

      {/* ---------------- Enhanced Spotlight ---------------- */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-10"
        style={{ background: spotlightStyle }}
      />

      {/* ---------------- Animated Circuit Lines ---------------- */}
      <div className="absolute inset-0 z-5 overflow-hidden">
        <svg className="w-full h-full opacity-20">
          <defs>
            <linearGradient id="circuit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d9e92b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#d9e92b" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.path
              key={i}
              d={`M${i * 10} 0 L${i * 10} 100`}
              stroke="url(#circuit-grad)"
              strokeWidth="1"
              strokeDasharray="10 5"
              animate={{
                strokeDashoffset: [0, 15],
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </svg>
      </div>

      {/* ---------------- Enhanced Mesh Blobs ---------------- */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            x: [0, 100, -50, 0],
            y: [0, -50, 30, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute -top-[15%] -left-[15%] h-[80%] w-[80%]
                     rounded-full bg-gradient-to-br from-[#d9e92b]/15 via-transparent to-[#d9e92b]/5 blur-[150px]"
        />
        <motion.div
          animate={{ 
            x: [0, -100, 50, 0],
            y: [0, 50, -30, 0],
            scale: [1, 1.1, 0.8, 1],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute -bottom-[15%] -right-[15%] h-[80%] w-[80%]
                     rounded-full bg-gradient-to-tl from-[#d9e92b]/10 via-transparent to-[#d9e92b]/5 blur-[150px]"
        />
      </div>

      {/* ---------------- Swap Animation Particles ---------------- */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute w-[2px] h-[2px] bg-[#d9e92b] rounded-full z-30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            x: [0, swapX, 0],
            y: [0, swapY, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
          }}
          onAnimationComplete={() => {
            setParticles(prev => prev.filter(p => p.id !== particle.id));
          }}
        />
      ))}

      {/* ---------------- Content ---------------- */}
      <div className="relative z-20 mx-auto px-4">

        {/* Enhanced Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex justify-center"
          onHoverStart={() => setGlitch(true)}
          onHoverEnd={() => setGlitch(false)}
        >
          <motion.div
            animate={glitch ? {
              x: [0, -2, 2, -1, 1, 0],
              y: [0, 1, -1, 0.5, -0.5, 0],
            } : {}}
            transition={{ duration: 0.3 }}
            className="relative flex items-center gap-3 rounded-full
                       border border-white/20 bg-gradient-to-r from-black/30 to-black/10 
                       px-6 py-3 backdrop-blur-xl shadow-2xl shadow-black/50
                       hover:shadow-[#d9e92b]/20 hover:border-[#d9e92b]/30 transition-all duration-300"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <Sparkles className="h-5 w-5 text-[#d9e92b]" />
            </motion.div>
            <span className="text-sm font-bold uppercase tracking-[0.3em] text-white/90 bg-gradient-to-r from-white to-[#d9e92b]/80 bg-clip-text text-transparent">
              Quantum Creation Engine
            </span>
            <motion.div
              className="absolute -inset-1 rounded-full bg-[#d9e92b]/10 blur-md -z-10"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>

        {/* ---------------- Enhanced Title with Trail Effect ---------------- */}
        <div className="relative flex items-baseline justify-center gap-2 md:gap-4">
          
          {/* V with trail effect */}
          <div ref={vRef} className="relative">
            <motion.div
              className="absolute inset-0 blur-xl opacity-50"
              animate={{
                x: [0, swapX, swapX, 0],
                y: [0, -45, -45, 0],
                scale: [1, 1.1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                times: [0, 0.4, 0.6, 1],
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              <div className="font-satoshi text-[20vw] sm:text-[220px] font-black text-[#d9e92b]/30">
                V
              </div>
            </motion.div>
            
            <motion.h1
              animate={{
                x: [0, swapX, swapX, 0],
                y: [0, -45, -45, 0],
                rotate: [0, 180, 180, 360],
                scale: [1, 1.1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                times: [0, 0.4, 0.6, 1],
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 3,
              }}
              className="font-satoshi text-[20vw] sm:text-[220px]
                         font-black leading-none tracking-tighter relative
                         text-transparent bg-clip-text
                         bg-gradient-to-b from-white via-[#d9e92b] to-[#ffed4e]
                         drop-shadow-[0_0_30px_rgba(217,233,43,0.3)]"
            >
              V
            </motion.h1>
          </div>

          {/* ibe with glow */}
          <motion.h1 
            className="font-satoshi text-[14vw] sm:text-[160px]
                       font-black leading-none tracking-tighter relative"
            animate={{
              textShadow: [
                "0 0 20px rgba(255,255,255,0.3)",
                "0 0 40px rgba(217,233,43,0.5)",
                "0 0 20px rgba(255,255,255,0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-white drop-shadow-[0_0_20px_rgba(217,233,43,0.3)]">
              ibe
            </span>
          </motion.h1>

          {/* A with trail effect */}
          <div ref={aRef} className="relative">
            <motion.div
              className="absolute inset-0 blur-xl opacity-50"
              animate={{
                x: [0, -swapX, -swapX, 0],
                y: [0, 40, 40, 0],
                scale: [1, 1.1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                times: [0, 0.4, 0.6, 1],
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              <div className="font-satoshi text-[20vw] sm:text-[220px] font-black text-[#d9e92b]/30">
                A
              </div>
            </motion.div>
            
            <motion.h1
              animate={{
                x: [0, -swapX, -swapX, 0],
                y: [0, 40, 40, 0],
                rotate: [0, -180, -180, -360],
                scale: [1, 1.1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                times: [0, 0.4, 0.6, 1],
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 3,
              }}
              className="font-satoshi text-[20vw] sm:text-[220px]
                         font-black leading-none tracking-tighter relative
                         text-transparent bg-clip-text
                         bg-gradient-to-b from-[#ffed4e] via-white to-[#d9e92b]
                         drop-shadow-[0_0_30px_rgba(217,233,43,0.3)]"
            >
              A
            </motion.h1>
          </div>

          {/* rt with glow */}
          <motion.h1 
            className="font-satoshi text-[14vw] sm:text-[160px]
                       font-black leading-none tracking-tighter relative"
            animate={{
              textShadow: [
                "0 0 20px rgba(255,255,255,0.3)",
                "0 0 40px rgba(217,233,43,0.5)",
                "0 0 20px rgba(255,255,255,0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-white drop-shadow-[0_0_20px_rgba(217,233,43,0.3)]">
              rt
            </span>
          </motion.h1>
        </div>

        {/* ---------------- Connection Line Animation ---------------- */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-[2px] bg-gradient-to-r from-transparent via-[#d9e92b] to-transparent z-0"
          animate={{
            width: ["0%", "100%", "0%"],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            times: [0, 0.5, 1],
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut",
          }}
        />

        {/* ---------------- Enhanced Subtitle ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mx-auto mt-12 max-w-2xl"
        >
          <motion.p
            className="text-2xl sm:text-3xl text-white/70 font-light leading-relaxed"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              background: "linear-gradient(90deg, #d9e92b, #ffffff, #d9e92b)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Where <span className="font-bold text-white">AI Imagination</span> meets
            <br />
            <span className="font-bold text-white">Infinite Creation</span>
          </motion.p>
          
          {/* Stats Counter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 flex justify-center gap-8 text-sm text-white/40"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-[#d9e92b]">10K+</div>
              <div>Assets Generated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#d9e92b]">2.4s</div>
              <div>Average Generation</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#d9e92b]">99%</div>
              <div>Accuracy Rate</div>
            </div>
          </motion.div>
        </motion.div>

        {/* ---------------- Enhanced Actions ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 flex justify-center gap-6 flex-wrap"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative rounded-full overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#d9e92b] to-[#ffed4e]"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div className="relative flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#d9e92b] to-[#ffed4e] rounded-full">
              <span className="text-lg font-black text-black">
                START CREATING
              </span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowRight className="h-6 w-6 text-black transition group-hover:translate-x-1" />
              </motion.div>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-[#d9e92b] to-[#ffed4e] blur-xl opacity-50 -z-10 group-hover:opacity-70 transition-opacity" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group flex items-center gap-3 rounded-full
                       border border-white/20 bg-gradient-to-r from-white/5 to-white/10
                       px-10 py-5 text-lg font-bold text-white backdrop-blur-xl
                       hover:border-[#d9e92b]/30 hover:bg-white/15 transition-all"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Play className="h-6 w-6 text-[#d9e92b]" />
            </motion.div>
            WATCH DEMO
          </motion.button>
        </motion.div>

        {/* ---------------- Scroll Indicator ---------------- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white/30"
          >
            <ChevronDown className="h-8 w-8" />
          </motion.div>
        </motion.div>
      </div>

      {/* ---------------- Enhanced Noise Layer ---------------- */}
      <div className="pointer-events-none absolute inset-0 z-50
                      bg-[url('https://grainy-gradients.vercel.app/noise.svg')]
                      opacity-[0.03] contrast-150 mix-blend-overlay" />

      {/* ---------------- Floating Elements ---------------- */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#d9e92b] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </section>
  );
};


const SparklesIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM6.97 11.03a.75.75 0 01.653 1.055 2.25 2.25 0 01-1.127 1.127.75.75 0 01-1.055-.653 2.25 2.25 0 011.127-1.127.75.75 0 01.402.59zM16.03 6.97a.75.75 0 011.055.653 2.25 2.25 0 01-1.127 1.127.75.75 0 01-.653-1.055 2.25 2.25 0 011.127-1.127.75.75 0 01.59-.402z" clipRule="evenodd" />
    </svg>
)

// --- Feature Section (Left/Right Cards) ---

interface FeatureCardProps {
  title: string;
  description: string;
  features: string[];
  imageSide: "left" | "right";
  gradient: string;
  badge?: string;
}

export const FeatureCard = ({ title, description, features, imageSide, gradient, badge }: FeatureCardProps) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden py-32 selection:bg-purple-500/30">
      <div className="container mx-auto px-4">
        <div className={cn(
            "flex flex-col items-center gap-20 lg:flex-row",
            imageSide === "right" ? "lg:flex-row" : "lg:flex-row-reverse"
        )}>
          
          {/* Text Content */}
          <motion.div
             style={{ opacity }}
             transition={{ duration: 0.7 }}
             className="flex-1 space-y-8"
          >
            {badge && (
                <span className="inline-block rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-xs font-bold tracking-wider text-white uppercase backdrop-blur-md">
                    {badge}
                </span>
            )}
            <h2 className="font-satoshi text-5xl font-bold leading-tight text-white md:text-6xl">{title}</h2>
            <p className="text-xl font-light text-neutral-400 leading-relaxed">{description}</p>
            
            <ul className="space-y-4 pt-4">
                {features.map((feature, i) => (
                    <motion.li 
                        key={i} 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-4 text-lg text-neutral-300"
                    >
                        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full shadow-lg", gradient)}>
                            <Check className="h-4 w-4 text-black stroke-[3px]" />
                        </div>
                        {feature}
                    </motion.li>
                ))}
            </ul>

            <button className="group mt-8 flex items-center gap-2 text-base font-bold text-white transition-colors hover:text-green-400">
                <span className="border-b border-white/30 pb-0.5 group-hover:border-green-400">Learn more</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

          {/* Image/Visual Content */}
          <motion.div 
            style={{ y }}
            className="flex-1 w-full"
          >
            <div className="group relative aspect-square w-full max-w-xl mx-auto overflow-hidden rounded-[2.5rem] bg-neutral-900 border border-white/10 shadow-2xl transition-all duration-500 hover:shadow-green-900/20">
                 {/* Visual Background */}
                 <div className={cn(
                     "absolute inset-0 opacity-20 transition-opacity duration-500 group-hover:opacity-30",
                     gradient
                 )} />
                 
                 {/* Abstract UI Mockup */}
                 <div className="absolute inset-0 p-10 flex flex-col">
                    <div className="flex-1 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-xl p-6 shadow-2xl transform transition-transform duration-500 group-hover:scale-[1.02]">
                         <div className="flex items-center gap-4 mb-8">
                             <div className="h-14 w-14 rounded-2xl bg-white/10 animate-pulse" />
                             <div className="space-y-3">
                                 <div className="h-3 w-32 rounded-full bg-white/10" />
                                 <div className="h-3 w-20 rounded-full bg-white/10" />
                             </div>
                         </div>
                         <div className="space-y-4">
                             <div className="h-32 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/5" />
                             <div className="grid grid-cols-2 gap-4">
                                 <div className="h-24 rounded-xl bg-white/5" />
                                 <div className="h-24 rounded-xl bg-white/5" />
                             </div>
                         </div>
                    </div>
                 </div>

                 {/* Floating Badges */}
                 <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-10 right-10 rounded-2xl bg-black/80 p-4 border border-white/10 backdrop-blur-xl shadow-xl"
                 >
                     <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                             <Check className="h-6 w-6 text-black" />
                         </div>
                         <div>
                             <div className="text-xs text-neutral-400">Status</div>
                             <div className="text-sm font-bold text-white">Optimized</div>
                         </div>
                     </div>
                 </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

// --- Grid Section ---
interface GridItemProps {
    icon: React.ElementType;
    title: string;
    description: string;
}

const GridItem = ({ icon: Icon, title, description }: GridItemProps) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
        }}
        className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-8 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05] hover:-translate-y-1"
    >
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-white transition-colors group-hover:bg-green-500 group-hover:text-black">
            <Icon className="h-7 w-7" />
        </div>
        <h3 className="mb-3 font-satoshi text-2xl font-bold text-white">{title}</h3>
        <p className="text-base text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors">{description}</p>
        
        <div className="absolute top-0 right-0 p-8 opacity-0 transition-opacity group-hover:opacity-100">
            <ArrowRight className="h-5 w-5 text-white -rotate-45" />
        </div>
    </motion.div>
)

export const FeaturesGrid = () => {
    return (
        <section className="py-32 bg-black relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <div className="container mx-auto px-4 text-center">
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20"
                 >
                     <span className="mb-4 inline-block text-sm font-bold tracking-widest text-green-500 uppercase">Use Cases</span>
                     <h2 className="font-satoshi text-4xl font-black text-white md:text-6xl">
                        Branding made ready for <br/> <span className="text-neutral-600">every occasion.</span>
                     </h2>
                 </motion.div>

                 <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ staggerChildren: 0.1 }}
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
                 >
                    <GridItem icon={ShoppingBag} title="Product Shots" description="High quality visuals for your store." />
                    <GridItem icon={Monitor} title="Websites" description="Assets optimized for web performance." />
                    <GridItem icon={Share2} title="Social Media" description="Engaging content for all platforms." />
                    <GridItem icon={Layout} title="Presentations" description="Stand out in your next pitch." />
                 </motion.div>
            </div>
        </section>
    )
}

// --- Testimonials Section ---
const testimonials = [
    {
        quote: "VibeArt transformed our marketing. We create assets in minutes now.",
        author: "Sarah J.",
        role: "Marketing Director",
        gradient: "from-green-500 to-emerald-700"
    },
    {
        quote: "The brand consistency tools are a game changer for our agency.",
        author: "Mark T.",
        role: "Creative Lead",
        gradient: "from-purple-500 to-indigo-700"
    },
    {
        quote: "Incredible quality. It feels like we have an in-house designer.",
        author: "Emily R.",
        role: "Founder",
        gradient: "from-pink-500 to-rose-700"
    }
]

export const TestimonialsSection = () => {
    return (
        <section className="py-32 bg-black relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute left-[10%] top-[20%] h-96 w-96 rounded-full bg-blue-500/10 blur-[100px]" />
            <div className="absolute right-[10%] bottom-[20%] h-96 w-96 rounded-full bg-purple-500/10 blur-[100px]" />

            <div className="container relative z-10 mx-auto px-4">
                <motion.h2 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mb-20 text-center font-satoshi text-4xl font-bold text-white md:text-5xl"
                >
                    Why businesses love VibeArt
                </motion.h2>
                <div className="grid gap-8 md:grid-cols-3">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -10 }}
                            transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
                            className="flex flex-col justify-between rounded-3xl border border-white/5 bg-white/5 p-10 backdrop-blur-sm transition-colors hover:bg-white/10 hover:border-white/10"
                        >
                            <div className="mb-8">
                                <div className="flex gap-1 text-yellow-400 mb-6">
                                    {[1,2,3,4,5].map(s => <Star key={s} className="h-5 w-5 fill-current" />)}
                                </div>
                                <p className="font-satoshi text-xl font-medium text-white leading-relaxed">"{t.quote}"</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className={cn("h-12 w-12 rounded-full flex items-center justify-center font-bold text-white text-lg bg-gradient-to-br shadow-lg", t.gradient)}>
                                    {t.author[0]}
                                </div>
                                <div>
                                    <div className="font-bold text-white text-lg">{t.author}</div>
                                    <div className="text-sm text-neutral-400">{t.role}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// --- Footer / CTA ---
export const FooterCTA = () => {
    return (
        <section className="relative overflow-hidden py-40 text-center">
            <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 via-black to-black" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
            
            <div className="container relative z-10 mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mx-auto max-w-4xl"
                >
                    <h2 className="mb-8 font-satoshi text-5xl font-black text-white md:text-8xl tracking-tight">
                        Bring Your Brand <br/> to Life
                    </h2>
                    <p className="mx-auto mb-12 max-w-xl text-xl text-neutral-400">
                        Join thousands of creators who are scaling their brand identity with VibeArt today.
                    </p>
                    <Link
                        href="/dashboard" 
                        className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-white px-10 py-5 text-xl font-bold text-black transition-transform hover:scale-105 active:scale-95"
                    >
                        <span>Get Started Free</span>
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}

// --- AI Apps Carousel ---
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
                if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
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
        // Small delay to ensure everything is mounted
        const timer = setTimeout(() => {
            if (scrollRef.current) {
                // Force a small scroll to "wake up" the scroll container
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

    // App-specific images (using unique gradients and patterns)
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
        <section className="relative py-32 bg-black overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            
            <div className="container relative z-10 mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16 text-center"
                >
                    <span className="mb-4 inline-block text-xs sm:text-sm font-bold tracking-widest text-[#d9e92b] uppercase">Explore</span>
                    <h2 className="font-satoshi text-3xl sm:text-4xl font-black text-white md:text-5xl lg:text-6xl">
                        AI Power <span className="bg-gradient-to-r from-[#d9e92b] to-[#d9e92b] bg-clip-text text-transparent">Tools</span>
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base md:text-lg text-neutral-400">
                        Transform your creativity with our suite of AI-powered applications
                    </p>
                </motion.div>

                {/* Carousel Container with Side Buttons */}
                <div 
                    className="relative"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Left Navigation Button - Hidden on mobile */}
                    <button 
                        onClick={() => scroll("left")}
                        className="hidden sm:flex absolute left-0 top-1/2 z-20 -translate-x-4 -translate-y-1/2 h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full border-2 border-white/10 bg-black/80 text-white backdrop-blur-xl transition-all hover:border-[#d9e92b]/50 hover:bg-[#d9e92b]/20 hover:scale-110 active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(250,204,21,0.4)]"
                    >
                        <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
                    </button>

                    {/* Right Navigation Button - Hidden on mobile */}
                    <button 
                        onClick={() => scroll("right")}
                        className="hidden sm:flex absolute right-0 top-1/2 z-20 translate-x-4 -translate-y-1/2 h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full border-2 border-white/10 bg-black/80 text-white backdrop-blur-xl transition-all hover:border-[#d9e92b]/50 hover:bg-[#d9e92b]/20 hover:scale-110 active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(250,204,21,0.4)]"
                    >
                        <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
                    </button>

                    {/* Scrollable Container */}
                    <div 
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto pb-8 px-2 scrollbar-hide snap-x"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {/* Duplicate items for seamless loop */}
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
                                    className="flex-none w-[280px] sm:w-[300px] md:w-[320px] snap-start"
                                >
                                    <Link 
                                        href={`/ai-apps/${app.id}`}
                                        className="group block h-full"
                                    >
                                        <div className="h-full overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-2 transition-all duration-500 hover:border-[#d9e92b]/50 hover:shadow-[0_20px_60px_rgba(250,204,21,0.3)] hover:-translate-y-2">
                                            {/* Image Container */}
                                            <div className="relative h-72 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-neutral-900 to-black">
                                                {/* Animated Gradient Background */}
                                                <motion.div 
                                                    className={cn(
                                                        "absolute inset-0 bg-gradient-to-br opacity-50 transition-all duration-700 group-hover:opacity-70",
                                                        visuals.gradient
                                                    )}
                                                    animate={{
                                                        scale: [1, 1.1, 1],
                                                    }}
                                                    transition={{
                                                        duration: 8,
                                                        repeat: Infinity,
                                                        repeatType: "reverse"
                                                    }}
                                                />
                                                
                                                {/* Noise Texture Overlay */}
                                                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                                                
                                                {/* Geometric Pattern Overlay */}
                                                <div className="absolute inset-0 opacity-10">
                                                    <div className="h-full w-full" style={{
                                                        backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                                                        backgroundSize: '30px 30px'
                                                    }} />
                                                </div>
                                                
                                                {/* Center Content */}
                                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                                                    <motion.div 
                                                        className="relative mb-4"
                                                        whileHover={{ scale: 1.15, rotate: 5 }}
                                                        transition={{ type: "spring", stiffness: 300 }}
                                                    >
                                                        <div className="h-24 w-24 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
                                                            <span className="text-5xl">{visuals.icon}</span>
                                                        </div>
                                                        {/* Glow effect */}
                                                        <div className="absolute inset-0 rounded-3xl bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                    </motion.div>
                                                    
                                                    {/* App name on image */}
                                                    <div className="text-center">
                                                        <p className="font-satoshi font-bold text-white/90 text-sm line-clamp-2 drop-shadow-lg">
                                                            {app.app_name}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Badge */}
                                                <div className="absolute top-4 right-4 rounded-full bg-black/70 px-4 py-1.5 text-xs font-black tracking-wider text-white backdrop-blur-md border border-white/20 shadow-lg">
                                                    AI APP
                                                </div>

                                                {/* Corner accent */}
                                                <div className="absolute bottom-0 left-0 h-20 w-20 border-l-2 border-b-2 border-white/10 rounded-bl-[1.5rem]" />
                                                <div className="absolute top-0 right-0 h-20 w-20 border-r-2 border-t-2 border-white/10 rounded-tr-[1.5rem]" />
                                            </div>
                                            
                                            {/* Content */}
                                            <div className="p-6">
                                                <h3 className="mb-3 font-satoshi text-xl font-bold text-white line-clamp-2 min-h-[3.5rem] leading-tight">
                                                    {app.app_name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm font-bold text-neutral-400 group-hover:text-[#d9e92b] transition-colors">
                                                    <span>Try now</span>
                                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* View All Button */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-12 text-center"
                >
                    <Link
                        href="/ai-apps"
                        className="inline-flex items-center gap-3 rounded-full bg-white/5 px-8 py-4 font-bold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:shadow-[0_0_30px_rgba(250,204,21,0.3)] border border-white/10 hover:border-[#d9e92b]/50"
                    >
                        <span>View All Apps</span>
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}

// --- Sticky Prompt Input ---
export const StickyPromptInput = () => {
    const [prompt, setPrompt] = React.useState("");
    const [isFocused, setIsFocused] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            // Redirect to generate page with prompt
            window.location.href = `/generate?prompt=${encodeURIComponent(prompt)}`;
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 pb-4 px-4 sm:pb-6 sm:px-6">
            <div className="container mx-auto max-w-4xl">
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={cn(
                        "relative overflow-hidden rounded-2xl border-2 transition-all duration-300",
                        isFocused 
                            ? "border-yellow-500/50 shadow-[0_0_40px_rgba(250,204,21,0.4)]" 
                            : "border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                    )}
                >
                    {/* Background */}
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" />
                    
                    {/* Animated gradient border */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#d9e92b]/20 via-[#d9e92b]/20 to-yellow-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{
                        animation: isFocused ? "gradientShift 3s ease infinite" : "none"
                    }} />

                    <form onSubmit={handleSubmit} className="relative flex items-center gap-2 p-3 sm:p-4">
                        {/* Icon */}
                        <div className="flex-none">
                            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400">
                                <SparklesIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                        </div>

                        {/* Input */}
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="What would you like to create today?"
                            className="flex-1 bg-transparent font-satoshi text-sm sm:text-base text-white placeholder:text-neutral-500 outline-none"
                        />

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!prompt.trim()}
                            className="flex-none group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#d9e92b] to-[#d9e92b] px-4 sm:px-6 py-2 sm:py-3 font-bold text-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            <span className="relative z-10 text-sm sm:text-base">Generate</span>
                            <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                        </button>
                    </form>
                </motion.div>

                {/* Helper text */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-2 text-center text-xs sm:text-sm text-neutral-500 hidden sm:block"
                >
                    Press Enter or click Generate to start creating
                </motion.p>
            </div>
        </div>
    );
};

// Missing imports?
// import { Sparkles } from "lucide-react"; (Added inline icon to avoid confusion if library missing)

