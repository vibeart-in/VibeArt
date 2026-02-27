"use client";

import { BaseEdge, getBezierPath, EdgeProps } from "@xyflow/react";
import React from "react";

export const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const filterId = `subtle-glow-${id}`;

  return (
    <>
      <defs>
        {/* A much simpler, subtle glow filter */}
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="3" /* How wide the blur is */
            floodColor="#ffffff" /* Glow color - change if you want a tinted glow */
            floodOpacity="1" /* 0.5 keeps it very soft and subtle */
          />
        </filter>
      </defs>

      {/* Base dark curve line */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: "#4c4c4c",
          strokeWidth: 2,
          strokeDasharray: "none",
        }}
      />

      {/* 
        Traveling line segment.
        Slightly thinner (height=3) to make the soft glow look better.
      */}
      <rect
        x="-20"
        y="-1.5"
        width="40"
        height="3"
        rx="1.5"
        fill="#ffffff"
        filter={`url(#${filterId})`}
      >
        {/* Moves the line along the curve */}
        <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} rotate="auto" />
        {/* Smoothly fades the line in at the start, and out at the end */}
        <animate
          attributeName="opacity"
          values="0;1;1;0"
          keyTimes="0;0.2;0.8;1"
          dur="2.5s"
          repeatCount="indefinite"
        />
      </rect>
    </>
  );
};
