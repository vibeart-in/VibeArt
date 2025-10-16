interface ImageCardProps {
  mediaUrl: string;
  thumbnailUrl: string | null;
  width: number;
  height: number;
}

const ImageCard = ({ mediaUrl, thumbnailUrl, width, height }: ImageCardProps) => {
  return (
    <div className="mb-4">
      <img
        src={thumbnailUrl || mediaUrl}
        alt={"Gallery Image"}
        width={width}
        height={height}
        className="rounded-lg"
      />
    </div>
  );
};

export default ImageCard;
