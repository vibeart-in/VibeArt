"use client";

import {
  Plus,
  Search,
  LayoutGrid,
  List,
  MoreHorizontal,
  Sparkles,
  ArrowRight,
  Edit2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";

import { createCanvas, updateCanvas, deleteCanvas } from "@/src/actions/canvas";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dotted-dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import AnimatedGradientBackground from "../ui/animated-gradient-background";
import { BackgroundPlus } from "../ui/BackgroundPlus";

interface Project {
  id: string;
  title: string;
  edited: string;
  image: string;
}

interface CanvasDashboardProps {
  initialProjects: Project[];
}

export default function CanvasDashboard({ initialProjects }: CanvasDashboardProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  // Sync with server data if it updates
  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isPending, startTransition] = useTransition();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newCanvasTitle, setNewCanvasTitle] = useState("");

  const handleNewCanvas = () => {
    setNewCanvasTitle("");
    setIsDialogOpen(true);
  };

  const createProject = () => {
    if (!newCanvasTitle.trim()) return;

    startTransition(async () => {
      try {
        const id = await createCanvas(newCanvasTitle);
        router.push(`/canvas/${id}`);
        setIsDialogOpen(false);
      } catch (error) {
        console.error("Failed to create canvas", error);
      }
    });
  };

  // --- Edit Handlers ---
  const handleEditClick = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToEdit(project);
    setEditTitle(project.title);
    setIsRenameDialogOpen(true);
  };

  const handleRenameProject = () => {
    if (!projectToEdit || !editTitle.trim()) return;

    startTransition(async () => {
      try {
        await updateCanvas(projectToEdit.id, { title: editTitle });

        // Update local state
        setProjects((prev) =>
          prev.map((p) => (p.id === projectToEdit.id ? { ...p, title: editTitle } : p)),
        );

        setProjectToEdit(null);
        setIsRenameDialogOpen(false);
        toast.success("Project renamed successfully");
      } catch (error) {
        console.error("Failed to update canvas", error);
        toast.error("Failed to rename project");
      }
    });
  };

  // --- Delete Handlers ---
  const handleDeleteClick = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteProject = () => {
    if (!projectToDelete) return;

    startTransition(async () => {
      try {
        await deleteCanvas(projectToDelete.id);

        // Update local state
        setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));

        setProjectToDelete(null);
        setIsDeleteDialogOpen(false);
        toast.success("Project deleted successfully");
      } catch (error) {
        console.error("Failed to delete canvas", error);
        toast.error("Failed to delete project. Please try again.");
      }
    });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white selection:bg-purple-500/30">
      <AnimatedGradientBackground
        gradientColors={["#000000", "#1c1c1c", "#111111", "#050505", "#0a0a0a",  "#050505", "#0a0a0a"]}
        animationSpeed={0.005}
        containerClassName="opacity-40"
      />

      <div className="relative z-10 mx-auto max-w-[1800px] p-6 pt-24 md:p-8 lg:p-12">
        {/* Hero Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative mb-16 overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/30 p-8 backdrop-blur-2xl md:p-16"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 grayscale" />

          <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md">
                <Sparkles className="size-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-100">
                  AI-Powered Infinity Canvas
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
                  Where Ideas <br />
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                    Come Alive
                  </span>
                </h1>
                <p className="max-w-xl text-lg leading-relaxed text-neutral-400 md:text-xl">
                  Nodes is the most powerful way to operate vibeArt. Connect every tool and model
                  into complex automized pipelines. Create a new space and start collaborating.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={handleNewCanvas}
                  disabled={isPending}
                  className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 font-bold text-black transition-all hover:bg-neutral-200 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="relative z-10 flex items-center gap-2">
                    <Plus className="size-5 transition-transform group-hover:rotate-90" />
                    <span>{isPending ? "Creating..." : "Create Canvas"}</span>
                  </div>
                </button>
                <button className="flex items-center gap-2 rounded-full border border-white/10 px-8 py-4 font-semibold text-white transition-colors hover:bg-white/5">
                  <span>Explore Templates</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>

            {/* Visual Decoration Right Side (Optional) */}
            <div className="relative hidden w-full justify-end lg:flex">
              <div className="relative aspect-square w-96 rounded-full bg-gradient-to-tr from-purple-500/20 to-blue-500/20 blur-3xl filter" />
              <div className="absolute right-10 top-1/2 -translate-y-1/2">
                {/* Abstract shape or decoration could go here */}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Toolbar */}
        <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex w-full items-center gap-1 rounded-2xl border border-white/10 bg-black/40 p-1.5 backdrop-blur-xl md:w-auto">
            {["Projects", "Apps", "Templates"].map((tab) => (
              <button
                key={tab}
                className={`rounded-xl px-6 py-2.5 text-sm font-medium transition-all ${
                  tab === "Projects"
                    ? "bg-neutral-800 text-white shadow-lg"
                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex w-full items-center gap-4 md:w-auto">
            <div className="group relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-500 transition-colors group-focus-within:text-purple-400" />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full rounded-2xl border border-white/10 bg-black/40 py-3 pl-11 pr-4 text-sm text-neutral-200 transition-all placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-black/60 focus:outline-none focus:ring-4 focus:ring-purple-500/10"
              />
            </div>

            <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-black/40 p-1.5 backdrop-blur-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-xl p-2.5 transition-colors ${
                  viewMode === "grid"
                    ? "bg-neutral-800 text-white shadow-md"
                    : "text-neutral-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                <LayoutGrid className="size-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-xl p-2.5 transition-colors ${
                  viewMode === "list"
                    ? "bg-neutral-800 text-white shadow-md"
                    : "text-neutral-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                <List className="size-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {/* New Workflow Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            onClick={handleNewCanvas}
            className="group relative aspect-video cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-black/40 transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)] hover:ring-2 hover:ring-purple-500/20"
          >
            <BackgroundPlus
              className="opacity-20 transition-opacity duration-500 group-hover:opacity-40"
              plusColor="#A855F7"
              plusSize={40}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-neutral-400 transition-colors group-hover:text-purple-300">
              <div className="flex size-16 items-center justify-center rounded-full bg-white/5 shadow-inner backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-500/20">
                <Plus className="size-8 transition-transform duration-300 group-hover:rotate-90 group-hover:text-purple-400" />
              </div>
              <span className="font-medium tracking-wide">Create New Workflow</span>
            </div>
          </motion.div>

          {/* Project Cards */}
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 + 0.1 }}
              onClick={() => router.push(`/canvas/${project.id}`)}
              className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-white/5 bg-neutral-900/50 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-black/50"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                <img
                  src={
                    project.image ||
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/681px-Placeholder_view_vector.svg.png"
                  }
                  alt={project.title}
                  className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-60 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Overlay actions */}
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
                        onClick={(e) => handleEditClick(project, e)}
                        className="flex items-center gap-2 px-3 py-2 text-sm focus:bg-white/10"
                      >
                        <Edit2 className="size-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem
                        onClick={(e) => handleDeleteClick(project, e)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 focus:bg-red-500/10 focus:text-red-400"
                      >
                        <Trash2 className="size-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="relative p-5">
                <div className="absolute -top-6 right-5 rounded-full border border-white/10 bg-neutral-900/80 px-3 py-1 text-xs text-neutral-400 backdrop-blur-md">
                  {project.edited}
                </div>

                <h3 className="truncate text-lg font-semibold text-white transition-colors group-hover:text-purple-300">
                  {project.title || "Untitled Project"}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-neutral-500 group-hover:text-neutral-400">
                  Click to open canvas and continue editing.
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-white/10 bg-neutral-900/95 backdrop-blur-xl sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Create New Canvas</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Enter the details for your new project. Click create when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-neutral-300">
                Project Name
              </Label>
              <Input
                id="name"
                value={newCanvasTitle}
                onChange={(e) => setNewCanvasTitle(e.target.value)}
                placeholder="My Awesome Project"
                className="border-white/10 bg-black/50 text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-black/80 focus:ring-0"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="desc" className="text-neutral-300">
                Description <span className="text-neutral-600">(Optional)</span>
              </Label>
              <Input
                id="desc"
                placeholder="What are you building today?"
                className="border-white/10 bg-black/50 text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-black/80 focus:ring-0"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="visibility" className="text-neutral-300">
                Visibility
              </Label>
              <div className="relative">
                <select
                  id="visibility"
                  className="flex h-10 w-full appearance-none rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option>Private</option>
                  <option>Public</option>
                  <option>Team</option>
                </select>
                {/* Custom arrow could go here */}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
              className="text-neutral-400 hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={createProject}
              disabled={isPending || !newCanvasTitle.trim()}
              className="bg-white text-black hover:bg-neutral-200"
            >
              {isPending ? "Creating..." : "Create Canvas"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="border-white/10 bg-neutral-900/95 backdrop-blur-xl sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Rename Project</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Change the name of your canvas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label htmlFor="rename" className="text-neutral-300">
                Project Name
              </Label>
              <Input
                id="rename"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Project Name"
                className="border-white/10 bg-black/50 text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-black/80 focus:ring-0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsRenameDialogOpen(false)}
              className="text-neutral-400 hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameProject}
              disabled={isPending || !editTitle.trim()}
              className="bg-white text-black hover:bg-neutral-200"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="border-white/10 bg-neutral-900/95 backdrop-blur-xl sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Delete Canvas?</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Are you sure you want to delete <span className="font-semibold text-white">{projectToDelete?.title}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="text-neutral-400 hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteProject}
              disabled={isPending}
              className="  "
            >
              {isPending ? "Deleting..." : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
