"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "../components/ui/button";
import GradualBlurMemo from "../components/ui/GradualBlur";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <section className="relative h-screen w-screen overflow-hidden bg-[#060602]">
      {/* Full screen image */}
      <div className="absolute inset-0">
        <Image
          src={"https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/404.webp"}
          alt="404 Not found"
          fill
          className="object-scale-down"
          priority
        />
      </div>

      {/* Blur overlay */}
      <GradualBlurMemo
        target="parent"
        position="bottom"
        height="10rem"
        strength={2}
        divCount={5}
        curve="bezier"
        exponential={true}
        opacity={1}
        zIndex={10}
      />
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-wrap justify-center gap-3 px-4 sm:gap-4 md:bottom-8">
        <Button onClick={handleGoBack}>Go Back</Button>
        <Link href={"/generate/home"}>
          <Button variant="secondary">Home</Button>
        </Link>
      </div>
    </section>
  );
}
