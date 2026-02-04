"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export const MobileHero = () => {
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
