import { useEffect, useState } from "react";

export type SavedWorkspaceItem = {
  id: string;
  title: string;
  type: string;
  variant?: string;
  parentId?: string; // sidebar item id to nest under (e.g. "execution_health")
  savedAt: number;
};

const STORAGE_KEY = "arc:workspace-saved";
export const SAVE_EVENT = "arc:workspace:save";
export const CHANGED_EVENT = "arc:workspace:changed";

function read(): SavedWorkspaceItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function write(items: SavedWorkspaceItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(CHANGED_EVENT));
}

/**
 * Save an artifact into the workspace sidebar.
 * Routes the new item under the appropriate Monitor & Adjust nav entry by default.
 */
export function saveToWorkspace(input: {
  title: string;
  type: string;
  variant?: string;
  parentId?: string;
}) {
  const items = read();
  const id = `${input.type}:${input.variant ?? ""}:${input.title}`;
  if (items.some((it) => it.id === id)) return; // dedupe
  // Default nesting rules — execution-style snapshots tuck under Execution Health.
  const typeToParent: Record<string, string> = {
    epmo_dashboard: "epmo_dashboard",
    capacity_report: "capacity_report",
    budget_report: "budget_report",
    execution_health: "execution_health",
  };
  const inferredParent =
    input.parentId ??
    (input.type === "budget_report" && input.variant === "snapshot_10d"
      ? "execution_health"
      : typeToParent[input.type]);
  const next: SavedWorkspaceItem[] = [
    ...items,
    {
      id,
      title: input.title,
      type: input.type,
      variant: input.variant,
      parentId: inferredParent,
      savedAt: Date.now(),
    },
  ];
  write(next);
}

export function removeFromWorkspace(id: string) {
  write(read().filter((it) => it.id !== id));
}

export function useWorkspaceSavedItems(): SavedWorkspaceItem[] {
  const [items, setItems] = useState<SavedWorkspaceItem[]>(() => read());
  useEffect(() => {
    const refresh = () => setItems(read());
    window.addEventListener(CHANGED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CHANGED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return items;
}

// Wire the global save event so callers without React context can still trigger it.
if (typeof window !== "undefined" && !(window as any).__arcWorkspaceSaveBound) {
  (window as any).__arcWorkspaceSaveBound = true;
  window.addEventListener(SAVE_EVENT, (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (!detail || !detail.title || !detail.type) return;
    saveToWorkspace(detail);
  });
}
