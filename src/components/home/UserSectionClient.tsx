// src/components/home/UserSectionClient.tsx
"use client";

import Link from "next/link";
import { useNavInfo } from "@/src/hooks/useNavInfo";
import CreditBadge from "@/src/components/home/CreditBadge";
import { UserProfileDropdown } from "@/src/components/ui/UserProfileDropdown";
import { NavbarButton } from "@/src/components/ui/resizable-navbar";

export function UserSectionClient() {
  const { data } = useNavInfo();
  const { user, navInfo } = data || {};

  // If user is not logged in, show login/signup buttons
  if (!user) {
    return (
      <div className="flex shrink-0 items-center gap-4">
        <NavbarButton href="/auth/login" variant="secondary">
          Login
        </NavbarButton>
        <NavbarButton href="/auth/signup" variant="primary">
          Create Now
        </NavbarButton>
      </div>
    );
  }

  // If user is logged in, show the existing authenticated UI
  return (
    <div className="flex shrink-0 items-center gap-4">
      {navInfo?.subscription_tier === "free" && (
        <Link href="/pricing">
          <button className="flex h-8 w-[108px] items-center justify-center rounded-xl border border-[#D9E825]/30 bg-black/20 text-[13px] font-bold leading-4 text-accent shadow-[0px_0px_8px_rgba(217,232,37,0.38)]">
            Upgrade
          </button>
        </Link>
      )}
      <CreditBadge credits={navInfo?.total_credits ?? 0} lowThreshold={100} />
      <div>
        <UserProfileDropdown navInfo={navInfo ?? null} user={user ?? null} />
      </div>
    </div>
  );
}
