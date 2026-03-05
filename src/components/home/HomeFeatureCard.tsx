"use client";

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
import React, { useState, useEffect, useCallback } from "react";

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
    title: "Canvas",
    description: "Create complex AI workflows in seconds.",
    icon: Sparkles,
    imageSrc: "https://i.pinimg.com/736x/3b/b3/08/3bb308dfc5184a408ac6fb4059f5208d.jpg",
    link: "/canvas",
  },
  {
    id: 2,
    title: "Generate",
    description: "Create stunning AI art in seconds.",
    icon: Sparkles,
    imageSrc:
      "https://i.pinimg.com/736x/c1/b9/ac/c1b9ac13aaaf146de837ca6f7a8cddea.jpg",
    link: "/generate",
  },
  {
    id: 3,
    title: "Edit",
    description: "Powerful tools to tweak and perfect your images.",
    icon: Edit,
    imageSrc:
      "https://i.pinimg.com/736x/2a/7d/4a/2a7d4a526e8d356962edfb94eb70f530.jpg",
    link: "/edit",
  },
  {
    id: 4,
    title: "Video",
    description: "Transform your ideas into motion.",
    icon: Video,
    imageSrc:
      "https://i.pinimg.com/1200x/35/d3/19/35d319dcb4acd6d3472e593064af6b55.jpg",
    link: "/video",
  },
  {
    id: 5,
    title: "AI Apps",
    description: "Explore a suite of specialized AI tools.",
    icon: Grid,
    imageSrc:
      "https://i.pinimg.com/736x/b0/f2/af/b0f2af275fa01546ae556ec03bbdd18d.jpg",
    link: "/ai-apps",
  },
  {
    id: 6,
    title: "Advance",
    description: "Pro-level controls for ultimate precision.",
    icon: Cpu,
    imageSrc: "https://i.pinimg.com/736x/f6/04/7b/f6047bbf9d396b24a91799a1df469c7c.jpg",
    link: "/advance_generate",
  },
];

const HomeFeatureCard = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  // Removed loop: true and added containScroll for a cleaner non-infinite boundary
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  // Hook into embla to update the button's disabled state on scroll/init
  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="mt-8 w-full overflow-hidden bg-black py-16 lg:px-12">
      {/* Added Explore Header */}
      <div className="mb-10 px-8">
        <h2 className="mb-3 text-3xl font-bold text-white md:text-4xl">Explore Features</h2>
        <p className="text-lg text-gray-400">Discover our powerful suite of AI creation tools.</p>
      </div>

      <div className="group/fc relative w-full">
        {/* Gradient Masks */}
        {/* <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-black to-transparent" /> */}
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-black to-transparent" />

        {/* Prev Button - Will hide if at the very beginning */}
        <button
          onClick={scrollPrev}
          disabled={prevBtnDisabled}
          className={`absolute left-3 top-1/3 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-xl border border-white/10 bg-neutral-900/80 text-white shadow-xl backdrop-blur-md transition-all hover:bg-neutral-700 ${prevBtnDisabled ? "hidden" : "opacity-0 group-hover/fc:opacity-100"}`}
        >
          <ChevronLeft className="size-5" />
        </button>

        {/* Next Button - Will hide if at the very end */}
        <button
          onClick={scrollNext}
          disabled={nextBtnDisabled}
          className={`absolute right-3 top-1/3 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-xl border border-white/10 bg-neutral-900/80 text-white shadow-xl backdrop-blur-md transition-all hover:bg-neutral-700 ${nextBtnDisabled ? "hidden" : "opacity-0 group-hover/fc:opacity-100"}`}
        >
          <ChevronRight className="size-5" />
        </button>

        {/* Removed onMouseEnter/onMouseLeave handlers since auto-play is gone */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {featureCards.map((card) => (
              <div
                key={card.id}
                className="group relative flex w-[85vw] flex-shrink-0 cursor-pointer flex-col gap-4 pl-8 sm:w-[45vw] md:w-[28vw] lg:w-[23%]"
                onMouseEnter={() => setHoveredId(card.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <Link href={card.link} className="group block">
                  {/* Card Image */}
                  <div className="relative aspect-[1/1.3] w-full overflow-hidden rounded-2xl">
                    <img
                      src={card.imageSrc}
                      alt={card.title}
                      className="size-full rounded-xl object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="mt-12 flex flex-col gap-2">
                    {/* Line */}
                    <div
                      className={`h-[2px] w-full transition-colors duration-300 ${
                        hoveredId === card.id ? "bg-white" : "bg-white/20"
                      }`}
                    />

                    <div className="mt-2 flex items-center gap-2">
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
                    <p className="line-clamp-2 text-sm text-gray-400">{card.description}</p>
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
