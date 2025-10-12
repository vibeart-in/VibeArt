import { ArrowRight } from "lucide-react";
import Image from "next/image";

import { ImageCard3DType } from "@/src/types/BaseType";

import { ImageCard3D } from "./3dImageCard";
import CardScroll from "./CardScroll";
import GlassPaneBG from "./GlassPaneBG";
import { GradientComponent } from "./Gradient";
import { MouseParallaxItem, MouseParallaxProvider } from "./MouseParallax";

const blue = {
  primary: "#4460C5",
  secondary: "#6F74AC",
  accent1: "#D5FDB9",
  accent2: "#E4F9FF",
  accent3: "#5367CE",
  highlight1: "#5B82E1",
  highlight2: "#5165CC",
};

const cardData1: ImageCard3DType[] = [
  {
    topImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/control/control_girl_top.png",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/control/control_girl.jpg",
    cardText: "Anime",
    topImageScale: 1.2,
    width: 350,
    height: 450,
  },
  {
    topImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/control/control_girl2_top.png",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/control/control_girl2.jpg",
    cardText: "Gothic",
    topImageScale: 1.2,
    width: 350,
    height: 450,
  },
  {
    topImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/control/control_girl3_top.png",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/control/control_girl3.jpg",
    cardText: "Dark",
    topImageScale: 1.1,
    width: 350,
    height: 450,
  },
  {
    topImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/control/control_girl4_top.png",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/control/control_girl4.jpg",
    cardText: "Kawaii",
    topImageScale: 1.1,
    width: 350,
    height: 450,
  },
];
const cardData2: ImageCard3DType[] = [
  {
    topImageUrl: "",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/control/street_girl1.jpg",
    cardText: "Anime",
    topImageScale: 1.2,
    width: 350,
    height: 450,
  },
  {
    topImageUrl: "",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/control/street_girl2.jpg",
    cardText: "Gothic",
    topImageScale: 1.2,
    width: 350,
    height: 450,
  },
];
const cardData3: ImageCard3DType[] = [
  {
    topImageUrl: "",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/control/crown_girl1.png",
    cardText: "Anime",
    topImageScale: 1.2,
    width: 350,
    height: 450,
  },
  {
    topImageUrl: "",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/control/crown_girl2.png",
    cardText: "Gothic",
    topImageScale: 1.2,
    width: 350,
    height: 450,
  },
  {
    topImageUrl: "",
    bottomImageUrl:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/control/crown_girl3.png",
    cardText: "Gothic",
    topImageScale: 1.2,
    width: 350,
    height: 450,
  },
];

const Takecontrol = () => {
  return (
    <section className="relative mb-20 mt-48">
      <GlassPaneBG paneWidth={60}>
        <MouseParallaxProvider className="relative flex h-screen w-screen items-center justify-center px-4 py-16">
          <div
            className="pointer-events-none absolute inset-0 z-20 overflow-hidden opacity-60"
            style={{
              backgroundImage: "url(/images/landing/grain.png)",
              backgroundSize: "100px 100px",
              backgroundRepeat: "repeat",
              backgroundBlendMode: "overlay",
              backgroundPosition: "left top",
            }}
          />
          <MouseParallaxItem
            strength={5}
            className="absolute inset-0 z-10 mx-auto mt-16 h-full w-[1000px]"
          >
            <Image
              alt="Abstract background"
              src="/images/landing/control/control_bottom.jpg"
              fill
              unoptimized
              className="rounded-[100px] object-cover"
            />
          </MouseParallaxItem>
          <MouseParallaxItem
            strength={15}
            className="absolute inset-0 z-20 flex size-full items-center justify-center pb-[120px]"
          >
            <Image
              alt="Take control UI element"
              src="/images/landing/control/control_top.png"
              width={600}
              height={800}
              unoptimized
              className="h-auto"
            />
          </MouseParallaxItem>
          <p className="absolute left-0 top-12 z-20 ml-12 text-[80px] font-bold text-accent">
            TAKE CONTROL <span className="!z-50">OVER</span>
          </p>
          <p className="absolute bottom-0 right-0 z-50 ml-12 text-[80px] font-bold text-white">
            YOUR IMAGE GENERATION
          </p>
          <div className="absolute inset-x-0 -bottom-20 z-10 h-[400px] bg-black/20 !backdrop-blur-sm [mask-image:linear-gradient(to_top,white,transparent)]" />
        </MouseParallaxProvider>
      </GlassPaneBG>
      <div className="absolute left-1/2 top-0 z-[-1] -translate-x-1/2">
        <GradientComponent colors={blue} sizeVW={150} />
      </div>
      <div className="ml-12 mt-40 flex items-center gap-4">
        <Image
          src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/control/control_depth.jpg"
          width={400}
          height={400}
          alt="depth"
          className="rounded-3xl"
        />
        <ArrowRight size={80} className="text-accent" />
        <ul className="flex gap-4 overflow-scroll">
          <CardScroll cardData={cardData1} scrollHeight="h-[550px]" />
        </ul>
      </div>
      <p className="w-full text-center text-[50px]">3d concept to final image in seconds</p>
      <div className="mt-4 flex items-center justify-center gap-4">
        <Image
          src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/control/earth_girl5.png"
          width={800}
          height={400}
          alt="depth"
          className="rounded-3xl"
        />
        <ArrowRight size={80} className="text-accent" />
        <ImageCard3D
          topImageUrl="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/control/earth_girl_top.png"
          bottomImageUrl="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/control/earth_girl_bottom.png"
          cardText="Kawaii"
          topImageScale={1.1}
          width={800}
          height={450}
        />
      </div>
      <div className="ml-12 mt-12 flex items-center gap-4">
        <Image
          src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/control/street_ref.jpg"
          width={400}
          height={400}
          alt="depth"
          className="rounded-3xl"
        />
        <ArrowRight size={80} className="text-accent" />
        <ul className="flex gap-4 overflow-scroll">
          <CardScroll cardData={cardData2} scrollHeight="h-[550px]" />
        </ul>
      </div>
      <p className="w-full text-center text-[50px]">Reference to final image in seconds</p>
      <div className="ml-12 mt-12 flex items-center gap-4">
        <Image
          src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/control/crown_girl_ref.jpg"
          width={400}
          height={400}
          alt="depth"
          className="rounded-3xl"
        />
        <ArrowRight size={80} className="text-accent" />
        <ul className="flex gap-4 overflow-scroll">
          <CardScroll cardData={cardData3} scrollHeight="h-[550px]" />
        </ul>
      </div>
      <div className="absolute inset-x-0 -bottom-24 z-50 h-[400px] bg-black/50 !backdrop-blur-sm [mask-image:linear-gradient(to_top,white,transparent)]" />
      <p className="absolute inset-x-0 -bottom-8 z-50 px-96 text-center text-[35px]">
        Guide the AI with your sketch, image, or 3D model — it’s your{" "}
        <span className="text-accent">creation</span>, not the algorithm’s.
      </p>
    </section>
  );
};

export default Takecontrol;
