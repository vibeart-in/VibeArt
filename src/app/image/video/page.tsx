import { IconVideo, IconWorld, IconUsers, IconLock } from "@tabler/icons-react";
import { createClient } from "@/src/lib/supabase/server";
import BackgroundImage from "@/src/components/home/BackgroundImage";
import InputBox from "@/src/components/inputBox/InputBox";
import ImageGallery from "@/src/components/home/ImageGrid";
import Footer from "@/src/components/landing/Footer";

const Page = async () => {
  const supabase = await createClient();

  const { data: videos, error } = await supabase.rpc("get_example_generations", {
    p_limit: 15,
    p_showcase_for: "video",
  });

  if (error) {
    console.error("Error fetching random videos:", error);
    return <p className="text-center text-white">Failed to load videos. Please try again later.</p>;
  }

  return (
    <section className="relative overflow-hidden text-white">
      <div className="relative flex min-h-screen flex-col items-center overflow-hidden">
        <div>
          <BackgroundImage
            className="absolute inset-0 z-0 opacity-30"
            src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/video-bg.mp4"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-x-0 top-[700] z-10 h-[200px] bg-black backdrop-blur-lg [mask-image:linear-gradient(to_top,white,transparent)] sm:h-[400px]" />
        </div>

        <div className="relative z-10 flex max-w-4xl flex-col items-center justify-center px-6 pb-24 pt-48 text-center">
          <h1 className="mb-4 flex items-center justify-center gap-3 text-3xl font-semibold md:text-4xl">
            <IconVideo className="h-8 w-8 text-blue-400" />
            Generate Stunning AI Videos Instantly
          </h1>

          <p className="max-w-2xl text-sm leading-relaxed text-gray-300 md:text-base">
            Create cinematic stories, product demos, and artistic motion clips using open-source,
            community-trained, or proprietary AI video models.
          </p>

          <div className="mt-8 w-full max-w-7xl">
            <InputBox />
          </div>

          {/* Model Types (Pillars) */}
          <div className="mt-10 flex max-w-7xl items-center justify-center gap-5">
            {/* Open Source */}
            <div className="flex w-[280px] items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:bg-white/10 md:w-[300px]">
              <IconWorld className="h-6 w-6 text-blue-400" />
              <div className="text-left">
                <h3 className="text-sm font-semibold">Open Source</h3>
                <p className="text-xs text-gray-400">
                  Use Stable Video Diffusion, AnimateDiff, and other free models.
                </p>
              </div>
            </div>

            {/* Community-Trained */}
            <div className="flex w-[280px] items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:bg-white/10 md:w-[300px]">
              <IconUsers className="h-6 w-6 text-green-400" />
              <div className="text-left">
                <h3 className="text-sm font-semibold">Community-Trained</h3>
                <p className="text-xs text-gray-400">
                  Tap into LoRAs and fine-tuned video models built by creators.
                </p>
              </div>
            </div>

            {/* Proprietary */}
            <div className="flex w-[280px] items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:bg-white/10 md:w-[300px]">
              <IconLock className="h-6 w-6 text-yellow-400" />
              <div className="text-left">
                <h3 className="text-sm font-semibold">Proprietary</h3>
                <p className="text-xs text-gray-400">
                  Access exclusive closed-source models for cinematic realism.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-24 w-full px-6 pb-24 md:px-12 lg:px-32">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col items-center justify-between gap-4 md:flex-row">
              <h2 className="text-3xl font-bold">Example Generations</h2>
              <button className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white transition-all hover:bg-white/10">
                View All
              </button>
            </div>
            <ImageGallery images={videos} columnCount={3} />
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
};

export default Page;
