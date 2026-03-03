"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

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
          <h2 className="mb-8 font-satoshi text-5xl font-black tracking-tight text-white md:text-8xl">
            Bring Your Brand <br /> to Life
          </h2>
          <p className="mx-auto mb-12 max-w-xl text-xl text-neutral-400">
            Join thousands of creators who are scaling their brand identity with VibeArt today.
          </p>
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-white px-10 py-5 text-xl font-bold text-black transition-transform hover:scale-105 active:scale-95"
          >
            <span>Get Started Free</span>
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
