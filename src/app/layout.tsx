import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { TanStackProvider } from "../lib/TanstackProvider";
import localFont from "next/font/local";
import { RealtimeProvider } from "../components/providers/RealtimeProvider";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Aura.ai",
  description: "The fastest way to generate high quality AI images",
};

const geistSans = Quicksand({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

const gothic = localFont({
  src: [
    {
      path: "./fonts/gothic/SansSerifFLF.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/gothic/SansSerifFLF-Italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/gothic/SansSerifFLF-Demibold.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/gothic/SansSerifFLF-DemiItalic.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "./fonts/gothic/SansSerifBookFLF.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/gothic/SansSerifBookFLF-Italic.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "./fonts/gothic/SansSerifBldFLF.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/gothic/SansSerifBldFLF-Italic.otf",
      weight: "700",
      style: "italic",
    },
    {
      path: "./fonts/gothic/SansSerifBldFLFCond.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/gothic/SansSerifBldFLFCond-Italic.otf",
      weight: "700",
      style: "italic",
    },
    {
      path: "./fonts/gothic/SansSerifExbFLF.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/gothic/SansSerifExbFLF-Italic.otf",
      weight: "800",
      style: "italic",
    },
    {
      path: "./fonts/gothic/SansSerifExbFLFCond.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/gothic/SansSerifExbFLFCond-Italic.otf",
      weight: "800",
      style: "italic",
    },
  ],
  variable: "--font-gothic",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} ${gothic.variable} antialiased`}>
        <TanStackProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <RealtimeProvider>{children}</RealtimeProvider>
          </ThemeProvider>
        </TanStackProvider>
      </body>
    </html>
  );
}
