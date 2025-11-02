import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { ThemeProvider } from "next-themes";

import "./globals.css";
import localFont from "next/font/local";

import { RealtimeProvider } from "../components/providers/RealtimeProvider";
import { Toaster } from "../components/ui/sonner";
import { TanStackProvider } from "../lib/TanstackProvider";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "VibeArt",
    template: "%s • VibeArt",
  },
  description:
    "VibeArt — Instantly create high-quality AI images from text and reference photos. Generate photorealistic or stylized artwork, upscale to 4K, and share results with one click.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: [{ rel: "icon", url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }],
  },
  openGraph: {
    title: "VibeArt",
    description:
      "Create stunning AI images from text and references — fast, flexible, and shareable. Upscale to 4K, batch export, and publish directly to social.",
    url: `${defaultUrl}/image/home`,
    siteName: "VibeArt",
    images: [
      {
        url: "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/brand/logo.png",
        // Ideally replace with a dedicated social-preview image (see notes below)
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeArt",
    description:
      "Create stunning AI images from text and references — fast, flexible, and shareable. Upscale to 4K and export for social.",
    images: [
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/brand/logo.png",
    ],
    creator: "@your_twitter_handle", // optional: put your X handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

const geistSans = Quicksand({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

const satoshi = localFont({
  src: [
    {
      path: "./fonts/Satoshi-Variable.woff2",
      style: "normal",
      weight: "300 900", // full range
    },
    {
      path: "./fonts/Satoshi-VariableItalic.woff2",
      style: "italic",
      weight: "300 900",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} ${satoshi.variable} antialiased`}>
        <TanStackProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            disableTransitionOnChange
          >
            <RealtimeProvider>{children}</RealtimeProvider>
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </TanStackProvider>
      </body>
    </html>
  );
}
