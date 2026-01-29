"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

export async function publishCanvas(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("canvas")
    .update({ is_public: true })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error publishing canvas:", error);
    throw new Error("Failed to publish canvas");
  }

  revalidatePath("/canvas");
  revalidatePath(`/canvas/${id}`);
}

export async function updateCanvas(
  id: string,
  updates: { title?: string; is_public?: boolean; image_id?: string },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const dbUpdates: any = { ...updates };
  if (dbUpdates.image_id) {
    dbUpdates.cover = dbUpdates.image_id;
    delete dbUpdates.image_id;
  }

  const { error } = await supabase
    .from("canvas")
    .update(dbUpdates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating canvas:", error);
    throw new Error("Failed to update canvas");
  }

  revalidatePath("/canvas");
  revalidatePath(`/canvas/${id}`);
}

export async function getCanvasImages(canvasId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // 1. Get image IDs from canvas output_images
  const { data: canvas, error: canvasError } = await supabase
    .from("canvas")
    .select("output_images")
    .eq("id", canvasId)
    .single();

  if (canvasError) {
    console.error("Error fetching canvas for images:", canvasError);
    return [];
  }

  const imageIds = canvas?.output_images;

  if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
    return [];
  }

  // 2. Fetch images
  const { data: images, error: imagesError } = await supabase
    .from("images")
    .select("*")
    .in("id", imageIds)
    .order("created_at", { ascending: false });

  if (imagesError) {
    console.error("Error fetching canvas images:", imagesError);
    return [];
  }

  return images;
}

export async function getPublicTemplates(): Promise<CanvasProject[]> {
  const supabase = await createClient();

  // Fetch all canvases where is_public is true
  const { data, error } = await supabase
    .from("canvas")
    .select(
      `
      *,
      image:images(*)
    `,
    )
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching public templates:", error);
    return [];
  }

  return data as unknown as CanvasProject[];
}

export async function duplicateCanvas(templateId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // 1. Fetch the template canvas
  const { data: template, error: fetchError } = await supabase
    .from("canvas")
    .select("*")
    .eq("id", templateId)
    .single();

  if (fetchError || !template) {
    console.error("Error fetching template:", fetchError);
    throw new Error("Failed to fetch template");
  }

  const templateData = template as unknown as CanvasProject;

  // 2. Create a new canvas with the same content and prefixed title
  const newTitle = `${user.user_metadata.full_name || "Ref"}'s ${templateData.title || "Untitled"}`;

  const { data: newCanvas, error: createError } = await supabase
    .from("canvas")
    .insert({
      user_id: user.id,
      title: newTitle,
      content: templateData.content,
      // We don't copy the image reference directly as it belongs to the other project,
      // but we could if the schema allows. For now, let's start fresh or use same image if public.
      // If we want to keep the thumbnail, we might need to handle images differently.
      // For now, let's just copy content.
    })
    .select("id")
    .single();

  if (createError) {
    console.error("Error duplicating canvas:", createError);
    throw new Error("Failed to duplicate canvas");
  }

  revalidatePath("/canvas");
  return newCanvas.id;
}
