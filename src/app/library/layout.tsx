import type { Metadata } from "next";

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
      <nav className="fixed">
        {/* <SidebarMain /> */}
      </nav>
      <section className="w-full h-full ml-64">{children}</section>
    </main>
  );
}
