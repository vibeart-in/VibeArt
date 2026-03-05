"use client";

import { Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { cloneCanvasAction } from "@/src/actions/canvas/clone";
import { Button } from "@/src/components/ui/button";

interface CloneButtonProps {
  canvasId: string;
}

export function CloneButton({ canvasId }: CloneButtonProps) {
  const router = useRouter();
  const [isCloning, setIsCloning] = useState(false);

  const handleClone = async () => {
    setIsCloning(true);
    try {
      const result = await cloneCanvasAction(canvasId);

      if (result.success && result.data) {
        toast.success("Canvas cloned successfully!");
        router.push(`/canvas/${result.data.canvasId}`);
      } else {
        toast.error("error" in result ? result.error : "Failed to clone canvas");
      }
    } catch (error) {
      toast.error("An error occurred while cloning");
      console.error("Clone error:", error);
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <Button
      onClick={handleClone}
      disabled={isCloning}
      className="flex items-center gap-3 rounded-2xl border-white/20 bg-black/80 p-6 text-white hover:border-white/10 disabled:opacity-50"
    >
      <Copy className="size-4" />
      <span className="text-sm"> {isCloning ? "Cloning..." : "Clone Workflow"}</span>
    </Button>
  );
}
