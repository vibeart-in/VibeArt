import type { Metadata } from "next";

import GenerationHistory from "@/src/components/home/GenerationHistory";
import MainNavbar from "@/src/components/home/MainNavbar";
import UpgradesFooter from "@/src/components/home/UpgradesFooter";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Vibe art",
  description: "The fastest way to generate high quality AI images",
};
export default function ImageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative flex size-full flex-row">
      <MainNavbar />
      <div className="hidden sm:block">
        <GenerationHistory />
      </div>
      <section className="size-full">{children}</section>
      <div className="md:hidden">
        <UpgradesFooter />
      </div>
    </main>
  );
}
