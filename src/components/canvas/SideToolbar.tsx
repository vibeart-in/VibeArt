// "use client";

// import React from "react";
// import { Plus, Image, Video, LayoutGrid } from "lucide-react";
// import { FloatingDock } from "@/src/components/ui/floating-dock";

// export default function SideToolbar() {
//   const items = [
//     {
//       title: "Add New",
//       icon: <Plus className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
//       href: "#",
//     },
//     {
//       title: "Add Image",
//       icon: <Image className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
//       href: "#",
//     },
//     {
//       title: "Add Video",
//       icon: <Video className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
//       href: "#",
//     },
//     {
//       title: "Templates",
//       icon: <LayoutGrid className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
//       href: "#",
//     },
//   ];

//   return (
//     <div className="pointer-events-auto absolute left-4 top-1/2 z-50 -translate-y-1/2">
//       <FloatingDock
//         items={items}
//         desktopClassName="bg-neutral-900/50 border border-white/5 backdrop-blur-md shadow-xl rounded-full"
//       />
//     </div>
//   );
// }
