import Image from "next/image";
import Link from "next/link";

import HorizontalImageScroller from "./HorizontalImageScroller";
import { MouseParallaxItem, MouseParallaxProvider } from "./MouseParallax";

const sampleImages = [
  {
    src: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/a237fca1-59c1-4615-acfc-2d76a419eb23/original=true,quality=90/ComfyUI_00002_mnkhu_1755432615.jpeg",
    alt: "A desert landscape with a person standing on a rock formation",
    width: 1600,
    height: 1067,
  },
  {
    src: "/images/landing/footer/scroll10.png",
    alt: "A portrait of a woman with intricate face paint",
    width: 1024,
    height: 1280,
  },
  {
    src: "/images/landing/footer/scroll11.png",
    alt: "A person snorkeling in crystal clear water",
    width: 1024,
    height: 1280,
  },
  {
    src: "/images/landing/footer/scroll1.png",
    alt: "A snow-covered mountain range under a cloudy sky",
    width: 1792,
    height: 2304,
  },
  {
    src: "/images/landing/footer/scroll3.jpg",
    alt: "Close-up of a colorful bird with a vibrant beak",
    width: 1152,
    height: 2048,
  },
  {
    src: "/images/landing/footer/scroll5.png",
    alt: "An underwater shot of a sea turtle swimming",
    width: 1664,
    height: 2432,
  },
  {
    src: "/images/landing/footer/scroll7.png",
    alt: "An underwater shot of a sea turtle swimming",
    width: 1024,
    height: 1280,
  },
  {
    src: "/images/landing/footer/scroll9.png",
    alt: "An underwater shot of a sea turtle swimming",
    width: 1024,
    height: 1280,
  },
  {
    src: "/images/landing/footer/scroll6.png",
    alt: "An underwater shot of a sea turtle swimming",
    width: 1024,
    height: 1280,
  },
  {
    src: "/images/landing/footer/scroll2.jpg",
    alt: "An underwater shot of a sea turtle swimming",
    width: 2048,
    height: 2048,
  },
];

const EndSection = () => {
  return (
    <section className="">
      <MouseParallaxProvider className="relative flex h-[1500px] w-screen items-center justify-center px-4 py-16">
        <MouseParallaxItem
          strength={5}
          className="absolute inset-0 -top-32 z-10 mx-auto ml-32 h-[1500px] w-[1000px]"
        >
          <Image
            alt="Abstract background"
            src="/images/landing/footer/footerLarge.png"
            fill
            unoptimized
            className="rounded-[100px] object-cover"
          />
        </MouseParallaxItem>
        <MouseParallaxItem
          strength={25}
          className="absolute inset-0 flex size-full items-center justify-center"
        >
          <p className="absolute left-0 top-44 z-50 ml-12 text-[100px] font-bold text-accent">
            <span>GENERATE</span> <span className="z-10">WITH</span>
          </p>
          <p className="absolute bottom-1/2 right-36 pb-4 text-[100px] font-bold text-white">
            <Link
              href="#"
              className="relative mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black"
            >
              <Image src="/images/newlogo.png" alt="logo" width={90} height={90} />
              <p className="text-[120px] font-bold text-white">
                VibeArt<span className="text-accent">.</span>in
              </p>
            </Link>
          </p>
        </MouseParallaxItem>
      </MouseParallaxProvider>
      <p className="ml-6 text-2xl font-bold">Explore Now:</p>
      <HorizontalImageScroller images={sampleImages} galleryHeight={350} />
    </section>
  );
};

export default EndSection;
