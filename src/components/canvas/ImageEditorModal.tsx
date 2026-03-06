"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dotted-dialog";

const PinturaEditorDynamic = dynamic(() => import("./PinturaEditorWrapper"), { ssr: false });

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
      {/* Use a larger max-w class for the editor */}
      <DialogContent className="h-[90vh] max-w-6xl overflow-hidden p-0 sm:max-w-[90vw]">
        <DialogTitle className="hidden">Image edit</DialogTitle>
        {isOpen && (
          <PinturaEditorDynamic src={imageUrl} onSaveCanvas={onSaveCanvas} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}
