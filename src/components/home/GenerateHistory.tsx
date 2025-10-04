"use client";
import { ConversationType, HistoryItem } from "@/src/types/BaseType";
import { motion, AnimatePresence, Variants } from "motion/react";
import HistoryCard from "./HistoryCard";
import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";
import { useParams, usePathname } from "next/navigation";
import { useMemo } from "react";
import { useConversationHistory } from "@/src/hooks/useConversationHistory";
import { groupHistoryByDate } from "@/src/lib/dateUtils";
import { useNavInfo } from "@/src/hooks/useNavInfo";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 420, damping: 30, mass: 0.7 },
  },
  exit: {
    opacity: 0,
    y: 6,
    transition: { duration: 0.16, ease: "easeIn" },
  },
};

const SkeletonRow = () => (
  <motion.div layout variants={itemVariants}>
    <div className="skeleton-shimmer w-[55px] h-[55px] rounded-2xl mb-2" />
  </motion.div>
);

const GenerateHistory = () => {
  const params = useParams();
  const pathname = usePathname();
  const activeId = params.id as string | undefined;
  const conversationType = pathname.split("/")[2] as ConversationType;
  console.log(conversationType);
  // Check if user is authenticated
  const { data: navData } = useNavInfo();
  const user = navData?.user;

  const {
    data: historyData,
    isPending,
    isError,
    error,
  } = useConversationHistory(conversationType);

  const groupedHistory = useMemo(() => {
    return groupHistoryByDate(historyData || []);
  }, [historyData]);
  const dateGroups = Object.keys(groupedHistory);


  if (!user) {
    return null;
  }

  return (
    <>
      <div
        className="fixed top-1/2 left-4 -translate-y-1/2 z-20"
        aria-label="History rail"
      >
        <div
          className="
            w-[75px] rounded-2xl p-2
            bg-gradient-to-b from-[#0d0d0d] via-[#111111] to-[#151515]
            ring-1 ring-white/5 shadow-[0_2px_8px_rgba(0,0,0,0.4)]
          "
        >
          <motion.div
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
          >
            <Link
              href={
                conversationType === "ai-apps"
                  ? "/image/ai-apps"
                  : `/image/${conversationType}`
              }
              className={`w-full h-[55px] flex justify-center items-center rounded-2xl
                bg-[linear-gradient(145deg,_#1a1a1a,_#101010)]
                hover:bg-[linear-gradient(145deg,_#1c1c1c,_#0f0f0f)]
                active:bg-[linear-gradient(145deg,_#0f0f0f,_#1c1c1c)]
                ring-1 ring-white/10
                ${activeId === undefined ? "text-accent" : "text-white/90"}`}
              aria-label="New"
            >
              <IconPlus stroke={3} className="w-7 h-7" />
            </Link>
          </motion.div>

          <div className="bg-white/10 h-1.5 rounded-full mx-4 mt-3" />

          <div
            className="
              max-h-[300px] overflow-y-auto overflow-x-visible relative pt-3 pr-[320px] hide-scrollbar
              mask-gradient-vertical
            "
            aria-live="polite"
            aria-busy={isPending ? "true" : "false"}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {isPending && (
                <motion.div
                  key="skeleton"
                  className="flex flex-col gap-2"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                >
                  {Array.from({ length: 4 }).map((_, i) => (
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
                  role="status"
                >
                  {error?.message ?? "Something went wrong."}
                </motion.div>
              )}

              {!isPending &&
                !isError &&
                historyData &&
                historyData.length === 0 && (
                  <motion.div
                    key="empty"
                    className="text-xs text-white/60 px-1 py-2"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.2 }}
                  >
                    No history found.
                  </motion.div>
                )}

              {!isPending && !isError && dateGroups.length > 0 && (
                <motion.div
                  key="list"
                  className="flex flex-col"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  layout
                >
                  {dateGroups.map((group) => (
                    <div key={group} className="">
                      <p className="text-[10px] text-nowrap font-bold w-full text-white/50 pb-1 tracking-wide">
                        {group}
                      </p>
                      <div className="flex flex-col gap-2" data-section={group}>
                        {groupedHistory[group].map((history: HistoryItem) => (
                          <HistoryCard
                            key={history.id}
                            id={history.id}
                            imageUrl={history.imageUrl}
                            title="Image generation"
                            prompt={history.prompt}
                            isActive={activeId === history.id}
                            conversationType={conversationType}
                            appId={history.appId}
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
      </div>
    </>
  );
};

export default GenerateHistory;
