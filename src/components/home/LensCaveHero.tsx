"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function LensCaveHero() {
  return (
    <div className="relative h-[80vh] w-full overflow-hidden bg-black text-white">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/showcase/new/semi-realistic_anime_digital_art_style_she_s_looki.jpg"
          alt="Concert Background"
          fill
          className="object-cover opacity-80"
          priority
        />
        {/* <video
          src={
            "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/516c8d4e-9fa0-46fa-a60a-a20826dadadf/transcode=true,original=true,quality=90/106778230.webm"
          }
          className="h-full w-full object-cover opacity-80"
          autoPlay
          muted
          loop
          playsInline
          // onDragStart={(e) => e.preventDefault()}
        /> */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-center px-6 md:px-20 lg:px-32">
        <div className="max-w-2xl space-y-6">
          <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-gray-300">
            <span className="text-white">✦</span> Stay Connected
          </div>

          <h1 className="font-satoshi text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Upscale Image <br />
            To{" "}
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              4k
            </span>{" "}
            ✦
          </h1>

          <p className="max-w-lg text-lg text-gray-400">
            An AI-powered image upscale tool that can upscale your images to 4k resolution.
          </p>

          <div className="flex items-center gap-4 pt-4">
            <button className="group flex items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-black transition-all hover:bg-gray-200">
              Try it now
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button className="flex items-center gap-2 rounded-full px-8 py-3 font-semibold text-white transition-all hover:bg-white/10">
              View similar apps
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
