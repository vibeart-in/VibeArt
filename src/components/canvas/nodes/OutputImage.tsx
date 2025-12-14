import { Position, NodeProps, Node, NodeResizeControl, useReactFlow } from "@xyflow/react";
import NodeLayout from "../NodeLayout";
import React, { useRef, useCallback, useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { TextShimmer } from "../../ui/text-shimmer";
import { Textarea } from "../../ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

type ImageNodeData = {
  label?: string;
  imageUrl?: string;
  inputImageUrls?: string[];
  prompt?: string;
  model?: string;
  category?: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
};

export type OutputImageNodeType = Node<ImageNodeData, "outputImage">;

const PLACEHOLDERS = [
  {
    url: "https://cdn.midjourney.com/a3b07153-28fd-4685-8536-63cb311647e9/0_0.png",
    prompt: "An astronaut in a field of flowers",
  },
  {
    url: "https://cdn.midjourney.com/526616d6-42f3-48c5-a966-a0ee874994c3/0_0.png",
    prompt: "A moody cyberpunk street at night",
  },
  {
    url: "https://cdn.midjourney.com/21e97ee6-c82f-44f5-aa2b-5fb4d83ea3fc/0_0.png",
    prompt: "A portrait of a cyborg woman",
  },
];

export default function OutputImage({ id, data, selected }: NodeProps<OutputImageNodeType>) {
  const { updateNodeData } = useReactFlow();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  useEffect(() => {
    if (data.imageUrl) return;
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [data.imageUrl]);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return (
    <>
      <NodeLayout
        selected={selected}
        title={data.category || "Image generation"}
        subtitle={data.model}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="h-full min-h-[450px] w-full min-w-[320px] cursor-default rounded-3xl bg-[#1D1D1D]"
        handles={[
          { type: "target", position: Position.Left },
          { type: "source", position: Position.Right },
        ]}
      >
        {selected && (
          <NodeResizeControl
            position="bottom-right"
            minWidth={320}
            minHeight={450}
            keepAspectRatio
            style={{
              background: "transparent",
              border: "none",
            }}
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

        {/* Background Image */}
        <div className="relative h-full w-full overflow-hidden rounded-3xl">
          {data.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.imageUrl}
              alt={data.prompt || "Generated Image"}
              className="h-full w-full rounded-3xl object-cover"
              draggable={false}
            />
          ) : (
            <div className="relative flex h-full w-full items-center justify-center">
              <AnimatePresence mode="popLayout">
                <motion.img
                  key={currentPlaceholder}
                  src={PLACEHOLDERS[currentPlaceholder].url}
                  initial={{ opacity: 0, filter: "blur(8px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="absolute inset-0 h-full w-full object-cover opacity-60"
                  alt="Placeholder"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/40" />
            </div>
          )}

          {/* Overlay Gradient - visible when image exists */}
          {data.imageUrl && (
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-black/20 via-transparent to-black/60" />
          )}
        </div>

        {/* Footer / Prompt - Visible when image exists or on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          {!data.imageUrl ? (
            <div className="relative w-full focus-within:outline-none focus-within:ring-0">
              {!data.prompt && (
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-2">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPlaceholder}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TextShimmer className="font-medium" spread={3} duration={2}>
                        {`Try "${PLACEHOLDERS[currentPlaceholder].prompt}"`}
                      </TextShimmer>
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
              <Textarea
                maxHeight={150}
                className="nodrag !border-0 text-sm font-medium text-white/90 !shadow-none !outline-none !ring-0 focus:!shadow-none focus:!outline-none focus:!ring-0 focus-visible:ring-0"
                value={data.prompt || ""}
                onChange={(e) => updateNodeData(id, { prompt: e.target.value })}
              />
            </div>
          ) : (
            <>
              {data.inputImageUrls && data.inputImageUrls.length > 0 && (
                <div className="scrollbar-hide mb-3 flex items-center gap-2 overflow-x-auto pb-1">
                  {data.inputImageUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative shrink-0 overflow-hidden rounded-xl border border-white/20 bg-black/20 shadow-sm backdrop-blur-sm transition-transform hover:scale-105"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Input reference ${index + 1}`}
                        className="size-16 object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              <p className="line-clamp-3 text-[15px] font-light leading-relaxed text-white/90 drop-shadow-sm">
                {data.prompt}
              </p>
            </>
          )}
        </div>

        <button
          className={`absolute bottom-3 right-3 flex size-8 items-center justify-center rounded-full bg-accent text-black shadow-lg transition-all hover:scale-110 hover:shadow-xl ${selected ? "opacity-100" : "opacity-0"}`}
          onClick={() => {
            console.log("Generate image with prompt:", data.prompt);
          }}
        >
          <ArrowUp size={18} strokeWidth={3} />
        </button>
      </NodeLayout>
    </>
  );
}
