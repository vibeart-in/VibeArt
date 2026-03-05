"use client";
import { ArrowRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function GetStarted() {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isHovered) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isHovered]);

  return (
    <section className="flex w-full items-center justify-center px-4 py-8 md:px-6">
      <div
        className="relative w-full max-w-7xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative flex min-h-[600px] flex-col items-center justify-center overflow-hidden rounded-[48px] border border-border bg-card shadow-sm duration-500 md:min-h-[600px]">
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-40 mix-blend-multiply dark:opacity-30 dark:mix-blend-screen">
            <video
              ref={videoRef}
              src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/From-video.mp4"
              className="size-full object-cover"
              muted
              loop
              playsInline
            />
          </div>

          <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-primary"></span>
              </span>
              AI-Powered Creation
            </div>

            {/* Headline */}
            <h2 className="mb-8 font-serif text-5xl font-medium leading-[1.05] tracking-tight text-foreground md:text-7xl lg:text-8xl">
              Your creation, <br />
              <span className="text-foreground/80">delivered perfectly.</span>
            </h2>

            {/* Description */}
            <p className="mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Join 2,847 founders using the only AI that understands the nuance of your creation.
              Clean, precise, and uniquely yours.
            </p>

            {/* Button */}
            <button className="group relative inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded-full bg-primary px-12 text-base font-medium text-primary-foreground transition-all duration-300 hover:scale-105 hover:bg-primary/90 hover:ring-4 hover:ring-primary/20 active:scale-95">
              <span className="relative z-10">Start Creating</span>
              <ArrowRight className="relative z-10 size-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
