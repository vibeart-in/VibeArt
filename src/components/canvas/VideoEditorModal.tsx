"use client";

import React, { useRef, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dotted-dialog";
import {
  X, Play, Pause, Volume2, VolumeX, SkipBack, SkipForward,
  Download, Plus, Scissors, Type, Music, Square, Smile,
  Film, AlignLeft, LayoutGrid, UploadCloud, Minus,
  Trash2, SlidersHorizontal, AlertCircle, CheckCircle2,
} from "lucide-react";

// ─── Shared Components ────────────────────────────────────────────────────────

function fmt(s: number) {
  if (!isFinite(s) || isNaN(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function AdjSlider({ label, value, min, max, onChange }: any) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px]">
        <span className="text-white/55">{label}</span>
        <span className="font-mono text-[#4f6ef7]">{value > 0 ? "+" : ""}{value}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
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

// ─── Types ───────────────────────────────────────────────────────────────────

interface TextTrack {
  id: string; text: string; color: string;
  start: number; end: number; posY: number; fontSize: number;
}

const COLORS = ["#ffffff","#000000","#ff3b6b","#0a84ff","#30d158","#ff9f0a","#bf5af2"];

// ─── Main Component ───────────────────────────────────────────────────────────

export function VideoEditorModal({ isOpen, onClose, mediaUrl, onSaveCanvas }: any) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Playback
  const [playing,     setPlaying]    = useState(false);
  const [muted,       setMuted]      = useState(false);
  const [volume,      setVolume]     = useState(80);
  const [currentTime, setCurTime]    = useState(0);
  const [duration,    setDuration]   = useState(0);

  // UI
  const [panel, setPanel] = useState<any>("text");
  const [zoom, setZoom]   = useState(60); // px per second
  const [isSaving, setIsSaving] = useState(false);

  // Tracks
  const [tracks, setTracks] = useState<TextTrack[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // CSS Filters
  const [brightness, setBrightness] = useState(100);
  const [contrast,   setContrast]   = useState(100);
  const [saturate,   setSaturate]   = useState(100);

  // ── Video Events ────────────────────────────────────────────────────────────

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onMeta = () => setDuration(v.duration);
    const onTime = () => setCurTime(v.currentTime);
    const onEnd  = () => setPlaying(false);
    
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("timeupdate",     onTime);
    v.addEventListener("ended",          onEnd);
    return () => {
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("timeupdate",     onTime);
      v.removeEventListener("ended",          onEnd);
    };
  }, [mediaUrl]);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  }

  function seekTo(t: number) {
    if (videoRef.current) videoRef.current.currentTime = Math.max(0, Math.min(t, duration));
  }

  // ── Track Logic ─────────────────────────────────────────────────────────────

  function addText() {
    const item: TextTrack = {
      id: `t-${Date.now()}`,
      text: "Double-click to edit",
      start: currentTime,
      end:   Math.min(currentTime + 5, duration),
      color: "#ffffff",
      posY:  0.8,
      fontSize: 32,
    };
    setTracks([...tracks, item]);
    setSelectedId(item.id);
  }

  function handleTimelineClick(e: React.MouseEvent) {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    seekTo(x / zoom);
  }

  // ── Export ──────────────────────────────────────────────────────────────────

  async function handleExport() {
    const v = videoRef.current;
    if (!v) return;
    setIsSaving(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width  = v.videoWidth;
      canvas.height = v.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Filter
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`;
      ctx.drawImage(v, 0, 0);

      // Overlays
      const active = tracks.filter(t => currentTime >= t.start && currentTime <= t.end);
      ctx.filter = "none";
      active.forEach(t => {
        ctx.fillStyle = t.color;
        ctx.font = `bold ${t.fontSize * (v.videoHeight / 500)}px Inter`;
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 10;
        ctx.fillText(t.text, canvas.width / 2, canvas.height * t.posY);
      });

      canvas.toBlob(async (blob) => {
        if (blob) await onSaveCanvas(blob);
        setIsSaving(false);
      }, "image/png");
    } catch (e) {
      console.error(e);
      setIsSaving(false);
    }
  }

  const activeOverlays = tracks.filter(t => currentTime >= t.start && currentTime <= t.end);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[97vh] max-w-none w-[99vw] flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#141414] p-0 shadow-2xl shadow-black sm:max-w-none">
        <DialogTitle className="hidden">Video Editor</DialogTitle>

        {/* Top bar */}
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/[0.05] bg-[#1c1c1c] px-4">
          <div className="flex items-center gap-3">
             <button onClick={onClose} className="size-7 flex items-center justify-center rounded-lg text-white/40 hover:bg-white/8 hover:text-white"><X size={14}/></button>
             <span className="text-[11px] font-bold text-[#4f6ef7] bg-[#4f6ef7]/10 px-2.5 py-1 rounded-full border border-[#4f6ef7]/20 flex items-center gap-1.5 animate-pulse">
                <div className="size-1.5 rounded-full bg-[#4f6ef7]"/> 
                FFmpeg Preview Ready
             </span>
          </div>
          <span className="absolute left-1/2 -translate-x-1/2 text-[12px] font-bold text-white/70">Video Editor Pro</span>
          <button onClick={handleExport} disabled={isSaving} className="h-7 px-4 rounded-lg bg-[#4f6ef7] text-white text-[11px] font-bold hover:bg-[#3d5de5] disabled:opacity-50 transition">
            {isSaving ? "Capturing..." : "Export Current Frame"}
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          <div className="w-[64px] border-r border-white/[0.04] bg-[#1c1c1c] py-3 px-1 flex flex-col gap-0.5">
             <SBtn icon={<Type size={18}/>} label="Text" active={panel==="text"} onClick={() => setPanel("text")}/>
             <SBtn icon={<SlidersHorizontal size={18}/>} label="Adjust" active={panel==="adjust"} onClick={() => setPanel("adjust")}/>
          </div>

          <div className="w-[215px] border-r border-white/[0.04] bg-[#1c1c1c] overflow-y-auto">
             {panel === "text" && (
                <div className="p-4 space-y-4">
                   <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Text Overlays</p>
                   {tracks.map(t => (
                      <div key={t.id} onClick={() => setSelectedId(t.id)} className={`p-3 rounded-xl cursor-pointer transition ${selectedId===t.id?"bg-[#4f6ef7]/20 ring-1 ring-[#4f6ef7]/40":"bg-white/5 hover:bg-white/10"}`}>
                         <input value={t.text} onChange={(e) => setTracks(prev => prev.map(pt => pt.id===t.id?{...pt, text:e.target.value}:pt))} className="w-full bg-transparent border-none text-white text-xs font-medium p-0 focus:ring-0"/>
                         <p className="text-[9px] text-white/30 mt-1">{fmt(t.start)} - {fmt(t.end)}</p>
                         {selectedId === t.id && (
                            <div className="mt-3 space-y-3 pt-3 border-t border-white/5">
                               <AdjSlider label="Position Y" value={Math.round(t.posY*100)} min={5} max={95} onChange={(v: any) => setTracks(prev => prev.map(pt => pt.id===t.id?{...pt, posY:v/100}:pt))}/>
                               <div className="flex gap-2">
                                  <button onClick={() => setTracks(prev => prev.filter(pt => pt.id!==t.id))} className="flex-1 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-[10px] hover:bg-red-500/20">Delete</button>
                               </div>
                            </div>
                         )}
                      </div>
                   ))}
                   <button onClick={addText} className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-[11px] font-bold hover:bg-white/8 transition">+ Add Text Layer</button>
                </div>
             )}
             {panel === "adjust" && (
                <div className="p-4 space-y-5">
                   <AdjSlider label="Brightness" value={brightness} min={50} max={200} onChange={setBrightness}/>
                   <AdjSlider label="Contrast"   value={contrast}   min={50} max={200} onChange={setContrast}/>
                   <AdjSlider label="Saturation" value={saturate}   min={0}  max={200} onChange={setSaturate}/>
                   <button onClick={() => { setBrightness(100); setContrast(100); setSaturate(100); }} className="w-full py-2 bg-white/5 rounded-lg text-[10px] text-white/40">Reset</button>
                </div>
             )}
          </div>

          <div className="flex-1 flex flex-col bg-black overflow-hidden relative">
             {/* Progress info */}
             <div className="flex justify-center flex-1 items-center relative min-h-0 bg-black">
                <div className="absolute inset-0 opacity-10" style={{backgroundImage:"linear-gradient(#4f6ef7 1px, transparent 1px), linear-gradient(90deg, #4f6ef7 1px, transparent 1px)", backgroundSize:"40px 40px"}}/>
                <video ref={videoRef} src={mediaUrl} className="max-h-full max-w-full z-10" style={{ filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)` }} />
                
                {/* Visual Overlays */}
                {activeOverlays.map(t => (
                  <div key={t.id} className="absolute z-20 w-full text-center font-bold px-10 pointer-events-none" style={{ top: `${t.posY*100}%`, color: t.color, fontSize: t.fontSize, textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
                     {t.text}
                  </div>
                ))}

                {/* Controls overlay */}
                <div className="absolute inset-x-0 bottom-4 z-30 flex items-center justify-center gap-6">
                   <button onClick={() => seekTo(currentTime - 5)} className="text-white/40 hover:text-white"><SkipBack size={20}/></button>
                   <button onClick={togglePlay} className="size-12 rounded-full bg-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition">
                      {playing ? <Pause size={20} className="text-black fill-black"/> : <Play size={20} className="text-black fill-black translate-x-0.5"/>}
                   </button>
                   <button onClick={() => seekTo(currentTime + 5)} className="text-white/40 hover:text-white"><SkipForward size={20}/></button>
                </div>
             </div>

             {/* Timeline Footer */}
             <div className="h-[180px] bg-[#1c1c1c] border-t border-white/[0.08] flex flex-col">
                <div className="h-9 border-b border-white/[0.04] bg-[#111] px-4 flex items-center justify-between">
                   <div className="flex items-center gap-4 text-[10px] text-white/40">
                      <span className="font-mono text-[#4f6ef7]">{fmt(currentTime)} / {fmt(duration)}</span>
                      <div className="flex items-center gap-1">
                        <Minus size={11} onClick={() => setZoom(z => Math.max(10, z-10))}/>
                        <div className="h-1 w-20 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-white/20" style={{width:`${zoom}%`}}/></div>
                        <Plus size={11} onClick={() => setZoom(z => Math.min(200, z+10))}/>
                      </div>
                   </div>
                </div>

                <div className="flex-1 overflow-x-auto overflow-y-auto relative no-scrollbar" ref={timelineRef} onClick={handleTimelineClick}>
                   <div className="min-w-full" style={{ width: (duration||60) * zoom, position: "relative" }}>
                      {/* Ruler */}
                      <div className="h-6 flex border-b border-white/[0.04]">
                         {Array.from({ length: Math.ceil(duration || 60) + 1 }).map((_, i) => (
                            <div key={i} className="absolute border-l border-white/10 h-full flex flex-col" style={{ left: i * zoom }}>
                               <span className="text-[9px] text-white/20 pl-1">{i}s</span>
                            </div>
                         ))}
                      </div>

                      {/* Tracks */}
                      <div className="p-2 space-y-1">
                         {tracks.map((t, idx) => (
                            <div key={t.id} className="h-7 relative flex items-center shadow-sm">
                               <div className="absolute h-full rounded-md flex items-center px-2 text-[10px] text-white font-medium select-none truncate"
                                  style={{ left: t.start * zoom, width: (t.end - t.start) * zoom, backgroundColor: idx%2===0?"rgba(79,110,247,0.5)":"rgba(191,90,242,0.5)" }}>
                                  {t.text}
                               </div>
                            </div>
                         ))}
                         {/* Video strip (placeholder) */}
                         <div className="h-12 relative bg-white/5 rounded-xl border border-white/5 overflow-hidden flex">
                            {Array.from({ length: 40 }).map((_, i) => (
                               <div key={i} className="h-full min-w-[50px] bg-cover bg-center border-r border-black/20 opacity-40" style={{ backgroundImage:`url(${mediaUrl})` }}/>
                            ))}
                         </div>
                      </div>

                      {/* Playhead */}
                      <div className="absolute top-0 bottom-0 w-px bg-[#4f6ef7] z-50 pointer-events-none" style={{ left: currentTime * zoom }}>
                         <div className="size-2.5 bg-[#4f6ef7] rotate-45 -translate-x-1/2 -mt-1.5"/>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
