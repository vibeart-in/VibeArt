import { IconSparkles } from "@tabler/icons-react";

import BackgroundImage from "@/src/components/home/BackgroundImage";
import ExampleGenerations from "@/src/components/home/ExampleGenerations";
import InputBox from "@/src/components/inputBox/InputBox";
import { ConversationType } from "@/src/types/BaseType";

const Page = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="relative flex min-h-screen w-full flex-col items-center overflow-hidden bg-black">
        {/* Background Image */}
        <BackgroundImage
          className="mt-14"
          src="https://i.pinimg.com/736x/af/4a/4f/af4a4f086d3acdb0e40a7c88554d5fcf.jpg"
          width={600}
          height={600}
          rotation={10}
        />
        {/* <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            backgroundImage: "url(/images/landing/grain.png)",
            backgroundSize: "100px 100px",
            mixBlendMode: "overlay",
          }}
        />
        <div className="absolute top-0 -z-20 h-full w-screen overflow-hidden">
          <Image
            src={
              "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/gradients/gold_girl_top.webp"
            }
            alt="gradients"
            className="h-full w-full object-cover object-top"
            fill
          />
        </div> */}

        {/* Hero Section */}
        <div className="z-10 my-8 mt-56 flex flex-col items-center justify-center">
          <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-white">
            <IconSparkles /> Generate images from text and references
          </h1>
          <InputBox />
        </div>

        <ExampleGenerations limit={15} showcaseFor={ConversationType.GENERATE} />
      </div>
    </section>
  );
};

export default Page;
