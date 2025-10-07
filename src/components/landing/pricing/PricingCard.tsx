"use client";
import { motion, AnimatePresence, Variants } from "motion/react";
import { useEffect, useState } from "react";
import { initializePaddle, Paddle } from "@paddle/paddle-js";
import { CheckCircle2, Coins } from "lucide-react";
import { PricingPlan } from "./PricingHero";
import { updateSubscription } from "@/src/app/(site)/pricing/actions";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

const featureListVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const featureItemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const FeatureItem = ({ feature }: { feature: string }) => {
  const isCreditsFeature = feature.toLowerCase().includes("credits");

  return (
    <motion.li
      variants={featureItemVariants}
      className="flex items-center gap-3 border-b border-white/10 py-3 last:border-b-0"
    >
      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-accent" />
      <span className="text-white/80">
        {isCreditsFeature ? (
          <span className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-accent" />
            <span className="font-medium text-white">{feature}</span>
          </span>
        ) : (
          feature
        )}
      </span>
    </motion.li>
  );
};

export const PricingCard = ({
  plan,
  isYearly = false,
  userSubscriptionDetails,
  customerEmail,
}: {
  plan: PricingPlan;
  isYearly?: boolean;
  userSubscriptionDetails?: {
    subscription_tier: string | null;
    subscription_type: string | null;
    subscription_id: string | null;
  } | null;
  customerEmail?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [paddle, setPaddle] = useState<Paddle>();

  // --- Refined Logic Setup ---
  const planOrder = ["free", "basic", "pro", "creator"];
  const currentTier = userSubscriptionDetails?.subscription_tier || "free";
  const currentSubscriptionType = userSubscriptionDetails?.subscription_type;
  const subscription_id = userSubscriptionDetails?.subscription_id;

  // KEY FIX 1: "isCurrent" must check both tier AND billing cycle.
  const isActuallyCurrentPlan =
    plan.id === currentTier &&
    (isYearly ? currentSubscriptionType === "year" : currentSubscriptionType === "month");

  // A downgrade action is either moving to a lower tier OR attempting to switch from yearly to monthly.
  const isDowngradeTier = planOrder.indexOf(plan.id) < planOrder.indexOf(currentTier);
  const isForbiddenYearlyToMonthlySwitch = currentSubscriptionType === "year" && !isYearly;

  const isConsideredDowngrade = isDowngradeTier || isForbiddenYearlyToMonthlySwitch;

  // KEY FIX 2: The button is disabled only if it's the *exact* current plan or a downgrade action.
  const isButtonDisabled = isActuallyCurrentPlan || isConsideredDowngrade;

  // KEY FIX 3: getButtonText logic is now simpler and more accurate.
  const getButtonText = () => {
    if (isActuallyCurrentPlan) return "Current Plan";
    if (plan.id === "free") return "Get Started";
    if (!userSubscriptionDetails || currentTier === "free") return "Upgrade";
    if (isConsideredDowngrade) return "Downgrade";
    // Any other allowed action, including monthly-to-yearly of the same tier, is an upgrade.
    return "Upgrade";
  };

  // --- Determine Final Button Text (including hover effects) ---
  const baseButtonText = getButtonText();
  let finalButtonText = baseButtonText;

  if (!customerEmail) {
    finalButtonText = "Get Started";
  } else if (isButtonDisabled && isHovered && baseButtonText === "Downgrade") {
    finalButtonText = "Manage in billing";
  }

  // --- Paddle Initialization ---
  useEffect(() => {
    initializePaddle({
      environment: "sandbox",
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
      pwCustomer: { email: customerEmail },
    }).then((paddle) => setPaddle(paddle));
  }, []);

  // --- Checkout Handler ---
  const handleCheckout = (priceId: string) => {
    if (!paddle) {
      console.error("Paddle is not initialized.");
      return;
    }
    if (customerEmail && !subscription_id) {
      paddle.Checkout.open({
        items: [{ priceId: priceId }],
        customer: { email: customerEmail },
        settings: {
          variant: "one-page",
          displayMode: "overlay",
          theme: "dark",
          successUrl: `${window.location.origin}/success`,
        },
      });
    } else if (subscription_id) {
      updateSubscription(plan.monthPriceId, subscription_id);
      console.log("subscription_id", subscription_id);
    }
  };

  const price = isYearly ? plan.priceAnnually : plan.priceMonthly;

  return (
    <motion.div
      variants={cardVariants}
      layout
      className={`relative rounded-2xl bg-black p-0.5 transition-shadow duration-300 ${plan.borderGradient} ${plan.glowEffect}`}
    >
      <article
        className={`relative flex h-full w-full flex-col rounded-[15px] bg-gradient-to-br p-6 ${plan.cardBgGradient}`}
      >
        {plan.popular && !isActuallyCurrentPlan && (
          <motion.span
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute -top-3 right-4 rounded-full bg-gradient-to-r from-[#00D1FF] to-[#0085FF] px-4 py-1 text-xs font-semibold text-white shadow-lg"
          >
            Popular
          </motion.span>
        )}

        {isActuallyCurrentPlan && (
          <motion.span
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute -top-3 right-4 rounded-full bg-gradient-to-r from-[#2BFFFF] to-[#00C8FF] px-4 py-1 text-xs font-semibold text-black shadow-lg"
          >
            Current Plan
          </motion.span>
        )}

        <div className="flex flex-1 flex-col gap-6">
          <h3 className="text-2xl font-semibold text-white">{plan.name}</h3>

          <div className="flex flex-col gap-4">
            <div className="flex items-baseline gap-2">
              <AnimatePresence mode="wait">
                <motion.span
                  key={price}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="text-5xl font-bold text-white"
                >
                  {price}
                </motion.span>
              </AnimatePresence>
              {plan.priceSubtext && <span className="text-white">{plan.priceSubtext}</span>}
            </div>
            <button
              disabled={isButtonDisabled}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => {
                if (!customerEmail) {
                  window.location.href = "/login";
                  return;
                }
                if (isButtonDisabled) return;
                const priceId = isYearly ? plan.yearPriceId : plan.monthPriceId;
                handleCheckout(priceId);
              }}
              className={`relative flex h-11 w-full flex-row items-center justify-center gap-2.5 rounded-xl px-3.5 py-3 shadow-md transition-all duration-300 before:absolute before:inset-0 before:-z-10 before:rounded-xl before:blur-md ${
                isButtonDisabled
                  ? "cursor-not-allowed bg-zinc-700 text-zinc-400 opacity-75"
                  : plan.buttonClasses
              }`}
            >
              {finalButtonText}
            </button>
          </div>
          {isYearly && plan.priceAnnually !== plan.priceMonthly && (
            <span className="-mt-4 text-xs text-white/60">Billed yearly</span>
          )}

          <motion.ul
            variants={featureListVariants}
            initial="hidden"
            animate="show"
            className="mt-4 flex flex-col gap-1 text-sm"
          >
            {plan.features.map((feature: string, index: number) => (
              <FeatureItem key={index} feature={feature} />
            ))}
          </motion.ul>
        </div>
      </article>
    </motion.div>
  );
};
