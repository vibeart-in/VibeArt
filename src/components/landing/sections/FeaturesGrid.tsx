"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Monitor, Share2, Layout } from "lucide-react";
import React from "react";

interface GridItemProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const GridItem = ({ icon: Icon, title, description }: GridItemProps) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
    className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05]"
  >
    <div className="mb-6 inline-flex size-14 items-center justify-center rounded-2xl bg-white/5 text-white transition-colors group-hover:bg-green-500 group-hover:text-black">
      <Icon className="size-7" />
    </div>
    <h3 className="mb-3 font-satoshi text-2xl font-bold text-white">{title}</h3>
    <p className="text-base leading-relaxed text-neutral-400 transition-colors group-hover:text-neutral-300">
      {description}
    </p>

    <div className="absolute right-0 top-0 p-8 opacity-0 transition-opacity group-hover:opacity-100">
      <ArrowRight className="size-5 -rotate-45 text-white" />
    </div>
  </motion.div>
);

export const FeaturesGrid = () => {
  return (
    <section className="relative bg-black py-32">
      <div className="absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <span className="mb-4 inline-block text-sm font-bold uppercase tracking-widest text-green-500">
            Use Cases
          </span>
          <h2 className="font-satoshi text-4xl font-black text-white md:text-6xl">
            Branding made ready for <br /> <span className="text-neutral-600">every occasion.</span>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.1 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <GridItem
            icon={ShoppingBag}
            title="Product Shots"
            description="High quality visuals for your store."
          />
          <GridItem
            icon={Monitor}
            title="Websites"
            description="Assets optimized for web performance."
          />
          <GridItem
            icon={Share2}
            title="Social Media"
            description="Engaging content for all platforms."
          />
          <GridItem
            icon={Layout}
            title="Presentations"
            description="Stand out in your next pitch."
          />
        </motion.div>
      </div>
    </section>
  );
};
