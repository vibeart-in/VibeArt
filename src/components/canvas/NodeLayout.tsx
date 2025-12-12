"use client";

import { Handle, Position, useViewport } from "@xyflow/react";
import React, { ReactNode } from "react";

export type HandleConfig = {
  type: "source" | "target";
  position: Position;
  id?: string;
  className?: string; // Allow custom class overrides
};

interface NodeLayoutProps {
  id?: string;
  selected?: boolean;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  titleLabel?: string; // For the text content
  subtitle?: string;
  children?: ReactNode;
  headerActions?: ReactNode; // Extra elements for the header area if needed
  handles?: HandleConfig[];

  // Event handlers
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

  // Helper to calculate handle positioning style
  const getHandleStyle = (position: Position) => {
    const size = Math.max(8, 16 / zoom);
    const border = Math.max(1, 3 / zoom);
    const offset = Math.min(-8, -20 / zoom);

    const baseStyle = {
      width: `${size}px`,
      height: `${size}px`,
      borderWidth: `${border}px`,
      borderColor: "#1a1a1a",
    };

    switch (position) {
      case Position.Left:
        return { ...baseStyle, left: `${offset}px` };
      case Position.Right:
        return { ...baseStyle, right: `${offset}px` };
      case Position.Top:
        return { ...baseStyle, top: `${offset}px` };
      case Position.Bottom:
        return { ...baseStyle, bottom: `${offset}px` };
      default:
        return baseStyle;
    }
  };

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group relative transition-all duration-300 ${
        selected ? "ring-2 ring-[#e2e2e2]/50" : "hover:ring-2 hover:ring-[#e2e2e2]/30"
      } ${className}`}
      style={style}
    >
      {/* Header Info - Always Visible above the node */}
      {(title || subtitle) && (
        <div
          className="absolute bottom-full left-0 right-0 flex items-center justify-between px-1 font-medium text-white/90"
          style={{
            marginBottom: `${8 / zoom}px`,
          }}
        >
          {title && (
            <span
              className="max-w-[60%] truncate font-light"
              style={{
                fontSize: `${12 / zoom}px`,
              }}
            >
              {title}
            </span>
          )}
          {subtitle && (
            <span
              className="max-w-[35%] truncate font-extralight opacity-80"
              style={{
                fontSize: `${10 / zoom}px`,
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}

      {/* Main Content */}
      {children}

      {/* Handles */}
      {handles.map((handle, index) => (
        <Handle
          key={`${handle.type}-${handle.position}-${index}`}
          type={handle.type}
          position={handle.position}
          id={handle.id}
          className={`!bg-[#DFFF00] transition-opacity duration-300 ${
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          } ${handle.className || ""}`}
          style={getHandleStyle(handle.position)}
        />
      ))}
    </div>
  );
}
