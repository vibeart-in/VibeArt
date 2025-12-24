import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import NodeLayout from "../NodeLayout";
import React, { useState } from "react";
import ModelSelectModal from "../../inputBox/ModelSelectModal";
import PresetModal from "../../inputBox/PresetModal";
import MidjourneyStylesModal from "../../inputBox/MidjourneyStylesModal";
import { ConversationType, ModelData, PresetData, MidjourneyStyleData } from "@/src/types/BaseType";
import { PlusCircleIcon } from "lucide-react";

// Base types
export type BaseNodeData = {
  label?: string;
};

export type CheckpointNodeType = Node<BaseNodeData & { selectedModel?: ModelData }, "checkpoint">;
export type LoraNodeType = Node<BaseNodeData & { selectedModel?: ModelData }, "lora">;
export type PresetsNodeType = Node<BaseNodeData & { selectedPreset?: PresetData }, "presets">;
export type StyleNodeType = Node<BaseNodeData & { selectedStyle?: MidjourneyStyleData }, "style">;

export type AllNodeTypes = CheckpointNodeType | LoraNodeType | PresetsNodeType | StyleNodeType;

// Component configuration type
type NodeConfig = {
  title: string;
  defaultSubtitle: string;
  className: string;
  containerClassName: string;
  triggerClassName: string;
  description: string;
  defaultImage: string;
  conversationType?: ConversationType;
  hasModelSelect?: boolean;
  hasPresetSelect?: boolean;
  hasStyleSelect?: boolean;
};

// Configuration for each node type
const NODE_CONFIGS: Record<string, NodeConfig> = {
  checkpoint: {
    title: "Checkpoint",
    defaultSubtitle: "Select Model",
    className: "h-[260px] w-full rounded-[28px]",
    containerClassName: "h-full w-full p-3 bg-[#161616] rounded-[27px]",
    triggerClassName: "!h-full !w-full !rounded-[24px]",
    description:
      "A checkpoint is the core AI model used to create images. It determines the overall style, realism, and creativity of the results.",
    defaultImage: "https://i.pinimg.com/736x/84/27/67/842767f8e288bfd4a0cbf2977ee7661c.jpg",
    conversationType: ConversationType.CHECKPOINT,
    hasModelSelect: true,
  },
  lora: {
    title: "LoRA",
    defaultSubtitle: "Select LoRA",
    className: "w-[200px] cursor-default rounded-[24px]",
    containerClassName: "w-[240px] aspect-square cursor-default p-3 bg-[#161616] rounded-[23px]",
    triggerClassName: "!h-full !w-full !rounded-[20px]",
    description:
      "LoRA (Low-Rank Adaptation) models are small, fine-tuned models that can be added to a checkpoint to introduce specific styles, characters, or concepts.",
    defaultImage: "https://i.pinimg.com/736x/84/27/67/842767f8e288bfd4a0cbf2977ee7661c.jpg",
    conversationType: ConversationType.LORA,
    hasModelSelect: true,
  },
  presets: {
    title: "Presets",
    defaultSubtitle: "Select Preset",
    className: "w-[200px] cursor-default rounded-[24px]",
    containerClassName: "h-[260px] w-full p-3 bg-[#161616] rounded-[23px]",
    triggerClassName: "!h-full !w-full !rounded-[20px]",
    description: "",
    defaultImage: "",
    hasPresetSelect: true,
  },
  style: {
    title: "Style",
    defaultSubtitle: "Select Style",
    className: "w-[260px] cursor-default rounded-[20px]",
    containerClassName: "h-[140px] w-full p-3 bg-[#161616] rounded-[19px]",
    triggerClassName: "!h-full !w-full !rounded-[16px]",
    description: "",
    defaultImage: "",
    hasStyleSelect: true,
  },
};

// Model node component (Checkpoint and LoRA)
const ModelNode = React.memo(
  ({
    data,
    selected,
    config,
  }: NodeProps<CheckpointNodeType | LoraNodeType> & { config: NodeConfig }) => {
    const [selectedModel, setSelectedModel] = useState<ModelData | undefined>(data.selectedModel);

    const handleSelect = (model: ModelData) => {
      setSelectedModel(model);
      data.selectedModel = model;
    };

    return (
      <NodeLayout
        selected={selected}
        title={config.title}
        subtitle={selectedModel?.model_name || config.defaultSubtitle}
        className={config.className}
        handles={[
          { type: "target", position: Position.Left },
          { type: "source", position: Position.Right },
        ]}
      >
        <div className={config.containerClassName}>
          <ModelSelectModal
            title={config.title}
            description={config.description}
            coverImage={selectedModel?.cover_image || config.defaultImage}
            modelName={selectedModel?.model_name || config.defaultSubtitle}
            conversationType={config.conversationType!}
            onSelectModel={handleSelect}
            triggerClassName={config.triggerClassName}
            variant="node"
          />
        </div>
      </NodeLayout>
    );
  },
);

// Preset node component
const PresetNode = React.memo(
  ({ data, selected, config }: NodeProps<PresetsNodeType> & { config: NodeConfig }) => {
    const [selectedPreset, setSelectedPreset] = useState<PresetData | undefined>(
      data.selectedPreset,
    );

    const handleSelect = (preset: PresetData) => {
      setSelectedPreset(preset);
      data.selectedPreset = preset;
    };

    return (
      <NodeLayout
        selected={selected}
        title={config.title}
        subtitle={selectedPreset?.name || config.defaultSubtitle}
        className={config.className}
        handles={[
          { type: "target", position: Position.Left },
          { type: "source", position: Position.Right },
        ]}
      >
        <div className={config.containerClassName}>
          <PresetModal
            onSelect={handleSelect}
            selectedPreset={selectedPreset}
            triggerClassName={config.triggerClassName}
            variant="node"
          />
        </div>
      </NodeLayout>
    );
  },
);

// Style node component
const StyleNodeComponent = React.memo(
  ({ data, selected, config }: NodeProps<StyleNodeType> & { config: NodeConfig }) => {
    const [selectedStyle, setSelectedStyle] = useState<MidjourneyStyleData | undefined>(
      data.selectedStyle,
    );

    const handleSelect = (style: MidjourneyStyleData) => {
      setSelectedStyle(style);
      data.selectedStyle = style;
    };

    return (
      <NodeLayout
        selected={selected}
        title={config.title}
        subtitle={selectedStyle?.name || config.defaultSubtitle}
        className={config.className}
        handles={[
          { type: "target", position: Position.Left },
          { type: "source", position: Position.Right },
        ]}
      >
        <div className={config.containerClassName}>
          <MidjourneyStylesModal
            selectedStyle={selectedStyle}
            onSelect={handleSelect}
            triggerClassName={config.triggerClassName}
            variant="node"
            onSelectPrompt={() => {}} // Not used in node context but required by type
          />
        </div>
      </NodeLayout>
    );
  },
);

// Main component factory
const PromptComponent = React.memo((props: NodeProps<AllNodeTypes>) => {
  const { id, type, data, selected } = props;
  const config = NODE_CONFIGS[type];

  if (!config) {
    console.warn(`Unknown node type: ${type}`);
    return null;
  }

  // Checkpoint and LoRA nodes
  if (config.hasModelSelect) {
    return (
      <ModelNode {...(props as NodeProps<CheckpointNodeType | LoraNodeType>)} config={config} />
    );
  }

  // Presets node
  if (config.hasPresetSelect) {
    return <PresetNode {...(props as NodeProps<PresetsNodeType>)} config={config} />;
  }

  // Style node
  if (config.hasStyleSelect) {
    return <StyleNodeComponent {...(props as NodeProps<StyleNodeType>)} config={config} />;
  }

  return null;
});

export { PromptComponent };

// Individual exports for backward compatibility
export const CheckpointNode = (props: NodeProps<CheckpointNodeType>) => (
  <PromptComponent {...(props as NodeProps<AllNodeTypes>)} />
);

export const LoraNode = (props: NodeProps<LoraNodeType>) => (
  <PromptComponent {...(props as NodeProps<AllNodeTypes>)} />
);

export const PresetsNode = (props: NodeProps<PresetsNodeType>) => (
  <PromptComponent {...(props as NodeProps<AllNodeTypes>)} />
);

export const StyleNode = (props: NodeProps<StyleNodeType>) => (
  <PromptComponent {...(props as NodeProps<AllNodeTypes>)} />
);

// Default export
export default PromptComponent;
