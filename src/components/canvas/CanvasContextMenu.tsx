import { IconWindowMaximize } from "@tabler/icons-react";
import { useReactFlow } from "@xyflow/react";
import {
  Search,
  Upload,
  Type,
  Image as ImageIcon,
  Video,
  Sparkles,
  LayoutTemplate,
  Palette,
  Crop,
  Brush,
  Wrench,
  Zap,
  Eraser,
} from "lucide-react";
import { useCallback, useState, ReactNode, useMemo } from "react";

import { AI_APPS } from "@/src/constants/aiApps";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "../ui/context-menu";

interface CanvasContextMenuProps {
  children: ReactNode;
  addNode: (type: string, options?: Record<string, unknown>) => string;
}

export function CanvasContextMenu({ children, addNode }: CanvasContextMenuProps) {
  const { screenToFlowPosition } = useReactFlow();
  const [location, setLocation] = useState({ x: 0, y: 0 });
  const [search, setSearch] = useState("");

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      // e.preventDefault(); // ContextMenuTrigger handles this
      const position = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });
      setLocation(position);
      setSearch(""); // Reset search on open
    },
    [screenToFlowPosition],
  );

  const handleAddNode = useCallback(
    (type: string, options?: Record<string, unknown>) => {
      addNode(type, { ...options, position: location });
    },
    [addNode, location],
  );

  const allItems = useMemo(() => {
    return [
      {
        label: "Upload",
        icon: <Upload size={14} className="mr-2" />,
        action: () => handleAddNode("inputImage"),
      },
      {
        label: "Text",
        icon: (
          <div className="mr-2 flex size-5 items-center justify-center rounded bg-emerald-900/50 text-emerald-500">
            <Type size={12} />
          </div>
        ),
        action: () => handleAddNode("prompt"),
      },
      {
        label: "Image Generator",
        icon: (
          <div className="mr-2 flex size-5 items-center justify-center rounded bg-indigo-900/50 text-indigo-500">
            <ImageIcon size={12} />
          </div>
        ),
        action: () => handleAddNode("outputImage"),
      },
      {
        label: "Image Generator (Advanced)",
        icon: (
          <div className="mr-2 flex size-5 items-center justify-center rounded bg-blue-900/50 text-blue-500">
            <ImageIcon size={12} />
          </div>
        ),
        action: () => handleAddNode("outputImageAdvanced"),
      },
      {
        label: "Video Generator",
        icon: (
          <div className="mr-2 flex size-5 items-center justify-center rounded bg-purple-900/50 text-purple-500">
            <Video size={12} />
          </div>
        ),
        action: undefined,
      },
      {
        label: "Checkpoint",
        icon: (
          <div className="mr-2 flex size-5 items-center justify-center rounded bg-blue-900/50 text-blue-500">
            <Palette size={12} />
          </div>
        ),
        action: () => handleAddNode("checkpoint"),
      },
      {
        label: "LoRA",
        icon: (
          <div className="mr-2 flex size-5 items-center justify-center rounded bg-violet-900/50 text-violet-500">
            <Palette size={12} />
          </div>
        ),
        action: () => handleAddNode("lora"),
      },
      {
        label: "Style",
        icon: (
          <div className="mr-2 flex size-5 items-center justify-center rounded bg-orange-900/50 text-orange-500">
            <Palette size={12} />
          </div>
        ),
        action: () => handleAddNode("style"),
      },
      {
        label: "Presets",
        icon: (
          <div className="mr-2 flex size-5 items-center justify-center rounded bg-pink-900/50 text-pink-500">
            <LayoutTemplate size={12} />
          </div>
        ),
        action: () => handleAddNode("presets"),
      },
      {
        label: "Color Correction",
        icon: (
          <div className="mr-2 flex size-5 items-center justify-center rounded bg-amber-900/50 text-amber-500">
            <Palette size={12} />
          </div>
        ),
        action: () => handleAddNode("colorCorrection"),
      },
      {
        label: "Crop",
        icon: (
          <div className="mr-2 flex size-5 items-center justify-center rounded bg-neutral-800/50 text-neutral-400">
            <Crop size={12} />
          </div>
        ),
        action: () => handleAddNode("crop"),
      },
      {
        label: "Painter",
        icon: (
          <div className="mr-2 flex size-5 items-center justify-center rounded bg-pink-900/50 text-pink-400">
            <Brush size={12} />
          </div>
        ),
        action: () => handleAddNode("sketch"),
      },
      {
        label: "Upscale",
        icon: (
          <div className="mr-2 flex size-5 items-center justify-center rounded bg-pink-900/50 text-pink-400">
            <IconWindowMaximize size={12} />
          </div>
        ),
        action: () => handleAddNode("upscale"),
      },
      {
        label: "Remove Background",
        icon: (
          <div className="mr-2 flex size-5 items-center justify-center rounded bg-rose-900/50 text-rose-400">
            <Eraser size={12} />
          </div>
        ),
        action: () => handleAddNode("removeBackground"),
      },
      {
        label: "Group",
        icon: (
          <div className="mr-2 flex size-5 items-center justify-center rounded bg-zinc-800/50 text-zinc-400">
            <LayoutTemplate size={12} />
          </div>
        ),
        action: () =>
          handleAddNode("group", { zIndex: -1, width: 400, height: 400, data: { label: "Group" } }),
      },
      ...AI_APPS.map((app) => ({
        label: app.app_name,
        icon: (
          <div className="mr-2 flex size-5 items-center justify-center rounded bg-cyan-900/50 text-cyan-500">
            <Sparkles size={12} />
          </div>
        ),
        action: () => handleAddNode("aiApp", { data: { appData: app } }),
      })),
    ];
  }, [handleAddNode]);

  const filteredItems = useMemo(() => {
    if (!search) return [];
    return allItems.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()));
  }, [search, allItems]);

  return (
    <ContextMenu>
      <ContextMenuTrigger onContextMenu={handleContextMenu} className="block size-full">
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64 border-zinc-800 bg-zinc-900 text-zinc-400">
        <div className="border-b border-zinc-800 p-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              className="w-full rounded-md border border-zinc-800 bg-zinc-950/50 py-2 pl-9 pr-3 text-sm text-zinc-200 placeholder-zinc-500 shadow-inner outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700/50"
              placeholder="Search nodes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
        </div>

        {search ? (
          <div className="max-h-[300px] overflow-y-auto">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <ContextMenuItem
                  key={index}
                  className="focus:bg-zinc-800 focus:text-zinc-100"
                  onClick={item.action}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </ContextMenuItem>
              ))
            ) : (
              <div className="p-2 text-center text-xs text-zinc-500">No results found</div>
            )}
          </div>
        ) : (
          <>
            <ContextMenuItem
              className="focus:bg-zinc-800 focus:text-zinc-100"
              onClick={() => handleAddNode("inputImage")}
            >
              <Upload size={14} className="mr-2" />
              Upload
            </ContextMenuItem>

            <ContextMenuSeparator className="bg-zinc-800" />

            <ContextMenuSub>
              <ContextMenuSubTrigger className="focus:bg-zinc-800 focus:text-zinc-100">
                <Zap size={14} className="mr-2" />
                Generation
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-56 border-zinc-800 bg-zinc-900 text-zinc-400">
                <ContextMenuItem
                  className="focus:bg-zinc-800 focus:text-zinc-100"
                  onClick={() => handleAddNode("prompt")}
                >
                  <div className="mr-2 flex size-5 items-center justify-center rounded bg-emerald-900/50 text-emerald-500">
                    <Type size={12} />
                  </div>
                  Text
                </ContextMenuItem>

                <ContextMenuItem
                  className="focus:bg-zinc-800 focus:text-zinc-100"
                  onClick={() => handleAddNode("outputImage")}
                >
                  <div className="mr-2 flex size-5 items-center justify-center rounded bg-indigo-900/50 text-indigo-500">
                    <ImageIcon size={12} />
                  </div>
                  Image Generator
                </ContextMenuItem>

                <ContextMenuItem
                  className="focus:bg-zinc-800 focus:text-zinc-100"
                  onClick={() => handleAddNode("outputImageAdvanced")}
                >
                  <div className="mr-2 flex size-5 items-center justify-center rounded bg-blue-900/50 text-blue-500">
                    <ImageIcon size={12} />
                  </div>
                  Image Generator (Advanced)
                </ContextMenuItem>

                <ContextMenuItem
                  className="focus:bg-zinc-800 focus:text-zinc-100"
                  onClick={() => handleAddNode("generateVideo")}
                >
                  <div className="mr-2 flex size-5 items-center justify-center rounded bg-purple-900/50 text-purple-500">
                    <Video size={12} />
                  </div>
                  Video Generator
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>

            <ContextMenuSub>
              <ContextMenuSubTrigger className="focus:bg-zinc-800 focus:text-zinc-100">
                <Palette size={14} className="mr-2" />
                Models & Styles
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-56 border-zinc-800 bg-zinc-900 text-zinc-400">
                <ContextMenuItem
                  className="focus:bg-zinc-800 focus:text-zinc-100"
                  onClick={() => handleAddNode("checkpoint")}
                >
                  <div className="mr-2 flex size-5 items-center justify-center rounded bg-blue-900/50 text-blue-500">
                    <Palette size={12} />
                  </div>
                  Checkpoint
                </ContextMenuItem>

                <ContextMenuItem
                  className="focus:bg-zinc-800 focus:text-zinc-100"
                  onClick={() => handleAddNode("lora")}
                >
                  <div className="mr-2 flex size-5 items-center justify-center rounded bg-violet-900/50 text-violet-500">
                    <Palette size={12} />
                  </div>
                  LoRA
                </ContextMenuItem>

                <ContextMenuItem
                  className="focus:bg-zinc-800 focus:text-zinc-100"
                  onClick={() => handleAddNode("style")}
                >
                  <div className="mr-2 flex size-5 items-center justify-center rounded bg-orange-900/50 text-orange-500">
                    <Palette size={12} />
                  </div>
                  Style
                </ContextMenuItem>

                <ContextMenuItem
                  className="focus:bg-zinc-800 focus:text-zinc-100"
                  onClick={() => handleAddNode("presets")}
                >
                  <div className="mr-2 flex size-5 items-center justify-center rounded bg-pink-900/50 text-pink-500">
                    <LayoutTemplate size={12} />
                  </div>
                  Presets
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>

            <ContextMenuSub>
              <ContextMenuSubTrigger className="focus:bg-zinc-800 focus:text-zinc-100">
                <Wrench size={14} className="mr-2" />
                Tools
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-56 border-zinc-800 bg-zinc-900 text-zinc-400">
                <ContextMenuItem
                  className="focus:bg-zinc-800 focus:text-zinc-100"
                  onClick={() => handleAddNode("colorCorrection")}
                >
                  <div className="mr-2 flex size-5 items-center justify-center rounded bg-amber-900/50 text-amber-500">
                    <Palette size={12} />
                  </div>
                  Color Correction
                </ContextMenuItem>

                <ContextMenuItem
                  className="focus:bg-zinc-800 focus:text-zinc-100"
                  onClick={() => handleAddNode("crop")}
                >
                  <div className="mr-2 flex size-5 items-center justify-center rounded bg-neutral-800/50 text-neutral-400">
                    <Crop size={12} />
                  </div>
                  Crop
                </ContextMenuItem>

                <ContextMenuItem
                  className="focus:bg-zinc-800 focus:text-zinc-100"
                  onClick={() => handleAddNode("sketch")}
                >
                  <div className="mr-2 flex size-5 items-center justify-center rounded bg-pink-900/50 text-pink-400">
                    <Brush size={12} />
                  </div>
                  Painter
                </ContextMenuItem>

                <ContextMenuItem
                  className="focus:bg-zinc-800 focus:text-zinc-100"
                  onClick={() => handleAddNode("upscale")}
                >
                  <div className="mr-2 flex size-5 items-center justify-center rounded bg-cyan-900/50 text-cyan-500">
                    <IconWindowMaximize size={12} />
                  </div>
                  Upscale
                </ContextMenuItem>

                <ContextMenuItem
                  className="focus:bg-zinc-800 focus:text-zinc-100"
                  onClick={() => handleAddNode("removeBackground")}
                >
                  <div className="mr-2 flex size-5 items-center justify-center rounded bg-rose-900/50 text-rose-400">
                    <Eraser size={12} />
                  </div>
                  Remove Background
                </ContextMenuItem>

                <ContextMenuItem
                  className="focus:bg-zinc-800 focus:text-zinc-100"
                  onClick={() =>
                    handleAddNode("group", {
                      zIndex: -1,
                      width: 400,
                      height: 400,
                      data: { label: "Group" },
                    })
                  }
                >
                  <div className="mr-2 flex size-5 items-center justify-center rounded bg-zinc-800/50 text-zinc-400">
                    <LayoutTemplate size={12} />
                  </div>
                  Group
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>

            <ContextMenuSeparator className="bg-zinc-800" />

            <ContextMenuSub>
              <ContextMenuSubTrigger className="focus:bg-zinc-800 focus:text-zinc-100">
                <div className="mr-2 flex size-5 items-center justify-center rounded bg-cyan-900/50 text-cyan-500">
                  <Sparkles size={12} />
                </div>
                AI Apps
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-64 border-zinc-800 bg-zinc-900 text-zinc-400">
                {AI_APPS.map((app) => (
                  <ContextMenuItem
                    key={app.id}
                    className="focus:bg-zinc-800 focus:text-zinc-100"
                    onClick={() => handleAddNode("aiApp", { data: { appData: app } })}
                  >
                    <div className="truncate">{app.app_name}</div>
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
