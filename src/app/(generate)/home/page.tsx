import { Metadata } from "next";
import Script from "next/script";

import LensCaveHero from "@/src/components/home/LensCaveHero";
import HorizontalImageScroller from "@/src/components/landing/HorizontalImageScroller";
import LensCaveCards from "@/src/components/home/LensCaveCards";
import LensCaveLiveRooms from "@/src/components/home/LensCaveLiveRooms";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "LensCave - Where your World meets your Network",
  description:
    "We enable the world's most engaged investors and family offices to access professionally managed investment strategies.",
  keywords: ["LensCave", "Network", "Investment", "Social", "Connect"],
  openGraph: {
    title: "LensCave - Where your World meets your Network",
    description:
      "We enable the world's most engaged investors and family offices to access professionally managed investment strategies.",
    url: "https://vibeart.in/",
    siteName: "LensCave",
    images: ["https://vibeart.in/opengraph-image.png"],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LensCave - Where your World meets your Network",
    description:
      "We enable the world's most engaged investors and family offices to access professionally managed investment strategies.",
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
    link: "/ai-apps/2e10a43b-ed29-4bdd-a298-091779a04b15",
  },
  {
    src: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/Ai_girlfriend/AI-girlfriend-thumbnail2.mp4",
    alt: "A snow-covered mountain range under a cloudy sky",
    width: 805,
    height: 1280,
    title: "AI Girlfriend",
    subtext: "Make your imaginary girlfriend do anything for you.",
    link: "/ai-apps/2e10a43b-ed29-4bdd-a298-091779a04b15",
  },
  {
    src: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/ai_apps/Dance_transfer/Dance-tranfer-thumbnail2.mp4",
    alt: "Close-up of a colorful bird with a vibrant beak",
    width: 805,
    height: 1280,
    title: "WAN 2.2 Dance transfer",
    subtext: "Transfer any moment to any picture you want",
    link: "/ai-apps/eda689e8-0683-4290-86c4-f973532305f1",
  },
  {
    src: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/516c8d4e-9fa0-46fa-a60a-a20826dadadf/transcode=true,original=true,quality=90/106778230.webm",
    alt: "An underwater shot of a sea turtle swimming",
    width: 1280,
    height: 705,
    title: "The Cheapest Sora 2 Generation - 50× More Affordable!",
    subtext: "We make Sora 2 generation accessible — 50× cheaper than the competition, starting",
    link: "/video",
  },
];

const Page = async () => {
  // ✅ Structured data (JSON-LD) for SEO + LLMs
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "LensCave",
    description: "Where your World meets your Network.",
    url: "https://vibeart.in/",
  };

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-black text-white">
      {/* ✅ Structured data injection (invisible, SEO only) */}
      <Script
        id="home-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LensCaveHero />
      {/* <HorizontalImageScroller images={sampleImages} galleryHeight={450} /> */}
      <LensCaveCards />
      {/* <LensCaveLiveRooms /> */}
    </main>
  );
};

export default Page;
