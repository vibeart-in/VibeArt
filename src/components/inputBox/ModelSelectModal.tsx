"use client";

import { PencilSimpleIcon, X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useMediaQuery } from "@/src/hooks/use-media-query";
import { ConversationType, ModelData } from "@/src/types/BaseType";

import DialogBox from "./DialogBox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dotted-dialog";

interface ModelSelectModalProps {
  title: string;
  description: string;
  coverImage: string;
  modelName: string;
  conversationType: ConversationType;
  onSelectModel: (model: ModelData) => void;
  triggerClassName?: string;
}

const ModelSelectModal: React.FC<ModelSelectModalProps> = ({
  title,
  description,
  coverImage,
  modelName,
  conversationType,
  onSelectModel,
  triggerClassName,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelect = (model: ModelData) => {
    onSelectModel(model);
    setIsDialogOpen(false);
  };

  const triggerContent = (
    <div
      onClick={() => {
        if (isMobile) setIsDialogOpen(true);
      }}
      className={`group relative z-20 h-[150px] w-full flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl transition-transform hover:scale-105 active:scale-100 md:h-[95px] md:w-[70px] ${triggerClassName ?? ""}`}
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_4px_18px_rgba(0,0,0,0.5)]"></div>
      <Image
        className="size-full rounded-lg object-cover transition-all duration-300 group-hover:brightness-90"
        src={coverImage}
        alt={modelName}
        width={150}
        height={95}
      />
      <div className="absolute inset-x-2 bottom-2 rounded-md bg-black/30 p-1 text-center transition-opacity group-hover:opacity-0">
        <p className="truncate font-satoshi text-sm font-medium text-accent">
          {modelName || "Select Model"}
        </p>
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
        <span className="rounded-xl bg-black/50 px-2 py-1 text-xs text-white/90">
          <PencilSimpleIcon size={20} weight="fill" />
        </span>
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="size-full overflow-y-auto p-2">
      <DialogBox conversationType={conversationType} onSelectModel={handleSelect} />
    </div>
  );

  if (isMobile) {
    return (
      <>
        {triggerContent}
        {mounted &&
          createPortal(
            <AnimatePresence>
              {isDialogOpen && (
                <motion.div
                  initial={{ opacity: 0, y: "100%" }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed inset-0 z-[9999] flex h-full flex-col bg-black p-4"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <button
                      onClick={() => setIsDialogOpen(false)}
                      className="rounded-2xl bg-white/10 p-2 text-white/70 hover:bg-white/20"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto pb-8">{renderContent()}</div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body,
          )}
      </>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{triggerContent}</DialogTrigger>
      <DialogContent className="w-full max-w-6xl rounded-[30px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default ModelSelectModal;
