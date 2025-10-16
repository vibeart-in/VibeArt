import Masonry from "react-masonry-css";

import ImageCard from "../ui/imageCard/ImageCard";

interface Image {
  id: string;
  media_url: string;
  thumbnail_url: string | null;
  prompt?: string;
  width: number | null;
  height: number | null;
}

interface ImageGalleryProps {
  images: Image[];
  columnCount?: number;
}

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
          thumbnailUrl={image.thumbnail_url || null}
          prompt={image.prompt || ""}
          width={image.width || 800}
          height={image.height || 800}
        />
      ))}
    </Masonry>
  );
};

export default ImageGallery;
