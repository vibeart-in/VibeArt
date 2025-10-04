import type { Metadata } from "next";
import GenerateHistory from "@/src/components/home/GenerateHistory";
import MainNavbar from "@/src/components/home/MainNavbar";

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
        <MainNavbar />
      </nav>
        <GenerateHistory />
        <section className="w-full h-full">{children}</section>
    </main>
  );
}
