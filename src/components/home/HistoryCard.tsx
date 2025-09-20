import { motion, AnimatePresence, Variants } from "motion/react";
import React from "react";

interface HistoryCardProps {
  title: string;
  prompt: string;
  imageUrl: string;
  isActive?: boolean;
}

const HistoryCard: React.FC<HistoryCardProps> = ({
  title,
  prompt,
  imageUrl,
  isActive = false,
}) => {
  const [hovered, setHovered] = React.useState(false);

  const parentVariants: Variants = {
    rest: { scale: 1 },
    hover: { scale: 1 }, // keep scale stable; child elements animate
  };

  const overlayVariants: Variants = {
    rest: {
      boxShadow: "inset 0px 4px 18px rgba(0,0,0,0.5)",
      opacity: 1,
    },
    hover: {
      boxShadow: "inset 0px 0px 0px rgba(0,0,0,0)",
      opacity: 0,
      transition: { duration: 0.25, ease: "easeOut" },
    },
  };

  const imgVariants: Variants = {
    rest: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.3, ease: "easeOut" } },
  };

  return (
    <motion.div
      className="relative group w-[66px] h-[66px]"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial="rest"
      animate={hovered ? "hover" : "rest"}
      variants={parentVariants}
    >
      {/* Thumbnail shell (kept separate so flyout won't be clipped) */}
      <div
        className={`relative w-[66px] h-[66px] rounded-2xl overflow-hidden transition-colors duration-200 
                    ${isActive ? "border-2 border-accent" : "border-2 border-transparent"}`}
      >
        <motion.img
          src={imageUrl}
          alt={prompt}
          className="absolute inset-0 w-full h-full object-cover"
          variants={imgVariants}
        />
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          variants={overlayVariants}
        />
      </div>

      {/* Flyout: appears only on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            key="flyout"
            initial={{ opacity: 0, x: 6, scale: 0.98 }}
            animate={{ opacity: 1, x: 10, scale: 1 }}
            exit={{ opacity: 0, x: 4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-[76px] top-0 h-[66px] min-w-[220px] max-w-[320px]
                   rounded-2xl bg-neutral-900/95 text-white shadow-lg ring-1 ring-white/10
                   flex items-center px-4"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{title}</div>
              <div className="mt-0.5 text-xs text-white/70 line-clamp-2">
                {prompt}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HistoryCard;