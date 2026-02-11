"use client";

import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ContactUs from "@/src/components/landing/ContactUs";
import {
  Hero,
  FeatureCard,
  FeaturesGrid,
  TestimonialsSection,
  FooterCTA,
  AiAppsCarousel,
} from "@/src/components/landing/LandingComponents";
import PrivacySection from "@/src/components/landing/PrivacySection";
import { createClient } from "@/src/lib/supabase/client";
import LightFrequencies from "@/src/components/landing/NEW/LightFrequencies";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black pb-32 text-foreground selection:bg-green-500/30">
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

      {/* <LightFrequencies /> */}

      {/* <StickyPromptInput /> */}
    </div>
  );
};

// Main component that handles authentication-based redirection
export default function AuthRedirectWrapper() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    if (!loading && user) {
      // Redirect authenticated users to /home
      router.push("/home");
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return <div className="flex min-h-screen w-full items-center justify-center">Loading...</div>;
  }

  // Show landing page only for non-authenticated users
  if (!user) {
    return <LandingPage />;
  }

  // For authenticated users, show a brief loading message while redirecting
  return <div className="flex min-h-screen w-full items-center justify-center">Redirecting...</div>;
}
