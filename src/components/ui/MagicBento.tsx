import React, { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";

export interface BentoCardProps {
  color?: string;
  title?: string;
  description?: string;
  label?: string;
  textAutoHide?: boolean;
  disableAnimations?: boolean;
  coverImage?: string;
  coverVideo?: string;
  logo?: string;
  imageModel?: string;
  videoModel?: string;
  gridPosition?: {
    colStart: number;
    colEnd: number;
    rowStart: number;
    rowEnd: number;
  };
}

export interface BentoProps {
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  enableTilt?: boolean;
  glowColor?: string;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
  gridLayout?: {
    columns: number[];
    rows: number[];
  };
}

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = "217, 233, 43"; // Site accent color #d9e92b
const MOBILE_BREAKPOINT = 768;

const cardData: BentoCardProps[] = [
  {
    color: "#060010",
    title: "OpenAI",
    logo: "https://ai.ls/assets/openai-logos/PNGs/openai-white-lockup.png",
    imageModel: "DALL-E 3",
    videoModel: "Sora 2",
    label: "AI Lab",
    coverVideo:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/new/whale.mp4",

    gridPosition: { colStart: 1, colEnd: 3, rowStart: 1, rowEnd: 3 }, // top-left big square
  },
  {
    color: "#060010",
    title: "Google DeepMind",
    logo: "https://white.logodownload.org/wp-content/uploads/2020/11/google-white-logo-1.png",
    imageModel: "Imagen 3",
    videoModel: "Veo 3 & 3.1",
    label: "AI Lab",
    coverVideo:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/video/eyes-video.mp4",
    gridPosition: { colStart: 3, colEnd: 5, rowStart: 1, rowEnd: 2 }, // top-right long
  },
  {
    color: "#060010",
    title: "Midjourney",
    logo: "https://www.nomadai.ie/logos/Midjourney.png?dpl=dpl_5xqEonpmrh3cYgYBw3Azt8Tkqvoz",
    imageModel: "V7 & Niji 7",
    label: "Independent Lab",
    coverImage:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/new/968a88fb72d0b89786df5516ba8c6a45.jpg",
    gridPosition: { colStart: 3, colEnd: 4, rowStart: 2, rowEnd: 3 }, // small top-right
  },
  {
    color: "#060010",
    title: "Runway",
    logo: "https://salesforceventures.com/wp-content/uploads/2023/08/Runway_Logo.png?w=1024",
    videoModel: "Gen-4 & Gen-4.5",
    label: "AI Company",
    coverVideo:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/new/midjouney-video.mp4",
    gridPosition: { colStart: 4, colEnd: 5, rowStart: 2, rowEnd: 3 }, // small top-right
  },
  {
    color: "#060010",
    title: "Kuaishou Tech",
    logo: "https://i.namu.wiki/i/vfeQT3Qi_Uxuk3xz-65eZABtXQwmDeXbt4MmH4PQUnMcMtuww9p2D2qCdNR_wEw35n6z9EFpyDGoVJFagHf-_g.webp",
    videoModel: "Kling 2.5 & 2.6",
    label: "Tech Company",
    coverVideo:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/video/8bit-video.mp4",
    gridPosition: { colStart: 1, colEnd: 2, rowStart: 3, rowEnd: 4 }, // mid-left small
  },
  {
    color: "#060010",
    title: "Black Forest Labs",
    logo: "https://bfl.ai/brand/logotype-white.png",
    imageModel: "FLUX (Pro, Dev, Schnell)",
    label: "AI Lab",
    coverImage:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/new/3d033132eb9bc43b378d12e1a7f99a8c.jpg",
    gridPosition: { colStart: 2, colEnd: 4, rowStart: 3, rowEnd: 4 }, // mid-center wide
  },
  {
    color: "#060010",
    title: "Luma AI",
    logo: "https://year-ahead.campaignlive.co.uk/media/2026/06_Luma%20AI_Primary%20Lockup_White_Transparent%20%281%29.png",
    videoModel: "Dream Machine (Ray 3)",
    label: "AI Company",
    coverImage:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/new/gpt-image-1-5-showcase-v0-qqt5yma79t7g1.webp",

    gridPosition: { colStart: 4, colEnd: 5, rowStart: 3, rowEnd: 5 }, // tall right
  },
  {
    color: "#060010",
    title: "Alibaba Cloud",
    logo: "https://www.modelscope.ai/api/v1/models/Wan-AI/Wan2.1-I2V-14B-720P/repo?Revision=master&FilePath=assets%2Flogo.png&View=true",
    imageModel: "Qwen-VL",
    videoModel: "Wan 2.2 & 2.6",
    label: "Tech Company",
    coverImage:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/new/gpt-image-1-5-showcase-v0-8vbd0hd79t7g1.webp",
    gridPosition: { colStart: 1, colEnd: 3, rowStart: 4, rowEnd: 6 }, // lower-left large
  },
  {
    color: "#060010",
    title: "Pika Labs",
    logo: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/pika-text.webp",
    videoModel: "Pika 2.2 & 2.5",
    label: "AI Company",
    coverVideo:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/new/video2.mp4",
    gridPosition: { colStart: 3, colEnd: 4, rowStart: 4, rowEnd: 5 }, // center-right small
  },
  {
    color: "#060010",
    title: "Stability AI",
    logo: "https://www.promptloop.com/_next/image?url=https%3A%2F%2Fcdn.promptloop.com%2F6b21e981-3003-42a2-a44b-d07b662ded75.png&w=3840&q=75",
    imageModel: "Stable Diff. 3.5",
    videoModel: "SVD-XT",
    label: "AI Company",
    coverVideo:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/new/tmps_crapr2.mp4",
    gridPosition: { colStart: 3, colEnd: 5, rowStart: 5, rowEnd: 6 }, // bottom right wide
  },
  {
    color: "#060010",
    title: "Recraft",
    logo: "https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-png/dark/recraft-text.png",
    imageModel: "Recraft (Project Red Panda)",
    label: "AI Lab",
    coverImage:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/new/3d033132eb9bc43b378d12e1a7f99a8c.jpg",
    gridPosition: { colStart: 1, colEnd: 3, rowStart: 6, rowEnd: 7 }, // lower-left wide on new row
  },
  {
    color: "#060010",
    title: "MiniMax & Lightricks",
    logo: "https://www.segmind.com/partners/minimax.png",
    videoModel: "Hailuo AI & LTX-2",
    label: "AI Companies",
    coverVideo:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/video/eyes-video.mp4",
    gridPosition: { colStart: 3, colEnd: 5, rowStart: 6, rowEnd: 7 }, // bottom right wide on new row
  },
];

const createParticleElement = (
  x: number,
  y: number,
  color: string = DEFAULT_GLOW_COLOR,
): HTMLDivElement => {
  const el = document.createElement("div");
  el.className = "particle";
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const calculateSpotlightValues = (radius: number) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75,
});

const updateCardGlowProperties = (
  card: HTMLElement,
  mouseX: number,
  mouseY: number,
  glow: number,
  radius: number,
) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty("--glow-x", `${relativeX}%`);
  card.style.setProperty("--glow-y", `${relativeY}%`);
  card.style.setProperty("--glow-intensity", glow.toString());
  card.style.setProperty("--glow-radius", `${radius}px`);
};

const ParticleCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  disableAnimations?: boolean;
  style?: React.CSSProperties;
  particleCount?: number;
  glowColor?: string;
  enableTilt?: boolean;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}> = ({
  children,
  className = "",
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = false,
  enableMagnetism = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef<HTMLDivElement[]>([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;

    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor),
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        },
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;

    if (!particlesInitialized.current) {
      initializeParticles();
    }

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const clone = particle.cloneNode(true) as HTMLDivElement;
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(
          clone,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" },
        );

        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: "none",
          repeat: -1,
          yoyo: true,
        });

        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
        });
      }, index * 100);

      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;

    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 5,
          rotateY: 5,
          duration: 0.3,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }

      if (enableMagnetism) {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!enableTilt && !enableMagnetism) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.05;
        const magnetY = (y - centerY) * 0.05;

        magnetismAnimationRef.current = gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!clickEffect) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height),
      );

      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;

      element.appendChild(ripple);

      gsap.fromTo(
        ripple,
        {
          scale: 0,
          opacity: 1,
        },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          onComplete: () => ripple.remove(),
        },
      );
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("click", handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("click", handleClick);
      clearAllParticles();
    };
  }, [
    animateParticles,
    clearAllParticles,
    disableAnimations,
    enableTilt,
    enableMagnetism,
    clickEffect,
    glowColor,
  ]);

  return (
    <div
      ref={cardRef}
      className={`${className} relative overflow-hidden`}
      style={{ ...style, position: "relative", overflow: "hidden" }}
    >
      {children}
    </div>
  );
};

const GlobalSpotlight: React.FC<{
  gridRef: React.RefObject<HTMLDivElement | null>;
  disableAnimations?: boolean;
  enabled?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
}> = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR,
}) => {
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const isInsideSection = useRef(false);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return;

    const spotlight = document.createElement("div");
    spotlight.className = "global-spotlight";
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = (e: MouseEvent) => {
      if (!spotlightRef.current || !gridRef.current) return;

      const section = gridRef.current.closest(".bento-section");
      const rect = section?.getBoundingClientRect();
      const mouseInside =
        rect &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      isInsideSection.current = mouseInside || false;
      const cards = gridRef.current.querySelectorAll(".card");

      if (!mouseInside) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        });
        cards.forEach((card) => {
          (card as HTMLElement).style.setProperty("--glow-intensity", "0");
        });
        return;
      }

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach((card) => {
        const cardElement = card as HTMLElement;
        const cardRect = cardElement.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(e.clientX - centerX, e.clientY - centerY) -
          Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);

        minDistance = Math.min(minDistance, effectiveDistance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }

        updateCardGlowProperties(cardElement, e.clientX, e.clientY, glowIntensity, spotlightRadius);
      });

      gsap.to(spotlightRef.current, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.1,
        ease: "power2.out",
      });

      const targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
            : 0;

      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.5,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      isInsideSection.current = false;
      gridRef.current?.querySelectorAll(".card").forEach((card) => {
        (card as HTMLElement).style.setProperty("--glow-intensity", "0");
      });
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
};

const BentoCardGrid: React.FC<{
  children: React.ReactNode;
  gridRef?: React.RefObject<HTMLDivElement | null>;
}> = ({ children, gridRef }) => (
  <div
    className="bento-section relative grid max-w-[100vw] select-none gap-2 p-3"
    style={{ fontSize: "clamp(1rem, 0.9rem + 0.5vw, 1.5rem)" }}
    ref={gridRef}
  >
    {children}
  </div>
);

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

const MagicBento: React.FC<BentoProps> = ({
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = false,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true,
  gridLayout,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileDetection();
  const shouldDisableAnimations = disableAnimations || isMobile;

  // Apply grid layout to cards if provided
  const cardsWithLayout = React.useMemo(() => {
    if (!gridLayout) return cardData;

    return cardData.map((card, index) => {
      if (index >= gridLayout.columns.length || index >= gridLayout.rows.length) {
        return card;
      }

      const colStart = gridLayout.columns[index];
      const colEnd =
        index < gridLayout.columns.length - 1 ? gridLayout.columns[index + 1] : colStart + 1;
      const rowStart = gridLayout.rows[index];
      const rowEnd = index < gridLayout.rows.length - 1 ? gridLayout.rows[index + 1] : rowStart + 1;

      return {
        ...card,
        gridPosition: { colStart, colEnd, rowStart, rowEnd },
      };
    });
  }, [gridLayout]);

  return (
    <>
      <style>
        {`
          .bento-section {
            --glow-x: 50%;
            --glow-y: 50%;
            --glow-intensity: 0;
            --glow-radius: 200px;
            --glow-color: ${glowColor};
            --border-color: #3a3e2e;
            --background-dark: #060010;
            --white: hsl(0, 0%, 100%);
            --accent-primary: rgba(217, 233, 43, 1);
            --accent-glow: rgba(217, 233, 43, 0.2);
            --accent-border: rgba(217, 233, 43, 0.8);
          }
          
          // .card-responsive {
          //   grid-template-columns: 1fr;
          //   width: 90%;
          //   margin: 0 auto;
          //   padding: 0.5rem;
          // }
            .card-responsive {
  display: grid;
  grid-template-columns: 1fr;
  grid-auto-rows: 220px; /* 👈 controls square size */
  gap: 16px;             /* optional but recommended */
  width: 90%;
  margin: 0 auto;
  padding: 0.5rem;
}

          
          @media (min-width: 600px) {
            .card-responsive {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          
        @media (min-width: 1024px) {
  .card-responsive {
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: 260px; /* 👈 bigger squares on desktop */
  }
}

          .card--border-glow::after {
            content: '';
            position: absolute;
            inset: 0;
            padding: 6px;
            background: radial-gradient(var(--glow-radius) circle at var(--glow-x) var(--glow-y),
                rgba(${glowColor}, calc(var(--glow-intensity) * 0.8)) 0%,
                rgba(${glowColor}, calc(var(--glow-intensity) * 0.4)) 30%,
                transparent 60%);
            border-radius: inherit;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: exclude;
            pointer-events: none;
            opacity: 1;
            transition: opacity 0.3s ease;
            z-index: 1;
          }
          
          .card--border-glow:hover::after {
            opacity: 1;
          }
          
          .card--border-glow:hover {
            box-shadow: 0 4px 20px rgba(58, 62, 46, 0.4), 0 0 30px rgba(${glowColor}, 0.2);
          }
          
          .particle::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: rgba(${glowColor}, 0.2);
            border-radius: 50%;
            z-index: -1;
          }
          
          .particle-container:hover {
            box-shadow: 0 4px 20px rgba(58, 62, 46, 0.2), 0 0 30px rgba(${glowColor}, 0.2);
          }
          
          .text-clamp-1 {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            line-clamp: 1;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .text-clamp-2 {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          @media (max-width: 599px) {
            .card-responsive {
              grid-template-columns: 1fr;
              width: 90%;
              margin: 0 auto;
              padding: 0.5rem;
            }
            
            .card-responsive .card {
              width: 100%;
              min-height: 180px;
            }
          }
        `}
      </style>

      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisableAnimations}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}

      <BentoCardGrid gridRef={gridRef}>
        <div className="card-responsive grid gap-2">
          {cardsWithLayout.map((card, index) => {
            const baseClassName = `card flex flex-col justify-between relative min-h-[200px] w-full max-w-full p-5 rounded-[20px] border border-solid font-light overflow-hidden transition-colors duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] ${
              enableBorderGlow ? "card--border-glow" : ""
            }`;

            const cardStyle = {
              backgroundColor: card.color || "var(--background-dark)",
              borderColor: "var(--border-color)",
              color: "var(--white)",
              "--glow-x": "50%",
              "--glow-y": "50%",
              "--glow-intensity": "0",
              "--glow-radius": "200px",
              ...(card.gridPosition && window.innerWidth >= 1024
                ? {
                    gridColumn: `${card.gridPosition.colStart} / ${card.gridPosition.colEnd}`,
                    gridRow: `${card.gridPosition.rowStart} / ${card.gridPosition.rowEnd}`,
                  }
                : {}),
            } as React.CSSProperties;

            if (enableStars) {
              return (
                <ParticleCard
                  key={index}
                  className={baseClassName}
                  style={cardStyle}
                  disableAnimations={shouldDisableAnimations}
                  particleCount={particleCount}
                  glowColor={glowColor}
                  enableTilt={enableTilt}
                  clickEffect={clickEffect}
                  enableMagnetism={enableMagnetism}
                >
                  {/* Background Image/Video */}
                  {card.coverVideo ? (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 h-full w-full object-cover opacity-80"
                      style={{ zIndex: 0 }}
                    >
                      <source src={card.coverVideo} type="video/mp4" />
                    </video>
                  ) : card.coverImage ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-80"
                      style={{
                        backgroundImage: `url(${card.coverImage})`,
                        zIndex: 0,
                      }}
                    />
                  ) : null}

                  {/* Gradient Overlay */}
                  {/* <div
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                    style={{ zIndex: 1 }}
                  /> */}

                  <div
                    className="card__header relative flex items-center justify-start gap-2 text-white"
                    style={{ zIndex: 2 }}
                  >
                    {card.logo ? (
                      <img
                        src={card.logo}
                        alt={`${card.title} logo`}
                        className="h-10 w-10 rounded-sm object-contain"
                      />
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-90"
                      >
                        <path d="M12 2L2 7l10 5 10-5-10-5Z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                    )}
                    {/* <span className="card__title text-lg font-bold tracking-tight">
                      {card.title}
                    </span> */}
                  </div>
                  <div
                    className="card__content relative mt-auto flex flex-col justify-end pt-6 text-white"
                    style={{ zIndex: 2 }}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {card.imageModel && (
                        <div className="flex flex-col items-start gap-1">
                          <span className="whitespace-nowrap rounded border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider shadow-sm backdrop-blur-md">
                            Image
                          </span>
                          <span
                            className={`text-sm font-semibold leading-tight opacity-95 ${textAutoHide ? "text-clamp-2" : ""}`}
                          >
                            {card.imageModel}
                          </span>
                        </div>
                      )}
                      {card.videoModel && (
                        <div className="flex flex-col items-start gap-1">
                          <span className="whitespace-nowrap rounded border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider shadow-sm backdrop-blur-md">
                            Video
                          </span>
                          <span
                            className={`text-sm font-semibold leading-tight opacity-95 ${textAutoHide ? "text-clamp-2" : ""}`}
                          >
                            {card.videoModel}
                          </span>
                        </div>
                      )}
                    </div>
                    {card.description && (
                      <p
                        className={`card__description mt-3 text-xs leading-5 opacity-80 ${textAutoHide ? "text-clamp-2" : ""}`}
                      >
                        {card.description}
                      </p>
                    )}
                  </div>
                </ParticleCard>
              );
            }

            return (
              <div
                key={index}
                className={baseClassName}
                style={cardStyle}
                ref={(el) => {
                  if (!el) return;

                  const handleMouseMove = (e: MouseEvent) => {
                    if (shouldDisableAnimations) return;

                    const rect = el.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    if (enableTilt) {
                      const rotateX = ((y - centerY) / centerY) * -10;
                      const rotateY = ((x - centerX) / centerX) * 10;

                      gsap.to(el, {
                        rotateX,
                        rotateY,
                        duration: 0.1,
                        ease: "power2.out",
                        transformPerspective: 1000,
                      });
                    }

                    if (enableMagnetism) {
                      const magnetX = (x - centerX) * 0.05;
                      const magnetY = (y - centerY) * 0.05;

                      gsap.to(el, {
                        x: magnetX,
                        y: magnetY,
                        duration: 0.3,
                        ease: "power2.out",
                      });
                    }
                  };

                  const handleMouseLeave = () => {
                    if (shouldDisableAnimations) return;

                    if (enableTilt) {
                      gsap.to(el, {
                        rotateX: 0,
                        rotateY: 0,
                        duration: 0.3,
                        ease: "power2.out",
                      });
                    }

                    if (enableMagnetism) {
                      gsap.to(el, {
                        x: 0,
                        y: 0,
                        duration: 0.3,
                        ease: "power2.out",
                      });
                    }
                  };

                  const handleClick = (e: MouseEvent) => {
                    if (!clickEffect || shouldDisableAnimations) return;

                    const rect = el.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    const maxDistance = Math.max(
                      Math.hypot(x, y),
                      Math.hypot(x - rect.width, y),
                      Math.hypot(x, y - rect.height),
                      Math.hypot(x - rect.width, y - rect.height),
                    );

                    const ripple = document.createElement("div");
                    ripple.style.cssText = `
                      position: absolute;
                      width: ${maxDistance * 2}px;
                      height: ${maxDistance * 2}px;
                      border-radius: 50%;
                      background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
                      left: ${x - maxDistance}px;
                      top: ${y - maxDistance}px;
                      pointer-events: none;
                      z-index: 1000;
                    `;

                    el.appendChild(ripple);

                    gsap.fromTo(
                      ripple,
                      {
                        scale: 0,
                        opacity: 1,
                      },
                      {
                        scale: 1,
                        opacity: 0,
                        duration: 0.8,
                        ease: "power2.out",
                        onComplete: () => ripple.remove(),
                      },
                    );
                  };

                  el.addEventListener("mousemove", handleMouseMove);
                  el.addEventListener("mouseleave", handleMouseLeave);
                  el.addEventListener("click", handleClick);
                }}
              >
                {/* Background Image/Video */}
                {card.coverVideo ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover opacity-80"
                    style={{ zIndex: 0 }}
                  >
                    <source src={card.coverVideo} type="video/mp4" />
                  </video>
                ) : card.coverImage ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-80"
                    style={{
                      backgroundImage: `url(${card.coverImage})`,
                      zIndex: 0,
                    }}
                  />
                ) : null}

                {/* Bottom Gradient Blur */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-40 backdrop-blur-lg"
                  style={{
                    zIndex: 1,
                    WebkitMaskImage:
                      "linear-gradient(to top, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
                    maskImage: "linear-gradient(to top, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
                  }}
                />

                <div
                  className="card__header relative flex items-center justify-start gap-2 text-white"
                  style={{ zIndex: 2 }}
                >
                  {card.logo ? (
                    <img
                      src={card.logo}
                      alt={`${card.title} logo`}
                      className="w-28 rounded-sm object-contain"
                    />
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-90"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5Z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  )}
                  {/* <span className="card__title text-lg font-bold tracking-tight">{card.title}</span> */}
                </div>
                <div
                  className="card__content relative mt-auto flex flex-col justify-end pt-6 text-white"
                  style={{ zIndex: 2 }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    {card.imageModel && (
                      <div className="flex flex-col items-start gap-1">
                        <span className="whitespace-nowrap rounded border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider shadow-sm backdrop-blur-md">
                          Image
                        </span>
                        <span
                          className={`text-sm font-semibold leading-tight opacity-95 ${textAutoHide ? "text-clamp-2" : ""}`}
                        >
                          {card.imageModel}
                        </span>
                      </div>
                    )}
                    {card.videoModel && (
                      <div className="flex flex-col items-start gap-1">
                        <span className="whitespace-nowrap rounded border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider shadow-sm backdrop-blur-md">
                          Video
                        </span>
                        <span
                          className={`text-sm font-semibold leading-tight opacity-95 ${textAutoHide ? "text-clamp-2" : ""}`}
                        >
                          {card.videoModel}
                        </span>
                      </div>
                    )}
                  </div>
                  {card.description && (
                    <p
                      className={`card__description mt-3 text-xs leading-5 opacity-80 ${textAutoHide ? "text-clamp-2" : ""}`}
                    >
                      {card.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </BentoCardGrid>
    </>
  );
};

export default MagicBento;
