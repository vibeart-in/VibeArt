"use client";
import {
  HomeIcon,
  PencilSquareIcon,
  PuzzlePieceIcon,
  PhotoIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/solid";
import { FireIcon } from "@phosphor-icons/react";
import { useState } from "react";

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
      link: "/image",
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
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
          {navItems.map((item, idx) => (
            <a
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="relative text-neutral-600 dark:text-neutral-300"
            >
              <span className="block">{item.name}</span>
            </a>
          ))}
          <UserSectionClient />
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
