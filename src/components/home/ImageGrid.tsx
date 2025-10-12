"use client";
import Masonry from "react-masonry-css";

import { ExampleImageType } from "@/src/types/BaseType";

import ImageCard from "../ui/imageCard/ImageCard";

type ImageGalleryProps = {
  images: ExampleImageType[] | null;
  columnCount?: number;
};

const ImageGallery = ({ images, columnCount = 4 }: ImageGalleryProps) => {
  if (!images || images.length === 0) return <p>No images to show.</p>;

  const breakpointColumnsObj = {
    default: columnCount,
    1500: 3,
    1100: 2,
    700: 1,
  };

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      {images.map((image) => (
        <ImageCard
          key={image.id}
          mediaUrl={image.media_url}
          prompt={image.prompt}
          width={image.width || 800}
          height={image.height || 800}
        />
      ))}
    </Masonry>
  );
};

export default ImageGallery;
