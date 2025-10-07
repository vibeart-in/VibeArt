"use client";

import React, { useCallback, useMemo, useState } from "react";
import { MediaCardView } from "./ImageCardView";
import { MediaModal } from "./ImageModal";

// Define the options for video playback
export interface VideoOptions {
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  controls?: boolean;
}

export interface ImageCardProps {
  mediaUrl: string; // Renamed from imageUrl
  prompt: string;
  width: number; // Still useful as a fallback/placeholder
  height: number;
  sizes?: string;
  isVideo?: boolean; // Explicitly tell the component it's a video
  videoOptions?: {
    card?: VideoOptions; // Specific options for the card view
    modal?: VideoOptions; // Specific options for the modal view
  };
}

const DEFAULT_SIZES = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";

const ImageCard = ({
  mediaUrl,
  prompt,
  width,
  height,
  sizes = DEFAULT_SIZES,
  isVideo,
  videoOptions,
}: ImageCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use the explicit isVideo prop if provided, otherwise detect automatically.
  const isMediaVideo = isVideo ?? mediaUrl.endsWith(".mp4") ?? mediaUrl.endsWith(".webm");

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const altText = useMemo(() => (prompt?.trim() ? prompt : "Generated media"), [prompt]);

  const cardContainerId = `card-container-${encodeURIComponent(mediaUrl)}`;

  return (
    <>
      <MediaCardView
        mediaUrl={mediaUrl}
        altText={altText}
        width={width}
        height={height}
        sizes={sizes}
        onOpen={openModal}
        cardContainerId={cardContainerId}
        isMediaVideo={isMediaVideo}
        videoOptions={videoOptions?.card}
      />

      <MediaModal
        isOpen={isModalOpen}
        onClose={closeModal}
        mediaUrl={mediaUrl}
        prompt={prompt}
        width={width}
        height={height}
        altText={altText}
        cardContainerId={cardContainerId}
        isMediaVideo={isMediaVideo}
        videoOptions={videoOptions?.modal}
      />
    </>
  );
};

export default ImageCard;
