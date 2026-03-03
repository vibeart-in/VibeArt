"use client";

import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  Video,
  Image as ImageIcon,
  Edit,
  Grid,
  Sparkles,
  Cpu,
  LucideIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface FeatureCardProps {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  imageSrc: string;
  link: string;
}

const featureCards: FeatureCardProps[] = [
 {
  id:1,
  title:"Canvas",
  description:"Create stunning AI art in seconds.",
  icon:Sparkles,
  imageSrc:"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/showcase/new/2_5D_In_the_cold_winter_with_Snow_gleams_white_Sno.jpg",
  link:"/canvas",
 },
  {
    id: 2,
    title: "Generate",
    description: "Create stunning AI art in seconds.",
    icon: Sparkles,
    imageSrc: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/showcase/new/2_5D_In_the_cold_winter_with_Snow_gleams_white_Sno.jpg",
    link: "/generate",
  },
  {
    id: 3,
    title: "Edit",
    description: "Powerful tools to tweak and perfect your images.",
    icon: Edit,
    imageSrc: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/showcase/new/A_vast_utopian_cliffside_metropolis_with_sweeping_%20(1).jpg",
    link: "/edit",
  },
  {
    id: 4,
    title: "Video",
    description: "Transform your ideas into motion.",
    icon: Video,
    imageSrc: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/showcase/new/deep_space_--ar_9_16_--profile_gu2pumm_3mvw2x6%20(1).jpg",
    link: "/video",
  },
  {
    id: 5,
    title: "AI Apps",
    description: "Explore a suite of specialized AI tools.",
    icon: Grid,
    imageSrc: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/showcase/new/semi-realistic_anime_digital_art_style_she_s_looki%20(2).jpg",
    link: "/ai-apps",
  },
  {
    id: 6,
    title: "Advance",
    description: "Pro-level controls for ultimate precision.",
    icon: Cpu,
    imageSrc: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/showcase/new/semi-realistic_anime_digital_art_style_she_s_looki%20(2).jpg",
    link: "/advance_generate",
  },
  {
    id: 7,
    title: "Gallery",
    description: "Showcase and discover amazing creations.",
    icon: ImageIcon,
    imageSrc: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/showcase/illustrious/00049-379993896.webp",
    link: "/gallery",
  },
];

const HomeFeatureCard = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    dragFree: true,
  });

  const [isPlaying, setIsPlaying] = useState(true);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  useEffect(() => {
    if (!isPlaying || !emblaApi) return;

    const intervalId = setInterval(() => {
      scrollNext();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [isPlaying, emblaApi, scrollNext]);

  const handleMouseEnter = () => setIsPlaying(false);
  const handleMouseLeave = () => setIsPlaying(true);

  return (
    <div className="w-full overflow-hidden py-12 lg:px-12 bg-black">
      <div className="group/fc relative w-full">
        {/* Gradient Masks */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-black to-transparent" />

        {/* Prev Button */}
        <button
          onClick={scrollPrev}
          className="absolute left-3 top-1/3 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-xl border border-white/10 bg-neutral-900/80 text-white opacity-0 shadow-xl backdrop-blur-md transition-all hover:bg-neutral-700 group-hover/fc:opacity-100"
        >
          <ChevronLeft className="size-5" />
        </button>

        {/* Next Button */}
        <button
          onClick={scrollNext}
          className="absolute right-3 top-1/3 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-xl border border-white/10 bg-neutral-900/80 text-white opacity-0 shadow-xl backdrop-blur-md transition-all hover:bg-neutral-700 group-hover/fc:opacity-100"
        >
          <ChevronRight className="size-5" />
        </button>

        <div
          className="overflow-hidden"
          ref={emblaRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex touch-pan-y">
            {featureCards.map((card) => (
              <div
                key={card.id}
                className="relative flex flex-col gap-4 group cursor-pointer flex-shrink-0 w-[85vw] sm:w-[45vw] md:w-[28vw] lg:w-[23%] pl-8"
                onMouseEnter={() => setHoveredId(card.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <Link href={card.link} className="block group">
                  {/* Card Image */}
                  <div className="relative aspect-[1/1.3] w-full overflow-hidden rounded-2xl">
                    <img
                    src={card.imageSrc}
                    alt={card.title}
                    className="object-cover w-full h-full rounded-xl"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-2 mt-12">
                    {/* Line */}
                    <div
                      className={`h-[2px] w-full transition-colors duration-300 ${
                        hoveredId === card.id ? "bg-white" : "bg-white/20"
                      }`}
                    />

                    <div className="flex items-center gap-2 mt-2">
                      <card.icon
                        className={`size-5 transition-colors duration-300 ${
                          hoveredId === card.id ? "text-white" : "text-white/60"
                        }`}
                      />
                      <h3
                        className={`text-lg font-semibold transition-colors duration-300 ${
                          hoveredId === card.id ? "text-white" : "text-white/80"
                        }`}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {card.description}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeFeatureCard;