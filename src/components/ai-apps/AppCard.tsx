"use client";
import Image from "next/image";
import { motion } from "motion/react";
import Link from "next/link";

const AppCard = ({
  id,
  previewUrl,
  appName,
}: {
  id: string;
  previewUrl: string;
  appName: string;
}) => {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      className="relative z-20 rounded-[40px] cursor-pointer overflow-hidden flex-shrink-0"
      variants={{
        rest: { scale: 1 },
        hover: { scale: 0.99 },
      }}
      transition={{ type: "spring", stiffness: 250, damping: 22 }}
    >
      <Link href={`/image/ai-apps/${id}`}>
        {/* Image */}
        <motion.div
          className="w-full h-full"
          variants={{
            rest: { scale: 1 },
            hover: { scale: 0.98 },
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Image
            className="object-cover w-full h-full rounded-3xl"
            src={previewUrl}
            alt={appName}
            width={300}
            height={300}
          />
        </motion.div>

        {/* Hover overlay */}
        <motion.div
          className="absolute inset-0 rounded-3xl shadow-[inset_0_4px_38px_rgba(0,0,0,0.8)] bg-black/20"
          variants={{
            rest: { opacity: 0 },
            hover: { opacity: 1 },
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />

        {/* App name */}
        <motion.div
          className="absolute inset-0 flex justify-center items-center"
          variants={{
            rest: { opacity: 0, y: 20 },
            hover: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <p className="text-white text-3xl font-bold text-center drop-shadow-lg px-3 py-1 rounded-md tracking-wider">
            {appName}
          </p>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default AppCard;
