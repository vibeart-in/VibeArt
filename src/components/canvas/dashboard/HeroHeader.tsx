import { Plus, Sparkles, Globe, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface HeroHeaderProps {
  isPending: boolean;
  onCreateCanvas: () => void;
  onExploreCommunity: () => void;
}

export function HeroHeader({ isPending, onCreateCanvas, onExploreCommunity }: HeroHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative mb-16 overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/30 p-8 backdrop-blur-2xl md:p-16"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5" />
      <div className="absolute inset-0 ml-60 bg-[url('https://i.pinimg.com/1200x/c1/c4/dc/c1c4dc5e235f85579f4d51abc05a7259.jpg')] bg-cover bg-right opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />

      <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md">
            <Sparkles className="size-4 text-accent/80" />
            <span className="text-sm font-medium text-accent/80">AI-Powered Infinity Canvas</span>
          </div>

          <div className="space-y-4">
            <h1 className="font-satoshi text-4xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
              Where Ideas <br />
              <span className="bg-gradient-to-r from-accent to-white bg-clip-text text-transparent">
                Come Alive
              </span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-neutral-400 md:text-xl">
              Nodes is the most powerful way to operate vibeArt. Connect every tool and model into
              complex automized pipelines. Create a new space and start collaborating.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onCreateCanvas}
              disabled={isPending}
              className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 font-bold text-black transition-all hover:bg-neutral-200 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="relative z-10 flex items-center gap-2">
                <Plus className="size-5 transition-transform group-hover:rotate-90" />
                <span>{isPending ? "Creating..." : "Create Canvas"}</span>
              </div>
            </button>
            <button
              onClick={onExploreCommunity}
              className="flex items-center gap-2 rounded-full border border-white/10 px-8 py-4 font-semibold text-white transition-colors hover:bg-white/5"
            >
              <Globe className="size-4" />
              <span>Explore Community</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
