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
import { GradientComponent } from "./Gradient";


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

// Re-using the gradient colors from your original snippet
const gradientColors = {
  primary: "#4E93FF",
  secondary: "#639CF2",
  accent1: "#D5FDB9",
  accent2: "#E4F9FF",
  accent3: "#ED74E2",
  highlight1: "#F3001D",
  highlight2: "#FF7EEA",
};

const Footer = () => {
  return (
    <footer className="relative mt-32 text-white">
      {/* The main content container with your glass effect */}
      <GlassPaneBG paneWidth={55}>
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-8">
          {/* Top section: Brand, Links */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Column 1: Brand Info & CTA */}
            <div className="flex flex-col items-start gap-4">
              <a href="#" className="flex items-center space-x-2">
                <Image // Using next/image for optimization
                  src="/images/newlogo.png"
                  alt="Aura.ai logo"
                  width={40}
                  height={40}
                />
                <p className="text-4xl font-bold">
                  Aura<span className="text-[#D9E825]">.</span>ai
                </p>
              </a>
              <p className="max-w-xs pt-2 text-white/70">
                The future of AI-powered creative tooling, built for professionals.
              </p>
              {/* Your exact motion button, preserved */}
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

            {/* Columns 2 & 3: Dynamic Links */}
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

          {/* Bottom section: Copyright and Social Links */}
          <div className="mr-80 mt-20 flex flex-col items-center justify-between gap-6 border-t border-white/20 pt-8 sm:flex-row">
            <p className="text-sm text-white/50">
              &copy; {new Date().getFullYear()} Aura.ai. All Rights Reserved.
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

        {/* Decorative Image - positioned absolutely to not affect layout */}
        {/* It's hidden on smaller screens to prevent clutter */}
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
        <div className="absolute inset-x-0 -bottom-2 z-0 h-[120%] bg-black/5 !backdrop-blur-lg [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="absolute inset-x-0 -bottom-2 z-0 h-[120%] bg-black/5 !backdrop-blur-lg [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="absolute inset-x-0 -bottom-2 z-0 h-[120%] bg-black/5 !backdrop-blur-lg [mask-image:linear-gradient(to_bottom,white,transparent)]" />
      </GlassPaneBG>
      {/* Background Gradient - using your component */}
      <div className="absolute -top-40 left-1/2 -z-10 -translate-x-1/2">
        <GradientComponent colors={gradientColors} sizeVW={150} isAnimated={true} />
      </div>
    </footer>
  );
};

export default Footer;
