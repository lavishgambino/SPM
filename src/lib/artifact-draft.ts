/**
 * Draft state for artifacts that write back to a source of truth (Smartsheet).
 *
 * The Strategic Framework starts as a generated draft. Edits keep it dirty
 * until the user explicitly Saves, which writes it back to Smartsheet and
 * flips the chip to "Saved · vX.Y".
 *
 * Module-level so all surfaces (canvas header, inline preview, left nav)
 * subscribe to the same state without prop drilling.
 */

import { useEffect, useState, useSyncExternalStore } from "react";

export type ArtifactDraftStatus = "draft" | "saved";

export type ArtifactDraftState = {
  status: ArtifactDraftStatus;
  /** Semver-ish version. Bumps on save when dirty. */
  version: string;
  /** True when the artifact has unsaved local edits. */
  dirty: boolean;
  /** Last save timestamp (ms). */
  savedAt: number | null;
};

const DEFAULT: ArtifactDraftState = {
  status: "draft",
  version: "1.0",
  dirty: true,
  savedAt: null,
};

const store = new Map<string, ArtifactDraftState>();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function get(key: string): ArtifactDraftState {
  return store.get(key) ?? DEFAULT;
}

function set(key: string, next: ArtifactDraftState) {
  store.set(key, next);
  emit();
}

/** Mark an edit. No-op if the artifact is already in dirty draft state. */
export function markArtifactDirty(key: string) {
  const cur = get(key);
  if (cur.status === "draft" && cur.dirty) return;
  set(key, { ...cur, status: "draft", dirty: true });
}

/** Save: flip to saved and stamp time. Does NOT bump version (per spec). */
export function saveArtifactDraft(key: string) {
  const cur = get(key);
  set(key, { ...cur, status: "saved", dirty: false, savedAt: Date.now() });
}

/** Reset (e.g. on app boot). */
export function resetArtifactDraft(key: string, init?: Partial<ArtifactDraftState>) {
  set(key, { ...DEFAULT, ...init });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Read draft state for a single artifact key, reactively. */
export function useArtifactDraft(key: string | undefined): ArtifactDraftState {
  return useSyncExternalStore(
    subscribe,
    () => (key ? get(key) : DEFAULT),
    () => (key ? get(key) : DEFAULT),
  );
}



/**
 * Returns true for `duration` ms immediately after the artifact transitions
 * to a saved state. Used to show a temporary "Saved" confirmation chip.
 */
export function useJustSaved(key: string | undefined, duration = 2500): boolean {
  const draft = useArtifactDraft(key);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (draft.status === "saved" && !draft.dirty && draft.savedAt) {
      const elapsed = Date.now() - draft.savedAt;
      if (elapsed >= duration) return;
      setShown(true);
      const t = window.setTimeout(() => setShown(false), duration - elapsed);
      return () => window.clearTimeout(t);
    }
    setShown(false);
  }, [draft.status, draft.dirty, draft.savedAt, duration]);
  return shown;
}
