"use client";

import React, { useState } from "react";
import {
  Plus,
  Upload,
  Image as ImageIcon,
  Video,
  Settings,
  HelpCircle,
  X,
  Type,
  Sparkles,
  Palette,
  Wrench,
  LayoutTemplate,
  Crop,
  Brush,
  Eraser,
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { IconPhotoPlus, IconWindowMaximize } from "@tabler/icons-react";

import { useNodeOperations } from "../providers/NodeProvider";
import { AI_APPS } from "@/src/constants/aiApps";

type PanelType = "addNode" | "uploadImage" | "addImage" | "addVideo" | "settings" | "help" | null;

export default function SideToolbar() {
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const { addNode } = useNodeOperations();
  const { screenToFlowPosition } = useReactFlow();

  const handleAddNode = (type: string, options?: Record<string, unknown>) => {
    const position = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    addNode(type, { ...options, position });
    setActivePanel(null);
  };

  const handleUploadImage = () => {
    const position = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    addNode("inputImage", { position });
    setActivePanel(null);
  };

  const tools = [
    {
      title: "Add Node",
      icon: <Plus className="h-5 w-5" />,
      onClick: () => setActivePanel(activePanel === "addNode" ? null : "addNode"),
      active: activePanel === "addNode",
    },
    {
      title: "Upload Image",
      icon: <Upload className="h-5 w-5" />,
      onClick: handleUploadImage,
      active: false,
    },
    {
      title: "Add Image Node",
      icon: <ImageIcon className="h-5 w-5" />,
      onClick: () => setActivePanel(activePanel === "addImage" ? null : "addImage"),
      active: activePanel === "addImage",
    },
    {
      title: "Add Video Node",
      icon: <Video className="h-5 w-5" />,
      onClick: () => handleAddNode("generateVideo"),
      active: false,
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      onClick: () => setActivePanel(activePanel === "settings" ? null : "settings"),
      active: activePanel === "settings",
    },
    {
      title: "Help",
      icon: <HelpCircle className="h-5 w-5" />,
      onClick: () => setActivePanel(activePanel === "help" ? null : "help"),
      active: activePanel === "help",
    },
  ];

  return (
    <>
      <div className="pointer-events-auto absolute left-4 top-1/2 z-50 flex -translate-y-1/2 flex-col items-center gap-4 rounded-3xl border border-white/5 bg-neutral-900/50 p-2 shadow-lg backdrop-blur-md transition-all hover:shadow-xl">
        {/* Top action button - Add Node */}
        <button
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent shadow-sm transition-all hover:scale-105 hover:bg-neutral-100 active:scale-95"
          title="Add Node"
          onClick={() => setActivePanel(activePanel === "addNode" ? null : "addNode")}
        >
          <Plus className="h-6 w-6 text-neutral-900" />
        </button>

        {/* Middle tools */}
        <div className="flex flex-col items-center gap-7 py-2 text-neutral-400">
          {tools.slice(1).map((tool, idx) => (
            <button
              key={idx}
              className={`transition-all duration-200 ${
                tool.active ? "text-white" : "hover:text-white"
              }`}
              title={tool.title}
              onClick={tool.onClick}
            >
              {tool.icon}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="my-1 h-[1px] w-6 bg-neutral-700/50" />

        {/* User Avatar */}
        {/* <button
          className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-transparent transition-all hover:ring-neutral-500"
          title="User Profile"
        >
          <img
            src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e2e8f0"
            alt="User avatar"
            className="h-full w-full object-cover"
          />
        </button> */}
      </div>

      {/* Side Panel */}
      {activePanel && (
        <div className="pointer-events-auto absolute left-20 top-1/2 z-50 w-80 -translate-y-1/2 rounded-3xl border border-white/15 bg-neutral-950/80 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/5 p-4">
            <h3 className="text-sm font-semibold text-white">
              {activePanel === "addNode" && "Add Node"}
              {activePanel === "addImage" && "Add Image Node"}
              {activePanel === "settings" && "Settings"}
              {activePanel === "help" && "Help"}
            </h3>
            <button
              onClick={() => setActivePanel(null)}
              className="text-neutral-400 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-4">
            {activePanel === "addNode" && <AddNodePanel onAddNode={handleAddNode} />}
            {activePanel === "addImage" && <AddImagePanel onAddNode={handleAddNode} />}
            {activePanel === "settings" && <SettingsPanel />}
            {activePanel === "help" && <HelpPanel />}
          </div>
        </div>
      )}
    </>
  );
}

function AddNodePanel({
  onAddNode,
}: {
  onAddNode: (type: string, options?: Record<string, unknown>) => void;
}) {
  const nodeCategories = [
    {
      title: "Generation",
      icon: <Sparkles size={14} />,
      nodes: [
        { label: "Text", icon: <Type size={12} />, type: "prompt", color: "emerald" },
        {
          label: "Image Generator",
          icon: <ImageIcon size={12} />,
          type: "outputImage",
          color: "indigo",
        },
        {
          label: "Image Generator (Advanced)",
          icon: <ImageIcon size={12} />,
          type: "outputImageAdvanced",
          color: "blue",
        },
        {
          label: "Video Generator",
          icon: <Video size={12} />,
          type: "generateVideo",
          color: "purple",
        },
      ],
    },
    {
      title: "Models & Styles",
      icon: <Palette size={14} />,
      nodes: [
        { label: "Checkpoint", icon: <Palette size={12} />, type: "checkpoint", color: "blue" },
        { label: "LoRA", icon: <Palette size={12} />, type: "lora", color: "violet" },
        { label: "Style", icon: <Palette size={12} />, type: "style", color: "orange" },
        { label: "Presets", icon: <LayoutTemplate size={12} />, type: "presets", color: "pink" },
      ],
    },
    {
      title: "Tools",
      icon: <Wrench size={14} />,
      nodes: [
        {
          label: "Color Correction",
          icon: <Palette size={12} />,
          type: "colorCorrection",
          color: "amber",
        },
        { label: "Crop", icon: <Crop size={12} />, type: "crop", color: "neutral" },
        { label: "Painter", icon: <Brush size={12} />, type: "sketch", color: "pink" },
        {
          label: "Upscale",
          icon: <IconWindowMaximize size={12} />,
          type: "upscale",
          color: "cyan",
        },
        {
          label: "Remove Background",
          icon: <Eraser size={12} />,
          type: "removeBackground",
          color: "rose",
        },
        {
          label: "Group",
          icon: <LayoutTemplate size={12} />,
          type: "group",
          color: "zinc",
          options: { zIndex: -1, width: 400, height: 400, data: { label: "Group" } },
        },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {nodeCategories.map((category, idx) => (
        <div key={idx}>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-neutral-400">
            {category.icon}
            <span>{category.title}</span>
          </div>
          <div className="space-y-1">
            {category.nodes.map((node, nodeIdx) => (
              <button
                key={nodeIdx}
                onClick={() => onAddNode(node.type, node.options)}
                className="flex w-full items-center gap-2 rounded-lg border border-white/5 bg-neutral-800/50 p-2 text-left text-sm text-neutral-300 transition-all hover:border-white/10 hover:bg-neutral-800 hover:text-white"
              >
                <div
                  className={`flex size-6 items-center justify-center rounded bg-${node.color}-900/50 text-${node.color}-500`}
                >
                  {node.icon}
                </div>
                <span>{node.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-neutral-400">
          <Sparkles size={14} />
          <span>AI Apps</span>
        </div>
        <div className="space-y-1">
          {AI_APPS.map((app) => (
            <button
              key={app.id}
              onClick={() => onAddNode("aiApp", { data: { appData: app } })}
              className="flex w-full items-center gap-2 rounded-lg border border-white/5 bg-neutral-800/50 p-2 text-left text-sm text-neutral-300 transition-all hover:border-white/10 hover:bg-neutral-800 hover:text-white"
            >
              <div className="flex size-6 items-center justify-center rounded bg-cyan-900/50 text-cyan-500">
                <Sparkles size={12} />
              </div>
              <span className="truncate">{app.app_name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AddImagePanel({ onAddNode }: { onAddNode: (type: string) => void }) {
  return (
    <div className="space-y-2">
      <button
        onClick={() => onAddNode("outputImage")}
        className="flex w-full items-center gap-3 rounded-lg border border-white/5 bg-neutral-800/50 p-3 text-left transition-all hover:border-white/10 hover:bg-neutral-800"
      >
        <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-900/50 text-indigo-500">
          <ImageIcon size={20} />
        </div>
        <div>
          <div className="text-sm font-medium text-white">Image Generator</div>
          <div className="text-xs text-neutral-400">Standard image generation</div>
        </div>
      </button>

      <button
        onClick={() => onAddNode("outputImageAdvanced")}
        className="flex w-full items-center gap-3 rounded-lg border border-white/5 bg-neutral-800/50 p-3 text-left transition-all hover:border-white/10 hover:bg-neutral-800"
      >
        <div className="flex size-10 items-center justify-center rounded-lg bg-blue-900/50 text-blue-500">
          <IconPhotoPlus size={20} />
        </div>
        <div>
          <div className="text-sm font-medium text-white">Lora Image Generator </div>
          <div className="text-xs text-neutral-400">
            Advanced options to add lora and checkpoints
          </div>
        </div>
      </button>
    </div>
  );
}

function SettingsPanel() {
  return (
    <div className="space-y-4 text-sm text-neutral-300">
      <div>
        <label className="mb-2 block text-xs font-medium text-neutral-400">Canvas Settings</label>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-neutral-800/50 p-3">
            <span>Snap to Grid</span>
            <input type="checkbox" className="rounded" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-neutral-800/50 p-3">
            <span>Show Minimap</span>
            <input type="checkbox" className="rounded" />
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-white/5 bg-neutral-800/50 p-3 text-xs text-neutral-400">
        More settings coming soon...
      </div>
    </div>
  );
}

function HelpPanel() {
  const shortcuts = [
    { key: "Ctrl/Cmd + C", action: "Copy selected nodes" },
    { key: "Ctrl/Cmd + V", action: "Paste nodes" },
    { key: "Alt + Drag", action: "Duplicate nodes" },
    { key: "Delete/Backspace", action: "Delete selected" },
    { key: "Right Click", action: "Context menu" },
    { key: "Mouse Wheel", action: "Zoom in/out" },
    { key: "Space + Drag", action: "Pan canvas" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 text-xs font-medium text-neutral-400">Keyboard Shortcuts</h4>
        <div className="space-y-1">
          {shortcuts.map((shortcut, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-neutral-800/50 p-2 text-xs"
            >
              <span className="text-neutral-400">{shortcut.action}</span>
              <kbd className="rounded bg-neutral-700 px-2 py-1 font-mono text-neutral-300">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-white/5 bg-neutral-800/50 p-3">
        <h4 className="mb-2 text-xs font-medium text-neutral-400">Getting Started</h4>
        <p className="text-xs text-neutral-300">
          Add nodes to your canvas by clicking the + button or right-clicking anywhere on the
          canvas. Connect nodes by dragging from output handles to input handles.
        </p>
      </div>
    </div>
  );
}
