"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/src/lib/supabase/server";

export async function createCanvas(title: string = "Untitled Canvas") {
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
      title,
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

export async function publishCanvas(
  id: string,
  publish: boolean,
  title?: string,
  cover?: string | null,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const updates: any = { is_public: publish };

  // Only update title and cover when publishing
  if (publish) {
    if (title) updates.title = title;
    if (cover !== undefined) updates.cover = cover;
  }

  const { error } = await supabase
    .from("canvas")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error publishing canvas:", error);
    throw new Error("Failed to publish canvas");
  }

  revalidatePath("/canvas");
}

export async function getPublishedCanvases() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("canvas")
    .select(`id, title, updated_at, user_id, image:images(*)`)
    .eq("is_public", true)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching published canvases:", error);
    return [];
  }

  return data ?? [];
}

export async function updateCanvas(id: string, updates: { title?: string; is_public?: boolean }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("canvas")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating canvas:", error);
    throw new Error("Failed to update canvas");
  }

  revalidatePath("/canvas");
}

export async function deleteCanvas(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // 1. Delete related Jobs and Job Output Images
  // First, get all job IDs for this canvas
  const { data: jobs } = await supabase.from("jobs").select("id").eq("canvas_id", id);

  if (jobs && jobs.length > 0) {
    const jobIds = jobs.map((j) => j.id);

    // Delete job output images
    await supabase.from("job_output_images").delete().in("job_id", jobIds);

    // Delete jobs
    await supabase.from("jobs").delete().in("id", jobIds);
  }

  // 2. Delete the Canvas
  const { error } = await supabase.from("canvas").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    console.error("Error deleting canvas:", error);
    throw new Error("Failed to delete canvas");
  }

  revalidatePath("/canvas");
}
