"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils"; // Assuming you have a cn utility for classes
import { Wand2Icon } from "lucide-react";

// Define the props for the custom switch
interface CustomSwitchProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const Switch = React.forwardRef<
  HTMLButtonElement,
  CustomSwitchProps
>(({ className, checked, onCheckedChange, ...props }, ref) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      ref={ref}
      className={cn(
        // Base container styles
        "inline-flex items-center justify-center gap-2 rounded-xl border p-3",
        "cursor-pointer select-none transition-all duration-200 ease-in-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",

        // State-based styles
        {
          "border-accent bg-black shadow-accent": checked,
          "border-white/ bg-background text-white": !checked,
        },
        className 
      )}
      {...props}
    >
      <Wand2Icon
        className={cn(
          "w-4 h-4",
          {
            "text-accent": checked, // Icon becomes accent color when on
            "text-white": !checked,
          }
        )}
      />
      <span
        className={cn(
          "text-sm font-medium", // Base text styles
          {
            "text-accent": checked, // Your 'text-accent'
            "text-white": !checked,
          }
        )}
      >
        {checked ? "On" : "Off"}
      </span>
    </button>
  );
});

Switch.displayName = "CustomSwitch";

export { Switch };