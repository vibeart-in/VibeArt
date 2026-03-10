"use client";

import React, { useRef, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dotted-dialog";
import {
  X, Undo, Redo, ZoomIn, ZoomOut, Download,
  Crop, SlidersHorizontal, Type, Square, Smile, ImageIcon,
  Bold, Italic, Minus, Plus, Check, Move, Trash2,
} from "lucide-react";
import { useEditorMode } from "@/src/hooks/useEditorMode";

// ─── Shared Components ────────────────────────────────────────────────────────

function Slider({ label, value, min, max, step = 1, unit = "", onChange }: any) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px]">
        <span className="text-white/55">{label}</span>
        <span className="font-mono text-[#4f6ef7]">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#4f6ef7]" />
    </div>
  );
}

function SBtn({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick}
      className={`flex w-full flex-col items-center gap-1.5 rounded-xl px-1 py-2.5 transition-all ${active ? "bg-white/12 text-white" : "text-white/40 hover:bg-white/6 hover:text-white/70"}`}>
      <span className="text-lg">{icon}</span>
      <span className="text-[9px] font-medium">{label}</span>
    </button>
  );
}

const FILTER_PRESETS = [
  { id: "none",       label: "Original",   fabric: "none" },
  { id: "grayscale",  label: "B & W",      fabric: "grayscale" },
  { id: "sepia",      label: "Sepia",      fabric: "sepia" },
  { id: "invert",     label: "Invert",     fabric: "invert" },
  { id: "brightness", label: "Brighten",   fabric: "brightness" },
  { id: "contrast",   label: "Contrast",   fabric: "contrast" },
];

const COLORS = ["#ffffff","#000000","#ff3b6b","#0a84ff","#30d158","#ff9f0a","#bf5af2"];

// ─── Main Component ───────────────────────────────────────────────────────────

export function ImageEditorModal({ isOpen, onClose, mediaUrl, onSaveCanvas }: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElRef  = useRef<HTMLCanvasElement | null>(null);

  const [tool, setTool] = useState<any>("adjust");
  const [zoom, setZoom] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  // Settings
  const [textVal, setTextVal] = useState("Your text here");
  const [fill, setFill] = useState("#ff3b6b");

  // Hook - Image engine
  const { engine } = useEditorMode("image", canvasElRef.current, mediaUrl) as { engine: any };

  // Create canvas element inside DOM mount
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    if (!canvasElRef.current) {
      const el = document.createElement("canvas");
      // Default placeholder size, Fabric will auto-resize to image size
      el.width = 800; el.height = 600;
      containerRef.current.appendChild(el);
      canvasElRef.current = el;
    }
  }, [isOpen]);

  async function handleExport() {
    if (!engine) return;
    setIsExporting(true);
    const blob = await engine.exportPNG();
    if (blob) await onSaveCanvas(blob);
    setIsExporting(false);
  }

  function deleteSelected() {
    const c = engine?.canvas;
    if (!c) return;
    const active = c.getActiveObjects();
    if (active.length) {
      active.forEach((obj: any) => c.remove(obj));
      c.discardActiveObject();
      c.renderAll();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[97vh] max-w-none w-[99vw] flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#141414] p-0 shadow-2xl shadow-black sm:max-w-none">
        <DialogTitle className="hidden">Photo Editor</DialogTitle>

        {/* Top bar */}
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/[0.05] bg-[#1c1c1c] px-4">
          <div className="flex items-center gap-1">
            <button onClick={() => engine?.undo()} className="size-7 flex items-center justify-center rounded-lg text-white/40 hover:bg-white/8 hover:text-white"><Undo size={13}/></button>
            <button onClick={() => engine?.redo()} className="size-7 flex items-center justify-center rounded-lg text-white/40 hover:bg-white/8 hover:text-white"><Redo size={13}/></button>
          </div>
          <span className="absolute left-1/2 -translate-x-1/2 text-[12px] font-bold text-white/70">Photo Editor Pro</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-[11px] text-white/50">
               <button onClick={() => setZoom(z => Math.max(0.1, z-0.1))}><Minus size={12}/></button>
               <span className="w-8 text-center">{Math.round(zoom*100)}%</span>
               <button onClick={() => setZoom(z => Math.min(5, z+0.1))}><Plus size={12}/></button>
            </div>
            <button onClick={handleExport} disabled={isExporting} className="h-7 px-3 rounded-lg bg-[#4f6ef7] text-white text-[11px] font-bold hover:bg-[#3d5de5] transition">
              {isExporting ? "Saving..." : "Export Image"}
            </button>
            <button onClick={onClose} className="size-7 flex items-center justify-center rounded-lg text-white/30 hover:bg-white/8 hover:text-white"><X size={14}/></button>
          </div>
        </div>

        {/* Main body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-[68px] border-r border-white/[0.04] bg-[#1c1c1c] py-3 px-1 flex flex-col gap-0.5">
            <SBtn icon={<Move size={18}/>} label="Select" active={tool==="select"} onClick={() => setTool("select")}/>
            <SBtn icon={<SlidersHorizontal size={18}/>} label="Adjust" active={tool==="adjust"} onClick={() => setTool("adjust")}/>
            <SBtn icon={<ImageIcon size={18}/>} label="Filter" active={tool==="filter"} onClick={() => setTool("filter")}/>
            <SBtn icon={<Type size={18}/>} label="Text" active={tool==="text"} onClick={() => setTool("text")}/>
            <SBtn icon={<Square size={18}/>} label="Shapes" active={tool==="shapes"} onClick={() => setTool("shapes")}/>
            <SBtn icon={<Smile size={18}/>} label="Stickers" active={tool==="stickers"} onClick={() => setTool("stickers")}/>
          </div>

          {/* Panel */}
          <div className="w-[230px] border-r border-white/[0.04] bg-[#1c1c1c] overflow-y-auto">
            {tool === "select" && (
              <div className="p-4 space-y-4">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Selection</p>
                <div className="p-3 bg-white/5 rounded-xl text-[11px] text-white/40 space-y-2">
                  <p>• Click objects to select</p>
                  <p>• Drag corners to resize</p>
                  <p>• Drag center to move</p>
                </div>
                <button onClick={deleteSelected} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 text-red-500 text-[11px] hover:bg-red-500/20">
                  <Trash2 size={13}/> Delete Selected
                </button>
              </div>
            )}
            {tool === "text" && (
              <div className="p-4 space-y-4">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Typography</p>
                <textarea value={textVal} onChange={(e) => setTextVal(e.target.value)} className="w-full h-20 bg-white/5 rounded-xl border-none text-white text-sm p-3 focus:ring-1 focus:ring-[#4f6ef7]"/>
                <div className="flex flex-wrap gap-1.5">
                  {COLORS.map(c => <button key={c} onClick={() => setFill(c)} className={`size-6 rounded-lg ${fill===c?"ring-2 ring-white ring-offset-2 ring-offset-[#1c1c1c]":""}`} style={{backgroundColor:c}}/>)}
                </div>
                <button onClick={() => engine?.addText(textVal, { fill })} className="w-full py-2.5 rounded-xl bg-[#4f6ef7] text-white font-bold text-[11px]">Add Text Layer</button>
              </div>
            )}
            {tool === "shapes" && (
              <div className="p-4 space-y-4">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Shapes</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => engine?.addRect({ fill })} className="py-8 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10"><Square size={24}/></button>
                  <button onClick={() => engine?.addEllipse({ fill })} className="py-8 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10"><div className="size-6 border-2 border-white rounded-full"/></button>
                  <button onClick={() => engine?.addTriangle({ fill })} className="py-8 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10">🔺</button>
                  <button onClick={() => engine?.addStar(100, 100, fill)} className="py-8 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10">⭐</button>
                </div>
              </div>
            )}
            {tool === "filter" && (
              <div className="p-4 space-y-2">
                {FILTER_PRESETS.map(f => (
                  <button key={f.id} onClick={() => engine?.applyFilterToBackground(f.fabric)} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
                    <span className="text-xs text-white/70">{f.label}</span>
                    <Check size={12} className="text-[#4f6ef7] opacity-0"/>
                  </button>
                ))}
              </div>
            )}
            {tool === "adjust" && (
              <div className="p-4 space-y-5">
                <Slider label="Brightness" min={0.5} max={1.5} step={0.05} value={1} onChange={(v: any) => engine?.applyFilterToBackground("brightness", v)}/>
                <Slider label="Contrast"   min={0.5} max={1.5} step={0.05} value={1} onChange={(v: any) => engine?.applyFilterToBackground("contrast", v)}/>
                <button onClick={() => engine?.applyFilterToBackground("none")} className="w-full py-2 bg-white/5 rounded-xl text-[10px] text-white/40">Reset Styles</button>
              </div>
            )}
          </div>

          {/* Canvas display */}
          <div className="flex-1 bg-black/40 flex items-center justify-center overflow-hidden relative">
             <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(#fff 1px, transparent 1px)", backgroundSize:"20px 20px"}}/>
             <div ref={containerRef} className="shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-white/5" style={{ transform:`scale(${zoom})` }}/>
             {!engine?.isReady && <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                <Loader2 className="animate-spin text-[#4f6ef7] mb-2"/>
                <p className="text-[11px] text-white/40">Fabric.js - Initializing canvas engine...</p>
             </div>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Loader2(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
}
