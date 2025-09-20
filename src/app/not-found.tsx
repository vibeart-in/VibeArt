"use client";

import Image from "next/image";
import GradualBlurMemo from "../components/ui/GradualBlur";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <section className="relative h-screen w-screen overflow-hidden">
      {/* <NavbarLander /> */}

      {/* Full screen image */}
      <div className="absolute inset-0">
        <Image
          src={"/images/404.png"}
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
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-3 sm:gap-4 z-20 px-4">
        <Button onClick={handleGoBack}>Go Back</Button>
        <Link href={"/library"}>
        <Button variant="secondary">Gallery</Button>
        </Link>
      </div>
    </section>
  );
}
