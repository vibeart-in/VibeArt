import { ConversationType } from "@/src/types/BaseType";
import { motion, AnimatePresence, Variants } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";

interface HistoryCardProps {
  id: string;
  title: string;
  prompt: string;
  imageUrl: string;
  isActive?: boolean;
  conversationType: ConversationType;
}

const parentVariants: Variants = {
  rest: { scale: 1, opacity: 1 },
  hover: { scale: 1.02, opacity: 1, transition: { type: "spring", stiffness: 500, damping: 26 } },
  press: { scale: 0.98, transition: { type: "spring", stiffness: 600, damping: 30 } },
};

const overlayVariants: Variants = {
  rest: { opacity: 0.1, boxShadow: "inset 0 6px 24px rgba(0,0,0,0.5)" },
  hover: { opacity: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

const HistoryCard: React.FC<HistoryCardProps> = ({
  id,
  title,
  prompt,
  imageUrl,
  isActive = false,
  conversationType,
}) => {
  const [hovered, setHovered] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (hovered) {
      router.prefetch(`/image/${conversationType}/${id}`);
    }
  }, [hovered, router, conversationType, id]);

  return (
    <motion.div
      className="relative group w-[66px] h-[66px]"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial="rest"
      animate={hovered ? "hover" : "rest"}
      whileTap="press"
      variants={parentVariants}
      layout
    >
      <Link href={`/image/${conversationType}/${id}`} aria-label={title}>
        <div
          className={`relative w-[55px] h-[55px] rounded-2xl overflow-hidden
            border-2 transition-colors duration-200
            bg-[radial-gradient(120%_120%_at_30%_30%,_#1b1b1b,_#0e0e0e)]
            ring-1 ring-white/10
            ${isActive ? "border-accent" : "border-transparent"}
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20
          `}
          tabIndex={0}
        >
          <Image
            src={imageUrl}
            alt={prompt}
            width={55}
            height={55}
            sizes="55px"
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out
              ${hovered ? "scale-[1.06]" : "scale-100"}
            `}
            priority={false}
          />
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            variants={overlayVariants}
          />
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_top,rgba(0,0,0,0.4),rgba(0,0,0,0))]" />
        </div>
      </Link>

      <AnimatePresence>
        {hovered && (
          <motion.div
            key="flyout"
            initial={{ opacity: 0, x: 6, scale: 0.98 }}
            animate={{ opacity: 1, x: 10, scale: 1 }}
            exit={{ opacity: 0, x: 4, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="
              absolute left-[76px] top-0 h-[66px] min-w-[220px] max-w-[320px]
              rounded-2xl bg-neutral-900/95 text-white shadow-lg ring-1 ring-white/10
              flex items-center px-4
            "
            role="status"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{title}</div>
              <div className="mt-0.5 text-xs text-white/70 line-clamp-2">{prompt}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HistoryCard;
