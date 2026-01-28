import { createClient } from "@/src/lib/supabase/server";
import { PublishButton } from "@/src/components/canvas/PublishButton";
import { CanvasProvider } from "@/src/components/providers/CanvasProvider";
import Canvas from "@/src/components/canvas/Canvas";
import { Background, Panel } from "@xyflow/react";
import { NavbarLogo } from "@/src/components/ui/resizable-navbar";
import { UserSectionClient } from "@/src/components/home/UserSectionClient";
import { CanvasProject } from "@/src/types/BaseType";
import { UseTemplateButton } from "@/src/components/canvas/UseTemplateButton";

export default async function Page({ 
  params,
  searchParams,
}: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { id } = await params;
  const { mode } = await searchParams;
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("canvas")
    .select("*, image:images(*)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return <div>Canvas not found</div>;
  }

  const project = data as unknown as CanvasProject;
  
  // Determine if read-only: only non-owners get read-only mode
  // Owners can always edit their canvas, even in view mode
  const isOwner = user?.id === project.user_id;
  const isReadOnly = !isOwner;
  
  return (
    <div className="h-screen w-screen">
      <CanvasProvider project={project} isReadOnly={isReadOnly}>
        <Canvas>
          {/* <SideToolbar /> */}
          <Panel
            position="top-left"
            className="flex items-center gap-2 rounded-3xl bg-black/50 px-4 py-2 backdrop-blur-md"
          >
            <NavbarLogo className="!mr-0 !pr-0" />
            <span className="text-white/50">/</span>
            <h1 className="text-lg font-semibold text-white">{project.title}</h1>
            
            {isReadOnly && (
              <>
                <span className="ml-2 rounded-md bg-yellow-500/20 px-2 py-1 text-xs font-medium text-yellow-200 backdrop-blur-sm">
                  View Only
                </span>
                {!isOwner && <UseTemplateButton templateId={project.id} />}
              </>
            )}
            
            {isOwner && (
              <PublishButton canvasId={project.id} isPublic={project.is_public || false} />
            )}
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
