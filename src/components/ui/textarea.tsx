import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  maxHeight?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, maxHeight, ...props }, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null);
    React.useImperativeHandle(ref, () => internalRef.current!);
    const adjustHeight = () => {
      const textarea = internalRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };

    React.useEffect(() => {
      adjustHeight();
    }, [props.value]);

    return (
      <textarea
        className={cn(
          "flex w-full bg-transparent p-2 text-base",
          "resize-none",
          // "border border-white/10",
          "rounded-xl",
          "placeholder:text-white/50",
          "placeholder:text-base",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={internalRef}
        rows={1}
        style={{
          maxHeight: maxHeight ? `${maxHeight}px` : undefined,
        }}
        onInput={adjustHeight}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
