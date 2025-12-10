"use client";

import { createClient } from "@/src/lib/supabase/client";
import { generateUUID } from "@/src/lib/utils";
import { Handle, Node, NodeProps, Position, useReactFlow, useViewport } from "@xyflow/react";
import { randomUUID } from "crypto";
import { Loader2, UploadCloud } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner"; // Assuming you use Sonner for toasts

// 1. Update Data Shape to match your DB Schema
type InputImageNodeData = {
  label?: string;
  storagePath?: string; // e.g. "user_123/inputs/cat.png"
  imageId?: string; // UUID from public.images table
  temporaryUrl?: string; // Blob URL for immediate feedback before save
  [key: string]: unknown;
};

export type InputImageNodeType = Node<InputImageNodeData, "inputImage">;

export default function InputImage({ id, data, selected }: NodeProps<InputImageNodeType>) {
  const { zoom } = useViewport();
  const { updateNode } = useReactFlow();
  const supabase = createClient();

  const [signedUrl, setSignedUrl] = useState<string | null>(data.temporaryUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 2. Hydrate: Fetch Signed URL if we have a storage path but no temporary URL
  useEffect(() => {
    // if (data.temporaryUrl) return; // Use the blob URL if we just uploaded it
    if (!data.storagePath) return;

    let isMounted = true;

    console.log(data);

    const fetchUrl = async () => {
      setIsLoading(true);
      const { data: result } = await supabase.storage
        .from("uploaded-images") // Change to your bucket name
        .createSignedUrl(data.storagePath!, 3600); // 1 Hour expiry

      if (isMounted && result?.signedUrl) {
        setSignedUrl(result.signedUrl);
        console.log(signedUrl);
      }
      setIsLoading(false);
    };

    fetchUrl();

    return () => {
      isMounted = false;
    };
  }, [data.storagePath, data.temporaryUrl, supabase.storage]);

  // 3. Handle Local Upload
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        setIsUploading(true);

        // A. Get User (You might want to grab this from a context to avoid async fetch here)
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        // B. Upload to Bucket
        const ext = file.name.split(".").pop();
        const filePath = `${user.id}/${generateUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("uploaded-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // C. Insert into images Table
        const { data: imgRecord, error: dbError } = await supabase
          .from("images")
          .insert({
            user_id: user.id,
            image_url: filePath,
            width: 0,
            height: 0,
            is_public: false,
          })
          .select()
          .single();

        console.log(imgRecord);

        if (dbError) throw dbError;

        // D. Update Node Data
        // We set temporaryUrl for instant feedback, and storagePath/imageId for logic
        updateNode(id, {
          data: {
            ...data,
            storagePath: filePath,
            imageId: imgRecord.id,
            // temporaryUrl: URL.createObjectURL(file), // Immediate preview
          },
        });

        toast.success("Image uploaded");
      } catch (error) {
        console.error(error);
        toast.error("Failed to upload image");
      } finally {
        setIsUploading(false);
      }
    },
    [updateNode, id, data, supabase],
  );

  return (
    <div
      className={`group relative rounded-[28px] transition-all duration-300 ${
        selected ? "ring-2 ring-[#e2e2e2]/50" : "hover:ring-2 hover:ring-[#e2e2e2]/30"
      }`}
      style={{
        width: "300px",
        height: "auto",
      }}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        id={`upload-${id}`}
        className="hidden"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={isUploading}
      />

      {/* Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[28px] bg-gray-900 shadow-xl">
        {/* Loading Spinner */}
        {(isLoading || isUploading) && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Loader2 className="animate-spin text-white" />
          </div>
        )}

        {/* The Image */}
        {signedUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={signedUrl}
            alt="Input"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            draggable={false}
          />
        ) : (
          // Empty State
          <label
            htmlFor={`upload-${id}`}
            className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
          >
            <UploadCloud size={32} />
            <span className="text-sm font-medium">Click to Upload</span>
          </label>
        )}

        {/* Change Image Overlay (Only appears on hover if image exists) */}
        {signedUrl && (
          <label
            htmlFor={`upload-${id}`}
            className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 hover:opacity-100"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-white">
              <UploadCloud size={16} /> Change Image
            </span>
          </label>
        )}

        {/* Selection Overlay */}
        <div
          className={`pointer-events-none absolute inset-0 rounded-[28px] transition-opacity duration-300 ${
            selected ? "bg-white/5" : "bg-transparent"
          }`}
        />
      </div>

      {/* Header Info */}
      <div
        className="absolute left-0 right-0 top-4 flex items-center justify-center px-4 font-medium text-white/90"
        style={{
          fontSize: `${14 / zoom}px`,
        }}
      >
        <span className="rounded-full bg-black/20 px-2 py-0.5 drop-shadow-md backdrop-blur-sm">
          {data.label || "Input Image"}
        </span>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className={`!-right-4 !h-4 !w-4 !border-[3px] !border-[#1a1a1a] !bg-[#DFFF00] transition-all duration-300 ${
          selected || signedUrl ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />
    </div>
  );
}
