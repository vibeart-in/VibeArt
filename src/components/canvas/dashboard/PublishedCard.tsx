import { Edit2, Eye } from "lucide-react";
import { motion } from "motion/react";

interface PublishedCardProps {
  index: number;
  id: string;
  title: string;
  image: string;
  updatedAt: string;
  isOwner: boolean;
  onOpen: () => void;
}

export function PublishedCard({
  index,
  id,
  title,
  image,
  updatedAt,
  isOwner,
  onOpen,
}: PublishedCardProps) {
  const formattedDate = new Date(updatedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={onOpen}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-white/5 bg-neutral-900/50 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-black/50"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
        <img
          src={image}
          alt={title}
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-60 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Permission badge */}
        <div className="absolute left-3 top-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-md ${
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
      </div>

      <div className="relative p-5">
        <div className="absolute -top-6 right-5 rounded-full border border-white/10 bg-neutral-900/80 px-3 py-1 text-xs text-neutral-400 backdrop-blur-md">
          {formattedDate}
        </div>
        <h3 className="truncate text-lg font-semibold text-white transition-colors group-hover:text-purple-300">
          {title || "Untitled Project"}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-neutral-500 group-hover:text-neutral-400">
          {isOwner ? "Your published canvas — click to edit." : "Community canvas — view only."}
        </p>
      </div>
    </motion.div>
  );
}
