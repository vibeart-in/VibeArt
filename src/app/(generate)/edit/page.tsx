"use client";
import { useState } from "react";

import BackgroundImage from "@/src/components/home/BackgroundImage";
import InputBox from "@/src/components/inputBox/InputBox";
import { ImageObject } from "@/src/components/inputBox/ReplicateParameters";
import { BackgroundPlus } from "@/src/components/ui/BackgroundPlus";
import DragAndDropBox from "@/src/components/ui/DragAndDropBox";

const Page = () => {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<ImageObject | null>(null);

  const handleUploadSuccess = (paths: ImageObject) => {
    setUploadedImageUrl(paths);
  };

  return (
    <div className="relative flex h-screen w-full flex-col items-center overflow-y-scroll bg-black px-4">
      <BackgroundPlus plusColor="#848484" />
      <BackgroundImage
        src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/background/edit_background2.webp"
        width={600}
        height={600}
        className="mt-20 h-auto w-full max-w-[600px] [&>img]:h-auto [&>img]:w-full"
      />
      <div className="z-10 my-8 mt-40 flex w-full flex-col items-center justify-center md:mt-32">
        <DragAndDropBox onUploadSuccess={handleUploadSuccess} />
      </div>
      {uploadedImageUrl && (
        <footer className="absolute bottom-4 left-0 z-10 flex w-full justify-center px-2">
          <InputBox />
        </footer>
      )}
    </div>
  );
};

export default Page;
