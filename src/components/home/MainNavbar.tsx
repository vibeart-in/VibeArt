"use client";
import {
  HomeIcon,
  PencilSquareIcon,
  PuzzlePieceIcon,
  PhotoIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/solid";
import { FireIcon, GraphIcon } from "@phosphor-icons/react";
import { ChevronDown, Folder } from "lucide-react";
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
    {
      name: "Canvas",
      link: "/canvas",
      icon: <GraphIcon size={24} weight="fill" />,
    },
  ];

  const mobileOnlyNavItems = [
    {
      name: "Creations",
      link: "/gallery",
      icon: <Folder fill="currentColor" className="size-5" />,
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
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-xl border border-accent bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent outline-none backdrop-blur-sm transition-all focus:bg-white/10 active:scale-95">
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
          </div>
        </MobileNavHeader>

        <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
          <div className="flex w-full flex-col gap-4">
            {/* Main nav items grid */}
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

            <div className="flex w-full items-center gap-2">
              {/* Mobile-only nav items */}
              {mobileOnlyNavItems.map((item, idx) => {
                const isHighlighted = isActiveRoute(pathname, item.link);
                return (
                  <a
                    key={`mobile-only-link-${idx}`}
                    href={item.link}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-xl border bg-black px-4 py-2 text-xs font-medium text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_2px_6px_rgba(0,0,0,1),0_0_15px_rgba(0,0,0,1)] backdrop-blur-md transition hover:bg-black/40 active:scale-95",
                      isHighlighted &&
                        "border-accent bg-accent/20 font-bold text-accent dark:text-accent",
                    )}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </a>
                );
              })}
              <UserSectionClient />
            </div>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
