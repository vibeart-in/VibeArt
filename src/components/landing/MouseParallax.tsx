"use client";

import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import React, { createContext, useContext, useRef, type ReactNode } from "react";

// 1. Define the shape of the context data
interface ParallaxContextType {
  x: MotionValue<number>;
  y: MotionValue<number>;
}

// 2. Create the context
const ParallaxContext = createContext<ParallaxContextType | null>(null);

/**
 * Provider component that tracks mouse movement over its area
 * and makes the normalized position available to child components.
 */
export const MouseParallaxProvider = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const normalizedX = ((e.clientX - rect.left) / width) * 2 - 1;
    const normalizedY = ((e.clientY - rect.top) / height) * 2 - 1;

    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div ref={ref} onMouseMove={handleMouse} onMouseLeave={handleMouseLeave} className={className}>
      <ParallaxContext.Provider value={{ x, y }}>{children}</ParallaxContext.Provider>
    </div>
  );
};

/**
 * A motion-enabled item that reacts to the mouse position
 * provided by MouseParallaxProvider.
 * @param strength - The magnitude of movement. Higher is more.
 */
export const MouseParallaxItem = ({
  children,
  strength,
  className,
}: {
  children: ReactNode;
  strength: number;
  className?: string;
}) => {
  const context = useContext(ParallaxContext);
  if (!context) {
    throw new Error("MouseParallaxItem must be used within a MouseParallaxProvider");
  }

  const { x, y } = context;

  const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };

  const itemX = useTransform(x, [-1, 1], [-strength, strength]);
  const itemY = useTransform(y, [-1, 1], [-strength, strength]);

  const smoothItemX = useSpring(itemX, springConfig);
  const smoothItemY = useSpring(itemY, springConfig);

  return (
    <motion.div style={{ x: smoothItemX, y: smoothItemY }} className={className}>
      {children}
    </motion.div>
  );
};
