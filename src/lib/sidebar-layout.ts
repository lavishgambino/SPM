import { useSidebarExpanded } from "@/hooks/use-sidebar-expanded";

/**
 * Single source of truth for floating-sidebar + page-header geometry.
 *
 * These constants feed two things:
 *   1. The FloatingSidebar component's own dimensions (framer-motion needs JS values).
 *   2. The LayoutVarsProvider, which writes them to CSS custom properties on :root
 *      so every header/title can consume them via var(--content-left) etc.
 *
 * Components should NEVER hand-roll padding math — read the CSS vars instead.
 */

// Base geometry
export const SMARTSHEET_NAV_WIDTH = 72;       // left rail width on desktop
export const SIDEBAR_LEFT_OFFSET = 0;         // sidebar sits flush against the rail
export const SIDEBAR_TOP_OFFSET = 0;          // sidebar runs full height
export const SIDEBAR_WIDTH_COLLAPSED = 56;
export const SIDEBAR_WIDTH_EXPANDED = 248;
export const SIDEBAR_HEADER_GAP = 0;          // content should sit flush with the sidebar edge
export const SIDEBAR_CHIP_HEIGHT = 51;        // height of the Arc chip row (py-2 + 35 + py-2)

// Header sized so its title vertically aligns with the Arc chip row.
export const HEADER_HEIGHT = SIDEBAR_TOP_OFFSET + SIDEBAR_CHIP_HEIGHT + 12; // 63 (preserve original visual)

// Responsive breakpoints (matches Tailwind defaults)
export const BREAKPOINT_MD = 768;
export const BREAKPOINT_LG = 1024;

export interface ResolvedLayout {
  rail: number;
  sidebarLeft: number;
  sidebarWidth: number;
  sidebarRight: number;
  gap: number;
  contentLeft: number;
  headerHeight: number;
  headerTop: number;
}

/**
 * Resolve the active layout for a given viewport + sidebar state.
 * On mobile (<md) the rail and sidebar collapse to 0 so content is full-bleed.
 * Between md and lg the sidebar is forced collapsed.
 */
export function getResponsiveLayout(viewportWidth: number, expanded: boolean): ResolvedLayout {
  let rail: number;
  let sidebarLeft: number;
  let sidebarWidth: number;
  let gap: number;

  if (viewportWidth < BREAKPOINT_MD) {
    rail = 0;
    sidebarLeft = 0;
    sidebarWidth = 0;
    gap = 16;
  } else if (viewportWidth < BREAKPOINT_LG) {
    rail = SMARTSHEET_NAV_WIDTH;
    sidebarLeft = SIDEBAR_LEFT_OFFSET;
    sidebarWidth = SIDEBAR_WIDTH_COLLAPSED;
    gap = SIDEBAR_HEADER_GAP;
  } else {
    rail = SMARTSHEET_NAV_WIDTH;
    sidebarLeft = SIDEBAR_LEFT_OFFSET;
    sidebarWidth = expanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;
    gap = SIDEBAR_HEADER_GAP;
  }

  const sidebarRight = rail + sidebarLeft + sidebarWidth;
  return {
    rail,
    sidebarLeft,
    sidebarWidth,
    sidebarRight,
    gap,
    contentLeft: sidebarRight + gap,
    headerHeight: HEADER_HEIGHT,
    headerTop: SIDEBAR_TOP_OFFSET,
  };
}

/** Reactive helper kept for any imperative consumer (avoid in new code — prefer CSS vars). */
export function useResolvedLayout(): ResolvedLayout {
  const expanded = useSidebarExpanded();
  if (typeof window === "undefined") {
    return getResponsiveLayout(BREAKPOINT_LG, expanded);
  }
  return getResponsiveLayout(window.innerWidth, expanded);
}
