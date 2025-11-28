// app/image/ai-apps/[id]/page.tsx

import Avatar from "boring-avatars";
import Image from "next/image";

import AppExampleGrid from "@/src/components/ai-apps/AppExampleGrid";
import AppGenerationHistory from "@/src/components/ai-apps/AppGenerationHistory";
import AppInputBox from "@/src/components/ai-apps/AppInputBox";
import { createClient } from "@/src/lib/supabase/server";
import { cn } from "@/src/lib/utils";
import { getTagColor } from "@/src/utils/server/utils";

// Small inline clock icon so we don't have to add another dependency
function ClockIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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

  const isVideo = app.cover_image?.endsWith?.(".mp4");

  // duration is stored in seconds in the DB. Convert to minutes for display.
  const durationSeconds = Number(app.duration ?? 0);
  const durationMinutes = durationSeconds > 0 ? Math.round((durationSeconds / 60) * 10) / 10 : null;

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
      <div className="z-10 mt-20 flex w-full flex-col items-center justify-center">
        {/* main card */}
        <div className="mx-4 flex w-fit max-w-6xl flex-col justify-between gap-8 rounded-[50px] bg-[#111111] p-6 lg:flex-row">
          {/* Mobile: Cover image first */}
          <div className="flex flex-grow items-center justify-center lg:hidden">
            {isVideo ? (
              <video
                src={app.cover_image}
                className="h-auto max-h-[400px] w-full max-w-[400px] rounded-3xl object-contain"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <Image
                src={app.cover_image}
                alt="cover"
                width={400}
                height={400}
                className="size-auto max-h-[400px] w-full max-w-[400px] rounded-[44px] object-contain"
              />
            )}
          </div>

          {/* left column - content */}
          <div className="flex flex-shrink-0 flex-col gap-4 lg:w-[500px]">
            {/* title + description */}
            <h1 className="text-wrap font-satoshi text-3xl font-medium leading-snug">
              {app.app_name}
            </h1>
            <p className="pr-8 text-base">{app.description}</p>

            {/* tags + author + duration */}
            <div className="mr-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

              <div className="flex flex-row gap-4 sm:flex-row sm:items-center">
                {/* duration display */}
                {durationMinutes ? (
                  <div className="flex items-center gap-3">
                    <div className="border-white/8 from-white/2 to-white/3 flex items-center gap-3 rounded-full border bg-gradient-to-b px-3 py-2 backdrop-blur-sm">
                      <div className="flex size-7 items-center justify-center rounded-full bg-black/30 p-1">
                        <ClockIcon className="size-4 text-accent" />
                      </div>

                      <div className="flex flex-col leading-tight">
                        <span className="text-nowrap text-sm font-medium text-white">
                          {durationMinutes} min
                        </span>
                        <span className="-mt-0.5 text-xs text-white/60">({durationSeconds}s)</span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* author */}
                <div className="flex flex-shrink-0 items-center gap-1 rounded-full border border-white/30 bg-black/20">
                  <Avatar name={app.author || "Unknown"} />
                  <p className="m-1 mr-3">{app.author}</p>
                </div>
              </div>
            </div>

            {/* examples */}
            <div className="mr-8">
              <p className="mb-2">Examples:</p>
              <AppExampleGrid images={(app.examples_images as string[]) || []} />
            </div>
          </div>

          {/* Desktop: Cover image on right */}
          <div className="hidden lg:flex lg:flex-grow lg:items-center lg:justify-center">
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
