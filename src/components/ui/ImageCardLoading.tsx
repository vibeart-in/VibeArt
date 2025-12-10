import React from "react";
import { useMediaQuery } from "@/src/hooks/use-media-query";

interface ImageCardLoadingProps {
  ratio?: string | number;
  width?: number;
  loadingText?: string;
  subtitle?: string;
  showDots?: boolean;
  variant?: "default" | "warm" | "cool" | "neon";
  jobStatus?: "pending" | "processing";
}

function parseRatio(ratio: string | number): number {
  if (typeof ratio === "number") return ratio;
  const [w, h] = ratio.split(":").map(Number);
  return h === 0 ? 1 : w / h;
}

export const ImageCardLoading: React.FC<ImageCardLoadingProps> = ({
  ratio = "1:1",
  width = 400,
  loadingText = "Generating...",
  subtitle = "Please chill, while we create your image",
  variant = "cool",
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const effectiveWidth = isMobile ? 200 : width;
  const height = effectiveWidth / parseRatio(ratio);

  const rainbowVariants = {
    default:
      "repeating-linear-gradient(100deg, #dbeafe 10%, #f0abfc 15%, #bae6fd 20%, #a5f3fc 25%, #dbeafe 30%)",
    warm: "repeating-linear-gradient(100deg, #ffe4e6 10%, #fecaca 15%, #fcd34d 20%, #fdba74 25%, #fecaca 30%)",
    cool: "repeating-linear-gradient(100deg, #c7d2fe 10%, #a5b4fc 15%, #d8b4fe 20%, #f0abfc 25%, #a5f3fc 30%)",
    neon: "repeating-linear-gradient(100deg, #ff80ab 10%, #00ffc3 15%, #80d0ff 20%, #a58eff 25%, #ffc078 30%)",
  };

  const stripePattern =
    "repeating-linear-gradient(100deg, #000 0%, #000 7%, transparent 10%, transparent 12%, #000 16%)";
  const rainbowPattern = rainbowVariants[variant] || rainbowVariants.default;

  return (
    <div
      className="relative overflow-hidden rounded-3xl border-2 border-white/10 shadow-md"
      style={{
        width: `${effectiveWidth}px`,
        height: `${height}px`,
      }}
    >
      {/* Background Gradient Layer */}
      <div
        className="absolute inset-0 size-full"
        style={{
          backgroundImage: `${stripePattern}`,
          backgroundSize: "300% 200%",
          backgroundPosition: "50% 50%",
          filter: "blur(30px) opacity(90%) saturate(150%)",
        }}
      >
        <div
          className="animate-rainbow-flow absolute inset-0 mix-blend-difference"
          style={{
            backgroundImage: `${stripePattern}, ${rainbowPattern}`,
            backgroundSize: "200% 100%",
            backgroundAttachment: "fixed",
          }}
        />
      </div>

      {/* Content with Text Shimmer */}
      <div className="relative z-10 flex size-full flex-col items-center justify-center px-4 text-center text-white">
        <div className="mb-2 text-2xl font-semibold">
          <AITextLoading text={loadingText} />
        </div>
        {subtitle && (
          <div className="animate-text-shimmer mb-6 bg-gradient-to-r from-white/50 via-white to-white/50 bg-clip-text text-sm text-transparent opacity-70">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

export const AITextLoading: React.FC<{ className?: string; text?: string }> = ({
  text = "Processing",
}) => {
  const letters = Array.from(text);
  return (
    <div className="flex gap-0 font-semibold tracking-wide">
      {letters.map((ch, i) => (
        <span
          key={i}
          className="loader-letter inline-block leading-none opacity-80"
          style={{ animationDelay: `${i * 0.06}s` }}
          aria-hidden
        >
          {ch}
        </span>
      ))}
    </div>
  );
};
