"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCanvas() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("canvas")
    .insert({
      user_id: user.id,
      title: "Untitled Canvas",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating canvas:", error);
    throw new Error("Failed to create canvas");
  }

  revalidatePath("/canvas");
  return data.id;
}

import { CanvasProject } from "@/src/types/BaseType";

export async function getCanvasProjects(): Promise<CanvasProject[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("canvas")
    .select(
      `
      *,
      image:images(*)
    `,
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching canvas projects:", error);
    return [];
  }

  return data as unknown as CanvasProject[];
}
