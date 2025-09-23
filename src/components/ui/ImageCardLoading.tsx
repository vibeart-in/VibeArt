import React from "react";

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
  ratio = "16:9",
  width = 400,
  loadingText = "Loading...",
  subtitle = "Please wait while we process your request",
  variant = "cool",
}) => {
  const height = width / parseRatio(ratio);

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
      className="relative overflow-hidden rounded-3xl shadow-md border-2 border-white/10"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {/* Background Gradient Layer */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `${stripePattern}`,
          backgroundSize: "300% 200%",
          backgroundPosition: "50% 50%",
          filter: "blur(30px) opacity(90%) saturate(150%)",
        }}
      >
        <div
          className="absolute inset-0 animate-rainbow-flow mix-blend-difference"
          style={{
            backgroundImage: `${stripePattern}, ${rainbowPattern}`,
            backgroundSize: "200% 100%",
            backgroundAttachment: "fixed",
          }}
        />
      </div>

      {/* Content with Text Shimmer */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center items-center text-white text-center px-4">
        <div className="text-2xl font-semibold mb-2">
          <AITextLoading text={loadingText} />
        </div>
        {subtitle && (
          <div className="text-sm opacity-70 mb-6 animate-text-shimmer bg-gradient-to-r from-white/50 via-white to-white/50 bg-clip-text text-transparent">
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
          className="loader-letter inline-block opacity-80 leading-none"
          style={{ animationDelay: `${i * 0.06}s` }}
          aria-hidden
        >
          {ch}
        </span>
      ))}
    </div>
  );
};
