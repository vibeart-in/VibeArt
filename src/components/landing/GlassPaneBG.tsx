"use client";

import React, { useState, useEffect, useRef } from "react";

interface GlassModalProps {
  children: React.ReactNode;
  paneWidth?: number; // Width of a single glass pane
  className?: string;
}

const GlassPaneBG: React.FC<GlassModalProps> = ({ children, paneWidth = 40, className = "" }) => {
  const [paneCount, setPaneCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // This effect calculates the number of panes based on the container width.
  useEffect(() => {
    setMounted(true);
    const calculatePanes = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const count = Math.ceil(containerWidth / paneWidth);
        setPaneCount(count);
      }
    };

    calculatePanes();
    window.addEventListener("resize", calculatePanes);

    return () => {
      window.removeEventListener("resize", calculatePanes);
    };
  }, [paneWidth]);

  const glassItemClasses = [
    "bg-[linear-gradient(90deg,rgba(22,22,24,0.3)_0%,rgba(0,0,0,0.3)_1%,rgba(26,26,29,0.01)_100%)]",
    "shadow-[inset_0_2px_4px_rgba(255,255,255,0.16)]",
    "backdrop-blur-[20px]",
  ].join(" ");

  const glassPanes = mounted
    ? Array.from({ length: paneCount }, (_, index) => {
        return (
          <li
            key={index}
            // CRITICAL CHANGE: We use `h-full` to make the pane stretch
            // to the height of its parent `<ul>`. No inline style for height.
            className={`${glassItemClasses} h-full`}
            style={{ width: `${paneWidth}px` }}
          ></li>
        );
      })
    : [];

  return (
    // 1. The main container is `relative` and its height is determined
    //    by the `children` inside it.
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* 2. The glass panes are in an absolute-positioned `<ul>` that stretches
          to the full size of the relative parent (`inset-0` is a shortcut
           for top/right/bottom/left-0). */}
      <ul className="absolute inset-0 z-0 flex" aria-hidden="true">
        {glassPanes}
      </ul>

      {/* 3. The content sits on top and dictates the overall component height. */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default GlassPaneBG;
