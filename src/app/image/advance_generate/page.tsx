import { IconSparkles, IconTarget, IconBolt, IconCoin } from "@tabler/icons-react";
import { createClient } from "@/src/lib/supabase/server";
import BackgroundImage from "@/src/components/home/BackgroundImage";
import InputBox from "@/src/components/inputBox/InputBox";
import ImageGallery from "@/src/components/home/ImageGrid";
import Footer from "@/src/components/landing/Footer";

const Page = async () => {
  const supabase = await createClient();

  const { data: images, error } = await supabase.rpc("get_example_generations", {
    p_limit: 15,
    p_showcase_for: "advance_generate",
  });

  if (error) {
    console.error("Error fetching random images:", error);
    return <p className="text-center text-white">Failed to load images. Please try again later.</p>;
  }

  return (
    <section className="relative overflow-hidden">
      <div className="relative flex h-screen w-full flex-col items-center overflow-y-scroll bg-black">
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
              <IconTarget className="h-5 w-5 text-white" />
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
              <IconBolt className="h-5 w-5 text-white" />
              <div className="text-left">
                <div className="text-sm font-medium text-white">Efficient</div>
                <div className="text-xs text-gray-300">
                  Faster and lighter than large closed-source models
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-2 backdrop-blur-sm">
              <IconCoin className="h-5 w-5 text-white" />
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
        <div className="px-4 pb-20 md:px-8 lg:px-32">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white">Examples</h2>
              <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white backdrop-blur-sm transition-all hover:bg-white/10">
                View All
              </button>
            </div>
            <ImageGallery images={images} />
          </div>
        </div>
      </div>
      <Footer />
    </section>
  );
};

export default Page;
