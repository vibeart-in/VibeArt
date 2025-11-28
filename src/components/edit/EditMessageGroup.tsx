// src/components/messages/MessageGroup.tsx

"use client";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

import { MessageGroupType } from "@/src/types/BaseType";

import MessageTurn from "../chat/MessageTurn";

interface MessageGroupProps {
  group: MessageGroupType;
}

export default function EditMessageGroup({ group }: MessageGroupProps) {
  const { input_images, turns } = group;

  return (
    // MODIFICATION: Switched from Flexbox to a 3-column CSS Grid.
    // 1. `grid`: Enables Grid layout.
    // 2. `grid-cols-[1fr,auto,1fr]`: Creates three columns.
    //    - The middle column (`auto`) will be exactly as wide as its content (the message turns).
    //    - The outer columns (`1fr`) will take up the remaining space equally, perfectly centering the middle column.
    // 3. `items-start`: Aligns items to the top of their grid cell.
    <div className="grid w-full items-start gap-4">
      {/* 1. RENDER SHARED INPUT IMAGES (IF THEY EXIST) */}
      {/* This content is now in the first grid column. */}
      {/* `justify-self-end` aligns it to the right edge of its column. */}
      {input_images && input_images.length > 0 && (
        <div className="sticky top-8 ml-0 flex flex-col items-center gap-4 justify-self-start md:justify-self-end lg:ml-44 lg:flex-row">
          <div className="flex max-w-[100px] flex-wrap gap-4 lg:max-w-[350px]">
            {input_images.map((image) => (
              <div key={image.id} className="w-[350px]">
                <Image
                  className="w-full rounded-3xl border-2 border-white/20"
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
      {/* MODIFICATION: `col-start-2` explicitly places this div in the
          second (center) column of our grid. This is crucial because it ensures
          the turns are centered even if there are no input images. */}
      <div className="col-start-2 flex flex-col gap-8 pl-4">
        {turns?.map((turn) => (
          <MessageTurn key={turn.id} message={turn} isEdit={true} />
        ))}
      </div>

      {/* The third grid column (`1fr`) is intentionally left empty. 
          It provides the balancing space on the right side. */}
    </div>
  );
}
