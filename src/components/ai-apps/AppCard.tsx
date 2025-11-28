"use client";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/src/lib/utils";

const AppCard = ({
  id,
  previewUrl,
  appName,
  compact,
}: {
  id: string;
  previewUrl: string;
  appName: string;
  compact?: boolean;
}) => {
  const isVideo = previewUrl.endsWith(".mp4");

  // Rounded corners adapt to compact
  const roundedClass = compact
    ? "rounded-lg sm:rounded-3xl"
    : "rounded-2xl sm:rounded-3xl lg:rounded-[40px]";

  // Responsive text size - smaller for mobile
  const textSizeClass = compact
    ? "text-xs sm:text-base" // Reduced from text-sm on mobile
    : "text-sm sm:text-xl md:text-2xl lg:text-3xl"; // Reduced from text-lg on mobile

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      className={cn("relative z-20 flex-shrink-0 cursor-pointer overflow-hidden", roundedClass)}
      variants={{
        rest: { scale: 1 },
        hover: { scale: 0.99 },
      }}
      transition={{ type: "spring", stiffness: 250, damping: 22 }}
    >
      <Link href={`/ai-apps/${id}`}>
        {/* Media (Image or Video) */}
        <motion.div
          className="size-full"
          variants={{
            rest: { scale: 1 },
            hover: { scale: 0.98 },
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {isVideo ? (
            <video
              src={previewUrl}
              className={cn("h-full w-full object-cover", roundedClass)}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <Image
              className={cn("h-full w-full object-cover", roundedClass)}
              src={previewUrl}
              alt={appName}
              width={300}
              height={300}
            />
          )}
        </motion.div>

        {/* Hover overlay - hidden on mobile, shown on hover for desktop */}
        <motion.div
          className={cn(
            "absolute inset-0 bg-black/20 shadow-[inset_0_4px_38px_rgba(0,0,0,0.8)]",
            roundedClass,
          )}
          variants={{
            rest: { opacity: 0 },
            hover: { opacity: 1 },
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />

        {/* App name - bottom positioned with overlay on mobile */}
        <div className="absolute inset-x-0 bottom-0 md:hidden">
          {/* Transparent black overlay for mobile */}
          <div className="bg-black/60 px-3 py-2 backdrop-blur-[1px]">
            <p className={cn("line-clamp-2 text-center font-semibold text-white", textSizeClass)}>
              {appName}
            </p>
          </div>
        </div>

        {/* App name - only visible on hover for desktop */}
        <motion.div
          className="absolute inset-0 hidden items-center justify-center md:flex"
          variants={{
            rest: { opacity: 0, y: 20 },
            hover: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <p
            className={cn(
              "px-2 py-1 text-center font-bold text-white drop-shadow-lg",
              textSizeClass,
            )}
          >
            {appName}
          </p>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default AppCard;
