import { ImageCard3D } from "./3dImageCard";
import { InfiniteImageScroll } from "./SimpleCardScroll";

const imageList = [
  "/images/landing/edit/cane2.png",
  "/images/landing/edit/cane3.png",
  "/images/landing/edit/cane4.png",
];

const EditShowcase = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center gap-32">
      <div className="flex flex-col gap-12">
        <ImageCard3D
          topImageUrl="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/edit/cane6_top.webp"
          bottomImageUrl="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/edit/cane6_bottom.webp"
          width={300}
          height={300}
          cardText="Cane Floating"
        />
        <ImageCard3D
          topImageUrl="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/edit/cane5_top.webp"
          bottomImageUrl="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/edit/cane5_bottom.webp"
          width={300}
          height={300}
          cardText="Cane"
        />
      </div>
      <div className="flex flex-col gap-6">
        <InfiniteImageScroll
          images={imageList}
          direction="up"
          orientation="vertical"
          className="h-[800px]"
        />
      </div>
      <ImageCard3D
        topImageUrl="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/edit/cane_women_top.webp"
        bottomImageUrl="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/edit/cane_women.webp"
        width={600}
        height={600}
        cardText="Cane"
      />
    </div>
  );
};

export default EditShowcase;
