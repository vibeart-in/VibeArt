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

  console.log("IN", input_images);

  return (
    <div className="flex w-full justify-center pl-20">
      {/* 1. RENDER SHARED INPUT IMAGES (IF THEY EXIST) */}
      {input_images && input_images.length > 0 && (
        <div className="sticky top-8 mr-4 flex items-center gap-4 self-start">
          <div className="flex max-w-[350px] flex-wrap gap-4">
            {input_images.map((image) => (
              <div key={image.id} className="w-[350px]">
                {/* {image.imageUrl.endsWith(".mp4") ? ( */}
                {/* <video
                    src={image.imageUrl}
                    className="rounded-3xl border-2 border-white/20 w-full"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : ( */}
                <Image
                  className="w-full rounded-3xl border-2 border-white/20"
                  src={image.signedUrl}
                  width={300}
                  height={300}
                  alt="INPUT IMAGE"
                />
                {/* )} */}
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
