"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Folder,
  Image as ImageIcon,
  Film,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import type { AssetItem, AssetsResponse } from "@/src/app/api/assets/route";

interface AssetsPanelProps {
  onAddAsset: (asset: AssetItem) => void;
}

export function AssetsPanel({ onAddAsset }: AssetsPanelProps) {
  const [currentFolder, setCurrentFolder] = useState<string>("");
  const [folderStack, setFolderStack] = useState<string[]>([]);
  const [data, setData] = useState<AssetsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const fetchAssets = useCallback(async (folder: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = folder ? `?folder=${encodeURIComponent(folder)}` : "";
      const res = await fetch(`/api/assets${params}`);
      const json: AssetsResponse = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: any) {
      setError(e.message ?? "Failed to load assets");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets(currentFolder);
  }, [currentFolder, fetchAssets]);

  const handleFolderClick = (folder: string) => {
    setFolderStack((prev) => [...prev, currentFolder]);
    setCurrentFolder(folder);
  };

  const handleBack = () => {
    const stack = [...folderStack];
    const prev = stack.pop() ?? "";
    setFolderStack(stack);
    setCurrentFolder(prev);
  };

  const getBreadcrumb = () => {
    const parts = currentFolder ? currentFolder.split("/") : [];
    return ["Assets", ...parts];
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      {/* Breadcrumb + Back */}
      <div className="flex min-h-[20px] items-center gap-1">
        {folderStack.length > 0 && (
          <button
            onClick={handleBack}
            className="mr-1 flex items-center justify-center rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            <ArrowLeft size={14} />
          </button>
        )}
        <div className="flex flex-wrap items-center gap-1 text-xs text-neutral-500">
          {getBreadcrumb().map((part, i, arr) => (
            <React.Fragment key={i}>
              <span className={i === arr.length - 1 ? "font-medium text-neutral-200" : ""}>
                {part}
              </span>
              {i < arr.length - 1 && <ChevronRight size={10} className="text-neutral-600" />}
            </React.Fragment>
          ))}
        </div>
        <button
          onClick={() => fetchAssets(currentFolder)}
          className="ml-auto flex items-center justify-center rounded-md p-1 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-white"
          title="Refresh"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-900/40 bg-red-900/20 p-3 text-xs text-red-400">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !data && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-lg bg-neutral-800/60"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      {data && !loading && (
        <div className="space-y-4">
          {/* Folders */}
          {data.folders.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                Folders
              </p>
              {data.folders.map((folder) => {
                const displayName = folder.split("/").pop() ?? folder;
                return (
                  <button
                    key={folder}
                    onClick={() => handleFolderClick(folder)}
                    className="group flex w-full items-center gap-2.5 rounded-lg border border-white/5 bg-neutral-800/40 p-2.5 text-left text-sm text-neutral-300 transition-all hover:border-amber-500/20 hover:bg-neutral-800 hover:text-white"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-400">
                      <Folder size={16} />
                    </div>
                    <span className="truncate font-medium">{displayName}</span>
                    <ChevronRight
                      size={14}
                      className="ml-auto shrink-0 text-neutral-600 transition-transform group-hover:translate-x-0.5 group-hover:text-neutral-400"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Files / Assets - Image grid */}
          {data.assets.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                Files · {data.assets.length} item{data.assets.length !== 1 ? "s" : ""}
              </p>

              {/* Image grid for images */}
              {data.assets.some((a) => a.type === "image") && (
                <div className="grid grid-cols-2 gap-2">
                  {data.assets
                    .filter((a) => a.type === "image")
                    .map((asset) => (
                      <button
                        key={asset.key}
                        onClick={() => onAddAsset(asset)}
                        onMouseEnter={() => setHoveredKey(asset.key)}
                        onMouseLeave={() => setHoveredKey(null)}
                        className="group relative aspect-video overflow-hidden rounded-lg border border-white/5 bg-neutral-800 transition-all hover:border-white/20 hover:ring-1 hover:ring-white/10"
                        title={asset.name}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <span className="mb-1 text-[9px] font-semibold text-white">
                            Add to Canvas
                          </span>
                        </div>
                        {/* Bottom label */}
                        <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5 transition-transform duration-200 group-hover:translate-y-0">
                          <p className="truncate text-[9px] text-white/90">{asset.name}</p>
                          <p className="text-[8px] text-white/50">{formatSize(asset.size)}</p>
                        </div>
                      </button>
                    ))}
                </div>
              )}

              {/* List for videos and other media */}
              {data.assets
                .filter((a) => a.type !== "image")
                .map((asset) => (
                  <button
                    key={asset.key}
                    onClick={() => onAddAsset(asset)}
                    className="group flex w-full items-center gap-2.5 rounded-lg border border-white/5 bg-neutral-800/40 p-2.5 text-left transition-all hover:border-purple-500/20 hover:bg-neutral-800"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-purple-900/40 text-purple-400">
                      {asset.type === "video" ? <Film size={16} /> : <ImageIcon size={16} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-neutral-200">{asset.name}</p>
                      <p className="text-[10px] text-neutral-500">{formatSize(asset.size)}</p>
                    </div>
                    <span className="shrink-0 rounded bg-neutral-700 px-1.5 py-0.5 text-[9px] uppercase text-neutral-400">
                      {asset.type}
                    </span>
                  </button>
                ))}
            </div>
          )}

          {/* Empty state */}
          {data.folders.length === 0 && data.assets.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-white/10 py-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-neutral-800">
                <Folder size={22} className="text-neutral-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-300">No assets found</p>
                <p className="mt-0.5 text-xs text-neutral-500">This folder is empty</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
