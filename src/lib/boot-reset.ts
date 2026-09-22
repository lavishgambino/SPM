/**
 * Hard-refresh reset: every time the app boots (full page load), wipe any
 * runtime "in progress" item state so the demo always starts at zero. Within
 * the same session, navigation does NOT trigger this — the user's progress on
 * the current chat is preserved until they refresh.
 */
const ITEM_STATE_KEY = "arc:itemState:v1";
const PHASE_PROGRESS_KEY = "arc:phaseProgress:v2";
const WORKSPACE_SAVED_KEY = "arc:workspace-saved";
const NEW_CHAT_CREATED_KEY = "arc_new_chat_created";
const CHAT_14_REVEALED_KEY = "arc_chat_14_revealed";

let didReset = false;

export function runBootResetOnce() {
  if (didReset || typeof window === "undefined") return;
  didReset = true;
  try {
    localStorage.removeItem(ITEM_STATE_KEY);
    localStorage.removeItem(PHASE_PROGRESS_KEY);
    localStorage.removeItem(WORKSPACE_SAVED_KEY);
    sessionStorage.removeItem(NEW_CHAT_CREATED_KEY);
    sessionStorage.removeItem(CHAT_14_REVEALED_KEY);
  } catch {
    /* ignore */
  }
}
