"use client";

import React from "react";

import { cn } from "@/src/lib/utils";

const getGradientDirection = (className: string) => {
  const directionMap: Record<string, string> = {
    "bg-gradient-to-r": "to right",
    "bg-gradient-to-l": "to left",
    "bg-gradient-to-t": "to top",
    "bg-gradient-to-b": "to bottom",
    "bg-gradient-to-tr": "to top right",
    "bg-gradient-to-tl": "to top left",
    "bg-gradient-to-br": "to bottom right",
    "bg-gradient-to-bl": "to bottom left",
  };
  return directionMap[className] || "to right";
};

const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
};

export const ImagePlaceholder = ({
  width,
  height,
  mediaUrl,
}: {
  width: number;
  height: number;
  mediaUrl: string;
}) => {
  const colors = [
    "#37353E",
    "#44444E",
    "#715A5A",
    "#D3DAD9",
    "#2F5755",
    "#5A9690",
    "#090040",
    "#4A3F55",
    "#556B6E",
    "#2E3D4F",
  ];

  const gradientClasses = [
    "bg-gradient-to-r",
    "bg-gradient-to-l",
    "bg-gradient-to-t",
    "bg-gradient-to-b",
    "bg-gradient-to-tr",
    "bg-gradient-to-tl",
    "bg-gradient-to-br",
    "bg-gradient-to-bl",
  ];

  const seed = hashString(mediaUrl);
  const first = colors[seed % colors.length];
  const second = colors[(seed + 3) % colors.length];
  const gradientClass = gradientClasses[seed % gradientClasses.length];

  return (
    <div style={{ width, height }} className={cn("absolute h-auto w-full")}>
      <div
        className={cn("animate-gradient-xy relative h-full w-full overflow-hidden")}
        style={{
          backgroundImage: `linear-gradient(${getGradientDirection(
            gradientClass,
          )}, ${first}, ${second})`,
        }}
      >
        <div className="noise-texture pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay" />
      </div>
    </div>
  );
};
