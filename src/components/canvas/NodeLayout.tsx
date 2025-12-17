"use client";

import { Handle, NodeResizeControl, Position, useViewport } from "@xyflow/react";
import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import NodeToolbar from "./NodeToolbar";
import Magnet from "../ui/Magnet";
import { IconSquareRoundedPlus } from "@tabler/icons-react";
import { useCanvas } from "../providers/CanvasProvider";

export type HandleConfig = {
  type: "source" | "target";
  position: Position;
  id?: string;
  className?: string;
};

interface NodeLayoutProps {
  id?: string;
  toolbarType?: "default" | "text" | "image";
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
}

export default function NodeLayout({
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
  toolbarType = "default",
  textEditor,
}: NodeLayoutProps) {
  const { zoom } = useViewport();
  const { isDraggingEdge } = useCanvas();

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

  // --- 2. Positioning Logic ---
  const getHandlePositionStyle = (
    position: Position,
  ): React.CSSProperties & { "--x-translate"?: string; "--y-translate"?: string } => {
    const isVertical = position === Position.Left || position === Position.Right;
    const size = isVertical ? { height: "6rem", width: "4rem" } : { width: "6rem", height: "4rem" };

    // Position the logical handle center exactly on the node border.
    // Half of 4rem (handle thickness) is 2rem. To touch the border, use -2rem.
    const offset = "-0rem";

    // We want the visual "plus" icon to float outside the node.
    // Since the handle is at the border (0px), this pushes the icon outwards.
    // Try 30px - 40px for a good floating distance.
    const floatDistance = "54px";

    switch (position) {
      case Position.Left:
        return {
          ...size,
          left: offset,
          top: "50%",
          transform: "translateY(-50%)",
          "--x-translate": `-${floatDistance}`,
        };
      case Position.Right:
        return {
          ...size,
          right: offset,
          top: "50%",
          transform: "translateY(-50%)",
          "--x-translate": floatDistance,
        };
      case Position.Top:
        return {
          ...size,
          top: offset,
          left: "50%",
          transform: "translateX(-50%)",
          "--y-translate": `-${floatDistance}`,
        };
      case Position.Bottom:
        return {
          ...size,
          bottom: offset,
          left: "50%",
          transform: "translateX(-50%)",
          "--y-translate": floatDistance,
        };
      default:
        return {};
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative transition-all duration-300 ${
        selected ? "ring-2 ring-[#e2e2e2]/50" : ""
      } ${className}`}
      style={{
        minWidth,
        minHeight,
        ...style,
      }}
    >
      <NodeToolbar
        // Pass the handlers if the toolbar needs to keep the node awake
        handleMouseEnter={handleMouseEnter}
        handleMouseLeave={handleMouseLeave}
        isHovered={isActive} // Use the combined state
        id={id}
        toolbarType={toolbarType}
        selected={!!selected}
        textEditor={textEditor}
      />

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

      {/* Resize Control */}
      {selected && (
        <NodeResizeControl
          position="bottom-right"
          minWidth={minWidth}
          minHeight={minHeight}
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
        const {
          "--x-translate": xTrans,
          "--y-translate": yTrans,
          ...handleStyle
        } = getHandlePositionStyle(handle.position);

        return (
          <Handle
            key={`${handle.type}-${handle.position}-${index}`}
            type={handle.type}
            position={handle.position}
            id={handle.id}
            // Use 'isActive' to control visibility
            className={`group/handle absolute z-0 flex items-center justify-center bg-transparent transition-opacity duration-300 ${
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            } ${handle.className || ""}`}
            style={{
              ...handleStyle,
              border: "none",
              borderRadius: 0,
              background: "transparent",
            }}
          >
            {!isDraggingEdge && (
              <Magnet
                padding={0}
                magnetStrength={2}
                activeTransition="transform 0.1s ease-out"
                inactiveTransition="transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                wrapperClassName="w-full h-full"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `translate(${xTrans || 0}, ${yTrans || 0})`,
                }}
              >
                <IconSquareRoundedPlus />
              </Magnet>
            )}
          </Handle>
        );
      })}
    </div>
  );
}
