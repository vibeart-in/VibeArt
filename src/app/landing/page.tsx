"use client";

import React from "react";

import ContactUs from "@/src/components/landing/ContactUs";
import PrivacySection from "@/src/components/landing/PrivacySection";

import {
  Hero,
  FeatureCard,
  FeaturesGrid,
  TestimonialsSection,
  FooterCTA,
  AiAppsCarousel,
} from "../../components/landing/LandingComponents";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black pb-32 text-foreground selection:bg-green-500/30">
      <Hero />

      <AiAppsCarousel />

      <FeatureCard
        title="Create Brand Identity - Pro & Fast"
        description="Generate logos, color palettes, and typography guidelines that perfectly match your vision. Ensure consistency across all your assets with our AI-powered brand guardrails."
        features={["Logo Generation", "Brand Guidelines", "Asset Consistency"]}
        imageSide="right"
        gradient="bg-green-400"
        badge="Brand Identity"
      />

      <FeatureCard
        title="Brand Memory & Assets"
        description="Store your brand assets in one place. Our AI remembers your style, so every new creation feels like it belongs to your brand automatically."
        features={["Asset Library", "Style Consistency", "Instant Retrieval"]}
        imageSide="left"
        gradient="bg-purple-400"
        badge="Smart Storage"
      />

      <FeatureCard
        title="AI Product Photography"
        description="Turn simple product photos into professional studio shots. Change backgrounds, lighting, and context with a single click."
        features={["Background Removal", "Scene Generation", "Lighting Adjustment"]}
        imageSide="right"
        gradient="bg-pink-400"
        badge="Photography"
      />

      <FeaturesGrid />

      <TestimonialsSection />

      <FooterCTA />

      <ContactUs />

      <PrivacySection />

      {/* <Footer /> */}

      {/* <StickyPromptInput /> */}
    </main>
  );
}
