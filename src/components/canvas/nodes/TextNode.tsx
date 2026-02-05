"use client";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Position, NodeProps, Node, useReactFlow } from "@xyflow/react";
import { useAtom } from "jotai";
import React, { useEffect, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";

import { nodeStyleAtom, NodeStyle } from "../../../store/nodeAtoms";
import NodeLayout from "../NodeLayout";

type TextData = {
  label?: string;
  text?: string;
  html?: string;
  style?: NodeStyle;
  onChange?: (value: string) => void;
  [key: string]: unknown;
};

export type TextType = Node<TextData, "text">;

const DEBOUNCE_MS = 300;

const TextNode = React.memo(function TextNode({ id, data, selected }: NodeProps<TextType>) {
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
    // Prefer data.html for editor state, fall back to data.prompt (legacy/unmigrated nodes may store HTML in prompt)
    content: data.html ?? data.prompt ?? "",
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-full h-full",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      // Debounce update
      if (changeDebounce.current) {
        window.clearTimeout(changeDebounce.current);
      }
      changeDebounce.current = window.setTimeout(() => {
        // Store clean text in 'prompt' for downstream nodes, and HTML in 'html' for editor state restoration
        updateNodeData(id, { prompt: text, html: html });
        // onChange usually expects the "value", stick to html or text?
        // User asked for "output text should be clean". If on change is used by some external UI purely for display it might want HTML.
        // But usually onChange mirrors the semantic value. Let's send text if 'prompt' is the primary semantic value.
        // However, existing usage might expect HTML.
        // Given the request "output text have html tage... shouldnt be in html format", I'll send text.
        if (typeof data.onChange === "function") data.onChange(text);
        changeDebounce.current = null;
      }, DEBOUNCE_MS);
    },
    immediatelyRender: false,
  });

  return (
    <NodeLayout
      id={id}
      selected={selected}
      title={data.label || "Text"}

      minWidth={300}
      className="flex size-full min-w-[300px] cursor-default flex-col rounded-3xl transition-colors duration-200"

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
          <div className="size-1 rounded-full bg-white/20"></div>
          <div className="size-1 rounded-full bg-white/20"></div>
          <div className="size-1 rounded-full bg-white/20"></div>
          <div className="size-1 rounded-full bg-white/20"></div>
          <div className="size-1 rounded-full bg-white/20"></div>
          <div className="size-1 rounded-full bg-white/20"></div>
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

          className="nodrag size-full min-h-[120px] cursor-text overflow-auto rounded-xl text-white/90 !outline-none hover:border-2 [&_.ProseMirror]:h-full [&_.ProseMirror]:min-h-[120px] [&_.ProseMirror]:outline-none"

        />
      </div>
    </NodeLayout>
  );
});

export default TextNode;
