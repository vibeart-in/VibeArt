"use client";

import { useState, useTransition } from "react";
import { Loader2, Share2, Check } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { publishCanvas } from "@/src/actions/canvas";
import { cn } from "@/src/lib/utils";

interface PublishButtonProps {
  canvasId: string;
  isPublic: boolean;
}

export function PublishButton({ canvasId, isPublic: initialIsPublic }: PublishButtonProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [isPending, startTransition] = useTransition();

  const handlePublish = () => {
    if (isPublic) return; // Already published

    startTransition(async () => {
      try {
        await publishCanvas(canvasId);
        setIsPublic(true);
      } catch (error) {
        console.error("Failed to publish canvas:", error);
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "group relative ml-2 h-9 overflow-hidden rounded-full border border-white/10 px-5 text-xs font-semibold text-white transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]",
        isPublic
          ? "bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]"
          : "bg-white/5 hover:bg-white/10"
      )}
      onClick={handlePublish}
      disabled={isPublic || isPending}
    >
      <div className="relative z-10 flex items-center gap-2">
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : isPublic ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Share2 className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        )}
        <span className="tracking-wide">
          {isPending ? "Publishing..." : isPublic ? "Published" : "Publish"}
        </span>
      </div>
      
      {/* Background glow effect */}
      {!isPublic && (
         <div className="absolute inset-0 -z-10 bg-gradient-to-r from-accent -600/20 to-white-600/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}
    </Button>
  );
}
