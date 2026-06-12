"use client";

import { useState, useEffect, useCallback } from "react";
import type { Progress, NodeState } from "./types";

function storageKey(graphId: string): string {
  return `learnbridge:${graphId}:v1`;
}

function readFromStorage(graphId: string): Progress {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(storageKey(graphId));
    if (raw === null) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    return parsed as Progress;
  } catch {
    return {};
  }
}

function writeToStorage(graphId: string, progress: Progress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(graphId), JSON.stringify(progress));
}

function removeFromStorage(graphId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey(graphId));
}

export interface UseGraphProgressResult {
  progress: Progress;
  setNodeState: (id: string, state: NodeState) => void;
  reset: () => void;
}

/**
 * Persists and exposes student progress for a single graph.
 *
 * Storage key: `learnbridge:<graphId>:v1`
 * Value: JSON `Record<nodeId, NodeState>` (the Progress type).
 *
 * SSR-safe: returns {} until hydrated — localStorage is read only inside
 * useEffect (never during render), so server rendering and client hydration
 * always agree on the initial `{}` value.
 */
export function useGraphProgress(graphId: string): UseGraphProgressResult {
  // Start with empty progress so SSR and first client render agree.
  const [progress, setProgress] = useState<Progress>({});

  // Hydrate from localStorage after mount (client-only).
  useEffect(() => {
    setProgress(readFromStorage(graphId));
  }, [graphId]);

  const setNodeState = useCallback(
    (id: string, state: NodeState) => {
      setProgress((prev) => {
        const next = { ...prev, [id]: state };
        writeToStorage(graphId, next);
        return next;
      });
    },
    [graphId]
  );

  const reset = useCallback(() => {
    removeFromStorage(graphId);
    setProgress({});
  }, [graphId]);

  return { progress, setNodeState, reset };
}
