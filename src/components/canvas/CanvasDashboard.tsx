"use client";

import {
  Plus,
  Search,
  LayoutGrid,
  List,
  MoreHorizontal,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Edit2,
  Trash2,
  Globe,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect, useRef } from "react";

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
import { Label } from "../ui/label";
import AnimatedGradientBackground from "../ui/animated-gradient-background";
import { BackgroundPlus } from "../ui/BackgroundPlus";
import { Input } from "../ui/input";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Project {
  id: string;
  title: string;
  edited: string;
  image: string;
}

interface PublishedProject {
  id: string;
  title: string;
  updated_at: string;
  user_id: string;
  image?: { url?: string } | null;
}

// ─── Static Templates Data ─────────────────────────



const STATIC_TEMPLATES = [
  {
    id: "cc758c9a-16d6-43e9-b0b7-bd2c64264515",
    title: "tvk",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas_images/cc758c9a-16d6-43e9-b0b7-bd2c64264515/thumbnail.jpg",
    user_id: "de3cd749-9c6e-4ab5-8827-a3f1fe47d9a3",
    category: "Template",
  },
  {
    id: "05925547-bf66-4072-a136-0456dcffbd1f",
    title: "Branding demo",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas_images/05925547-bf66-4072-a136-0456dcffbd1f/thumbnail.jpg",
    user_id: "3c40da91-b7c5-4d89-ae86-91180214e50e",
    category: "Template",
  },
  {
    id: "6cdce348-11fb-47e8-b659-bbd3a929ddfe",
    title: "summa",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas_images/cc758c9a-16d6-43e9-b0b7-bd2c64264515/thumbnail.jpg",
    user_id: "de3cd749-9c6e-4ab5-8827-a3f1fe47d9a3",
    category: "Template",
  },
  {
    id: "cc758c9a-16d6-43e9-b0b7-bd2c64264515",
    title: "tvk",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas_images/cc758c9a-16d6-43e9-b0b7-bd2c64264515/thumbnail.jpg",
    user_id: "de3cd749-9c6e-4ab5-8827-a3f1fe47d9a3",
    category: "Template",
  },
  {
    id: "05925547-bf66-4072-a136-0456dcffbd1f",
    title: "Branding demo",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas_images/05925547-bf66-4072-a136-0456dcffbd1f/thumbnail.jpg",
    user_id: "3c40da91-b7c5-4d89-ae86-91180214e50e",
    category: "Template",
  },
  {
    id: "6cdce348-11fb-47e8-b659-bbd3a929ddfe",
    title: "summa",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas_images/cc758c9a-16d6-43e9-b0b7-bd2c64264515/thumbnail.jpg",
    user_id: "de3cd749-9c6e-4ab5-8827-a3f1fe47d9a3",
    category: "Template",
  },
  {
    id: "cc758c9a-16d6-43e9-b0b7-bd2c64264515",
    title: "tvk",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas_images/cc758c9a-16d6-43e9-b0b7-bd2c64264515/thumbnail.jpg",
    user_id: "de3cd749-9c6e-4ab5-8827-a3f1fe47d9a3",
    category: "Template",
  },
  {
    id: "05925547-bf66-4072-a136-0456dcffbd1f",
    title: "Branding demo",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas_images/05925547-bf66-4072-a136-0456dcffbd1f/thumbnail.jpg",
    user_id: "3c40da91-b7c5-4d89-ae86-91180214e50e",
    category: "Template",
  },
  {
    id: "6cdce348-11fb-47e8-b659-bbd3a929ddfe",
    title: "summa",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas_images/cc758c9a-16d6-43e9-b0b7-bd2c64264515/thumbnail.jpg",
    user_id: "de3cd749-9c6e-4ab5-8827-a3f1fe47d9a3",
    category: "Template",
  },
];

// ─── Component ──────────────────────────────────────

interface CanvasDashboardProps {
  initialProjects: Project[];
  publishedProjects?: PublishedProject[];
  currentUserId?: string;
}

export default function CanvasDashboard({
  initialProjects,
  publishedProjects = [],
  currentUserId,
}: CanvasDashboardProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<"Projects" | "Community" | "Templates">("Projects");
  const [isPending, startTransition] = useTransition();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newCanvasTitle, setNewCanvasTitle] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollSlider = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let intervalId: NodeJS.Timeout;

    const startScroll = () => {
      intervalId = setInterval(() => {
        if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 10) {
          slider.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          slider.scrollBy({ left: 400, behavior: "smooth" });
        }
      }, 3000);
    };

    const pauseScroll = () => clearInterval(intervalId);

    startScroll();

    slider.addEventListener("mouseenter", pauseScroll);
    slider.addEventListener("mouseleave", startScroll);

    return () => {
      clearInterval(intervalId);
      slider.removeEventListener("mouseenter", pauseScroll);
      slider.removeEventListener("mouseleave", startScroll);
    };
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────────────────

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

  // ─── Filtered data ────────────────────────────────────────────────────────

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredPublished = publishedProjects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredTemplates = STATIC_TEMPLATES.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white selection:bg-purple-500/30">
      <div className="relative z-10 mx-auto max-w-[1800px] p-6 pt-24 md:p-8 lg:p-12">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative mb-16 overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-900/30 p-8 backdrop-blur-2xl md:p-16"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5" />
          <div className="absolute inset-0 ml-60 bg-[url('https://i.pinimg.com/1200x/c1/c4/dc/c1c4dc5e235f85579f4d51abc05a7259.jpg')] bg-cover bg-right opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          {/* <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 grayscale" /> */}
          <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md">
                <Sparkles className="size-4 text-accent/80" />
                <span className="text-sm font-medium text-accent/80">
                  AI-Powered Infinity Canvas
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="font-satoshi text-4xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
                  Where Ideas <br />
                  <span className="bg-gradient-to-r from-accent to-white bg-clip-text text-transparent">
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
                <button
                  onClick={() => setActiveTab("Community")}
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

        {/* ── WORKFLOW LIBRARY SLIDER ── */}
        <div className="mb-12" style={{backgroundColor:"#202020",padding:"25px 0px 25px 25px"}}>
          <div className="mb-4 flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">Templates</h2>
            <h2 className="text-xl font-medium text-neutral-500 hover:text-neutral-300 cursor-pointer transition-colors">
              Tutorials
            </h2>
          </div>
          <div className="relative group/slider -mx-6 md:-mx-8 lg:-mx-12 overflow-hidden px-6 md:px-8 lg:px-12">
            
            {/* Left Button */}
            <button
              onClick={() => scrollSlider("left")}
              className="absolute left-10 lg:left-16 top-1/2 -translate-y-1/2 z-20 flex size-10 items-center justify-center rounded-xl bg-neutral-800 text-white opacity-0 transition-all hover:bg-neutral-700 shadow-xl border border-white/10 backdrop-blur-md group-hover/slider:opacity-100 disabled:opacity-0"
            >
              <ArrowLeft className="size-5" />
            </button>

            {/* Right Button */}
            <button
              onClick={() => scrollSlider("right")}
              className="absolute right-10 lg:right-16 top-1/2 -translate-y-1/2 z-20 flex size-10 items-center justify-center rounded-xl bg-neutral-800 text-white transition-all hover:bg-neutral-700 shadow-xl border border-white/10 backdrop-blur-md disabled:opacity-0"
            >
              <ArrowRight className="size-5" />
            </button>

            <div 
              ref={sliderRef}
              className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {[...STATIC_TEMPLATES].map((item: any) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/canvas/${item.id}`)}
                  className="group relative h-48 w-72 cursor-pointer overflow-hidden rounded-2xl bg-neutral-800 transition-transform active:scale-95 flex-shrink-0 snap-center"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <span className="font-semibold text-white truncate max-w-[85%] text-sm">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex w-full items-center gap-1 rounded-2xl border border-white/10 bg-black/40 p-1.5 backdrop-blur-xl md:w-auto">
            {(["Projects", "Community", "Templates"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl px-6 py-2.5 text-sm font-medium transition-all ${
                  tab === activeTab
                    ? "bg-neutral-800 text-white shadow-lg"
                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {tab === "Community" && <Globe className="mr-1.5 inline size-3.5 align-[-1px]" />}
                {tab}
              </button>
            ))}
          </div>

          <div className="flex w-full items-center gap-4 md:w-auto">
            <div className="group relative flex-1 md:w-80">
              <Search className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-neutral-500 transition-colors group-focus-within:text-accent" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === "Projects"
                    ? "Search projects..."
                    : activeTab === "Community"
                      ? "Search community..."
                      : "Search templates..."
                }
                className="w-full rounded-2xl border border-white/10 bg-black/40 py-3 pl-11 pr-4 text-sm text-neutral-200 transition-all placeholder:text-neutral-600 focus:border-accent/50 focus:bg-black/60 focus:outline-none focus:ring-4 focus:ring-accent/10"
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

        {/* ── PROJECTS TAB ── */}
        {activeTab === "Projects" && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {/* New Canvas Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={handleNewCanvas}
              className="group relative aspect-video cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-black/40 transition-all duration-300 hover:border-accent/50 hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)] hover:ring-2 hover:ring-accent/20"
            >
              <BackgroundPlus
                className="opacity-20 transition-opacity duration-500 group-hover:opacity-40"
                plusColor="#A855F7"
                plusSize={40}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-neutral-400 transition-colors group-hover:text-accent">
                <div className="flex size-16 items-center justify-center rounded-full bg-white/5 shadow-inner backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-accent/20">
                  <Plus className="size-8 transition-transform duration-300 group-hover:rotate-90 group-hover:text-accent" />
                </div>
                <span className="font-medium tracking-wide">Create New Workflow</span>
              </div>
            </motion.div>

            {/* My Project Cards */}
            {filteredProjects.map((project, i) => (
              <ProjectCard
                key={project.id}
                index={i}
                id={project.id}
                title={project.title}
                image={project.image}
                meta={project.edited}
                isOwner={true}
                onOpen={() => router.push(`/canvas/${project.id}`)}
                onEdit={(e) => handleEditClick(project, e)}
                onDelete={(e) => handleDeleteClick(project, e)}
              />
            ))}
          </div>
        )}

        {/* ── COMMUNITY TAB ── */}
        {activeTab === "Community" && (
          <motion.div
            key="community"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {filteredPublished.length === 0 ? (
              <EmptyState
                icon={<Globe className="size-12 text-neutral-600" />}
                title="No published projects yet"
                subtitle="Be the first! Publish a canvas from the editor to share it here."
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {filteredPublished.map((project, i) => {
                  const isOwner = project.user_id === currentUserId;
                  const imageObj = Array.isArray(project.image) ? project.image[0] : project.image;
                  const imageUrl =
                    imageObj?.image_url ??
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/681px-Placeholder_view_vector.svg.png";

                  return (
                    <PublishedCard
                      key={project.id}
                      index={i}
                      id={project.id}
                      title={project.title}
                      image={imageUrl}
                      updatedAt={project.updated_at}
                      isOwner={isOwner}
                      onOpen={() => router.push(`/canvas/${project.id}`)}
                    />
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ── TEMPLATES TAB ── */}
        {activeTab === "Templates" && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="text-sm text-neutral-500">
                {filteredTemplates.length} starter templates — click to open on canvas
              </span>
            </div>

            {filteredTemplates.length === 0 ? (
              <EmptyState
                icon={<Search className="size-12 text-neutral-600" />}
                title="No templates match your search"
                subtitle="Try a different keyword."
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {filteredTemplates.map((tpl, i) => {
                  const isOwner = tpl.user_id === currentUserId;
                  const imageUrl = tpl.image;

                  return (
                    <TemplateCard
                      key={tpl.id}
                      index={i}
                      id={tpl.id}
                      title={tpl.title}
                      image={imageUrl}
                      category={tpl.category}
                      isOwner={isOwner}
                      onOpen={() => router.push(`/canvas/${tpl.id}`)}
                    />
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ── Create Canvas Dialog ── */}
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

            {/* <div className="grid gap-2">
              <Label htmlFor="desc" className="text-neutral-300">
                Description <span className="text-neutral-600">(Optional)</span>
              </Label>
              <Input
                id="desc"
                placeholder="What are you building today?"
                className="border-white/10 bg-black/50 text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-black/80 focus:ring-0"
              />
            </div> */}

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

      {/* ── Rename Dialog ── */}
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

      {/* ── Delete Dialog ── */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="border-white/10 bg-neutral-900/95 backdrop-blur-xl sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Delete Canvas?</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">{projectToDelete?.title}</span>? This
              action cannot be undone.
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
            <Button onClick={handleDeleteProject} disabled={isPending} className=" ">
              {isPending ? "Deleting..." : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Card for the user's own Projects tab */
function ProjectCard({
  index,
  id,
  title,
  image,
  meta,
  isOwner,
  onOpen,
  onEdit,
  onDelete,
}: {
  index: number;
  id: string;
  title: string;
  image: string;
  meta: string;
  isOwner: boolean;
  onOpen: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
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
          src={
            image ||
            "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/681px-Placeholder_view_vector.svg.png"
          }
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

/** Card for Community tab — published projects from all users */
function PublishedCard({
  index,
  id,
  title,
  image,
  updatedAt,
  isOwner,
  onOpen,
}: {
  index: number;
  id: string;
  title: string;
  image: string;
  updatedAt: string;
  isOwner: boolean;
  onOpen: () => void;
}) {
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

/** Card for Templates tab — static entries */
function TemplateCard({
  index,
  id,
  title,
  image,
  category,
  isOwner,
  onOpen,
}: {
  index: number;
  id: string;
  title: string;
  image: string;
  category: string;
  isOwner: boolean;
  onOpen: () => void;
}) {
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
          <span className="inline-flex items-center rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-xs font-medium text-neutral-300 backdrop-blur-md">
            {category}
          </span>
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

/** Empty state helper */
function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-white/5 bg-neutral-900/20 py-24 text-center">
      {icon}
      <h3 className="text-xl font-semibold text-neutral-300">{title}</h3>
      <p className="max-w-sm text-sm text-neutral-500">{subtitle}</p>
    </div>
  );
}
