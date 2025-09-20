"use client";
import { createClient } from "@/src/lib/supabase/client";
import { HistoryItem } from "@/src/types/BaseType";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence, Variants } from "motion/react";
import HistoryCard from "./HistoryCard";
import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";
import { usePathname, useParams } from "next/navigation";

const supabase = createClient();
const CONVERSATION_HISTORY_QUERY_KEY = ["conversationHistory"];

const fetchConversationHistory = async (): Promise<HistoryItem[]> => {
  const { data, error } = await supabase.rpc("get_conversations_with_details");
  if (error) throw new Error("Could not fetch conversation history");
  if (!Array.isArray(data))
    throw new Error("Unexpected response format from RPC");
  return data as unknown as HistoryItem[];
};

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
	console.log(params)
  const activeId = params.id as string | undefined; // Get the active ID from the URL

  const {
    data: historyData,
    isPending,
    isLoading, // support older versions
    isError,
    error,
  } = useQuery<HistoryItem[], Error>({
    queryKey: CONVERSATION_HISTORY_QUERY_KEY,
    queryFn: fetchConversationHistory,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const loading = typeof isPending !== "undefined" ? isPending : !!isLoading;

  return (
    <div className="bg-black border-2 p-2 rounded-2xl">
      <Link
        href={"/image/generate"}
        className={`bg-[#292929] w-[66px] h-[66px] flex justify-center items-center rounded-2xl cursor-pointer ${
						activeId === undefined ? "text-accent" : ""
				}`}
      >
        <IconPlus stroke={3} className="w-7 h-7" />
      </Link>

      <div className="bg-[#292929] h-1.5 rounded-full mx-4 mt-3" />

      <div className="h-[300px] overflow-y-auto overflow-x-visible hide-scrollbar relative pt-3 -mr-[340px]">
        <AnimatePresence initial={false}>
          {loading && (
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

          {!loading && isError && (
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

          {!loading && !isError && historyData && historyData.length === 0 && (
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

          {!loading && !isError && historyData && historyData.length > 0 && (
            <motion.div
              key="list"
              className="flex flex-col gap-2"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
            >
              {historyData.map((history) => (
                <motion.div
                  key={history.id}
                  layout
                  className="relative overflow-visible"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  <Link href={`/image/generate/${history.id}`} className="block">
                    <HistoryCard
                      imageUrl={history.imageUrl}
                      title={"Image generation"}
                      prompt={history.prompt}
                      isActive={activeId === history.id}
                    />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GenerateHistory;