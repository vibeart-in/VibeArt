"use client";

import { Check, X, ImageIcon, Sparkles, Coins, Zap, Crown, Video, ArrowDown } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

import { generationData } from "@/src/lib/config/generationData";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";

// --- TYPE DEFINITIONS ---
type PlanId = "free" | "basic" | "pro" | "creator";

interface Plan {
  id: PlanId;
  name: string;
  color: string;
  gradient: string;
}

export interface GenerationItem {
  name: string;
  counts: Record<PlanId, number>;
  unit: string;
  premium?: boolean;
  creditsPerUse: number;
}

interface ComparisonFeature {
  name: string;
  values: Record<PlanId, string | boolean | number>;
  isCredits?: boolean;
  icon?: React.ReactNode;
}

export const plans: Plan[] = [
  { id: "free", name: "Free", color: "zinc", gradient: "from-zinc-800 to-zinc-900/80" },
  { id: "basic", name: "Basic", color: "green", gradient: "from-[#FFDEDE]/15 to-zinc-900/80" },
  { id: "pro", name: "Pro", color: "blue", gradient: "from-[#00C8FF]/15 to-zinc-900/80" },
  { id: "creator", name: "Creator", color: "purple", gradient: "from-[#FFAA33]/15 to-zinc-900/80" },
];

const planCredits = { free: 100, basic: 500, pro: 1500, creator: 5000 };

const gradientMap: Record<PlanId, string> = {
  free: "linear-gradient(90deg,#111827,#0f172a)",
  basic: "linear-gradient(90deg, rgba(255,222,222,0.12), rgba(15,23,42,0.9))",
  pro: "linear-gradient(90deg, rgba(0,200,255,0.12), rgba(15,23,42,0.9))",
  creator: "linear-gradient(90deg, rgba(255,170,51,0.12), rgba(15,23,42,0.9))",
};

export const comparisonFeatures: ComparisonFeature[] = [
  {
    name: "Credits",
    values: {
      free: `${planCredits.free} credits`,
      basic: `${planCredits.basic} credits`,
      pro: `${planCredits.pro} credits`,
      creator: `${planCredits.creator} credits`,
    },
    isCredits: true,
    icon: <Coins className="size-4 text-yellow-400" />,
  },
  {
    name: "Priority Queue",
    values: { free: false, basic: true, pro: true, creator: true },
    icon: <Zap className="size-4 text-orange-400" />,
  },
  {
    name: "Commercial License",
    values: { free: false, basic: false, pro: true, creator: true },
    icon: <Crown className="size-4 text-yellow-500" />,
  },
  { name: "Concurrent Image Generations", values: { free: 1, basic: 2, pro: 4, creator: 4 } },
  { name: "Concurrent Video Generations", values: { free: 1, basic: 1, pro: 2, creator: 4 } },
];

const AnimatedListItem = ({
  name,
  count,
  unit,
  premium = false,
}: {
  name: string;
  count: number;
  unit: string;
  premium?: boolean;
}) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg px-3 py-2 transition-colors hover:bg-zinc-700/30">
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-800/50 ring-1 ring-zinc-700/40">
          {premium ? (
            <Crown className="size-4 text-yellow-400" />
          ) : (
            <ImageIcon className="size-4 text-zinc-300" />
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-white">{name}</div>
          {typeof unit === "string" && (
            <div className="mt-0.5 text-xs text-zinc-400">
              {unit === "images" || unit === "videos" ? unit : unit}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <motion.span
          key={count}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-sm font-semibold tabular-nums text-white"
        >
          {count.toLocaleString()}
        </motion.span>
        <span className="text-xs text-zinc-400">{unit}</span>
      </div>
    </div>
  );
};

// ----------------- Feature list card
const FeatureListCard = ({
  title,
  icon,
  items,
  selectedPlan,
}: {
  title: string;
  icon: React.ReactNode;
  items: GenerationItem[];
  selectedPlan: PlanId;
}) => {
  return (
    <div className="relative rounded-xl border border-zinc-700/40 bg-gradient-to-br from-zinc-900/70 to-zinc-800/60 p-5 shadow-lg">
      {/* subtle top */}
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-md bg-zinc-800/50 p-2 ring-1 ring-zinc-700/30">{icon}</div>
        <h4 className="text-lg font-semibold text-white">{title}</h4>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((it) => (
          <AnimatedListItem
            key={it.name}
            name={it.name}
            count={Math.max(0, it.counts[selectedPlan] ?? 0)}
            unit={it.unit}
            premium={Boolean(it.premium)}
          />
        ))}
      </div>
    </div>
  );
};

// ----------------- Comparison table
const ComparisonTable = ({ currentPlans }: { currentPlans: Plan[] }) => {
  const renderValue = (
    value: string | boolean | number | undefined,
    feature: ComparisonFeature,
  ) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="mx-auto size-5 text-emerald-400" />
      ) : (
        <X className="mx-auto size-5 text-red-400" />
      );
    }
    return (
      <div className="flex items-center justify-center gap-2">
        {feature.isCredits && <Coins className="size-4 text-yellow-400" />}
        <span className="font-medium text-white">{String(value)}</span>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-700/40 bg-gradient-to-br from-zinc-900/60 to-zinc-800 p-4 shadow-lg">
      <div className="mb-4 flex items-center gap-3">
        <Sparkles className="size-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Plan comparison</h3>
      </div>

      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-zinc-700/40">
            <th className="p-3 text-left text-zinc-300"></th>
            {currentPlans.map((p) => (
              <th key={p.id} className="p-3 text-center">
                <div
                  className="mx-auto inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-white"
                  style={{ background: gradientMap[p.id] }}
                >
                  <span className="size-2 rounded-full bg-white/30" />
                  {p.name}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {comparisonFeatures.map((feature, idx) => (
            <tr
              key={feature.name}
              className={`border-b border-zinc-800/30 ${idx % 2 === 0 ? "bg-zinc-900/20" : ""}`}
            >
              <td className="p-3 font-medium text-zinc-200">
                <div className="flex items-center gap-2">
                  {feature.icon ?? <span className="size-4 rounded bg-zinc-700/40" />}
                  <span>{feature.name}</span>
                </div>
              </td>

              {currentPlans.map((p) => (
                <td key={p.id} className="p-3 text-center align-middle">
                  {renderValue(feature.values[p.id], feature)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ----------------- Main exported component
export const FeatureComparison = () => {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("basic");
  const selectedPlanData = plans.find((p) => p.id === selectedPlan) ?? plans[1];

  // fallbacks if generationData keys missing
  const images = generationData.image ?? [];
  const videos = generationData.video ?? [];
  const aiApps = generationData.aiApps ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl rounded-2xl border border-zinc-700/40 bg-gradient-to-br from-zinc-900 via-zinc-800/50 to-zinc-900 p-6 text-white shadow-2xl sm:p-8">
      {/* header */}
      <div className="relative mb-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3">
          <Coins className="size-5 text-yellow-400" />
          <div className="text-lg font-semibold text-white">Monthly generations for</div>
          <div className="hidden text-zinc-400 sm:inline">
            {" "}
            — choose a plan to preview allocations
          </div>
        </div>

        <div className="w-full max-w-xs">
          <div className="relative">
            <Select
              value={selectedPlan}
              onValueChange={(value) => setSelectedPlan(value as PlanId)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} plan
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* top: three columns */}
      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <FeatureListCard
          title="Image Generation"
          icon={<ImageIcon className="size-5 text-blue-400" />}
          items={images}
          selectedPlan={selectedPlan}
        />
        <FeatureListCard
          title="Video Generation"
          icon={<Video className="size-5 text-pink-400" />}
          items={videos}
          selectedPlan={selectedPlan}
        />
        <FeatureListCard
          title="AI Apps"
          icon={<Sparkles className="size-5 text-emerald-400" />}
          items={aiApps}
          selectedPlan={selectedPlan}
        />
      </div>

      {/* bottom: comparison */}
      <ComparisonTable currentPlans={plans} />
    </div>
  );
};

export default FeatureComparison;
