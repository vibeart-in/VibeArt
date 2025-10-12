"use client";
import { IconWand } from "@tabler/icons-react";

import { ImageCard3D } from "./3dImageCard";
import { GradientComponent } from "./Gradient";
import { InfiniteImageScroll } from "./SimpleCardScroll";
import InputBox from "../inputBox/InputBox";
import DragAndDropBox from "../ui/DragAndDropBox";

const goldRing = {
  primary: "#ADB2B6",
  secondary: "#D8A876",
  accent1: "#FDDCD1",
  accent2: "#C4D1D9",
  accent3: "#D7AE7A",
  highlight1: "#110F02",
  highlight2: "#181818",
};

const imageList1 = [
  "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/edit/edit_image1.webp",
  "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/edit/edit_image2.webp",
  "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/edit/edit_image3.webp",
  "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/edit/edit_image4.webp",
  "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/edit/edit_image5.webp",
  "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/edit/edit_image6.webp",
];
const imageList2 = [
  "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/edit/edit_image7.webp",
  "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/edit/edit_image8.webp",
  "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/edit/edit_image9.webp",
  "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/edit/edit_image10.webp",
  "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/edit/edit_image11.webp",
  "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/edit/edit_image12.webp",
];

const EditSection = () => {
  return (
    <section className="relative mt-32">
      <p className="flex items-center justify-center gap-3 text-[45px]">
        <IconWand size={40} />
        Edit anything in seconds
      </p>
      <div className="absolute left-1/2 top-0 z-[-1] -translate-x-1/2">
        <GradientComponent colors={goldRing} sizeVW={150} />
      </div>
      <div className="relative grid grid-rows-2 items-center gap-8 p-4 [grid-template-columns:40%_60%]">
        <div className="row-start-1 row-end-3">
          <ImageCard3D
            topImageUrl="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/goth_girl2_top.webp"
            bottomImageUrl="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/cards/goth_girl2_bottom.webp"
            cardText=""
            topImageScale={1.2}
            width={500}
            height={600}
          />
        </div>
        <InfiniteImageScroll
          images={imageList1}
          speed="slow"
          direction="left"
          pauseOnHover={false}
        />
        <InfiniteImageScroll
          images={imageList2}
          speed="slow"
          direction="right"
          pauseOnHover={false}
        />
        <div className="absolute inset-x-0 bottom-0 z-50 h-[400px] bg-black/50 !backdrop-blur-sm [mask-image:linear-gradient(to_top,white,transparent)]" />
        <div className="absolute top-[50%] z-50 flex w-full flex-col items-center justify-center gap-10">
          <div className="h-[200px] w-[300px]">
            <DragAndDropBox onUploadSuccess={() => {}} />
          </div>
          <InputBox />
        </div>
      </div>
    </section>
  );
};

export default EditSection;
