"use client";

import { motion, AnimatePresence, Variants } from "motion/react";
import { useState } from "react";
import {
  HomeIcon,
  PencilSquareIcon,
  PuzzlePieceIcon,
  Squares2X2Icon,
  PhotoIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import Image from "next/image";
import { UserProfileDropdown } from "../ui/UserProfileDropdown";
import { useNavInfo } from "@/src/hooks/useNavInfo";
import CreditBadge from "./CreditBadge";

const navItems = [
  {
    name: "Home",
    icon: <HomeIcon className="h-6 w-6" />,
    link: "/home",
  },
  {
    name: "Image",
    icon: <PhotoIcon className="h-6 w-6" />,
    link: "/image/generate",
    isActive: true,
  },
  {
    name: "Edit",
    icon: <PencilSquareIcon className="h-6 w-6" />,
    link: "/image/edit",
  },
  {
    name: "AI Apps",
    icon: <PuzzlePieceIcon className="h-6 w-6" />,
    link: "/apps",
  },
  {
    name: "Gallery",
    icon: <Squares2X2Icon className="h-6 w-6" />,
    link: "/gallery",
  },
  {
    name: "Store",
    icon: <ShoppingBagIcon className="h-6 w-6" />,
    link: "/store",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: -20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

const logoVariants: Variants = {
  hidden: { x: -100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export function MainNavbar() {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const { data, isLoading } = useNavInfo();
  const { user, navInfo } = data || {};

  console.log(navInfo);
  console.log(user);
  const pct = Math.min(
    100,
    Math.round(((navInfo?.total_credits ?? 0) / 100) * 100)
  );
  const low = (navInfo?.total_credits ?? 0) < 10;
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 100,
        damping: 20,
      }}
      className="fixed z-50 w-full flex items-center justify-between py-2 px-8"
    >
      {/* Logo Section */}
      <motion.div variants={logoVariants} initial="hidden" animate="visible">
        <Link
          href="/"
          className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black group"
        >
          <motion.div>
            <Image
              src="/images/newlogo.png"
              alt="logo"
              width={30}
              height={30}
            />
          </motion.div>
          <motion.p
            className="text-2xl font-bold text-white"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            Aura
            <motion.span className="text-accent">.</motion.span>
            ai
          </motion.p>
        </Link>
      </motion.div>

      {/* Navigation Links */}
      <motion.div
        className="box-border flex items-center rounded-[24px] border border-solid border-white/30 bg-black/50 backdrop-blur-sm"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        whileHover={{
          borderColor: "rgba(255, 255, 255, 0.5)",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.ul
          layout
          className="flex w-full px-3 py-2 items-center justify-start gap-2"
        >
          {navItems.map((item, index) => (
            <motion.li
              layout
              key={item.name}
              variants={itemVariants}
              className="relative"
              onHoverStart={() => setHoveredItem(index)}
              onHoverEnd={() => setHoveredItem(null)}
              transition={{
                layout: { type: "spring", stiffness: 300, damping: 24 },
              }}
            >
              <Link
                href={item.link}
                className={`flex px-4 py-2.5 items-center justify-center rounded-[16px] transition-all duration-300 relative overflow-hidden ${
                  item.isActive
                    ? "bg-[#D9E825] text-black shadow-lg"
                    : "hover:bg-gray-700 text-white"
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: item.isActive ? 0 : 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.icon}
                </motion.div>

                <AnimatePresence>
                  {(hoveredItem === index || item.isActive) && (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{
                        type: "tween",
                      }}
                      className="ml-2"
                    >
                      <span className="font-medium">{item.name}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>

      {/* User Profile Section */}
      <div className="flex gap-4 shrink-0 items-center">
        {navInfo?.subscription_tier === "free" ? (
          <motion.button
            className="w-[108px] h-8 bg-black/20 border border-[#D9E825]/30 shadow-[0px_0px_8px_rgba(217,232,37,0.38)] rounded-xl flex items-center justify-center font-bold text-[13px] leading-4 text-accent"
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 0px 12px rgba(217, 232, 37, 0.5)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            Upgrade
          </motion.button>
        ) : (
          <CreditBadge
            credits={navInfo?.total_credits ?? 0}
            lowThreshold={100}
          />
        )}
        <motion.div>
          {/* <UserProfile /> */}
          <UserProfileDropdown navInfo={navInfo ?? null} user={user ?? null} />
        </motion.div>
      </div>
    </motion.nav>
  );
}
