"use client";

import { User } from "@supabase/supabase-js";
import { Ban, Check, Info, LoaderCircle, Sparkles } from "lucide-react";
import { Zap, Unlock } from "lucide-react";
import { motion } from "motion/react";
import React from "react";

import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { RadioGroupItem } from "@/src/components/ui/radio-group";
import { cn } from "@/src/lib/utils";

export interface PricingCardProps {
  id: string;
  name: string;
  description?: string;
  price?: number | null; // cents
  originalPrice?: number | null; // optional original price (for strike-through)
  offer?: string;
  features?: string[];
  usage: string[];
  isSelected: boolean;
  onSelect: (id: string) => void;
  isYearly: boolean;
  currentPlan?: { product_id?: string } | null;
  onPlanChange: (id: string) => Promise<void> | void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  isFree?: boolean;
  onRequestClose?: () => void;
  // visual props
  accent?: {
    from: string; // tailwind color class like "from-green-800"
    to: string; // tailwind color class like "to-green-600"
    border?: string; // tailwind border color like "border-green-700/40"
    badgeText?: string; // e.g. "TOP CHOICE"
    badgeColor?: string; // tailwind bg class for badge, e.g. "bg-green-500"
  };
  user: User | null;
}

export default function PricingCard({
  id,
  name,
  description,
  price,
  originalPrice,
  offer,
  features,
  usage,
  isSelected,
  onSelect,
  isYearly,
  currentPlan,
  onPlanChange,
  isLoading,
  setIsLoading,
  isFree = false,
  onRequestClose,
  accent,
  user,
}: PricingCardProps) {
  const displayPrice = isFree ? "$0" : `$${Number(price ?? 0) / 100}`;
  const displayOriginal = originalPrice ? `$${Number(originalPrice) / 100}` : null;

  const handleActionClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFree) return;
    setIsLoading(true);
    try {
      await onPlanChange(id);
    } finally {
      setIsLoading(false);
      if (onRequestClose) onRequestClose();
    }
  };

  return (
    <motion.div
      layout
      onClick={() => onSelect(id)}
      className={cn(
        "relative flex h-full min-h-[520px] w-full cursor-pointer flex-col rounded-2xl p-6 shadow-xl transition-all duration-300",
        isSelected ? "ring-1 ring-white/50" : "border",
        accent
          ? `${accent.from} ${accent.to}/20 bg-gradient-to-br`
          : "bg-gradient-to-br from-gray-900 to-neutral-800",
      )}
    >
      {/* top badge */}
      {accent?.badgeText && (
        <div
          className={cn(
            "absolute -right-2 -top-2 z-10 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase",
            accent.badgeColor ?? "bg-white/10",
            "backdrop-blur-sm",
          )}
        >
          {accent.badgeText}
        </div>
      )}
      {/* header */}
      <div className="mb-4">
        {/* title and price row */}
        <div className="flex items-start justify-between gap-4">
          <Label htmlFor={id} className="cursor-pointer font-satoshi text-3xl font-bold text-white">
            {name}
          </Label>

          {/* price block */}
          <div className="text-right">
            <div className="flex items-baseline gap-3">
              {displayOriginal && (
                <div className="text-lg text-white/60 line-through">{displayOriginal}</div>
              )}
              <div className="font-satoshi text-xl font-extrabold text-white">{displayPrice}</div>
            </div>
            <div className="mt-1 text-xs text-white/70">/{isYearly ? "year" : "month"}</div>
          </div>
        </div>

        {/* description takes full width */}
        {description && <p className="mt-4 text-xs text-white/80">{description}</p>}
      </div>

      <Button
        className={cn(
          "w-full rounded-2xl text-base font-semibold shadow-md transition-all duration-200",
          // Current plan - disabled state
          currentPlan?.product_id === id || (isFree && currentPlan)
            ? "cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400"
            : isFree && !currentPlan && user
              ? "cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400"
              : // Active/selectable plan - gradient styling
                "border border-[#D9E825] bg-gradient-to-r from-[#D9E825] to-[#E3D2BA] text-black " +
                "hover:border-[#E3F235] hover:from-[#E3F235] hover:to-[#F0E0CC]" +
                "hover:shadow-[0_8px_25px_rgba(217,232,37,0.3)]" +
                "active:from-[#C5D020] active:to-[#D4C2A5]" +
                "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        disabled={user ? (isFree ? true : currentPlan?.product_id === id || isLoading) : isLoading}
        onClick={handleActionClick}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <LoaderCircle className="mr-2 size-4 animate-spin" />
            Processing...
          </div>
        ) : !user ? (
          <div className="flex items-center justify-center">
            <Sparkles className="mr-2 size-4" />
            <p>Get Started</p>
          </div>
        ) : isFree && user ? (
          currentPlan ? (
            <div className="flex items-center justify-center">
              <Ban className="mr-2 size-4" />
              <p>Cancel to Downgrade</p>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Check className="mr-2 size-4" />
              <p>Current Plan</p>
            </div>
          )
        ) : currentPlan?.product_id === id ? (
          <div className="flex items-center justify-center">
            <Check className="mr-2 size-4" />
            <p>Current Plan</p>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Sparkles className="mr-2 size-4" />
            <p>Select Plan</p>
          </div>
        )}
      </Button>

      {offer && features ? (
        // Offer State - Emphasize "unlock all" message
        <div className="relative mb-6 mt-4">
          {/* "Unlock Everything" hero message */}
          <div className="mb-4 flex w-full items-center justify-center rounded-2xl border-2 border-lime-400/40 bg-gradient-to-br from-lime-500/10 to-emerald-500/10 p-2">
            <div className="flex place-items-center gap-3">
              <div className="rounded-full bg-lime-400/20 p-1">
                <Unlock className="size-5 text-lime-400" />
              </div>
              <h4 className="text-sm font-bold text-white">
                Unlock all features as founding member
              </h4>
            </div>
          </div>

          {/* Struck-through features list */}
          <ul className="flex flex-col gap-2.5 opacity-60">
            {features.map((f, i) => (
              <li key={i} className="relative flex items-center gap-3">
                <span className="flex size-5 items-center justify-center rounded-full bg-white/5">
                  <Check className="size-3 text-white/40" />
                </span>
                <span className="flex-1 text-sm text-white/50 line-through decoration-white/30">
                  {f}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        // Normal State - Clean feature list
        <div>
          {features && (
            <div className="mb-6 mt-2 flex-1">
              <ul className="flex h-full flex-col gap-3">
                {features.map((f, i) => (
                  <li
                    key={i}
                    className="group flex items-start gap-3 transition-all hover:translate-x-1"
                  >
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-lime-400/30 bg-gradient-to-br from-lime-400/20 to-emerald-400/20 transition-all group-hover:border-lime-400/50 group-hover:shadow-lg group-hover:shadow-lime-400/20">
                      <Check className="size-4 text-lime-400 transition-transform group-hover:scale-110" />
                    </span>
                    <div className="flex-1 pt-0.5">
                      <span className="text-sm leading-relaxed text-white/90 transition-colors group-hover:text-white">
                        {f}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Usage section (if exists) */}
      {usage && (
        <div className="mb-6 mt-4 border-t border-white/10 pt-4">
          <div className="mb-3 flex items-center gap-2">
            <Zap className="size-4 text-blue-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-400">Usage</h4>
          </div>
          <ul className="flex flex-col gap-2.5">
            {usage.map((u, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-blue-400/20 bg-blue-400/10">
                  <Check className="size-3 text-blue-400" />
                </span>
                <span className="flex-1 text-sm text-white/80">{u}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* action area */}
      <div className="mt-4">
        {/* small legal row or info */}
        <div className="mt-4 flex items-center justify-between text-xs text-white/60">
          <div className="flex items-center gap-2">
            <Info className="size-3" />
            <span> Billed {isYearly ? "yearly" : "monthly"}</span>
          </div>
          <div className="text-xs text-white/60"> </div>
        </div>
      </div>

      {/* radio item for accessibility (hidden but clickable) */}
      <div className="pointer-events-none absolute left-4 top-4">
        <RadioGroupItem value={id} id={id} className="hidden" />
      </div>
    </motion.div>
  );
}
