import type { Metadata } from "next";

import Footer from "@/src/components/landing/Footer";
import { NavbarLander } from "@/src/components/landing/Navbar";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative overflow-hidden">
      <NavbarLander />
      {children}
      <Footer />
    </main>
  );
}
