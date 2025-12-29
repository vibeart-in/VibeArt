import { NodeTypes } from "@xyflow/react";

// Import all node components
import InputImage from "./InputImage";
import OutputImage from "./OutputImage";
import TextNode from "./TextNode";
import SketchNode from "./SketchNode";
import ColorCorrectionNode from "./ColorCorrectionNode";
import CropNode from "./CropNode";
import DropNode from "./DropNode";
import { CheckpointNode, LoraNode, PresetsNode, StyleNode } from "./PromptComponent";
import UpscaleNode from "./UpscaleNode";
import AnimeToRealNode from "./AnimeToRealNode";

// Register all node types for React Flow
export const nodeTypes: NodeTypes = {
  inputImage: InputImage,
  outputImage: OutputImage,
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
  upscale: UpscaleNode,
  animeToReal: AnimeToRealNode,
};
