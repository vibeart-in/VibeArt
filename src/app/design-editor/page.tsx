"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

// Dynamically import EditorCanvas to avoid SSR issues with Konva
const EditorCanvas = dynamic(() => import("@/src/components/editor/EditorCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 text-gray-500">
      Loading Editor...
    </div>
  ),
});

function EditorPageContent() {
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get("image-url");

  if (!imageUrl) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 text-gray-500">
        No image provided. Please upload an image first.
      </div>
    );
  }

  return <EditorCanvas initialImageSrc={imageUrl} />;
}

export default function DesignEditorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditorPageContent />
    </Suspense>
  );
}
