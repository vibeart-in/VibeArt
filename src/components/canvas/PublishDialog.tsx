"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Image as ImageIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { publishCanvas } from "@/src/actions/canvas";
import { createClient } from "@/src/lib/supabase/client";

interface PublishDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  currentTitle: string;
  inputImages?: string[];
  outputImages?: string[];
  onPublishSuccess: (isPublic: boolean) => void;
}

interface ImageOption {
  id: string;
  url: string;
  type: "input" | "output";
}

export function PublishDialog({
  isOpen,
  onClose,
  projectId,
  currentTitle,
  inputImages = [],
  outputImages = [],
  onPublishSuccess,
}: PublishDialogProps) {
  const [title, setTitle] = useState(currentTitle);
  const [selectedCover, setSelectedCover] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageOptions, setImageOptions] = useState<ImageOption[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setTitle(currentTitle);
      setSelectedCover(null);
      loadImages();
    }
  }, [isOpen, currentTitle]);

  const loadImages = async () => {
    setLoadingImages(true);
    const supabase = createClient();
    const options: ImageOption[] = [];

    try {
      // Fetch input images
      if (inputImages.length > 0) {
        const { data: inputImagesData } = await supabase
          .from("images")
          .select("id, image_url")
          .in("id", inputImages);

        if (inputImagesData) {
          options.push(
            ...inputImagesData.map((img) => ({
              id: img.id,
              url: img.image_url,
              type: "input" as const,
            })),
          );
        }
      }

      // Fetch output images
      if (outputImages.length > 0) {
        const { data: outputImagesData } = await supabase
          .from("images")
          .select("id, image_url")
          .in("id", outputImages);

        if (outputImagesData) {
          options.push(
            ...outputImagesData.map((img) => ({
              id: img.id,
              url: img.image_url,
              type: "output" as const,
            })),
          );
        }
      }

      setImageOptions(options);
    } catch (error) {
      console.error("Error loading images:", error);
      toast.error("Failed to load images");
    } finally {
      setLoadingImages(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setIsLoading(true);
    try {
      await publishCanvas(projectId, true, title, selectedCover);
      toast.success("Canvas published to Community!");
      onPublishSuccess(true);
      onClose();
    } catch (error) {
      console.error("Failed to publish canvas", error);
      toast.error("Failed to publish canvas");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Publish to Community</DialogTitle>
          <DialogDescription>
            Share your canvas with the community. Choose a title and cover image.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your canvas"
              disabled={isLoading}
            />
          </div>

          {/* Cover Image Selection */}
          <div className="space-y-2">
            <Label>Cover Image (Optional)</Label>
            {loadingImages ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                Loading images...
              </div>
            ) : imageOptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-sm text-muted-foreground">
                <ImageIcon className="mb-2 size-8" />
                <p>No images available</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {imageOptions.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedCover(image.id)}
                    disabled={isLoading}
                    className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                      selectedCover === image.id
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-transparent hover:border-muted-foreground/50"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${image.type} image`}
                      className="size-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                    <div className="absolute right-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                      {image.type}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handlePublish} disabled={isLoading || !title.trim()}>
            {isLoading ? "Publishing..." : "Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
