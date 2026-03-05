import { Search } from "lucide-react";
import { motion } from "motion/react";

import { EmptyState } from "./EmptyState";
import { TemplateCard } from "./TemplateCard";

interface Template {
  id: string;
  title: string;
  image: string;
  user_id: string;
  category: string;
}

interface TemplatesTabProps {
  templates: Template[];
  currentUserId?: string;
  onOpenTemplate: (id: string) => void;
}

export function TemplatesTab({ templates, currentUserId, onOpenTemplate }: TemplatesTabProps) {
  if (templates.length === 0) {
    return (
      <motion.div
        key="templates"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <EmptyState
          icon={<Search className="size-12 text-neutral-600" />}
          title="No templates match your search"
          subtitle="Try a different keyword."
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      key="templates"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6 flex items-center gap-3">
        <span className="text-sm text-neutral-500">
          {templates.length} starter templates — click to open on canvas
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {templates.map((tpl, i) => {
          const isOwner = tpl.user_id === currentUserId;

          return (
            <TemplateCard
              key={tpl.id}
              index={i}
              id={tpl.id}
              title={tpl.title}
              image={tpl.image}
              category={tpl.category}
              isOwner={isOwner}
              onOpen={() => onOpenTemplate(tpl.id)}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
