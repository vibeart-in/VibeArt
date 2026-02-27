"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { duplicateCanvas } from "@/src/actions/canvas";

interface UseTemplateButtonProps {
  templateId: string;
}

export function UseTemplateButton({ templateId }: UseTemplateButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleUseTemplate = () => {
    startTransition(async () => {
      try {
        const newCanvasId = await duplicateCanvas(templateId);
        router.push(`/canvas/${newCanvasId}`);
      } catch (error) {
        console.error("Failed to use template:", error);
      }
    });
  };

  return (
    <Button
      className="
        ml-2
        h-auto
        gap-1.5
        rounded-lg
        px-3
        py-1.5
        text-xs
        font-medium
        text-black
        shadow-lg
        transition-all
        duration-200
        hover:shadow-xl
        disabled:opacity-50
      "
      onClick={handleUseTemplate}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      Use
    </Button>
  );
}
