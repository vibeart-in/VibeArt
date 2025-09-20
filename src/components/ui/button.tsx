import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/src/lib/utils";

// Base styles applied to all buttons
const buttonVariants = cva(
  "px-4 py-2 rounded-xl text-sm font-bold relative cursor-pointer inline-block text-center box-border transform transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg active:scale-95 active:translate-y-0",
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
      },
      size: {
        default: "h-10 px-6",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
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
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
