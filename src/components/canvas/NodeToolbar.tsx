"use client";

import { Editor } from "@tiptap/react";
import { TextToolbar, ImageToolbar, GenerateToolbar } from "./toolbars";

interface NodeToolbarProps {
  id?: string;
  toolbarType?: "default" | "text" | "image" | "generate";
  selected: boolean;
  isHovered: boolean;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  width?: number;
  height?: number;
  textEditor?: any;
  onGenerate?: () => void;
}

export default function NodeToolbar({
  id,
  toolbarType = "default",
  selected,
  isHovered,
  handleMouseEnter,
  handleMouseLeave,
  textEditor,
  onGenerate,
}: NodeToolbarProps) {
  const editor = textEditor as Editor | undefined;

  // Text Toolbar for rich text editing
  if (toolbarType === "text" && id && editor) {
    return (
      <TextToolbar
        id={id}
        selected={selected}
        isHovered={isHovered}
        handleMouseEnter={handleMouseEnter}
        handleMouseLeave={handleMouseLeave}
        textEditor={editor}
      />
    );
  }

  // Generate Toolbar with model selection and generate button
  if (toolbarType === "generate") {
    return (
      <GenerateToolbar
        selected={selected}
        isHovered={isHovered}
        handleMouseEnter={handleMouseEnter}
        handleMouseLeave={handleMouseLeave}
        onGenerate={onGenerate}
      />
    );
  }

  // Default Image Toolbar
  return (
    <ImageToolbar
      selected={selected}
      isHovered={isHovered}
      handleMouseEnter={handleMouseEnter}
      handleMouseLeave={handleMouseLeave}
    />
  );
}
