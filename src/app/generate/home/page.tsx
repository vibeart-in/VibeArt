import { Metadata } from "next";
import Script from "next/script";

import { ShowcaseClient } from "@/src/components/home/ShowcaseClient";
import HorizontalImageScroller from "@/src/components/landing/HorizontalImageScroller";
import { createClient } from "@/src/lib/supabase/server";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Create images & videos with AI",
  description:
    "VibeArt — The all-in-one AI-powered platform for creators. Generate photorealistic images and videos with Wan2.2, Seedream-4, Veo3.1 and more. Upscale to 4K, batch export, and share instantly.",
  keywords: [
    "AI image generator",
    "AI video generator",
    "creator platform",
    "Wan2.2",
    "Seedream-4",
    "Veo3.1",
    "Sora 2",
    "AI upscaler",
    "image-to-video",
    "4K upscale",
  ],
  openGraph: {
    title: "VibeArt — Create images & videos with AI",
    description:
      "Generate stunning AI images and videos using the latest models — Wan2.2, Seedream-4, Veo3.1, and more. Upscale to 4K with VibeArt.",
    url: "https://vibeart.in/",
    siteName: "VibeArt",
    images: ["https://vibeart.in/opengraph-image.png"],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeArt — Create images & videos with AI",
    description:
      "The All-in-one AI platform for creators — generate with Wan2.2, Seedream-4, and Veo3.1.",
    images: ["https://vibeart.in/opengraph-image.png"],
    creator: "@ametheshlgp",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const sampleImages = [
  {
    src: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/4k_upscale/4k_video_cover.mp4",
    alt: "A snow-covered mountain range under a cloudy sky",
    width: 1080,
    height: 1080,
    title: "Upscale any image to 4K",
    subtext: "An AI-powered smart upscaler that transforms your images into stunning 4K quality",
    link: "/generate/ai-apps/2e10a43b-ed29-4bdd-a298-091779a04b15",
  },
  {
    src: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/Ai_girlfriend/AI-girlfriend-thumbnail2.mp4",
    alt: "A snow-covered mountain range under a cloudy sky",
    width: 805,
    height: 1280,
    title: "AI Girlfriend",
    subtext: "Make your imaginary girlfriend do anything for you.",
    link: "/generate/ai-apps/2e10a43b-ed29-4bdd-a298-091779a04b15",
  },
  {
    src: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/Dance_transfer/Dance-tranfer-thumbnail2.mp4",
    alt: "Close-up of a colorful bird with a vibrant beak",
    width: 805,
    height: 1280,
    title: "WAN 2.2 Dance transfer",
    subtext: "Transfer any moment to any picture you want",
    link: "/generate/ai-apps/eda689e8-0683-4290-86c4-f973532305f1",
  },
  {
    src: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/516c8d4e-9fa0-46fa-a60a-a20826dadadf/transcode=true,original=true,quality=90/106778230.webm",
    alt: "An underwater shot of a sea turtle swimming",
    width: 1280,
    height: 705,
    title: "The Cheapest Sora 2 Generation - 50× More Affordable!",
    subtext: "We make Sora 2 generation accessible — 50× cheaper than the competition, starting",
    link: "/generate/video",
  },
];

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

  // ✅ Structured data (JSON-LD) for SEO + LLMs
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Pngage",
    name: "AI Image & Video Generator",
    description:
      "VibeArt helps creators generate AI images and videos with the latest models like Wan2.2, Seedream-4, Veo3.1, and more.",
    url: "https://vibeart.in/",
    mainEntity: {
      "@type": "ItemList",
      name: "Supported AI Models",
      itemListElement: uniqueModelNames.map((model, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: model,
      })),
    },
    potentialAction: {
      "@type": "SearchAction",
      target: "https://vibeart.in/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      {/* ✅ Structured data injection (invisible, SEO only) */}
      <Script
        id="home-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ✅ No visible or structural changes below */}
      <section className="relative mt-12">
        <HorizontalImageScroller images={sampleImages} galleryHeight={450} />
        <div className="flex flex-col gap-24">
          {uniqueModelNames.length > 0 && <ShowcaseClient models={uniqueModelNames} />}
        </div>
      </section>
    </>
  );
};

export default Page;
