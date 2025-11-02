import {
  FrameCornersIcon,
  LightningIcon,
  GearIcon,
  ImageIcon,
  PaintBrushIcon,
  MusicNoteIcon,
  TimerIcon,
  BrainIcon,
  FireIcon,
  HighDefinitionIcon,
  PenNibIcon,
} from "@phosphor-icons/react/dist/ssr";
import { IconPaint } from "@tabler/icons-react";
import { IconBolt, IconBrandGoogle, IconCamera, IconPhoto, IconPig } from "@tabler/icons-react";
import { RatioIcon, Wand2Icon } from "lucide-react";

import FluxIcon from "@/src/icons/flux";
import MidjourneyIcon from "@/src/icons/midjourney";

export function getTagColor(index: number): string {
  const colors = [
    "border-blue-300/60 text-blue-300",
    "border-green-300/60 text-green-300",
    "border-purple-300/60 text-purple-300",
    "border-pink-300/60 text-pink-300",
    "border-yellow-300/60 text-yellow-300",
    "border-red-300/60 text-red-300",
    "border-cyan-300/60 text-cyan-300",
    "border-orange-300/60 text-orange-300",
  ];
  return colors[index % colors.length];
}

export const getIconForParam = (title: string) => {
  const titleLower = title.toLowerCase();

  if (titleLower.includes("model") || titleLower.includes("lora"))
    return <BrainIcon size={15} weight="regular" />;
  if (titleLower.includes("style_preset")) return <IconPaint size={15} />;
  if (titleLower.includes("duration") || titleLower.includes("time"))
    return <TimerIcon size={15} weight="regular" />;
  if (titleLower.includes("audio")) return <MusicNoteIcon size={15} weight="regular" />;
  if (titleLower.includes("aspect") || titleLower.includes("ratio")) return <RatioIcon size={15} />;
  if (
    titleLower.includes("magic_prompt_option") ||
    titleLower.includes("enhance") ||
    titleLower.includes("upsampling")
  )
    return <Wand2Icon size={15} />;
  if (titleLower.includes("resolution") || titleLower.includes("output"))
    return <ImageIcon size={15} weight="regular" />;
  if (titleLower.includes("steps") || titleLower.includes("config"))
    return <GearIcon size={15} weight="regular" />;
  if (titleLower.includes("speed_mode") || titleLower.includes("fast"))
    return <LightningIcon size={15} weight="regular" />;
  if (titleLower.includes("style")) return <PaintBrushIcon size={15} weight="regular" />;
  return <FrameCornersIcon size={15} weight="regular" />;
};

export const TagIcon = ({ name }: { name: string }) => {
  const icons: { [key: string]: React.ReactNode } = {
    All: <FireIcon size={20} weight="bold" />,
    google: <IconBrandGoogle size={20} />,
    flux: <FluxIcon className="size-6" />,
    value: <IconPig size={20} />,
    fast: <IconBolt size={20} />,
    midjourney: <MidjourneyIcon className="size-6" />,
    highres: <HighDefinitionIcon size={20} weight="bold" />,
    cinimatic: <IconCamera size={20} />,
    photoreal: <IconPhoto size={20} />,
    desgin: <PenNibIcon size={20} weight="bold" />,
  };

  return <>{icons[name] ?? icons[name.toLowerCase()] ?? <FireIcon size={20} weight="bold" />}</>;
};

export const normalizeTag = (t: unknown) => {
  try {
    return String(t ?? "")
      .toLowerCase()
      .trim();
  } catch {
    return "";
  }
};
