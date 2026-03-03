import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { BackgroundPlus } from "../../ui/BackgroundPlus";
import { ProjectCard } from "./ProjectCard";

interface Project {
  id: string;
  title: string;
  edited: string;
  image: string;
}

interface ProjectsTabProps {
  projects: Project[];
  onNewCanvas: () => void;
  onOpenProject: (id: string) => void;
  onEditProject: (project: Project, e: React.MouseEvent) => void;
  onDeleteProject: (project: Project, e: React.MouseEvent) => void;
}

export function ProjectsTab({
  projects,
  onNewCanvas,
  onOpenProject,
  onEditProject,
  onDeleteProject,
}: ProjectsTabProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {/* New Canvas Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        onClick={onNewCanvas}
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

      {/* Project Cards */}
      {projects.map((project, i) => (
        <ProjectCard
          key={project.id}
          index={i}
          id={project.id}
          title={project.title}
          image={project.image}
          meta={project.edited}
          isOwner={true}
          onOpen={() => onOpenProject(project.id)}
          onEdit={(e) => onEditProject(project, e)}
          onDelete={(e) => onDeleteProject(project, e)}
        />
      ))}
    </div>
  );
}
