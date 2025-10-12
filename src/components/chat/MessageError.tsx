"use client";
import Image from "next/image";
import { useState } from "react";

type ErrorBoxProps = {
  src: string;
  alt?: string;
  error?: string | null;
  width?: number;
  height?: number;
};

export default function ErrorBox({
  src,
  alt = "Image",
  error = "Generation failed: Unknown error.",
  width = 500,
  height = 500,
}: ErrorBoxProps) {
  const [hasError, setHasError] = useState(Boolean(error));

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-neutral-900"
      style={{ width, height }}
      role="alert"
      aria-live="polite"
    >
      {/* Background image */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${width}px`}
        className={`object-cover transition-all duration-300 ${
          hasError ? "scale-105 opacity-70 blur-md" : ""
        }`}
        onError={() => setHasError(true)}
        priority
      />

      {/* Error overlay */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="mx-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 shadow-lg backdrop-blur-md">
            <div className="flex items-start gap-3 text-red-200">
              <svg
                className="mt-0.5 size-5 text-red-300"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.5a.75.75 0 011.5 0v5a.75.75 0 01-1.5 0v-5zm.75 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="max-w-[85%]">
                <p className="font-medium text-red-100">Generation failed</p>
                <p className="break-words text-sm text-red-200/90">{error}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                className="w-full rounded-lg bg-red-500/20 px-3 py-1.5 text-sm text-red-100 hover:bg-red-500/30"
                onClick={() => setHasError(false)}
              >
                Dismiss
              </button>
              {/* <button
                className="rounded-md bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
                onClick={() => location.reload()}
              >
                Retry
              </button> */}
            </div>
          </div>
        </div>
      )}

      {/* Gradient scrim for readability even if no error */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
    </div>
  );
}
