import { useEffect, useState } from "react";

const KEY = "sidebar:expanded";
const EVENT = "arc:sidebar:expanded-changed";

export function setSidebarExpanded(next: boolean) {
  localStorage.setItem(KEY, next ? "1" : "0");
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { expanded: next } }));
}

export function useSidebarExpanded() {
  const [expanded, setExpandedState] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const v = localStorage.getItem(KEY);
    if (v === null) return true;
    return v === "1";
  });

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && typeof detail.expanded === "boolean") {
        setExpandedState(detail.expanded);
      } else {
        setExpandedState(localStorage.getItem(KEY) === "1");
      }
    };
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return expanded;
}
