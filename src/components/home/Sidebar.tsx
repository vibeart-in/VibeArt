// "use client";
// import {
//   IconArrowUp,
//   IconChevronUp,
//   IconClock,
//   IconColorSwatch,
//   IconLayoutSidebar,
//   IconSettings2,
//   IconSparkles,
// } from "@tabler/icons-react";
// import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
// import { useState, type ReactNode, useEffect } from "react";
// import Image from "next/image";
// import { Edit3, ImageIcon } from "lucide-react";
// import HistoryCard from "./HistoryCard";
// import clsx from "clsx";
// import { motion, AnimatePresence } from "motion/react";
// import Link from "next/link";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { createClient } from "@/src/lib/supabase/client";
// import { HistoryItem } from "@/src/types/BaseType";
// import { usePathname } from "next/navigation";
// import { UserProfileDropdown } from "../ui/UserProfileDropdown";

// const supabase = createClient();
// const CONVERSATION_HISTORY_QUERY_KEY = ["conversationHistory"];

// const fetchConversationHistory = async (): Promise<HistoryItem[]> => {
//   const { data, error } = await supabase.rpc("get_conversations_with_details");

//   if (error) {
//     console.error("Error fetching conversation history:", error);
//     throw new Error("Could not fetch conversation history");
//   }

//   if (!Array.isArray(data)) {
//     throw new Error("Unexpected response format from RPC");
//   }

//   return data as unknown as HistoryItem[];
// };

// const links = [
//   {
//     label: "library",
//     href: "/library",
//     icon: <IconColorSwatch className="h-5 w-5 shrink-0" />,
//   },
// ];

// const menuItems = [
//   {
//     icon: <IconSparkles size={15} />,
//     label: "Generate",
//   },
//   {
//     icon: <Edit3 size={15} />,
//     label: "Edit",
//   },
//   {
//     icon: <IconArrowUp size={15} />,
//     label: "Upscale",
//   },
//   {
//     icon: <IconSettings2 size={15} />,
//     label: "Prepare",
//   },
// ];

// const CollapsibleSection = ({
//   title,
//   icon,
//   children,
//   defaultOpen = false,
//   className = "",
// }: {
//   title: string;
//   icon: ReactNode;
//   children: ReactNode;
//   defaultOpen?: boolean;
//   className?: string;
// }) => {
//   const [isOpen, setIsOpen] = useState(defaultOpen);

//   return (
//     <div className={clsx("w-full text-neutral-200 flex flex-col", className)}>
//       <button
//         type="button"
//         className="flex w-full flex-shrink-0 items-center justify-between py-2 text-left"
//         onClick={() => setIsOpen(!isOpen)}
//         aria-expanded={isOpen}
//       >
//         <div className="flex items-center gap-2">
//           {icon}
//           <span className="text-sm tracking-wide">{title}</span>
//         </div>
//         <motion.div
//           animate={{ rotate: isOpen ? 180 : 0 }}
//           transition={{ duration: 0.3, ease: "easeInOut" }}
//         >
//           <IconChevronUp
//             className={clsx("h-5 w-5 transition-transform", {
//               "rotate-0": isOpen,
//             })}
//           />
//         </motion.div>
//       </button>

//       <AnimatePresence initial={false}>
//         {isOpen && (
//           <motion.div
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: "auto", opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             transition={{
//               height: { duration: 0.3, ease: "easeInOut" },
//               opacity: { duration: 0.2, ease: "easeInOut" },
//             }}
//             className="min-h-0 flex-1 tracking-wide"
//           >
//             {children}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default function SidebarMain() {
//   const [open, setOpen] = useState(true);
//   const [hovered, setHovered] = useState(false);
//   const queryClient = useQueryClient();
//   const pathname = usePathname();

//   const {
//     data: historyData,
//     isLoading,
//     isError,
//     error,
//   } = useQuery<HistoryItem[], Error>({
//     queryKey: CONVERSATION_HISTORY_QUERY_KEY,
//     queryFn: fetchConversationHistory,
//   });

//   useEffect(() => {
//     const channel = supabase
//       .channel("public:conversations")
//       .on(
//         "postgres_changes",
//         { event: "INSERT", schema: "public", table: "conversations" },
//         (payload) => {
//           console.log("New conversation inserted (realtime):", payload.new);
//           queryClient.invalidateQueries({
//             queryKey: CONVERSATION_HISTORY_QUERY_KEY,
//           });
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [queryClient]);

//   return (
//     <div className="flex h-screen text-sidebar-foreground">
//       <Sidebar open={open}>
//         <SidebarBody className="relative flex h-full flex-col">
//           <div className="flex h-full flex-1 flex-col overflow-hidden">
//             {/* Header */}
//             <div className="flex flex-shrink-0 items-center justify-between gap-4">
//               <div className="flex items-center gap-2">
//                 <div
//                   className=""
//                   onMouseEnter={() => setHovered(true)}
//                   onMouseLeave={() => setHovered(false)}
//                 >
//                   <div className="relative h-[30px] w-[30px]">
//                     <Image
//                       src="/images/newlogo.png"
//                       alt="Aura.ai Logo"
//                       fill
//                       className={clsx(
//                         "transition-opacity absolute",
//                         !open && hovered ? "opacity-0" : "opacity-100"
//                       )}
//                     />
//                     {!open && (
//                       <button
//                         onClick={() => setOpen(true)}
//                         aria-label="Open sidebar"
//                       >
//                         <IconLayoutSidebar
//                           className={clsx(
//                             "absolute top-0 left-0 h-[25px] w-[25px] cursor-pointer text-neutral-200 transition-opacity hover:text-accent",
//                             hovered ? "opacity-100" : "opacity-0"
//                           )}
//                         />
//                       </button>
//                     )}
//                   </div>
//                 </div>
//                 {open && (
//                   <Link href={"/"} className="text-2xl font-bold cursor-pointer">
//                     Aura<span className="text-accent">.</span>ai
//                   </Link>
//                 )}
//               </div>
//               {open && (
//                 <button
//                   onClick={() => setOpen(false)}
//                   className="cursor-pointer rounded-lg p-1 text-neutral-200 transition-colors hover:text-accent"
//                   aria-label="Collapse sidebar"
//                 >
//                   <IconLayoutSidebar size={20} />
//                 </button>
//               )}
//             </div>

//             {/* Links and Sections */}
//             <div className="mt-4 flex flex-shrink-0 flex-col gap-2">
//               {links.map((link, idx) => {
//                 const href = `/${link.label.toLowerCase()}`;
//                 const isActive = pathname.startsWith(href);
//                 return (
//                   <SidebarLink
//                     key={idx}
//                     link={link}
//                     className={isActive ? "text-accent" : ""}
//                   />
//                 );
//               })}

//               <CollapsibleSection
//                 title="Image"
//                 icon={<ImageIcon className="p-1" />}
//                 defaultOpen={true}
//               >
//                 <motion.div
//                   className="ml-2 border-l-2 border-gray-700"
//                   initial={{ opacity: 0, x: -10 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ duration: 0.3, delay: 0.1 }}
//                 >
//                   {menuItems.map((item, index) => {
//                     const href = `/image/${item.label.toLowerCase()}`;
//                     const isActive = pathname.startsWith(href);

//                     return (
//                       <Link key={index} href={href}>
//                         <motion.div
//                           className={clsx(
//                             "flex cursor-pointer items-center gap-2 pb-3 pl-3",
//                             { "text-accent": isActive }
//                           )}
//                           initial={{ opacity: 0, x: -10 }}
//                           animate={{ opacity: 1, x: 0 }}
//                           transition={{
//                             duration: 0.3,
//                             delay: 0.1 + index * 0.05,
//                           }}
//                           whileHover={{ x: 5, transition: { duration: 0.2 } }}
//                         >
//                           <div
//                             className={clsx("custom-box", {
//                               "text-accent": isActive,
//                             })}
//                           >
//                             {item.icon}
//                           </div>
//                           <span className="text-sm">{item.label}</span>
//                         </motion.div>
//                       </Link>
//                     );
//                   })}
//                 </motion.div>
//               </CollapsibleSection>
//             </div>

//             {/* Scrollable History Section */}
//             <CollapsibleSection
//               title="Generation History"
//               icon={<IconClock className="p-0.5" />}
//               className="min-h-0 flex-1"
//               defaultOpen={true}
//             >
//               <div className="h-full overflow-y-auto pr-2 pb-20 hide-scrollbar">
//                 {isLoading && (
//                   <p className="py-2 pl-3 text-sm text-neutral-400">
//                     Loading history...
//                   </p>
//                 )}
//                 {isError && (
//                   <p className="py-2 pl-3 text-sm text-red-400">
//                     Error: {error?.message}
//                   </p>
//                 )}
//                 {!isLoading && !isError && historyData?.length === 0 && (
//                   <p className="py-2 pl-3 text-sm text-neutral-400">
//                     No history found.
//                   </p>
//                 )}
//                 {!isLoading &&
//                   !isError &&
//                   historyData &&
//                   historyData.length > 0 && (
//                     <motion.div
//                       className="flex flex-col gap-2 py-2"
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       transition={{ duration: 0.3, delay: 0.1 }}
//                     >
//                       {historyData.map((history, index) => (
//                         <motion.div
//                           key={history.id}
//                           initial={{ opacity: 0, y: 20 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{
//                             duration: 0.3,
//                             delay: 0.1 + index * 0.05,
//                             ease: "easeOut",
//                           }}
//                           whileHover={{
//                             scale: 1.02,
//                             transition: { duration: 0.2 },
//                           }}
//                           className={
//                             pathname === `/image/generate/${history.id}`
//                               ? "border-2 border-accent rounded-2xl p-1"
//                               : ""
//                           }
//                         >
//                           <Link href={`/image/generate/${history.id}`}>
//                             <HistoryCard
//                               imageUrl={history.imageUrl}
//                               title={"Image generation"}
//                               prompt={history.prompt}
//                             />
//                           </Link>
//                         </motion.div>
//                       ))}
//                     </motion.div>
//                   )}
//               </div>
//             </CollapsibleSection>
//           </div>
//           <div className="absolute bottom-0 left-0 right-0 p-4 pt-1 backdrop-blur-sm bg-gradient-to-t from-black to-transparent">
//             <UserProfileDropdown />
//           </div>
//         </SidebarBody>
//       </Sidebar>
//     </div>
//   );
// }
