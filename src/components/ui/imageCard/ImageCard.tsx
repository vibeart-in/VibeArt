"use client";

import dynamic from "next/dynamic";
import React, { useCallback, useMemo, useState } from "react";

import { MediaCardView } from "./ImageCardView";
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
  autoRatio?: boolean;
  conversationId?: string;
  imageId?: string;
}

const ImageCard = ({
  mediaUrl,
  thumbnailUrl,
  prompt,
  width,
  height,
  isVideo,
  videoOptions,
  autoRatio = false,
  conversationId,
  imageId,
}: ImageCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const MediaModal = dynamic(() => import("./ImageModal"), { ssr: false, loading: () => <div /> });

  // Use the explicit isVideo prop if provided, otherwise detect automatically.
  const isMediaVideo = isVideo ?? /(?:\.mp4|\.webm|\.mov)(?:\?|$)/i.test(mediaUrl);

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
        prompt={prompt || "vibeart_image"}
        mediaUrl={mediaUrl}
        altText={altText}
        width={width}
        height={height}
        onOpen={openModal}
        cardContainerId={cardContainerId}
        isMediaVideo={isMediaVideo}
        videoOptions={videoOptions?.card}
        thumbnailUrl={thumbnailUrl}
        autoRatio={autoRatio}
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
          conversationId={conversationId}
          imageId={imageId}
        />
      )}
    </div>
  );
};

export default ImageCard;
