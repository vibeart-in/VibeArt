"use client";
import { TabsContent } from "../../ui/tabs";
import { motion, AnimatePresence, MotionConfig, Variants } from "motion/react";
import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { PricingCard } from "./PricingCard";

export type PricingPlan = {
  id: string;
  name: string;
  priceMonthly: string;
  priceAnnually: string;
  priceSubtext?: string;
  features: string[];
  cardBgGradient: string;
  borderGradient: string;
  glowEffect: string;
  buttonClasses: string;
  buttonText: string;
  popular?: boolean;
  monthPriceId: string;
  yearPriceId: string;
};

const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: "$0",
    priceAnnually: "$0",
    features: [
      "100 Credits / month",
      "~100 Images / Edit",
      "Limited free generations",
      "Standard queue priority",
    ],
    cardBgGradient: "bg-zinc-900",
    borderGradient: "bg-zinc-800",
    glowEffect: "",
    buttonClasses: "bg-white text-black hover:bg-zinc-200",
    buttonText: "Get Started",
    monthPriceId: "",
    yearPriceId: "",
  },
  {
    id: "basic",
    name: "Basic",
    priceMonthly: "$10",
    priceAnnually: "$8",
    priceSubtext: "/mo",
    features: [
      "1,000 Credits / month",
      "~2000 Flux images",
      "~800 Nano banana images",
      "~300 Enhanced Generation",
      "Commercial License",
    ],
    cardBgGradient: "from-[#FFDEDE]/15 via-zinc-900/90 to-[#FFDEDE]/15",
    borderGradient:
      "bg-gradient-to-br from-[#FFDEDE]/50 via-transparent to-[#FFDEDE]/50",
    glowEffect: "hover:shadow-[0_0_24px_#FFDEDE40]",
    buttonClasses:
      "bg-gradient-to-b from-[#FFDEDE] to-[#936C6C] text-black hover:brightness-110 before:bg-[#FFDEDE]/50",
    buttonText: "Select Plan",
    monthPriceId: "pri_01k54bw84e7xpck3hk3ch8et8a",
    yearPriceId: "pri_01k54bx8fs377gqz9yyzm09db3",
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: "$25",
    priceAnnually: "$18",
    priceSubtext: "/mo",
    features: [
      "2500 Credits / month",
      "~10,000 Flux images",
      "~3000 Nano banana images",
      "~800 Enhanced Generation",
      "Commercial License",
    ],
    cardBgGradient: "from-[#00C8FF]/15 via-zinc-900/90 to-[#00C8FF]/15",
    borderGradient:
      "bg-gradient-to-br from-[#00C8FF]/50 via-transparent to-[#00C8FF]/50",
    glowEffect: "hover:shadow-[0_0_24px_#00C8FF40]",
    buttonClasses:
      "bg-gradient-to-b from-[#00C8FF] to-[#016789] text-black hover:brightness-110 before:bg-[#00C8FF]/50",
    buttonText: "Select Plan",
    popular: true,
    monthPriceId: "pri_01k54cb0xfd73qwwspj00cze55",
    yearPriceId: "pri_01k54cc8tqtbjq9t5qyr0gkbyz",
  },
  {
    id: "creator",
    name: "Creator",
    priceMonthly: "$50",
    priceAnnually: "$48",
    priceSubtext: "/mo",
    features: [
      "5000 Credits / month",
      "~40,000 Flux images",
      "~18,000 Nano banana images",
      "~5000 Enhanced Generation",
      "Priority Support",
      "Highest Queue Priority",
    ],
    cardBgGradient: "from-[#FFAA33]/20 via-zinc-900/90 to-[#FFAA33]/20",
    borderGradient:
      "bg-gradient-to-br from-[#FFAA33]/50 via-transparent to-[#FFAA33]",
    glowEffect: "hover:shadow-[0_0_24px_#FFAA3340]",
    buttonClasses:
      "bg-gradient-to-b from-[#FFAA33] to-[#734E03] text-black hover:brightness-110 before:bg-[#FFAA33]/50",
    buttonText: "Select Plan",
    monthPriceId: "pri_01k54cdp4k3h9zavjerkesspdv",
    yearPriceId: "pri_01k54ceb4tsxd6510zcfcm86q5",
  },
];

const gridVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};


export const PricingHero = ({
  userSubscriptionDetails,
}: {
  userSubscriptionDetails?: {
    subscription_tier: string | null;
    subscription_type: string | null;
    subscription_id: string | null;
  } | null;
}) => {
  return (
    <MotionConfig transition={{ duration: 0.28, ease: "easeInOut" }}>
      <TabsContent value="monthly">
        <AnimatePresence mode="wait">
          <motion.div
            key="monthly"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AnimatedGrid
              plans={pricingPlans}
              isYearly={false}
              userSubscriptionDetails={userSubscriptionDetails}
            />
          </motion.div>
        </AnimatePresence>
      </TabsContent>

      <TabsContent value="yearly">
        <AnimatePresence mode="wait">
          <motion.div
            key="yearly"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AnimatedGrid
              plans={pricingPlans}
              isYearly={true}
              userSubscriptionDetails={userSubscriptionDetails}
            />
          </motion.div>
        </AnimatePresence>
      </TabsContent>
    </MotionConfig>
  );
};

const AnimatedGrid = ({
  plans,
  isYearly,
  userSubscriptionDetails,
}: {
  plans: PricingPlan[];
  isYearly: boolean;
  userSubscriptionDetails?: {
    subscription_tier: string | null;
    subscription_type: string | null;
    subscription_id: string | null;
  } | null;
}) => {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
      } else {
        setUser(data.user);
      }
    };

    getUser();
  }, [supabase]);

  return (
    <motion.div
      variants={gridVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
    >
      {plans.map((plan) => (
        <PricingCard
          key={plan.id}
          plan={plan}
          isYearly={isYearly}
          userSubscriptionDetails={userSubscriptionDetails}
          customerEmail={user?.email}
        />
      ))}
    </motion.div>
  );
};
