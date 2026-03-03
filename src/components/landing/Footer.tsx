"use client";

import {
  DiscordLogoIcon,
  GithubLogoIcon,
  InstagramLogoIcon,
  LinkedinLogoIcon,
  TwitterLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import * as motion from "motion/react-client";
import { useInView, Variants } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

import GlassPaneBG from "./GlassPaneBG";
import { GradientComponent } from "./Gradient";

// --- DATA FOR EASY UPDATES ---
const footerLinks = [
  {
    title: "Product",
    links: [
      { name: "Create", href: "/generate" },
      { name: "Edit", href: "/edit" },
      { name: "Upscale", href: "/upscale" },
      { name: "AI Apps", href: "/apps" },
      { name: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Contact", href: "/contact" },
      { name: "Terms and services", href: "/terms-and-conditions" },
    ],
  },
];

const socialLinks = [
  { icon: TwitterLogoIcon, href: "#", name: "Twitter" },
  { icon: InstagramLogoIcon, href: "#", name: "Instagram" },
  { icon: LinkedinLogoIcon, href: "#", name: "LinkedIn" },
  { icon: GithubLogoIcon, href: "#", name: "GitHub" },
  { icon: DiscordLogoIcon, href: "#", name: "Community" },
];

const gradientColors = {
  primary: "#4E93FF",
  secondary: "#639CF2",
  accent1: "#D5FDB9",
  accent2: "#E4F9FF",
  accent3: "#ED74E2",
  highlight1: "#F3001D",
  highlight2: "#FF7EEA",
};

// --- Shared animation variants ---
const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, margin: "0px 0px -80px 0px" });

  return (
    <footer ref={footerRef} className="relative mt-32 text-white">
      <GlassPaneBG paneWidth={55}>
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* ── Left Column: Logo + CTA ── */}
            <motion.div
              className="flex flex-col items-start gap-4"
              variants={fadeUpVariant}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              custom={0}
            >
              {/* Logo */}
              <motion.div
                className="relative flex flex-col items-start px-2 py-1"
                variants={fadeUpVariant}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                custom={0.05}
              >
                <div className="flex items-center space-x-2">
                  <motion.img
                    src="/images/newlogo.png"
                    alt="logo"
                    width={40}
                    height={40}
                    initial={{ opacity: 0, rotate: -15, scale: 0.7 }}
                    animate={isInView ? { opacity: 1, rotate: 0, scale: 1 } : {}}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                  />
                  <motion.p
                    className="text-4xl font-bold text-white"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.18 }}
                  >
                    vibeart<span className="text-accent">.</span>
                  </motion.p>
                </div>
                <motion.span
                  className="mt-1 text-xs tracking-widest text-white/70"
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  initial={{ opacity: 0 }}
                >
                  where creativity vibes.
                </motion.span>
              </motion.div>

              {/* Description */}
              <motion.p
                className="max-w-xs pt-2 text-white/70"
                variants={fadeUpVariant}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                custom={0.2}
              >
                The future of AI-powered creative tooling, built for professionals.
              </motion.p>

              {/* CTA Button */}
              <motion.a
                href="/image"
                variants={fadeUpVariant}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                custom={0.3}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="relative mt-4 flex items-center justify-center overflow-hidden rounded-[13px] border-2 border-[#d8e825bd] bg-[linear-gradient(260deg,rgba(217,232,37,0.25)_1%,rgba(217,232,37,0.25)_20%,rgba(26,26,29,0.025)_100%)] p-4 px-12 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.16)] backdrop-blur-xl"
              >
                {/* shimmer sweep on hover */}
                <motion.span
                  className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/10"
                  whileHover={{ translateX: "200%" }}
                  transition={{ duration: 0.55, ease: "easeInOut" }}
                />
                <span className="font-century-gothic relative z-10 text-xs font-semibold leading-[17px] tracking-widest text-[#D9E825]">
                  GET STARTED
                </span>
              </motion.a>
            </motion.div>

            {/* ── Right Column: Links ── */}
            <div className="mr-32 grid grid-cols-2 lg:col-span-2">
              {footerLinks.map((column, colIdx) => (
                <motion.div
                  key={column.title}
                  variants={fadeUpVariant}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  custom={0.15 + colIdx * 0.12}
                >
                  <h3 className="text-base font-semibold uppercase tracking-wider text-white/90">
                    {column.title}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {column.links.map((link, linkIdx) => (
                      <motion.li
                        key={link.name}
                        initial={{ opacity: 0, x: -12 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{
                          duration: 0.45,
                          ease: "easeOut",
                          delay: 0.25 + colIdx * 0.1 + linkIdx * 0.06,
                        }}
                      >
                        <a
                          href={link.href}
                          className="text-white/80 transition-colors duration-200 hover:text-accent"
                        >
                          {link.name}
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Bottom Bar ── */}
          <motion.div
            className="mr-80 mt-20 flex flex-col items-center justify-between gap-6 border-t border-white/20 pt-8 sm:flex-row"
            variants={fadeUpVariant}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            custom={0.5}
          >
            <p className="text-sm text-white/50">
              &copy; {new Date().getFullYear()} Vibeart.in. All Rights Reserved.
            </p>
            <div className="flex items-center space-x-6">
              {socialLinks.map((social, i) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  initial={{ opacity: 0, y: 12, scale: 0.7 }}
                  animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 18,
                    delay: 0.55 + i * 0.07,
                  }}
                  whileHover={{ y: -3, scale: 1.15 }}
                  className="text-white/60 transition-colors hover:text-white"
                >
                  <social.icon strokeWidth={1.5} size={22} />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Decorative image ── */}
        <motion.div
          className="absolute bottom-0 right-0 z-10"
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <Image
            src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/footer/footerMain.webp"
            width={500}
            height={500}
            alt="Decorative abstract graphic"
          />
        </motion.div>

        <div className="absolute inset-x-0 -bottom-2 z-0 h-[120%] bg-black/5 !backdrop-blur-lg [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="absolute inset-x-0 -bottom-2 z-0 h-[120%] bg-black/5 !backdrop-blur-lg [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="absolute inset-x-0 -bottom-2 z-0 h-[120%] bg-black/5 !backdrop-blur-lg [mask-image:linear-gradient(to_bottom,white,transparent)]" />
      </GlassPaneBG>

      {/* ── Gradient Rising Up ── */}
      {/* Outer div owns the absolute centering; inner motion.div owns only the animation
          so Framer Motion never clobbers the -50% translateX centering. */}
      <div className="absolute -top-40 left-1/2 -z-10 -translate-x-1/2">
        <motion.div
          initial={{ y: 120, opacity: 0, scale: 0.85 }}
          animate={isInView ? { y: 0, opacity: 1, scale: 1 } : {}}
          transition={{ duration: 4, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        >
          <GradientComponent colors={gradientColors} sizeVW={150} isAnimated={true} />
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
