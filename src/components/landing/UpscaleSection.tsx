import Image from "next/image";

import ImageMagnifyCard, { FocusRect } from "./ImageZoom";
import { MouseParallaxItem, MouseParallaxProvider } from "./MouseParallax";

const imageFocus1: FocusRect = {
  topPct: 28,
  leftPct: 32,
  widthPct: 12,
  heightPct: 12,
};
const imageFocus2: FocusRect = {
  topPct: 60,
  leftPct: 35,
  widthPct: 14,
  heightPct: 12,
};
const imageFocus3: FocusRect = {
  topPct: 48,
  leftPct: 48,
  widthPct: 14,
  heightPct: 12,
};
const imageFocus4: FocusRect = {
  topPct: 25,
  leftPct: 45,
  widthPct: 24,
  heightPct: 12,
};
const UpscaleSection = () => {
  return (
    <section className="relative mt-56">
      <MouseParallaxProvider className="relative flex h-[1500px] w-screen items-center justify-center px-4 py-16">
        <div
          className="animate-manga-lines pointer-events-none absolute inset-0 z-50 overflow-hidden opacity-60"
          style={{
            backgroundImage: "url(/images/landing/upscale/manga_lines.svg)",
            backgroundSize: "500px 500px",
            backgroundRepeat: "repeat",
            backgroundBlendMode: "overly",
            // backgroundPosition: "left top",
            // mixBlendMode: "overlay",
          }}
        />
        <MouseParallaxItem
          strength={5}
          className="absolute inset-0 z-10 mx-auto h-[1500px] w-[1000px]"
        >
          <Image
            alt="Abstract background"
            src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/upscale/upscale_BG.jpg"
            fill
            unoptimized
            className="rounded-[100px] object-cover"
          />
        </MouseParallaxItem>
        <MouseParallaxItem
          strength={25}
          className="absolute inset-0 z-20 flex size-full items-center justify-center"
        >
          <Image
            alt="Take control UI element"
            src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/upscale/upscale_FG.png"
            width={1200}
            height={1600}
            unoptimized
            className="h-auto"
          />
        </MouseParallaxItem>
        <p className="absolute left-0 top-12 z-20 ml-12 text-[80px] font-bold text-accent">
          PUSH PAST PIXELES
        </p>
        <p className="absolute bottom-0 right-36 z-50 ml-12 text-[100px] font-bold text-white">
          UPSCALE TO 4K
        </p>
        <div className="absolute inset-x-0 -bottom-20 z-10 h-[400px] bg-black/20 !backdrop-blur-sm [mask-image:linear-gradient(to_top,white,transparent)]" />
      </MouseParallaxProvider>
      <div className="mt-32 flex w-full items-end justify-between">
        <ImageMagnifyCard
          src="/images/landing/upscale/upscale3.jpg"
          focus={imageFocus1}
          scale={6}
          className="left-[110%]"
        />
        <ImageMagnifyCard
          src="/images/landing/upscale/upscale2.jpg"
          focus={imageFocus2}
          scale={6}
          className="bottom-0 right-[110%]"
        />
      </div>
      <p className="my-4 w-full text-center text-[40px] font-bold">
        Ultimate image enhancement and upscaler
      </p>
      <div className="mt-3 flex w-full items-start justify-between">
        <ImageMagnifyCard
          src="/images/landing/upscale/upscale4.jpg"
          mainSize={{ w: 500, h: 600 }}
          previewSize={{ w: 350, h: 260 }}
          focus={imageFocus3}
          scale={5}
          className="left-[110%]"
        />
        <ImageMagnifyCard
          src="/images/landing/upscale/upscale5.jpg"
          mainSize={{ w: 554, h: 810 }}
          previewSize={{ w: 400, h: 300 }}
          focus={imageFocus4}
          scale={3}
          className="bottom-1/4 right-[105%]"
        />
      </div>
      {/* <BlurEffect position="top" intensity={100}  className="z-10 absolute inset-x-0 -bottom-20 h-[400px] bg-gradient-to-b from-black/30 to-transparent"/> */}
      <div className="absolute inset-x-0 -bottom-2 z-50 h-[400px] bg-black/20 !backdrop-blur-sm [mask-image:linear-gradient(to_top,white,transparent)]" />
      <div className="absolute inset-x-0 -bottom-2 z-50 h-[400px] bg-black/20 !backdrop-blur-sm [mask-image:linear-gradient(to_top,white,transparent)]" />
      <div className="absolute inset-x-0 -bottom-2 z-50 h-[400px] bg-black/20 !backdrop-blur-sm [mask-image:linear-gradient(to_top,white,transparent)]" />
      <p className="absolute inset-x-0 bottom-2 z-50 px-56 text-center text-[40px]">
        Create <span className="text-accent">ultrarealistic</span> images with natural skin,
        lighting and camera
      </p>
    </section>
  );
};

export default UpscaleSection;
