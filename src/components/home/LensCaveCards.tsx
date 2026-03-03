"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// Same static templates as CanvasDashboard
const STATIC_TEMPLATES = [
  {
    id: "05925547-bf66-4072-a136-0456dcffbd1f",
    title: "Branding demo",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/05925547-bf66-4072-a136-0456dcffbd1f/e6c19a4e-d941-485b-bc21-0b19f84b9fa0/0.jpeg",
    user_id: "3c40da91-b7c5-4d89-ae86-91180214e50e",
    category: "Template",
  },
  {
    id: "43edca02-2a9a-4ce3-bfc1-6c80deb2a8ac",
    title: "Thumbnail demo",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/43edca02-2a9a-4ce3-bfc1-6c80deb2a8ac/5d5c7849-b0d1-4513-8e95-9a1fb9dfee38/0.webp",
    user_id: "3c40da91-b7c5-4d89-ae86-91180214e50e",
    category: "Template",
  },
  {
    id: "1270379f-063d-4967-b841-0bab43be6579",
    title: "Consistent Character",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/1270379f-063d-4967-b841-0bab43be6579/8a0e2341-26e9-4f13-ba2f-3e1f7d47a5b3/0.webp",
    user_id: "3c40da91-b7c5-4d89-ae86-91180214e50e",
    category: "Template",
  },
  {
    id: "6c3ecee1-0a45-4fc0-870c-9ccaed0fac59",
    title: "AI Apps demo",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/6c3ecee1-0a45-4fc0-870c-9ccaed0fac59/4cT_DI06Oz_DVKcTTlInr.jpg",
    user_id: "3c40da91-b7c5-4d89-ae86-91180214e50e",
    category: "Template",
  },
  {
    id: "d6c2a8f4-1000-490f-80e1-6a4ae173b46b",
    title: "Background Art demo",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/d6c2a8f4-1000-490f-80e1-6a4ae173b46b/6ad0934c-59f6-4c08-bc68-36126177232d/2.jpg",
    user_id: "3c40da91-b7c5-4d89-ae86-91180214e50e",
    category: "Template",
  },
  {
    id: "fb13dedc-687a-4f25-9ae1-dc77b4cd2190",
    title: "Face replacement demo",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/fb13dedc-687a-4f25-9ae1-dc77b4cd2190/crop_426875f3-9646-499a-8d15-9c1f524f3f77.jpg",
    user_id: "3c40da91-b7c5-4d89-ae86-91180214e50e",
    category: "Template",
  },
];

export default function LensCaveCards() {
  const router = useRouter();
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollSlider = (direction: "left" | "right") => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: direction === "left" ? -400 : 400,
        behavior: "smooth",
      });
    }
  };

  // Auto-scroll every 3 seconds, pause on hover
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let intervalId: NodeJS.Timeout;

    const startScroll = () => {
      intervalId = setInterval(() => {
        if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 10) {
          slider.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          slider.scrollBy({ left: 400, behavior: "smooth" });
        }
      }, 3000);
    };

    const pauseScroll = () => clearInterval(intervalId);

    startScroll();
    slider.addEventListener("mouseenter", pauseScroll);
    slider.addEventListener("mouseleave", startScroll);

    return () => {
      clearInterval(intervalId);
      slider.removeEventListener("mouseenter", pauseScroll);
      slider.removeEventListener("mouseleave", startScroll);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full bg-black px-6 pb-20 md:px-20 lg:px-32"
    >
      {/* Section Header */}
      <div className="mb-6 flex items-center gap-4">
        <motion.h2
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xl font-bold text-white"
        >
          Templates
        </motion.h2>
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm text-neutral-500"
        >
          Click to open in canvas editor
        </motion.span>
      </div>

      {/* Slider */}
      <div className="group/slider relative -mx-6 overflow-hidden px-6 md:-mx-20 md:px-20 lg:-mx-32 lg:px-32">
        {/* Left fade */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-black to-transparent" />
        {/* Right fade */}
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-black to-transparent" />

        {/* Left Button */}
        <button
          onClick={() => scrollSlider("left")}
          className="absolute left-6 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-xl border border-white/10 bg-neutral-800 text-white opacity-0 shadow-xl backdrop-blur-md transition-all hover:bg-neutral-700 group-hover/slider:opacity-100"
        >
          <ArrowLeft className="size-5" />
        </button>

        {/* Right Button */}
        <button
          onClick={() => scrollSlider("right")}
          className="absolute right-6 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-xl border border-white/10 bg-neutral-800 text-white shadow-xl backdrop-blur-md transition-all hover:bg-neutral-700 disabled:opacity-0"
        >
          <ArrowRight className="size-5" />
        </button>

        {/* Cards */}
        <div
          ref={sliderRef}
          className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {STATIC_TEMPLATES.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              onClick={() => router.push(`/canvas/${item.id}`)}
              className="group relative h-48 w-72 flex-shrink-0 cursor-pointer snap-center overflow-hidden rounded-2xl bg-neutral-800 transition-transform active:scale-95"
            >
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <span className="max-w-[75%] truncate text-sm font-semibold text-white">
                  {item.title}
                </span>
                <span className="rounded-full border border-white/10 bg-black/50 px-2 py-0.5 text-xs text-neutral-400 backdrop-blur">
                  {item.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
