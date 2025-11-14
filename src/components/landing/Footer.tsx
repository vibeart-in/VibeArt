import {
  DiscordLogoIcon,
  GithubLogoIcon,
  InstagramLogoIcon,
  LinkedinLogoIcon,
  TwitterLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import * as motion from "motion/react-client";
import Image from "next/image";

import GlassPaneBG from "./GlassPaneBG";
import { NavbarLogo } from "../ui/resizable-navbar";

// --- DATA FOR EASY UPDATES ---
// This makes managing links simple. Just edit this list.
const footerLinks = [
  {
    title: "Product",
    links: [
      { name: "Create", href: "/image/generate" },
      { name: "Edit", href: "/image/edit" },
      { name: "Upscale", href: "/image/upscale" },
      { name: "AI Apps", href: "/image/apps" },
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

const Footer = () => {
  return (
    <footer className="relative mt-32 text-white">
      {/* <GlassPaneBG paneWidth={55}> */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="flex flex-col items-start gap-4">
            <div className="relative flex flex-col items-start px-2 py-1">
              <div className="flex items-center space-x-2">
                <img src="/images/newlogo.png" alt="logo" width={40} height={40} />
                <motion.p className="text-4xl font-bold text-white" whileHover={{ scale: 1.05 }}>
                  vibeart<span className="text-accent">.</span>
                </motion.p>
              </div>
              <motion.span
                className="mt-1 text-xs tracking-widest text-white/70"
                animate={{ opacity: [1, 0.8, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                where creativity vibes.
              </motion.span>
            </div>

            <p className="max-w-xs pt-2 text-white/70">
              The future of AI-powered creative tooling, built for professionals.
            </p>
            <motion.a
              href="/image/generate"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="relative mt-4 flex items-center justify-center rounded-[13px] border-2 border-[#d8e825bd] bg-[linear-gradient(260deg,rgba(217,232,37,0.25)_1%,rgba(217,232,37,0.25)_20%,rgba(26,26,29,0.025)_100%)] p-4 px-12 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.16)] backdrop-blur-xl"
            >
              <span className="font-century-gothic text-xs font-semibold leading-[17px] tracking-widest text-[#D9E825]">
                GET STARTED
              </span>
            </motion.a>
          </div>

          <div className="mr-32 grid grid-cols-2 lg:col-span-2">
            {footerLinks.map((column) => (
              <div key={column.title}>
                <h3 className="text-base font-semibold uppercase tracking-wider text-white/90">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-white/80 transition-colors duration-200 hover:text-accent"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mr-80 mt-20 flex flex-col items-center justify-between gap-6 border-t border-white/20 pt-8 sm:flex-row">
          <p className="text-sm text-white/50">
            &copy; {new Date().getFullYear()} Vibeart.in. All Rights Reserved.
          </p>
          <div className="flex items-center space-x-6">
            {socialLinks.map((social) => (
              <motion.a
                key={social.name}
                href={social.href}
                aria-label={social.name}
                whileHover={{ y: -2, scale: 1.1 }}
                className="text-white/60 transition-colors hover:text-white"
              >
                <social.icon strokeWidth={1.5} size={22} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 z-10">
        <Image
          src={
            "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/footer/footerMain.webp"
          }
          width={500}
          height={500}
          alt="Decorative abstract graphic"
          className=""
        />
      </div>
      {/* <div className="absolute inset-x-0 -bottom-2 z-0 h-[120%] bg-black/5 !backdrop-blur-lg [mask-image:linear-gradient(to_bottom,white,transparent)]" /> */}
      {/* <div className="absolute inset-x-0 -bottom-2 z-0 h-[120%] bg-black/5 !backdrop-blur-lg [mask-image:linear-gradient(to_bottom,white,transparent)]" /> */}
      {/* <div className="absolute inset-x-0 -bottom-2 z-0 h-[120%] bg-black/5 !backdrop-blur-lg [mask-image:linear-gradient(to_bottom,white,transparent)]" /> */}
      {/* </GlassPaneBG> */}
      <div className="absolute -top-32 left-1/2 -z-10 h-screen w-[150vw] -translate-x-1/2">
        <Image
          src={
            "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/gradients/pink.webp"
          }
          alt="gradients"
          className="size-full object-cover object-top"
          fill
        />
      </div>
    </footer>
  );
};

export default Footer;
