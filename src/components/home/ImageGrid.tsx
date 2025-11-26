"use client";
import Masonry from "react-masonry-css";

import { ExampleImageType } from "@/src/types/BaseType";

import { Button } from "../ui/button";
import ImageCard from "../ui/imageCard/ImageCard";

type ImageGalleryProps = {
  images: ExampleImageType[] | null;
  columnCount?: number;
  showMore?: boolean;
  onShowMoreClick?: () => void;
};

const ImageGallery = ({
  images,
  columnCount = 4,
  showMore = false,
  onShowMoreClick,
}: ImageGalleryProps) => {
  if (!images || images.length === 0) return <p>No images to show.</p>;

  const breakpointColumnsObj = {
    default: columnCount,
    1280: Math.min(columnCount, 3),
    1024: Math.min(columnCount, 2),
    640: 2,
  };


  return (
    <div className="relative flex flex-col items-center overflow-hidden">
      {/* Masonry Grid */}
      <div
        className={`relative w-full overflow-hidden ${showMore ? "pb-[150px]" : "pb-8"}`}
      >
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {images.map((image, index) => (
            <ImageCard
              key={image.id || index}
              isVideo={image.isVideo}
              mediaUrl={image.mediaUrl}
              thumbnailUrl={image.thumbnailUrl}
              prompt={image.prompt}
              width={image.width || 800}
              height={image.height || 800}
            />
          ))}
        </Masonry>

        {/* Fade overlay */}
        {showMore && (
          <div className="pointer-events-none absolute bottom-[60px] left-0 z-[5] h-[200px] w-full bg-black [mask-image:linear-gradient(to_top,white,transparent)]" />
        )}
      </div>

      {/* Button Layer */}
      {showMore && (
        <div className="z-10 -mt-[100px] mb-6 flex w-full justify-center">
          <Button variant={"primary"} onClick={onShowMoreClick}>
            Show More
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
