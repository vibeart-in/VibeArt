"use client";
import {
  HomeIcon,
  PencilSquareIcon,
  PuzzlePieceIcon,
  PhotoIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/solid";
import { FireIcon } from "@phosphor-icons/react";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/src/components/ui/resizable-navbar";
import { cn } from "@/src/lib/utils";

import GenerationHistory from "./GenerationHistory";
import { UserSectionClient } from "./UserSectionClient";

export default function MainNavbar() {
  const navItems = [
    {
      name: "Home",
      link: "/home",
      icon: <HomeIcon className="size-5" />,
    },
    {
      name: "Image",
      link: "/generate",
      icon: <PhotoIcon className="size-5" />,
    },
    {
      name: "Video",
      link: "/video",
      icon: <VideoCameraIcon className="size-5" />,
    },
    {
      name: "Edit",
      link: "/edit",
      icon: <PencilSquareIcon className="size-5" />,
    },
    {
      name: "Make",
      link: "/advance_generate",
      icon: <FireIcon className="size-5" weight="fill" />,
    },
    {
      name: "AI Apps",
      link: "/ai-apps",
      icon: <PuzzlePieceIcon className="size-5" />,
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  function isActiveRoute(pathname: string, link: string) {
    if (link === "/home") return pathname === "/" || pathname === "/home";
    return pathname.startsWith(link);
  }

  return (
    <Navbar>
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <UserSectionClient />
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-xl border border-accent bg-accent/30 px-4 py-1.5 text-sm font-medium text-accent outline-none backdrop-blur-sm transition-all focus:bg-white/10 active:scale-95">
              <span>History</span>
              <ChevronDown className="size-4 text-white/50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[200px] border-white/10 bg-[#0C0C0C] p-0"
            >
              <GenerationHistory isMobileDropdown />
            </DropdownMenuContent>
          </DropdownMenu>
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
          <div className="grid w-full grid-cols-3 gap-2">
            {navItems.map((item, idx) => {
              const isHighlighted = isActiveRoute(pathname, item.link);
              return (
                <a
                  key={`mobile-link-${idx}`}
                  href={item.link}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-1 rounded-2xl border p-2 text-center font-semibold text-neutral-600 transition-colors dark:text-neutral-300",
                    isHighlighted &&
                      "border-accent bg-accent/20 font-bold text-accent dark:text-accent",
                  )}
                >
                  {item.icon}
                  <span className="block text-xs">{item.name}</span>
                </a>
              );
            })}
          </div>
          <UserSectionClient />
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
