"use client";

import React, { useCallback, useMemo, useState } from "react";
import { MediaCardView } from "./ImageCardView";
import dynamic from "next/dynamic";
import { MediaModal } from "./ImageModal";

export interface VideoOptions {
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  controls?: boolean;
}

export interface ImageCardProps {
  mediaUrl: string;
  thumbnailUrl?: string | null;
  prompt: string;
  width: number;
  height: number;
  isVideo?: boolean;
  videoOptions?: {
    card?: VideoOptions;
    modal?: VideoOptions;
  };
}

const DEFAULT_SIZES = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";

const ImageCard = ({
  mediaUrl,
  thumbnailUrl,
  prompt,
  width,
  height,
  isVideo,
  videoOptions,
}: ImageCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const MediaModal = dynamic(() => import("./ImageModal"), { ssr: false, loading: () => <div /> });

  // Use the explicit isVideo prop if provided, otherwise detect automatically.
  const isMediaVideo = isVideo ?? /(?:\.mp4|\.webm)(?:\?|$)/i.test(mediaUrl);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const altText = useMemo(() => (prompt?.trim() ? prompt : "Generated media"), [prompt]);

  const cardContainerId = `card-container-${encodeURIComponent(mediaUrl)}`;

  return (
    <div>
      <MediaCardView
        mediaUrl={mediaUrl}
        altText={altText}
        width={width}
        height={height}
        onOpen={openModal}
        cardContainerId={cardContainerId}
        isMediaVideo={isMediaVideo}
        videoOptions={videoOptions?.card}
        thumbnailUrl={thumbnailUrl}
      />
      {isModalOpen && (
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
      )}
    </div>
  );
};

export default ImageCard;
