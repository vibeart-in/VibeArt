import { NavbarLogo } from "@/src/components/ui/resizable-navbar";
import { UserSectionClient } from "@/src/components/home/UserSectionClient";
import SideToolbar from "@/src/components/canvas/SideToolbar";
import Canvas from "@/src/components/canvas/Canvas";
import { Background, BackgroundVariant, Panel } from "@xyflow/react";
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import { CanvasProvider } from "@/src/components/providers/CanvasProvider";
import { CanvasProject } from "@/src/types/BaseType";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/home");
  }

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
          <SideToolbar />
          <Panel
            position="top-left"
            className="flex items-center gap-2 rounded-3xl bg-black/50 px-4 py-2 backdrop-blur-md"
          >
            <NavbarLogo className="!mr-0 !pr-0" />
            <span className="text-white/50">/</span>
            <h1 className="text-lg font-semibold text-white">{project.title}</h1>
          </Panel>
          <Panel position="top-right" className="rounded-3xl bg-black/50 p-3 backdrop-blur-md">
            <UserSectionClient />
          </Panel>
          <Background
            variant={BackgroundVariant.Dots}
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
