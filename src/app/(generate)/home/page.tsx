import { Metadata } from "next";
import HomeFeatureCard from "@/src/components/home/HomeFeatureCard";
import Footer from "@/src/components/landing/Footer";
import HomeSlide from "@/src/components/home/HomeSlide";
import { HomeGetStarted } from "@/src/components/home/HomeGetStarted";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "VibeArt - AI Image & Video Generator",
  description:
    "VibeArt helps creators generate AI images and videos with the latest models like Wan2.2, Seedream-4, Veo3.1, and more.",
  keywords: ["VibeArt", "AI Image Generator", "AI Video", "Stable Diffusion", "FLUX", "Nanobannan"],
  openGraph: {
    title: "VibeArt - AI Image & Video Generator",
    description:
      "VibeArt helps creators generate AI images and videos with the latest models like Wan2.2, Seedream-4, Veo3.1, and more.",
    url: "https://vibeart.in/",
    siteName: "VibeArt",
    images: ["https://vibeart.in/opengraph-image.png"],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeArt - AI Image & Video Generator",
    description:
      "VibeArt helps creators generate AI images and videos with the latest models like Wan2.2, Seedream-4, Veo3.1, and more.",
    images: ["https://vibeart.in/opengraph-image.png"],
    creator: "@ametheshlgp",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const Page = async () => {
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-black text-white">
      <HomeSlide />
      <HomeFeatureCard />
      <HomeGetStarted />
      <div className="relative overflow-hidden">
        <Footer />
      </div>
    </main>
  );
};

export default Page;
