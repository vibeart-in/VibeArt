"use client";

import Image from "next/image";

export default function LensCaveLiveRooms() {
  return (
    <div className="w-full bg-black px-6 pb-20 md:px-20 lg:px-32">
      <div className="mb-6 flex items-center gap-2">
        <div className="size-2 animate-pulse rounded-full bg-red-500"></div>
        <h2 className="text-lg font-semibold text-white">Live Rooms (6)</h2>
      </div>

      <div className="scrollbar-hide flex gap-6 overflow-x-auto pb-4">
        {/* Room 1 */}
        <div className="relative h-48 min-w-[300px] overflow-hidden rounded-3xl bg-gray-800">
          <Image
            src="/images/hero_background.png"
            alt="Live Room"
            fill
            className="object-cover opacity-60"
          />
          <div className="absolute left-4 top-4 rounded-full bg-red-500/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
            LIVE
          </div>
          <div className="absolute bottom-4 left-4">
            <h3 className="font-bold text-white">Tuesday, December 12, 2024</h3>
          </div>
        </div>

        {/* Room 2 */}
        <div className="relative h-48 min-w-[300px] overflow-hidden rounded-3xl bg-yellow-500">
          <Image
            src="/images/app_interface.png"
            alt="Live Room"
            fill
            className="object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute left-4 top-4 rounded-full bg-black/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
            LIVE
          </div>
          <div className="absolute bottom-4 left-4">
            <h3 className="text-xl font-bold text-black">55k Followers</h3>
          </div>
        </div>

        {/* Room 3 */}
        <div className="relative h-48 min-w-[300px] overflow-hidden rounded-3xl border border-white/10 bg-gray-900">
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <span>More rooms...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
