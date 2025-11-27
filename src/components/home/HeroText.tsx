"use client";

import { IconSparkles } from "@tabler/icons-react";
import { motion } from "framer-motion";

export default function HeroText() {
  return (
    <div className="mb-8 flex flex-col items-center text-center md:mb-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center justify-center gap-3 md:flex-row"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
            filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-full bg-yellow-400/20 blur-lg" />
          <IconSparkles
            className="relative h-10 w-10 text-yellow-300 md:h-12 md:w-12"
            aria-hidden="true"
          />
        </motion.div>

        <h1 className="bg-gradient-to-b from-white via-white/90 to-white/70 bg-clip-text font-satoshi text-4xl font-black leading-[1.1] tracking-tight text-transparent sm:text-5xl md:text-7xl p-4">
          Imagine it. Make it. Share it.
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mt-4 max-w-sm text-base font-medium text-white/60 md:mt-6 md:text-lg"
      >
        Pixel-perfect images and edits powered by AI — quick, fun, and professional.
      </motion.p>
    </div>
  );
}
