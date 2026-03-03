import { motion } from "motion/react";
import { Sparkles, Edit2, Eye } from "lucide-react";

interface TemplateCardProps {
  index: number;
  id: string;
  title: string;
  image: string;
  category: string;
  isOwner: boolean;
  onOpen: () => void;
}

export function TemplateCard({
  index,
  id,
  title,
  image,
  category,
  isOwner,
  onOpen,
}: TemplateCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={onOpen}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-white/5 bg-neutral-900/50 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/30 hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)]"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
        <img
          src={image}
          alt={title}
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-60 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Categories/Permission badge */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {/* <span className="inline-flex items-center rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-xs font-medium text-neutral-300 backdrop-blur-md">
            {category}
          </span> */}
          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-md ${
              isOwner
                ? "border border-purple-500/40 bg-purple-500/20 text-purple-300"
                : "border border-white/10 bg-black/40 text-neutral-400"
            }`}
          >
            {isOwner ? (
              <>
                <Edit2 className="size-3" /> Mine
              </>
            ) : (
              <>
                <Eye className="size-3" /> View only
              </>
            )}
          </span>
        </div>

        {/* Read-only badge */}
        <div className="absolute right-3 top-3">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-xs font-medium text-neutral-400 backdrop-blur-md">
            <Sparkles className="size-3 text-purple-400" /> Template
          </span>
        </div>
      </div>

      <div className="relative p-5">
        <div className="absolute -top-5 right-5 rounded-full border border-purple-500/20 bg-purple-900/30 px-3 py-1 text-xs text-purple-400 backdrop-blur-md">
          Featured
        </div>
        <h3 className="truncate text-lg font-semibold text-white transition-colors group-hover:text-purple-300">
          {title}
        </h3>
        <p className="mt-1 text-sm text-neutral-500 group-hover:text-neutral-400">
          Use this template as a starting point.
        </p>
      </div>
    </motion.div>
  );
}
