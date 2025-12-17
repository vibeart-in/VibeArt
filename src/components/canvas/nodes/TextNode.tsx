"use client";
import React, { useEffect, useRef } from "react";
import { Position, NodeProps, Node, useReactFlow } from "@xyflow/react";
import NodeLayout from "../NodeLayout";
import { useAtom } from "jotai";
import { nodeStyleAtom, NodeStyle } from "../../../store/nodeAtoms";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import { useDebouncedCallback } from "use-debounce";

type TextData = {
  label?: string;
  text?: string;
  style?: NodeStyle;
  onChange?: (value: string) => void;
  [key: string]: unknown;
};

export type TextType = Node<TextData, "text">;

const DEBOUNCE_MS = 300;

export default function TextNode({ id, data, selected }: NodeProps<TextType>) {
  const { updateNodeData } = useReactFlow();
  const changeDebounce = useRef<number | null>(null);

  const [style, setStyle] = useAtom(nodeStyleAtom(id));

  // Sync data.style to atom (External -> Internal)
  useEffect(() => {
    if (data.style && JSON.stringify(data.style) !== JSON.stringify(style)) {
      setStyle(data.style);
    }
    // We intentionally omit 'style' from dependencies to prevent this effect from running
    // when we update the style locally. We only want to react to external data.style changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.style, setStyle]);

  // Sync atom to data.style (Internal -> External)
  const syncStyleToData = useDebouncedCallback((newStyle: NodeStyle) => {
    if (JSON.stringify(newStyle) !== JSON.stringify(data.style)) {
      updateNodeData(id, { style: newStyle });
    }
  }, 500);

  useEffect(() => {
    syncStyleToData(style);
  }, [style, syncStyleToData]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Enter your text...",
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Underline,
    ],
    content: data.prompt ?? "",
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-full h-full",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Debounce update
      if (changeDebounce.current) {
        window.clearTimeout(changeDebounce.current);
      }
      changeDebounce.current = window.setTimeout(() => {
        updateNodeData(id, { prompt: html });
        if (typeof data.onChange === "function") data.onChange(html);
        changeDebounce.current = null;
      }, DEBOUNCE_MS);
    },
    immediatelyRender: false,
  });

  // Sync content if data.prompt changes externally (and not just by our own edit if possible, but simplest is to just setContent)
  // To avoid cursor jumping, we might want to check if content is different.
  // useEffect(() => {
  // if (editor && data.prompt && editor.getHTML() !== data.prompt) {
  // Only set if significantly different to avoid loop if possible, or just trusting react-flow doesn't spam updates.
  // Actually user typing updates state, which updates data, so this effect might fire.
  // We should be careful. For now, trusting that if we are focused, we might not want to overwrite unless necessary.
  // But 'data.prompt' is the source of truth if modified elsewhere.
  // editor.commands.setContent(data.prompt);
  // Commented out to avoid loop for now as we are the primary writer.
  // }
  // }, [data.prompt, editor]);

  return (
    <NodeLayout
      id={id}
      selected={selected}
      title={data.label || "Text"}
      className="flex h-full w-full min-w-[300px] cursor-default flex-col rounded-3xl transition-colors duration-200"
      style={{
        backgroundColor: style.backgroundColor,
      }}
      toolbarType="text"
      textEditor={editor}
      handles={[{ type: "source", position: Position.Right }]}
    >
      {/* Drag indicator */}
      <div className="flex cursor-grab items-center justify-center py-2 active:cursor-grabbing">
        <div className="flex gap-1">
          <div className="h-1 w-1 rounded-full bg-white/20"></div>
          <div className="h-1 w-1 rounded-full bg-white/20"></div>
          <div className="h-1 w-1 rounded-full bg-white/20"></div>
          <div className="h-1 w-1 rounded-full bg-white/20"></div>
          <div className="h-1 w-1 rounded-full bg-white/20"></div>
          <div className="h-1 w-1 rounded-full bg-white/20"></div>
        </div>
      </div>

      <div className="relative flex h-full flex-1 flex-col px-6 pb-4">
        {/* We apply styles to a wrapper or the editor config. Tiptap handles its own styles mostly. 
             If we want 'node style' (like background) to affect text, it's done on NodeLayout. 
             But Font styles (bold etc) are done via Toolbar -> Editor commands. 
             So we don't need to pass 'style' to the editor container for font-weight etc, 
             the editor handles that content-wise. */}
        <EditorContent
          editor={editor}
          className="nodrag h-full min-h-[120px] w-full cursor-text overflow-auto rounded-xl text-white/90 !outline-none hover:border-2 [&_.ProseMirror]:h-full [&_.ProseMirror]:min-h-[120px] [&_.ProseMirror]:outline-none"
        />
      </div>
    </NodeLayout>
  );
}
