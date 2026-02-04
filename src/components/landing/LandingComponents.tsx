"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionTemplate, useMotionValue } from "framer-motion";
import { ArrowRight, Check, Star, Play, ShoppingBag, Layout, Camera, Share2, Monitor, Sparkles, ChevronDown, Flame } from "lucide-react";
import Link from "next/link";
import { cn } from "../../lib/utils";
import { AI_APPS } from "../../constants/aiApps";
import { ChevronLeft, ChevronRight } from "lucide-react";

// --- Hero Section ---



import { 
    ReactFlow, 
    Background, 
    Controls, 
    Handle, 
    Position, 
    Node, 
    Edge, 
    NodeProps, 
    ReactFlowProvider, 
    BackgroundVariant, 
    BaseEdge, 
    getSmoothStepPath, 
    EdgeProps, 
    EdgeLabelRenderer,
    useNodesState,
    useEdgesState
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AnimatePresence } from 'framer-motion';

// --- Custom Edge ---
const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 20,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <circle r="4" fill="#d9e92b">
        <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
      </circle>
    </>
  );
};

// --- Hero Section Nodes ---

const HeroTitleNode = ({ data }: any) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 w-[500px] relative">
       <Handle type="target" position={Position.Top} id="t-top" className="!bg-[#d9e92b] !h-3 !w-3 !border-none" />
       <Handle type="target" position={Position.Left} id="t-left" className="!bg-[#d9e92b] !h-3 !w-3 !border-none" />
       <Handle type="source" position={Position.Right} id="s-right" className="!bg-[#d9e92b] !h-3 !w-3 !border-none" />
       <Handle type="source" position={Position.Bottom} id="s-bottom" className="!bg-[#d9e92b] !h-3 !w-3 !border-none" />
       
       <motion.div
         initial={{ opacity: 0, scale: 0.9 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ duration: 0.5 }}
         className="text-center"
       >
         <h1 className="font-satoshi text-8xl font-black text-white md:text-9xl tracking-tighter drop-shadow-2xl leading-none">
            Vibe<span className="text-[#d9e92b]">Art</span>
         </h1>
         <p className="mt-4 text-xl font-light text-neutral-400 tracking-[0.2em] uppercase border-t border-white/10 pt-4">
            Interactive Generative Canvas
         </p>
       </motion.div>
    </div>
  );
};

const HeroAppCarouselNode = ({ data }: any) => {
    const apps = [
        { name: "Text to Image", icon: "🎨", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=60&w=100" },
        { name: "Image to Image", icon: "🖼️", img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=60&w=100" },
        { name: "Inpainting", icon: "✏️", img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=60&w=100" },
        { name: "Upscale", icon: "🔍", img: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=60&w=100" },
        { name: "Pose Control", icon: "🕺", img: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=60&w=100" },
    ];

    return (
        <div className="relative flex w-[320px] h-[400px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a]/90 shadow-2xl backdrop-blur-md group hover:border-[#d9e92b]/50 transition-colors">
            <Handle type="target" position={Position.Top} className="!bg-[#333] !h-2 !w-2 !border-none" />
            <Handle type="source" position={Position.Bottom} className="!bg-[#333] !h-2 !w-2 !border-none" />
            <Handle type="source" position={Position.Right} className="!bg-[#d9e92b] !h-3 !w-3 !border-none" />
            
            <div className="p-5 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/30" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/30" />
                    <div className="w-3 h-3 rounded-full bg-green-500/30" />
                    <span className="ml-auto text-[10px] font-mono text-neutral-500 uppercase tracking-tighter">AI_UNIT_V2</span>
                </div>
                <h3 className="mt-2 text-lg font-bold text-white tracking-tight">Advanced Modules</h3>
            </div>
            
            <div className="flex-1 overflow-hidden relative">
                <div className="absolute inset-0 flex flex-col gap-3 p-4 animate-scroll-vertical">
                    {[...apps, ...apps].map((app, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <img src={app.img} className="w-10 h-10 rounded-lg object-cover" alt="" />
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-white leading-none mb-1">{app.name}</span>
                                <span className="text-[10px] text-neutral-500 font-mono tracking-tighter uppercase">Processor Ready</span>
                            </div>
                            <span className="ml-auto text-lg">{app.icon}</span>
                        </div>
                    ))}
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a] pointer-events-none" />
            </div>
        </div>
    );
};

const HeroImageSlideshowNode = ({ data }: any) => {
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
        <div className="relative flex w-[300px] h-[400px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a]/90 shadow-2xl backdrop-blur-md group hover:border-[#d9e92b]/50 transition-colors">
             <Handle type="target" position={Position.Top} className="!bg-[#333] !h-2 !w-2 !border-none" />
             <Handle type="source" position={Position.Bottom} className="!bg-[#333] !h-2 !w-2 !border-none" />
             <Handle type="target" position={Position.Left} className="!bg-[#d9e92b] !h-3 !w-3 !border-none" />
             
             <div className="absolute inset-0">
                <AnimatePresence mode="wait">
                    <motion.img 
                        key={currentIndex}
                        src={images[currentIndex]}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="w-full h-full object-cover"
                        draggable={false}
                    />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent" />
             </div>

             <div className="absolute top-4 right-4 z-10">
                 <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#d9e92b] animate-pulse" />
                     <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live Gallery</span>
                 </div>
             </div>

             <div className="absolute bottom-6 left-6 right-6 z-10">
                 <div className="flex gap-1 mb-2">
                     {images.map((_, i) => (
                         <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i === currentIndex ? 'bg-[#d9e92b]' : 'bg-white/20'}`} />
                     ))}
                 </div>
                 <p className="text-white/80 text-[10px] font-mono uppercase tracking-widest text-center">Output Module</p>
             </div>
        </div>
    );
};

const HeroFireNode = ({ data }: any) => {
    return (
        <div className="flex flex-col items-center gap-3">
             <motion.div 
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 rounded-full bg-[#d9e92b] flex items-center justify-center shadow-[0_0_40px_rgba(217,233,43,0.3)]"
             >
                <Flame className="w-10 h-10 text-black fill-current" />
             </motion.div>
             <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-xs font-bold text-white uppercase tracking-tight">Trending Now</span>
             </div>
             <Handle type="source" position={Position.Bottom} className="!bg-[#d9e92b] !h-2 !w-2 !border-none" />
        </div>
    )
}

const HeroStatsNode = ({ data }: any) => {
    return (
        <div className="flex flex-col items-center justify-center p-6 rounded-3xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md min-w-[180px] shadow-2xl">
            <Handle type="target" position={Position.Top} className="!bg-[#333] !h-2 !w-2 !border-none" />
            <Handle type="source" position={Position.Bottom} className="!bg-[#333] !h-2 !w-2 !border-none" />
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <div className="text-4xl font-black text-[#d9e92b] mb-1">{data.value}</div>
                <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">{data.label}</div>
            </motion.div>
        </div>
    )
}

const HeroLabelNode = ({ data }: any) => {
    return (
        <div className="flex flex-col items-center gap-2">
            <Handle type="target" position={Position.Left} className="!bg-[#d9e92b] !h-2 !w-2 !border-none" />
            <div className={cn("px-6 py-2 rounded-full text-[10px] font-black text-white uppercase tracking-[0.3em] border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(217,233,43,0.2)]", data.color || "bg-white/5")}>
                {data.label}
            </div>
            <Handle type="source" position={Position.Right} className="!bg-[#d9e92b] !h-2 !w-2 !border-none" />
        </div>
    )
}

const HeroVideoNode = ({ data }: any) => {
    return (
        <div className="relative w-[350px] aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl group hover:border-[#d9e92b]/50 transition-colors">
            <video 
                src="https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/images/landing/demo-vid.mp4" 
                autoPlay 
                muted 
                loop 
                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-400 font-mono uppercase">Output Type</span>
                    <span className="text-sm font-bold text-white uppercase tracking-widest">Generative Video</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Play className="w-4 h-4 text-white fill-current" />
                </div>
            </div>
            <Handle type="target" position={Position.Top} className="!bg-[#d9e92b] !h-2 !w-2 !border-none" />
        </div>
    )
}

const HeroAppShowcaseNode = ({ data }: any) => {
    const appImages: Record<string, string> = {
        "0078075f-17eb-44d7-9b5c-94479a721437": "https://images.unsplash.com/photo-1614728263952-84ea206f99b6?auto=format&fit=crop&q=80&w=800", // Sticker
        "10677e8f-93bb-4f5a-9f4c-4ab2e5a5d89b": "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800", // Pikachu/Vibe
        "108fa3df-6a1a-460b-aecb-cd1f025d4534": "https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&q=80&w=800", // Upscale
        "12202b17-c024-49a9-a21a-2b17f40cc756": "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800", // Short film
        "15e3e3ee-27f9-4904-8055-caa00a92ec0e": "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=800", // Mecha
        "2e10a43b-ed29-4bdd-a298-091779a04b15": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800", // Girlfriend/Human
        "4bd9d235-697a-4ee6-b204-ed594b3fb34d": "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800", // Quick films
        "633bd8d5-e1ac-4314-bde8-125272928fa5": "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800", // 3D figurine
        "6e62ea85-4062-456d-9891-ee0ac56bb6c6": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800", // Character poses
        "7ca91622-4c0a-42f8-b4e4-dd2b51e0ca9e": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=800", // Pose transfer
        "aae47442-b5ec-4946-9b76-eb468d6f5d60": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800", // 360 camera
        "eda689e8-0683-4290-86c4-f973532305f1": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800", // Dance transfer
        "f5e56ab0-9137-43fb-82c1-876b217f9904": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800", // Anime to Real
    };

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % AI_APPS.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [AI_APPS.length]);

    const activeApp = AI_APPS[currentIndex];
    const activeImage = appImages[activeApp.id] || "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800";

    return (
        <div className="relative flex w-[400px] h-[550px] flex-col overflow-hidden rounded-[3rem] border border-white/10 bg-[#0a0a0a] shadow-[0_0_80px_rgba(217,233,43,0.1)] backdrop-blur-md">
            <Handle type="target" position={Position.Top} className="!bg-[#333] !h-2 !w-2 !border-none" />
            
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
                        className="w-full h-full object-cover opacity-60"
                        alt={activeApp.app_name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    
                    <div className="absolute bottom-12 left-10 right-10">
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <span className="h-1 w-6 bg-[#d9e92b] rounded-full" />
                                <span className="text-[10px] font-black text-[#d9e92b] uppercase tracking-[0.6em]">Pro Module</span>
                            </div>
                            <h3 className="text-4xl font-black text-white leading-[1.1] mb-6 drop-shadow-2xl">{activeApp.app_name}</h3>
                            <div className="flex items-center justify-between group/btn p-1 pl-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-[#d9e92b] hover:text-black transition-all duration-300">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white group-hover/btn:text-black">Launch App</span>
                                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center group-hover/btn:bg-black/10">
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="absolute top-10 left-10 flex gap-1.5">
                {AI_APPS.slice(0, 6).map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all duration-1000 ${i === currentIndex % 6 ? 'bg-[#d9e92b] w-8' : 'bg-white/10 w-4'}`} />
                ))}
            </div>
            
            <Handle type="source" position={Position.Bottom} className="!bg-[#d9e92b] !h-3 !w-3 !border-none" />
        </div>
    )
}

const HeroFeatureNode = ({ data }: any) => {
    return (
        <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md w-[220px] hover:bg-white/[0.05] transition-colors relative">
            <Handle type="source" position={Position.Top} className="!bg-[#333] !h-2 !w-2 !border-none" />
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${data.gradient || "from-purple-500 to-blue-500"} text-white shadow-lg`}>
                <data.icon className="h-5 w-5" />
            </div>
            <h4 className="text-lg font-bold text-white leading-tight mb-2">{data.title}</h4>
            <p className="text-xs text-neutral-400 leading-relaxed font-medium">{data.description}</p>
        </div>
    )
}

const nodeTypes: any = {
  heroTitle: HeroTitleNode,
  heroCarousel: HeroAppCarouselNode,
  heroSlideshow: HeroImageSlideshowNode,
  heroLabel: HeroLabelNode,
  heroStats: HeroStatsNode,
  heroFire: HeroFireNode,
  heroVideo: HeroVideoNode,
  heroFeature: HeroFeatureNode,
  heroShowcase: HeroAppShowcaseNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const initialNodes: Node[] = [
  // --- Center ---
  {
    id: 'title',
    type: 'heroTitle',
    position: { x: 432, y: 22 },
    data: { },
  },

  // --- Top Layer ---
  {
    id: 'fire-node',
    type: 'heroFire',
    position: { x: 620, y: -400 },
    data: { },
  },
  {
    id: 'stat-users',
    type: 'heroStats',
    position: { x: -300, y: -450 },
    data: { value: "120k+", label: "Creators" },
  },
  {
      id: 'stat-gen',
      type: 'heroStats',
      position: { x: 1500, y: -400 },
      data: { value: "2M+", label: "Generated" },
  },

  // --- Mid Layer ---
  {
    id: 'carousel',
    type: 'heroCarousel',
    position: { x: -310, y: 125 },
    data: { title: "AI Tools" },
  },
  {
    id: 'video-gen',
    type: 'heroVideo',
    position: { x: 508, y: 596 },
    data: { },
  },
  {
    id: 'slideshow',
    type: 'heroSlideshow',
    position: { x: 1564, y: 124 },
    data: { title: "Gallery" },
  },

  // --- Connection Labels ---
  {
    id: 'label-1',
    type: 'heroLabel',
    position: { x: 24, y: 578 },
    data: { label: "Input Modules", color: "bg-purple-600" },
  },
  {
    id: 'label-2',
    type: 'heroLabel',
    position: { x: 1386, y: -34 },
    data: { label: "Visual Output", color: "bg-[#d9e92b]/20" },
  },

  // --- Features ---
  {
    id: 'feature-1',
    type: 'heroFeature',
    position: { x: 64, y: -221 },
    data: { title: "Real-time Flow", description: "Experience generative art at the speed of thought.", icon: Sparkles, gradient: "from-yellow-400 to-orange-500" },
  },
  {
    id: 'feature-2',
    type: 'heroFeature',
    position: { x: 1074, y: -234 },
    data: { title: "Social Connect", description: "Instantly share your creations with the community.", icon: Share2, gradient: "from-blue-400 to-cyan-500" },
  },
  {
    id: 'app-showcase',
    type: 'heroShowcase',
    position: { x: -946, y: -80 },
    data: { },
  },
];

const initialEdges: Edge[] = [
  // Fire -> Title
  { id: 'e-fire-title', source: 'fire-node', target: 'title', targetHandle: 't-top', type: 'custom', animated: true, style: { stroke: '#d9e92b', strokeWidth: 2 } },
  
  // Carousel -> Label 1 -> Title
  { id: 'e-carousel-label1', source: 'carousel', sourceHandle: null, target: 'label-1', type: 'custom', animated: true, style: { stroke: '#d9e92b', strokeWidth: 2, opacity: 0.6 } },
  { id: 'e-label1-title', source: 'label-1', target: 'title', targetHandle: 't-left', type: 'custom', animated: true, style: { stroke: '#d9e92b', strokeWidth: 2, opacity: 0.6 } },
  
  // Title -> Label 2 -> Slideshow
  { id: 'e-title-label2', source: 'title', sourceHandle: 's-right', target: 'label-2', type: 'custom', animated: true, style: { stroke: '#d9e92b', strokeWidth: 2, opacity: 0.6 } },
  { id: 'e-label2-slideshow', source: 'label-2', target: 'slideshow', type: 'custom', animated: true, style: { stroke: '#d9e92b', strokeWidth: 2, opacity: 0.6 } },
  
  // Title -> Video
  { id: 'e-title-video', source: 'title', sourceHandle: 's-bottom', target: 'video-gen', type: 'custom', animated: true, style: { stroke: '#d9e92b', strokeWidth: 3, opacity: 0.8 } },
  
  // Stats
  { id: 'e-stat-c', source: 'stat-users', target: 'carousel', type: 'custom', animated: true, style: { stroke: '#333', strokeWidth: 1 } },
  { id: 'e-stat-s', source: 'stat-gen', target: 'slideshow', type: 'custom', animated: true, style: { stroke: '#333', strokeWidth: 1 } },

  // Features
  { id: 'e-f1-c', source: 'feature-1', target: 'carousel', type: 'custom', animated: true, style: { stroke: '#333', strokeWidth: 1, strokeDasharray: '5,5' } },
  { id: 'e-f2-s', source: 'feature-2', target: 'slideshow', type: 'custom', animated: true, style: { stroke: '#333', strokeWidth: 1, strokeDasharray: '5,5' } },

  // Showcase
  { id: 'e-showcase-carousel', source: 'app-showcase', target: 'carousel', type: 'custom', animated: true, style: { stroke: '#d9e92b', strokeWidth: 1, opacity: 0.4 } },
];

const MobileHero = () => {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-40 overflow-hidden bg-[#050505]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#d9e92b]/5 via-transparent to-transparent" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 text-center space-y-8"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                    <Sparkles className="w-4 h-4 text-[#d9e92b]" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest text-[#d9e92b]">Interactive Canvas</span>
                </div>

                <h1 className="font-satoshi text-6xl font-black text-white tracking-tighter leading-[0.9]">
                    Vibe<span className="text-[#d9e92b]">Art</span>
                </h1>

                <p className="max-w-xs mx-auto text-neutral-400 text-lg leading-relaxed font-light">
                    The ultimate AI playground. Create, Connect, and Generate in one seamless flow.
                </p>

                <div className="flex flex-col gap-4">
                    <Link href="/dashboard" className="px-8 py-4 rounded-2xl bg-white text-black font-bold text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        Get Started Free
                    </Link>
                    <Link href="/ai-apps" className="px-8 py-4 rounded-2xl border border-white/10 bg-white/5 text-white font-bold text-lg backdrop-blur-md">
                        Explore Apps
                    </Link>
                </div>
            </motion.div>

            {/* Floaties for Mobile */}
            <div className="absolute top-[20%] left-[5%] w-12 h-12 rounded-2xl bg-white/5 border border-white/10 animate-pulse rotate-12" />
            <div className="absolute bottom-[25%] right-[10%] w-16 h-16 rounded-full bg-[#d9e92b]/10 blur-xl animate-pulse" />
        </div>
    )
}

export const Hero = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);

            // Responsive positioning logic
            let scale = 1;
            if (width < 1000) scale = 0.5;
            else if (width < 1200) scale = 0.7;
            else if (width < 1500) scale = 0.85;
            
            const titleNode = initialNodes.find(n => n.id === 'title');
            const centerX = titleNode?.position.x || 500;
            
            const newNodes = initialNodes.map(node => {
                const newX = centerX + (node.position.x - centerX) * scale;
                return {
                    ...node,
                    position: {
                        x: newX,
                        y: node.position.y
                    }
                };
            });
            
            setNodes(newNodes);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [setNodes]);

    if (isMobile) {
        return <MobileHero />;
    }

    return (
        <section className="relative h-screen w-full bg-[#050505] overflow-hidden">
            <ReactFlowProvider>
                <div className="absolute inset-0 z-10">
                     <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        fitView
                        fitViewOptions={{ padding: 0.2 }}
                        panOnScroll={false}
                        zoomOnScroll={false}
                        zoomOnPinch={false}
                        zoomOnDoubleClick={false}
                        preventScrolling={false}
                        panOnDrag={false}
                        nodesDraggable={true} 
                        nodeExtent={[[-1500, -1000], [3000, 2000]]} 
                        translateExtent={[[-2000, -1500], [4000, 2500]]}
                        autoPanOnNodeDrag={false}
                        minZoom={0.2}
                        maxZoom={1}
                        proOptions={{ hideAttribution: true }}
                        className="bg-[#050505]"
                     >
                        <Background variant={BackgroundVariant.Dots} gap={30} size={1} color="#222" />
                     </ReactFlow>
                </div>
                
                 {/* Bottom Fade */}
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/50 to-transparent z-20 pointer-events-none" />
                
            </ReactFlowProvider>
        </section>
    );
};


const SparklesIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM6.97 11.03a.75.75 0 01.653 1.055 2.25 2.25 0 01-1.127 1.127.75.75 0 01-1.055-.653 2.25 2.25 0 011.127-1.127.75.75 0 01.402.59zM16.03 6.97a.75.75 0 011.055.653 2.25 2.25 0 01-1.127 1.127.75.75 0 01-.653-1.055 2.25 2.25 0 011.127-1.127.75.75 0 01.59-.402z" clipRule="evenodd" />
    </svg>
)

// --- Feature Section (Left/Right Cards) ---

interface FeatureCardProps {
  title: string;
  description: string;
  features: string[];
  imageSide: "left" | "right";
  gradient: string;
  badge?: string;
}

export const FeatureCard = ({ title, description, features, imageSide, gradient, badge }: FeatureCardProps) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden py-32 selection:bg-purple-500/30">
      <div className="container mx-auto px-4">
        <div className={cn(
            "flex flex-col items-center gap-20 lg:flex-row",
            imageSide === "right" ? "lg:flex-row" : "lg:flex-row-reverse"
        )}>
          
          {/* Text Content */}
          <motion.div
             style={{ opacity }}
             transition={{ duration: 0.7 }}
             className="flex-1 space-y-8"
          >
            {badge && (
                <span className="inline-block rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-xs font-bold tracking-wider text-white uppercase backdrop-blur-md">
                    {badge}
                </span>
            )}
            <h2 className="font-satoshi text-5xl font-bold leading-tight text-white md:text-6xl">{title}</h2>
            <p className="text-xl font-light text-neutral-400 leading-relaxed">{description}</p>
            
            <ul className="space-y-4 pt-4">
                {features.map((feature, i) => (
                    <motion.li 
                        key={i} 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-4 text-lg text-neutral-300"
                    >
                        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full shadow-lg", gradient)}>
                            <Check className="h-4 w-4 text-black stroke-[3px]" />
                        </div>
                        {feature}
                    </motion.li>
                ))}
            </ul>

            <button className="group mt-8 flex items-center gap-2 text-base font-bold text-white transition-colors hover:text-green-400">
                <span className="border-b border-white/30 pb-0.5 group-hover:border-green-400">Learn more</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

          {/* Image/Visual Content */}
          <motion.div 
            style={{ y }}
            className="flex-1 w-full"
          >
            <div className="group relative aspect-square w-full max-w-xl mx-auto overflow-hidden rounded-[2.5rem] bg-neutral-900 border border-white/10 shadow-2xl transition-all duration-500 hover:shadow-green-900/20">
                 {/* Visual Background */}
                 <div className={cn(
                     "absolute inset-0 opacity-20 transition-opacity duration-500 group-hover:opacity-30",
                     gradient
                 )} />
                 
                 {/* Abstract UI Mockup */}
                 <div className="absolute inset-0 p-10 flex flex-col">
                    <div className="flex-1 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-xl p-6 shadow-2xl transform transition-transform duration-500 group-hover:scale-[1.02]">
                         <div className="flex items-center gap-4 mb-8">
                             <div className="h-14 w-14 rounded-2xl bg-white/10 animate-pulse" />
                             <div className="space-y-3">
                                 <div className="h-3 w-32 rounded-full bg-white/10" />
                                 <div className="h-3 w-20 rounded-full bg-white/10" />
                             </div>
                         </div>
                         <div className="space-y-4">
                             <div className="h-32 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/5" />
                             <div className="grid grid-cols-2 gap-4">
                                 <div className="h-24 rounded-xl bg-white/5" />
                                 <div className="h-24 rounded-xl bg-white/5" />
                             </div>
                         </div>
                    </div>
                 </div>

                 {/* Floating Badges */}
                 <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-10 right-10 rounded-2xl bg-black/80 p-4 border border-white/10 backdrop-blur-xl shadow-xl"
                 >
                     <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                             <Check className="h-6 w-6 text-black" />
                         </div>
                         <div>
                             <div className="text-xs text-neutral-400">Status</div>
                             <div className="text-sm font-bold text-white">Optimized</div>
                         </div>
                     </div>
                 </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

// --- Grid Section ---
interface GridItemProps {
    icon: React.ElementType;
    title: string;
    description: string;
}

const GridItem = ({ icon: Icon, title, description }: GridItemProps) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
        }}
        className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-8 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05] hover:-translate-y-1"
    >
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-white transition-colors group-hover:bg-green-500 group-hover:text-black">
            <Icon className="h-7 w-7" />
        </div>
        <h3 className="mb-3 font-satoshi text-2xl font-bold text-white">{title}</h3>
        <p className="text-base text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors">{description}</p>
        
        <div className="absolute top-0 right-0 p-8 opacity-0 transition-opacity group-hover:opacity-100">
            <ArrowRight className="h-5 w-5 text-white -rotate-45" />
        </div>
    </motion.div>
)

export const FeaturesGrid = () => {
    return (
        <section className="py-32 bg-black relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <div className="container mx-auto px-4 text-center">
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20"
                 >
                     <span className="mb-4 inline-block text-sm font-bold tracking-widest text-green-500 uppercase">Use Cases</span>
                     <h2 className="font-satoshi text-4xl font-black text-white md:text-6xl">
                        Branding made ready for <br/> <span className="text-neutral-600">every occasion.</span>
                     </h2>
                 </motion.div>

                 <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ staggerChildren: 0.1 }}
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
                 >
                    <GridItem icon={ShoppingBag} title="Product Shots" description="High quality visuals for your store." />
                    <GridItem icon={Monitor} title="Websites" description="Assets optimized for web performance." />
                    <GridItem icon={Share2} title="Social Media" description="Engaging content for all platforms." />
                    <GridItem icon={Layout} title="Presentations" description="Stand out in your next pitch." />
                 </motion.div>
            </div>
        </section>
    )
}

// --- Testimonials Section ---
const testimonials = [
    {
        quote: "VibeArt transformed our marketing. We create assets in minutes now.",
        author: "Sarah J.",
        role: "Marketing Director",
        gradient: "from-green-500 to-emerald-700"
    },
    {
        quote: "The brand consistency tools are a game changer for our agency.",
        author: "Mark T.",
        role: "Creative Lead",
        gradient: "from-purple-500 to-indigo-700"
    },
    {
        quote: "Incredible quality. It feels like we have an in-house designer.",
        author: "Emily R.",
        role: "Founder",
        gradient: "from-pink-500 to-rose-700"
    }
]

export const TestimonialsSection = () => {
    return (
        <section className="py-32 bg-black relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute left-[10%] top-[20%] h-96 w-96 rounded-full bg-blue-500/10 blur-[100px]" />
            <div className="absolute right-[10%] bottom-[20%] h-96 w-96 rounded-full bg-purple-500/10 blur-[100px]" />

            <div className="container relative z-10 mx-auto px-4">
                <motion.h2 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mb-20 text-center font-satoshi text-4xl font-bold text-white md:text-5xl"
                >
                    Why businesses love VibeArt
                </motion.h2>
                <div className="grid gap-8 md:grid-cols-3">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -10 }}
                            transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
                            className="flex flex-col justify-between rounded-3xl border border-white/5 bg-white/5 p-10 backdrop-blur-sm transition-colors hover:bg-white/10 hover:border-white/10"
                        >
                            <div className="mb-8">
                                <div className="flex gap-1 text-yellow-400 mb-6">
                                    {[1,2,3,4,5].map(s => <Star key={s} className="h-5 w-5 fill-current" />)}
                                </div>
                                <p className="font-satoshi text-xl font-medium text-white leading-relaxed">"{t.quote}"</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className={cn("h-12 w-12 rounded-full flex items-center justify-center font-bold text-white text-lg bg-gradient-to-br shadow-lg", t.gradient)}>
                                    {t.author[0]}
                                </div>
                                <div>
                                    <div className="font-bold text-white text-lg">{t.author}</div>
                                    <div className="text-sm text-neutral-400">{t.role}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// --- Footer / CTA ---
export const FooterCTA = () => {
    return (
        <section className="relative overflow-hidden py-40 text-center">
            <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 via-black to-black" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
            
            <div className="container relative z-10 mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mx-auto max-w-4xl"
                >
                    <h2 className="mb-8 font-satoshi text-5xl font-black text-white md:text-8xl tracking-tight">
                        Bring Your Brand <br/> to Life
                    </h2>
                    <p className="mx-auto mb-12 max-w-xl text-xl text-neutral-400">
                        Join thousands of creators who are scaling their brand identity with VibeArt today.
                    </p>
                    <Link
                        href="/dashboard" 
                        className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-white px-10 py-5 text-xl font-bold text-black transition-transform hover:scale-105 active:scale-95"
                    >
                        <span>Get Started Free</span>
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}

// --- AI Apps Carousel ---
export const AiAppsCarousel = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = React.useState(false);

    // Auto-scroll effect
    React.useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer || isHovered) return;

        const scrollSpeed = 1; // pixels per frame
        let animationFrameId: number;

        const autoScroll = () => {
            if (scrollContainer) {
                scrollContainer.scrollLeft += scrollSpeed;
                
                // Reset to start when reaching the end for infinite loop
                if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
                    scrollContainer.scrollLeft = 0;
                }
            }
            animationFrameId = requestAnimationFrame(autoScroll);
        };

        animationFrameId = requestAnimationFrame(autoScroll);

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isHovered]);

    // Start auto-scroll after a delay to ensure DOM is ready
    React.useEffect(() => {
        // Small delay to ensure everything is mounted
        const timer = setTimeout(() => {
            if (scrollRef.current) {
                // Force a small scroll to "wake up" the scroll container
                scrollRef.current.scrollLeft = 1;
            }
        }, 100);
        
        return () => clearTimeout(timer);
    }, []);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === "left" ? -400 : 400;
            current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    // App-specific images (using unique gradients and patterns)
    const getAppVisuals = (index: number) => {
        const patterns = [
            { gradient: "from-purple-600 via-purple-800 to-blue-900", icon: "🎨" },
            { gradient: "from-green-600 via-teal-700 to-cyan-900", icon: "⚡" },
            { gradient: "from-pink-600 via-rose-700 to-red-900", icon: "✨" },
            { gradient: "from-orange-600 via-amber-700 to-yellow-900", icon: "🎯" },
            { gradient: "from-indigo-600 via-violet-700 to-purple-900", icon: "🚀" },
        ];
        return patterns[index % patterns.length];
    };

    return (
        <section className="relative py-32 bg-black overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            
            <div className="container relative z-10 mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16 text-center"
                >
                    <span className="mb-4 inline-block text-xs sm:text-sm font-bold tracking-widest text-[#d9e92b] uppercase">Explore</span>
                    <h2 className="font-satoshi text-3xl sm:text-4xl font-black text-white md:text-5xl lg:text-6xl">
                        AI Power <span className="bg-gradient-to-r from-[#d9e92b] to-[#d9e92b] bg-clip-text text-transparent">Tools</span>
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base md:text-lg text-neutral-400">
                        Transform your creativity with our suite of AI-powered applications
                    </p>
                </motion.div>

                {/* Carousel Container with Side Buttons */}
                <div 
                    className="relative"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Left Navigation Button - Hidden on mobile */}
                    <button 
                        onClick={() => scroll("left")}
                        className="hidden sm:flex absolute left-0 top-1/2 z-20 -translate-x-4 -translate-y-1/2 h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full border-2 border-white/10 bg-black/80 text-white backdrop-blur-xl transition-all hover:border-[#d9e92b]/50 hover:bg-[#d9e92b]/20 hover:scale-110 active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(250,204,21,0.4)]"
                    >
                        <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
                    </button>

                    {/* Right Navigation Button - Hidden on mobile */}
                    <button 
                        onClick={() => scroll("right")}
                        className="hidden sm:flex absolute right-0 top-1/2 z-20 translate-x-4 -translate-y-1/2 h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full border-2 border-white/10 bg-black/80 text-white backdrop-blur-xl transition-all hover:border-[#d9e92b]/50 hover:bg-[#d9e92b]/20 hover:scale-110 active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(250,204,21,0.4)]"
                    >
                        <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
                    </button>

                    {/* Scrollable Container */}
                    <div 
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto pb-8 px-2 scrollbar-hide snap-x"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {/* Duplicate items for seamless loop */}
                        {[...AI_APPS, ...AI_APPS].map((app, i) => {
                            const originalIndex = i % AI_APPS.length;
                            const visuals = getAppVisuals(originalIndex);
                            
                            return (
                                <motion.div
                                    key={`${app.id}-${i}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: (i % 5) * 0.05 }}
                                    className="flex-none w-[280px] sm:w-[300px] md:w-[320px] snap-start"
                                >
                                    <Link 
                                        href={`/ai-apps/${app.id}`}
                                        className="group block h-full"
                                    >
                                        <div className="h-full overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-2 transition-all duration-500 hover:border-[#d9e92b]/50 hover:shadow-[0_20px_60px_rgba(250,204,21,0.3)] hover:-translate-y-2">
                                            {/* Image Container */}
                                            <div className="relative h-72 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-neutral-900 to-black">
                                                {/* Animated Gradient Background */}
                                                <motion.div 
                                                    className={cn(
                                                        "absolute inset-0 bg-gradient-to-br opacity-50 transition-all duration-700 group-hover:opacity-70",
                                                        visuals.gradient
                                                    )}
                                                    animate={{
                                                        scale: [1, 1.1, 1],
                                                    }}
                                                    transition={{
                                                        duration: 8,
                                                        repeat: Infinity,
                                                        repeatType: "reverse"
                                                    }}
                                                />
                                                
                                                {/* Noise Texture Overlay */}
                                                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                                                
                                                {/* Geometric Pattern Overlay */}
                                                <div className="absolute inset-0 opacity-10">
                                                    <div className="h-full w-full" style={{
                                                        backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                                                        backgroundSize: '30px 30px'
                                                    }} />
                                                </div>
                                                
                                                {/* Center Content */}
                                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                                                    <motion.div 
                                                        className="relative mb-4"
                                                        whileHover={{ scale: 1.15, rotate: 5 }}
                                                        transition={{ type: "spring", stiffness: 300 }}
                                                    >
                                                        <div className="h-24 w-24 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
                                                            <span className="text-5xl">{visuals.icon}</span>
                                                        </div>
                                                        {/* Glow effect */}
                                                        <div className="absolute inset-0 rounded-3xl bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                    </motion.div>
                                                    
                                                    {/* App name on image */}
                                                    <div className="text-center">
                                                        <p className="font-satoshi font-bold text-white/90 text-sm line-clamp-2 drop-shadow-lg">
                                                            {app.app_name}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Badge */}
                                                <div className="absolute top-4 right-4 rounded-full bg-black/70 px-4 py-1.5 text-xs font-black tracking-wider text-white backdrop-blur-md border border-white/20 shadow-lg">
                                                    AI APP
                                                </div>

                                                {/* Corner accent */}
                                                <div className="absolute bottom-0 left-0 h-20 w-20 border-l-2 border-b-2 border-white/10 rounded-bl-[1.5rem]" />
                                                <div className="absolute top-0 right-0 h-20 w-20 border-r-2 border-t-2 border-white/10 rounded-tr-[1.5rem]" />
                                            </div>
                                            
                                            {/* Content */}
                                            <div className="p-6">
                                                <h3 className="mb-3 font-satoshi text-xl font-bold text-white line-clamp-2 min-h-[3.5rem] leading-tight">
                                                    {app.app_name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm font-bold text-neutral-400 group-hover:text-[#d9e92b] transition-colors">
                                                    <span>Try now</span>
                                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* View All Button */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-12 text-center"
                >
                    <Link
                        href="/ai-apps"
                        className="inline-flex items-center gap-3 rounded-full bg-white/5 px-8 py-4 font-bold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:shadow-[0_0_30px_rgba(250,204,21,0.3)] border border-white/10 hover:border-[#d9e92b]/50"
                    >
                        <span>View All Apps</span>
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}

// --- Sticky Prompt Input ---
export const StickyPromptInput = () => {
    const [prompt, setPrompt] = React.useState("");
    const [isFocused, setIsFocused] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            // Redirect to generate page with prompt
            window.location.href = `/generate?prompt=${encodeURIComponent(prompt)}`;
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 pb-4 px-4 sm:pb-6 sm:px-6">
            <div className="container mx-auto max-w-4xl">
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={cn(
                        "relative overflow-hidden rounded-2xl border-2 transition-all duration-300",
                        isFocused 
                            ? "border-yellow-500/50 shadow-[0_0_40px_rgba(250,204,21,0.4)]" 
                            : "border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                    )}
                >
                    {/* Background */}
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" />
                    
                    {/* Animated gradient border */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#d9e92b]/20 via-[#d9e92b]/20 to-yellow-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{
                        animation: isFocused ? "gradientShift 3s ease infinite" : "none"
                    }} />

                    <form onSubmit={handleSubmit} className="relative flex items-center gap-2 p-3 sm:p-4">
                        {/* Icon */}
                        <div className="flex-none">
                            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400">
                                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                        </div>

                        {/* Input */}
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="What would you like to create today?"
                            className="flex-1 bg-transparent font-satoshi text-sm sm:text-base text-white placeholder:text-neutral-500 outline-none"
                        />

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!prompt.trim()}
                            className="flex-none group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#d9e92b] to-[#d9e92b] px-4 sm:px-6 py-2 sm:py-3 font-bold text-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            <span className="relative z-10 text-sm sm:text-base">Generate</span>
                            <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                        </button>
                    </form>
                </motion.div>

                {/* Helper text */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-2 text-center text-xs sm:text-sm text-neutral-500 hidden sm:block"
                >
                    Press Enter or click Generate to start creating
                </motion.p>
            </div>
        </div>
    );
};

// Missing imports?
// import { Sparkles } from "lucide-react"; (Added inline icon to avoid confusion if library missing)

