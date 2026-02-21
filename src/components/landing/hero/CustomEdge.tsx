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

  const filterId = `glow-filter-${id}`;

  return (
    <>
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="0 0 0 0 0.85
                    0 0 0 0 0.91
                    0 0 0 0 0.17
                    0 0 0 1.2 0"
            result="coloredBlur"
          />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Base curve line */}
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

      {/* Animated glow traveling along the curve */}
      {/* <ellipse rx="8" ry="5" fill="#d9e92b" opacity="0.9" filter={`url(#${filterId})`}>
        <animateMotion dur="2.5s" repeatCount="indefinite" path={edgePath} rotate="auto" />
        <animate attributeName="opacity" values="0.6;1;0.6" dur="1.2s" repeatCount="indefinite" />
        <animate attributeName="rx" values="6;10;6" dur="1.2s" repeatCount="indefinite" />
        <animate attributeName="ry" values="4;6;4" dur="1.2s" repeatCount="indefinite" />
      </ellipse> */}
    </>
  );
};
