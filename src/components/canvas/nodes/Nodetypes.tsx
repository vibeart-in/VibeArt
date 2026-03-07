import { NodeTypes } from "@xyflow/react";

// Import all node components
import AiAppNode from "./AiAppNode";
import ColorCorrectionNode from "./ColorCorrectionNode";
import CropNode from "./CropNode";
import DropNode from "./DropNode";
import FrameExtractorNode from "./FrameExtractorNode";
import GenerateVideo from "./GenerateVideo";
import GroupNode from "./GroupNode";
import InputImage from "./InputImage";
import OutputImage from "./OutputImage";
import OutputImageOpenSource from "./OutputImageOpenSource";
import { CheckpointNode, LoraNode, PresetsNode, StyleNode } from "./PromptComponent";
import RemoveBackgroundNode from "./RemoveBackgroundNode";
import SketchNode from "./SketchNode";
import TextNode from "./TextNode";
import UpscaleNode from "./UpscaleNode";

// Register all node types for React Flow
export const nodeTypes: NodeTypes = {
  inputImage: InputImage,
  outputImage: OutputImage,
  outputImageAdvanced: OutputImageOpenSource,
  generateVideo: GenerateVideo,
  frameExtractor: FrameExtractorNode,
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
