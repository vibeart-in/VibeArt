"use client";

import { EnvelopeIcon, ImageIcon, SignOutIcon, StarIcon, UserIcon } from "@phosphor-icons/react";
import { User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { type NavInfoData } from "@/src/hooks/useNavInfo";
import { createClient } from "@/src/lib/supabase/client";

import { UserProfile } from "../UserAvatar";

const UserProfileDropdown = ({
  user,
  navInfo,
}: {
  user: User | null;
  navInfo: NavInfoData | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/home");
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const options = [
    {
      label: user?.email || "Email",
      onClick: () => navigator.clipboard.writeText(user?.email || ""),
      Icon: <EnvelopeIcon weight="fill" className="size-4" />,
      isEmail: true,
    },
    {
      label: `Your in ${navInfo?.subscription_tier}`,
      onClick: () => router.push("/user/dashboard"),
      Icon: <StarIcon weight="fill" className="size-4" />,
      isEmail: false,
    },
    {
      label: "Dashboard",
      onClick: () => router.push("/user/dashboard"),
      Icon: <UserIcon weight="fill" className="size-4" />,
      isEmail: false,
    },
    {
      label: "Gallery / Creations",
      onClick: () => router.push("/gallery"),
      Icon: <ImageIcon weight="fill" className="size-4" />,
      isEmail: false,
    },
    {
      label: "Logout",
      onClick: logout,
      Icon: <SignOutIcon weight="fill" className="size-4" />,
      isEmail: false,
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex w-full items-center justify-center rounded-xl border-none bg-transparent transition-colors hover:bg-accent/50"
      >
        <UserProfile user={user} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: -5, scale: 0.95, filter: "blur(10px)" }}
            animate={{ y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ y: -5, scale: 0.95, opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: "circInOut", type: "spring" }}
            className="absolute z-10 mt-2 flex w-56 flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a]/95 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl md:right-1"
          >
            {options && options.length > 0 ? (
              <div className="p-1.5">
                {options.map((option, index) => (
                  <React.Fragment key={option.label}>
                    {index === 1 && <div className="my-1.5 h-px bg-white/5" />}
                    {index === 4 && <div className="my-1.5 h-px bg-white/5" />}
                    <motion.button
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
                      onClick={option.onClick}
                      className={`flex w-full cursor-pointer items-center gap-x-3 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-colors hover:bg-white/5 ${
                        option.isEmail ? "text-white/50" : "text-white/90 hover:text-accent"
                      }`}
                    >
                      <span className={option.isEmail ? "text-white/40" : "text-white/70"}>
                        {option.Icon}
                      </span>
                      <span className={option.isEmail ? "truncate text-xs" : ""}>
                        {option.label}
                      </span>
                    </motion.button>
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="px-4 py-2 text-xs text-white/50">No options</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { UserProfileDropdown };
