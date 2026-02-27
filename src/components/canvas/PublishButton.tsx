"use client";

import { useState, useTransition, useEffect } from "react";
import { Loader2, Share2, Check } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { updateCanvas, getCanvasImages } from "@/src/actions/canvas";
import { cn } from "@/src/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/src/components/ui/dotted-dialog";
import { Input } from "@/src/components/ui/input";
import { toast } from "sonner";

interface PublishButtonProps {
  canvasId: string;
  isPublic: boolean;
  defaultTitle?: string | null;
  defaultImage?: string | null;
}

export function PublishButton({
  canvasId,
  isPublic: initialIsPublic,
  defaultTitle,
  defaultImage,
}: PublishButtonProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const [title, setTitle] = useState(defaultTitle || "");
  const [selectedImage, setSelectedImage] = useState<string | null>(defaultImage || null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [availableImages, setAvailableImages] = useState<any[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingImages(true);
      getCanvasImages(canvasId)
        .then((images) => {
          setAvailableImages(images || []);
        })
        .finally(() => setIsLoadingImages(false));
    }
  }, [isOpen, canvasId]);

  const handlePublish = () => {
    startTransition(async () => {
      try {
        const updates: any = {
          title: title,
          is_public: true,
        };
        if (selectedImageId) {
          updates.image_id = selectedImageId;
        }

        await updateCanvas(canvasId, updates);
        setIsPublic(true);
        setIsOpen(false);
        toast.success(isPublic ? "Canvas updated!" : "Canvas published successfully!");
      } catch (error) {
        console.error("Failed to publish canvas:", error);
        toast.error("Failed to publish canvas");
      }
    });
  };

  const handleUnpublish = () => {
    startTransition(async () => {
      try {
        await updateCanvas(canvasId, { is_public: false });
        setIsPublic(false);
        setIsOpen(false);
        toast.success("Canvas unpublished.");
      } catch (error) {
        console.error("Failed to unpublish canvas:", error);
        toast.error("Failed to unpublish canvas");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "group relative ml-2 h-9 overflow-hidden rounded-full border border-white/10 px-5 text-xs font-semibold text-white transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]",
            isPublic
              ? "border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 text-emerald-400 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]"
              : "bg-white/5 hover:bg-white/10",
          )}
        >
          <div className="relative z-10 flex items-center gap-2">
            {isPublic ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Share2 className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            )}
            <span className="tracking-wide">{isPublic ? "Published" : "Publish"}</span>
          </div>

          {/* Background glow effect */}
          {!isPublic && (
            <div className="-600/20 to-white-600/20 absolute inset-0 -z-10 bg-gradient-to-r from-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isPublic ? "Edit Publication" : "Publish Canvas"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Canvas Title"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">Cover Image</label>
            <div className="custom-scrollbar grid max-h-40 grid-cols-3 gap-2 overflow-y-auto p-1">
              {isLoadingImages ? (
                <div className="col-span-3 flex justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : availableImages.length > 0 ? (
                availableImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => {
                      setSelectedImage(img.url || img.image_url || img.public_url);
                      setSelectedImageId(img.id);
                    }}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-md border transition-all hover:scale-105 active:scale-95",
                      selectedImageId === img.id
                        ? "border-emerald-500 ring-2 ring-emerald-500/20"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    <img
                      src={img.url || img.image_url || img.public_url}
                      alt="Canvas output"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))
              ) : (
                <div className="col-span-3 rounded-md border border-dashed py-2 text-center text-xs text-muted-foreground">
                  No output images found.
                </div>
              )}
            </div>
            {selectedImage && (
              <div className="mt-2 flex items-center gap-2 rounded-md border bg-muted/50 p-2">
                <img src={selectedImage} alt="Cover" className="h-8 w-8 rounded-sm object-cover" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium">Selected Cover</span>
                  <span className="max-w-[150px] truncate text-[10px] text-muted-foreground">
                    {selectedImageId ? "Output Image" : "Current Cover"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="flex flex-row items-center gap-2 sm:justify-between">
          {isPublic ? (
            <Button variant="destructive" size="sm" onClick={handleUnpublish} disabled={isPending}>
              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Unpublish"}
            </Button>
          ) : (
            <div />
          )}
          <Button onClick={handlePublish} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            {isPublic ? "Save Changes" : "Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
