"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import Lenis from "lenis";

// Expose Lenis globally so the navbar can scroll past pinned sections
declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  try {
    CustomEase.create("customEase", "M0,0 C0.86,0 0.07,1 1,1");
  } catch (e) {
    console.warn("CustomEase not available, falling back to defaults", e);
  }
}

// Data
const artists = [
  "VFX Artist",
  "Background Artist",
  "Fashion Designer",
  "AI Director",
  "Ads Creators",
  "Brand Strategist",
];

const featuredContent = [
  "Visual Effects",
  "Background Art",
  "Fashion",
  "AI Influencers",
  "Creative Ads",
  "Branding",
];

const categories = [
  "Visual Effects",
  "Background",
  "Fashion",
  "AI Influencers",
  "Creative Ads",
  "Branding",
];

const backgroundImages = [
  "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/new/generated-image-1771401163633.mp4",
  "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/new/generated-image-1767466858708.png",
  "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/new/replicate-prediction-7w76cff0rhrmy0cwdyctjm1s10.mp4",
  "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/new/tmpyqx17hg9.mp4",
  "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/new/tmpq68prbc3.mp4",
  "https://i.pinimg.com/1200x/93/c1/f8/93c1f844633903c99b48e129daae30d2.jpg",
];

// Sound Manager Class
class SoundManager {
  sounds: { [key: string]: HTMLAudioElement } = {};
  isEnabled = false;

  constructor() {
    this.init();
  }

  init() {
    if (typeof window === "undefined") return;
    this.loadSound("hover", "https://assets.codepen.io/7558/click-reverb-001.mp3");
    this.loadSound("click", "https://assets.codepen.io/7558/shutter-fx-001.mp3");
    this.loadSound("textChange", "https://assets.codepen.io/7558/whoosh-fx-001.mp3");
  }

  loadSound(name: string, url: string) {
    const audio = new Audio(url);
    audio.preload = "auto";
    if (name === "hover") {
      audio.volume = 0.15;
    } else {
      audio.volume = 0.3;
    }
    this.sounds[name] = audio;
  }

  enableAudio() {
    if (!this.isEnabled) {
      this.isEnabled = true;
      console.log("Audio enabled");
    }
  }

  play(soundName: string, delay = 0) {
    if (this.isEnabled && this.sounds[soundName]) {
      if (delay > 0) {
        setTimeout(() => {
          this.sounds[soundName].currentTime = 0;
          this.sounds[soundName].play().catch((e) => console.log("Audio play failed:", e));
        }, delay);
      } else {
        this.sounds[soundName].currentTime = 0;
        this.sounds[soundName].play().catch((e) => console.log("Audio play failed:", e));
      }
    }
  }

  addSound(name: string, url: string, volume = 0.3) {
    this.loadSound(name, url);
    if (this.sounds[name]) {
      this.sounds[name].volume = volume;
    }
  }
}

const soundManager = new SoundManager();

export default function CreativeProcess() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const fixedSectionRef = useRef<HTMLDivElement>(null);
  const fixedContainerRef = useRef<HTMLDivElement>(null);
  const bgRefs = useRef<(HTMLImageElement | HTMLVideoElement | null)[]>([]);
  const artistRefs = useRef<(HTMLDivElement | null)[]>([]);
  const categoryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const featuredRefs = useRef<(HTMLDivElement | null)[]>([]);
  const featuredTextRefs = useRef<HTMLSpanElement[][]>([]); // 2D array for words
  const lenisRef = useRef<Lenis | null>(null);

  // State for animation control
  const animationState = useRef({
    isAnimating: false,
    isSnapping: false,
    lastProgress: 0,
    scrollDirection: 0,
    currentSection: 0, // Keep a ref track for event callbacks
  });

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });
    lenisRef.current = lenis;
    window.__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const ticker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    // Initial load animation logic
    let counter = 0;
    const interval = setInterval(() => {
      counter += Math.random() * 3 + 1;
      if (counter >= 100) {
        counter = 100;
        clearInterval(interval);
        // Animations handled in useEffect below
      }
      setLoadingProgress(counter);
    }, 30);

    return () => {
      gsap.ticker.remove(ticker);
      lenis.destroy();
      window.__lenis = undefined;
      clearInterval(interval);
    };
  }, []);

  // Loading Animation Complete
  useEffect(() => {
    if (loadingProgress >= 100) {
      // Run exit animation
      const tl = gsap.timeline();

      tl.to(".loading-counter-el", {
        opacity: 0,
        y: -20,
        duration: 0.6,
        ease: "power2.inOut",
      }).to(".loading-overlay", {
        y: "-100%",
        duration: 1.2,
        ease: "power3.inOut",
        delay: 0.3,
        onComplete: () => {
          // Animate columns
          artistRefs.current.forEach((el, index) => {
            if (el) setTimeout(() => el.classList.add("loaded"), index * 60);
          });
          categoryRefs.current.forEach((el, index) => {
            if (el) setTimeout(() => el.classList.add("loaded"), index * 60 + 200);
          });
          // Set loaded state after animations to persist classes
          setTimeout(() => setIsLoaded(true), 1000);
        },
      });
    }
  }, [loadingProgress]);

  // Main Scroll Logic
  useEffect(() => {
    if (!fixedSectionRef.current || !fixedContainerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set(fixedContainerRef.current, { height: "100vh" });

      // Refresh ScrollTrigger after a slight delay to ensure layout is settled
      setTimeout(() => ScrollTrigger.refresh(), 100);

      // Pinning
      ScrollTrigger.create({
        trigger: fixedSectionRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: fixedContainerRef.current,
        pinSpacing: true,
        onUpdate: (self) => {
          if (animationState.current.isSnapping) return;

          const progress = self.progress;
          const progressDelta = progress - animationState.current.lastProgress;

          if (Math.abs(progressDelta) > 0.001) {
            animationState.current.scrollDirection = progressDelta > 0 ? 1 : -1;
          }

          const targetSection = Math.min(5, Math.floor(progress * 6));

          if (
            targetSection !== animationState.current.currentSection &&
            !animationState.current.isAnimating
          ) {
            const nextSection =
              animationState.current.currentSection +
              (targetSection > animationState.current.currentSection ? 1 : -1);
            snapToSection(nextSection);
          }

          animationState.current.lastProgress = progress;

          // Update progress fill
          const sectionProgress = animationState.current.currentSection / 5;
          gsap.to(".progress-fill", { width: `${sectionProgress * 100}%`, duration: 0.1 });
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const snapToSection = (targetSection: number) => {
    if (
      targetSection < 0 ||
      targetSection > 5 ||
      targetSection === animationState.current.currentSection ||
      animationState.current.isAnimating
    )
      return;

    animationState.current.isSnapping = true;
    changeSection(targetSection);

    // Calculate absolute position on page
    const element = fixedSectionRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const fixedSectionTop = rect.top + scrollTop;

    // NOTE: This assumes pinned duration matches height.
    // ScrollTrigger's 'end' is 'bottom bottom' of an 1100vh element, so duration is 1000vh (since 100vh is visible).
    // Actually, fixedSectionHeight includes the viewable area.
    // We want to scroll to: Start + (TotalHeight * (Target / 10))
    // But wait, the section is 1100vh. Each section is 1/10th? No, 10 sections means 1100vh / 10 = 110vh per section?
    // Let's use the element's height as the track.
    const fixedSectionHeight = element.offsetHeight;
    const targetPosition = fixedSectionTop + (fixedSectionHeight * targetSection) / 6;

    lenisRef.current?.scrollTo(targetPosition, {
      duration: 0.6,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      lock: true,
      onComplete: () => {
        animationState.current.isSnapping = false;
      },
    });
  };

  const changeSection = (newSection: number) => {
    if (newSection === animationState.current.currentSection || animationState.current.isAnimating)
      return;

    animationState.current.isAnimating = true;
    const isScrollingDown = newSection > animationState.current.currentSection;
    const previousSection = animationState.current.currentSection;
    animationState.current.currentSection = newSection;
    setCurrentSection(newSection);

    // Play sound
    soundManager.play("textChange", 250);

    const duration = 0.64;
    const parallaxAmount = 5;

    // Logic for featured content (center words)
    // Exit previous
    const prevWords = featuredTextRefs.current[previousSection];
    if (prevWords) {
      gsap.to(prevWords, {
        yPercent: isScrollingDown ? -100 : 100,
        opacity: 0,
        duration: duration * 0.6,
        stagger: isScrollingDown ? 0.03 : -0.03,
        ease: "customEase",
        onComplete: () => {
          if (featuredRefs.current[previousSection]) {
            featuredRefs.current[previousSection]!.classList.remove("active");
            gsap.set(featuredRefs.current[previousSection], { visibility: "hidden" });
          }
        },
      });
    }

    // Enter new
    const nextWords = featuredTextRefs.current[newSection];
    if (nextWords && featuredRefs.current[newSection]) {
      featuredRefs.current[newSection]!.classList.add("active");
      gsap.set(featuredRefs.current[newSection], { visibility: "visible", opacity: 1 });
      gsap.set(nextWords, {
        yPercent: isScrollingDown ? 100 : -100,
        opacity: 0,
      });
      gsap.to(nextWords, {
        yPercent: 0,
        opacity: 1,
        duration: duration,
        stagger: isScrollingDown ? 0.05 : -0.05,
        ease: "customEase",
      });
    }

    // Update Backgrounds
    bgRefs.current.forEach((bg, i) => {
      if (!bg) return;
      bg.classList.remove("previous", "active");

      if (i === newSection) {
        if (isScrollingDown) {
          gsap.set(bg, { opacity: 1, y: 0, clipPath: "inset(100% 0 0 0)" });
          gsap.to(bg, { clipPath: "inset(0% 0 0 0)", duration: duration, ease: "customEase" });
        } else {
          gsap.set(bg, { opacity: 1, y: 0, clipPath: "inset(0 0 100% 0)" });
          gsap.to(bg, { clipPath: "inset(0 0 0% 0)", duration: duration, ease: "customEase" });
        }
        bg.classList.add("active");
      } else if (i === previousSection) {
        bg.classList.add("previous");
        gsap.to(bg, {
          y: isScrollingDown ? `${parallaxAmount}%` : `-${parallaxAmount}%`,
          duration: duration,
          ease: "customEase",
        });
        gsap.to(bg, {
          opacity: 0,
          delay: duration * 0.5,
          duration: duration * 0.5,
          ease: "customEase",
          onComplete: () => {
            bg.classList.remove("previous");
            gsap.set(bg, { y: 0 });
            animationState.current.isAnimating = false;
          },
        });
      } else {
        gsap.to(bg, { opacity: 0, duration: duration * 0.3, ease: "customEase" });
      }
    });

    // Update Side Columns
    artistRefs.current.forEach((artist, i) => {
      if (!artist) return;
      if (i === newSection) {
        artist.classList.add("active");
        gsap.to(artist, { opacity: 1, duration: 0.3, ease: "power2.out" });
      } else {
        artist.classList.remove("active");
        gsap.to(artist, { opacity: 0.3, duration: 0.3, ease: "power2.out" });
      }
    });
    categoryRefs.current.forEach((category, i) => {
      if (!category) return;
      if (i === newSection) {
        category.classList.add("active");
        gsap.to(category, { opacity: 1, duration: 0.3, ease: "power2.out" });
      } else {
        category.classList.remove("active");
        gsap.to(category, { opacity: 0.3, duration: 0.3, ease: "power2.out" });
      }
    });
  };

  const handleNavClick = (index: number) => {
    soundManager.enableAudio();
    soundManager.play("click");
    setIsAudioEnabled(true);
    snapToSection(index);
  };

  const toggleSound = () => {
    if (!isAudioEnabled) {
      soundManager.enableAudio();
      setIsAudioEnabled(true);
    } else {
      // Technically soundManager doesn't have a 'disable' method in provided code, but we can track state
      // For now, assume it just toggles the visual state as requested
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const enableAudioInteraction = () => {
    soundManager.enableAudio();
    setIsAudioEnabled(true);
  };

  return (
    <div
      ref={containerRef}
      className="bg-white font-['PP_Neue_Montreal',sans-serif] text-black"
      onClick={() => !isAudioEnabled && enableAudioInteraction()}
    >
      <style jsx global>{`
        @import url("https://fonts.cdnfonts.com/css/pp-neue-montreal");

        html.lenis,
        html.lenis body {
          height: auto;
        }
        .lenis.lenis-smooth {
          scroll-behavior: auto !important;
        }
        .lenis.lenis-smooth [data-lenis-prevent] {
          overscroll-behavior: contain;
        }
        .lenis.lenis-stopped {
          overflow: hidden;
        }
        .lenis.lenis-scrolling iframe {
          pointer-events: none;
        }

        .word-mask {
          display: inline-block;
          overflow: hidden;
          vertical-align: middle;
        }
        .split-word {
          display: inline-block;
          vertical-align: middle;
        }
        .artist.loaded,
        .category.loaded {
          opacity: 0.3;
          transform: translateY(0);
        }
        .artist.active::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 4px;
          background-color: rgba(245, 245, 245, 0.9);
          border-radius: 50%;
        }
        .artist.active {
          transform: translateX(10px) !important;
          opacity: 1 !important;
        }
        .category.active {
          transform: translateX(-10px) !important;
          opacity: 1 !important;
        }
        .category.active::after {
          content: "";
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 4px;
          background-color: rgba(245, 245, 245, 0.9);
          border-radius: 50%;
        }
      `}</style>

      {/* Loading Overlay */}
      <div
        className="loading-overlay fixed left-0 top-0 z-[9999] flex h-full w-full items-center justify-center bg-black text-2xl uppercase tracking-tighter text-white"
        style={{ display: loadingProgress >= 100 && animationState.current ? "flex" : "flex" }} // Keep flex, GSAP hides it
      >
        <div className="loading-counter-el flex items-center">
          Loading
          <span className="ml-2" id="loading-counter">
            [{loadingProgress.toFixed(0).padStart(2, "0")}]
          </span>
        </div>
      </div>

      {/* Sound Toggle */}
      <div
        className={`sound-toggle fixed right-5 top-5 z-[1000] flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/15 ${!isAudioEnabled ? "disabled opacity-50" : ""}`}
        onClick={toggleSound}
      >
        <div className="sound-dots relative h-1 w-1">
          <div
            className={`sound-dot absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white ${isAudioEnabled ? "animate-[expandDot_2s_ease-out_infinite]" : ""}`}
          ></div>
          <div
            className={`sound-dot absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white ${isAudioEnabled ? "animate-[expandDot_2s_ease-out_infinite_0.5s]" : ""}`}
          ></div>
          <div
            className={`sound-dot absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white ${isAudioEnabled ? "animate-[expandDot_2s_ease-out_infinite_1s]" : ""}`}
          ></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes expandDot {
          0% {
            width: 4px;
            height: 4px;
            opacity: 1;
          }
          100% {
            width: 20px;
            height: 20px;
            opacity: 0;
          }
        }
      `}</style>

      {/* Scroll Container */}
      <div className="scroll-container relative bg-white">
        <div ref={fixedSectionRef} className="fixed-section relative h-[550vh] bg-white">
          <div
            ref={fixedContainerRef}
            className="fixed-container sticky left-0 top-0 h-screen w-full origin-top overflow-hidden bg-white will-change-transform"
          >
            {/* Backgrounds */}
            <div className="background-container absolute left-0 top-0 z-[1] h-full w-full overflow-hidden bg-black">
              {backgroundImages.map((src, i) => {
                const isVideo =
                  src.endsWith(".mp4") || src.endsWith(".webm") || src.endsWith(".mov");
                return isVideo ? (
                  <video
                    key={i}
                    ref={(el) => {
                      bgRefs.current[i] = el;
                    }}
                    src={src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={`background-image absolute left-0 h-[100%] w-full origin-center object-cover opacity-0 brightness-[0.8] will-change-transform ${i === 0 ? "active z-[2] opacity-100" : ""}`}
                  />
                ) : (
                  <img
                    key={i}
                    ref={(el) => {
                      bgRefs.current[i] = el;
                    }}
                    src={src}
                    alt={`Background ${i}`}
                    className={`background-image absolute left-0 h-[100%] w-full origin-center object-cover opacity-0 brightness-[0.8] will-change-transform ${i === 0 ? "active z-[2] opacity-100" : ""}`}
                  />
                );
              })}
            </div>

            {/* Grid Content */}
            <div className="grid-container relative z-[2] grid h-full grid-cols-12 gap-4 px-8">
              {/* Header */}
              <div className="header header-content blur-target col-span-12 self-start pt-[5vh] text-center text-[10vw] leading-[0.8] text-[#f5f5f5]/90 will-change-transform">
                <div className="header-row block">The Creative</div>
                <div className="header-row block">Process</div>
              </div>

              {/* Content */}
              <div className="content main-content blur-target absolute left-0 top-1/2 col-span-12 flex w-full -translate-y-1/2 items-center justify-between px-8 will-change-transform max-md:flex-col max-md:gap-[5vh]">
                {/* Left Column - Artists */}
                <div className="left-column flex w-2/5 flex-col gap-1 text-left transition-all duration-500 will-change-[filter,opacity] max-md:w-full">
                  {artists.map((item, i) => (
                    <div
                      key={i}
                      ref={(el) => {
                        artistRefs.current[i] = el;
                      }}
                      className={`artist ease-[cubic-bezier(0.16,1,0.3,1)] relative translate-y-5 cursor-pointer pl-0 text-[#f5f5f5]/90 opacity-0 transition-all duration-500 hover:!opacity-100 ${isLoaded ? "loaded" : ""} ${i === currentSection ? "active translate-x-[10px] pl-[15px] opacity-100" : ""}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(i);
                      }}
                      onMouseEnter={() => soundManager.play("hover")}
                    >
                      {item}
                    </div>
                  ))}
                </div>

                {/* Featured (Center) */}
                <div className="featured relative flex h-[10vh] w-1/5 items-center justify-center overflow-hidden text-center text-[2.5vw] transition-all duration-500 max-md:order-[-1] max-md:mb-[2vh] max-md:w-full max-md:text-[5vw]">
                  {featuredContent.map((text, i) => (
                    <div
                      key={i}
                      ref={(el) => {
                        featuredRefs.current[i] = el;
                      }}
                      className={`featured-content invisible absolute left-0 top-0 flex h-full w-full items-center justify-center opacity-0 ${i === 0 ? "active !visible opacity-100" : ""}`}
                    >
                      <h3 className="absolute left-1/2 top-1/2 m-0 w-full -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-medium text-[#f5f5f5]/90">
                        {/* Split Text Implementation */}
                        {text.split(" ").map((word, wIndex) => (
                          <div
                            key={wIndex}
                            className="word-mask inline-block overflow-hidden align-middle"
                          >
                            <span
                              ref={(el) => {
                                if (!featuredTextRefs.current[i]) featuredTextRefs.current[i] = [];
                                if (el) featuredTextRefs.current[i][wIndex] = el;
                              }}
                              className="split-word inline-block align-middle"
                            >
                              {word}&nbsp;
                            </span>
                          </div>
                        ))}
                      </h3>
                    </div>
                  ))}
                </div>

                {/* Right Column - Categories */}
                <div className="right-column flex w-2/5 flex-col gap-1 text-right transition-all duration-500 will-change-[filter,opacity] max-md:w-full">
                  {categories.map((item, i) => (
                    <div
                      key={i}
                      ref={(el) => {
                        categoryRefs.current[i] = el;
                      }}
                      className={`category ease-[cubic-bezier(0.16,1,0.3,1)] relative translate-y-5 cursor-pointer pr-0 text-[#f5f5f5]/90 opacity-0 transition-all duration-500 hover:!opacity-100 ${isLoaded ? "loaded" : ""} ${i === currentSection ? "active -translate-x-[10px] pr-[15px] opacity-100" : ""}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(i);
                      }}
                      onMouseEnter={() => soundManager.play("hover")}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="footer footer-content blur-target col-span-12 self-end pb-[5vh] text-center text-[5vw] leading-[0.8] text-[#f5f5f5]/90 transition-all duration-500 will-change-transform">
                <div className="header-row block">Beyond Thinking</div>
                {/* <div className="header-row block">Thinking</div> */}
                <div className="progress-indicator relative mx-auto mt-[2vh] h-px w-[160px] bg-[#f5f5f5]/30 max-md:w-[120px]">
                  <div className="progress-numbers absolute left-0 right-0 top-0 -mx-[25px] flex -translate-y-1/2 justify-between text-[0.7rem] text-[#f5f5f5]">
                    <span>{(currentSection + 1).toString().padStart(2, "0")}</span>
                    <span>06</span>
                  </div>
                  <div className="progress-fill ease-[cubic-bezier(0.65,0,0.35,1)] absolute left-0 top-0 h-full w-0 bg-[#f5f5f5] transition-[width] duration-300"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
