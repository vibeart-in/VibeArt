"use client";

import { Handle, NodeResizeControl, Position, useViewport } from "@xyflow/react";
import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";

export type HandleConfig = {
  type: "source" | "target";
  position: Position;
  id?: string;
  className?: string;
};

interface NodeLayoutProps {
  id?: string;
  toolbarType?: "default" | "text" | "image" | "generate" | "upscale" | "removeBackground";
  textEditor?: any; // Tiptap editor instance
  selected?: boolean;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  handles?: HandleConfig[];
  minWidth?: number;
  minHeight?: number;
  keepAspectRatio?: boolean;
  toolbarHidden?: boolean;
  resizeHidden?: boolean;
  initialModel?: string; // New prop for initializing model
}

export default function HeroNodeLayout({
  id,
  selected,
  className = "",
  style,
  title,
  subtitle,
  children,
  handles = [],
  minWidth = 200,
  minHeight = 200,
  keepAspectRatio,
  resizeHidden,
}: NodeLayoutProps) {
  // --- 1. Internal Hover Logic ---
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    };
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    // Add a small delay so UI doesn't flicker if mouse moves fast
    hoverTimeout.current = setTimeout(() => {
      setIsHovered(false);
    }, 250);
  }, []);

  // Use this to toggle visibility of handles/toolbar
  const isActive = selected || isHovered;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative cursor-grab ${className}`}
      style={{
        minWidth,
        minHeight,
        ...style,
      }}
    >
      <NodeLabels title={title} subtitle={subtitle} />

      {/* Main Content */}
      <div className="size-full">{children}</div>

      {/* Resize Control */}
      {!resizeHidden && selected && (
        <NodeResizeControl
          position="bottom-right"
          minWidth={minWidth}
          minHeight={minHeight}
          keepAspectRatio={keepAspectRatio}
          style={{ background: "transparent", border: "none", zIndex: 50 }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: "absolute",
              bottom: -6,
              right: -6,
            }}
          >
            <path
              d="M 3 17 A 14 14 0 0 0 17 3"
              stroke="#c0c0bf80"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </NodeResizeControl>
      )}

      {/* Handles */}
      {handles.map((handle, index) => {
        return (
          <Handle
            key={`${handle.type}-${handle.position}-${index}`}
            type={handle.type}
            position={handle.position}
            id={handle.id}
            className={`absolute z-10 flex items-center justify-center transition-opacity duration-300 ${
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            } ${handle.className || ""}`}
            style={{
              border: "none",
              borderRadius: "50%",
              background: "#d9e747",
              width: "12px",
              height: "12px",
            }}
          />
        );
      })}
    </div>
  );
}

const NodeLabels = React.memo(({ title, subtitle }: { title?: string; subtitle?: string }) => {
  const { zoom } = useViewport();

  if (!title && !subtitle) return null;

  return (
    <div
      className="absolute inset-x-0 bottom-full flex items-center justify-between px-1 font-medium text-white/90"
      style={{ marginBottom: `${8 / zoom}px` }}
    >
      {title && (
        <span className="max-w-[60%] truncate font-light" style={{ fontSize: `${12 / zoom}px` }}>
          {title}
        </span>
      )}
      {subtitle && (
        <span
          className="max-w-[35%] truncate font-extralight opacity-80"
          style={{ fontSize: `${10 / zoom}px` }}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
});

NodeLabels.displayName = "NodeLabels";
