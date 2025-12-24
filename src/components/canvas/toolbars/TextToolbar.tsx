"use client";

import {
  ChevronDown,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  Minus,
  Check,
} from "lucide-react";
import { Position, NodeToolbar as FlowNodeToolbar } from "@xyflow/react";
import { useAtom } from "jotai";
import { nodeStyleAtom } from "../../../store/nodeAtoms";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Editor } from "@tiptap/react";

interface TextToolbarProps {
  id: string;
  selected: boolean;
  isHovered: boolean;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  textEditor: Editor;
}

const COLORS = [
  "#1D1D1D", // Dark Grey
  "#5C3B28", // Brown
  "#1E3A8A", // Blue
  "#064E3B", // Green
  "#4C1D95", // Purple
  "#B91C1C", // Red
  "#D97706", // Orange/Yellow
];

export default function TextToolbar({
  id,
  selected,
  isHovered,
  handleMouseEnter,
  handleMouseLeave,
  textEditor,
}: TextToolbarProps) {
  const [style, setStyle] = useAtom(nodeStyleAtom(id));
  const editor = textEditor;

  return (
    <FlowNodeToolbar
      className={selected ? "opacity-100" : "opacity-50 hover:opacity-100"}
      isVisible={selected || isHovered}
      position={Position.Bottom}
      offset={20}
    >
      <div
        className="flex items-center gap-1 rounded-full border border-[#1D1D1D] bg-[#121212] p-1.5 shadow-2xl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Color Picker Section (Node Background) */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex h-8 items-center gap-1 rounded-full px-2 text-gray-300 outline-none transition-colors hover:bg-white/10 hover:text-white">
              <div
                className="size-4 rounded-full border border-white/20"
                style={{ backgroundColor: style.backgroundColor }}
              />
              <ChevronDown className="size-3 opacity-50" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[200px] rounded-xl border border-[#1D1D1D] bg-[#121212] p-2 shadow-xl animate-in fade-in zoom-in-95"
              sideOffset={5}
            >
              <div className="grid grid-cols-7 gap-1">
                {COLORS.map((color) => (
                  <DropdownMenu.Item
                    key={color}
                    className="relative flex size-6 cursor-pointer items-center justify-center rounded-full border border-transparent hover:border-white/50 focus:outline-none"
                    onClick={() => setStyle((s) => ({ ...s, backgroundColor: color }))}
                  >
                    <div className="size-full rounded-full" style={{ backgroundColor: color }} />
                    {style.backgroundColor === color && (
                      <Check className="absolute inset-0 m-auto size-3 text-white drop-shadow-md" />
                    )}
                  </DropdownMenu.Item>
                ))}
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Heading / Type Selector */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex h-8 items-center gap-2 rounded-full px-2 text-sm font-medium text-gray-300 outline-none transition-colors hover:bg-white/10 hover:text-white">
              <span className="text-xs">
                {editor.isActive("heading", { level: 1 })
                  ? "Heading 1"
                  : editor.isActive("heading", { level: 2 })
                    ? "Heading 2"
                    : editor.isActive("heading", { level: 3 })
                      ? "Heading 3"
                      : "Paragraph"}
              </span>
              <ChevronDown className="size-3 opacity-50" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 flex min-w-[140px] flex-col gap-1 rounded-xl border border-[#1D1D1D] bg-[#121212] p-1 shadow-xl animate-in fade-in zoom-in-95"
              sideOffset={5}
            >
              {[
                {
                  label: "Paragraph",
                  action: () => editor.chain().focus().setParagraph().run(),
                  active: editor.isActive("paragraph"),
                },
                {
                  label: "Heading 1",
                  action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
                  active: editor.isActive("heading", { level: 1 }),
                },
                {
                  label: "Heading 2",
                  action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
                  active: editor.isActive("heading", { level: 2 }),
                },
                {
                  label: "Heading 3",
                  action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
                  active: editor.isActive("heading", { level: 3 }),
                },
              ].map((item) => (
                <DropdownMenu.Item
                  key={item.label}
                  onClick={item.action}
                  className={`flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs text-gray-300 hover:bg-white/10 focus:outline-none ${item.active ? "bg-white/10 text-white" : ""}`}
                >
                  {item.label}
                  {item.active && <Check className="size-3" />}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <div className="mx-1 h-4 w-px bg-[#333]" />

        {/* Formatting Section */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`flex size-8 items-center justify-center rounded-full transition-colors hover:bg-white/10 ${
            editor.isActive("bold") ? "bg-white/20 text-white" : "text-gray-400"
          }`}
        >
          <Bold className="size-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`flex size-8 items-center justify-center rounded-full transition-colors hover:bg-white/10 ${
            editor.isActive("italic") ? "bg-white/20 text-white" : "text-gray-400"
          }`}
        >
          <Italic className="size-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`flex size-8 items-center justify-center rounded-full transition-colors hover:bg-white/10 ${
            editor.isActive("underline") ? "bg-white/20 text-white" : "text-gray-400"
          }`}
        >
          <UnderlineIcon className="size-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`flex size-8 items-center justify-center rounded-full transition-colors hover:bg-white/10 ${
            editor.isActive("bulletList") ? "bg-white/20 text-white" : "text-gray-400"
          }`}
        >
          <List className="size-4" />
        </button>

        <div className="mx-1 h-4 w-px bg-[#333]" />

        {/* Delete/More Action can go here */}
        <button className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-500/20 hover:text-red-400">
          <Minus className="size-4" />
        </button>
      </div>
    </FlowNodeToolbar>
  );
}
