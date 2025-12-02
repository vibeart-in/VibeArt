// src/components/messages/MessageGroup.tsx

"use client";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { IconEdit } from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

import { MessageGroupType } from "@/src/types/BaseType";

import MessageTurn from "../chat/MessageTurn";

interface MessageGroupProps {
  group: MessageGroupType;
}

export default function EditMessageGroup({ group }: MessageGroupProps) {
  const { input_images, turns } = group;
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);

  const handleEditClick = (e: React.MouseEvent, imageUrl: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    const mediaData = {
      permanentPath: imageUrl,
      displayUrl: imageUrl,
      uploaderId: 0,
    };
    const currentPath = window.location.pathname;

    if (currentPath.startsWith("/edit/")) {
      // If already on edit page, emit a custom event so the page can handle the file immediately
      window.dispatchEvent(new CustomEvent("app:image-edit", { detail: mediaData }));
    } else {
      const encoded = encodeURIComponent(imageUrl);
      if ((window as any).nextRouterPush) {
        (window as any).nextRouterPush(`/edit?image-url=${encoded}`);
      } else {
        window.location.href = `${window.location.origin}/edit?image-url=${encoded}`;
      }
    }
  };

  return (
    <div className="grid w-full items-start gap-4">
      {input_images && input_images.length > 0 && (
        <div className="sticky top-8 ml-0 flex flex-col items-center gap-4 justify-self-start md:justify-self-end lg:ml-44 lg:flex-row">
          <div className="flex max-w-[100px] flex-wrap gap-4 lg:max-w-[350px]">
            {input_images.map((image) => (
              <motion.div 
                key={image.id} 
                className="group relative w-[350px] cursor-pointer overflow-hidden rounded-3xl border-2 border-white/20"
                onMouseEnter={() => setHoveredImageId(image.id)}
                onMouseLeave={() => setHoveredImageId(null)}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                {/* Image */}
                <img
                  className="w-full"
                  src={image.imageUrl}
                  width={300}
                  height={300}
                  alt="INPUT IMAGE"
                />
                
                {/* Border overlay - same as MediaCardView */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl border-2 border-white/10" />
                
                {/* Hover Overlay with same gradient and animation as MediaCardView */}
                <motion.div
                  className="absolute bottom-0 left-0 hidden w-full p-3 sm:p-4 md:block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: hoveredImageId === image.id ? 1 : 0,
                    y: hoveredImageId === image.id ? 0 : 20
                  }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Gradient overlay background - same as MediaCardView */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                  
                  {/* Edit button with same styling as MediaCardView */}
                  <div className="pointer-events-auto relative">
                    <button
                      type="button"
                      onClick={(e) => handleEditClick(e, image.imageUrl)}
                      title="Edit"
                      className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-accent/30 hover:text-accent"
                    >
                      <IconEdit className="size-4 shrink-0" aria-hidden="true" />
                      <span>Edit</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
          <ArrowRightIcon size={40} />
        </div>
      )}

      <div className="col-start-2 flex flex-col gap-8 pl-4">
        {turns?.map((turn) => (
          <MessageTurn key={turn.id} message={turn} isEdit={true} />
        ))}
      </div>
    </div>
  );
}