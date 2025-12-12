// import { Handle, Position, NodeProps, Node } from "@xyflow/react";
// import NodeLayout from "../NodeLayout";
// import React, { useState } from "react";
// import PresetModal from "../../inputBox/PresetModal"; 
// import { PresetData } from "@/src/types/BaseType";

// export type PresetsNodeType = Node<{ selectedPreset?: PresetData; label?: string }, "presets">;

// export default function PresetsNode({ data, selected }: NodeProps<PresetsNodeType>) {
//   const [selectedPreset, setSelectedPreset] = useState<PresetData | undefined>(data.selectedPreset);

//   const handleSelect = (preset: PresetData) => {
//     setSelectedPreset(preset);
//     data.selectedPreset = preset; // Update node data
//   };

//   return (
//     <NodeLayout
//       selected={selected}
//       title="Presets"
//       subtitle="Gallery"
//       className="w-[240px] cursor-default rounded-[28px]"
//       handles={[
//         { type: "target", position: Position.Left },
//         { type: "source", position: Position.Right },
//       ]}
//     >
//       <div className="h-[320px] w-full p-1">
//          <PresetModal
//             onSelect={handleSelect}
//             selectedPreset={selectedPreset}
//             triggerClassName="!h-full !w-full !rounded-[24px]"
//          />
//       </div>
//     </NodeLayout>
//   );
// }
