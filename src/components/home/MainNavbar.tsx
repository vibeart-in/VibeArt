"use client";
import {
  HomeIcon,
  PencilSquareIcon,
  PuzzlePieceIcon,
  PhotoIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/solid";
import { FireIcon, GraphIcon } from "@phosphor-icons/react";
import { ChevronDown, Folder, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  
  const generateSubItems = [
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
  ];

  const navItems = [
    {
      name: "Home",
      link: "/home",
      icon: <HomeIcon className="size-5" />,
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

  // Custom NavItems with Generate dropdown
  const NavItemsWithDropdown = () => {
    const [hovered, setHovered] = useState<number | null>(null);
    const pathname = usePathname();

    // Check if any generate sub-item is active
    const isGenerateActive = generateSubItems.some(item => isActiveRoute(pathname, item.link));
    const activeItemIndex = navItems.findIndex((item) => isActiveRoute(pathname, item.link));
    
    // For Generate menu, we treat it as index -1 (before navItems)
    const generateMenuIndex = -1;
    
    // Determine highlight: hover takes precedence, then check active routes
    let highlightedItemIndex = hovered;
    if (hovered === null) {
      if (isGenerateActive) {
        highlightedItemIndex = generateMenuIndex;
      } else if (activeItemIndex !== -1) {
        highlightedItemIndex = activeItemIndex;
      }
    }

    return (
      <motion.div
        onMouseLeave={() => {
          setHovered(null);
          setIsGenerateOpen(false);
        }}
        className="absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-base font-bold text-zinc-600 transition duration-200 hover:text-zinc-800 lg:flex lg:space-x-2"
      >
        {navItems.map((item, idx) => {
          const isHighlighted = highlightedItemIndex === idx;

          return (
            <a
              key={`link-${idx}`}
              href={item.link}
              onMouseEnter={() => {
                setHovered(idx);
                setIsGenerateOpen(false);
              }}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 transition-colors duration-200",
                isHighlighted
                  ? "text-black dark:text-black"
                  : "text-neutral-600 dark:text-neutral-200"
              )}
            >
              <span className="relative z-20 flex items-center gap-2">
                {item.icon}
                {item.name}
              </span>

              {isHighlighted && (
                <motion.div
                  layoutId="hovered"
                  className="absolute inset-0 size-full rounded-full bg-accent"
                />
              )}
            </a>
          );
        })}
        {/* Generate Dropdown Menu */}
        <div
          className="relative"
          onMouseEnter={() => {
            setHovered(generateMenuIndex);
            setIsGenerateOpen(true);
          }}
        >
          <div
            className={cn(
              "relative flex cursor-pointer items-center gap-2 px-4 py-2 transition-colors duration-200",
              highlightedItemIndex === generateMenuIndex
                ? "text-black dark:text-black"
                : "text-neutral-600 dark:text-neutral-200"
            )}
          >
            <span className="relative z-20 flex items-center gap-2">
              <Sparkles className="size-5" />
              Generate
              <ChevronDown className={cn(
                "size-4 transition-transform duration-200",
                isGenerateOpen && "rotate-180"
              )} />
            </span>

            {highlightedItemIndex === generateMenuIndex && (
              <motion.div
                layoutId="hovered"
                className="absolute inset-0 size-full rounded-full bg-accent"
              />
            )}
          </div>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isGenerateOpen && (
              <motion.div
                initial={{ y: -5, scale: 0.95, filter: "blur(10px)" }}
                animate={{ y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ y: -5, scale: 0.95, opacity: 0, filter: "blur(10px)" }}
                transition={{ duration: 0.6, ease: "circInOut", type: "spring" }}
                className="absolute left-0 z-50 mt-2 flex w-48 flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a] shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
              >
                <div className="p-1.5">
                  {generateSubItems.map((item, index) => (
                    <motion.a
                      key={item.name}
                      href={item.link}
                      initial={{
                        opacity: 0,
                        x: 10,
                        scale: 0.95,
                        filter: "blur(10px)",
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        filter: "blur(0px)",
                      }}
                      exit={{
                        opacity: 0,
                        x: 10,
                        scale: 0.95,
                        filter: "blur(10px)",
                      }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.1,
                        ease: "easeInOut",
                        type: "spring",
                      }}
                      whileTap={{
                        scale: 0.95,
                        transition: {
                          duration: 0.2,
                          ease: "easeInOut",
                        },
                      }}
                      className="flex w-full cursor-pointer items-center gap-x-3 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium text-white/90 transition-colors hover:bg-white/5 hover:text-accent"
                    >
                      <span className="text-white/70">{item.icon}</span>
                      <span>{item.name}</span>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Regular Nav Items */}
        
      </motion.div>
    );
  };

  return (
    <Navbar>
      <NavBody>
        <NavbarLogo />
        <NavItemsWithDropdown />
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
              {/* Mobile: Show all items including generate sub-items */}
              {[...navItems, ...generateSubItems].map((item, idx) => {
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
