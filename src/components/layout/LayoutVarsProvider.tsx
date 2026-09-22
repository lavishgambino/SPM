import { useEffect } from "react";
import { useSidebarExpanded } from "@/hooks/use-sidebar-expanded";
import { getResponsiveLayout } from "@/lib/sidebar-layout";

/**
 * Mounts once at the app root. Writes layout geometry to CSS custom
 * properties on :root so any header/title can consume them via
 * var(--content-left), var(--header-height), etc.
 *
 * Updates happen on:
 *  - sidebar expand/collapse (via useSidebarExpanded event)
 *  - viewport resize (responsive breakpoints)
 *
 * Renders nothing.
 */
const LayoutVarsProvider = () => {
  const expanded = useSidebarExpanded();

  useEffect(() => {
    const apply = () => {
      const layout = getResponsiveLayout(window.innerWidth, expanded);
      const root = document.documentElement;
      root.style.setProperty("--rail-width", `${layout.rail}px`);
      root.style.setProperty("--sidebar-left", `${layout.rail + layout.sidebarLeft}px`);
      root.style.setProperty("--sidebar-width", `${layout.sidebarWidth}px`);
      root.style.setProperty("--sidebar-right", `${layout.sidebarRight}px`);
      root.style.setProperty("--sidebar-gap", `${layout.gap}px`);
      root.style.setProperty("--content-left", `${layout.contentLeft}px`);
      // Same as --content-left, but with the SmartsheetNav rail subtracted —
      // for use inside containers that already start after the rail.
      root.style.setProperty("--content-left-inner", `${layout.contentLeft - layout.rail}px`);
      root.style.setProperty("--header-height", `${layout.headerHeight}px`);
      root.style.setProperty("--header-top", `${layout.headerTop}px`);
    };

    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [expanded]);

  return null;
};

export default LayoutVarsProvider;
