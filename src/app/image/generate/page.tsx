import { IconSparkles } from "@tabler/icons-react";
import { createClient } from "@/src/lib/supabase/server";
import BackgroundImage from "@/src/components/home/BackgroundImage";
import InputBox from "@/src/components/inputBox/InputBox";
import ImageGallery from "@/src/components/home/ImageGrid";

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
    <div className="relative w-full h-screen flex flex-col bg-black overflow-y-scroll items-center">
      {/* Background Image */}
      <BackgroundImage
        className="mt-2"
        src="https://i.pinimg.com/originals/24/e1/b5/24e1b51dcfaf8b9d7aeb5d49e91be623.gif"
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

      {/* Examples / Image Gallery */}
      <div className="p-2 mt-28 px-32 w-full">
        <p className="p-2 ml-3 mb-1 flex font-medium text-white">Examples</p>
        {images && images.length > 0 ? (
          <ImageGallery images={images} />
        ) : (
          <p className="text-center text-white">No images available.</p>
        )}
      </div>
    </div>
  );
};

export default Page;
