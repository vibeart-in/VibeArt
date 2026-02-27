"use client";

import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Hero, FeaturesGrid, AiAppsCarousel } from "@/src/components/landing/LandingComponents";
import PrivacySection from "@/src/components/landing/PrivacySection";
import { createClient } from "@/src/lib/supabase/client";
import ClarityScroll from "@/src/components/landing/hero/SpaceWrap";
import { LogoCloud } from "@/src/components/ui/logo-cloud";
import Testimonial from "@/src/components/landing/Testimonials";
import CreativeProcess from "@/src/components/landing/hero/CreativeProcess";
import MagicBento from "@/src/components/ui/MagicBento";
import { motion } from "framer-motion";
import { GetStarted } from "@/src/components/ui/GetStated";

const logos = [
  {
    src: "https://www.segmind.com/partners/minimax.png",
    alt: "Minimax Logo",
  },
  {
    src: "https://svgl.app/library/google-wordmark.svg",
    alt: "Google Logo",
  },
  {
    src: "https://svgl.app/library/openai_wordmark_light.svg",
    alt: "OpenAI Logo",
  },
  {
    src: "https://www.modelscope.ai/api/v1/models/Wan-AI/Wan2.1-I2V-14B-720P/repo?Revision=master&FilePath=assets%2Flogo.png&View=true",
    alt: "Qwen Logo",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/ByteDance_logo_English.svg/3840px-ByteDance_logo_English.svg.png",
    alt: "Bytedance Logo",
  },
  {
    src: "https://www.nomadai.ie/logos/Midjourney.png?dpl=dpl_5xqEonpmrh3cYgYBw3Azt8Tkqvoz",
    alt: "Midjourny Logo",
  },
  {
    src: "https://bfl.ai/brand/logotype-white.png",
    alt: "Flux Logo",
  },
  {
    src: "https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-png/dark/recraft-text.png",
    alt: "Recraft Logo",
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black pb-32 text-foreground selection:bg-green-500/30">
      <Hero />
      <ClarityScroll />

      {/* <AiAppsCarousel /> */}
      {/* <Slider /> */}
      {/* <FeatureCard
        title="Create Brand Identity - Pro & Fast"
        description="Generate logos, color palettes, and typography guidelines that perfectly match your vision. Ensure consistency across all your assets with our AI-powered brand guardrails."
        features={["Logo Generation", "Brand Guidelines", "Asset Consistency"]}
        imageSide="right"
        gradient="bg-green-400"
        badge="Brand Identity"
        imageUrl="https://i.pinimg.com/1200x/89/5a/ee/895aee589ed106b421d94938c44bde24.jpg"
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
      /> */}
      <section id="how-it-works">
        <CreativeProcess />
      </section>

      <section id="features">
        <FeaturesGrid />
      </section>
      {/* <TestimonialsSection /> */}
      <section id="ai-models">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <span className="mb-4 inline-block text-sm font-bold uppercase tracking-widest text-green-500">
            AI Models
          </span>
          <h2 className="mx-auto max-w-5xl font-satoshi text-4xl font-black text-white md:text-6xl">
            100+ models from open source to <br />{" "}
            <span className="text-neutral-600">proprietary models across all companies.</span>
          </h2>
        </motion.div>
        <MagicBento
          textAutoHide={true}
          enableStars={false}
          enableSpotlight
          enableBorderGlow={true}
          enableTilt={false}
          enableMagnetism={false}
          clickEffect={false}
          spotlightRadius={400}
          particleCount={12}
          glowColor="255, 255, 255"
          disableAnimations={false}
        />
      </section>
      <section className="relative mx-auto my-12 max-w-5xl">
        <h2 className="mb-5 text-center text-xl font-medium tracking-tight text-foreground md:text-3xl">
          <span className="text-muted-foreground">State-of-the-art AI models</span>
          <br />
          <span className="font-semibold">for image, video, and text.</span>
        </h2>
        <div className="mx-auto my-5 h-px max-w-5xl bg-border [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />

        <LogoCloud logos={logos} />

        <div className="mt-5 h-px bg-border [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />
      </section>
      <PrivacySection />
      <section id="testimonials">
        <Testimonial />
      </section>
      <section id="get-started">
        <GetStarted />
      </section>
      {/* <FooterCTA /> */}
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
