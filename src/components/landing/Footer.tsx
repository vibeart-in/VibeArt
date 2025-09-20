import Image from "next/image";
import * as motion from "motion/react-client"; // Using your specified motion import
import {
  Twitter,
  Instagram,
  Linkedin,
  Github,
  MessageSquare,
} from "lucide-react";

// --- YOUR ORIGINAL COMPONENTS (used as-is) ---
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
  { icon: Twitter, href: "#", name: "Twitter" },
  { icon: Instagram, href: "#", name: "Instagram" },
  { icon: Linkedin, href: "#", name: "LinkedIn" },
  { icon: Github, href: "#", name: "GitHub" },
  { icon: MessageSquare, href: "#", name: "Community" }, // A good generic icon for Discord/Slack
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
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 relative z-10">
          {/* Top section: Brand, Links */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
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
              <p className="text-white/70 max-w-xs pt-2">
                The future of AI-powered creative tooling, built for
                professionals.
              </p>
              {/* Your exact motion button, preserved */}
              <motion.a
                href="/image/generate"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="relative flex items-center justify-center p-4 px-12 mt-4
								border-2 border-[#d8e825bd]
								backdrop-blur-xl
								rounded-[13px]
								bg-[linear-gradient(260deg,rgba(217,232,37,0.25)_1%,rgba(217,232,37,0.25)_20%,rgba(26,26,29,0.025)_100%)]
								shadow-[inset_0px_2px_4px_rgba(255,255,255,0.16)]"
              >
                <span className="font-century-gothic font-semibold text-xs tracking-widest leading-[17px] text-[#D9E825]">
                  GET STARTED
                </span>
              </motion.a>
            </div>

            {/* Columns 2 & 3: Dynamic Links */}
            <div className="lg:col-span-2 grid grid-cols-2 mr-32">
              {footerLinks.map((column) => (
                <div key={column.title}>
                  <h3 className="text-base font-semibold tracking-wider uppercase text-white/90">
                    {column.title}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {column.links.map((link) => (
                      <li key={link.name}>
                        <a
                          href={link.href}
                          className="text-white/80 hover:text-accent transition-colors duration-200"
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
          <div className="mt-20 mr-80 pt-8 border-t border-white/20 flex flex-col sm:flex-row justify-between items-center gap-6">
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
                  className="text-white/60 hover:text-white transition-colors"
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
            src={"/images/landing/footer/footerMain.png"}
            width={500}
            height={500}
            alt="Decorative abstract graphic"
            className=""
          />
        </div>
        <div
          className="z-0 absolute inset-x-0 -bottom-2 h-[120%] bg-black/5
			[mask-image:linear-gradient(to_bottom,white,transparent)] !backdrop-blur-lg"
        />
        <div
          className="z-0 absolute inset-x-0 -bottom-2 h-[120%] bg-black/5
			[mask-image:linear-gradient(to_bottom,white,transparent)] !backdrop-blur-lg"
        />
        <div
          className="z-0 absolute inset-x-0 -bottom-2 h-[120%] bg-black/5
			[mask-image:linear-gradient(to_bottom,white,transparent)] !backdrop-blur-lg"
        />
      </GlassPaneBG>
      {/* Background Gradient - using your component */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 -z-10">
        <GradientComponent
          colors={gradientColors}
          sizeVW={150}
          isAnimated={true}
        />
      </div>
    </footer>
  );
};

export default Footer;
