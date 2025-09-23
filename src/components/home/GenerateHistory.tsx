"use client";
import { HistoryItem } from "@/src/types/BaseType";
import { motion, AnimatePresence, Variants } from "motion/react";
import HistoryCard from "./HistoryCard";
import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useConversationHistory } from "@/src/hooks/useConversationHistory";
import { groupHistoryByDate } from "@/src/lib/dateUtils";

// Variants can stay the same as they are well-defined.
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, y: 8, transition: { duration: 0.2, ease: "easeIn" } },
};

const SkeletonRow = () => (
  <motion.div
    layout
    className="relative overflow-visible"
    variants={itemVariants}
  >
    <div className="group relative w-[66px] h-[66px] rounded-2xl mb-2 overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(90deg, rgba(60,60,60,0.6) 25%, rgba(90,90,90,0.6) 37%, rgba(60,60,60,0.6) 63%)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
      />
    </div>
  </motion.div>
);

const GenerateHistory = () => {
  const params = useParams();
  const activeId = params.id as string | undefined;

  // Use our new custom hook!
  const {
    data: historyData,
    isPending,
    isError,
    error,
  } = useConversationHistory();

  // Memoize the grouped data to prevent re-computation on every render.
  const groupedHistory = useMemo(() => {
    return groupHistoryByDate(historyData || []);
  }, [historyData]);
  const dateGroups = Object.keys(groupedHistory);

  return (
    <div className="w-[85px] bg-black border-2 p-2 rounded-2xl">
      <Link
        href={"/image/generate"}
        className={`bg-[#292929] w-[66px] h-[66px] flex justify-center items-center rounded-2xl cursor-pointer ${
          activeId === undefined ? "text-accent" : ""
        }`}
      >
        <IconPlus stroke={3} className="w-7 h-7" />
      </Link>

      <div className="bg-[#292929] h-1.5 rounded-full mx-4 mt-3" />

      {/* Simplified hide-scrollbar logic */}
      <div className="h-[300px] overflow-y-auto overflow-x-visible hide-scrollbar relative pt-3 pr-[320px]">
        <AnimatePresence initial={false} mode="wait">
          {isPending && (
            <motion.div
              key="skeleton"
              className="flex flex-col gap-2"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </motion.div>
          )}

          {isError && (
            <motion.div
              key="error"
              className="text-xs text-red-400 px-1 py-2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
            >
              {error?.message ?? "Something went wrong."}
            </motion.div>
          )}

          {!isPending && !isError && historyData && historyData.length === 0 && (
            <motion.div
              key="empty"
              className="text-xs text-white/60 px-1 py-2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
            >
              No history yet.
            </motion.div>
          )}

          {!isPending && !isError && dateGroups.length > 0 && (
            <motion.div
              key="list"
              className="flex flex-col" // Removed gap-2 from here
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {dateGroups.map((group) => (
                // Use React.Fragment for grouping without adding extra DOM nodes
                <div key={group}>
                  <motion.h4
                    variants={itemVariants} // Animate the header in as well
                    className="text-[10px] font-bold text-white/50 px-2 pt-2 pb-1 uppercase"
                  >
                    {group}
                  </motion.h4>
                  <div className="flex flex-col gap-2">
                     {groupedHistory[group].map((history: HistoryItem) => (
                        <HistoryCard
                          key={history.id} // Essential for React and animations
                          id={history.id}
                          imageUrl={history.imageUrl}
                          title={"Image generation"}
                          prompt={history.prompt}
                          isActive={activeId === history.id}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GenerateHistory;