"use client";

import Link from "next/link";
import { PhotoIcon, VideoCameraIcon, PuzzlePieceIcon } from "@heroicons/react/24/solid";
import { FireIcon } from "@phosphor-icons/react";

export function HomeNavigation() {
  const navItems = [
    {
      name: "Image",
      description: "Generate stunning images",
      link: "/generate",
      icon: <PhotoIcon className="size-8 text-blue-500" />,
      color: "bg-blue-500/10",
    },
    {
      name: "Video",
      description: "Create motion from text",
      link: "/video",
      icon: <VideoCameraIcon className="size-8 text-purple-500" />,
      color: "bg-purple-500/10",
    },
    {
      name: "Make",
      description: "Advanced creation tools",
      link: "/advance_generate",
      icon: <FireIcon className="size-8 text-orange-500" weight="fill" />,
      color: "bg-orange-500/10",
    },
    {
      name: "AI Apps",
      description: "Specialized AI tools",
      link: "/ai-apps",
      icon: <PuzzlePieceIcon className="size-8 text-green-500" />,
      color: "bg-green-500/10",
    },
  ];

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 px-4 md:grid-cols-4">
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.link}
          className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white/5 p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-neutral-100 hover:shadow-md active:scale-[0.98] dark:border-white/10 dark:hover:bg-white/10"
        >
          <div
            className={`rounded-full p-4 ${item.color} transition-transform duration-300 group-hover:scale-110`}
          >
            {item.icon}
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
              {item.name}
            </h3>
            <p className="mt-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              {item.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
