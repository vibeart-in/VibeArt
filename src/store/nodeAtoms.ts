import { atom } from "jotai";
import { atomFamily } from "jotai-family";

export type NodeStyle = {
  backgroundColor: string;
  textColor: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isList: boolean;
  fontSize: "paragraph" | "heading" | "display";
};

export const defaultNodeStyle: NodeStyle = {
  backgroundColor: "#1D1D1D",
  textColor: "#EBEBEB",
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isList: false,
  fontSize: "paragraph",
};

// Atom family to store style for each node by ID
export const nodeStyleAtom = atomFamily((id: string) => atom<NodeStyle>(defaultNodeStyle));

import { ModelData } from "@/src/types/BaseType";

// Atom family to store selected model for each node by ID
export const selectedModelAtom = atomFamily((id: string) => atom<ModelData | null>(null));
