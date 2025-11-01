// components/ForceFetchButton.tsx
"use client";

import { IconRefresh } from "@tabler/icons-react";
import React, { useCallback, useState, useEffect, useRef } from "react";

type ForceFetchResult = {
  status: string;
  result?: {
    outputUrls?: string[];
    [k: string]: any;
  };
  body?: any;
};

export interface ForceFetchButtonProps {
  jobId: string; // your DB job id
  taskId: string; // runninghub task id
  cooldownMs?: number; // minimum time between manual fetches (default 10s)
  className?: string;
  onSuccess?: (res: ForceFetchResult) => void;
  onError?: (err: any) => void;
}

/**
 * ForceFetchButton
 * - Calls POST /api/rh/force-fetch with { jobId, taskId }
 * - Prevents spamming with a cooldown
 * - Shows small UI feedback and thumbnails (if any)
 */
export default function ForceFetchButton({
  jobId,
  taskId,
  cooldownMs = 10_000,
  className,
  onSuccess,
  onError,
}: ForceFetchButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ForceFetchResult | null>(null);
  const [lastClickedAt, setLastClickedAt] = useState<number | null>(null);

  // prevents double clicks while in-flight or during cooldown
  const isCooling = lastClickedAt !== null && Date.now() - lastClickedAt < cooldownMs;
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const onForceFetch = useCallback(async () => {
    if (loading) return;
    if (isCooling) {
      setMessage(
        `Please wait ${Math.ceil((cooldownMs - (Date.now() - (lastClickedAt ?? 0))) / 1000)}s before retrying`,
      );
      return;
    }
    setLoading(true);
    setMessage(null);
    setResult(null);
    setLastClickedAt(Date.now());

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resp = await fetch("/api/rh/force-fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, taskId }),
        signal: controller.signal,
      });

      const data = await resp.json().catch(() => null);

      if (!resp.ok) {
        const err = data || { status: resp.status, text: await resp.text().catch(() => "") };
        setMessage("Failed to fetch — check console for details");
        onError?.(err);
        setResult({ status: "error", body: err });
      } else {
        setMessage("Fetch completed");
        const parsed: ForceFetchResult = data;
        setResult(parsed);
        onSuccess?.(parsed);
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        setMessage("Request cancelled");
      } else {
        console.error("Force fetch error:", err);
        setMessage("Network or server error");
        onError?.(err);
      }
    } finally {
      setLoading(false);
      // keep lastClickedAt to enforce cooldown for cooldownMs
      setTimeout(() => {
        // clear old lastClickedAt after cooldown to enable button visually
        if (Date.now() - (lastClickedAt ?? 0) >= cooldownMs) {
          setLastClickedAt(null);
        }
      }, cooldownMs + 50);
    }
  }, [jobId, taskId, cooldownMs, isCooling, loading, lastClickedAt, onError, onSuccess]);

  const thumbnails = result?.result?.outputUrls ?? result?.result?.outputUrls ?? [];

  return (
    <div className={className ?? "mt-4 flex w-full flex-col gap-3"}>
      <div className="flex items-center gap-4">
        <p className="text-sm text-white">Taking long time:</p>
        <button
          onClick={onForceFetch}
          disabled={loading || isCooling}
          aria-disabled={loading || isCooling}
          className={`flex items-center gap-1.5 text-nowrap rounded-xl bg-white/20 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-accent/30 hover:text-accent disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <IconRefresh size={15} />
          {loading ? "Fetching..." : isCooling ? "Wait..." : "Fetch Now"}
        </button>

        {/* {message && <div className="ml-2 text-xs text-neutral-300">{message}</div>} */}
      </div>

      {/* {thumbnails && thumbnails.length > 0 && (
        <div className="mt-2 flex gap-2 overflow-auto">
          {thumbnails.map((url: string, i: number) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-24 w-24 overflow-hidden rounded-lg border border-white/10"
            >
              <img src={url} alt={`output-${i}`} className="h-full w-full object-cover" />
            </a>
          ))}
        </div>
      )} */}

      {/*       
      {result && (
        <details className="mt-2 text-xs text-neutral-300">
          <summary className="cursor-pointer">Response</summary>
          <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-black/30 p-2 text-[11px]">
            {JSON.stringify(result, null, 2)}
          </pre>
        </details>
      )} */}
    </div>
  );
}
