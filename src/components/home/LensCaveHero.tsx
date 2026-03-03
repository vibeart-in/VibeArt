"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const HERO_SLIDES = [
  {
    id: 1,
    tag: "✦ Featured Model",
    heading: "Upscale image",
    sub: "4K",
    description:
      "Upscale your image to 4K resolution with AI",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/showcase/new/semi-realistic_anime_digital_art_style_she_s_looki.jpg",
    cta: "/ai-apps/108fa3df-6a1a-460b-aecb-cd1f025d4534",
  },
  {
    id: 2,
    tag: "✦ New Release",
    heading: "Nano Banana",
    sub: "2",
    description:"unbeliveable realstic image generation",
    image:"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/showcase/illustrious/00049-379993896.webp",
    cta: "/generate",
  },
  {
    id: 3,
    tag: "✦ Architecture",
    heading: "FLUX",
    sub: ".1",
    description:
      "Next-generation image generation by Black Forest Labs. Exceptional prompt adherence and compositional accuracy for complex creative prompts.",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/showcase/new/A_vast_utopian_cliffside_metropolis_with_sweeping_%20(1).jpg",
    cta: "/advance_generate",
  },
  {
    id: 4,
    tag: "✦ AI Video",
    heading: "Wan",
    sub: "2.1",
    description:
      "A cutting-edge open-source video generation model from Alibaba. Create smooth, cinematic AI video clips from text prompts or images.",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/showcase/new/deep_space_--ar_9_16_--profile_gu2pumm_3mvw2x6%20(1).jpg",
    cta: "/video",
  },
  {
    id: 5,
    tag: "✦ Recommended",
    heading: "Nanobannan",
    sub: "2",
    description:
      "A lightweight yet powerful generalist model fine-tuned for rapid generation. Ideal for concept art, mood boards, and iterative creative exploration.",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/showcase/new/2_5D_In_the_cold_winter_with_Snow_gleams_white_Sno.jpg",
    cta: "/generate",
  },
];

const SLIDE_DURATION = 5000; // ms

export default function LensCaveHero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[current];

  return (
    <div className="relative h-[85vh] w-full overflow-hidden bg-black text-white">
      {/* ── Backgrounds — cross-fade ── */}
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <Image
            src={slide.image}
            alt={slide.heading}
            fill
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* ── Content — fades with each slide ── */}
      <div className="relative z-10 flex h-full flex-col justify-center px-6 md:px-20 lg:px-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            className="max-w-2xl space-y-6"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            {/* Tag */}
            <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-gray-400">
              {slide.tag}
            </div>

            {/* Heading */}
            <h1 className="font-satoshi text-5xl font-bold leading-tight tracking-tight md:text-7xl">
              {slide.heading}{" "}
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                {slide.sub}
              </span>{" "}
              ✦
            </h1>

            {/* Description */}
            <p className="max-w-lg text-lg leading-relaxed text-gray-400">{slide.description}</p>

            {/* CTA */}
            <div className="flex items-center gap-4 pt-2">
              <a
                href={slide.cta}
                className="group flex items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-black transition-all hover:bg-gray-200"
              >
                Try it now
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </a>
              <button className="flex items-center gap-2 rounded-full px-8 py-3 font-semibold text-white transition-all hover:bg-white/10">
                View similar apps
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Slide Indicators ── */}
        <div className="absolute bottom-10 left-6 flex items-center gap-2 md:left-20 lg:left-32">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === current ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
