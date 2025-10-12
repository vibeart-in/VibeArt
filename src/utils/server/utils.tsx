import {
  SparkleIcon,
  FrameCornersIcon,
  LightningIcon,
  GearIcon,
  ImageIcon,
  PaintBrushIcon,
} from "@phosphor-icons/react/dist/ssr";
import { RatioIcon } from "lucide-react";

export function getTagColor(index: number): string {
  const colors = [
    "border-blue-500/80 text-blue-400",
    "border-green-500/80 text-green-400",
    "border-purple-500/80 text-purple-400",
    "border-pink-500/80 text-pink-400",
    "border-yellow-500/80 text-yellow-400",
    "border-red-500/80 text-red-400",
    "border-cyan-500/80 text-cyan-400",
    "border-orange-500/80 text-orange-400",
  ];
  return colors[index % colors.length];
}

export const getIconForParam = (title: string) => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes("aspect") || titleLower.includes("ratio")) return <RatioIcon size={15} />;
  if (titleLower.includes("magic_prompt_option") || titleLower.includes("enhance"))
    return <SparkleIcon size={15} weight="regular" />;
  if (titleLower.includes("resolution") || titleLower.includes("output"))
    return <ImageIcon size={15} weight="regular" />;
  if (titleLower.includes("steps") || titleLower.includes("config"))
    return <GearIcon size={15} weight="regular" />;
  if (titleLower.includes("speed_mode") || titleLower.includes("fast"))
    return <LightningIcon size={15} weight="regular" />;
  if (titleLower.includes("style")) return <PaintBrushIcon size={15} weight="regular" />;
  return <FrameCornersIcon size={15} weight="regular" />;
};
