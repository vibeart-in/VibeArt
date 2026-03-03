"use client";

import { Check, X, Globe, Eye } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

import { updateCanvas, publishCanvas } from "@/src/actions/canvas";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { PencilSimple } from "@phosphor-icons/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { PublishDialog } from "./PublishDialog";
import { useCanvas } from "@/src/components/providers/CanvasProvider";

interface CanvasTitleProps {
  initialTitle: string;
  projectId: string;
  initialIsPublic?: boolean;
  isReadOnly?: boolean;
}

export function CanvasTitle({
  initialTitle,
  projectId,
  initialIsPublic = false,
  isReadOnly = false,
}: CanvasTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { project } = useCanvas();

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

  const handleTogglePublish = async () => {
    if (isPublic) {
      // Unpublish directly
      try {
        await publishCanvas(projectId, false);
        setIsPublic(false);
        toast.success("Canvas unpublished.");
      } catch (error) {
        console.error("Failed to unpublish canvas", error);
        toast.error("Failed to unpublish canvas");
      }
    } else {
      // Show dialog for publishing
      setShowPublishDialog(true);
    }
  };

  const handlePublishSuccess = (published: boolean) => {
    setIsPublic(published);
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
          className="h-7 w-48 border-none bg-black/50 px-2 py-1 text-sm text-white"
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={handleSave}
          disabled={isLoading}
          className="ml-1 h-7 w-7 px-1 py-1 text-white hover:bg-green-400"
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

      {isReadOnly && (
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2.5 py-0.5 text-xs font-medium text-neutral-400 backdrop-blur-md">
          <Eye className="size-3" /> View Only
        </span>
      )}

      {/* Edit button */}
      {!isReadOnly && (
        <button onClick={() => setIsEditing(true)}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PencilSimple weight="fill" className="size-4 cursor-pointer text-[#cafd00]" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Rename</p>
            </TooltipContent>
          </Tooltip>
        </button>
      )}

      {/* Publish button */}
      {!isReadOnly && (
        <>
          <button onClick={handleTogglePublish}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Globe
                    className={`size-5 cursor-pointer transition-all ${
                      isPublic
                        ? "text-red-400 hover:text-red-300"
                        : "text-white/90 hover:text-white/70"
                    }`}
                    style={{ fill: isPublic ? "none" : "none", color: isPublic ? "red" : "green" }}
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isPublic ? "Published — click to unpublish" : "Publish to Community"}</p>
              </TooltipContent>
            </Tooltip>
          </button>

          <PublishDialog
            isOpen={showPublishDialog}
            onClose={() => setShowPublishDialog(false)}
            projectId={projectId}
            currentTitle={title}
            inputImages={(project as any)?.input_images || []}
            outputImages={(project as any)?.output_images || []}
            onPublishSuccess={handlePublishSuccess}
          />
        </>
      )}
    </div>
  );
}
