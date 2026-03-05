import { formatDistanceToNow } from "date-fns";

import { getCanvasProjects, getPublishedCanvases } from "@/src/actions/canvas";
import CanvasDashboard from "@/src/components/canvas/CanvasDashboard";
import { createClient } from "@/src/lib/supabase/server";
import { CanvasProject } from "@/src/types/BaseType";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [projectsData, publishedData] = await Promise.all([
    getCanvasProjects(),
    getPublishedCanvases(),
  ]);

  const formattedProjects = projectsData.map((p: CanvasProject) => ({
    id: p.id,
    title: p.title || "Untitled Project",
    edited: `Edited ${formatDistanceToNow(new Date(p.updated_at), { addSuffix: true })}`,
    image:
      p.image?.image_url || p.image?.public_url
        ? `${p.image?.image_url || p.image?.public_url}?v=${new Date(p.updated_at).getTime()}`
        : "",
  }));

  return (
    <CanvasDashboard
      initialProjects={formattedProjects}
      publishedProjects={publishedData as any}
      currentUserId={user?.id}
    />
  );
}
