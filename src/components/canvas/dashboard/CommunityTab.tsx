import { motion } from "motion/react";
import { Globe } from "lucide-react";
import { PublishedCard } from "./PublishedCard";
import { EmptyState } from "./EmptyState";

interface PublishedProject {
  id: string;
  title: string;
  updated_at: string;
  user_id: string;
  image?: { url?: string; image_url?: string } | null;
}

interface CommunityTabProps {
  projects: PublishedProject[];
  currentUserId?: string;
  onOpenProject: (id: string) => void;
}

export function CommunityTab({ projects, currentUserId, onOpenProject }: CommunityTabProps) {
  if (projects.length === 0) {
    return (
      <motion.div
        key="community"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <EmptyState
          icon={<Globe className="size-12 text-neutral-600" />}
          title="No published projects yet"
          subtitle="Be the first! Publish a canvas from the editor to share it here."
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      key="community"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {projects.map((project, i) => {
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
              onOpen={() => onOpenProject(project.id)}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
