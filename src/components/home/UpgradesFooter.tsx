"use client";

import Link from "next/link";
import React from "react";

import { useNavInfo } from "@/src/hooks/useNavInfo";

const UpgradesFooter = () => {
  const { data } = useNavInfo();
  const { navInfo } = data || {};

  if (navInfo?.subscription_tier !== "free") {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full bg-[#D9E825]/70 py-1 text-center backdrop-blur-md">
      <Link
        href="/pricing"
        className="text-sm font-bold text-black transition-opacity hover:opacity-80"
      >
        Upgrade
      </Link>
    </div>
  );
};

export default UpgradesFooter;
