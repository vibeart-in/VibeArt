// import { Handle, Position, NodeProps, Node } from "@xyflow/react";
// import NodeLayout from "../NodeLayout";
// import React from "react";
// import { PlusCircleIcon } from "lucide-react"; 

// export type StyleNodeType = Node<{ label?: string }, "style">;

// export default function StyleNode({ data, selected }: NodeProps<StyleNodeType>) {
//   return (
//     <NodeLayout
//       selected={selected}
//       title="Style"
//       className="w-[240px] cursor-default rounded-[28px]"
//       handles={[
//         { type: "target", position: Position.Left },
//         { type: "source", position: Position.Right },
//       ]}
//     >
//       <div className="h-[320px] w-full p-1">
//         <div className="h-full w-full rounded-[24px] group relative z-20 flex-shrink-0 cursor-pointer overflow-hidden transition-transform hover:scale-105 active:scale-100">
//            <div className="flex size-full flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-700 text-white transition-all duration-300 group-hover:brightness-95">
//               <PlusCircleIcon size={28} fill="currentColor" />
//               <p className="mt-1 text-xs font-medium text-white/80">Styles</p>
//            </div>
//         </div>
//       </div>
//     </NodeLayout>
//   );
// }
