"use client";
import { motion } from "motion/react";
import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";

export interface ImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  title?: string;
  subtext?: string;
}

// Renamed to GalleryImage and simplified its props
interface GalleryImageProps {
  image: ImageProps;
  galleryHeight: number;
  index: number;
}

const GalleryImage: React.FC<GalleryImageProps> = ({ image, galleryHeight, index }) => {
  const isVideo = image.src.endsWith(".mp4") || image.src.endsWith(".webm");

  return (
    <motion.div
      key={index}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="group flex cursor-pointer flex-col gap-3"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { type: "spring", stiffness: 100, damping: 15 },
        },
      }}
    >
      <motion.div
        className="flex-shrink-0 overflow-hidden rounded-[26px] border-2 border-white/30 bg-neutral-800 shadow-lg"
        style={{
          height: `${galleryHeight}px`,
          aspectRatio: image.width / image.height,
        }}
        variants={{
          hover: {
            scale: 1.05,
            filter: "brightness(1.15)",
            boxShadow: "0 0 25px rgba(255,255,255,0.15)",
            transition: { type: "spring", stiffness: 300, damping: 20 },
          },
        }}
      >
        {isVideo ? (
          <video
            src={image.src}
            width={image.width}
            height={image.height}
            className="pointer-events-none size-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className="pointer-events-none size-full object-cover"
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
};

interface ScrollerProps {
  images: ImageProps[];
  galleryHeight?: number;
}

const HorizontalImageScroller: React.FC<ScrollerProps> = ({ images, galleryHeight = 350 }) => {
  const [scrollConstraint, setScrollConstraint] = useState(0);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const draggableContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const calculateConstraint = () => {
      if (viewportRef.current && draggableContainerRef.current) {
        const viewportWidth = viewportRef.current.offsetWidth;
        const draggableWidth = draggableContainerRef.current.scrollWidth;
        const newConstraint = Math.min(0, viewportWidth - draggableWidth - 20); // Add padding
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

  // Variants for the container to orchestrate the staggered animation
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
      {/* <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-black to-transparent" /> */}
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
