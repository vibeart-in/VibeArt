"use client";

import React from "react";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Sparkles } from "lucide-react";

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
    <div className="flex items-center gap-2 ml-1">
      <div className="h-1 w-1 rounded-full bg-[#CCFF00]" />
      <Label className="text-[13px] font-bold text-zinc-400 uppercase tracking-wider">
        {text}
      </Label>
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
    <div className="relative group">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`min-h-[70px] w-full resize-none rounded-2xl border-2 border-zinc-800 bg-[#1A1A1A]/40 px-4 py-3 text-[14px] font-medium text-zinc-200 placeholder:text-zinc-700 focus:border-[#CCFF00]/30 focus:bg-[#1A1A1A]/60 focus:ring-4 focus:ring-[#CCFF00]/5 transition-all duration-300 ${className}`}
        placeholder={placeholder}
        style={{ height: "70px" }}
      />
      <div className="absolute top-4 right-4 text-zinc-600 group-focus-within:text-[#CCFF00]/40 transition-colors">
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
  const defaultTriggerClass = "h-11 w-full rounded-2xl border-zinc-800 bg-[#1A1A1A] text-xs font-semibold text-zinc-300 hover:bg-zinc-800/50 transition-colors";
  
  return (
    <div className={`min-w-[140px] ${className}`}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={triggerClassName || defaultTriggerClass}>
          {triggerIcon && <span className="mr-2">{triggerIcon}</span>}
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-[#1A1A1A] border-zinc-800">
          {options.map((opt) => {
             const label = typeof opt === 'string' ? opt : opt.label;
             const val = typeof opt === 'string' ? opt : opt.value;
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
