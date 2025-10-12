"use client";
import Image from "next/image";
import { GradientComponent } from "./Gradient";
import CardScroll from "./CardScroll";
import GlassPaneBG from "./GlassPaneBG";
import InputBox from "../inputBox/InputBox";
import { ImageCard3DType } from "@/src/types/BaseType";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { heroSlides, HeroSlide } from "@/src/lib/heroConfig";

const cardData1: ImageCard3DType[] = [
  {
    topImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/prop_game_top.webp",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/prop_game_bottom.webp",
    cardText: "Gaming",
    topImageScale: 1.2,
  },
  {
    topImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/figurine_trans2.webp",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/figurine.webp",
    cardText: "Editing",
    topImageScale: 1.1,
  },
  {
    topImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/site-dsgin.webp",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/site-desgin.webp",
    cardText: "Web desgin",
    topImageScale: 1.1,
  },
  {
    topImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/90s-top.webp",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/90s-bottom.webp",
    cardText: "90s",
    topImageScale: 1.2,
  },
  {
    topImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/game-top.webp",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/game-bottom.webp",
    cardText: "Game",
    topImageScale: 1.1,
  },
  {
    topImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/concept-top.webp",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/concept-bottom.webp",
    cardText: "concept",
    topImageScale: 1.2,
  },
  {
    topImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/emotion-top.webp",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/emotion-bottom.webp",
    cardText: "concept",
    topImageScale: 1.1,
  },
  {
    topImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/product-top.webp",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/product-bottom.webp",
    cardText: "Product",
    topImageScale: 1.05,
  },
  {
    topImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/phone-to.webp",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/phone-bottom.webp",
    cardText: "Ultra real",
    topImageScale: 1.1,
  },
  {
    topImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/keys-trans.webp",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/keys.webp",
    cardText: "Abstract",
    topImageScale: 1.4,
  },
  {
    topImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/anime_girl_top.webp",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/anime_girl_bottom.webp",
    cardText: "Anime",
    topImageScale: 1.1,
  },
  {
    topImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/goth_girl_top.webp",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/goth_girl_bottom.webp",
    cardText: "Gothic",
    topImageScale: 1.2,
  },
  {
    topImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/goth_girl2_top.webp",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/goth_girl2_bottom.webp",
    cardText: "Dark",
    topImageScale: 1.1,
  },
  {
    topImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/jap_girl_top.webp",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/jap_girl_bottom.webp",
    cardText: "Kawaii",
    topImageScale: 1.2,
  },
];

const cardData2: ImageCard3DType[] = [
  {
    topImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/guy_top.webp",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/guy_bottom.webp",
    cardText: "Guy",
    topImageScale: 1.1,
    width: 400,
    height: 600,
    fontSize: 1000,
  },
  {
    topImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/mirror_girl_top.webp",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/mirror_girl_bottom.webp",
    cardText: "Instagram",
    topImageScale: 1.2,
    width: 400,
    height: 600,
  },
  {
    topImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/prop_top.webp",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/prop_bottom.webp",
    cardText: "Dark",
    topImageScale: 1.3,
    width: 400,
    height: 600,
  },
  {
    topImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/jap_girl_top.webp",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/jap_girl_bottom.webp",
    cardText: "Kawaii",
    topImageScale: 1.2,
    width: 400,
    height: 600,
  },
  {
    topImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/prop_top.webp",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/prop_bottom.webp",
    cardText: "Dark",
    topImageScale: 1.3,
    width: 400,
    height: 600,
  },
  {
    topImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/jap_girl_top.webp",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/jap_girl_bottom.webp",
    cardText: "Kawaii",
    topImageScale: 1.2,
    width: 400,
    height: 600,
  },
];

const Hero = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState<HeroSlide>(heroSlides[0]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % heroSlides.length;
        setCurrentSlide(heroSlides[nextIndex]);
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Hero Section */}
      <div className="group relative -mt-10 h-[90vh] min-h-[500px] sm:h-[105vh]">
        {/* Animated Images */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              duration: 1.2,
              ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth transition
            }}
            className="absolute inset-0"
          >
            <Image
              className="absolute inset-0 h-full w-full object-contain"
              src={currentSlide.image}
              alt="Cover of an high quality AI images"
              priority
              objectFit="contain"
              layout="fill"
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 z-10 h-[200px] bg-black/5 backdrop-blur-md [mask-image:linear-gradient(to_top,white,transparent)] sm:h-[400px]" />

        {/* Hero Content */}
        <div className="absolute inset-x-0 bottom-6 z-10 flex w-full flex-col items-center justify-center px-2 sm:bottom-16">
          <AnimatePresence mode="wait">
            <motion.h1
              key={`title-${currentSlide.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.8,
                delay: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="font-satoshi mb-3 max-w-4xl text-center text-2xl font-medium leading-tight sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl"
            >
              {currentSlide.title}
            </motion.h1>
          </AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <InputBox />
          </motion.div>
        </div>

        {/* Navigation Arrows */}
        <motion.button
          onClick={() => {
            const prevIndex =
              currentSlideIndex === 0 ? heroSlides.length - 1 : currentSlideIndex - 1;
            setCurrentSlideIndex(prevIndex);
            setCurrentSlide(heroSlides[prevIndex]);
          }}
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-2 opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-white/30 hover:opacity-100 group-hover:opacity-100"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </motion.button>

        <motion.button
          onClick={() => {
            const nextIndex = (currentSlideIndex + 1) % heroSlides.length;
            setCurrentSlideIndex(nextIndex);
            setCurrentSlide(heroSlides[nextIndex]);
          }}
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-2 opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-white/30 hover:opacity-100 group-hover:opacity-100"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>

        {/* Slide Indicators with Progress */}
        <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 space-x-2 sm:bottom-4">
          {heroSlides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setCurrentSlideIndex(index);
                setCurrentSlide(heroSlides[index]);
              }}
              className="group relative"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <div
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  index === currentSlideIndex
                    ? "w-6 bg-white/80"
                    : "bg-white/40 group-hover:bg-white/60"
                }`}
              />
              {index === currentSlideIndex && !isPaused && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-white/60"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 5, ease: "linear" }}
                  style={{ transformOrigin: "left" }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Background Gradient - Fixed Position with Animated Colors */}
      <div className="absolute -top-32 left-1/2 z-[-1] -translate-x-1/2">
        <AnimatePresence mode="wait">
          <motion.div
            key={`gradient-${currentSlide.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.5,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <GradientComponent colors={currentSlide.gradient} sizeVW={130} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Cards Section */}
      <div className="relative w-full">
        <GlassPaneBG paneWidth={50}>
          <div className="flex flex-col items-center">
            <h2 className="mb-6 mt-4 max-w-4xl text-center text-2xl leading-tight text-accent sm:mb-8 sm:mt-6 sm:text-3xl md:text-4xl lg:text-5xl">
              Generate anything in any style and with any models
            </h2>

            {/* Card Scrolls */}
            <div className="w-full">
              <div className="overflow-hidden">
                <CardScroll cardData={cardData1} />
              </div>
              <div className="overflow-hidden">
                <CardScroll cardData={cardData2} />
              </div>
            </div>
          </div>
        </GlassPaneBG>
      </div>
    </div>
  );
};

export default Hero;
