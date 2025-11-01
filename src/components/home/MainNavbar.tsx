"use client";
import {
  HomeIcon,
  PencilSquareIcon,
  PuzzlePieceIcon,
  PhotoIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/solid";
import { FireIcon } from "@phosphor-icons/react";
import { User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

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
import { createClient } from "@/src/lib/supabase/client";

import { UserSectionClient } from "./UserSectionClient";

export default function MainNavbar() {
  const navItems = [
    {
      name: "Home",
      link: "/image/home",
      icon: <HomeIcon className="size-5" />,
    },
    {
      name: "Image",
      link: "/image/generate",
      icon: <PhotoIcon className="size-5" />,
    },
    {
      name: "Video",
      link: "/image/video",
      icon: <VideoCameraIcon className="size-5" />,
    },
    {
      name: "Edit",
      link: "/image/edit",
      icon: <PencilSquareIcon className="size-5" />,
    },
    {
      name: "Make",
      link: "/image/advance_generate",
      icon: <FireIcon className="size-5" weight="fill" />,
    },
    {
      name: "AI Apps",
      link: "/image/ai-apps",
      icon: <PuzzlePieceIcon className="size-5" />,
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

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
