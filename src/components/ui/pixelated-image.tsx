"use client";

import React, { useEffect, useRef, useState } from "react";

interface PixelatedImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export function PixelatedImage({ src, className }: PixelatedImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeImage, setActiveImage] = useState<HTMLImageElement | null>(null);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const helperCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize helper canvas on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      helperCanvasRef.current = document.createElement("canvas");
    }
  }, []);

  // Load image when src changes
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = src;
    img.onload = () => {
      setActiveImage(img);
      startTimeRef.current = null; // Reset animation start time
    };
  }, [src]);

  // Animation Loop
  useEffect(() => {
    if (!activeImage || !canvasRef.current || !containerRef.current || !helperCanvasRef.current)
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const helperCanvas = helperCanvasRef.current;
    const helperCtx = helperCanvas.getContext("2d");

    if (!ctx || !helperCtx) return;

    // Handle high-DPI displays
    const dpr = window.devicePixelRatio || 1;

    // Resize handling
    const updateSize = () => {
      const { width, height } = containerRef.current!.getBoundingClientRect();
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        // style width/height match parent
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);
      }
      return { width, height }; // logical size
    };

    const animate = (time: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = time;
      }

      const duration = 1500; // Animation duration in ms
      const elapsed = time - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease out

      const { width, height } = updateSize();

      // Clear main canvas
      ctx.clearRect(0, 0, width, height);

      // Animation parameters
      const startPixelSize = 40;
      const endPixelSize = 0.5; // < 1 means essentially full res

      // Interpolate pixel size
      const currentPixelSize = startPixelSize - (startPixelSize - endPixelSize) * ease;

      // Calculate aspect-ratio "cover" logic
      const scale = Math.max(width / activeImage.width, height / activeImage.height);
      const drawW = activeImage.width * scale;
      const drawH = activeImage.height * scale;
      const offsetX = (width - drawW) / 2;
      const offsetY = (height - drawH) / 2;

      // Disable smoothing for pixelated look
      ctx.imageSmoothingEnabled = false;
      helperCtx.imageSmoothingEnabled = false;

      if (currentPixelSize < 1 && progress === 1) {
        // Draw standard full resolution image at end
        ctx.drawImage(
          activeImage,
          0,
          0,
          activeImage.width,
          activeImage.height,
          offsetX,
          offsetY,
          drawW,
          drawH,
        );
      } else {
        // Pixelation effect using downscaling
        // Effective resolution dimensions
        // We must clamp pixelSize to at least 1 to avoid div by zero or invalid size
        const effectivePixelSize = Math.max(currentPixelSize, 1);

        const wScaled = Math.max(Math.floor(drawW / effectivePixelSize), 1);
        const hScaled = Math.max(Math.floor(drawH / effectivePixelSize), 1);

        // Resize helper canvas to small size
        helperCanvas.width = wScaled;
        helperCanvas.height = hScaled;

        // 1. Draw source image squashed into helper
        helperCtx.drawImage(activeImage, 0, 0, wScaled, hScaled);

        // 2. Draw helper image stretched back onto main canvas
        ctx.drawImage(helperCanvas, 0, 0, wScaled, hScaled, offsetX, offsetY, drawW, drawH);
      }

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [activeImage]); // Restart animation when activeImage updates

  return (
    <div ref={containerRef} className={`relative size-full overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="block size-full" />
    </div>
  );
}
