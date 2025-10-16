"use client";
import type { User } from "@supabase/supabase-js";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { saveOnboardingChoice } from "@/src/actions/saveOnboardingChoice";

import WelcomeChoice from "./welcomeChoice";
import AnimatedGradientBackground from "../ui/animated-gradient-background";

interface OnboardingClientProps {
  user: User | null;
}

export default function OnboardingClient({ user }: OnboardingClientProps) {
  const router = useRouter();
  const [choice, setChoice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const options = [
    { key: "social-media-image", label: "Social media images" },
    { key: "anime", label: "Anime / Illustration creations" },
    { key: "social-media-video", label: "Social media videos" },
    { key: "ads", label: "Ads / Marketing content" },
    { key: "ai-apps", label: "AI-powered workflows" },
    { key: "fun", label: "Just experimenting / Fun" },
  ];

  const handleSelect = async (opt: string) => {
    if (isLoading) return;

    setChoice(opt);
    setIsLoading(true);

    try {
      const result = await saveOnboardingChoice(opt);

      if (!result.success) {
        console.error("Failed to save onboarding choice:", result.error);
        // Still proceed to the next page even if saving fails
      }

      // Navigate based on the choice
      switch (opt) {
        case "social-media-image":
        case "anime":
        case "fun": // fun can go to the general generate page
          router.push("/image/generate");
          break;

        case "social-media-video":
          router.push("/image/video");
          break;

        case "ads":
          router.push("/image/edit");
          break;

        case "ai-apps":
          router.push("/image/ai-apps");
          break;

        case "community":
          router.push("/image/advance_generate");
          break;

        default:
          router.push("/image/generate");
      }
    } catch (error) {
      console.error("Error handling selection:", error);
      router.push("/image/generate");
    } finally {
      setIsLoading(false);
    }
  };

  const getUserDisplayName = () => {
    if (!user) return "there";
    return user.user_metadata?.full_name || user.email?.split("@")[0] || "there";
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center overflow-hidden p-8 text-white">
      <div>
        <WelcomeChoice
          getUserDisplayName={getUserDisplayName}
          handleSelect={handleSelect}
          isLoading={isLoading}
          options={options}
          choice={choice}
          skipKey="skip"
        />
      </div>

      <div className="absolute -z-10 h-screen w-screen overflow-hidden">
        <AnimatedGradientBackground Breathing={true} />
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            backgroundImage: "url(/images/landing/grain.png)",
            backgroundSize: "100px 100px",
            mixBlendMode: "overlay",
          }}
        />
      </div>
    </div>
  );
}
