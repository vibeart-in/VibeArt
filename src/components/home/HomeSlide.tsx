"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

const HERO_SLIDES = [
  {
    id: 1,
    tag: "✦ Comming Soon",
    heading: "Seedance",
    sub: "2.0",
    description:
      "Seedance 2.0 is a revolutionary multi-modal AI video generation model that supports image, video, audio, and text inputs",
    image: "https://static.higgsfield.ai/seedance-2/feature-5.mp4",
    cta: "/canvas",
  },
  {
    id: 2,
    tag: "✦ New Release",
    heading: "Nano Banana",
    sub: "2",
    description:
      "Google's fast image generation model with conversational editing, multi-image fusion, and character consistency",
    image:
      "https://v1.pinimg.com/videos/mc/expMp4/a3/54/de/a354de8d19493e6e4d31dc01fddcfab3_t3.mp4",
    cta: "/generate",
  },
  {
    id: 5,
    tag: "✦ Recommended",
    heading: "Canvas",
    sub: "1.0",
    description:
      "A lightweight yet powerful generalist model fine-tuned for rapid generation. Ideal for concept art, mood boards, and iterative creative exploration.",
    image: "https://i.pinimg.com/736x/f5/71/ca/f571ca671fd3dcc1758a8ea7e480c6c1.jpg",
    cta: "/canvas",
  },
];

const SLIDE_DURATION = 10000; // ms

export default function HomeSlide() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[current];

  return (
    <div className="relative h-[70vh] w-full overflow-hidden bg-black text-white">
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
          {slide.image.endsWith(".mp4") ? (
            <video
              src={slide.image}
              autoPlay
              muted
              loop
              className="size-full object-cover opacity-80"
            />
          ) : (
            <Image
              src={slide.image}
              alt={slide.heading}
              fill
              className="object-cover opacity-80"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/45 to-transparent" />
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
