"use client";

import GlassModal from "@/src/components/ui/GlassModal";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, ReactNode } from "react";
import Link from "next/link";

interface AuthTemplateProps {
  children: ReactNode;
  modalWidth?: number;
  modalHeight?: number;
  modalCount?: number;
}

export default function AuthTemplate({
  children,
  modalWidth = 36,
  modalHeight = 440,
  modalCount = 16,
}: AuthTemplateProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring animations for smooth movement
  const springConfig = { damping: 25, stiffness: 700 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Transform values for the background glass image only
  const backgroundX = useTransform(springX, (value: number) => value * 0.02);
  const backgroundY = useTransform(springY, (value: number) => value * 0.02);

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
    <section className="relative h-screen w-screen overflow-hidden bg-[#0C0C0C]">
      <div className="flex min-h-screen flex-col items-center">
        <motion.div
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <Link href="/" className="flex items-center justify-center">
            <Image
              src="/images/glass_image.png"
              alt="Auth Image"
              width={200}
              height={100}
              className=""
            />
            <Image src="/images/aura.png" alt="Auth Image" width={300} height={250} className="" />
          </Link>
        </motion.div>

        {children}
      </div>

      <motion.div
        className="absolute right-[48%] top-72 z-0 cursor-pointer"
        style={{
          x: backgroundX,
          y: backgroundY,
          rotate: -28,
        }}
        whileHover={{
          scale: 1.05,
          rotate: -25,
        }}
        whileTap={{ scale: 0.95 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
      >
        <Image src="/images/glass_image.png" alt="Auth Image" width={850} height={500} />
      </motion.div>
    </section>
  );
}
