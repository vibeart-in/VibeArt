"use client";

import { useRouter } from "next/navigation";
import { Plus, Search, LayoutGrid, List, MoreHorizontal } from "lucide-react";
import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { createCanvas } from "@/src/actions/canvas";
import { formatDistanceToNow } from "date-fns";

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
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isPending, startTransition] = useTransition();

  const handleNewCanvas = () => {
    startTransition(async () => {
      try {
        const id = await createCanvas();
        router.push(`/canvas/${id}`);
      } catch (error) {
        console.error("Failed to create canvas", error);
        // You might want to show a toast here
      }
    });
  };

  return (
    <div className="min-h-screen bg-black p-8 pt-24 text-white">
      {/* Header Section */}
      <div className="mx-auto mb-12 max-w-7xl">
        <div className="relative mb-12 overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-r from-neutral-900 to-transparent p-8 md:p-12">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-80"
            style={{
              backgroundImage: `url('https://i.pinimg.com/1200x/4d/e1/b6/4de1b607182a586587a29b9d5dbb0136.jpg')`,
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent"></div>
          <div className="relative z-10 max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-white/10 p-2 backdrop-blur-md">
                <LayoutGrid className="h-6 w-6 text-blue-400" />
              </div>
              <h1 className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
                Canvas
              </h1>
            </div>
            <p className="mb-8 text-lg leading-relaxed text-neutral-400">
              Nodes is the most powerful way to operate vibeArt. Connect every tool and model into
              complex automized pipelines. Create a new space and start collaborating.
            </p>
            <button
              onClick={handleNewCanvas}
              disabled={isPending}
              className="group flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-black transition-all hover:bg-neutral-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
              <span>{isPending ? "Creating..." : "New Canvas"}</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex w-full items-center gap-4 rounded-xl border border-white/5 bg-neutral-900/50 p-1 pr-4 md:w-auto">
            <div className="flex gap-1 rounded-lg bg-neutral-800 p-1">
              <button className="rounded-md bg-neutral-700 px-4 py-1.5 text-sm font-medium text-white shadow-sm">
                Projects
              </button>
              <button className="rounded-md px-4 py-1.5 text-sm font-medium text-neutral-400 transition-colors hover:text-white">
                Apps
              </button>
              <button className="rounded-md px-4 py-1.5 text-sm font-medium text-neutral-400 transition-colors hover:text-white">
                Templates
              </button>
            </div>
          </div>

          <div className="flex w-full items-center gap-3 md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full rounded-xl border border-white/5 bg-neutral-900 py-2 pl-10 pr-4 text-sm transition-all placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/20"
              />
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-white/5 bg-neutral-900 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-lg p-2 transition-colors ${viewMode === "grid" ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white"}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-lg p-2 transition-colors ${viewMode === "list" ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* New Workflow Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleNewCanvas}
            className="group relative aspect-video cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-neutral-900/50 transition-all hover:border-white/10 hover:bg-neutral-900"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-neutral-500 transition-colors group-hover:text-white/80">
              <div className="rounded-full bg-neutral-800 p-4 transition-colors group-hover:bg-neutral-700">
                <Plus className="h-8 w-8" />
              </div>
              <span className="font-medium">New Workflow</span>
            </div>
          </motion.div>

          {/* Project Cards */}
          {initialProjects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 + 0.1 }}
              onClick={() => router.push(`/canvas/${project.id}`)}
              className="group flex cursor-pointer flex-col gap-3"
            >
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/5 bg-neutral-900">
                <img
                  src={
                    project.image ||
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/681px-Placeholder_view_vector.svg.png"
                  }
                  alt={project.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />

                {/* Overlay actions */}
                <div className="absolute right-2 top-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button className="rounded-lg bg-black/50 p-1.5 text-white backdrop-blur-md hover:bg-black/70">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="px-1">
                <h3 className="truncate font-medium text-white transition-colors group-hover:text-blue-400">
                  {project.title || "Untitled Project"}
                </h3>
                <p className="mt-1 text-xs text-neutral-500">{project.edited}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
