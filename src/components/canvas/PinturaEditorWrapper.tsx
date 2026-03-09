"use client";

import "@pqina/pintura/pintura.css";
import { getEditorDefaults } from "@pqina/pintura";
import { PinturaEditor } from "@pqina/react-pintura";
import { Download, Save, Loader2, X, Wand2 } from "lucide-react";
import React, { useRef, useState } from "react";
import pinturaCSS from "@pqina/pintura/pintura.module.css";
import styles from "@/src/app/index.module.css";

const pinturaTheme = styles.index;

interface PinturaEditorWrapperProps {
  src: string;
  onSaveCanvas: (blob: Blob) => Promise<void>;
  onClose: () => void;
}

// ─── Raw Color Matrices for Filter Presets ───────────────────────────────────
// Format: [r.r, r.g, r.b, r.a, r.o,  g.r, g.g, g.b, g.a, g.o,  b.r, b.g, b.b, b.a, b.o,  a.r, a.g, a.b, a.a, a.o]
const FILTERS: [number[] | undefined, string][] = [
  [undefined, "Original"],
  // B&W / Mono
  [
    [0.33, 0.34, 0.33, 0, 0, 0.33, 0.34, 0.33, 0, 0, 0.33, 0.34, 0.33, 0, 0, 0, 0, 0, 1, 0],
    "B&W",
  ],
  // Sepia
  [
    [0.393, 0.769, 0.189, 0, 0, 0.349, 0.686, 0.168, 0, 0, 0.272, 0.534, 0.131, 0, 0, 0, 0, 0, 1, 0],
    "Sepia",
  ],
  // Invert
  [
    [-1, 0, 0, 0, 1, 0, -1, 0, 0, 1, 0, 0, -1, 0, 1, 0, 0, 0, 1, 0],
    "Invert",
  ],
  // Chrome
  [
    [0.47, -0.29, 0.05, 0, 0.62, -0.12, 0.44, -0.04, 0, 0.71, -0.06, -0.06, 0.4, 0, 0.93, 0, 0, 0, 1, 0],
    "Chrome",
  ],
  // Fade
  [
    [1.07, -0.28, 0.07, 0, 0.07, -0.13, 1.07, 0.03, 0, 0.1, 0.02, -0.1, 0.78, 0, 0.1, 0, 0, 0, 1, 0],
    "Fade",
  ],
  // Warm
  [
    [1.2, 0, 0, 0, 0.1, 0, 1.0, 0, 0, 0, 0, 0, 0.8, 0, 0, 0, 0, 0, 1, 0],
    "Warm",
  ],
  // Cool
  [
    [0.8, 0, 0, 0, 0, 0, 1.0, 0, 0, 0.05, 0, 0, 1.2, 0, 0.1, 0, 0, 0, 1, 0],
    "Cool",
  ],
  // Vivid
  [
    [1.4, -0.2, 0, 0, 0, 0, 1.3, -0.1, 0, 0, 0, -0.1, 1.4, 0, 0, 0, 0, 0, 1, 0],
    "Vivid",
  ],
  // Matte
  [
    [0.8, 0.1, 0.1, 0, 0.05, 0.1, 0.75, 0.1, 0, 0.05, 0.1, 0.1, 0.7, 0, 0.05, 0, 0, 0, 1, 0],
    "Matte",
  ],
  // Dramatic
  [
    [1.5, -0.3, 0, 0, -0.1, 0, 1.2, -0.1, 0, -0.05, 0, -0.1, 1.3, 0, -0.1, 0, 0, 0, 1, 0],
    "Dramatic",
  ],
  // Golden Hour
  [
    [1.3, 0.1, 0, 0, 0.1, 0.05, 1.1, 0, 0, 0.05, 0, 0, 0.7, 0, 0, 0, 0, 0, 1, 0],
    "Golden",
  ],
  // Pastel
  [
    [0.75, 0.1, 0.1, 0, 0.1, 0.1, 0.75, 0.1, 0, 0.1, 0.1, 0.1, 0.8, 0, 0.1, 0, 0, 0, 1, 0],
    "Pastel",
  ],
  // Noir
  [
    [0.18, 0.72, 0.06, 0, -0.1, 0.18, 0.72, 0.06, 0, -0.1, 0.18, 0.72, 0.06, 0, -0.1, 0, 0, 0, 1, 0],
    "Noir",
  ],
  // Lomo
  [
    [1.1, 0.1, 0, 0, -0.1, 0, 1.0, 0.1, 0, -0.1, 0, 0.1, 1.2, 0, -0.15, 0, 0, 0, 1, 0],
    "Lomo",
  ],
];

// ─── Emoji Stickers ───────────────────────────────────────────────────────────
const EMOJI_STICKERS = [
  "😀", "😂", "🥰", "😎", "🤩", "🥳", "😍", "🤔", "😡", "🤯",
  "🎉", "🎊", "🎈", "🔥", "✨", "⭐", "💫", "🌈", "❤️", "💯",
  "👍", "👏", "🙌", "✌️", "💪", "🦋", "🌸", "🌺", "🌻", "🍀",
  "🚀", "💎", "🌙", "☀️", "⚡", "🎯", "🏆", "🎭", "🎨", "🖌️",
  "🐶", "🐱", "🦁", "🦊", "🐺", "🦋", "🌊", "🏔️", "🌅", "🎆",
];

// ─── Resize Presets ───────────────────────────────────────────────────────────
const RESIZE_PRESETS: [[number, number], string][] = [
  [[1280, 720], "HD 1280×720"],
  [[1920, 1080], "Full HD 1920×1080"],
  [[3840, 2160], "4K 3840×2160"],
  [[1024, 1024], "Square 1024×1024"],
  [[512, 512], "Square 512×512"],
  [[1080, 1080], "Instagram Post"],
  [[1080, 1920], "Instagram Story"],
  [[1500, 500], "Twitter Banner"],
  [[1280, 720], "YouTube Thumbnail"],
  [[851, 315], "Facebook Cover"],
  [[2480, 3508], "A4 Print"],
  [[1050, 600], "Business Card"],
];

export default function PinturaEditorWrapper({
  src,
  onSaveCanvas,
  onClose,
}: PinturaEditorWrapperProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const editorRef = useRef<any>(null);

  // All Pintura plugins + full configuration
  const editorConfig = getEditorDefaults({
    enableButtonExport: false,
    enableButtonClose: false,

    // ── Typography Fonts ──────────────────────────────────────────────────────
    // ── Typography Fonts ──────────────────────────────────────────────────────
    markupEditorFontFamilyOptions: [
      ["sans-serif", "Sans Serif"],
      ["serif", "Serif"],
      ["monospace", "Monospace"],
      ["'Inter', sans-serif", "Inter (Modern)"],
      ["'Playfair Display', serif", "Playfair (Elegant)"],
      ["'Outfit', sans-serif", "Outfit (Geometric)"],
      ["'Courier New', monospace", "Courier (Retro)"],
      ["'Comic Sans MS', cursive", "Comic (Playful)"],
      ["Impact, sans-serif", "Impact (Bold)"],
      ["'Brush Script MT', cursive", "Brush (Signature)"],
    ],

    // ── Markup tools (Brushes / Drawing / Mask / Typography) ──────────────────
    annotateActiveTool: "path", // Start with Brush/Path tool for illustration
    
    // Enable all tool panels including Retouch (Clone/Heal) and Redact (Blur/Pixelate)
    utils: [
      "crop",
      "finetune",
      "filter",
      "annotate",
      "redact",    // For hiding/pixelating (masking effects)
      "retouch",   // Clone stamp / healing brush (photoshop-level)
      "sticker",
      "frame",
      "resize",
    ],

    // ── Crop aspect ratio presets ────────────────────────────────────────────
    cropSelectPresetOptions: [
      [undefined, "Custom"],
      [1, "Square 1:1"],
      [4 / 3, "Landscape 4:3"],
      [3 / 4, "Portrait 3:4"],
      [16 / 9, "Widescreen 16:9"],
      [9 / 16, "Story 9:16"],
      [2 / 3, "Portrait 2:3"],
      [3 / 2, "Landscape 3:2"],
      [21 / 9, "Cinematic 21:9"],
      [1.414, "A4 Paper"],
    ],

    // ── Fine-tune sliders ─────────────────────────────────────────────────────
    // Using default fine-tune controls without custom ranges since Pintura handles them automatically
    finetuneControlConfiguration: undefined,

    // ── Filter presets (color matrices) ───────────────────────────────────────
    filterOptions: FILTERS,

    // ── Stickers (emoji) ───────────────────────────────────────────────────────
    stickerOptions: EMOJI_STICKERS,

    // ── Resize presets ─────────────────────────────────────────────────────────
    resizeOptions: RESIZE_PRESETS,
  });

  const handleSaveToCanvas = async () => {
    if (!editorRef.current) return;
    try {
      setIsProcessing(true);
      const res = await editorRef.current.editor.processImage();
      await onSaveCanvas(res.dest);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!editorRef.current) return;
    try {
      setIsProcessing(true);
      const res = await editorRef.current.editor.processImage();
      const url = URL.createObjectURL(res.dest);
      const a = document.createElement("a");
      a.href = url;
      a.download = `edited-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative flex size-full flex-col bg-[#0c0c0c]">

      {/* ── Top Bar ──────────────────────────────────────────────────────────── */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#111111] px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-accent/20">
            <Wand2 size={14} className="text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-none text-white">
              Image Editor
            </h2>
            <p className="mt-0.5 text-[10px] leading-none text-white/40">
              Crop · Finetune · Filters · Annotate · Stickers · Frames · Resize
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={isProcessing}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50"
          >
            <Download size={14} />
            Export
          </button>

          <button
            onClick={handleSaveToCanvas}
            disabled={isProcessing}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-accent/90 disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Save to Canvas
          </button>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="ml-1 flex size-8 items-center justify-center rounded-lg bg-white/8 text-white/60 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-50"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* ── Pintura Editor canvas ─────────────────────────────────────────────── */}
      <div className="relative flex-1 overflow-hidden">
        {isProcessing && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm">
            <Loader2 className="size-8 animate-spin text-accent" />
            <p className="text-sm font-medium text-white">Processing image…</p>
          </div>
        )}

        <PinturaEditor
          ref={editorRef}
          {...editorConfig}
          src={src}
          className={`${pinturaCSS} ${pinturaTheme} size-full`}
        />
      </div>
    </div>
  );
}
