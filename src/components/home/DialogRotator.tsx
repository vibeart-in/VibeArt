"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dotted-dialog";
import { supabase } from "@/src/lib/supabase/client";
import { cn } from "@/src/lib/utils";
import { getTagColor } from "@/src/utils/server/utils";

const FEATURE_LOCAL_CACHE_KEY = "feature_banner_list_cache_v1";
const STATE_STORAGE_KEY = "feature_banner_state_v1";

function nowMs() {
  return Date.now();
}

type Feature = {
  id: string;
  title?: string | null;
  description?: string | null;
  tags?: string[] | null;
  media_url?: string | null;
  link?: string | null;
  button_text?: string | null;
  styleVars?: Record<string, string> | null;
};

type FeatureCache = { fetchedAt: number; ttlSec: number; features: Feature[] };
type PersistedState = {
  closed: Record<string, boolean>;
  currentIndex: number | null;
  nextShowAt: number | null;
  cycle: number;
};

async function fetchFeaturesFromSupabase(): Promise<Feature[]> {
  const { data, error } = await supabase
    .from("feature_dialog")
    .select("id, title, description, tags, media_url, link, action_label, style_vars, priority")
    .eq("enabled", true)
    .order("priority", { ascending: false });

  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    tags: r.tags ?? [],
    media_url: r.media_url,
    link: r.link,
    button_text: r.button_text,
    styleVars: r.style_vars ?? null,
  }));
}

function readLocalFeatureCache(): FeatureCache | null {
  try {
    const raw = localStorage.getItem(FEATURE_LOCAL_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FeatureCache;
  } catch {
    return null;
  }
}
function writeLocalFeatureCache(features: Feature[], ttlSec: number) {
  try {
    const payload: FeatureCache = { fetchedAt: nowMs(), ttlSec, features };
    localStorage.setItem(FEATURE_LOCAL_CACHE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export default function BannerRotatorDialog({
  minDelaySec = 20,
  maxDelaySec = 60,
  cacheTtlSec = 60 * 60,
  resetAfterCycle = true,
  storageKey = STATE_STORAGE_KEY,
  delayAfterCycleSec = 10 * 60,
}: {
  minDelaySec?: number;
  maxDelaySec?: number;
  cacheTtlSec?: number;
  resetAfterCycle?: boolean;
  storageKey?: string;
  delayAfterCycleSec?: number;
}) {
  const minMs = Math.max(0, Math.floor(minDelaySec * 1000));
  const maxMs = Math.max(minMs, Math.floor(maxDelaySec * 1000));
  const cycleDelayMs = Math.floor(delayAfterCycleSec * 1000);

  const timerRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const queryKey = ["feature_banners"] as const;

  const queryOptions: UseQueryOptions<Feature[], Error, Feature[], typeof queryKey> = {
    queryKey,
    queryFn: fetchFeaturesFromSupabase,
    staleTime: cacheTtlSec * 1000,
    gcTime: Math.max(cacheTtlSec * 1000, 1000 * 60 * 10),
    // initialData only from a *local cache* (so still only using Supabase as source of truth)
    initialData: (() => {
      try {
        const cached = readLocalFeatureCache();
        if (cached && nowMs() - cached.fetchedAt < cacheTtlSec * 1000) return cached.features;
      } catch {}
      return undefined;
    })(),
  };

  const { data: fetchedFeatures, isSuccess, isFetched } = useQuery(queryOptions);

  // Use a useEffect hook to handle the side effect of writing to the cache
  useEffect(() => {
    // isSuccess ensures this only runs when the query is successful.
    // fetchedFeatures check ensures we don't write `undefined` to the cache.
    if (isSuccess && fetchedFeatures) {
      try {
        writeLocalFeatureCache(fetchedFeatures, cacheTtlSec);
      } catch (e) {
        /* ignore */
      }
    }
  }, [fetchedFeatures, isSuccess]); // This effect runs when fetchedFeatures or isSuccess changes

  const features = fetchedFeatures ?? []; // empty until fetched (no static fallback)
  // persisted state helpers (note: we don't create closed map until features exist)
  const loadState = useCallback((): PersistedState => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) throw new Error("no state");
      const parsed = JSON.parse(raw) as PersistedState;
      parsed.currentIndex = parsed.currentIndex ?? null;
      parsed.nextShowAt = parsed.nextShowAt ?? null;
      parsed.cycle = parsed.cycle ?? 0;
      parsed.closed = parsed.closed ?? {};
      return parsed;
    } catch {
      return { closed: {}, currentIndex: null, nextShowAt: null, cycle: 0 };
    }
  }, [storageKey]);

  const saveState = useCallback(
    (s: PersistedState) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(s));
      } catch {}
    },
    [storageKey],
  );

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const randomBetween = useCallback(
    (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a,
    [],
  );

  const getNextUnclosedIndex = useCallback(
    (startIndex = 0, closedMap?: Record<string, boolean>) => {
      const closed = closedMap ?? loadState().closed;
      const n = features.length;
      if (n === 0) return null;
      for (let offset = 0; offset < n; offset++) {
        const idx = (startIndex + offset) % n;
        if (!closed[features[idx].id]) return idx;
      }
      return null;
    },
    [features, loadState],
  );

  const scheduleNextShow = useCallback(
    (fromNow = true, atMsOverride?: number) => {
      clearTimer();
      const delay = atMsOverride != null ? Math.max(0, atMsOverride) : randomBetween(minMs, maxMs);
      const timeoutMs = fromNow ? delay : Math.max(0, delay - Date.now());

      // Persist the next show time immediately
      const persisted = loadState();
      const newPersisted = { ...persisted, nextShowAt: Date.now() + timeoutMs } as PersistedState;
      saveState(newPersisted);

      timerRef.current = window.setTimeout(() => {
        const currentPersistedState = loadState(); // Load the most recent state
        let nextIdx = getNextUnclosedIndex(
          (currentPersistedState.currentIndex ?? -1) + 1,
          currentPersistedState.closed,
        );

        let finalState: PersistedState;

        if (nextIdx === null) {
          // All have been shown, handle cycle reset
          if (resetAfterCycle) {
            const newClosed: Record<string, boolean> = {};
            features.forEach((f) => (newClosed[f.id] = false));
            nextIdx = getNextUnclosedIndex(0, newClosed) ?? 0; // Start from beginning
            finalState = {
              ...currentPersistedState,
              closed: newClosed,
              currentIndex: nextIdx,
              nextShowAt: null,
              cycle: currentPersistedState.cycle + 1,
            };
          } else {
            // Do not reset, just stop showing
            finalState = { ...currentPersistedState, nextShowAt: null, currentIndex: null };
            saveState(finalState);
            setVisible(false);
            setCurrentIndex(null);
            return;
          }
        } else {
          // There is a next item to show
          finalState = {
            ...currentPersistedState,
            currentIndex: nextIdx,
            nextShowAt: null,
          };
        }

        saveState(finalState);
        setCurrentIndex(finalState.currentIndex);
        setVisible(finalState.currentIndex !== null);
      }, timeoutMs);
    },
    [
      clearTimer,
      features,
      getNextUnclosedIndex,
      loadState,
      maxMs,
      minMs,
      randomBetween,
      resetAfterCycle,
      saveState,
    ],
  );
  // handle close
  const handleClose = useCallback(() => {
    if (currentIndex == null) {
      setVisible(false);
      return;
    }

    const persisted = loadState();
    const featureId = features[currentIndex].id;
    const newClosed = { ...persisted.closed, [featureId]: true };

    // Check if closing this dialog completes the cycle.
    // We pass the *new* closed map to see if any unclosed items remain.
    const isCycleComplete = getNextUnclosedIndex(0, newClosed) === null;

    // Use the long cycle delay if the cycle is complete, otherwise use the short random delay.
    const delay = isCycleComplete && resetAfterCycle ? cycleDelayMs : randomBetween(minMs, maxMs);

    // Persist the new state with the correct next show time
    const nextPersisted: PersistedState = {
      ...persisted,
      closed: newClosed,
      currentIndex: null,
      nextShowAt: Date.now() + delay,
    };
    saveState(nextPersisted);

    // Update UI
    setVisible(false);
    setCurrentIndex(null);

    // Clear any existing timer and schedule the next show with the correct delay
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      // The scheduleNextShow function will handle the logic of resetting the cycle
      scheduleNextShow();
    }, delay);
  }, [
    clearTimer,
    currentIndex,
    cycleDelayMs, // Add this dependency
    features,
    getNextUnclosedIndex, // Add this dependency
    loadState,
    maxMs,
    minMs,
    randomBetween,
    resetAfterCycle, // Add this dependency
    saveState,
    scheduleNextShow,
  ]);

  const handlePrimary = useCallback(() => {
    if (currentIndex == null) return;
    const f = features[currentIndex];
    if (f.link) {
      try {
        window.location.href = f.link;
      } catch {
        window.open(f.link, "_blank");
      }
    }
    handleClose();
  }, [currentIndex, features, handleClose]);

  // Wait until features are fetched before scheduling - ensures we do not use empty list
  useEffect(() => {
    if (!isFetched) return; // wait until react-query finished
    if (!fetchedFeatures || fetchedFeatures.length === 0) return; // nothing to show

    // ensure persisted closed map contains keys for current feature set (don't overwrite user choices)
    const persisted = loadState();
    let changed = false;
    const closed = { ...persisted.closed };
    fetchedFeatures.forEach((f) => {
      if (closed[f.id] === undefined) {
        closed[f.id] = false;
        changed = true;
      }
    });
    if (changed) {
      saveState({ ...persisted, closed });
    }

    const now = Date.now();
    if (persisted.nextShowAt && persisted.nextShowAt > now) {
      scheduleNextShow(false, persisted.nextShowAt - now);
    } else if (persisted.currentIndex != null) {
      const idx = persisted.currentIndex;
      if (!persisted.closed[fetchedFeatures[idx].id]) {
        setCurrentIndex(idx);
        setVisible(true);
      } else {
        scheduleNextShow();
      }
    } else {
      scheduleNextShow();
    }

    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetched]);

  function isVideo(url?: string | null) {
    if (!url) return false;
    return /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url);
  }

  if (!visible || currentIndex == null) return null;
  // features is guaranteed non-empty because we only schedule after fetch
  const feature = features[currentIndex];

  return (
    <div className="w-full">
      <Dialog
        open={visible}
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
      >
        <DialogContent className="w-full max-w-3xl rounded-[30px] bg-black/80 pt-0 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <div className="flex gap-12">
            <div>
              {feature.media_url ? (
                isVideo(feature.media_url) ? (
                  <video
                    src={feature.media_url}
                    className="h-[40vh] w-[400px] rounded-3xl object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <Image
                    className="h-[40vh] w-[400px] rounded-3xl object-cover"
                    src={feature.media_url}
                    alt={feature.title ?? "feature"}
                    width={400}
                    height={240}
                  />
                )
              ) : (
                <div className="h-[40vh] w-[400px] rounded-3xl bg-slate-900" />
              )}
            </div>

            <div className="flex h-full flex-col justify-between">
              <div>
                <h3 className="mr-4 mt-4 font-satoshi text-2xl font-bold leading-relaxed text-accent">
                  {feature.title}
                </h3>
                <p className="mt-4">{feature.description}</p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {(feature.tags || []).map((tag, idx) => (
                    <p
                      key={idx}
                      className={cn(
                        "h-fit w-fit rounded-full border bg-[#1A1A1A] px-3",
                        getTagColor(idx),
                      )}
                    >
                      {tag}
                    </p>
                  ))}
                </div>
              </div>

              <Button
                className="mb-4 h-fit w-full border-2 border-accent bg-accent/50 py-3 text-base text-accent"
                onClick={handlePrimary}
              >
                {feature.button_text ?? "Generate with it now"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
