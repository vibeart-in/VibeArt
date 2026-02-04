"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "../../../lib/utils";

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
