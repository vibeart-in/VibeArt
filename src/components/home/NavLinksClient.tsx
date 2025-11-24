"use client";

import {
  HomeIcon,
  PencilSquareIcon,
  PuzzlePieceIcon,
  PhotoIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/solid";
import { FireIcon } from "@phosphor-icons/react";
import { LazyMotion, domMax } from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, memo } from "react";

type NavItemT = {
  name: string;
  icon: React.ReactNode;
  link: string;
};

const NAV_ITEMS: NavItemT[] = [
  { name: "Home", icon: <HomeIcon className="size-5" />, link: "/home" },
  {
    name: "Image",
    icon: <PhotoIcon className="size-5" />,
    link: "/image",
  },
  {
    name: "Edit",
    icon: <PencilSquareIcon className="size-5" />,
    link: "/edit",
  },
  {
    name: "Make",
    icon: <FireIcon className="size-5" weight="fill" />,
    link: "/advance_generate",
  },
  {
    name: "Video",
    icon: <VideoCameraIcon className="size-5" />,
    link: "/video",
  },
  {
    name: "AI Apps",
    icon: <PuzzlePieceIcon className="size-5" />,
    link: "/ai-apps",
  },
];

function isActiveRoute(pathname: string, link: string) {
  if (link === "/home") return pathname === "/" || pathname === "/home";
  return pathname.startsWith(link);
}

// Hover-prefetch without changing animation behavior
function HoverPrefetchLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  return (
    <Link
      href={href}
      prefetch={false}
      onMouseEnter={() => router.prefetch(href)}
      className={className}
    >
      {children}
    </Link>
  );
}

const NavButton = memo(function NavButton({ item, active }: { item: NavItemT; active: boolean }) {
  const [hovered, setHovered] = useState(false);
  const show = active || hovered;

  return (
    <m.li
      layout // `layout` on the parent `li` handles the smooth resizing of the whole navbar
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative"
      // You can keep this spring for a nice feel when the active item moves
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <HoverPrefetchLink
        href={item.link}
        className={`relative flex items-center justify-center overflow-hidden rounded-2xl p-2 transition-colors duration-200 ${
          active ? "bg-[#D9E825] text-black shadow-lg" : "text-white hover:bg-white/10"
        }`}
      >
        <m.div
          whileHover={{ scale: 1.1, rotate: active ? 0 : 5 }}
          whileTap={{ scale: 0.95 }}
          className="z-10" // Ensure icon is on top
        >
          {item.icon}
        </m.div>

        {/* Animate max-width instead of width. No measurement needed! */}
        <m.div
          className="ml-2 overflow-hidden" // Keep overflow-hidden here
          initial={{ maxWidth: 0 }}
          animate={{ maxWidth: show ? "150px" : 0 }} // Use a value larger than any label
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* The span now just needs to prevent text wrapping */}
          <span className="whitespace-nowrap font-medium">{item.name}</span>
        </m.div>
      </HoverPrefetchLink>
    </m.li>
  );
});

export function NavLinksClient() {
  const pathname = usePathname();
  const items = useMemo(() => NAV_ITEMS, []);

  return (
    <LazyMotion features={domMax}>
      <m.div
        className="flex items-center rounded-2xl border border-solid border-white/30 bg-black/50 backdrop-blur-sm"
        whileHover={{}}
      >
        <m.ul layout className="flex w-full items-center justify-start gap-2 px-2 py-1">
          {items.map((item) => (
            <NavButton key={item.name} item={item} active={isActiveRoute(pathname, item.link)} />
          ))}
        </m.ul>
      </m.div>
    </LazyMotion>
  );
}
