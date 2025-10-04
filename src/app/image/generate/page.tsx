import { IconSparkles } from "@tabler/icons-react";
import { createClient } from "@/src/lib/supabase/server";
import BackgroundImage from "@/src/components/home/BackgroundImage";
import InputBox from "@/src/components/inputBox/InputBox";
import ImageGallery from "@/src/components/home/ImageGrid";
import Footer from "@/src/components/landing/Footer";

const Page = async () => {
  const supabase = await createClient();

  const { data: images, error } = await supabase.rpc("get_random_images", {
    limit_count: 15,
  });

  if (error) {
    console.error("Error fetching random images:", error);
    return (
      <p className="text-center text-white">
        Failed to load images. Please try again later.
      </p>
    );
  }

  return (
    <section className="relative overflow-hidden">
      <div className="relative w-full overflow-hidden flex flex-col bg-black overflow-y-scroll items-center">
        {/* Background Image */}
        <BackgroundImage
          className="mt-2"
          src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/generate-bg.mp4"
          width={1000}
          height={1000}
        />

        {/* Hero Section */}
        <div className="z-10 my-8 mt-56 flex flex-col justify-center items-center">
          <h1 className="flex items-center gap-2 font-semibold text-2xl mb-6 text-white">
            <IconSparkles /> Generate images from text and references
          </h1>
          <InputBox />
        </div>

        <div className="px-4 md:px-8 lg:px-32 pb-20 mt-32">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white z-10">Examples</h2>
              <button className="px-4 py-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10 transition-all">
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
