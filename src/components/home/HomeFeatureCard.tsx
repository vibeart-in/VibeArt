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
} from "lucide-react";
import Image from "next/image";
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
    id: 1,
    title: "Generate",
    description: "Create stunning AI art in seconds.",
    icon: Sparkles,
    imageSrc: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/showcase/new/2_5D_In_the_cold_winter_with_Snow_gleams_white_Sno.jpg",
    link: "/generate",
  },
  {
    id: 2,
    title: "Edit",
    description: "Powerful tools to tweak and perfect your images.",
    icon: Edit,
    imageSrc: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/showcase/new/A_vast_utopian_cliffside_metropolis_with_sweeping_%20(1).jpg",
    link: "/edit",
  },
  {
    id: 3,
    title: "Video",
    description: "Transform your ideas into motion.",
    icon: Video,
    imageSrc: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/showcase/new/deep_space_--ar_9_16_--profile_gu2pumm_3mvw2x6%20(1).jpg",
    link: "/video",
  },
  {
    id: 4,
    title: "AI Apps",
    description: "Explore a suite of specialized AI tools.",
    icon: Grid,
    imageSrc: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/showcase/new/semi-realistic_anime_digital_art_style_she_s_looki%20(2).jpg",
    link: "/ai-apps",
  },
  {
    id: 5,
    title: "Advance",
    description: "Pro-level controls for ultimate precision.",
    icon: Cpu,
    imageSrc: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/showcase/new/semi-realistic_anime_digital_art_style_she_s_looki%20(2).jpg",
    link: "/advance_generate",
  },
  {
    id: 6,
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
      <div className="relative w-full">
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-black to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-black to-transparent pointer-events-none" />

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