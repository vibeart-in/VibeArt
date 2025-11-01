"use client";

import { Wand2Icon } from "lucide-react";
import * as React from "react";

import { cn } from "@/src/lib/utils"; // Assuming you have a cn utility for classes
import { getIconForParam } from "@/src/utils/server/utils";

// Define the props for the custom switch
interface CustomSwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  title?: string;
}

const Switch = React.forwardRef<HTMLButtonElement, CustomSwitchProps>(
  ({ className, checked, onCheckedChange, title, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        ref={ref}
        className={cn(
          "inline-flex h-full items-center justify-center gap-2 rounded-2xl border p-3",
          "cursor-pointer select-none transition-all duration-200 ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          {
            "border-accent bg-black shadow-accent": checked,
            "border-white/ bg-background text-white": !checked,
          },
          className,
        )}
        {...props}
      >
        <div
          className={cn("h-4 w-4", {
            "text-accent": checked,
            "text-white": !checked,
          })}
        >
          {title ? getIconForParam(title) : <Wand2Icon size={15} />}
        </div>

        <span
          className={cn(
            "text-xs font-medium", // Base text styles
            {
              "text-accent": checked, // Your 'text-accent'
              "text-white": !checked,
            },
          )}
        >
          {checked ? "On" : "Off"}
        </span>
      </button>
    );
  },
);

Switch.displayName = "CustomSwitch";

export { Switch };
