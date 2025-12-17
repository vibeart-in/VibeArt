import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { ThemeProvider } from "next-themes";

import "./globals.css";
import localFont from "next/font/local";

import { RealtimeProvider } from "../components/providers/RealtimeProvider";
import { SkipToContent } from "../components/SkipToContent";
import { Toaster } from "../components/ui/sonner";
import { TanStackProvider } from "../lib/TanstackProvider";
import { JotaiProviders } from "../lib/JotaiProvider";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "VibeArt",
    template: "%s • VibeArt",
  },
  description: "The All-in-one AI-powered Platform for modern creators.",
  keywords: [
    "AI image generator",
    "AI video generator",
    "creator platform",
    "image-to-image",
    "upscale to 4K",
    "photorealistic images",
    "stylized art",
    "Wan2.2",
    "Seedream-4",
    "Veo3.1",
    "higgsfield",
    "krea",
  ],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: [{ rel: "icon", url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }],
  },
  openGraph: {
    title: "VibeArt",
    description: "The All-in-one AI-powered Platform for modern creators.",
    images: [new URL("/opengraph-image.png", defaultUrl).toString()],
    url: `${defaultUrl}/home`,
    siteName: "VibeArt",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeArt",
    description: "The All-in-one AI-powered Platform for modern creators.",
    images: [new URL("/opengraph-image.png", defaultUrl).toString()],
    creator: "@ametheshlgp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-video-preview": -1,
      "max-image-preview": "large",
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
        <SkipToContent />
        <TanStackProvider>
          <JotaiProviders>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              forcedTheme="dark"
              disableTransitionOnChange
            >
              <RealtimeProvider>{children}</RealtimeProvider>
              <Toaster position="top-right" richColors />
            </ThemeProvider>
          </JotaiProviders>
        </TanStackProvider>
      </body>
    </html>
  );
}
