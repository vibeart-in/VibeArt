"use client";

import { Check, X, Edit2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

import { updateCanvas } from "@/src/actions/canvas";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { PencilSimple } from "@phosphor-icons/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface CanvasTitleProps {
  initialTitle: string;
  projectId: string;
}

export function CanvasTitle({ initialTitle, projectId }: CanvasTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (!title.trim() || title === initialTitle) {
      setIsEditing(false);
      setTitle(initialTitle);
      return;
    }

    setIsLoading(true);
    try {
      await updateCanvas(projectId, { title });
      toast.success("Project renamed successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to rename project", error);
      toast.error("Failed to rename project");
      setTitle(initialTitle);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle(initialTitle);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="h-7 w-48 border-none bg-black/50 px-2 py-1 text-sm text-white "
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={handleSave}
          disabled={isLoading}
          className="h-7 w-7 ml-1 px-1 py-1 text-white  hover:bg-green-400 "
        >
          <Check className="size-4 text-green-400 hover:text-white" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleCancel}
          disabled={isLoading}
          className="h-7 w-7 px-1 py-1 text-red-400 hover:bg-red-400 hover:text-white"
        >
          <X className="size-4 text-red-400 hover:text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2">
      <h1 className="text-lg font-semibold text-white">{title || "Untitled Project"}</h1>
      <button
        onClick={() => setIsEditing(true)}
        className=""
      >
        
       <Tooltip>
  <TooltipTrigger asChild>
    <PencilSimple weight="fill" className="size-4 text-[#cafd00] cursor-pointer" />
  </TooltipTrigger>
  <TooltipContent>
    <p>Edit</p>
  </TooltipContent>
</Tooltip>
      </button>
    </div>
  );
}
