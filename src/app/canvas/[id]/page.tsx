import { Background, BackgroundVariant, Panel } from "@xyflow/react";
import { redirect } from "next/navigation";

import Canvas from "@/src/components/canvas/Canvas";
import { UserSectionClient } from "@/src/components/home/UserSectionClient";
import { CanvasProvider } from "@/src/components/providers/CanvasProvider";
import { NavbarLogo } from "@/src/components/ui/resizable-navbar";
import { createClient } from "@/src/lib/supabase/server";
import { CanvasTitle } from "@/src/components/canvas/CanvasTitle";
import { CanvasProject } from "@/src/types/BaseType";
import SideToolbar from "@/src/components/canvas/SideToolbar";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // if (!user) {
    //   return redirect("/home");
    // }

    const { data, error } = await supabase.from("canvas").select("*").eq("id", id).single();

    if (error) {
      console.error("Supabase error:", error);
      return <div>Canvas not found: {error.message}</div>;
    }

    if (!data) {
      return <div>Canvas not found</div>;
    }

    // Fetch cover image separately if it exists
    let coverImage = null;
    if (data.cover) {
      const { data: imageData } = await supabase
        .from("images")
        .select("*")
        .eq("id", data.cover)
        .single();
      coverImage = imageData;
    }

    const project = {
      ...data,
      image: coverImage,
    } as unknown as CanvasProject;
    console.log("Canvas project:", project);
    const isReadOnly = !user || project.user_id !== user.id;

    return (
      <div className="h-screen w-screen">
        <CanvasProvider project={project}>
          <Canvas readOnly={isReadOnly}>
            <SideToolbar />
            <Panel
              position="top-left"
              className="flex items-center gap-2 rounded-3xl bg-black/50 px-4 py-2 backdrop-blur-md"
            >
              <NavbarLogo href="/canvas" className="!mr-0 !pr-0" />
              <span className="text-white/50">/</span>
              <CanvasTitle
                initialTitle={project.title ?? "Untitled Project"}
                projectId={project.id}
                initialIsPublic={!!(project as any).is_public}
                isReadOnly={isReadOnly}
              />
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
  } catch (error) {
    console.error("Page error:", error);
    return (
      <div>Error loading canvas: {error instanceof Error ? error.message : "Unknown error"}</div>
    );
  }
}
