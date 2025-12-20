import InputImage from "./InputImage";
import OutputImage from "./OutputImage";
import { CheckpointNode, LoraNode, PresetsNode, StyleNode } from "./PromptComponent";
import TextNode from "./TextNode";
import DropNode from "./DropNode";
import ColorCorrectionNode from "./ColorCorrectionNode";

export const nodeTypes = {
  drop: DropNode,
  outputImage: OutputImage,
  inputImage: InputImage,
  prompt: TextNode,
  presets: PresetsNode,
  style: StyleNode,
  checkpoint: CheckpointNode,
  lora: LoraNode,
  colorCorrection: ColorCorrectionNode,
};
