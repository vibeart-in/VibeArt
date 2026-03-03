"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";

import { createCanvas, updateCanvas, deleteCanvas } from "@/src/actions/canvas";

import {
  HeroHeader,
  TemplatesSlider,
  DashboardToolbar,
  ProjectsTab,
  CommunityTab,
  TemplatesTab,
  CanvasDialogs,
} from "./dashboard";

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

// ─── Static Templates Data ─────────────────────────────

const STATIC_TEMPLATES = [
  {
    id: "05925547-bf66-4072-a136-0456dcffbd1f",
    title: "Branding demo",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/05925547-bf66-4072-a136-0456dcffbd1f/e6c19a4e-d941-485b-bc21-0b19f84b9fa0/0.jpeg",
    user_id: "3c40da91-b7c5-4d89-ae86-91180214e50e",
    category: "Template",
  },
  {
    id: "43edca02-2a9a-4ce3-bfc1-6c80deb2a8ac",
    title: "Thumbnail demo",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/43edca02-2a9a-4ce3-bfc1-6c80deb2a8ac/5d5c7849-b0d1-4513-8e95-9a1fb9dfee38/0.webp",
    user_id: "3c40da91-b7c5-4d89-ae86-91180214e50e",
    category: "Template",
  },
  {
    id: "1270379f-063d-4967-b841-0bab43be6579",
    title: "Consistent Character",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/1270379f-063d-4967-b841-0bab43be6579/8a0e2341-26e9-4f13-ba2f-3e1f7d47a5b3/0.webp",
    user_id: "3c40da91-b7c5-4d89-ae86-91180214e50e",
    category: "Template",
  },
  {
    id: "6c3ecee1-0a45-4fc0-870c-9ccaed0fac59",
    title: "AI Apps demo",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/6c3ecee1-0a45-4fc0-870c-9ccaed0fac59/4cT_DI06Oz_DVKcTTlInr.jpg",
    user_id: "3c40da91-b7c5-4d89-ae86-91180214e50e",
    category: "Template",
  },
  {
    id: "d6c2a8f4-1000-490f-80e1-6a4ae173b46b",
    title: "Background Art demo",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/d6c2a8f4-1000-490f-80e1-6a4ae173b46b/6ad0934c-59f6-4c08-bc68-36126177232d/2.jpg",
    user_id: "3c40da91-b7c5-4d89-ae86-91180214e50e",
    category: "Template",
  },
  {
    id: "fb13dedc-687a-4f25-9ae1-dc77b4cd2190",
    title: "Face replacement demo",
    image:
      "https://nvbssjoomsozojofygor.supabase.co/storage/v1/object/public/canvas/3c40da91-b7c5-4d89-ae86-91180214e50e/fb13dedc-687a-4f25-9ae1-dc77b4cd2190/crop_426875f3-9646-499a-8d15-9c1f524f3f77.jpg",
    user_id: "3c40da91-b7c5-4d89-ae86-91180214e50e",
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
  const [activeTab, setActiveTab] = useState<"My Workflows" | "Community">("My Workflows");
  const [isPending, startTransition] = useTransition();

  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newCanvasTitle, setNewCanvasTitle] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

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

  console.log(filteredPublished);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white selection:bg-purple-500/30">
      <div className="relative z-10 mx-auto max-w-[1800px] p-6 pt-24 md:p-8 lg:p-12">
        {/* Hero Header */}
        <HeroHeader
          isPending={isPending}
          onCreateCanvas={handleNewCanvas}
          onExploreCommunity={() => setActiveTab("Community")}
        />

        {/* Templates Slider */}
        <TemplatesSlider
          templates={STATIC_TEMPLATES}
          onTemplateClick={(id) => router.push(`/canvas/${id}`)}
        />

        {/* Toolbar */}
        <DashboardToolbar
          activeTab={activeTab}
          searchQuery={searchQuery}
          onTabChange={setActiveTab}
          onSearchChange={setSearchQuery}
        />

        {/* Projects Tab */}
        {activeTab === "My Workflows" && (
          <ProjectsTab
            projects={filteredProjects}
            onNewCanvas={handleNewCanvas}
            onOpenProject={(id) => router.push(`/canvas/${id}`)}
            onEditProject={handleEditClick}
            onDeleteProject={handleDeleteClick}
          />
        )}

        {/* Community Tab */}
        {activeTab === "Community" && (
          <CommunityTab
            projects={filteredPublished}
            currentUserId={currentUserId}
            onOpenProject={(id) => router.push(`/canvas/${id}`)}
          />
        )}
      </div>

      {/* Dialogs */}
      <CanvasDialogs
        isCreateOpen={isDialogOpen}
        onCreateOpenChange={setIsDialogOpen}
        newCanvasTitle={newCanvasTitle}
        onNewCanvasTitleChange={setNewCanvasTitle}
        onCreateCanvas={createProject}
        isRenameOpen={isRenameDialogOpen}
        onRenameOpenChange={setIsRenameDialogOpen}
        editTitle={editTitle}
        onEditTitleChange={setEditTitle}
        onRenameProject={handleRenameProject}
        isDeleteOpen={isDeleteDialogOpen}
        onDeleteOpenChange={setIsDeleteDialogOpen}
        projectToDelete={projectToDelete}
        onDeleteProject={handleDeleteProject}
        isPending={isPending}
      />
    </div>
  );
}
