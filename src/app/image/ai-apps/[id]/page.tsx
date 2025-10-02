import AppInputBox from "@/src/components/ai-apps/AppInputBox";
import Image from "next/image";
import Avatar from "boring-avatars";
import AppExampleGrid from "@/src/components/ai-apps/AppExampleGrid";
import { createClient } from "@/src/lib/supabase/server";
import { getTagColor } from "@/src/lib/utils";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: app, error } = await supabase.rpc("get_ai_app_by_id", {
    app_uuid: id,
  });

  if (!app) return <p className="text-white">App not found</p>;

  return (
    <div className="relative w-full h-screen flex flex-col bg-black items-center">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "#000000",
          backgroundImage: `
            radial-gradient(circle, rgba(255, 255, 255, 0.2) 1.5px, transparent 1.5px)
          `,
          backgroundSize: "30px 30px",
          backgroundPosition: "0 0",
        }}
      />

      <div className="z-10 my-8 mt-20 flex flex-col justify-center items-center w-full">
        <div className="bg-[#111111] rounded-[50px] p-6 flex justify-between gap-8 max-w-6xl w-fit">
          <div className="w-[400px] flex flex-col gap-4">
            <h1 className="font-gothic font-medium leading-snug text-3xl text-wrap">
              {app.app_name}
            </h1>
            <p className="text-base pr-8">{app.description}</p>

            <div className="flex items-center justify-between mr-8">
              <div className="flex gap-2">
                {app.tags?.map((tag: string, idx: number) => (
                  <p
                    key={idx}
                    className={`bg-[#1A1A1A] h-fit text-xs p-1.5 rounded-full w-fit px-4 text-accent border border-accent/80 ${getTagColor(
                      idx
                    )}`}
                  >
                    {tag}
                  </p>
                ))}
              </div>
              <div className="flex items-center gap-1 rounded-full bg-black/20 border border-white/30">
                <Avatar name={app.author || "Unknown"} />
                <p className="m-1 mr-3">{app.author}</p>
              </div>
            </div>

            <div className="mr-8">
              <p className="mb-2">Examples:</p>
              <AppExampleGrid
                // @ts-expect-error - images prop expects correct type but examples_images structure may not match
                images={app.examples_images || []}
              />
            </div>
          </div>

          <div className="shrink-0">
            <Image
              style={{ boxShadow: "0px 0px 12px 8px rgba(0, 0, 0, 1)" }}
              className="rounded-[44px]"
              src={app.cover_image}
              width={500}
              height={500}
              alt="cover"
            />
          </div>
        </div>
      </div>

      <footer className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10 px-2 flex justify-center">
        <AppInputBox
          // @ts-expect-error - parameters prop expects correct type but model parameters structure may not match
          appParameters={app.parameters}
        />
      </footer>
    </div>
  );
}
