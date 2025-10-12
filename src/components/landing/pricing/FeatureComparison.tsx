"use client";

import { Check, X, ImageIcon, Sparkles, ChevronDown, Coins, Zap, Crown, Edit2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

// --- TYPE DEFINITIONS ---
type PlanId = "free" | "basic" | "pro" | "creator";

interface Plan {
  id: PlanId;
  name: string;
  color: string;
  gradient: string;
}

interface GenerationItem {
  name: string;
  counts: Record<PlanId, number>;
  unit: string;
  premium?: boolean;
}

interface ComparisonFeature {
  name: string;
  values: Record<PlanId, string | boolean | number>;
  isCredits?: boolean;
  icon?: React.ReactNode;
}

interface AnimatedListItemProps {
  name: string;
  count: number;
  unit: string;
  premium?: boolean;
}

interface FeatureListCardProps {
  title: string;
  icon: React.ReactNode;
  items: GenerationItem[];
  selectedPlan: PlanId;
}

// --- DATA STRUCTURES ---
// We model the data to make it easy to update.

const plans: Plan[] = [
  { id: "free", name: "Free", color: "zinc", gradient: "from-zinc-800 to-zinc-900/80" },
  { id: "basic", name: "Basic", color: "green", gradient: "from-[#FFDEDE]/15 to-zinc-900/80" },
  { id: "pro", name: "Pro", color: "blue", gradient: "from-[#00C8FF]/15 to-zinc-900/80" },
  { id: "creator", name: "Creator", color: "purple", gradient: "from-[#FFAA33]/15 to-zinc-900/80" },
];

const generationData: Record<string, GenerationItem[]> = {
  image: [
    // --- Flux Family ---
    // Rate: $0.0030 * 1.3 = $0.0039 per image
    {
      name: "Flux base",
      counts: { free: 256, basic: 2564, pro: 6410, creator: 12820 },
      unit: "images",
    },
    // Rate: $0.02 * 1.3 = $0.026 per image
    {
      name: "Flux 1 dev",
      counts: { free: 38, basic: 384, pro: 961, creator: 1923 },
      unit: "images",
    },
    // Rate: $0.04 * 1.3 = $0.052 per image
    {
      name: "Flux 1.1 Pro",
      counts: { free: 19, basic: 192, pro: 480, creator: 961 },
      unit: "images",
      premium: true,
    },
    // Rate: $0.025 * 1.3 = $0.0325 per image
    {
      name: "flux krea",
      counts: { free: 30, basic: 307, pro: 769, creator: 1538 },
      unit: "images",
    },

    // --- Imagen Family ---
    // Rate: $0.02 * 1.3 = $0.026 per image
    {
      name: "Imagen 4 fast",
      counts: { free: 38, basic: 384, pro: 961, creator: 1923 },
      unit: "images",
    },
    // Rate: $0.04 * 1.3 = $0.052 per image
    { name: "Imagen 4", counts: { free: 19, basic: 192, pro: 480, creator: 961 }, unit: "images" },
    // Rate: $0.06 * 1.3 = $0.078 per image
    {
      name: "Imagen 4 ultra",
      counts: { free: 12, basic: 128, pro: 320, creator: 641 },
      unit: "images",
    },

    // --- Other Models (alphabetical) ---
    // Rate: $0.022 * 1.3 = $0.0286 per image
    {
      name: "GPT image 1",
      counts: { free: 34, basic: 349, pro: 874, creator: 1748 },
      unit: "images",
    },
    // Rate: $0.03 * 1.3 = $0.039 per image
    {
      name: "Ideogram v3 tubo",
      counts: { free: 25, basic: 256, pro: 641, creator: 1282 },
      unit: "images",
    },
    // Rate: $0.036 * 1.3 = $0.0468 per image
    {
      name: "Midjourney",
      counts: { free: 21, basic: 213, pro: 534, creator: 1068 },
      unit: "images",
    },
    // Rate: $0.01 * 1.3 = $0.013 per image
    {
      name: "Photon flash",
      counts: { free: 76, basic: 769, pro: 1923, creator: 3846 },
      unit: "images",
    },
    // Rate: $0.025 * 1.3 = $0.0325 per image
    {
      name: "Qwen Image",
      counts: { free: 30, basic: 307, pro: 769, creator: 1538 },
      unit: "images",
    },
    // Rate: $0.04 * 1.3 = $0.052 per image
    {
      name: "Recraft v3",
      counts: { free: 19, basic: 192, pro: 480, creator: 961 },
      unit: "images",
    },
    // Rate: $0.01 * 1.3 = $0.013 per image
    { name: "Sdxl", counts: { free: 76, basic: 769, pro: 1923, creator: 3846 }, unit: "images" },
    // Rate: $0.02 * 1.3 = $0.026 per image
    {
      name: "Wan 2.2",
      counts: { free: 38, basic: 384, pro: 961, creator: 1923 },
      unit: "images",
      premium: true,
    },
  ],
  edit: [
    // --- Other Models (alphabetical) ---
    // Rate: $0.01 * 1.3 = $0.013 per image
    {
      name: "Nano Banana",
      counts: { free: 76, basic: 769, pro: 1923, creator: 3846 },
      unit: "images",
    },
    // Rate: $0.03 * 1.3 = $0.039 per image
    {
      name: "Seedream 4",
      counts: { free: 25, basic: 256, pro: 641, creator: 1282 },
      unit: "images",
      premium: true,
    },
    // --- Flux Family ---
    // Rate: $0.0049 * 1.3 = $0.00637 per output
    {
      name: "flux kontext small",
      counts: { free: 157, basic: 1570, pro: 3924, creator: 7849 },
      unit: "images",
      premium: true,
    },
    // Rate: $0.01 * 1.3 = $0.013 per output
    {
      name: "Flux kontext",
      counts: { free: 76, basic: 769, pro: 1923, creator: 3846 },
      unit: "images",
      premium: true,
    },
    // Rate: $0.025 * 1.3 = $0.0325 per output
    {
      name: "Flux kontext pro",
      counts: { free: 30, basic: 307, pro: 769, creator: 1538 },
      unit: "images",
      premium: true,
    },
    // Rate: $0.05 * 1.3 = $0.065 per output
    {
      name: "Flux kontext Max",
      counts: { free: 15, basic: 153, pro: 384, creator: 769 },
      unit: "images",
      premium: true,
    },
  ],
  other: [
    // --- Lora Models ---
    // Rate: $0.02 * 1.3 = $0.026 per style
    {
      name: "flux with lora",
      counts: { free: 38, basic: 384, pro: 961, creator: 1923 },
      unit: "styles",
      premium: true,
    },
    // Rate: $0.02 * 1.3 = $0.026 per style
    {
      name: "sdxl with lora",
      counts: { free: 38, basic: 384, pro: 961, creator: 1923 },
      unit: "styles",
      premium: true,
    },

    // --- Upscale & Style Models (alphabetical) ---
    // Rate: $0.04 * 1.3 = $0.052 per image
    {
      name: "4k upscale",
      counts: { free: 19, basic: 192, pro: 480, creator: 961 },
      unit: "images",
    },
    // Rate: $0.02 * 1.3 = $0.026 per image
    {
      name: "Illustrious",
      counts: { free: 38, basic: 384, pro: 961, creator: 1923 },
      unit: "images",
    },
    // Rate: $0.03 * 1.3 = $0.039 per image
    {
      name: "UltraRealistic",
      counts: { free: 25, basic: 256, pro: 641, creator: 1282 },
      unit: "images",
    },
  ],
};

const comparisonFeatures: ComparisonFeature[] = [
  {
    name: "Compute Units",
    values: { free: "50/day", basic: "1000/mo", pro: "2500/mo", creator: "5000/mo" },
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
    values: { free: false, basic: true, pro: true, creator: true },
    icon: <Crown className="size-4 text-yellow-500" />,
  },
  { name: "Concurrent Image Generations", values: { free: 1, basic: 2, pro: 4, creator: 4 } },
  { name: "Concurrent Video Generations", values: { free: 1, basic: 1, pro: 2, creator: 4 } },
  { name: "Concurrent Trainings", values: { free: 1, basic: 1, pro: 1, creator: 3 } },
];

// --- SUB-COMPONENTS ---

// A single item in the generation list with an animated number
const AnimatedListItem = ({ name, count, unit, premium = false }: AnimatedListItemProps) => (
  <div className="flex items-center justify-between rounded-lg px-2 py-3 text-sm transition-colors hover:bg-zinc-700/30">
    <div className="flex items-center gap-2">
      <span className="text-zinc-200">{name}</span>
      {premium && <Crown className="size-3 text-yellow-400" />}
    </div>
    <div className="flex items-center gap-1.5 font-mono">
      <motion.span
        key={count}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="font-semibold text-white"
      >
        {count.toLocaleString()}
      </motion.span>
      <span className="text-xs text-zinc-400">{unit}</span>
    </div>
  </div>
);

// A card for one of the feature list columns (Image, Video, Other)
const FeatureListCard = ({ title, icon, items, selectedPlan }: FeatureListCardProps) => {
  const selectedPlanData = plans.find((p) => p.id === selectedPlan);

  return (
    <div
      className={`bg-gradient-to-br ${selectedPlanData?.gradient || "from-zinc-800/60 to-zinc-900/80"} rounded-xl border border-zinc-600/50 p-6 shadow-lg backdrop-blur-sm`}
    >
      {/* Subtle inner glow */}
      <div className="from-white/3 pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br via-transparent to-transparent" />

      <div className="relative mb-6 flex items-center gap-3">
        <div className="rounded-lg border border-zinc-600/30 bg-zinc-800/50 p-2">{icon}</div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      <div className="relative flex flex-col gap-1">
        {items.map((item: GenerationItem) => (
          <AnimatedListItem
            key={item.name}
            name={item.name}
            count={item.counts[selectedPlan]}
            unit={item.unit}
            premium={item.premium}
          />
        ))}
      </div>
    </div>
  );
};

// The main table at the bottom
const ComparisonTable = () => {
  const renderValue = (value: string | boolean | number, feature: ComparisonFeature) => {
    if (typeof value === "boolean") {
      return value ? (
        <div className="flex justify-center">
          <Check className="size-5 text-emerald-400" />
        </div>
      ) : (
        <div className="flex justify-center">
          <X className="size-5 text-red-400" />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2">
        {feature.isCredits && <Coins className="size-4 text-yellow-400" />}
        <span className="font-medium text-white">{value}</span>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-600/50 bg-gradient-to-br from-zinc-800/60 via-zinc-900/40 to-zinc-900/80 p-6 shadow-lg backdrop-blur-sm">
      {/* Inner glow */}
      <div className="from-white/3 pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br via-transparent to-transparent" />

      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Sparkles className="size-5 text-blue-400" />
          Plan Comparison
        </h3>
      </div>

      <div className="relative">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-zinc-700/50">
              <th className="p-4 text-left font-medium text-zinc-300"></th>
              {plans.map((plan) => (
                <th key={plan.id} className="p-4 text-center font-semibold text-white">
                  <div
                    className={`border- inline-flex items-center gap-1 rounded-full border px-3 py-1${plan.color}-500/30 bg-${plan.color}-500/10`}
                  >
                    {plan.name}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonFeatures.map((feature: ComparisonFeature, index: number) => (
              <tr
                key={feature.name}
                className={`border-b border-zinc-700/30 transition-colors hover:bg-zinc-700/20 ${index % 2 === 0 ? "bg-zinc-800/20" : ""}`}
              >
                <td className="p-4 font-medium text-zinc-200">
                  <div className="flex items-center gap-2">
                    {feature.icon}
                    {feature.name}
                  </div>
                </td>
                {plans.map((plan: Plan) => (
                  <td key={plan.id} className="p-4 text-center">
                    {renderValue(feature.values[plan.id], feature)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- MAIN EXPORTED COMPONENT ---

export const FeatureComparison = () => {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("basic");
  const selectedPlanData = plans.find((p: Plan) => p.id === selectedPlan);

  return (
    <div className="mx-auto w-full max-w-7xl rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900 via-zinc-800/50 to-zinc-900 p-6 text-white shadow-2xl sm:p-8">
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] via-transparent to-transparent" />

      {/* Header with Dropdown */}
      <div className="relative mb-8 flex justify-center">
        <div className="inline-flex items-center gap-3 text-lg text-zinc-300">
          <Coins className="size-5 text-yellow-400" />
          Monthly Generations with
          <div className="relative">
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value as PlanId)}
              className={`bg-gradient-to-r ${selectedPlanData?.gradient || "from-zinc-800 to-zinc-700"} appearance-none rounded-lg border border-zinc-600/50 py-2.5 pl-4 pr-10 font-semibold text-white shadow-lg backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
            >
              {plans.map((plan: Plan) => (
                <option key={plan.id} value={plan.id} className="bg-zinc-800">
                  {plan.name} Plan
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-zinc-300" />
          </div>
        </div>
      </div>

      {/* Top Section: Generation Lists */}
      <div className="relative mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <FeatureListCard
          title="Image Generation"
          icon={<ImageIcon className="size-5 text-blue-400" />}
          items={generationData.image}
          selectedPlan={selectedPlan}
        />
        <FeatureListCard
          title="Image Editing"
          icon={<Edit2 className="size-5 text-purple-400" />}
          items={generationData.edit}
          selectedPlan={selectedPlan}
        />
        <FeatureListCard
          title="Other Features"
          icon={<Sparkles className="size-5 text-emerald-400" />}
          items={generationData.other}
          selectedPlan={selectedPlan}
        />
      </div>

      {/* Bottom Section: Comparison Table */}
      <div className="relative">
        <ComparisonTable />
      </div>
    </div>
  );
};
