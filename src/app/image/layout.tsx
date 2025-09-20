import type { Metadata } from "next";
import { MainNavbar } from "@/src/components/home/MainNavbar";
import GenerateHistory from "@/src/components/home/GenerateHistory";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Aura.ai",
  description: "The fastest way to generate high quality AI images",
};
export default function ImageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative flex h-full w-full flex-row">
      <nav className="">
        {/* <SidebarMain /> */}
        <MainNavbar />
      </nav>
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-20">
        <GenerateHistory />
      </div>
      <section className="w-full h-full">{children}</section>
    </main>
  );
}
