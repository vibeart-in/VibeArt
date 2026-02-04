"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "../../../lib/utils";

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
