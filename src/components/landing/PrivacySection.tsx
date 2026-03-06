"use client";
import Image from "next/image";
import React from "react";

import { MouseParallaxItem, MouseParallaxProvider } from "./MouseParallax";
import PixelCensor from "./PixelCensor";
import { TexturedImage } from "./TexturedImage";

const matrix = [
  [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 0, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 0, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
];

const PrivacySection = () => {
  return (
    // Changed to `w-full` instead of `w-screen` to prevent horizontal scrolling natively
    <section className="mt-12 w-full overflow-hidden">
      <MouseParallaxProvider className="relative w-full overflow-hidden px-2 py-16 sm:px-4 sm:py-24 lg:py-32">
        <div
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden opacity-60"
          style={{
            backgroundImage: "url(/images/landing/grain.png)",
            backgroundSize: "100px 100px",
            backgroundRepeat: "repeat",
            backgroundBlendMode: "overlay",
            backgroundPosition: "left top",
          }}
        />

        {/* 2. Wrap the bottom image with a ParallaxItem */}
        <MouseParallaxItem strength={15}>
          <TexturedImage
            src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/privacy/privacy_bottom.webp"
            // clamp() provides a fluid radius on mobile, but stops exactly at 200px for desktop
            borderRadius="clamp(24px, 20vw, 200px)"
            baseFrequency={0.16}
            numOctaves={2}
            scale={100}
            seed={2}
            className="h-auto w-full object-cover"
          />
        </MouseParallaxItem>

        {/* Static text elements */}
        {/* Mobile uses percentages for positioning; lg: breakpoints perfectly match your original code */}
        <p className="text-accent/80 [text-shadow:_2px_2px_4px_rgba(0,0,0,0.3)] absolute left-0 top-[12%] ml-2 font-satoshi text-[14px] font-bold sm:top-[15%] sm:ml-4 sm:text-[30px] lg:top-44 lg:ml-8 lg:text-[70px]">
          PRIVATE BY DESIGN.
        </p>
        <p className="text-accent/80 [text-shadow:_2px_2px_4px_rgba(0,0,0,0.3)] absolute right-0 top-[22%] z-20 mr-2 font-satoshi text-[14px] font-bold sm:top-[25%] sm:mr-4 sm:text-[30px] lg:top-44 lg:mr-8 lg:text-[70px]">
          ENCRYPTED BY DEFAULT.
        </p>
        <p className="absolute left-0 top-[40%] z-20 ml-2 font-satoshi text-[32px] font-bold text-black/60 sm:top-[40%] sm:ml-4 sm:text-[60px] lg:top-1/3 lg:ml-8 lg:text-[140px]">
          PRIVACY
        </p>
        <p className="absolute right-0 top-[55%] z-20 mr-2 font-satoshi text-[32px] font-bold text-black/60 sm:top-[55%] sm:mr-4 sm:text-[60px] lg:top-1/3 lg:mr-8 lg:text-[140px]">
          MATTERS
        </p>

        {/* 3. Wrap the top image with a ParallaxItem with a different strength */}
        <MouseParallaxItem
          strength={30}
          className="absolute -top-6 left-0 w-full rounded-[24px] sm:-top-16 sm:rounded-[60px] lg:-top-24 lg:rounded-[200px]"
        >
          <Image
            src={
              "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/privacy/Privacy_top.webp"
            }
            quality={100}
            width={800}
            height={800}
            unoptimized
            alt="Privacy"
            className="h-auto w-full rounded-[24px] object-cover sm:rounded-[60px] lg:rounded-[200px]"
          />
        </MouseParallaxItem>

        {/* Other static elements */}
        <div className="absolute inset-x-0 bottom-0 z-30 h-[60%] bg-black/20 text-white !backdrop-blur-sm [mask-image:linear-gradient(to_top,white,transparent)] lg:h-[400px]" />

        <p className="absolute inset-x-0 bottom-6 z-40 px-4 text-center text-[14px] sm:bottom-24 sm:px-16 sm:text-[24px] lg:bottom-32 lg:px-56 lg:text-[35px]">
          We respect your <span className="text-accent">privacy</span>— no prompts, images, or
          metadata are safe and encrypted. Everything is processed in real-time with full
          encryption.
        </p>

        {/* PixelCensor is wrapped in a scaling div for smaller screens to prevent blowout, but returns to normal 1:1 scale on desktop */}
        <div className="pointer-events-none absolute top-0 z-20 flex size-full items-center justify-center lg:pointer-events-auto">
          <div className="origin-center scale-[0.55] sm:scale-75 lg:scale-100">
            <PixelCensor matrix={matrix} squareSize={50} className="mb-20 sm:mb-32 lg:mb-52" />
          </div>
        </div>
      </MouseParallaxProvider>
    </section>
  );
};

export default PrivacySection;
