import { IconSparkles } from "@tabler/icons-react";
import { createClient } from "@/src/lib/supabase/server";
import BackgroundImage from "@/src/components/home/BackgroundImage";
import InputBox from "@/src/components/inputBox/InputBox";
import ImageGallery from "@/src/components/home/ImageGrid";

const page = async () => {
  const supabase = createClient();

  const { data: images, error } = await (
    await supabase
  ).rpc("get_random_images", {
    limit_count: 15,
  });

  if (error) {
    console.error("Error fetching random images:", error);
    return (
      <p className="text-center">
        Failed to load images. Please try again later.
      </p>
    );
  }
  return (
    <div className="relative w-full h-screen flex flex-col bg-background overflow-y-scroll items-center">
      <BackgroundImage
        src="/images/generate_bg.png"
        width={900}
        height={900}
        roatation={16}
      />
      <div className="z-10 my-8 mt-44 flex flex-col justify-center items-center">
        <h1 className="flex items-center gap-2 font-semibold text-2xl mb-6">
          <IconSparkles /> Generate images from text and references
        </h1>
        <InputBox />
      </div>
      <div className="p-2 mt-16 mx-32">
        <p className="p-2 ml-3 mb-1 flex font-medium">Examples</p>
        <ImageGallery images={images} />
      </div>
    </div>
  );
};

export default page;
