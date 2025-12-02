"use client";

import Image from "next/image";

const PhoneCard = ({
  title,
  imageSrc,
  delay,
}: {
  title: string;
  imageSrc: string;
  delay: string;
}) => {
  return (
    <div
      className={`group relative aspect-[9/19] w-full overflow-hidden rounded-[2.5rem] bg-gray-900/50 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20 ${delay}`}
    >
      {/* Header inside phone */}
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between p-4 pt-6">
        <span className="text-xs font-medium text-white/80">{title}</span>
        <div className="flex gap-1">
          <div className="size-1 rounded-full bg-white/50"></div>
          <div className="size-1 rounded-full bg-white/50"></div>
        </div>
      </div>

      {/* Screen Content */}
      <div className="absolute inset-0 z-10">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover opacity-80 transition-opacity duration-500 group-hover:opacity-100"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      </div>

      {/* Bottom Controls Mockup */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-4 rounded-full bg-black/40 px-4 py-2 backdrop-blur-md">
        <div className="size-8 rounded-full bg-white/20"></div>
        <div className="size-8 rounded-full bg-white/20"></div>
        <div className="size-8 rounded-full bg-white/20"></div>
      </div>
    </div>
  );
};

export default function LensCaveCards() {
  return (
    <div className="relative z-10 -mt-32 w-full px-6 pb-20 md:px-20 lg:px-32">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <PhoneCard title="Meetup" imageSrc="/images/app_interface.png" delay="delay-0" />
        <PhoneCard title="For You" imageSrc="/images/app_interface.png" delay="delay-100" />
        <PhoneCard title="Stories" imageSrc="/images/app_interface.png" delay="delay-200" />
        <PhoneCard title="Today" imageSrc="/images/app_interface.png" delay="delay-300" />
      </div>
    </div>
  );
}
