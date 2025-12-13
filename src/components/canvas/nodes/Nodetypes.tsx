import InputImage from "./InputImage";
import OutputImage from "./OutputImage";
import { CheckpointNode, LoraNode, PresetsNode, StyleNode } from "./PromptComponent";
import Prompt from "./PromptNode";

export const nodeTypes = {
  outputImage: OutputImage,
  inputImage: InputImage,
  prompt: Prompt,
  presets: PresetsNode,
  style: StyleNode,
  checkpoint: CheckpointNode,
  lora: LoraNode,
};
