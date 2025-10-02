import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
