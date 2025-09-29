"use client";
import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "motion/react";
import {
  IconArrowLeft,
  IconDownload,
  IconHeart,
  IconShare,
  IconThumbDown,
  IconTrash,
  IconWand,
} from "@tabler/icons-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";
import { ArrowRight } from "lucide-react";

export interface ImageCardProps {
  imageUrl: string;
  prompt: string;
  width: number;
  height: number;
}

const ImageCard = ({ imageUrl, prompt, width, height }: ImageCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const [isZoomed, setIsZoomed] = useState(false);
  const [backgroundPosition, setBackgroundPosition] = useState("50% 50%");

  const handleClick = () => {
    setIsZoomed(!isZoomed);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!isZoomed) return;

    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setBackgroundPosition(`${x}% ${y}%`);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsZoomed(false);
    setIsModalOpen(false);
  };

  const cardOverlayVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: { opacity: 0, y: 30, transition: { duration: 0.3, ease: "easeIn" } },
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleModalImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleModalBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <>
      <motion.div
        className="relative w-full rounded-[24px] overflow-hidden cursor-pointer"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
        onClick={openModal}
        layoutId={`card-container-${imageUrl}`}
      >
        <div
          className={`relative w-full ${
            isImageLoading ? "h-[300px] w-[300px]" : "h-auto"
          }`}
        >
          <AnimatePresence>
            {isImageLoading && (
              <motion.div
                className="absolute flex items-center justify-center bg-black/20 backdrop-blur-md z-10 rounded-[24px] w-64 h-64"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div className="relative">
                  <motion.div
                    className="w-10 h-10 rounded-full border-4 border-white/20"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.2, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <Image
            src={imageUrl}
            alt={prompt}
            width={width}
            height={height}
            className="w-full h-auto"
            blurDataURL="..."
            placeholder="blur"
            onLoad={handleImageLoad}
            onError={() => setIsImageLoading(false)}
          />
          <div className="absolute inset-0 rounded-[24px] border-2 border-white/30 pointer-events-none z-10"></div>
        </div>

        <AnimatePresence>
          {isHovered && !isImageLoading && (
            <motion.div
              className="absolute bottom-0 left-0 w-full h-[80px] p-5 flex items-end
                        bg-gradient-to-t from-black/75 to-transparent backdrop-blur-[2px]"
              variants={cardOverlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="w-full flex justify-between items-center">
                <button
                  className="flex items-center gap-2 py-2 px-4 bg-white/30 rounded-full text-white font-semibold text-base backdrop-blur-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconWand />
                  <span>Edit</span>
                </button>
                <div className="flex items-center gap-4 text-white/80 text-xl">
                  <IconDownload className="hover:text-white cursor-pointer transition-colors" />
                  <IconHeart className="hover:text-white cursor-pointer transition-colors" />
                  <IconThumbDown className="hover:text-white cursor-pointer transition-colors" />
                  <IconTrash className="hover:text-white cursor-pointer transition-colors" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* --- Detailed Image Modal (from new design) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed h-screen w-screen inset-0 z-50 flex flex-col p-4 md:p-8"
            style={{
              background: "rgba(9, 9, 9, 0.7)",
              backdropFilter: "blur(10px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleModalBackdropClick}
          >
            <div
              className="relative w-full h-full flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Bar */}
              <motion.header
                className="flex justify-between items-center text-white w-full"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
              >
                <button
                  onClick={closeModal}
                  className="flex items-center gap-2 p-2 rounded-2xl hover:bg-white/10 transition-colors"
                >
                  <IconArrowLeft size={25} className="custom-box" />
                  <span className="font-medium">Go Back</span>
                </button>
                <div className="flex items-center gap-6 md:gap-4 text-white/80">
                  <IconDownload
                    className="cursor-pointer hover:text-white transition-colors"
                    size={28}
                  />
                  <IconThumbDown
                    className="cursor-pointer hover:text-white transition-colors"
                    size={28}
                  />
                  <IconHeart
                    className="cursor-pointer hover:text-white transition-colors"
                    size={28}
                  />
                  <IconTrash
                    className="cursor-pointer hover:text-red-400 transition-colors"
                    size={28}
                  />
                </div>
              </motion.header>

              <div
                className="flex-1 flex items-center justify-center my-4 min-h-0"
                onClick={handleModalBackdropClick}
              >
                <motion.div
                  className="relative max-w-[90vw] max-h-[80vh] w-auto h-auto"
                  layoutId={`card-container-${imageUrl}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <AnimatePresence>
                    {isImageLoading && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-md z-10 rounded-[24px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div className="relative">
                          <motion.div
                            className="w-10 h-10 rounded-full border-4 border-white/20"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 0.2, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <figure
                    className={`loupe-container ${isZoomed ? "is-zoomed" : ""}`}
                    onClick={handleClick}
                    onMouseMove={handleMouseMove}
                    style={{
                      backgroundImage: `url(${imageUrl})`,
                      backgroundPosition: backgroundPosition,
                    }}
                  >
                    <Image
                      src={imageUrl}
                      alt={prompt}
                      width={width}
                      height={height}
                      className="loupe-image w-full h-full max-h-[80vh] object-contain"
                      onLoad={handleModalImageLoad}
                      onError={() => setIsImageLoading(false)}
                    />
                  </figure>
                  <div className="absolute inset-0 rounded-[24px] border-2 border-white/30 pointer-events-none z-10"></div>
                </motion.div>
              </div>

              <motion.footer
                className="flex justify-between items-end text-white w-full"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
              >
                <div className="max-w-prose flex items-center gap-4">
                  <span className="flex gap-2 items-center font-semibold text-white/80 text-nowrap">
                    Generate
                    <ArrowRight className="custom-box" size={25} />
                  </span>
                  <HoverCard>
                    <HoverCardTrigger className="cursor-pointer text-sm text-nowrap">
                      {prompt.length > 80
                        ? `${prompt.slice(0, 80)}...`
                        : prompt}
                    </HoverCardTrigger>
                    <HoverCardContent>{prompt}</HoverCardContent>
                  </HoverCard>
                </div>
                <div className="flex items-center gap-3 text-lg font-semibold">
                  <button className="flex items-center gap-2 py-2 px-5 border-2 border-white/20 text-accent bg-[#1E1E1E]/50 rounded-2xl transition-colors backdrop-blur-sm hover:text-white/80">
                    <IconWand size={25} />
                    <span>Edit</span>
                  </button>
                  <button className="flex items-center gap-2 py-2 px-5 border-2 border-white/20 bg-[#1E1E1E]/50 rounded-2xl transition-colors backdrop-blur-sm hover:text-accent">
                    <IconShare size={25} />
                    <span>Share</span>
                  </button>
                </div>
              </motion.footer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageCard;
