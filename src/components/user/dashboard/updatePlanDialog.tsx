"use client";

import { User } from "@supabase/supabase-js";
import { ProductListResponse } from "dodopayments/resources/index.mjs";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

import { Button } from "@/src/components/ui/button";
import { RadioGroup } from "@/src/components/ui/radio-group";
import { Toggle } from "@/src/components/ui/toggle";
import { freePlan } from "@/src/lib/config/plans";
import { cn } from "@/src/lib/utils";

import { Subscription } from "./dashboard";
import PricingCard from "./PricingCard";

export interface UpdatePlanDialogProps {
  currentPlan: Subscription | null;
  triggerText: string;
  onPlanChange: (planId: string) => Promise<void> | void;
  className?: string;
  title?: string;
  products: ProductListResponse[];
  user: User | null;
  /**
   * If true (default) the component will render as a dialog with trigger button.
   * If false the component is rendered inline with the same styling (no backdrop or animation).
   */
  isDialog?: boolean;
  /** Optional callback called when the component is closed.
   * - In dialog mode it's called after the modal is closed.
   * - In inline mode it's used to show the X close button; if not provided the X is hidden.
   */
  onClose?: () => void;
}

// Custom Glassmorphic Dialog Component (used only for dialog mode)
function GlassmorphicDialog({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/10 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                duration: 0.3,
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "relative w-full max-w-[80vw] overflow-hidden rounded-3xl shadow-2xl",
                "bg-gradient-to-br from-black/80 to-black/50",
                "border border-white/20",
              )}
              style={{ maxHeight: "90vh" }}
            >
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export function UpdatePlanDialog({
  currentPlan,
  onPlanChange,
  className,
  title,
  triggerText,
  products,
  user,
  isDialog = true,
  onClose,
}: UpdatePlanDialogProps) {
  const [isYearly, setIsYearly] = useState(
    currentPlan ? currentPlan.payment_period_interval === "Year" : false,
  );
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>(
    currentPlan ? currentPlan.product_id : undefined,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlanChange = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleDialogClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  // shared close handler for inline mode (if provided)
  const inlineClose = () => {
    onClose?.();
  };

  const filteredSortedProducts = products
    .filter((plan) => {
      if (plan.price_detail?.type === "one_time_price") {
        return false;
      }
      if (isYearly) {
        return plan.price_detail?.payment_frequency_interval === "Year";
      } else {
        return plan.price_detail?.payment_frequency_interval === "Month";
      }
    })
    .sort((a, b) => {
      const getPrice = (product: any) => {
        if (!product.price_detail) return 0;
        if (product.price_detail.type === "usage_based_price") {
          return product.price_detail.fixed_price ?? 0;
        }
        return product.price_detail.price ?? 0;
      };
      return Number(getPrice(a)) - Number(getPrice(b));
    });

  // Render the inner content (header + grid) — used both inline and inside dialog
  const RenderInner = ({ showClose }: { showClose: boolean }) => {
    // closeHandler depends on mode: for dialog we close modal, for inline we call onClose
    const closeHandler = isDialog ? handleDialogClose : inlineClose;

    return (
      <div className={cn(className)}>
        {/* Header */}
        <div className="relative flex items-center justify-between px-6 py-4 sm:px-8">
          <h2 className="font-satoshi text-xl font-semibold text-white sm:text-2xl">
            {title || "Upgrade Plan"}
          </h2>

          <div className="flex items-center gap-2">
            {/* Toggle buttons */}
            <div className="flex items-center gap-2 rounded-full p-1 backdrop-blur-sm">
              <Toggle
                size="sm"
                pressed={!isYearly}
                onPressedChange={(pressed) => setIsYearly(!pressed)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                  !isYearly ? "bg-white/90 text-black shadow-lg" : "text-white/70 hover:text-white",
                )}
              >
                Monthly
              </Toggle>
              <Toggle
                size="sm"
                pressed={isYearly}
                onPressedChange={(pressed) => setIsYearly(pressed)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                  isYearly ? "bg-white/90 text-black shadow-lg" : "text-white/70 hover:text-white",
                )}
              >
                Yearly
              </Toggle>
            </div>

            {/* Close button - shown conditionally */}
            {showClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={closeHandler}
                className="place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
              >
                <X className="size-5" />
                <span className="sr-only">Close</span>
              </Button>
            )}
          </div>
        </div>
        {/* Content area with scroll */}
        {/* <div className="relative max-h-[calc(90vh-120px)] overflow-y-auto p-6 sm:p-8"> */}
        <div className="relative p-6 sm:p-8">
          {/* Subtle gradient background */}
          <div className="pointer-events-none absolute inset-0" />

          <RadioGroup
            value={selectedPlan}
            className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
            onValueChange={handlePlanChange}
          >
            {/* Free plan */}
            <PricingCard
              id={freePlan.name}
              name={freePlan.name}
              description={freePlan.description}
              price={0}
              usage={freePlan.usage}
              isSelected={selectedPlan === freePlan.name}
              onSelect={(id) => setSelectedPlan(id)}
              isYearly={isYearly}
              currentPlan={currentPlan}
              onPlanChange={onPlanChange}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              isFree
              onRequestClose={isDialog ? handleDialogClose : inlineClose}
              accent={{
                from: "from-neutral-900",
                to: "to-neutral-800",
                badgeText: undefined,
              }}
              user={user}
            />

            {filteredSortedProducts.map((plan, idx) => {
              const features = (() => {
                try {
                  return JSON.parse(plan.metadata?.features || "[]");
                } catch {
                  return [];
                }
              })();

              const usage = (() => {
                try {
                  return JSON.parse(plan.metadata?.usage || "[]");
                } catch {
                  return [];
                }
              })();

              const price =
                plan.price_detail?.type === "usage_based_price"
                  ? plan.price_detail.fixed_price
                  : plan.price_detail?.price;

              const accentByIdx = [
                {
                  from: "from-slate-950",
                  to: "to-violet-950",
                  badgeText: "",
                  badgeColor: "bg-indigo-400/90",
                },
                {
                  from: "from-zinc-950",
                  to: "to-sky-950",
                  badgeText: "Top Choice",
                  badgeColor: "bg-sky-400/90",
                },
                {
                  from: "from-neutral-950",
                  to: "to-rose-950",
                  badgeText: "Special Offer",
                  badgeColor: "bg-rose-400/90",
                },
              ][idx % 3];

              return (
                <PricingCard
                  key={plan.product_id}
                  id={plan.product_id}
                  name={plan.name || ""}
                  description={plan.description || ""}
                  price={price ?? 0}
                  originalPrice={
                    plan.metadata?.original_price ? Number(plan.metadata.original_price) : undefined
                  }
                  offer={plan.metadata?.offer ? String(plan.metadata.offer) : ""}
                  features={features}
                  usage={usage}
                  isSelected={selectedPlan === plan.product_id}
                  onSelect={(id) => setSelectedPlan(id)}
                  isYearly={isYearly}
                  currentPlan={currentPlan}
                  onPlanChange={onPlanChange}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  isFree={false}
                  onRequestClose={isDialog ? handleDialogClose : inlineClose}
                  accent={{
                    from: accentByIdx.from,
                    to: accentByIdx.to,
                    badgeText: accentByIdx.badgeText,
                    badgeColor: accentByIdx.badgeColor,
                    border: "border-white/10",
                  }}
                  user={user}
                />
              );
            })}
          </RadioGroup>
        </div>
      </div>
    );
  };

  // If dialog mode, render trigger + modal. If inline mode, render the container directly.
  if (isDialog) {
    return (
      <>
        <Button
          size="sm"
          className="rounded-xl"
          disabled={!!currentPlan?.cancel_at_next_billing_date}
          onClick={() => setIsOpen(true)}
        >
          {triggerText}
        </Button>

        <GlassmorphicDialog isOpen={isOpen} onClose={handleDialogClose}>
          <RenderInner showClose={true} />
        </GlassmorphicDialog>
      </>
    );
  }

  // Inline (non-dialog) rendering: same look, no backdrop/animation.
  return (
    <div
      className={cn(
        "relative h-full w-full max-w-full overflow-visible rounded-3xl shadow-2xl",
        className || "",
      )}
    >
      {/* RenderInner: showClose only if onClose provided (Option 3) */}
      <RenderInner showClose={!!onClose} />
    </div>
  );
}

export default UpdatePlanDialog;
