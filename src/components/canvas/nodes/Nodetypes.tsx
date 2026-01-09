import { NodeTypes } from "@xyflow/react";

// Import all node components
import InputImage from "./InputImage";
import OutputImage from "./OutputImage";
import OutputImageOpenSource from "./OutputImageOpenSource";
import TextNode from "./TextNode";
import SketchNode from "./SketchNode";
import ColorCorrectionNode from "./ColorCorrectionNode";
import CropNode from "./CropNode";
import DropNode from "./DropNode";
import { CheckpointNode, LoraNode, PresetsNode, StyleNode } from "./PromptComponent";
import AiAppNode from "./AiAppNode";
import GroupNode from "./GroupNode";
import UpscaleNode from "./UpscaleNode";
import RemoveBackgroundNode from "./RemoveBackgroundNode";

// Register all node types for React Flow
export const nodeTypes: NodeTypes = {
  inputImage: InputImage,
  outputImage: OutputImage,
  outputImageAdvanced: OutputImageOpenSource,
  prompt: TextNode,
  text: TextNode,
  sketch: SketchNode,
  colorCorrection: ColorCorrectionNode,
  crop: CropNode,
  drop: DropNode,
  checkpoint: CheckpointNode,
  lora: LoraNode,
  presets: PresetsNode,
  style: StyleNode,
  aiApp: AiAppNode,
  group: GroupNode,
  upscale: UpscaleNode,
  removeBackground: RemoveBackgroundNode,
};
