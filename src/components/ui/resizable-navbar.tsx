"use client";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useRef, useState } from "react";

import { cn } from "@/src/lib/utils";

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
    icon?: React.ReactNode;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div
      ref={ref}
      // IMPORTANT: Change this to class of `fixed` if you want the navbar to be fixed
      className={cn("fixed inset-x-0 z-40 w-full", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ visible?: boolean }>, { visible })
          : child,
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(6px)" : "blur(5px)",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "40%" : "100%",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      style={{
        minWidth: "1000px",
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-3xl bg-transparent px-4 py-2 dark:bg-neutral-950/50 lg:flex",
        visible && "border-2 border-[#3B3B3B]/70 bg-white/80 dark:bg-neutral-950/50",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

function isActiveRoute(pathname: string, link: string) {
  if (link === "/home") return pathname === "/" || pathname === "/home";
  return pathname.startsWith(link);
}

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const pathname = usePathname();

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-base font-bold text-zinc-600 transition duration-200 hover:text-zinc-800 lg:flex lg:space-x-2",
        className,
      )}
    >
      {items.map((item, idx) => {
        const active = isActiveRoute(pathname, item.link);
        const isHighlighted = hovered === idx || active;

        return (
          <a
            key={`link-${idx}`}
            href={item.link}
            onClick={onItemClick}
            onMouseEnter={() => setHovered(idx)}
            onMouseLeave={() => setHovered(-1)}
            className={`relative flex items-center gap-2 px-4 py-2 text-neutral-600 dark:text-neutral-200 ${isHighlighted ? "text-black dark:text-black" : ""} transition-colors duration-200`}
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
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(5px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "90%" : "100%",
        paddingRight: visible ? "12px" : "0px",
        paddingLeft: visible ? "12px" : "0px",
        borderRadius: visible ? "20px" : "2rem",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-2 lg:hidden",
        visible && "bg-white/80 dark:bg-neutral-950/50",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({ children, className }: MobileNavHeaderProps) => {
  return (
    <div className={cn("flex w-full flex-row items-center justify-between", className)}>
      {children}
    </div>
  );
};

export const MobileNavMenu = ({ children, className, isOpen }: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-2xl bg-white px-4 py-8 shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] backdrop-blur-xl dark:bg-neutral-950/90",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) => {
  return isOpen ? (
    <IconX className="text-black dark:text-white" onClick={onClick} />
  ) : (
    <IconMenu2 className="text-black dark:text-white" onClick={onClick} />
  );
};

export const NavbarLogo = ({ className }: { className?: string }) => {
  return (
    <Link
      href="/"
      className={cn(
        "relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black",
        className,
      )}
    >
      <img src="/images/newlogo.png" alt="logo" width={30} height={30} />
      <p className="text-2xl font-bold text-white">
        {/* Vibeart */}
        VibeArt<span className="text-accent">.</span>
      </p>
    </Link>
  );
};

export const NavbarButton = ({
  href,
  children,
  className,
  variant = "primary",
}: {
  href?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
} & (React.ComponentPropsWithoutRef<"a"> | React.ComponentPropsWithoutRef<"button">)) => {
  const baseStyles =
    "px-4 py-2 rounded-xl text-sm font-bold relative cursor-pointer inline-block text-center box-border transform transition-all duration-300 ease-out hover:scale-105  hover:shadow-lg active:scale-95 active:translate-y-0";

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-[#D9E825] to-[#E3D2BA] border border-[#D9E825] text-black hover:from-[#E3F235] hover:to-[#F0E0CC] hover:border-[#E3F235] hover:shadow-[0_8px_25px_rgba(217,232,37,0.3)] active:from-[#C5D020] active:to-[#D4C2A5]",
    secondary:
      "bg-transparent border border-accent text-black dark:text-white hover:bg-accent/10 hover:border-accent/80 hover:shadow-[0_4px_15px_rgba(0,0,0,0.1)] active:bg-accent/20",
  };

  return (
    <Link href={href || ""} className={cn(baseStyles, variantStyles[variant], className)} prefetch>
      {children}
    </Link>
  );
};
