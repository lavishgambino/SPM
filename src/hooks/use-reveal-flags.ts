import { useEffect, useState } from "react";

/**
 * Demo reveal flags — controls progressive disclosure of conversations and
 * phases in the Arc demo. Backed by sessionStorage so they reset on a full
 * page refresh, but persist across in-app navigation.
 */

const CHAT_14_KEY = "arc_chat_14_revealed";
const CHAT_14_EVENT = "arc:chat14RevealedChanged";

const UNTITLED_EVENT = "arc:untitledCreatedChanged";

// In-memory only — resets on full page refresh so a fresh load shows only the
// three original chats. Intentionally NOT backed by sessionStorage.
let untitledCreated = false;

export function isUntitledCreated(): boolean {
  return untitledCreated;
}
export function createUntitledChat() {
  if (typeof window === "undefined") return;
  untitledCreated = true;
  window.dispatchEvent(new CustomEvent(UNTITLED_EVENT));
}
export function useUntitledCreated(): boolean {
  const [v, setV] = useState<boolean>(() => isUntitledCreated());
  useEffect(() => {
    const onChange = () => setV(isUntitledCreated());
    window.addEventListener(UNTITLED_EVENT, onChange);
    return () => {
      window.removeEventListener(UNTITLED_EVENT, onChange);
    };
  }, []);
  return v;
}

const IMPLEMENTED_KEY = "arc:implementedScenario";
const IMPLEMENTED_EVENT = "arc:scenarioImplemented";

/* ───────── Chat 14 (Day 45 — Execution Snapshot) reveal ───────── */

export function isChat14Revealed(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(CHAT_14_KEY) === "true";
}

export function revealChat14() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CHAT_14_KEY, "true");
  window.dispatchEvent(new CustomEvent(CHAT_14_EVENT));
}

export function useChat14Revealed(): boolean {
  const [revealed, setRevealed] = useState<boolean>(() => isChat14Revealed());
  useEffect(() => {
    const onChange = () => setRevealed(isChat14Revealed());
    window.addEventListener(CHAT_14_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(CHAT_14_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return revealed;
}

/* ───────── Implemented scenario (active plan committed) ───────── */

export function hasImplementedScenario(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(IMPLEMENTED_KEY);
}

export function useHasImplementedScenario(): boolean {
  const [val, setVal] = useState<boolean>(() => hasImplementedScenario());
  useEffect(() => {
    const onChange = () => setVal(hasImplementedScenario());
    window.addEventListener(IMPLEMENTED_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(IMPLEMENTED_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return val;
}
