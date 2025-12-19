"use client";

import React from "react";
import { motion } from "framer-motion";

interface ModernCardLoaderProps {
  text?: string;
  subtitle?: string;
}

export const ModernCardLoader: React.FC<ModernCardLoaderProps> = ({
  text = "Generating",
  subtitle = "Crafting your masterpiece...",
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden bg-black/40 backdrop-blur-md">
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: ["-20%", "20%", "-20%"],
            y: ["-20%", "20%", "-20%"],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[20%] size-[80%] rounded-full bg-accent/20 blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            x: ["20%", "-20%", "20%"],
            y: ["20%", "-20%", "20%"],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[20%] size-[80%] rounded-full bg-purple-500/10 blur-[100px]"
        />
      </div>

      {/* Central AI Core Animation */}
      <div className="relative mb-8 flex items-center justify-center">
        {/* Pulsing Core */}
        <motion.div
          animate={{
            scale: [0.8, 1.1, 0.8],
            opacity: [0.5, 1, 0.5],
            boxShadow: [
              "0 0 20px rgba(255,255,255,0.1)",
              "0 0 60px rgba(255,255,255,0.3)",
              "0 0 20px rgba(255,255,255,0.1)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="size-16 rounded-3xl bg-white mix-blend-overlay"
        />

        {/* Orbiting Ring 1 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute size-24 rounded-full border border-white/20 border-t-white/60"
        />

        {/* Orbiting Ring 2 */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          className="absolute size-32 rounded-full border border-white/10 border-b-white/40"
        />
      </div>

      {/* Text Content */}
      <div className="relative z-10 flex flex-col items-center gap-1 px-6 text-center">
        <div className="flex items-center gap-1 overflow-hidden">
          {text.split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: i * 0.05,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 2,
              }}
              className="text-2xl font-semibold tracking-tight text-white"
            >
              {char}
            </motion.span>
          ))}
        </div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-xs font-light tracking-widest uppercase text-white/80"
        >
          {subtitle}
        </motion.p>
      </div>

      {/* Subtle Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,4px_100%] opacity-20" />
    </div>
  );
};
