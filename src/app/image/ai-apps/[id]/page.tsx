// app/image/ai-apps/[id]/page.tsx

import Image from "next/image";
import Avatar from "boring-avatars";

import AppInputBox from "@/src/components/ai-apps/AppInputBox";
import AppExampleGrid from "@/src/components/ai-apps/AppExampleGrid";
import AppGenerationHistory from "@/src/components/ai-apps/AppGenerationHistory";
import { createClient } from "@/src/lib/supabase/server";
import { getTagColor } from "@/src/lib/utils";

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params;
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
    <div className="relative flex flex-col items-center w-full min-h-screen bg-black pb-40">
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
      <div className="z-10 my-8 mt-20 flex flex-col items-center justify-center w-full px-4">
        {/* main card */}
        <div className="flex flex-col lg:flex-row justify-between gap-8 bg-[#111111] rounded-[50px] p-6 w-fit max-w-6xl">
          {/* left column */}
          <div className="flex flex-col gap-4 flex-shrink-0 lg:w-[400px]">
            {/* title + description */}
            <h1 className="font-gothic font-medium leading-snug text-3xl text-wrap">
              {app.app_name}
            </h1>
            <p className="text-base pr-8">{app.description}</p>

            {/* tags + author */}
            <div className="flex items-center justify-between mr-8">
              <div className="flex flex-wrap gap-2">
                {app.tags?.map((tag: string, idx: number) => (
                  <p
                    key={idx}
                    className={`bg-[#1A1A1A] h-fit text-xs px-4 p-1.5 rounded-full w-fit text-accent border border-accent/80 ${getTagColor(
                      idx
                    )}`}
                  >
                    {tag}
                  </p>
                ))}
              </div>
              <div className="flex items-center gap-1 rounded-full bg-black/20 border border-white/30 flex-shrink-0">
                <Avatar name={app.author || "Unknown"} />
                <p className="m-1 mr-3">{app.author}</p>
              </div>
            </div>

            {/* examples */}
            <div className="mr-8">
              <p className="mb-2">Examples:</p>
              <AppExampleGrid images={app.examples_images || []} />
            </div>
          </div>

          {/* right column: cover image / video */}
          <div className="relative flex-grow flex justify-center items-center">
            {isVideo ? (
              <video
                src={app.cover_image}
                className="object-contain w-full max-w-[500px] max-h-[500px] h-auto rounded-3xl"
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
                className="object-contain max-h-[500px] w-auto h-auto rounded-[44px]"
                style={{
                  boxShadow: "0px 0px 12px 8px rgba(0,0,0,1)",
                }}
              />
            )}
          </div>
        </div>

        {/* generation history */}
        <div id="appGenerationHistory" className="w-full mt-8 max-w-7xl">
          <AppGenerationHistory appId={id} />
        </div>
      </div>

      {/* input box footer */}
      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 px-2 flex justify-center">
        <AppInputBox
          appParameters={app.parameters || []}
          appId={app.id}
          appCost={app.cost}
          appCover={app.cover_image}
        />
      </footer>
    </div>
  );
}
