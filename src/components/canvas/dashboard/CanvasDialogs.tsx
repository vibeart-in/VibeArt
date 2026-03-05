import { useState } from "react";

import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dotted-dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";

interface Project {
  id: string;
  title: string;
  edited: string;
  image: string;
}

interface CanvasDialogsProps {
  // Create Dialog
  isCreateOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
  newCanvasTitle: string;
  onNewCanvasTitleChange: (title: string) => void;
  onCreateCanvas: () => void;

  // Rename Dialog
  isRenameOpen: boolean;
  onRenameOpenChange: (open: boolean) => void;
  editTitle: string;
  onEditTitleChange: (title: string) => void;
  onRenameProject: () => void;

  // Delete Dialog
  isDeleteOpen: boolean;
  onDeleteOpenChange: (open: boolean) => void;
  projectToDelete: Project | null;
  onDeleteProject: () => void;

  isPending: boolean;
}

export function CanvasDialogs({
  isCreateOpen,
  onCreateOpenChange,
  newCanvasTitle,
  onNewCanvasTitleChange,
  onCreateCanvas,
  isRenameOpen,
  onRenameOpenChange,
  editTitle,
  onEditTitleChange,
  onRenameProject,
  isDeleteOpen,
  onDeleteOpenChange,
  projectToDelete,
  onDeleteProject,
  isPending,
}: CanvasDialogsProps) {
  const [visibility, setVisibility] = useState("private");

  return (
    <>
      {/* Create Canvas Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={onCreateOpenChange}>
        <DialogContent className="border-white/10 bg-neutral-900/95 backdrop-blur-xl transition-all duration-150 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-satoshi text-xl text-white">Create New Canvas</DialogTitle>
            <DialogDescription className="text-sm text-neutral-400">
              Enter the details for your new project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium text-neutral-300">
                Project Name
              </Label>
              <Input
                id="name"
                value={newCanvasTitle}
                onChange={(e) => onNewCanvasTitleChange(e.target.value)}
                placeholder="My Awesome Project"
                className="border-white/10 bg-[#1C1C1C] text-white transition-all duration-150 placeholder:text-neutral-500"
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="visibility" className="text-sm font-medium text-neutral-300">
                Visibility
              </Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger className="w-full border-white/10 bg-[#1C1C1C] text-white transition-all duration-150">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => onCreateOpenChange(false)}
              className="text-neutral-400 transition-all duration-150 hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={onCreateCanvas}
              disabled={isPending || !newCanvasTitle.trim()}
              className="bg-white text-black transition-all duration-150 hover:bg-neutral-200 disabled:opacity-50"
            >
              {isPending ? "Creating..." : "Create Canvas"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={onRenameOpenChange}>
        <DialogContent className="border-white/10 bg-neutral-900/95 backdrop-blur-xl transition-all duration-150 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-satoshi text-xl text-white">Rename Project</DialogTitle>
            <DialogDescription className="text-sm text-neutral-400">
              Change the name of your canvas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rename" className="text-sm font-medium text-neutral-300">
                Project Name
              </Label>
              <Input
                id="rename"
                value={editTitle}
                onChange={(e) => onEditTitleChange(e.target.value)}
                placeholder="Project Name"
                className="border-white/10 bg-[#1C1C1C] text-white transition-all duration-150 placeholder:text-neutral-500"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => onRenameOpenChange(false)}
              className="text-neutral-400 transition-all duration-150 hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={onRenameProject}
              disabled={isPending || !editTitle.trim()}
              className="bg-white text-black transition-all duration-150 hover:bg-neutral-200 disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={onDeleteOpenChange}>
        <DialogContent className="border-white/10 bg-neutral-900/95 backdrop-blur-xl transition-all duration-150 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-satoshi text-xl text-white">Delete Canvas?</DialogTitle>
            <DialogDescription className="text-sm text-neutral-400">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">{projectToDelete?.title}</span>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-4">
            <Button
              variant="ghost"
              onClick={() => onDeleteOpenChange(false)}
              className="text-neutral-400 transition-all duration-150 hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={onDeleteProject}
              disabled={isPending}
              className="border-none bg-red-600 text-white transition-all duration-150 hover:bg-red-700 disabled:opacity-50"
            >
              {isPending ? "Deleting..." : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
