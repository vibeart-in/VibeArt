"use client";
import Image from "next/image";
import React from "react";
import { TexturedImage } from "./TexturedImage";
import PixelCensor from "./PixelCensor";
import { MouseParallaxItem, MouseParallaxProvider } from "./MouseParallax";

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
    <section className="mt-12">
      <MouseParallaxProvider className="relative w-screen overflow-hidden px-2 py-16 sm:px-4 sm:py-24 lg:py-32">
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
            borderRadius="200px"
            baseFrequency={0.16}
            numOctaves={2}
            scale={100}
            seed={2}
            className="w-full"
          />
        </MouseParallaxItem>

        {/* Static text elements */}
        <p className="z-1 absolute left-0 top-20 ml-2 font-gothic text-[20px] font-bold text-accent/80 [text-shadow:_2px_2px_4px_rgba(0,0,0,0.3)] sm:top-32 sm:ml-4 sm:text-[30px] lg:top-44 lg:ml-8 lg:text-[70px]">
          PRIVATE BY DESIGN.
        </p>
        <p className="absolute right-0 top-32 z-20 mr-2 font-gothic text-[20px] font-bold text-accent/80 [text-shadow:_2px_2px_4px_rgba(0,0,0,0.3)] sm:top-44 sm:mr-4 sm:text-[30px] lg:top-44 lg:mr-8 lg:text-[70px]">
          ENCRYPTED BY DEFAULT.
        </p>
        <p className="absolute left-0 top-44 z-20 ml-2 font-gothic text-[40px] font-bold text-black/60 sm:top-56 sm:ml-4 sm:text-[60px] lg:top-1/3 lg:ml-8 lg:text-[140px]">
          PRIVACY
        </p>
        <p className="absolute right-0 top-56 z-20 mr-2 font-gothic text-[40px] font-bold text-black/60 sm:top-72 sm:mr-4 sm:text-[60px] lg:top-1/3 lg:mr-8 lg:text-[140px]">
          MATTERS
        </p>

        {/* 3. Wrap the top image with a ParallaxItem with a different strength */}
        <MouseParallaxItem strength={30} className="absolute -top-24 left-0 w-full rounded-[200px]">
          <Image
            src={
              "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/privacy/Privacy_top.webp"
            }
            quality={100}
            width={800}
            height={800}
            unoptimized
            alt="Privacy"
            className="h-auto w-full rounded-[200px]"
          />
        </MouseParallaxItem>

        {/* Other static elements */}
        <div className="absolute inset-x-0 bottom-0 z-30 h-[400px] bg-black/20 text-white !backdrop-blur-sm [mask-image:linear-gradient(to_top,white,transparent)]" />
        <p className="absolute inset-x-0 bottom-16 z-40 px-4 text-center text-[16px] sm:bottom-24 sm:px-16 sm:text-[24px] lg:bottom-32 lg:px-56 lg:text-[35px]">
          We respect your <span className="text-accent">privacy</span>— no prompts, images, or
          metadata are safe and encrypted. Everything is processed in real-time with full
          encryption.
        </p>

        <div className="absolute top-0 z-20 flex h-full w-full items-center justify-center">
          <PixelCensor matrix={matrix} squareSize={50} className="mb-20 sm:mb-32 lg:mb-52" />
        </div>
      </MouseParallaxProvider>
    </section>
  );
};

export default PrivacySection;
