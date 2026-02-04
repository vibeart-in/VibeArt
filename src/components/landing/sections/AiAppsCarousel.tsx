"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import { AI_APPS } from "../../../constants/aiApps";
import { cn } from "../../../lib/utils";

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
        const timer = setTimeout(() => {
            if (scrollRef.current) {
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

                <div 
                    className="relative"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <button 
                        onClick={() => scroll("left")}
                        className="hidden sm:flex absolute left-0 top-1/2 z-20 -translate-x-4 -translate-y-1/2 h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full border-2 border-white/10 bg-black/80 text-white backdrop-blur-xl transition-all hover:border-[#d9e92b]/50 hover:bg-[#d9e92b]/20 hover:scale-110 active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(250,204,21,0.4)]"
                    >
                        <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
                    </button>

                    <button 
                        onClick={() => scroll("right")}
                        className="hidden sm:flex absolute right-0 top-1/2 z-20 translate-x-4 -translate-y-1/2 h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full border-2 border-white/10 bg-black/80 text-white backdrop-blur-xl transition-all hover:border-[#d9e92b]/50 hover:bg-[#d9e92b]/20 hover:scale-110 active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(250,204,21,0.4)]"
                    >
                        <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
                    </button>

                    <div 
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto pb-8 px-2 scrollbar-hide snap-x"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
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
                                            <div className="relative h-72 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-neutral-900 to-black">
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
                                                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                                                <div className="absolute inset-0 opacity-10">
                                                    <div className="h-full w-full" style={{
                                                        backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                                                        backgroundSize: '30px 30px'
                                                    }} />
                                                </div>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                                                    <motion.div 
                                                        className="relative mb-4"
                                                        whileHover={{ scale: 1.15, rotate: 5 }}
                                                        transition={{ type: "spring", stiffness: 300 }}
                                                    >
                                                        <div className="h-24 w-24 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
                                                            <span className="text-5xl">{visuals.icon}</span>
                                                        </div>
                                                        <div className="absolute inset-0 rounded-3xl bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                    </motion.div>
                                                    <div className="text-center">
                                                        <p className="font-satoshi font-bold text-white/90 text-sm line-clamp-2 drop-shadow-lg">
                                                            {app.app_name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="absolute top-4 right-4 rounded-full bg-black/70 px-4 py-1.5 text-xs font-black tracking-wider text-white backdrop-blur-md border border-white/20 shadow-lg">
                                                    AI APP
                                                </div>
                                            </div>
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
