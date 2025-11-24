import { IconSparkles, IconTarget, IconBolt, IconCoin } from "@tabler/icons-react";

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
          className="mt-2"
          src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/make-bg.mp4"
          width={800}
          height={800}
        />

        {/* Hero Section */}
        <div className="z-10 my-8 mt-56 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-2 flex items-center gap-2 text-2xl font-semibold text-white">
            <IconSparkles /> Unlock the power of community-trained models
          </h1>

          {/* Input box */}
          <div className="mt-6 w-full max-w-6xl">
            <InputBox />
          </div>

          {/* Tiny pillars: Specialized / Efficient / Affordable */}
          <div className="mt-4 flex w-full max-w-3xl items-start justify-center gap-6">
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-2 backdrop-blur-sm">
              <IconTarget className="size-5 text-white" />
              <div className="text-left">
                <div className="text-sm font-medium text-white">Specialized</div>
                <div className="text-xs text-gray-300">
                  Each checkpoint &amp;{" "}
                  <span title="Custom-trained models built by the community. Use them when you want a specific look or task done better and cheaper.">
                    LoRA
                  </span>{" "}
                  has a purpose
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-2 backdrop-blur-sm">
              <IconBolt className="size-5 text-white" />
              <div className="text-left">
                <div className="text-sm font-medium text-white">Efficient</div>
                <div className="text-xs text-gray-300">
                  Faster and lighter than large closed-source models
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-2 backdrop-blur-sm">
              <IconCoin className="size-5 text-white" />
              <div className="text-left">
                <div className="text-sm font-medium text-white">Affordable</div>
                <div className="text-xs text-gray-300">
                  Lower credits for the same specialized task
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Examples / Image Gallery */}
        <ExampleGenerations limit={15} showcaseFor={ConversationType.ADVANCE} />
      </div>
      {/* <Footer /> */}
    </section>
  );
};

export default Page;
