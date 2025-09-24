"use client"
import { IconWand } from "@tabler/icons-react";
import { GradientComponent } from "./Gradient";
import { ImageCard3D } from "./3dImageCard";
import { InfiniteImageScroll } from "./SimpleCardScroll";
import DragAndDropBox from "../ui/DragAndDropBox";
import InputBox from "../inputBox/InputBox";

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
  "/images/landing/edit/edit_image1.jpg",
  "/images/landing/edit/edit_image2.jpg",
  "/images/landing/edit/edit_image3.jpg",
  "/images/landing/edit/edit_image4.jpg",
  "/images/landing/edit/edit_image5.jpg",
  "/images/landing/edit/edit_image6.jpg",
];
const imageList2 = [
  "/images/landing/edit/edit_image7.jpg",
  "/images/landing/edit/edit_image8.jpg",
  "/images/landing/edit/edit_image9.jpg",
  "/images/landing/edit/edit_image10.jpg",
  "/images/landing/edit/edit_image11.jpg",
  "/images/landing/edit/edit_image12.jpg",
];

const EditSection = () => {
  return (
    <section className="relative mt-32">
      <p className="flex gap-3 text-[45px] justify-center items-center">
        <IconWand size={40} />
        Edit anything in seconds
      </p>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-[-1]">
        <GradientComponent colors={goldRing} sizeVW={150} />
      </div>
      <div className="relative grid grid-rows-2 [grid-template-columns:40%_60%]  gap-8 items-center p-4 ">
        <div className="row-start-1 row-end-3">
          <ImageCard3D
            topImageUrl="/images/landing/cards/goth_girl2_top.png"
            bottomImageUrl="/images/landing/cards/goth_girl2_bottom.png"
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
        <div className="z-50 absolute inset-x-0 bottom-0 h-[400px] bg-black/50 [mask-image:linear-gradient(to_top,white,transparent)] !backdrop-blur-sm" />
        <div className="z-50 absolute w-full top-[50%] flex flex-col gap-10 justify-center items-center">
          <div className="w-[300px] h-[200px]">
            <DragAndDropBox
            onUploadSuccess={()=>{}} 
            />
          </div>
          <InputBox />
        </div>
      </div>
    </section>
  );
};

export default EditSection;
