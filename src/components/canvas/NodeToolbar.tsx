"use client";

import { Editor } from "@tiptap/react";
import {
  TextToolbar,
  ImageToolbar,
  GenerateToolbar,
  UpscaleToolbar,
  RemoveBackgroundToolbar,
} from "./toolbars";

interface NodeToolbarProps {
  id?: string;
  toolbarType?: "default" | "text" | "image" | "generate" | "upscale" | "removeBackground";
  selected: boolean;
  isHovered: boolean;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  width?: number;
  height?: number;
  textEditor?: any;
  initialModel?: string;
}

export default function NodeToolbar({
  id,
  toolbarType = "default",
  selected,
  isHovered,
  handleMouseEnter,
  handleMouseLeave,
  textEditor,
  initialModel,
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

  // Upscale Toolbar with controls
  if (toolbarType === "upscale") {
    return (
      <UpscaleToolbar
        selected={selected}
        isHovered={isHovered}
        handleMouseEnter={handleMouseEnter}
        handleMouseLeave={handleMouseLeave}
        id={id}
      />
    );
  }

  // Remove Background Toolbar
  if (toolbarType === "removeBackground") {
    return (
      <RemoveBackgroundToolbar
        selected={selected}
        isHovered={isHovered}
        handleMouseEnter={handleMouseEnter}
        handleMouseLeave={handleMouseLeave}
        id={id}
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
        id={id}
        initialModel={initialModel}
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
