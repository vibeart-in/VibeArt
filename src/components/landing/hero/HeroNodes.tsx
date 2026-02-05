"use client";

import { Handle, Position } from "@xyflow/react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Play, ArrowRight } from "lucide-react";
import React, { useEffect, useState } from "react";

import { AI_APPS } from "../../../constants/aiApps";
import { cn } from "../../../lib/utils";

export const HeroTitleNode = ({ data }: any) => {
  return (
    <div className="relative flex w-[500px] flex-col items-center justify-center p-6">
      <Handle
        type="target"
        position={Position.Top}
        id="t-top"
        className="!h-3 !w-3 !border-none !bg-[#d9e92b]"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="t-left"
        className="!h-3 !w-3 !border-none !bg-[#d9e92b]"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="s-right"
        className="!h-3 !w-3 !border-none !bg-[#d9e92b]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="s-bottom"
        className="!h-3 !w-3 !border-none !bg-[#d9e92b]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="font-satoshi text-[50px] font-black leading-none tracking-tighter text-white drop-shadow-2xl md:text-[150px]">
          Vibe<span className="text-[#d9e92b]">Art</span>
        </h1>
        <p className="mt-4 border-t border-white/10 pt-4 text-[30px] font-light uppercase tracking-[0.2em] text-neutral-400">
          Interactive Generative Canvas
        </p>
      </motion.div>
    </div>
  );
};

export const HeroAppCarouselNode = ({ data }: any) => {
  const apps = [
    {
      name: "Text to Image",
      icon: "🎨",
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=60&w=100",
    },
    {
      name: "Image to Image",
      icon: "🖼️",
      img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=60&w=100",
    },
    {
      name: "Inpainting",
      icon: "✏️",
      img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=60&w=100",
    },
    {
      name: "Upscale",
      icon: "🔍",
      img: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=60&w=100",
    },
    {
      name: "Pose Control",
      icon: "🕺",
      img: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=60&w=100",
    },
  ];

  return (
    <div className="group relative flex h-[450px] w-[400px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a]/90 shadow-2xl backdrop-blur-md transition-colors hover:border-[#d9e92b]/50">
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-none !bg-[#333]" />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-none !bg-[#333]"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-none !bg-[#d9e92b]"
      />

      <div className="border-b border-white/5 bg-white/5 p-5">
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-red-500/30" />
          <div className="size-3 rounded-full bg-yellow-500/30" />
          <div className="size-3 rounded-full bg-green-500/30" />
          <span className="ml-auto font-mono text-[10px] uppercase tracking-tighter text-neutral-500">
            AI_UNIT_V2
          </span>
        </div>
        <h3 className="mt-2 text-lg font-bold tracking-tight text-white">Advanced Modules</h3>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div className="animate-scroll-vertical absolute inset-0 flex flex-col gap-3 p-4">
          {[...apps, ...apps].map((app, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-3 transition-colors hover:bg-white/10"
            >
              <img src={app.img} className="size-20 rounded-lg object-cover" alt="" />
              <div className="flex flex-col">
                <span className="mb-1 text-[25px] font-bold leading-none text-white">
                  {app.name}
                </span>
                <span className="font-mono text-[20px] uppercase tracking-tighter text-neutral-500">
                  Processor Ready
                </span>
              </div>
              <span className="ml-auto text-lg">{app.icon}</span>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
      </div>
    </div>
  );
};

export const HeroImageSlideshowNode = ({ data }: any) => {
  const images = [
    "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/canvas/5daa4c31fc80f9fb0694d395998ee3b2.jpg",
    "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/canvas/8a17b1c1dcebb918050eb417b343e3fd.jpg",
    "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/canvas/0e93297a700940733ba465244585645e.jpg",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="group relative flex h-[550px] w-[450px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a]/90 shadow-2xl backdrop-blur-md transition-colors hover:border-[#d9e92b]/50">
      <Handle type="target" position={Position.Top} className="!h-3 !w-3 !border-none !bg-[#333]" />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !border-none !bg-[#333]"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-none !bg-[#d9e92b]"
      />

      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="size-full object-cover"
            draggable={false}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent" />
      </div>

      <div className="absolute right-4 top-4 z-10">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-1 backdrop-blur-md">
          <div className="size-1.5 animate-pulse rounded-full bg-[#d9e92b]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-white">
            Live Gallery
          </span>
        </div>
      </div>

      <div className="absolute inset-x-6 bottom-6 z-10">
        <div className="mb-2 flex gap-1">
          {images.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i === currentIndex ? "bg-[#d9e92b]" : "bg-white/20"}`}
            />
          ))}
        </div>
        <p className="text-center font-mono text-[10px] uppercase tracking-widest text-white/80">
          Output Module
        </p>
      </div>
    </div>
  );
};

export const HeroFireNode = ({ data }: any) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="flex size-20 items-center justify-center rounded-full bg-[#d9e92b] shadow-[0_0_40px_rgba(217,233,43,0.3)]"
      >
        <Flame className="size-10 fill-current text-black" />
      </motion.div>
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
        <span className="text-[20px] font-bold uppercase tracking-tight text-white">
          Trending Now
        </span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-none !bg-[#d9e92b]"
      />
    </div>
  );
};

export const HeroStatsNode = ({ data }: any) => {
  return (
    <div className="flex min-w-[200px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#0a0a0a]/80 p-6 shadow-2xl backdrop-blur-md">
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-none !bg-[#333]" />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-none !bg-[#333]"
      />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mb-1 text-4xl font-black text-[#d9e92b]">{data.value}</div>
        <div className="text-[20px] font-bold uppercase tracking-[0.2em] text-neutral-500">
          {data.label}
        </div>
      </motion.div>
    </div>
  );
};

export const HeroLabelNode = ({ data }: any) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !border-none !bg-[#d9e92b]"
      />
      <div
        className={cn(
          "rounded-full border border-white/10 px-6 py-2 text-[20px] font-black uppercase tracking-[0.3em] text-white shadow-[0_0_20px_rgba(217,233,43,0.2)] backdrop-blur-md",
          data.color || "bg-white/5",
        )}
      >
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-none !bg-[#d9e92b]"
      />
    </div>
  );
};

export const HeroVideoNode = ({ data }: any) => {
  return (
    <div className="group relative aspect-video w-[450px] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl transition-colors hover:border-[#d9e92b]/50">
      <video
        src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/demo-vid.mp4"
        autoPlay
        muted
        loop
        className="size-full object-cover opacity-60 transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] uppercase text-neutral-400">Output Type</span>
          <span className="text-sm font-bold uppercase tracking-widest text-white">
            Generative Video
          </span>
        </div>
        <div className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
          <Play className="size-4 fill-current text-white" />
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-none !bg-[#d9e92b]"
      />
    </div>
  );
};

export const HeroAppShowcaseNode = ({ data }: any) => {
  const appImages: Record<string, string> = {
    "0078075f-17eb-44d7-9b5c-94479a721437":
      "https://images.unsplash.com/photo-1614728263952-84ea206f99b6?auto=format&fit=crop&q=80&w=800", // Sticker
    "10677e8f-93bb-4f5a-9f4c-4ab2e5a5d89b":
      "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800", // Pikachu/Vibe
    "108fa3df-6a1a-460b-aecb-cd1f025d4534":
      "https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&q=80&w=800", // Upscale
    "12202b17-c024-49a9-a21a-2b17f40cc756":
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800", // Short film
    "15e3e3ee-27f9-4904-8055-caa00a92ec0e":
      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=800", // Mecha
    "2e10a43b-ed29-4bdd-a298-091779a04b15":
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800", // Girlfriend/Human
    "4bd9d235-697a-4ee6-b204-ed594b3fb34d":
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800", // Quick films
    "633bd8d5-e1ac-4314-bde8-125272928fa5":
      "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800", // 3D figurine
    "6e62ea85-4062-456d-9891-ee0ac56bb6c6":
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800", // Character poses
    "7ca91622-4c0a-42f8-b4e4-dd2b51e0ca9e":
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=800", // Pose transfer
    "aae47442-b5ec-4946-9b76-eb468d6f5d60":
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800", // 360 camera
    "eda689e8-0683-4290-86c4-f973532305f1":
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800", // Dance transfer
    "f5e56ab0-9137-43fb-82c1-876b217f9904":
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800", // Anime to Real
  };

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % AI_APPS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [AI_APPS.length]);

  const activeApp = AI_APPS[currentIndex];
  const activeImage =
    appImages[activeApp.id] ||
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800";

  return (
    <div className="relative flex h-[600px] w-[500px] flex-col overflow-hidden rounded-[3rem] border border-white/10 bg-[#0a0a0a] shadow-[0_0_80px_rgba(217,233,43,0.1)] backdrop-blur-md">
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-none !bg-[#333]" />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeApp.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={activeImage}
            className="size-full object-cover opacity-60"
            alt={activeApp.app_name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          <div className="absolute inset-x-10 bottom-12">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="mb-4 flex items-center gap-2">
                <span className="h-1 w-6 rounded-full bg-[#d9e92b]" />
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-[#d9e92b]">
                  Pro Module
                </span>
              </div>
              <h3 className="mb-6 text-4xl font-black leading-[1.1] text-white drop-shadow-2xl">
                {activeApp.app_name}
              </h3>
              <div className="group/btn flex items-center justify-between rounded-full border border-white/10 bg-white/5 p-1 pl-4 backdrop-blur-md transition-all duration-300 hover:bg-[#d9e92b] hover:text-black">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white group-hover/btn:text-black">
                  Launch App
                </span>
                <div className="flex size-8 items-center justify-center rounded-full bg-white/10 group-hover/btn:bg-black/10">
                  <ArrowRight className="size-4" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute left-10 top-10 flex gap-1.5">
        {AI_APPS.slice(0, 6).map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-1000 ${i === currentIndex % 6 ? "w-8 bg-[#d9e92b]" : "w-4 bg-white/10"}`}
          />
        ))}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !border-none !bg-[#d9e92b]"
      />
    </div>
  );
};

export const HeroFeatureNode = ({ data }: any) => {
  return (
    <div className="relative w-[250px] rounded-2xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-md transition-colors hover:bg-white/[0.05]">
      <Handle type="source" position={Position.Top} className="!h-2 !w-2 !border-none !bg-[#333]" />
      <div
        className={`mb-3 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${data.gradient || "from-purple-500 to-blue-500"} text-white shadow-lg`}
      >
        <data.icon className="size-5" />
      </div>
      <h4 className="mb-2 text-[25px] font-bold leading-tight text-white">{data.title}</h4>
      <p className="text-[20px] font-medium leading-relaxed text-neutral-400">{data.description}</p>
    </div>
  );
};
