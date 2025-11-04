"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, ReactNode } from "react";

import GlassModal from "@/src/components/ui/GlassModal";
import AnimatedGradientBackground from "../ui/animated-gradient-background";
import BackgroundImage from "../home/BackgroundImage";

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
  return (
    <section className="relative h-screen w-screen overflow-hidden">
      <BackgroundImage
        className="mt-14"
        src="https://i.pinimg.com/736x/af/4a/4f/af4a4f086d3acdb0e40a7c88554d5fcf.jpg"
        width={600}
        height={600}
        rotation={10}
      />
      <div className="flex min-h-screen flex-col items-center justify-center">{children}</div>
      {/* <AnimatedGradientBackground Breathing={true} /> */}
    </section>
  );
}
