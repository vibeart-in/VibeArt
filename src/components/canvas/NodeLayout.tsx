"use client";

import { Handle, Position, useViewport } from "@xyflow/react";
import React, { ReactNode } from "react";
import NodeToolbar from "./NodeToolbar";
import Magnet from "../ui/Magnet"; // Your provided Magnet component
import { IconCirclePlus, IconSquareRoundedPlus } from "@tabler/icons-react";

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

  // Positioning logic for the Magnet Handle Container
  const getHandlePositionStyle = (position: Position): React.CSSProperties => {
    const isVertical = position === Position.Left || position === Position.Right;
    const size = isVertical ? { height: "6rem", width: "4rem" } : { width: "6rem", height: "4rem" };

    // Base transform for centering
    const baseTransform = isVertical ? "translateY(-50%)" : "translateX(-50%)";

    // Distance from the node edge
    const offset = "-32px";

    switch (position) {
      case Position.Left:
        return {
          ...size,
          left: offset,
          top: "50%",
          transform: `${baseTransform} translateX(-50%)`, // Push further out
        };
      case Position.Right:
        return {
          ...size,
          right: offset,
          top: "50%",
          transform: `${baseTransform} translateX(50%)`,
        };
      case Position.Top:
        return {
          ...size,
          top: offset,
          left: "50%",
          transform: `${baseTransform} translateY(-50%)`,
        };
      case Position.Bottom:
        return {
          ...size,
          bottom: offset,
          left: "50%",
          transform: `${baseTransform} translateY(50%)`,
        };
      default:
        return {};
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
        return (
          <Handle
            key={`${handle.type}-${handle.position}-${index}`}
            type={handle.type}
            position={handle.position}
            id={handle.id}
            className={`group/handle absolute z-0 flex items-center justify-center bg-transparent transition-opacity duration-300 ${
              selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            } ${handle.className || ""}`}
            style={{
              ...getHandlePositionStyle(handle.position),
              border: "none", // Override default xyflow handle styles
              borderRadius: 0,
              background: "transparent",
            }}
          >
            <Magnet
              padding={0} // Detect within the box
              magnetStrength={2}
              activeTransition="transform 0.1s ease-out"
              inactiveTransition="transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
              wrapperClassName="w-full h-full"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconSquareRoundedPlus />
            </Magnet>
          </Handle>
        );
      })}
    </div>
  );
}
