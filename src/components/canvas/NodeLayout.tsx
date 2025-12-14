"use client";

import { Handle, Position, useViewport } from "@xyflow/react";
import React, { ReactNode } from "react";
import NodeToolbar from "./NodeToolbar";
import Magnet from "../ui/Magnet"; // Your provided Magnet component

export type HandleConfig = {
  type: "source" | "target";
  position: Position;
  id?: string;
  className?: string;
};

interface NodeLayoutProps {
  id?: string;
  selected?: boolean;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  titleLabel?: string;
  subtitle?: string;
  children?: ReactNode;
  headerActions?: ReactNode;
  handles?: HandleConfig[];
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function NodeLayout({
  selected,
  className = "",
  style,
  title,
  subtitle,
  children,
  handles = [],
  onMouseEnter,
  onMouseLeave,
}: NodeLayoutProps) {
  const { zoom } = useViewport();

  // Positioning logic for the Magnet Container
  const getMagnetPositionStyle = (position: Position) => {
    const offset = -6; // Adjust this to move handle closer/further from edge

    const baseStyle: React.CSSProperties = {
      position: "absolute",
      zIndex: 50,
      pointerEvents: "none", // Allow clicks to pass through the wrapper area...
    };

    switch (position) {
      case Position.Left:
        return { ...baseStyle, left: `${offset}px`, top: "50%", transform: "translateY(-50%)" };
      case Position.Right:
        return { ...baseStyle, right: `${offset}px`, top: "50%", transform: "translateY(-50%)" };
      case Position.Top:
        return { ...baseStyle, top: `${offset}px`, left: "50%", transform: "translateX(-50%)" };
      case Position.Bottom:
        return { ...baseStyle, bottom: `${offset}px`, left: "50%", transform: "translateX(-50%)" };
      default:
        return baseStyle;
    }
  };

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group relative transition-all duration-300 ${
        selected ? "ring-2 ring-[#e2e2e2]/50" : ""
      } ${className}`}
      style={style}
    >
      <NodeToolbar
        handleMouseEnter={onMouseEnter}
        handleMouseLeave={onMouseLeave}
        isHovered={selected}
      />

      {/* Header Info */}
      {(title || subtitle) && (
        <div
          className="absolute bottom-full left-0 right-0 flex items-center justify-between px-1 font-medium text-white/90"
          style={{ marginBottom: `${8 / zoom}px` }}
        >
          {title && (
            <span
              className="max-w-[60%] truncate font-light"
              style={{ fontSize: `${12 / zoom}px` }}
            >
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
      )}

      {/* Main Content */}
      {children}

      {/* Magnetic Handles */}
      {handles.map((handle, index) => {
        // Calculate size based on zoom
        const size = Math.max(10, 16 / zoom);

        return (
          <Magnet
            key={`${handle.type}-${handle.position}-${index}`}
            padding={40} // Detection range
            magnetStrength={5} // Lower = follows mouse more closely
            // activeTransition="transform 0.1s ease-out"
            // inactiveTransition="transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            wrapperClassName="absolute"
            // Important: Override display to ensure positioning works
            style={{
              ...getMagnetPositionStyle(handle.position),
              display: "block",
            }}
          >
            {/* The Actual XYFlow Handle */}
            <Handle
              type={handle.type}
              position={handle.position}
              id={handle.id}
              // This style ensures the handle is the actual visible, clickable element
              // style={{
              //   position: "relative", // Must be relative inside the magnet
              //   transform: "none",
              //   width: `${size}px`,
              //   height: `${size}px`,
              //   background: "#DFFF00", // Yellow color
              //   border: "1px solid rgba(0,0,0,0.2)",
              //   borderRadius: "50%",
              //   pointerEvents: "auto", // FORCE events on the handle
              //   zIndex: 51,
              // }}
              // Retain your visibility logic (fade in on node hover)
              className={`transition-opacity duration-300 ${
                selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              } ${handle.className || ""}`}
            />
          </Magnet>
        );
      })}
    </div>
  );
}
