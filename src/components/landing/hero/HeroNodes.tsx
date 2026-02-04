"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Play, ArrowRight } from "lucide-react";
import { Handle, Position } from '@xyflow/react';
import { cn } from "../../../lib/utils";
import { AI_APPS } from "../../../constants/aiApps";

export const HeroTitleNode = ({ data }: any) => {
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
         <h1 className="font-satoshi text-[50px] font-black text-white md:text-[150px] tracking-tighter drop-shadow-2xl leading-none">
            Vibe<span className="text-[#d9e92b]">Art</span>
         </h1>
         <p className="mt-4 text-[30px] font-light text-neutral-400 tracking-[0.2em] uppercase border-t border-white/10 pt-4">
            Interactive Generative Canvas
         </p>
       </motion.div>
    </div>
  );
};

export const HeroAppCarouselNode = ({ data }: any) => {
    const apps = [
        { name: "Text to Image", icon: "🎨", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=60&w=100" },
        { name: "Image to Image", icon: "🖼️", img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=60&w=100" },
        { name: "Inpainting", icon: "✏️", img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=60&w=100" },
        { name: "Upscale", icon: "🔍", img: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=60&w=100" },
        { name: "Pose Control", icon: "🕺", img: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=60&w=100" },
    ];

    return (
        <div className="relative flex w-[400px] h-[450px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a]/90 shadow-2xl backdrop-blur-md group hover:border-[#d9e92b]/50 transition-colors">
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
                            <img src={app.img} className="w-20 h-20 rounded-lg object-cover" alt="" />
                            <div className="flex flex-col">
                                <span className="text-[25px] font-bold text-white leading-none mb-1">{app.name}</span>
                                <span className="text-[20px] text-neutral-500 font-mono tracking-tighter uppercase">Processor Ready</span>
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
        <div className="relative flex w-[450px] h-[550px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a]/90 shadow-2xl backdrop-blur-md group hover:border-[#d9e92b]/50 transition-colors">
             <Handle type="target" position={Position.Top} className="!bg-[#333] !h-3 !w-3 !border-none" />
             <Handle type="source" position={Position.Bottom} className="!bg-[#333] !h-3 !w-3 !border-none" />
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

export const HeroFireNode = ({ data }: any) => {
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
                <span className="text-[20px] font-bold text-white uppercase tracking-tight">Trending Now</span>
             </div>
             <Handle type="source" position={Position.Bottom} className="!bg-[#d9e92b] !h-2 !w-2 !border-none" />
        </div>
    )
}

export const HeroStatsNode = ({ data }: any) => {
    return (
        <div className="flex flex-col items-center justify-center p-6 rounded-3xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md min-w-[200px] shadow-2xl">
            <Handle type="target" position={Position.Top} className="!bg-[#333] !h-2 !w-2 !border-none" />
            <Handle type="source" position={Position.Bottom} className="!bg-[#333] !h-2 !w-2 !border-none" />
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <div className="text-4xl font-black text-[#d9e92b] mb-1">{data.value}</div>
                <div className="text-[20px] font-bold text-neutral-500 uppercase tracking-[0.2em]">{data.label}</div>
            </motion.div>
        </div>
    )
}

export const HeroLabelNode = ({ data }: any) => {
    return (
        <div className="flex flex-col items-center gap-2">
            <Handle type="target" position={Position.Left} className="!bg-[#d9e92b] !h-2 !w-2 !border-none" />
            <div className={cn("px-6 py-2 rounded-full text-[20px] font-black text-white uppercase tracking-[0.3em] border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(217,233,43,0.2)]", data.color || "bg-white/5")}>
                {data.label}
            </div>
            <Handle type="source" position={Position.Right} className="!bg-[#d9e92b] !h-2 !w-2 !border-none" />
        </div>
    )
}

export const HeroVideoNode = ({ data }: any) => {
    return (
        <div className="relative w-[450px] aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl group hover:border-[#d9e92b]/50 transition-colors">
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

export const HeroAppShowcaseNode = ({ data }: any) => {
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
        <div className="relative flex w-[500px] h-[600px] flex-col overflow-hidden rounded-[3rem] border border-white/10 bg-[#0a0a0a] shadow-[0_0_80px_rgba(217,233,43,0.1)] backdrop-blur-md">
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

export const HeroFeatureNode = ({ data }: any) => {
    return (
        <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md w-[250px] hover:bg-white/[0.05] transition-colors relative">
            <Handle type="source" position={Position.Top} className="!bg-[#333] !h-2 !w-2 !border-none" />
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${data.gradient || "from-purple-500 to-blue-500"} text-white shadow-lg`}>
                <data.icon className="h-5 w-5" />
            </div>
            <h4 className="text-[25px] font-bold text-white leading-tight mb-2">{data.title}</h4>
            <p className="text-[20px] text-neutral-400 leading-relaxed font-medium">{data.description}</p>
        </div>
    )
}
