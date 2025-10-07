"use client";

import { Copy, Pencil, LogOut } from "lucide-react";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile } from "../UserAvatar";
import { createClient } from "@/src/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { type NavInfoData } from "@/src/hooks/useNavInfo";

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
    router.push("/");
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const options = [
    {
      label: navInfo?.subscription_tier,
      onClick: () => console.log("Edit"),
      Icon: <Pencil className="h-4 w-4" />,
    },
    {
      label: "Duplicate",
      onClick: () => console.log("Duplicate"),
      Icon: <Copy className="h-4 w-4" />,
    },
    {
      label: "Logout",
      onClick: logout,
      Icon: <LogOut className="h-4 w-4" />,
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex w-full items-center justify-center rounded-xl border-none bg-transparent hover:bg-accent/50"
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
            className="absolute right-1 z-10 mb-2 flex w-48 flex-col gap-2 rounded-xl bg-[#111111] p-1 shadow-[0_0_20px_rgba(0,0,0,0.2)] backdrop-blur-md"
          >
            {options && options.length > 0 ? (
              options.map((option, index) => (
                <motion.button
                  initial={{
                    opacity: 0,
                    x: 10,
                    scale: 0.95,
                    filter: "blur(10px)",
                  }}
                  animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
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
                  whileHover={{
                    color: "hsl(var(--accent))",
                    transition: {
                      duration: 0.4,
                      ease: "easeInOut",
                    },
                  }}
                  whileTap={{
                    scale: 0.95,
                    transition: {
                      duration: 0.2,
                      ease: "easeInOut",
                    },
                  }}
                  key={option.label}
                  onClick={option.onClick}
                  className="flex w-full cursor-pointer items-center gap-x-2 rounded-lg px-2 py-3 text-left text-sm text-white"
                >
                  {option.Icon}
                  {option.label}
                </motion.button>
              ))
            ) : (
              <div className="px-4 py-2 text-xs text-white">No options</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { UserProfileDropdown };
