import { createClient } from "@/src/lib/supabase/server";
import { PublishButton } from "@/src/components/canvas/PublishButton";
import { CanvasProvider } from "@/src/components/providers/CanvasProvider";
import Canvas from "@/src/components/canvas/Canvas";
import { Background, Panel } from "@xyflow/react";
import { NavbarLogo } from "@/src/components/ui/resizable-navbar";
import { UserSectionClient } from "@/src/components/home/UserSectionClient";
import { CanvasProject } from "@/src/types/BaseType";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // ... (existing code)

  const { data, error } = await supabase
    .from("canvas")
    .select("*, image:images(*)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return <div>Canvas not found</div>;
  }

  const project = data as unknown as CanvasProject;
  
  return (
    <div className="h-screen w-screen">
      <CanvasProvider project={project}>
        <Canvas>
          {/* <SideToolbar /> */}
          <Panel
            position="top-left"
            className="flex items-center gap-2 rounded-3xl bg-black/50 px-4 py-2 backdrop-blur-md"
          >
            <NavbarLogo className="!mr-0 !pr-0" />
            <span className="text-white/50">/</span>
            <h1 className="text-lg font-semibold text-white">{project.title}</h1>
            <PublishButton canvasId={project.id} isPublic={project.is_public || false} />
          </Panel>

          <Panel position="top-right" className="rounded-3xl bg-black/50 p-3 backdrop-blur-md">
            <UserSectionClient />
          </Panel>
          <Background
            gap={24}
            size={1.5}
            color="#555"
            bgColor="#000"
          />
        </Canvas>
      </CanvasProvider>
    </div>
  );
}
