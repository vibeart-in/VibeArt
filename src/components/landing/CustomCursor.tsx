"use client";
import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring, Variants } from "motion/react";

interface CustomCursorProps {
  isVisible: boolean;
}

export const CustomCursor = ({ isVisible }: CustomCursorProps) => {
  // 1. Motion values to track mouse position
  const mouseX = useMotionValue(-200); // Initialize off-screen
  const mouseY = useMotionValue(-200);

  // 2. Spring animations for smooth, delayed following
  const springConfig = { damping: 30, stiffness: 500, mass: 0.5 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // 3. Effect to update mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  // 4. Variants for animating visibility (fade in/out, scale up/down)
  const cursorVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.5,
      transition: { type: "spring", stiffness: 200, damping: 20 },
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
  };

  return (
    <motion.div
      // --- Core Properties ---
      variants={cursorVariants}
      animate={isVisible ? "visible" : "hidden"}
      initial="hidden"
      // Apply the spring-animated coordinates
      style={{
        translateX: springX,
        translateY: springY,
      }}
      // --- Styling for Glassmorphism ---
      className="pointer-events-none fixed left-0 top-0 z-50 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-base font-semibold text-white backdrop-blur-sm"
    >
      Drag me
    </motion.div>
  );
};
