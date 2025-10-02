"use client";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";

interface BackgroundImageProps {
  src: string;
  width: number;
  height: number;
  rotation?: number;
  className?: string;
}

const BackgroundImage = ({
  src,
  width,
  height,
  rotation = 0,
  className = "",
}: BackgroundImageProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animations
  const springConfig = { damping: 30, stiffness: 400 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Subtle transform values for smooth movement
  const backgroundX = useTransform(springX, (value: number) => value * 0.015);
  const backgroundY = useTransform(springY, (value: number) => value * 0.015);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className={`absolute top-0 z-0 ml-0 ${className}`}
      style={{
        x: backgroundX,
        y: backgroundY,
        rotate: rotation,
      }}
    >
      <Image src={src} alt="Background Image" width={width} height={height} unoptimized />
    </motion.div>
  );
};

export default BackgroundImage;
