import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/src/lib/utils";

// Base styles applied to all buttons
const buttonVariants = cva(
  "relative box-border inline-block transform cursor-pointer rounded-xl px-4 py-2 text-center text-sm font-bold transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg active:translate-y-0 active:scale-95",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-[#D9E825] to-[#E3D2BA] border border-[#D9E825] text-black " +
          "hover:from-[#E3F235] hover:to-[#F0E0CC] hover:border-[#E3F235] " +
          "hover:shadow-[0_8px_25px_rgba(217,232,37,0.3)] " +
          "active:from-[#C5D020] active:to-[#D4C2A5]",

        secondary:
          "bg-transparent border border-accent text-black dark:text-white " +
          "hover:bg-accent/10 hover:border-accent/80 " +
          "hover:shadow-[0_4px_15px_rgba(0,0,0,0.1)] " +
          "active:bg-accent/20",

        destructive:
          "bg-red-500 text-white border border-red-500 " +
          "hover:bg-red-600 hover:border-red-600 " +
          "hover:shadow-[0_8px_25px_rgba(239,68,68,0.3)] " +
          "active:bg-red-700",

        outline:
          "bg-transparent border border-input text-black dark:text-white " +
          "hover:bg-accent hover:text-accent-foreground " +
          "hover:shadow-[0_4px_15px_rgba(0,0,0,0.1)] " +
          "active:bg-accent/80",

        ghost:
          "bg-transparent text-black dark:text-white " +
          "hover:bg-accent hover:text-accent-foreground " +
          "active:bg-accent/80",
      },
      size: {
        default: "h-10 px-6",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
