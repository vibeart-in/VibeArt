"use client";

import { Sparkles } from "lucide-react";
import React from "react";

import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";

// --- Types ---
interface AppParamTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface AppParamSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: (string | { label: string; value: string })[];
  className?: string; // Class for the wrapper container
  triggerIcon?: React.ReactNode; // Icon to display in the trigger
  renderOption?: (option: string | { label: string; value: string }) => React.ReactNode; // Custom renderer for options
  triggerClassName?: string; // Class for the trigger element
}

interface AppSectionLabelProps {
  text: string;
}

// --- Components ---

export const AppSectionLabel = ({ text }: AppSectionLabelProps) => {
  return (
    <div className="ml-1 flex items-center gap-2">
      <div className="size-1 rounded-full bg-[#CCFF00]" />
      <Label className="text-[13px] font-bold uppercase tracking-wider text-zinc-400">{text}</Label>
    </div>
  );
};

export const AppParamTextarea = ({
  value,
  onChange,
  placeholder,
  className,
}: AppParamTextareaProps) => {
  return (
    <div className="group relative">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`min-h-[70px] w-full resize-none rounded-2xl border-2 border-zinc-800 bg-[#1A1A1A]/40 px-4 py-3 text-[14px] font-medium text-zinc-200 transition-all duration-300 placeholder:text-zinc-700 focus:border-[#CCFF00]/30 focus:bg-[#1A1A1A]/60 focus:ring-4 focus:ring-[#CCFF00]/5 ${className}`}
        placeholder={placeholder}
        style={{ height: "70px" }}
      />
      <div className="absolute right-4 top-4 text-zinc-600 transition-colors group-focus-within:text-[#CCFF00]/40">
        <Sparkles size={16} />
      </div>
    </div>
  );
};

export const AppParamSelect = ({
  value,
  onValueChange,
  placeholder,
  options,
  className,
  triggerIcon,
  renderOption,
  triggerClassName,
}: AppParamSelectProps) => {
  const defaultTriggerClass =
    "h-11 w-full rounded-2xl border-zinc-800 bg-[#1A1A1A] text-xs font-semibold text-zinc-300 hover:bg-zinc-800/50 transition-colors";

  return (
    <div className={`min-w-[140px] ${className}`}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={triggerClassName || defaultTriggerClass}>
          {triggerIcon && <span className="mr-2">{triggerIcon}</span>}
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="border-zinc-800 bg-[#1A1A1A]">
          {options.map((opt) => {
            const label = typeof opt === "string" ? opt : opt.label;
            const val = typeof opt === "string" ? opt : opt.value;
            return (
              <SelectItem key={val} value={val}>
                {renderOption ? renderOption(opt) : <span className="text-xs">{label}</span>}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};
