import { IconVideo, IconWorld, IconUsers, IconLock } from "@tabler/icons-react";

import BackgroundImage from "@/src/components/home/BackgroundImage";
import ExampleGenerations from "@/src/components/home/ExampleGenerations";
import InputBox from "@/src/components/inputBox/InputBox";
import Footer from "@/src/components/landing/Footer";
import { ConversationType } from "@/src/types/BaseType";

const Page = () => {
  return (
    <section className="relative overflow-hidden text-white">
      <div className="flex min-h-screen w-full flex-col items-center overflow-hidden bg-black">
        <BackgroundImage
          className="opacity-30"
          src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/video-bg.mp4"
          width={1920}
          height={1080}
          bottomBlur={true}
        />

        <div className="relative z-10 flex flex-col items-center justify-center px-6 pb-24 pt-48 text-center">
          <h1 className="mb-4 flex items-center justify-center gap-3 text-3xl font-semibold md:text-4xl">
            <IconVideo className="size-8 text-blue-400" />
            Generate Stunning AI Videos Instantly
          </h1>

          <p className="max-w-2xl text-sm leading-relaxed text-gray-300 md:text-base">
            Create cinematic stories, product demos, and artistic motion clips using open-source,
            community-trained, or proprietary AI video models.
          </p>

          <div className="mt-8">
            <InputBox />
          </div>

          {/* Model Types (Pillars) */}
          <div className="mt-10 flex flex-row flex-wrap items-center justify-center gap-5">
            {/* Open Source */}
            <div className="flex w-[280px] items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:bg-white/10 md:w-[300px]">
              <IconWorld className="size-6 text-blue-400" />
              <div className="text-left">
                <h3 className="text-sm font-semibold">Open Source</h3>
                <p className="text-xs text-gray-400">
                  Use Stable Video Diffusion, AnimateDiff, and other free models.
                </p>
              </div>
            </div>

            {/* Community-Trained */}
            <div className="flex w-[280px] items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:bg-white/10 md:w-[300px]">
              <IconUsers className="size-6 text-green-400" />
              <div className="text-left">
                <h3 className="text-sm font-semibold">Community-Trained</h3>
                <p className="text-xs text-gray-400">
                  Tap into LoRAs and fine-tuned video models built by creators.
                </p>
              </div>
            </div>

            {/* Proprietary */}
            <div className="flex w-[280px] items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:bg-white/10 md:w-[300px]">
              <IconLock className="size-6 text-yellow-400" />
              <div className="text-left">
                <h3 className="text-sm font-semibold">Proprietary</h3>
                <p className="text-xs text-gray-400">
                  Access exclusive closed-source models for cinematic realism.
                </p>
              </div>
            </div>
          </div>
        </div>

        <ExampleGenerations limit={15} showcaseFor={ConversationType.VIDEO} className="!mt-44 origin-bottom scale-95 !pb-0 md:scale-100" />
      </div>
    </section>
  );
};

export default Page;
