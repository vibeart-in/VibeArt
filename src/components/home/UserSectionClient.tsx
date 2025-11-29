// src/components/home/UserSectionClient.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import CreditBadge from "@/src/components/home/CreditBadge";
import { NavbarButton } from "@/src/components/ui/resizable-navbar";
import { UserProfileDropdown } from "@/src/components/ui/UserProfileDropdown";
import { useNavInfo } from "@/src/hooks/useNavInfo";

import { Button } from "../ui/button";

/**
 * A skeleton loader to show while user data is being fetched.
 * This improves the user experience by preventing layout shifts.
 */
function UserSectionSkeleton() {
  return (
    <div className="flex h-10 shrink-0 animate-pulse items-center gap-4">
      <div className="size-8 rounded-xl bg-neutral-200 dark:bg-neutral-800"></div>
      <div className="size-10 rounded-2xl bg-neutral-200 dark:bg-neutral-800"></div>
    </div>
  );
}

export function UserSectionClient() {
  // Assume the hook returns a loading state
  const { data, isLoading } = useNavInfo();
  const { user, navInfo } = data || {};
  const router = useRouter();

  // 1. While loading, show a skeleton placeholder
  if (isLoading && !data) return <UserSectionSkeleton />;

  // 2. After loading, if there is no user, show login/signup buttons
  if (!user) {
    return (
      <div className="flex shrink-0 items-center gap-4">
        <NavbarButton href="/auth/login" variant="secondary">
          Login
        </NavbarButton>
        <NavbarButton href="/auth/signup" variant="primary">
          Sign up
        </NavbarButton>
      </div>
    );
  }

  // 3. After loading, if the user exists, show the authenticated UI
  return (
    <div className="flex shrink-0 items-center gap-1 md:gap-3 ">
      {navInfo?.subscription_tier === "free" && (
        <Button
          variant="secondary"
          className="hidden md:flex h-8 items-center justify-center rounded-xl border border-[#D9E825]/30 bg-black/20 text-xs font-bold leading-4 text-accent shadow-[0px_0px_8px_rgba(217,232,37,0.38)]"
          onClick={() => router.push("/pricing")}
        >
          Upgrade
        </Button>
      )}
      <CreditBadge credits={navInfo?.total_credits ?? 0} lowThreshold={100} />
      <UserProfileDropdown navInfo={navInfo ?? null} user={user ?? null} />
    </div>
  );
}
