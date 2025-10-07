"use client";

import { useMotionValue } from "motion/react";
import { useRef, useEffect, useState, ReactElement } from "react";
import { ImageCard3D } from "./3dImageCard"; // Adjust path if necessary
import useEmblaCarousel from "embla-carousel-react";
import { CustomCursor } from "./CustomCursor";
import { ImageCard3DType } from "@/src/types/BaseType";
import { cn } from "@/src/lib/utils";

interface CardScrollProps {
  cardData: ImageCard3DType[];
  scrollHeight?: string;
}

const CardScroll = ({
  cardData,
  scrollHeight = "h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px]",
}: CardScrollProps): ReactElement => {
  const [isCursorVisible, setIsCursorVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    containScroll: false,
    dragFree: true,
    watchDrag: true,
    skipSnaps: false,
    inViewThreshold: 0.7,
  });

  const scrollVelocity = useMotionValue(0);

  const isDragging = useRef(false);

  const handleMouseEnter = () => {
    // Only show custom cursor on desktop
    if (window.innerWidth >= 768) {
      setIsCursorVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsCursorVisible(false);
  };
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    let lastPosition = emblaApi.scrollProgress();
    let lastTimestamp = performance.now();

    const updateVelocity = () => {
      const currentPosition = emblaApi.scrollProgress();
      const currentTimestamp = performance.now();
      const timeDelta = currentTimestamp - lastTimestamp;

      if (timeDelta > 0) {
        const positionDelta = currentPosition - lastPosition;
        const velocity = (positionDelta / timeDelta) * 100000;
        scrollVelocity.set(velocity);
      }

      lastPosition = currentPosition;
      lastTimestamp = currentTimestamp;
    };

    const decayVelocity = () => {
      if (isDragging.current) return;

      scrollVelocity.set(scrollVelocity.get() * 0.95);
      if (Math.abs(scrollVelocity.get()) > 0.01) {
        requestAnimationFrame(decayVelocity);
      } else {
        scrollVelocity.set(0);
      }
    };

    const onPointerDown = () => {
      isDragging.current = true;
      scrollVelocity.stop();
    };

    const onPointerUp = () => {
      isDragging.current = false;
      requestAnimationFrame(decayVelocity);
    };

    const onSettle = () => {
      scrollVelocity.set(0);
    };

    emblaApi.on("scroll", updateVelocity);
    emblaApi.on("settle", onSettle);
    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("pointerUp", onPointerUp);

    // Cleanup function
    return () => {
      emblaApi.off("scroll", updateVelocity);
      emblaApi.off("settle", onSettle);
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("pointerUp", onPointerUp);
    };
  }, [emblaApi, scrollVelocity]);

  return (
    <div
      className={cn(
        "mometum-scroll smooth-scroll-x relative w-screen overflow-x-auto md:cursor-none",
        scrollHeight,
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {mounted && <CustomCursor isVisible={isCursorVisible} />}

      {/* Gradient overlays - responsive widths */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-black/30 to-transparent md:w-32" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-black/30 to-transparent md:w-32" />

      <div className="embla h-full w-full" ref={emblaRef}>
        <div className="embla__container h-full items-center">
          {cardData.map((card, index) => (
            <div
              key={`${card.cardText}-${index}`}
              className="embla__slide px-4 sm:px-8 md:px-12 lg:px-20"
            >
              <ImageCard3D
                width={card?.width}
                height={card?.height}
                topImageUrl={card.topImageUrl}
                bottomImageUrl={card.bottomImageUrl}
                cardText={card.cardText}
                topImageScale={card.topImageScale}
                scrollVelocity={scrollVelocity}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardScroll;
