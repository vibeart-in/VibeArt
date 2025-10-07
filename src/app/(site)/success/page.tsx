"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import { motion } from "motion/react";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface UserProfile {
  subscription_tier: string;
  subscription_credits: number;
  subscription_status: string;
  subscription_type: string | null;
}

export default function SuccessPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push("/auth/login");
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("subscription_tier, subscription_credits, subscription_status, subscription_type")
          .eq("user_id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }

        setProfile(profileData);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Something went wrong
          </h1>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-gray-800"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
        >
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </motion.div>

        {/* Thank You Message */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-2 text-3xl font-bold text-gray-900 dark:text-white"
        >
          Thank You!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8 text-gray-600 dark:text-gray-300"
        >
          Your subscription has been successfully activated.
        </motion.p>

        {/* Subscription Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-6 dark:from-blue-900/20 dark:to-purple-900/20"
        >
          <div className="mb-4 flex items-center justify-center">
            <Sparkles className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold capitalize text-gray-900 dark:text-white">
              {profile.subscription_tier} Plan
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">Credits:</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {profile.subscription_credits.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">Billing:</span>
              <span className="font-medium capitalize text-gray-900 dark:text-white">
                {profile.subscription_type ? `${profile.subscription_type}ly` : "One-time"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">Status:</span>
              <span className="font-medium capitalize text-green-600 dark:text-green-400">
                {profile.subscription_status}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <Button
            onClick={() => router.push("/")}
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
            size="lg"
          >
            Start Creating
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <Button onClick={() => router.push("/pricing")} variant="secondary" className="w-full">
            View Pricing Details
          </Button>
        </motion.div>

        {/* Additional Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-sm text-gray-500 dark:text-gray-400"
        >
          Your credits will renew automatically based on your billing cycle.
        </motion.p>
      </motion.div>
    </div>
  );
}
