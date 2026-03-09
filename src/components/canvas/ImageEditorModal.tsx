"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dotted-dialog";

const PinturaEditorDynamic = dynamic(() => import("./PinturaEditorWrapper"), {
  ssr: false,
  loading: () => (
    <div className="flex size-full items-center justify-center bg-[#0c0c0c]">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-white/10 border-t-accent" />
        <p className="text-xs text-white/40">Loading editor…</p>
      </div>
    </div>
  ),
});

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSaveCanvas: (blob: Blob) => Promise<void>;
}

export function ImageEditorModal({
  isOpen,
  onClose,
  imageUrl,
  onSaveCanvas,
}: ImageEditorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="h-[92vh] max-w-none w-[95vw] overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0c] p-0 shadow-2xl shadow-black/60 sm:max-w-none">
        <DialogTitle className="hidden">Image Editor</DialogTitle>
        {isOpen && (
          <PinturaEditorDynamic
            src={imageUrl}
            onSaveCanvas={onSaveCanvas}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
