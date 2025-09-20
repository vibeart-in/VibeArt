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
    topImageUrl: "/images/landing/cards/prop_game_top.png",
    bottomImageUrl: "/images/landing/cards/prop_game_bottom.png",
    cardText: "Gaming",
    topImageScale: 1.2,
  },
  {
    topImageUrl: "/images/landing/cards/figurine_trans2.png",
    bottomImageUrl: "/images/landing/cards/figurine.jpg",
    cardText: "Editing",
    topImageScale: 1.1,
  },
  {
    topImageUrl: "/images/landing/cards/site-dsgin.jpg",
    bottomImageUrl: "/images/landing/cards/site-desgin.jpg",
    cardText: "Web desgin",
    topImageScale: 1.1,
  },
  {
    topImageUrl: "/images/landing/cards/90s-top.png",
    bottomImageUrl: "/images/landing/cards/90s-bottom.jpg",
    cardText: "90s",
    topImageScale: 1.2,
  },
  {
    topImageUrl: "/images/landing/cards/game-top.png",
    bottomImageUrl: "/images/landing/cards/game-bottom.jpg",
    cardText: "Game",
    topImageScale: 1.1,
  },
  {
    topImageUrl: "/images/landing/cards/concept-top.png",
    bottomImageUrl: "/images/landing/cards/concept-bottom.jpg",
    cardText: "concept",
    topImageScale: 1.2,
  },
  {
    topImageUrl: "/images/landing/cards/emotion-top.png",
    bottomImageUrl: "/images/landing/cards/emotion-bottom.jpg",
    cardText: "concept",
    topImageScale: 1.1,
  },
  {
    topImageUrl: "/images/landing/cards/product-top.png",
    bottomImageUrl: "/images/landing/cards/product-bottom.jpg",
    cardText: "Product",
    topImageScale: 1.05,
  },
  {
    topImageUrl: "/images/landing/cards/phone-to.png",
    bottomImageUrl: "/images/landing/cards/phone-bottom.png",
    cardText: "Ultra real",
    topImageScale: 1.1
  },
  {
    topImageUrl: "/images/landing/cards/keys-trans.png",
    bottomImageUrl: "/images/landing/cards/keys.jpg",
    cardText: "Abstract",
    topImageScale: 1.4,
  },
  {
    topImageUrl: "/images/landing/cards/anime_girl_top.png",
    bottomImageUrl: "/images/landing/cards/anime_girl_bottom.png",
    cardText: "Anime",
    topImageScale: 1.1,
  },
  {
    topImageUrl: "/images/landing/cards/goth_girl_top.png",
    bottomImageUrl: "/images/landing/cards/goth_girl_bottom.png",
    cardText: "Gothic",
    topImageScale: 1.2,
  },
  {
    topImageUrl: "/images/landing/cards/goth_girl2_top.png",
    bottomImageUrl: "/images/landing/cards/goth_girl2_bottom.png",
    cardText: "Dark",
    topImageScale: 1.1,
  },
  {
    topImageUrl: "/images/landing/cards/jap_girl_top.png",
    bottomImageUrl: "/images/landing/cards/jap_girl_bottom.png",
    cardText: "Kawaii",
    topImageScale: 1.2,
  },
];

const cardData2: ImageCard3DType[] = [
  {
    topImageUrl: "/images/landing/cards/guy_top.png",
    bottomImageUrl: "/images/landing/cards/guy_bottom.png",
    cardText: "Guy",
    topImageScale: 1.1,
    width: 400,
    height: 600,
    fontSize: 1000
  },
  {
    topImageUrl: "/images/landing/cards/mirror_girl_top.png",
    bottomImageUrl: "/images/landing/cards/mirror_girl_bottom.png",
    cardText: "Instagram",
    topImageScale: 1.2,
    width: 400,
    height: 600,
  },
  {
    topImageUrl: "/images/landing/cards/prop_top.png",
    bottomImageUrl: "/images/landing/cards/prop_bottom.png",
    cardText: "Dark",
    topImageScale: 1.3,
    width: 400,
    height: 600,
  },
  {
    topImageUrl: "/images/landing/cards/jap_girl_top.png",
    bottomImageUrl: "/images/landing/cards/jap_girl_bottom.png",
    cardText: "Kawaii",
    topImageScale: 1.2,
    width: 400,
    height: 600,
  },
  {
    topImageUrl: "/images/landing/cards/prop_top.png",
    bottomImageUrl: "/images/landing/cards/prop_bottom.png",
    cardText: "Dark",
    topImageScale: 1.3,
    width: 400,
    height: 600,
  },
  {
    topImageUrl: "/images/landing/cards/jap_girl_top.png",
    bottomImageUrl: "/images/landing/cards/jap_girl_bottom.png",
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
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Hero Section */}
      <div className="group relative -mt-10 h-[90vh] sm:h-[105vh] min-h-[500px]">
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
        <div className="z-10 absolute inset-x-0 bottom-0 h-[200px] sm:h-[400px] bg-black/5 [mask-image:linear-gradient(to_top,white,transparent)] backdrop-blur-md" />

        {/* Hero Content */}
        <div className="absolute inset-x-0 bottom-6 sm:bottom-16 z-10 w-full flex flex-col justify-center items-center px-2">
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
              className="font-gothic text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-center mb-3 sm:mb-6 max-w-4xl leading-tight"
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
              currentSlideIndex === 0
                ? heroSlides.length - 1
                : currentSlideIndex - 1;
            setCurrentSlideIndex(prevIndex);
            setCurrentSlide(heroSlides[prevIndex]);
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-300 opacity-0 hover:opacity-100 group-hover:opacity-100"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
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
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-300 opacity-0 hover:opacity-100 group-hover:opacity-100"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </motion.button>

        {/* Slide Indicators with Progress */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {heroSlides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setCurrentSlideIndex(index);
                setCurrentSlide(heroSlides[index]);
              }}
              className="relative group"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlideIndex
                    ? "bg-white/80 w-6"
                    : "bg-white/40 group-hover:bg-white/60"
                }`}
              />
              {index === currentSlideIndex && !isPaused && (
                <motion.div
                  className="absolute inset-0 bg-white/60 rounded-full"
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
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 z-[-1]">
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
          <div className="flex flex-col items-center ">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-accent text-center mt-4 sm:mt-6 mb-6 sm:mb-8 max-w-4xl leading-tight">
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
