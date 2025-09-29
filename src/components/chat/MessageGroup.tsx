"use client";
import Image from "next/image";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { MessageGroupType } from "@/src/types/BaseType";
import MessageTurn from "./MessageTurn";

interface MessageGroupProps {
  group: MessageGroupType;
}

export default function MessageGroup({ group }: MessageGroupProps) {
  const { input_images, turns } = group;

  return (
    <div className="w-full flex max-w-screen justify-center">
      {/* 1. RENDER SHARED INPUT IMAGES (IF THEY EXIST) */}
      {input_images && input_images.length > 0 && (
        <div className="sticky top-8 flex items-center gap-8 mr-8 self-start">
          <div className="flex gap-4 flex-wrap max-w-[350px]">
            {input_images.map((image) => (
              <div key={image.id} className="max-w-[350px]">
                <Image
                  className="rounded-3xl border-2 border-white/20 w-full"
                  src={image.imageUrl}
                  width={300}
                  height={300}
                  alt="INPUT IMAGE"
                />
              </div>
            ))}
          </div>
          <ArrowRightIcon size={40} />
        </div>
      )}

      {/* 2. RENDER THE PROMPT/OUTPUT TURNS */}
      <div className="flex flex-col gap-8">
        {turns.map((turn) => (
          <MessageTurn key={turn.id} message={turn} />
        ))}
      </div>
    </div>
  );
}
