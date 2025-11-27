"use client";

import { Loader2, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

import { createClient } from "@/src/lib/supabase/client";

export default function UploadPresetsPage() {
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [tags, setTags] = useState("");
  const [forModel, setForModel] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setMessage(null);

    try {
      if (!coverFile) throw new Error("Please select a cover image.");

      // 1. Upload Image
      const fileExt = coverFile.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `model_cover/presets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, coverFile);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // 3. Insert into Presets Table
      const { error: insertError } = await supabase.from("presets").insert({
        name,
        prompt,
        cover: publicUrl,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
        for_model: forModel
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
      });

      if (insertError) throw insertError;

      setMessage({ type: "success", text: "Preset added successfully!" });
      // Reset form
      setName("");
      setPrompt("");
      setCoverFile(null);
      setTags("");
      setForModel("");
    } catch (error: any) {
      console.error("Error uploading preset:", error);
      setMessage({ type: "error", text: error.message || "Failed to upload preset." });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center bg-black p-8 text-white">
      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Add New Preset</h1>
          <p className="text-gray-400">Upload a new preset configuration for the community.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-white/10 bg-zinc-900/50 p-6"
        >
          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-300">
              Preset Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-2.5 text-white outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., Cinematic Portrait"
            />
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium text-gray-300">
              Prompt
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
              rows={4}
              className="w-full resize-none rounded-lg border border-white/10 bg-black/50 px-4 py-2.5 text-white outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter the prompt for this preset..."
            />
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Cover Image</label>
            <div className="group relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
              />
              <div
                className={`flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 transition-all ${coverFile ? "border-green-500/50 bg-green-500/5" : "border-white/10 bg-black/50 group-hover:border-white/20"}`}
              >
                {coverFile ? (
                  <>
                    <CheckCircle className="mb-2 size-8 text-green-500" />
                    <p className="text-sm font-medium text-green-400">{coverFile.name}</p>
                    <p className="mt-1 text-xs text-gray-500">Click to change</p>
                  </>
                ) : (
                  <>
                    <Upload className="mb-2 size-8 text-gray-400" />
                    <p className="text-sm font-medium text-gray-300">Click to upload cover</p>
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-medium text-gray-300">
              Tags (comma separated)
            </label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-2.5 text-white outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="portrait, cinematic, dark"
            />
          </div>

          {/* For Model */}
          <div className="space-y-2">
            <label htmlFor="forModel" className="text-sm font-medium text-gray-300">
              For Model (comma separated)
            </label>
            <input
              id="forModel"
              type="text"
              value={forModel}
              onChange={(e) => setForModel(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-2.5 text-white outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="sdxl, flux"
            />
          </div>

          {/* Message */}
          {message && (
            <div
              className={`flex items-center gap-3 rounded-lg p-4 ${message.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
            >
              {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 font-bold text-black transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Uploading...
              </>
            ) : (
              "Create Preset"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
