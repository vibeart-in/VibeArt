import { ShowcaseClient } from "@/src/components/home/ShowcaseClient";
import HorizontalImageScroller from "@/src/components/landing/HorizontalImageScroller";
import { createClient } from "@/src/lib/supabase/server";

const sampleImages = [
  {
    src: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/4k_upscale/4k_video_cover.mp4",
    alt: "A snow-covered mountain range under a cloudy sky",
    width: 1080,
    height: 1080,
    title: "Upscale any image to 4K",
    subtext: "An AI-powered smart upscaler that transforms your images into stunning 4K quality",
    link: "/image/ai-apps/2e10a43b-ed29-4bdd-a298-091779a04b15",
  },
  {
    src: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/Ai_girlfriend/AI-girlfriend-thumbnail2.mp4",
    alt: "A snow-covered mountain range under a cloudy sky",
    width: 805,
    height: 1280,
    title: "AI Girlfriend",
    subtext: "Make your imaginary girlfriend do anything for you.",
    link: "/image/ai-apps/2e10a43b-ed29-4bdd-a298-091779a04b15",
  },
  {
    src: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/Dance_transfer/Dance-tranfer-thumbnail2.mp4",
    alt: "Close-up of a colorful bird with a vibrant beak",
    width: 805,
    height: 1280,
    title: "WAN 2.2 Dance transfer",
    subtext: "Transfer any moment to any picture you want",
    link: "/image/ai-apps/eda689e8-0683-4290-86c4-f973532305f1",
  },
  {
    src: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/516c8d4e-9fa0-46fa-a60a-a20826dadadf/transcode=true,original=true,quality=90/106778230.webm",
    alt: "An underwater shot of a sea turtle swimming",
    width: 1280,
    height: 705,
    title: "The Cheapest Sora 2 Generation - 50× More Affordable!",
    subtext: "We make Sora 2 generation accessible — 50× cheaper than the competition, starting",
    link: "/image/video",
  },
];

export const revalidate = 3600;

const Page = async () => {
  const supabase = await createClient();

  const { data: models, error } = await supabase
    .from("showcaseimages")
    .select("generated_by")
    .order("generated_by", { ascending: true });

  if (error || !models) {
    return <p className="text-center text-white">Could not load model data.</p>;
  }

  const uniqueModelNames = [
    ...new Set(models.map((m) => m.generated_by).filter((name): name is string => !!name)),
  ];

  return (
    <section className="relative mt-12">
      <HorizontalImageScroller images={sampleImages} galleryHeight={450} />
      <div className="flex flex-col gap-24">
        {uniqueModelNames.length > 0 && <ShowcaseClient models={uniqueModelNames} />}
      </div>
    </section>
  );
};

export default Page;
