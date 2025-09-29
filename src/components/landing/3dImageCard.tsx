"use client";

import React, { useRef, useCallback, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";

interface ImageCard3DProps {
  bottomImageUrl: string;
  topImageUrl: string;
  cardText: string;
  scrollVelocity?: ReturnType<typeof useMotionValue<number>>;
  rotateDepth?: number;
  parallaxDepth?: number;
  width?: number; // kept for compatibility, but CSS is preferred
  height?: number; // kept for compatibility, but CSS is preferred
  topImageScale?: number;
  fontSize?: number;
}

export const ImageCard3D = React.memo(function ImageCard3D({
  bottomImageUrl,
  topImageUrl,
  cardText,
  scrollVelocity,
  rotateDepth = 15,
  parallaxDepth = 25,
  width = 500,
  height = 700,
  topImageScale = 1.1,
  fontSize = 20,
}: ImageCard3DProps) {
  const prefersReducedMotion = useReducedMotion();

  // Motion values for pointer
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const ySpring = useSpring(y, { stiffness: 300, damping: 20 });

  // Pointer-driven tilt
  const mouseRotateX = useTransform(
    ySpring,
    [-0.5, 0.5],
    [rotateDepth, -rotateDepth]
  );
  const mouseRotateY = useTransform(
    xSpring,
    [-0.5, 0.5],
    [-rotateDepth, rotateDepth]
  );

  // Scroll-driven tilt (spring wrapped)
  const defaultScrollVelocity = useMotionValue(0);
  const scrollVel = useSpring(scrollVelocity ?? defaultScrollVelocity, {
    stiffness: 400,
    damping: 50,
  });
  const scrollRotateY = useTransform(scrollVel, [-50, 50], [-12, 12]);

  // Compose rotateY so only one rotateY is applied
  const combinedRotateY = useTransform(
    [mouseRotateY, scrollRotateY],
    (values: number[]) => values[0] + values[1]
  );

  // Parallax for top image and text
  const effParallax = prefersReducedMotion ? 0 : parallaxDepth;
  const topImageTranslateX = useTransform(
    xSpring,
    [-0.5, 0.5],
    [`-${effParallax}px`, `${effParallax}px`]
  );
  const topImageTranslateY = useTransform(
    ySpring,
    [-0.5, 0.5],
    [`-${effParallax}px`, `${effParallax}px`]
  );
  const textTranslateX = useTransform(
    xSpring,
    [-0.5, 0.5],
    [`-${effParallax * 1.5}px`, `${effParallax * 1.5}px`]
  );
  const textTranslateY = useTransform(
    ySpring,
    [-0.5, 0.5],
    [`-${effParallax * 1.5}px`, `${effParallax * 1.5}px`]
  );

  // Glare
  const glareX = useTransform(xSpring, [-0.7, 0.7], [0, 100]);
  const glareY = useTransform(ySpring, [-0.7, 0.7], [0, 100]);
  const glareBackground = useTransform(
    [glareX, glareY],
    ([gx, gy]) =>
      `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.2) 0%, transparent 30%)`
  );

  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!ref.current || prefersReducedMotion) return;
      const rect = ref.current.getBoundingClientRect();
      const xPct = (e.clientX - rect.left) / rect.width - 0.5;
      const yPct = (e.clientY - rect.top) / rect.height - 0.5;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        x.set(xPct);
        y.set(yPct);
      });
    },
    [x, y, prefersReducedMotion]
  );

  const handlePointerLeave = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    x.set(0);
    y.set(0);
  }, [x, y]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Prefer CSS for responsive sizing (clamp) to avoid resize-driven renders.
  // width/height props remain as upper bounds for flexibility.
  const maxW = `${width}px`;
  const maxH = `${height}px`;

  return (
    <div
      className="flex items-center justify-center"
      // Enable 3D for children once, instead of recomputing perspective in transform
      style={{ perspective: 1200 }}
    >
      <motion.div
        ref={ref}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        // Use transform props, not a template string
        style={{
          rotateX: prefersReducedMotion ? 0 : mouseRotateX,
          rotateY: prefersReducedMotion ? 0 : combinedRotateY,
          transformStyle: "preserve-3d",
          // Let CSS clamp handle responsive sizing; max bounds come from props
          width: `min(${maxW}, 90vw)`,
          height: `min(${maxH}, 90vh)`,
          willChange: "transform",
          backfaceVisibility: "hidden",
          touchAction: "none",
        }}
        whileHover={
          prefersReducedMotion
            ? undefined
            : { scale: 1.05, transition: { type: "spring" } }
        }
        className="relative rounded-[16px] md:rounded-[26px]"
      >
        {/* Layer 1: Bottom Image */}
        <div
          className="absolute inset-0 w-full h-full rounded-[16px] md:rounded-[26px] bg-cover bg-center"
          style={{
            backgroundImage: `url(${bottomImageUrl})`,
            boxShadow:
              "rgba(0, 0, 0, 0.1) 0px 10px 5px 0px, rgba(0, 0, 0, 0.1) 0px 10px 3px 0px",
            willChange: "transform",
          }}
        />

        {/* Layer 2: Top Image (Parallax). Use z for real depth instead of invalid transform strings */}
        <motion.div
          className="absolute inset-0 w-full h-full bg-contain bg-no-repeat bg-center [filter:drop-shadow(4px_4px_10px_rgba(0,0,0,0.5))]"
          style={{
            backgroundImage: `url(${topImageUrl})`,
            x: topImageTranslateX,
            y: topImageTranslateY,
            scale: prefersReducedMotion ? 1 : topImageScale,
            z: 40, // replaces transform: '40px' with actual 3D depth
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
        />

        {/* Layer 3: Text (Parallax) */}
        <motion.p
          className="absolute bottom-0 -right-1/2 w-full font-gothic font-medium text-white"
          style={{
            x: textTranslateX,
            y: textTranslateY,
            scale: prefersReducedMotion ? 1 : 1.2,
            z: 60, // replaces transform: '60px' with actual 3D depth
            fontSize: `clamp(12px, ${fontSize}px, ${Math.max(16, fontSize)}px)`,
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
        >
          {cardText}
        </motion.p>

        {/* Layer 4: Glare */}
        {!prefersReducedMotion && (
          <motion.div
            className="pointer-events-none absolute inset-0 w-full h-full rounded-[16px] md:rounded-[26px] mix-blend-soft-light"
            style={{ background: glareBackground }}
          />
        )}
      </motion.div>
    </div>
  );
});

ImageCard3D.displayName = "ImageCard3D";
