"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import clsx from "clsx";

export type FocusRect = {
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
};

const defaultFocus: FocusRect = {
  leftPct: 28,
  topPct: 53,
  widthPct: 12,
  heightPct: 12,
};
const defaultPreviewSize = { w: 320, h: 240 };
const defaultMainSize = { w: 460, h: 520 };

export default function ImageMagnifyCard({
  src = "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/acae448d-b054-428a-8e42-79d493be4019/original=true,quality=90/ComfyUI_00001_cdtbm_1755690319.jpeg",
  mainSize = defaultMainSize,
  focus = defaultFocus,
  previewSize = defaultPreviewSize,
  scale = 8,
  className = "",
}: {
  src?: string;
  mainSize?: { w: number; h: number };
  focus?: FocusRect;
  previewSize?: { w: number; h: number };
  scale?: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null); // Ref for the main container
  const leftRef = useRef<HTMLDivElement | null>(null);
  const focusRef = useRef<HTMLDivElement | null>(null); // <-- NEW: Ref for the focus box
  const previewRef = useRef<HTMLDivElement | null>(null); // <-- NEW: Ref for the preview box

  // NEW: State to track hover and line style
  const [isHovered, setIsHovered] = useState(false);
  const [lineStyle, setLineStyle] = useState({});

  const mouseX = useMotionValue(focus.leftPct);
  const mouseY = useMotionValue(focus.topPct);

  const springConfig = { stiffness: 300, damping: 25, mass: 0.8 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const focusLeft = useTransform(smoothMouseX, (val) => `${val}%`);
  const focusTop = useTransform(smoothMouseY, (val) => `${val}%`);

  const bgPosX = useTransform(smoothMouseX, (val) => `${val + focus.widthPct / 2}%`);
  const bgPosY = useTransform(smoothMouseY, (val) => `${val + focus.heightPct / 2}%`);
  const backgroundPosition = useTransform([bgPosX, bgPosY], ([x, y]) => `${x} ${y}`);

  const focusVariants = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1 },
  };

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  // NEW: Function to calculate and update the connector line's style
  const updateLine = useCallback(() => {
    if (!focusRef.current || !previewRef.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const focusRect = focusRef.current.getBoundingClientRect();
    const previewRect = previewRef.current.getBoundingClientRect();

    // Calculate center points relative to the main container
    const focusCenter = {
      x: focusRect.left - containerRect.left + focusRect.width / 2,
      y: focusRect.top - containerRect.top + focusRect.height / 2,
    };
    const previewCenter = {
      x: previewRect.left - containerRect.left + previewRect.width / 2,
      y: previewRect.top - containerRect.top + previewRect.height / 2,
    };

    // Calculate distance and angle between the two center points
    const dx = previewCenter.x - focusCenter.x;
    const dy = previewCenter.y - focusCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    setLineStyle({
      left: `${focusCenter.x}px`,
      top: `${focusCenter.y}px`,
      width: `${distance}px`,
      transform: `rotate(${angle}deg)`,
    });
  }, []);

  // NEW: Effect to update the line whenever the mouse moves (via motion values) or window resizes
  useEffect(() => {
    // We need to use on "change" because the motion values update outside of React's render cycle
    const unsubscribeX = smoothMouseX.on("change", updateLine);
    const unsubscribeY = smoothMouseY.on("change", updateLine);

    // Also update on resize
    window.addEventListener("resize", updateLine);
    // Initial calculation
    updateLine();

    return () => {
      unsubscribeX();
      unsubscribeY();
      window.removeEventListener("resize", updateLine);
    };
  }, [smoothMouseX, smoothMouseY, updateLine]);

  function handleMouseMove(e: React.MouseEvent) {
    setIsHovered(true); // Show focus box and line
    const leftEl = leftRef.current;
    if (!leftEl) return;

    const rect = leftEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerXPct = (x / rect.width) * 100;
    const centerYPct = (y / rect.height) * 100;

    const halfWidthPct = focus.widthPct / 2;
    const halfHeightPct = focus.heightPct / 2;

    const leftPct = clamp(centerXPct - halfWidthPct, 0, 100 - focus.widthPct);
    const topPct = clamp(centerYPct - halfHeightPct, 0, 100 - focus.heightPct);

    mouseX.set(leftPct);
    mouseY.set(topPct);
  }

  function handleMouseLeave() {
    setIsHovered(false); // Hide focus box and line
    mouseX.set(focus.leftPct);
    mouseY.set(focus.topPct);
  }

  return (
    <div ref={containerRef} className="relative flex items-start gap-8">
      {/* Left image */}
      <motion.div
        ref={leftRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative overflow-hidden rounded-3xl border-2 border-white/30"
        style={{
          width: mainSize.w,
          height: mainSize.h,
          backgroundColor: "#0b0b0b",
        }}
      >
        <Image
          width={460}
          height={520}
          src={src}
          alt="source"
          className="h-full w-full object-cover"
          draggable={false}
          priority
        />

        {/* Focus rectangle */}
        <motion.div
          ref={focusRef} // <-- Add ref here
          className="absolute rounded-xl border-2 border-white/30"
          style={{
            left: focusLeft,
            top: focusTop,
            width: `${focus.widthPct}%`,
            height: `${focus.heightPct}%`,
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
            backdropFilter: "blur(5px)",
            pointerEvents: "none",
          }}
          variants={focusVariants}
          initial="visible"
          // animate={isHovered ? "visible" : "hidden"}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        />
      </motion.div>

      {/* Right preview */}
      <motion.div
        ref={previewRef} // <-- Add ref here
        className={clsx(
          "absolute overflow-hidden rounded-2xl border-2 border-white/30 bg-black",
          className,
        )}
        style={{
          width: previewSize.w,
          height: previewSize.h,
          backgroundImage: `url("${src}")`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${scale * 100}%`,
          backgroundPosition: backgroundPosition,
          imageRendering: "pixelated",
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />

      {/* NEW: Connector Line */}
      <motion.div
        className="pointer-events-none absolute h-[2px] bg-gradient-to-r from-white/0 via-white/40 to-white/0"
        style={{
          ...lineStyle,
          transformOrigin: "left center", // Rotate from the start of the line
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
    </div>
  );
}
