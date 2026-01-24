"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionTemplate, useMotionValue } from "framer-motion";
import { ArrowRight, Check, Star, Play, ShoppingBag, Layout, Camera, Share2, Monitor, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "../../lib/utils";
import { AI_APPS } from "../../constants/aiApps";
import { ChevronLeft, ChevronRight } from "lucide-react";

// --- Animated Text Component ---
interface AnimatedTextProps {
  text: string;
  className?: string;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({ text, className }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 50); // Typing speed - adjust as needed
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <motion.p
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {displayedText}
      <motion.span
        className="inline-block w-0.5 h-5 bg-[#d9e92b] ml-1"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
    </motion.p>
  );
};

// --- Hero Section ---


export const Hero = () => {
  /** ------------------------------
   *  Particle System
   *  ------------------------------ */
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
  }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.3 + 0.1,
    }));
    setParticles(newParticles);
  }, []);

  /** ------------------------------
   *  Morphing "V" ↔ "A" Animation
   *  ------------------------------ */
  const [isMorphing, setIsMorphing] = useState(false);
  const morphCount = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsMorphing(true);
      setTimeout(() => setIsMorphing(false), 1000);
      morphCount.current++;
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  /** ------------------------------
   *  Floating Grid Background
   *  ------------------------------ */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(e: React.MouseEvent) {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  }

  const gridX = useSpring(mouseX, { damping: 30, stiffness: 100 });
  const gridY = useSpring(mouseY, { damping: 30, stiffness: 100 });

  const gridTransform = useTransform(
    [gridX, gridY],
    ([x, y]) => `translate(${x * 0.01}px, ${y * 0.01}px)`
  );

  /** ------------------------------
   *  Neural Network Connections
   *  ------------------------------ */
  const [connections, setConnections] = useState<
    Array<{ id: number; x1: number; y1: number; x2: number; y2: number }>
  >([]);

  useEffect(() => {
    const newConnections = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x1: Math.random() * 100,
      y1: Math.random() * 100,
      x2: Math.random() * 100,
      y2: Math.random() * 100,
    }));
    setConnections(newConnections);
  }, []);

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden
                 bg-gradient-to-br from-[#0a0a0a] via-black to-[#1a1a2e]"
    >
      {/* ---------------- Floating Grid Background ---------------- */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ transform: gridTransform }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#111_1px,transparent_1px),linear-gradient(#111_1px,transparent_1px)] bg-[size:80px_80px] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#d9e92b]/5 to-transparent" />
      </motion.div>

      {/* ---------------- Animated Particles ---------------- */}
      <div className="absolute inset-0 z-1 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-[#d9e92b]"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity,
            }}
            animate={{
              x: [0, particle.speedX * 100, 0],
              y: [0, particle.speedY * 100, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* ---------------- Neural Network Lines ---------------- */}
      <svg className="absolute inset-0 z-2 h-full w-full opacity-10">
        {connections.map((conn) => (
          <motion.line
            key={conn.id}
            x1={`${conn.x1}%`}
            y1={`${conn.y1}%`}
            x2={`${conn.x2}%`}
            y2={`${conn.y2}%`}
            stroke="#d9e92b"
            strokeWidth="0.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 2,
              delay: conn.id * 0.1,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </svg>

      {/* ---------------- Main Content ---------------- */}
      <div className="relative z-30 mx-auto px-4 text-center">

        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12 inline-block"
        >
          <div className="relative">
            <div className="absolute -inset-1 animate-pulse rounded-full bg-gradient-to-r from-[#d9e92b] to-cyan-400 opacity-70 blur" />
            <div className="relative flex items-center gap-2 rounded-full
                            border border-white/20 bg-black/50 px-6 py-3 backdrop-blur-md">
              <div className="flex h-2 w-2">
                <div className="absolute h-2 w-2 animate-ping rounded-full bg-[#d9e92b]" />
                <div className="h-2 w-2 rounded-full bg-[#d9e92b]" />
              </div>
              <span className="text-sm font-bold uppercase tracking-[0.3em] text-white">
                AI-Powered Creation
              </span>
            </div>
          </div>
        </motion.div>

        {/* ---------------- Title with Morphing Letters ---------------- */}
        <div className="relative mb-8">
          <div className="relative flex items-center justify-center gap-1 md:gap-3">
            {/* "Vibe Art" Text */}
            <h1 className="font-satoshi text-[18vw] sm:text-[200px]
                           font-black leading-none tracking-tighter
                           bg-gradient-to-r from-white via-white to-[#d9e92b]
                           bg-clip-text text-transparent">
              VibeArt
            </h1>

            {/* Morphing "V" ↔ "A" Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="absolute"
                animate={{
                  scale: isMorphing ? [1, 1.5, 1] : 1,
                  opacity: isMorphing ? [0.3, 0.8, 0.3] : 0,
                }}
                transition={{ duration: 1 }}
              >
                <div className="relative">
                  {/* Morphing "V" to "A" */}
                  <motion.svg
                    width="180"
                    height="180"
                    viewBox="0 0 100 100"
                    className="sm:w-[220px] sm:h-[220px]"
                    animate={isMorphing ? "morph" : "initial"}
                    variants={{
                      initial: { opacity: 0 },
                      morph: { opacity: 1 },
                    }}
                  >
                    <motion.path
                      d={isMorphing ? 
                        "M20,80 L50,20 L80,80" : // V shape
                        "M20,80 L50,20 L80,80 L65,50 L35,50 Z" // A shape with crossbar
                      }
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#d9e92b" />
                        <stop offset="100%" stopColor="#00d4ff" />
                      </linearGradient>
                    </defs>
                  </motion.svg>

                  {/* Pulsing Rings */}
                  {isMorphing && (
                    <>
                      <motion.div
                        className="absolute inset-0 -z-10 mx-auto my-auto h-full w-full rounded-full border border-[#d9e92b]/30"
                        initial={{ scale: 0.5, opacity: 1 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 1 }}
                      />
                      <motion.div
                        className="absolute inset-0 -z-10 mx-auto my-auto h-full w-full rounded-full border border-cyan-400/30"
                        initial={{ scale: 0.5, opacity: 1 }}
                        animate={{ scale: 1.8, opacity: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Animated Underline */}
          <motion.div
            className="mx-auto mt-4 h-1 w-32 bg-gradient-to-r from-transparent via-[#d9e92b] to-transparent"
            animate={{
              scaleX: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
        </div>

        {/* ---------------- Animated Subtitle ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <motion.p
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
            }}
            className="mx-auto mb-6 max-w-2xl bg-gradient-to-r from-white via-[#d9e92b] to-white 
                       bg-[length:200%_auto] bg-clip-text text-2xl sm:text-3xl 
                       font-medium text-transparent"
          >
            Where Creativity Meets Artificial Intelligence
          </motion.p>

          <p className="mx-auto max-w-xl text-lg text-white/50">
            Generate stunning visuals, animations, and assets with our 
            <span className="font-bold text-[#d9e92b]"> next-generation AI engine</span>.
            No skills required.
          </p>
        </motion.div>

        {/* ---------------- Interactive Buttons ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: "spring" }}
          className="mt-16 flex flex-col items-center gap-6 sm:flex-row sm:justify-center"
        >
          {/* Primary Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative overflow-hidden rounded-full px-10 py-4
                       text-lg font-bold shadow-2xl"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#d9e92b] to-cyan-400"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
              style={{
                backgroundSize: "200% 200%",
              }}
            />
            <div className="absolute inset-0.5 rounded-full bg-black" />
            <span className="relative z-10 flex items-center gap-3
                             bg-gradient-to-r from-[#d9e92b] to-cyan-400 
                             bg-clip-text text-transparent">
              <Sparkles className="h-5 w-5" />
              Start Creating Free
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
          </motion.button>

          {/* Secondary Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative overflow-hidden rounded-full
                       border border-white/20 bg-white/5 px-10 py-4
                       text-lg font-bold text-white backdrop-blur-md"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
            <span className="relative z-10 flex items-center gap-3">
              <Play className="h-5 w-5 text-[#d9e92b]" />
              Watch Demo (2 min)
            </span>
          </motion.button>
        </motion.div>

        {/* ---------------- Stats Bar ---------------- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          {[
            { value: "10M+", label: "Assets Generated" },
            { value: "99.9%", label: "Uptime" },
            { value: "2s", label: "Generation Time" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <motion.div
                className="text-3xl font-black text-[#d9e92b]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
              >
                {stat.value}
              </motion.div>
              <div className="mt-2 text-sm text-white/40 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ---------------- Floating Elements ---------------- */}
      <motion.div
        className="absolute left-1/4 top-1/4 h-20 w-20 rounded-full bg-gradient-to-br from-[#d9e92b]/20 to-cyan-400/20 blur-xl"
        animate={{
          y: [0, -30, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute right-1/4 bottom-1/4 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-400/10 to-[#d9e92b]/10 blur-xl"
        animate={{
          y: [0, 40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* ---------------- Scan Line Effect ---------------- */}
      <motion.div
        className="absolute inset-x-0 top-0 z-40 h-px bg-gradient-to-r from-transparent via-[#d9e92b] to-transparent"
        animate={{
          top: ["0%", "100%", "0%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 2,
        }}
      />
    </section>
  );
};
export const Hero1 = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [particles, setParticles] = useState<Array<{ x: number; y: number }>>([]);

  // Neural connection particles
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setParticles(newParticles);
  }, []);

  function handleMouseMove(e: React.MouseEvent) {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  }

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-[#111111] overflow-hidden"
    >
      {/* Neural Network Background */}
      <div className="absolute inset-0">
        <svg className="w-full h-full opacity-30">
          <defs>
            <linearGradient id="neural-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d9e92b" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#00d4ff" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#d9e92b" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {particles.map((p, i) => (
            <circle
              key={i}
              cx={`${p.x}%`}
              cy={`${p.y}%`}
              r="2"
              fill="url(#neural-grad)"
            >
              <animate
                attributeName="r"
                values="2;4;2"
                dur={`${Math.random() * 2 + 1}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </svg>
      </div>

      {/* Interactive 3D Grid */}
      <motion.div
        className="absolute inset-0 grid grid-cols-20 grid-rows-20 gap-1 opacity-10"
        style={{
          perspective: "1000px",
        }}
      >
        {Array.from({ length: 400 }).map((_, i) => (
          <motion.div
            key={i}
            className="bg-white/5 rounded-sm"
            animate={{
              rotateX: [0, 180, 0],
              rotateY: [0, 180, 0],
            }}
            transition={{
              duration: 10,
              delay: i * 0.01,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </motion.div>

      {/* Holographic Title */}
      <div className="relative z-50 min-h-screen flex flex-col items-center justify-center">
        <div className="relative">
          {/* Glitch Effect Background */}
          <motion.div
            className="absolute -inset-4 bg-gradient-to-r from-[#d9e92b] via-[#00d4ff] to-[#d9e92b] opacity-20 blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <h1 className="relative text-[180px] font-black tracking-tighter">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d9e92b] via-white to-[#00d4ff]">
              VIBEART
            </span>
            
            {/* Holographic Scan Line */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-transparent via-[#d9e92b]/30 to-transparent"
              animate={{ y: ["-100%", "100%"] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ height: "4px" }}
            />
          </h1>
        </div>

        {/* Animated Subtitle with Typing Effect */}
        <AnimatedText
          className="mt-8 text-xl text-white/70 font-light"
          text="WHERE AI MEETS INFINITE CREATION"
        />
      </div>
    </section>
  );
};
export const Hero2 = () => {
  const [activeShape, setActiveShape] = useState(0);
  const pathVariants = [
    "M0,0 Q50,50 100,0 T200,0 T300,0 T400,0",
    "M0,0 Q50,20 100,40 T200,60 T300,40 T400,0",
    "M0,0 Q50,-30 100,0 T200,30 T300,0 T400,0",
  ];

  return (
    <section className="relative min-h-screen bg-[#050505] overflow-hidden">
      {/* Liquid Background */}
      <div className="absolute inset-0">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          <defs>
            <linearGradient id="liquid-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d9e92b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <motion.path
            d={pathVariants[activeShape]}
            fill="url(#liquid-grad)"
            animate={{
              d: pathVariants,
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            onAnimationComplete={() => {
              setActiveShape((prev) => (prev + 1) % pathVariants.length);
            }}
          />
        </svg>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 rounded-full"
            style={{
              background: `radial-gradient(circle at center, ${
                i % 2 === 0 ? "#d9e92b" : "#00d4ff"
              }20, transparent 70%)`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              delay: i * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-50 min-h-screen flex flex-col items-center justify-center">
        {/* Animated Logo */}
        <motion.div
          className="relative mb-12"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="relative">
            <motion.div
              className="absolute -inset-6 rounded-full border-2"
              animate={{
                borderColor: ["#d9e92b", "#00d4ff", "#d9e92b"],
                rotate: [0, 360],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <h1 className="text-[160px] font-black tracking-tighter bg-gradient-to-r from-[#d9e92b] via-white to-[#00d4ff] bg-clip-text text-transparent">
              VIBEART
            </h1>
          </div>
        </motion.div>

        {/* Interactive CTA */}
        <motion.div
          className="relative group"
          whileHover="hover"
          initial="initial"
          animate="animate"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-[#d9e92b] to-[#00d4ff] rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500" />
          <button className="relative px-12 py-6 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white text-xl font-bold group-hover:bg-white/10 transition-all duration-300">
            <span className="flex items-center gap-3">
              LAUNCH CREATOR
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                ⟳
              </motion.span>
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
};
export const Hero3 = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [gridTilt, setGridTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      setGridTilt({
        x: (e.clientY / window.innerHeight - 0.5) * 10,
        y: -(e.clientX / window.innerWidth - 0.5) * 10,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen bg-[#050505] overflow-hidden">
      {/* Interactive 3D Grid */}
      <motion.div
        className="absolute inset-0 grid grid-cols-40 grid-rows-20 gap-2"
        style={{
          transform: `rotateX(${gridTilt.x}deg) rotateY(${gridTilt.y}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {Array.from({ length: 800 }).map((_, i) => (
          <motion.div
            key={i}
            className="bg-gradient-to-b from-[#d9e92b]/10 to-transparent border border-white/5 rounded-sm"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 2 + Math.random(),
              delay: Math.random() * 2,
              repeat: Infinity,
            }}
          />
        ))}
      </motion.div>

      {/* Data Stream Lines */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-0 h-0.5 bg-gradient-to-r from-transparent via-[#d9e92b] to-transparent"
            style={{ left: `${i * 10}%` }}
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{
              duration: 3,
              delay: i * 0.3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-50 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Binary Rain */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-[#d9e92b] font-mono text-sm"
              style={{ left: `${Math.random() * 100}%` }}
              animate={{ top: ["-10%", "110%"] }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {Array.from({ length: 10 })
                .map(() => Math.round(Math.random()))
                .join("")}
            </motion.div>
          ))}
        </div>

        {/* Animated Title */}
        <div className="relative">
          <motion.h1
            className="text-[180px] font-black tracking-tighter mb-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d9e92b] via-white to-[#d9e92b]">
                VIBE
              </span>
              <motion.span
                className="absolute -inset-0 blur-2xl opacity-30"
                style={{
                  background:
                    "linear-gradient(90deg, #d9e92b, #ffffff, #d9e92b)",
                }}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#d9e92b] to-white ml-4">
              ART
            </span>
          </motion.h1>

          {/* Rotating Orbital */}
          <motion.div
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full border-2 border-[#d9e92b]/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 bg-[#d9e92b] rounded-full"
                style={{
                  left: `${Math.cos((i * Math.PI) / 4) * 70 + 70}px`,
                  top: `${Math.sin((i * Math.PI) / 4) * 70 + 70}px`,
                }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Futuristic Navigation */}
        <div className="mt-16 flex gap-8">
          {["CREATE", "EXPLORE", "SHARE", "EARN"].map((item, i) => (
            <motion.button
              key={item}
              className="relative px-8 py-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 text-white font-semibold overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#d9e92b]/20 to-[#00d4ff]/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "0%" }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative">{item}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};
export const Hero4 = () => {
  const [activePhase, setActivePhase] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Quantum state particles
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    phase: number;
  }>>([]);

  // Initialize quantum particles
  useEffect(() => {
    const quantumParticles = Array.from({ length: 200 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      color: i % 3 === 0 ? "#d9e92b" : i % 3 === 1 ? "#00d4ff" : "#ff00ff",
      phase: Math.random() * Math.PI * 2,
    }));
    setParticles(quantumParticles);
  }, []);

  // Create quantum entanglement effect
  const quantumEntanglement = (x: number, y: number) => {
    return `radial-gradient(600px at ${x}px ${y}px, 
      rgba(217, 233, 43, 0.15) 0%,
      rgba(0, 212, 255, 0.1) 25%,
      rgba(255, 0, 255, 0.05) 50%,
      transparent 80%)`;
  };

  // Morphing letters animation
  const letterMorphs = [
    // Phase 0: Base
    {
      V: "M20,80 L50,20 L80,80",
      I: "M110,20 L110,80",
      B: "M130,20 Q160,20 160,40 Q160,60 130,60 Q160,60 160,80 Q160,100 130,100",
      E: "M180,20 L220,20 L180,20 L180,50 L210,50 L180,50 L180,80 L220,80",
      A: "M240,80 L270,20 L300,80 M255,50 L285,50",
      R: "M320,20 L320,80 Q350,20 320,50 Q350,80 320,80",
      T: "M360,20 L400,20 L380,20 L380,80"
    },
    // Phase 1: Quantum state
    {
      V: "M20,80 L40,40 L60,60 L80,20",
      I: "M110,30 Q130,20 110,50 Q90,70 110,80",
      B: "M130,20 C160,10 170,40 160,60 C170,80 140,90 130,80",
      E: "M180,20 C200,15 210,35 200,50 C210,65 190,75 180,80",
      A: "M240,80 C260,70 280,30 270,20 C260,40 270,60 255,50",
      R: "M320,20 C340,30 350,50 330,70 C350,85 320,90 320,80",
      T: "M360,20 C380,25 400,25 380,50 C370,70 390,80 380,80"
    },
    // Phase 2: Wave form
    {
      V: "M20,80 C30,60 40,40 50,20 C60,40 70,60 80,80",
      I: "M110,20 C105,40 115,60 110,80",
      B: "M130,20 C150,15 160,30 160,50 C160,70 150,85 130,80",
      E: "M180,20 C190,20 210,25 200,40 C210,55 190,65 180,80",
      A: "M240,80 C250,60 260,40 270,20 C280,40 290,60 300,80",
      R: "M320,20 C330,30 340,45 320,60 C335,75 320,90 320,80",
      T: "M360,20 C370,30 390,30 380,50 C370,70 390,80 380,80"
    }
  ];

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen bg-[#050505] overflow-hidden"
    >
      {/* Quantum Field Background */}
      <div className="absolute inset-0">
        {/* Dynamic Grid Distortion */}
        <svg className="w-full h-full opacity-30">
          <defs>
            <filter id="quantum-distortion">
              <feTurbulence 
                type="fractalNoise" 
                baseFrequency="0.01 0.02" 
                numOctaves="3" 
                result="noise"
              />
              <feDisplacementMap 
                in="SourceGraphic" 
                in2="noise" 
                scale="20" 
                xChannelSelector="R" 
                yChannelSelector="G"
              />
            </filter>
            <radialGradient id="quantum-glow">
              <stop offset="0%" stopColor="#d9e92b" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#00d4ff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ff00ff" stopOpacity="0.1" />
            </radialGradient>
          </defs>
          
          {/* Distorted Grid */}
          <g filter="url(#quantum-distortion)">
            {Array.from({ length: 50 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={`${i * 2}%`}
                x2="100%"
                y2={`${i * 2}%`}
                stroke="url(#quantum-glow)"
                strokeWidth="0.5"
              />
            ))}
            {Array.from({ length: 50 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={`${i * 2}%`}
                y1="0"
                x2={`${i * 2}%`}
                y2="100%"
                stroke="url(#quantum-glow)"
                strokeWidth="0.5"
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Quantum Particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              background: particle.color,
              boxShadow: `0 0 10px ${particle.color}`,
            }}
            animate={{
              x: [
                `0%`,
                `${Math.sin(particle.phase) * 100}%`,
                `${Math.cos(particle.phase) * 50}%`,
                `0%`
              ],
              y: [
                `0%`,
                `${Math.cos(particle.phase) * 100}%`,
                `${Math.sin(particle.phase) * 50}%`,
                `0%`
              ],
              scale: [1, 1.5, 0.5, 1],
              opacity: [0.3, 1, 0.3, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              delay: Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Morphing Title */}
      <div className="relative z-50 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="relative mb-20">
          {/* Animated SVG Letters */}
          <div className="relative w-[800px] h-[200px]">
            <svg
              viewBox="0 0 420 120"
              className="w-full h-full"
            >
              {["V", "I", "B", "E", "A", "R", "T"].map((letter, index) => (
                <g key={letter} transform={`translate(${index * 60}, 0)`}>
                  <motion.path
                    d={letterMorphs[activePhase][letter as keyof typeof letterMorphs[0]]}
                    stroke="url(#letter-gradient)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    animate={{
                      d: [
                        letterMorphs[0][letter as keyof typeof letterMorphs[0]],
                        letterMorphs[1][letter as keyof typeof letterMorphs[0]],
                        letterMorphs[2][letter as keyof typeof letterMorphs[0]],
                        letterMorphs[0][letter as keyof typeof letterMorphs[0]],
                      ],
                    }}
                    transition={{
                      duration: 4,
                      delay: index * 0.2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    }}
                  />
                  {/* Glow effect */}
                  <motion.path
                    d={letterMorphs[activePhase][letter as keyof typeof letterMorphs[0]]}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="blur-xl opacity-30"
                    animate={{
                      d: [
                        letterMorphs[0][letter as keyof typeof letterMorphs[0]],
                        letterMorphs[1][letter as keyof typeof letterMorphs[0]],
                        letterMorphs[2][letter as keyof typeof letterMorphs[0]],
                        letterMorphs[0][letter as keyof typeof letterMorphs[0]],
                      ],
                    }}
                    transition={{
                      duration: 4,
                      delay: index * 0.2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    }}
                  />
                </g>
              ))}
              
              <defs>
                <linearGradient id="letter-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#d9e92b" />
                  <stop offset="50%" stopColor="#00d4ff" />
                  <stop offset="100%" stopColor="#ff00ff" />
                </linearGradient>
              </defs>
            </svg>

            {/* Interactive Hologram */}
            <motion.div
              className="absolute -inset-20 rounded-full border-2 border-[#d9e92b]/20"
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1],
              }}
              transition={{
                rotate: {
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                },
                scale: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            />
          </div>

          {/* Phase Changer */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex gap-4">
            {[0, 1, 2].map((phase) => (
              <button
                key={phase}
                onClick={() => setActivePhase(phase)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activePhase === phase 
                    ? 'bg-[#d9e92b] scale-125' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Dynamic Subtitle with Wave Animation */}
        <div className="relative mt-12">
          <motion.div
            className="relative overflow-hidden"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              background: "linear-gradient(90deg, #d9e92b, #00d4ff, #ff00ff, #d9e92b)",
              backgroundSize: "300% 300%",
            }}
          >
            <h2 className="text-4xl font-bold text-transparent bg-clip-text">
              QUANTUM CREATIVE ENGINE
            </h2>
          </motion.div>
          
          <motion.p
            className="mt-4 text-lg text-white/60 max-w-xl"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Where every pixel is a quantum possibility
          </motion.p>
        </div>

        {/* Quantum Interface Controls */}
        <div className="mt-16 flex gap-8">
          <motion.button
            className="relative px-12 py-6 rounded-xl overflow-hidden group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Quantum Ripple Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#d9e92b]/20 via-[#00d4ff]/20 to-[#ff00ff]/20"
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            
            {/* Button Content */}
            <div className="relative flex items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 rounded-full border-2 border-[#d9e92b]"
              />
              <span className="text-xl font-bold text-white">
                INITIATE QUANTUM CREATION
              </span>
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-[#d9e92b]"
              >
                →
              </motion.div>
            </div>
          </motion.button>

          {/* Data Stream Button */}
          <motion.button
            className="relative px-8 py-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden group"
            whileHover={{ scale: 1.05 }}
          >
            {/* Binary Stream */}
            <div className="absolute inset-0 overflow-hidden opacity-20">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-xs font-mono text-[#00d4ff] whitespace-nowrap"
                  style={{ top: `${i * 20}%` }}
                  animate={{ x: ["100%", "-100%"] }}
                  transition={{
                    duration: 10 + i * 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  0101010101010101010101010101010101010101
                </motion.div>
              ))}
            </div>
            <span className="relative text-white">EXPLORE DIMENSIONS</span>
          </motion.button>
        </div>

        {/* Live Stats */}
        <div className="mt-20 flex gap-12">
          {[
            { label: "QUANTUM STATES", value: "∞", unit: "" },
            { label: "DIMENSIONS", value: "11", unit: "D" },
            { label: "CREATIONS/SEC", value: "2.4K", unit: "" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <div className="text-5xl font-bold bg-gradient-to-r from-[#d9e92b] to-[#00d4ff] bg-clip-text text-transparent">
                {stat.value}
                <span className="text-2xl">{stat.unit}</span>
              </div>
              <div className="text-sm text-white/40 mt-2">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quantum Noise Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
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

