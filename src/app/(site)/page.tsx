// Make sure this is a client component to use hooks and Framer Motion
"use client";

import { motion, Variants } from "motion/react";
import dynamic from "next/dynamic";

// --- STATICALLY IMPORT "ABOVE THE FOLD" COMPONENTS ---
// The Hero is the first thing users see, so it should load instantly for the best LCP.
import Hero from "../../components/landing/Hero";
import { RaycastComponent } from "../../components/ui/RaycastBackground";

// --- CREATE A LOADING PLACEHOLDER ---
// This component will be shown while a lazy-loaded section is being fetched.
// Giving it a min-height prevents the layout from jumping around (improves CLS).
const SectionLoader = () => <div className="min-h-screen w-full" />;

// --- DYNAMICALLY IMPORT "BELOW THE FOLD" COMPONENTS ---
// `next/dynamic` creates a separate JavaScript chunk for each of these components.
// The `loading` option specifies our placeholder to show while the chunk is downloaded.
const PrivacySection = dynamic(() => import("../../components/landing/PrivacySection"), { loading: () => <SectionLoader /> });
const EditSection = dynamic(() => import("../../components/landing/EditSection"), { loading: () => <SectionLoader /> });
const EditBranding = dynamic(() => import("../../components/landing/EditBranding"), { loading: () => <SectionLoader /> });
const EditShowcase = dynamic(() => import("../../components/landing/EditShowcase"), { loading: () => <SectionLoader /> });
const Takecontrol = dynamic(() => import("../../components/landing/Takecontrol"), { loading: () => <SectionLoader /> });
const UpscaleSection = dynamic(() => import("../../components/landing/UpscaleSection"), { loading: () => <SectionLoader /> });
const ContactUs = dynamic(() => import("../../components/landing/ContactUs"), { loading: () => <SectionLoader /> });
const EndSection = dynamic(() => import("../../components/landing/EndSection"), { loading: () => <SectionLoader /> });


const Page = () => {
  // --- DEFINE ANIMATION VARIANTS ---
  // We can define the animation once and reuse it for every section.
  const sectionVariants: Variants = {
    // The state before the element is in view
    hidden: { opacity: 0, y: 50 },
    // The state when the element is in view
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <main>
      <div className="relative smooth-scroll overflow-hidden">
        {/* === PART 1: STATIC CONTENT (LOADS IMMEDIATELY) === */}
        <Hero />
        <div className="relative">
          <div className="w-screen h-56 bg-gradient-to-t from-black to-transparent z-10"></div>
          <RaycastComponent />
          <div className="w-screen h-56 bg-gradient-to-t from-[#0a0b08] to-black z-10"></div>
        </div>

        {/* === PART 2: LAZY-LOADED & ANIMATED CONTENT === */}
        {/*
          Each section is wrapped in a `motion.div`.
          - `variants`: Connects to our animation definition.
          - `initial="hidden"`: Starts in the 'hidden' state (opacity: 0, y: 50).
          - `whileInView="visible"`: Transitions to the 'visible' state when it enters the viewport.
          - `viewport`: Configures the trigger.
            - `once: true`: The animation only plays once. Crucial for performance.
            - `amount: 0.2`: Triggers the animation when 20% of the section is visible.
        */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <PrivacySection />
        </motion.div>

        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <EditSection />
        </motion.div>

        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <EditBranding />
        </motion.div>

        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <EditShowcase />
        </motion.div>

        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <Takecontrol />
        </motion.div>

        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <UpscaleSection />
        </motion.div>

        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <ContactUs />
        </motion.div>
        
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <EndSection />
        </motion.div>
      </div>
    </main>
  );
};

export default Page;