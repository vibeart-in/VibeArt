"use client";

import { User } from "@supabase/supabase-js";
import { IconPlus } from "@tabler/icons-react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";

import { useConversationHistory } from "@/src/hooks/useConversationHistory";
import { supabase } from "@/src/lib/supabase/client";
import { ConversationType, HistoryItem } from "@/src/types/BaseType";
import { groupHistoryByDate } from "@/src/utils/server/dateUtils";

import HistoryCard from "./HistoryCard";

// --- Animation Variants ---

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
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

// --- Optimized Sub-Components ---

/**
 * OPTIMIZATION 1: Memoize SkeletonRow to prevent re-renders during parent state changes.
 */
const SkeletonRow = memo(() => (
  <motion.div layout variants={itemVariants}>
    <div className="skeleton-shimmer mb-2 size-[55px] rounded-2xl" />
  </motion.div>
));
SkeletonRow.displayName = "SkeletonRow";

/**
 * OPTIMIZATION 2: Memoize the entire list rendering logic.
 * This heavy component will only re-render if its props (groupedHistory or activeId) change,
 * preventing re-renders when parent state like `isFetchingNextPage` changes.
 */
interface MemoizedHistoryListProps {
  groupedHistory: ReturnType<typeof groupHistoryByDate>;
  activeId?: string;
}

const MemoizedHistoryList = memo(({ groupedHistory, activeId }: MemoizedHistoryListProps) => {
  const dateGroups = Object.keys(groupedHistory);

  return (
    <motion.div
      key="list"
      className="pointer-events-auto flex flex-col"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      layout
    >
      {dateGroups.map((group) => (
        <motion.div key={group} layout>
          <motion.p
            layout="position"
            className="w-full text-nowrap pb-1 text-[10px] font-bold tracking-wide text-white/50"
          >
            {group}
          </motion.p>
          <div className="flex flex-col gap-1 pl-0.5" data-section={group}>
            {groupedHistory[group].map((history: HistoryItem) => (
              <HistoryCard
                key={history.id}
                id={history.id}
                imageUrl={history.imageUrl}
                title={history.conversation_type}
                prompt={history.title}
                isActive={activeId === history.id}
                conversationType={history.conversation_type}
                appId={history.appId}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
});
MemoizedHistoryList.displayName = "MemoizedHistoryList";

// --- Main Component ---

const GenerationHistory = () => {
  const params = useParams();
  const pathname = usePathname();
  const activeId = params.id as string | undefined;

  /**
   * OPTIMIZATION 3: Memoize derived path segment to prevent re-calculating on every render.
   */
  const conversationType = useMemo(() => {
    const pathSegment = pathname.split("/")[2];
    const validConversationTypes = Object.values(ConversationType);
    if (pathSegment && validConversationTypes.includes(pathSegment as ConversationType)) {
      return pathSegment as ConversationType;
    }
    return null;
  }, [pathname]);

  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoadingUser(true);
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setIsLoadingUser(false);
    };
    fetchUser();
  }, []);

  // This code in your GenerationHistory component is now valid:
  const { data, error, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useConversationHistory(conversationType);

  const { ref, inView } = useInView({
    threshold: 0.5, // Trigger when 50% of the element is visible
  });

  // Effect to fetch the next page when the trigger element is in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten the pages array from useInfiniteQuery into a single list
  const historyData = useMemo(() => (data?.pages.flat() as HistoryItem[]) || [], [data]);

  const groupedHistory = useMemo(() => {
    return groupHistoryByDate(historyData);
  }, [historyData]);

  // Use a useCallback for the Link's href for minor optimization.
  const newConversationHref = useCallback(() => {
    if (!conversationType) return "/"; // Fallback URL
    return conversationType === "ai-apps" ? "/generate/ai-apps" : `/generate/${conversationType}`;
  }, [conversationType]);

  // Early returns for clarity
  if (isLoadingUser || !conversationType) {
    return null;
  }
  if (!user) {
    return null; // Or a login prompt
  }

  return (
    <>
      <div className="fixed left-4 top-1/2 z-50 -translate-y-1/2" aria-label="History rail">
        <div className="w-[75px] rounded-2xl bg-gradient-to-b from-[#0d0d0d] via-[#111111] to-[#151515] p-2 pt-3">
          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}>
            <Link
              href={newConversationHref()}
              className={`flex h-[55px] w-full items-center justify-center rounded-2xl bg-[linear-gradient(145deg,_#1a1a1a,_#101010)] ring-1 ring-white/10 hover:bg-[linear-gradient(145deg,_#1c1c1c,_#0f0f0f)] active:bg-[linear-gradient(145deg,_#0f0f0f,_#1c1c1c)] ${
                activeId === undefined ? "text-accent" : "text-white/90"
              }`}
              aria-label="New"
            >
              <IconPlus stroke={3} className="size-7" />
            </Link>
          </motion.div>

          <div className="mx-4 mt-3 h-1.5 rounded-full bg-white/10" />

          <div
            className="hide-scrollbar mask-gradient-vertical pointer-events-none relative max-h-[40vh] overflow-y-auto overflow-x-visible pr-[320px] pt-3"
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
                  {Array.from({ length: 2 }).map((_, i) => (
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

              {!isPending && !isError && historyData.length === 0 && (
                <motion.div
                  key="empty"
                  className="px-1 py-2 text-center text-xs text-white/60"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2 }}
                >
                  No history found.
                </motion.div>
              )}

              {!isPending && !isError && (
                <MemoizedHistoryList groupedHistory={groupedHistory} activeId={activeId} />
              )}
            </AnimatePresence>

            {/* Infinite scroll trigger element */}
            <div ref={ref} className="h-10">
              {isFetchingNextPage && (
                <div className="flex flex-col gap-2">
                  <SkeletonRow />
                  <SkeletonRow />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GenerationHistory;
