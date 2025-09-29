"use client";
import BackgroundImage from "@/src/components/home/BackgroundImage";
import { BackgroundPlus } from "@/src/components/ui/BackgroundPlus";
import InputBox from "@/src/components/inputBox/InputBox";
import DragAndDropBox from "@/src/components/ui/DragAndDropBox";
import { useState } from "react";

const Page = () => {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const handleUploadSuccess = (url: string) => {
    setUploadedImageUrl(url);
  };

  return (
    <div className="relative w-full h-screen flex flex-col bg-black overflow-y-scroll items-center">
      <BackgroundPlus plusColor="#848484" />
      <BackgroundImage
        src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/background/edit_background2.webp"
        width={600}
        height={600}
      />
      <div className="z-10 my-8 mt-32 flex flex-col justify-center items-center">
        <DragAndDropBox onUploadSuccess={handleUploadSuccess} />
      </div>
      {uploadedImageUrl && (
        <footer className="absolute bottom-4 left-0 z-10 w-full px-2 flex justify-center">
          <InputBox/>
        </footer>
      )}
    </div>
  );
};

export default Page;
