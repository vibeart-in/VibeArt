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
    <div className="skeleton-shimmer mb-2 h-[55px] w-[55px] rounded-2xl" />
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

  const { data: historyData, isPending, isError, error } = useConversationHistory(conversationType);

  const groupedHistory = useMemo(() => {
    return groupHistoryByDate(historyData || []);
  }, [historyData]);
  const dateGroups = Object.keys(groupedHistory);

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="fixed left-4 top-1/2 z-20 -translate-y-1/2" aria-label="History rail">
        <div className="w-[75px] rounded-2xl bg-gradient-to-b from-[#0d0d0d] via-[#111111] to-[#151515] p-2 shadow-[0_2px_8px_rgba(0,0,0,0.4)] ring-1 ring-white/5">
          <motion.div
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
          >
            <Link
              href={
                conversationType === "ai-apps" ? "/image/ai-apps" : `/image/${conversationType}`
              }
              className={`flex h-[55px] w-full items-center justify-center rounded-2xl bg-[linear-gradient(145deg,_#1a1a1a,_#101010)] ring-1 ring-white/10 hover:bg-[linear-gradient(145deg,_#1c1c1c,_#0f0f0f)] active:bg-[linear-gradient(145deg,_#0f0f0f,_#1c1c1c)] ${activeId === undefined ? "text-accent" : "text-white/90"}`}
              aria-label="New"
            >
              <IconPlus stroke={3} className="h-7 w-7" />
            </Link>
          </motion.div>

          <div className="mx-4 mt-3 h-1.5 rounded-full bg-white/10" />

          <div
            className="hide-scrollbar mask-gradient-vertical relative max-h-[300px] overflow-y-auto overflow-x-visible pr-[320px] pt-3"
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
                  className="px-1 py-2 text-xs text-red-400"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2 }}
                  role="status"
                >
                  {error?.message ?? "Something went wrong."}
                </motion.div>
              )}

              {!isPending && !isError && historyData && historyData.length === 0 && (
                <motion.div
                  key="empty"
                  className="px-1 py-2 text-xs text-white/60"
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
                      <p className="w-full text-nowrap pb-1 text-[10px] font-bold tracking-wide text-white/50">
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
