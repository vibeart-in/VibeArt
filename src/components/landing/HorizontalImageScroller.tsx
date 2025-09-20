"use client"
import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';

export interface ImageProps {
    src: string;
    alt: string;
    width: number;
    height: number;
}

// Renamed to GalleryImage and simplified its props
interface GalleryImageProps {
  image: ImageProps;
  galleryHeight: number;
  index: number;
}

const GalleryImage: React.FC<GalleryImageProps> = ({ image, galleryHeight, index }) => {
  return (
    // This component still handles the individual item's entry and hover animations
    <motion.div
      key={index}
      className="flex-shrink-0 overflow-hidden bg-neutral-800 rounded-[26px] shadow-lg border-2 border-white/30"
      style={{
        height: `${galleryHeight}px`,
        aspectRatio: image.width / image.height,
      }}
      // Staggered entry animation variant
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } },
      }}
      // Hover effect for scaling and brightening
      whileHover={{
        scale: 1.05,
        filter: 'brightness(1.1)',
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }}
    >
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        // If your images "contain perfectly", you might want to use 'object-contain'
        className="w-full h-full object-cover pointer-events-none"
        priority={index < 3}
        onDragStart={(e) => e.preventDefault()}
      />
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
    window.addEventListener('resize', calculateConstraint);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateConstraint);
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
      className="w-full overflow-hidden cursor-grab active:cursor-grabbing relative py-8 z-20"
    >
      {/* Left Gradient Fade */}
      <div className="absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      
      <motion.div
        ref={draggableContainerRef}
        className="inline-flex gap-8 px-5"
        drag="x"
        dragConstraints={{
          right: 0,
          left: scrollConstraint,
        }}
        dragTransition={{ bounceStiffness: 400, bounceDamping: 30 }}
        // The container orchestrates the animation for its children
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {images.map((image, index) => (
          // Use the simplified GalleryImage component
          <GalleryImage
            key={index}
            image={image}
            galleryHeight={galleryHeight}
            index={index}
          />
        ))}
      </motion.div>
      
      {/* Right Gradient Fade */}
      <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
    </motion.div>
  );
};

export default HorizontalImageScroller;