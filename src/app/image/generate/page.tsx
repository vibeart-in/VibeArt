import { IconSparkles } from "@tabler/icons-react";

import BackgroundImage from "@/src/components/home/BackgroundImage";
import ImageGallery from "@/src/components/home/ImageGrid";
import InputBox from "@/src/components/inputBox/InputBox";
import Footer from "@/src/components/landing/Footer";
import { createClient } from "@/src/lib/supabase/server";

const Page = async () => {
  const supabase = await createClient();

  const { data: images, error } = await supabase.rpc("get_example_generations", {
    p_limit: 15,
    p_showcase_for: "generate",
  });

  if (error) {
    console.error("Error fetching random images:", error);
    return <p className="text-center text-white">Failed to load images. Please try again later.</p>;
  }

  return (
    <section className="relative overflow-hidden">
      <div className="relative flex min-h-screen w-full flex-col items-center overflow-hidden overflow-y-scroll bg-black">
        {/* Background Image */}
        <BackgroundImage
          className="mt-2"
          src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/generate-bg.mp4"
          width={1000}
          height={1000}
        />

        {/* Hero Section */}
        <div className="z-10 my-8 mt-56 flex flex-col items-center justify-center">
          <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-white">
            <IconSparkles /> Generate images from text and references
          </h1>
          <InputBox />
        </div>

        <div className="mt-32 px-4 pb-20 md:px-8 lg:px-32">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="z-10 text-3xl font-bold text-white">Examples</h2>
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
