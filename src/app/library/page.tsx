// app/library/page.tsx
import BackgroundImage from "@/src/components/home/BackgroundImage";
import { createClient } from "@/src/lib/supabase/server";
import { IconSparkles } from "@tabler/icons-react";
import UserImageGalleryClient from "@/src/components/home/UserImageGalleryClient";
import { redirect } from "next/navigation";
import { ImageCardType } from "@/src/types/BaseType";

const page = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data, error } = await supabase.rpc("get_user_generated_images", {
    p_user_id: user.id,
  });

  if (error) {
    console.error("Error fetching user images on server:", error);
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center overflow-y-scroll bg-background">
        <BackgroundImage
          src="/images/library_bg.png"
          width={900}
          height={900}
        />
        <div className="z-10 my-8 mt-44 flex flex-col items-center justify-center text-red-400">
          <p>Failed to load your images. Please try again later.</p>
        </div>
      </div>
    );
  }

  const images = data as unknown as ImageCardType[];
  const initialImages: ImageCardType[] = images || [];

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-y-scroll bg-background">
      <BackgroundImage src="/images/library_bg.png" width={900} height={900} />
      <div className="z-10 my-8 mt-44 flex flex-col items-center justify-center">
        <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold">
          <IconSparkles /> All of your generated, edited images in one place
        </h1>
      </div>
      <UserImageGalleryClient initialImages={initialImages} userId={user.id} />
    </div>
  );
};

export default page;
