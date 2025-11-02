// app/image/ai-apps/[id]/page.tsx

import Avatar from "boring-avatars";
import Image from "next/image";

import AppExampleGrid from "@/src/components/ai-apps/AppExampleGrid";
import AppGenerationHistory from "@/src/components/ai-apps/AppGenerationHistory";
import AppInputBox from "@/src/components/ai-apps/AppInputBox";
import { createClient } from "@/src/lib/supabase/server";
import { cn } from "@/src/lib/utils";
import { getTagColor } from "@/src/utils/server/utils";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: app, error } = await supabase.rpc("get_ai_app_by_id", {
    app_uuid: id,
  });

  if (error || !app) {
    console.error(error);
    return <p className="text-white">App not found</p>;
  }

  const isVideo = app.cover_image.endsWith(".mp4");

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-black pb-40">
      {/* background grid */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "#000000",
          backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.2) 1.5px, transparent 1.5px)`,
          backgroundSize: "30px 30px",
          backgroundPosition: "0 0",
        }}
      />

      {/* content container */}
      <div className="z-10 my-8 mt-20 flex w-full flex-col items-center justify-center px-4">
        {/* main card */}
        <div className="flex w-fit max-w-6xl flex-col justify-between gap-8 rounded-[50px] bg-[#111111] p-6 lg:flex-row">
          {/* left column */}
          <div className="flex flex-shrink-0 flex-col gap-4 lg:w-[400px]">
            {/* title + description */}
            <h1 className="text-wrap font-satoshi text-3xl font-medium leading-snug">
              {app.app_name}
            </h1>
            <p className="pr-8 text-base">{app.description}</p>

            {/* tags + author */}
            <div className="mr-8 flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {app.tags?.map((tag: string, idx: number) => (
                  <p
                    key={idx}
                    className={cn(
                      "h-fit w-fit rounded-full border border-accent/80 bg-[#1A1A1A] p-1.5 px-4 text-xs text-accent",
                      getTagColor(idx),
                    )}
                  >
                    {tag}
                  </p>
                ))}
              </div>
              <div className="flex flex-shrink-0 items-center gap-1 rounded-full border border-white/30 bg-black/20">
                <Avatar name={app.author || "Unknown"} />
                <p className="m-1 mr-3">{app.author}</p>
              </div>
            </div>

            {/* examples */}
            <div className="mr-8">
              <p className="mb-2">Examples:</p>
              <AppExampleGrid images={(app.examples_images as string[]) || []} />
            </div>
          </div>

          {/* right column: cover image / video */}
          <div className="relative flex flex-grow items-center justify-center">
            {isVideo ? (
              <video
                src={app.cover_image}
                className="h-auto max-h-[500px] w-full max-w-[500px] rounded-3xl object-contain"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <Image
                src={app.cover_image}
                alt="cover"
                width={500}
                height={500}
                className="size-auto max-h-[500px] rounded-[44px] object-contain"
                style={{
                  boxShadow: "0px 0px 12px 8px rgba(0,0,0,1)",
                }}
              />
            )}
          </div>
        </div>

        {/* generation history */}
        <div id="appGenerationHistory" className="mt-8 w-full max-w-[80vw]">
          <AppGenerationHistory appId={id} />
        </div>
      </div>

      {/* input box footer */}
      <footer className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 justify-center px-2">
        <AppInputBox
          //@ts-ignore
          appParameters={app.parameters || []}
          appId={app.id}
          appCost={app.cost}
          appCover={app.cover_image}
        />
      </footer>
    </div>
  );
}
