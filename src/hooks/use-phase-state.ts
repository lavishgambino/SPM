import { useEffect, useState } from "react";

/**
 * Phase progress: a single source of truth for which lifecycle phases are
 * active/locked/complete. Backed by localStorage so it persists across reloads
 * until we wire it to the backend per-user.
 */

const STORAGE_KEY = "arc:phaseProgress:v2";
const EVENT = "arc:phaseProgressChanged";

const ITEM_STATE_KEY = "arc:itemState:v1";
const ITEM_STATE_EVENT = "arc:itemStateChanged";

export type ItemRuntimeState = "unlocked" | "in_progress";
type ItemStateMap = Record<string, ItemRuntimeState>;

function readItemState(): ItemStateMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ITEM_STATE_KEY);
    return raw ? (JSON.parse(raw) as ItemStateMap) : {};
  } catch {
    return {};
  }
}

function writeItemState(next: ItemStateMap) {
  localStorage.setItem(ITEM_STATE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(ITEM_STATE_EVENT, { detail: next }));
}

export function setItemState(itemId: string, state: ItemRuntimeState) {
  const next = { ...readItemState(), [itemId]: state };
  writeItemState(next);
}

export function useItemStates() {
  const [state, setState] = useState<ItemStateMap>(() => readItemState());
  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as ItemStateMap | undefined;
      setState(detail ?? readItemState());
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === ITEM_STATE_KEY) setState(readItemState());
    };
    window.addEventListener(ITEM_STATE_EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(ITEM_STATE_EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return state;
}

export type PhaseId = "setup" | "plan" | "monitor";
export type PhaseState = "locked" | "active" | "complete";

export interface PhaseDefinition {
  id: PhaseId;
  label: string;
  /** Item ids that must be completed for the phase to count as done. */
  requiredItems: string[];
}

export const PHASES: PhaseDefinition[] = [
  {
    id: "setup",
    label: "Setup & Config",
    requiredItems: ["strategic_framework", "portfolio_connect"],
  },
  {
    id: "plan",
    label: "Plan & Commit",
    requiredItems: ["prioritization", "scenarios", "active_plans"],
  },
  {
    id: "monitor",
    label: "Monitor & Adjust",
    requiredItems: ["epmo_dashboard", "capacity_report", "budget_report", "execution_health"],
  },
];

/** Demo seed: Setup is the user's current in-progress phase. */
const DEMO_SEED: Record<string, boolean> = {};

type Progress = Record<string, boolean>;

function readProgress(): Progress {
  if (typeof window === "undefined") return { ...DEMO_SEED };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed once so the demo isn't stuck on phase 1.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_SEED));
      return { ...DEMO_SEED };
    }
    return JSON.parse(raw) as Progress;
  } catch {
    return { ...DEMO_SEED };
  }
}

function writeProgress(next: Progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
}

export function markItemComplete(itemId: string) {
  const next = { ...readProgress(), [itemId]: true };
  writeProgress(next);
}

export function markItemIncomplete(itemId: string) {
  const next = { ...readProgress() };
  delete next[itemId];
  writeProgress(next);
}

export function resetPhaseProgress() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(EVENT, { detail: {} }));
}

function deriveStates(progress: Progress): Record<PhaseId, PhaseState> {
  const result = {} as Record<PhaseId, PhaseState>;
  let unlockedNext = true;
  for (const phase of PHASES) {
    if (!unlockedNext) {
      result[phase.id] = "locked";
      continue;
    }
    const allDone = phase.requiredItems.every((id) => progress[id]);
    if (allDone) {
      result[phase.id] = "complete";
      // next phase unlocks
    } else {
      result[phase.id] = "active";
      unlockedNext = false;
    }
  }
  // Edge case: if everything is complete, last phase still shows as complete —
  // promote it back to "active" so users always have a current phase.
  const allComplete = PHASES.every((p) => result[p.id] === "complete");
  if (allComplete) {
    result[PHASES[PHASES.length - 1].id] = "active";
  }
  return result;
}

export function isItemComplete(itemId: string, progress?: Progress): boolean {
  return Boolean((progress ?? readProgress())[itemId]);
}

export interface PhaseOverviewEntry extends PhaseDefinition {
  state: PhaseState;
  completedItems: string[];
}

export function usePhasesOverview() {
  const [progress, setProgress] = useState<Progress>(() => readProgress());

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as Progress | undefined;
      setProgress(detail ?? readProgress());
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setProgress(readProgress());
    };
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const states = deriveStates(progress);
  const overview: PhaseOverviewEntry[] = PHASES.map((p) => ({
    ...p,
    state: states[p.id],
    completedItems: p.requiredItems.filter((id) => progress[id]),
  }));

  return { overview, progress, states };
}
