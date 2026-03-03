import { motion } from "motion/react";
import { MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

interface ProjectCardProps {
  index: number;
  id: string;
  title: string;
  image: string;
  meta: string;
  isOwner: boolean;
  onOpen: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export function ProjectCard({
  index,
  id,
  title,
  image,
  meta,
  isOwner,
  onOpen,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 + 0.1 }}
      onClick={onOpen}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-white/5 bg-neutral-900/50 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-black/50"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
        <img
          src={image || "https://i.pinimg.com/736x/40/90/56/409056080e874008c724806708087480.jpg"}
          alt={title}
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-60 transition-opacity duration-300 group-hover:opacity-100" />

        {isOwner && (
          <div className="absolute right-3 top-3 translate-y-[-10px] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex size-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-colors hover:bg-black/80"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-40 rounded-xl border border-white/10 bg-neutral-900/90 text-neutral-200 backdrop-blur-xl"
              >
                <DropdownMenuItem
                  onClick={onEdit}
                  className="flex items-center gap-2 px-3 py-2 text-sm focus:bg-white/10"
                >
                  <Edit2 className="size-4" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 focus:bg-red-500/10 focus:text-red-400"
                >
                  <Trash2 className="size-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <div className="relative p-5">
        <div className="absolute -top-6 right-5 rounded-full border border-white/10 bg-neutral-900/80 px-3 py-1 text-xs text-neutral-400 backdrop-blur-md">
          {meta}
        </div>
        <h3 className="truncate text-lg font-semibold text-white transition-colors group-hover:text-purple-300">
          {title || "Untitled Project"}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-neutral-500 group-hover:text-neutral-400">
          Click to open canvas and continue editing.
        </p>
      </div>
    </motion.div>
  );
}
