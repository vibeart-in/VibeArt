"use client";
import { IconExternalLink } from "@tabler/icons-react";
import { motion, useMotionValue, Variants } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import React, { useRef, useState, useEffect } from "react";

export interface ImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  title?: string;
  subtext?: string;
  link?: string;
}

// Renamed to GalleryImage and simplified its props
interface GalleryImageProps {
  image: ImageProps;
  galleryHeight: number;
  index: number;
}

const indicatorVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 0 },
  hover: {
    opacity: 1,
    scale: 1,
    y: -6,
    transition: { type: "spring", stiffness: 500, damping: 28 },
  },
};

const GalleryImage: React.FC<GalleryImageProps> = ({ image, galleryHeight, index }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const isVideo = image.src.endsWith(".mp4") || image.src.endsWith(".webm");
  const hasLink = Boolean(image.link);
  const isExternal = hasLink && /^(https?:)?\/\//.test(image.link || "");

  // The clickable card content (media + text)
  const card = (
    <motion.div
      key={index}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="group relative flex cursor-pointer flex-col gap-3"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { type: "spring", stiffness: 100, damping: 15 },
        },
      }}
      aria-label={image.title ? `${image.title} — ${image.subtext || ""}` : image.alt}
    >
      {/* Sleek hover-only indicator (motion child picks up parent's "hover") */}
      {hasLink && (
        <motion.span
          className="pointer-events-none absolute right-3 top-3 z-30 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white shadow-md backdrop-blur-sm"
          variants={indicatorVariants}
          aria-hidden={!hasLink}
        >
          <IconExternalLink size={15} />
          <span className="hidden sm:inline">Create Now</span>
        </motion.span>
      )}

      <motion.div
        className="relative flex-shrink-0 overflow-hidden rounded-[26px] border-2 border-white/30 bg-neutral-800 shadow-lg"
        style={{
          height: `${galleryHeight}px`,
          aspectRatio: image.width / image.height,
        }}
        variants={{
          hover: {
            filter: "brightness(1.15)",
            boxShadow: "0 0 25px rgba(255,255,255,0.12)",
            transition: { type: "spring", stiffness: 300, damping: 20 },
          },
        }}
      >
        {isVideo ? (
          mounted ? (
            <video
              src={image.src}
              width={image.width}
              height={image.height}
              className="pointer-events-none size-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              // onDragStart={(e) => e.preventDefault()}
            />
          ) : (
            // Server render / initial client render: an inert placeholder that matches size
            <div
              aria-hidden
              className="flex size-full items-center justify-center bg-neutral-700"
              style={{ width: "100%", height: "100%" }}
            >
              {/* optional lightweight poster image or icon */}
            </div>
          )
        ) : (
          // image branch unchanged
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className="size-full object-cover"
            priority={index < 3}
            onDragStart={(e) => e.preventDefault()}
          />
        )}
      </motion.div>

      {/* Text container */}
      <motion.div
        className=""
        variants={{
          hover: {
            y: -4,
            color: "var(--accent)",
            transition: { type: "spring", stiffness: 300, damping: 18 },
          },
        }}
      >
        <motion.p
          className="font-satoshi text-lg font-semibold text-white transition-colors duration-300 group-hover:text-accent"
          variants={{
            hover: {
              scale: 1.05,
              textShadow: "0 0 10px var(--accent)",
            },
          }}
        >
          {image.title}
        </motion.p>
        <motion.p
          className="font-satoshi text-sm text-neutral-400 transition-colors duration-300 group-hover:text-accent/80"
          variants={{
            hover: {
              opacity: 1,
              y: -2,
            },
          }}
        >
          {image.subtext}
        </motion.p>
      </motion.div>
    </motion.div>
  );

  // Wrap with Link (internal) or anchor (external) when link exists, otherwise render plain card
  if (!hasLink) return card;

  return isExternal ? (
    <a
      href={image.link}
      target="_blank"
      rel="noopener noreferrer"
      title={image.title || "Open"}
      className="no-underline"
      aria-label={`Open external link to ${image.title || image.link}`}
      onDragStart={(e) => e.preventDefault()}
    >
      {card}
    </a>
  ) : (
    <Link
      href={image.link || "#"}
      title={image.title || "Open"}
      className="no-underline"
      aria-label={`Go to ${image.title || image.link}`}
      onDragStart={(e) => e.preventDefault()}
    >
      {card}
    </Link>
  );
};

interface ScrollerProps {
  images: ImageProps[];
  galleryHeight?: number;
  scrollSpeed?: number;
}

const HorizontalImageScroller: React.FC<ScrollerProps> = ({
  images,
  galleryHeight = 350,
  scrollSpeed = 1,
}) => {
  const [scrollConstraint, setScrollConstraint] = useState(0);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const draggableContainerRef = useRef<HTMLDivElement | null>(null);

  const x = useMotionValue(0);

  useEffect(() => {
    const calculateConstraint = () => {
      if (viewportRef.current && draggableContainerRef.current) {
        const viewportWidth = viewportRef.current.offsetWidth;
        const draggableWidth = draggableContainerRef.current.scrollWidth;
        const newConstraint = Math.min(0, viewportWidth - draggableWidth - 20);
        setScrollConstraint(newConstraint);
      }
    };

    const timer = setTimeout(calculateConstraint, 100);
    window.addEventListener("resize", calculateConstraint);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculateConstraint);
    };
  }, [images]);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;

    const handleWheel = (e: WheelEvent) => {
      // Only act if the shift key is held down
      if (e.shiftKey) {
        // Prevent the default vertical scroll
        e.preventDefault();

        const currentX = x.get();
        // The deltaY value is used because a standard mouse wheel only has a Y-axis.
        // We multiply by scrollSpeed to allow for sensitivity adjustment.
        let newX = currentX - e.deltaY * scrollSpeed;

        newX = Math.max(scrollConstraint, Math.min(0, newX));
        x.set(newX);
      }
    };

    element.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      element.removeEventListener("wheel", handleWheel);
    };
  }, [x, scrollConstraint, scrollSpeed]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      ref={viewportRef}
      className="relative z-20 w-full cursor-grab overflow-hidden py-8 active:cursor-grabbing"
    >
      <motion.div
        ref={draggableContainerRef}
        className="inline-flex gap-8 px-5"
        drag="x"
        dragConstraints={{
          right: 0,
          left: scrollConstraint,
        }}
        dragTransition={{ bounceStiffness: 400, bounceDamping: 30 }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ x }}
      >
        {images.map((image, index) => (
          <GalleryImage key={index} image={image} galleryHeight={galleryHeight} index={index} />
        ))}
      </motion.div>
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-black to-transparent" />
    </motion.div>
  );
};

export default HorizontalImageScroller;
