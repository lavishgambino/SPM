import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useArtifactDraft, useJustSaved } from "@/lib/artifact-draft";
import {
  Plus,
  Search,
  Check,
  Briefcase,
  ListChecks,
  GitBranch,
  ClipboardList,
  LayoutDashboard,
  Network,
  BarChart3,
  HeartPulse,
  Compass,
  Inbox,
  Home,
} from "lucide-react";
import { usePhasesOverview, useItemStates, type PhaseId } from "@/hooks/use-phase-state";
import { revealChat14, useChat14Revealed, useHasImplementedScenario } from "@/hooks/use-reveal-flags";
import { useWorkspaceSavedItems, removeFromWorkspace, type SavedWorkspaceItem } from "@/hooks/use-workspace-saved";
import { FileText, X as XIcon, Pin } from "lucide-react";

const SidebarToggleIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M23 18L23 7C23 6.20435 22.6839 5.44129 22.1213 4.87868C21.5587 4.31607 20.7956 4 20 4L4 4C3.20435 4 2.44129 4.31607 1.87868 4.87868C1.31607 5.44129 1 6.20435 1 7L1 18C1 18.7956 1.31607 19.5587 1.87868 20.1213C2.44129 20.6839 3.20435 21 4 21L20 21C20.7956 21 21.5587 20.6839 22.1213 20.1213C22.6839 19.5587 23 18.7957 23 18ZM4 19C3.73478 19 3.48043 18.8946 3.29289 18.7071C3.10536 18.5196 3 18.2652 3 18L3 7C3 6.73478 3.10536 6.48043 3.29289 6.29289C3.48043 6.10536 3.73478 6 4 6L20 6C20.2652 6 20.5196 6.10536 20.7071 6.29289C20.8946 6.48043 21 6.73478 21 7L21 18C21 18.2652 20.8946 18.5196 20.7071 18.7071C20.5196 18.8946 20.2652 19 20 19L4 19Z" />
    <path d="M9 7.91667L9 17.0833C9 17.3264 8.89464 17.5596 8.70711 17.7315C8.51957 17.9034 8.26522 18 8 18C7.73478 18 7.48043 17.9034 7.29289 17.7315C7.10536 17.5596 7 17.3264 7 17.0833L7 7.91667C7 7.67355 7.10536 7.44039 7.29289 7.26849C7.48043 7.09658 7.73478 7 8 7C8.26522 7 8.51957 7.09658 8.70711 7.26849C8.89464 7.4404 9 7.67355 9 7.91667Z" />
  </svg>
);
import {
  SIDEBAR_TOP_OFFSET,
  getResponsiveLayout,
  BREAKPOINT_MD,
} from "@/lib/sidebar-layout";


export interface FloatingConversation {
  id: string;
  title: string;
  date?: string;
  group?: string;
}

interface FloatingSidebarProps {
  conversations: FloatingConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}

type FrameworkItem = {
  /** Stable id used by the phase-progress system. */
  id: string;
  label: string;
  icon: React.ElementType;
  artifactType: string;
  artifactTypes?: string[];
  route?: string;
  /** Marker for items that are not yet implemented; click is a no-op. */
  comingSoon?: boolean;
  /** Render disabled / grayed out and ignore clicks. */
  disabled?: boolean;
};
type PhaseGroup = { phaseId: PhaseId; items: FrameworkItem[] };

const PHASE_ITEMS: PhaseGroup[] = [
  {
    phaseId: "setup",
    items: [
      { id: "strategic_framework", label: "Strategic Framework", icon: Compass, artifactType: "strategic_framework", artifactTypes: ["strategic_framework", "goals_arc6", "params_arc6"] },
      { id: "intake", label: "Intake form", icon: Inbox, artifactType: "intake_form", artifactTypes: ["intake_form", "intake"] },
      { id: "portfolio_connect", label: "Portfolios", icon: Briefcase, artifactType: "portfolio_connect", route: "/portfolios" },
    ],
  },
  {
    phaseId: "plan",
    items: [
      { id: "prioritization", label: "Intake Sheet", icon: ListChecks, artifactType: "intake_sheet" },
      { id: "scenarios", label: "Scenarios", icon: GitBranch, artifactType: "scenario_comparison" },
      { id: "active_plans", label: "Active Plans", icon: ClipboardList, artifactType: "active_plans", route: "/active-plans" },
    ],
  },
  {
    phaseId: "monitor",
    items: [
      { id: "epmo_dashboard", label: "EPMO Dashboard", icon: LayoutDashboard, artifactType: "epmo_dashboard", route: "/reporting/epmo" },
      { id: "capacity_report", label: "Capacity Report", icon: Network, artifactType: "capacity_report", route: "/reporting/capacity" },
      { id: "budget_report", label: "Budget Report", icon: BarChart3, artifactType: "budget_report", route: "/reporting/budget" },
      { id: "execution_health", label: "Execution Health", icon: HeartPulse, artifactType: "execution_health", route: "/reporting/execution-health" },
    ],
  },
];

const ArcTile = ({ size = 35 }: { size?: number }) => {
  const iconSize = Math.round(size * (22 / 35));
  return (
    <div
      className="icon-tile flex items-center justify-center flex-shrink-0"
      style={{ background: "#167461", width: size, height: size }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" height={iconSize} width={iconSize} viewBox="0 -960 960 960" fill="#8EE69D">
        <path d="M236.6-163.89q-49.51-49.39-49.51-119.7v-319.82q-35.24-13.96-57.62-45.26-22.38-31.3-22.38-71.33 0-52.29 36.62-88.9 36.63-36.6 88.95-36.6t88.87 36.6q36.56 36.61 36.56 88.9 0 40.03-22.38 71.33-22.38 31.3-57.62 45.26v319.83q0 32.28 22.9 55.18t55.42 22.9q32.52 0 55.31-22.94 22.78-22.94 22.78-55.15v-392.82q0-70.31 49.39-119.7t119.82-49.39q70.42 0 119.81 49.39t49.39 119.7v319.82q35.24 13.96 57.62 45.26 22.38 31.3 22.38 71.33 0 52.15-36.57 88.83-36.58 36.67-88.83 36.67t-88.92-36.67q-36.68-36.68-36.68-88.83 0-39.92 22.38-71.66 22.38-31.73 57.62-44.93v-319.82q0-32.52-22.9-55.31-22.9-22.78-55.42-22.78t-55.31 22.78q-22.78 22.79-22.78 55.2v392.93q0 70.31-49.39 119.7t-119.7 49.39q-70.3 0-119.81-49.39Zm-3.95-518.02q16.22 0 27.24-10.97t11.02-27.19q0-16.21-11.02-27.11-11.02-10.91-27.24-10.91-16.21 0-27.18 10.92-10.97 10.93-10.97 27.07t10.97 27.17q10.97 11.02 27.18 11.02Zm494.86 480q16.15 0 27.07-10.97 10.92-10.97 10.92-27.19 0-16.21-10.92-27.11-10.92-10.91-27.07-10.91-16.14 0-27.28 10.92-11.14 10.93-11.14 27.07t11.14 27.17q11.14 11.02 27.28 11.02ZM232.83-720Zm494.58 480Z"/>
      </svg>
    </div>
  );
};

const SavedChildRow = ({ child }: { child: SavedWorkspaceItem }) => {
  const open = () => {
    window.dispatchEvent(
      new CustomEvent("arc:openSavedArtifact", {
        detail: { type: child.type, title: child.title, variant: child.variant },
      })
    );
  };
  return (
    <div className="group relative">
      <button
        onClick={open}
        className="w-full flex items-center gap-2.5 h-8 px-2 rounded-lg text-left transition-colors text-foreground hover:bg-muted/60 cursor-pointer"
      >
        <FileText size={15} className="flex-shrink-0" />
        <span className="text-[13px] font-medium truncate flex-1">{child.title}</span>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeFromWorkspace(child.id);
        }}
        title="Remove from workspace"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity p-0.5 rounded"
      >
        <XIcon size={12} />
      </button>
    </div>
  );
};

const NavRow = ({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 h-8 px-2 rounded-lg text-left transition-colors cursor-pointer ${
      active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/60"
    }`}
  >
    <Icon size={15} className="flex-shrink-0" />
    <span className="text-[13px] font-medium truncate">{label}</span>
  </button>
);

const FloatingSidebar = ({ conversations, activeId, onSelect, onNewChat }: FloatingSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [expanded, setExpanded] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const v = localStorage.getItem("sidebar:expanded");
    // Default to open. Only respect an explicit "0" once the user has toggled it
    // closed within this session.
    if (v === "0") return false;
    return true;
  });
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window === "undefined" ? 1280 : window.innerWidth
  );
  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // React to external expand/collapse requests (e.g. canvas auto-open).
  useEffect(() => {
    const onChanged = (e: Event) => {
      const detail = (e as CustomEvent).detail as { expanded?: boolean } | null;
      if (!detail || typeof detail.expanded !== "boolean") return;
      setExpanded((cur) => (cur === detail.expanded ? cur : !!detail.expanded));
    };
    window.addEventListener("arc:sidebar:expanded-changed", onChanged as EventListener);
    return () =>
      window.removeEventListener("arc:sidebar:expanded-changed", onChanged as EventListener);
  }, []);

  // Layout consults the same source of truth as LayoutVarsProvider, so the
  // sidebar's actual rendered geometry can never drift from the CSS vars
  // headers consume.
  const layout = getResponsiveLayout(viewportWidth, expanded);
  const isMobile = viewportWidth < BREAKPOINT_MD;

  const { overview: phaseOverview } = usePhasesOverview();
  const itemStates = useItemStates();
  const chat14Revealed = useChat14Revealed();
  const hasImplemented = useHasImplementedScenario();
  const savedItems = useWorkspaceSavedItems();
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  // Search reveals the Day 45 conversation in Recents and unlocks the
  // Monitor & Adjust phase items in the nav.
  const handleSearchClick = () => {
    revealChat14();
  };

  // Build artifact-type → nav label map from PHASE_ITEMS.
  useEffect(() => {
    const typeToLabel = new Map<string, string>();
    PHASE_ITEMS.forEach((g) =>
      g.items.forEach((it) => {
        typeToLabel.set(it.artifactType, it.label);
        it.artifactTypes?.forEach((t) => typeToLabel.set(t, it.label));
      })
    );
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { type?: string } | null;
      if (!detail || !detail.type) {
        setActiveLabel(null);
        return;
      }
      const label = typeToLabel.get(detail.type);
      setActiveLabel(label ?? null);
    };
    window.addEventListener("arc:activeArtifactChanged", handler as EventListener);
    return () =>
      window.removeEventListener("arc:activeArtifactChanged", handler as EventListener);
  }, []);

  const toggleExpanded = () => {
    setExpanded((v) => {
      const next = !v;
      localStorage.setItem("sidebar:expanded", next ? "1" : "0");
      window.dispatchEvent(
        new CustomEvent("arc:sidebar:expanded-changed", { detail: { expanded: next } })
      );
      return next;
    });
  };

  const handleFrameworkClick = (item: FrameworkItem) => {
    setActiveLabel(item.label);
    if (item.route) {
      navigate(item.route);
      return;
    }
    const detail = {
      artifactType: item.artifactType,
      artifactTypes: item.artifactTypes,
      navLabel: item.label,
    };
    const onConversation = /^\/projects\/[^/]+\/chat\/[^/]+/.test(window.location.pathname);
    if (!onConversation) {
      sessionStorage.setItem("arc:pendingArtifact", JSON.stringify(detail));
      navigate("/projects/2/chat/11");
      return;
    }
    window.dispatchEvent(new CustomEvent("arc:openArtifact", { detail }));
  };

  const isHome = location.pathname === "/home";

  return (
    <motion.div
      animate={{
        width: layout.sidebarWidth,
        opacity: isMobile ? 0 : 1,
      }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="fixed z-50 overflow-hidden flex flex-col isolate glass-card"
      style={{
        top: 0,
        left: layout.rail + layout.sidebarLeft,
        background: "hsl(var(--background) / 0.38)",
        height: "100vh",
        pointerEvents: isMobile ? "none" : undefined,
      }}
    >
      {/* Chip header — always rendered */}
      {expanded ? (
        <div className="flex items-center justify-between gap-2 px-3 pt-4 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <ArcTile size={30} />
            <span className="tracking-tight text-foreground font-bold text-lg">Arc</span>
          </div>
          <button
            onClick={toggleExpanded}
            title="Collapse sidebar"
            className="w-7 h-7 rounded-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer flex-shrink-0"
          >
            <SidebarToggleIcon size={16} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 pt-4 pb-3 flex-shrink-0">
          <ArcTile size={29} />
          <button
            onClick={toggleExpanded}
            title="Expand sidebar"
            className="w-7 h-7 rounded-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
          >
            <SidebarToggleIcon size={16} />
          </button>
        </div>
      )}

      {/* Collapsed: icon-only nav column */}
      {!expanded && (
        <div className="relative flex-1 min-h-0">
          <div className="flex h-full flex-col items-center gap-1 overflow-y-auto px-3 pt-1 pb-2 claude-scrollbar">
            <button
              onClick={() => navigate("/home")}
              title="Home"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
            >
              <Home size={16} />
            </button>
            <button
              onClick={onNewChat}
              title="New Chat"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
            >
              <Plus size={16} />
            </button>

            {phaseOverview
              .map((phase, idx) => {
                const items = PHASE_ITEMS.find((p) => p.phaseId === phase.id)?.items ?? [];
                return (
                  <div key={phase.id} className="w-full flex flex-col items-center gap-1">
                    <div className="w-6 h-px bg-border/40 my-1" />
                    {items.map((item) => {
                      const Icon = item.icon;
                      const isUnlockedByRuntime = itemStates[item.id] === "in_progress";
                      const isDisabled = !!item.disabled && !isUnlockedByRuntime;
                      const isOnArtifactRoute = item.route
                        ? location.pathname === item.route
                        : false;
                      const isActive = item.route
                        ? isOnArtifactRoute
                        : activeLabel === item.label;
                      return (
                        <button
                          key={item.label}
                          onClick={() => !isDisabled && handleFrameworkClick(item)}
                          disabled={isDisabled}
                          aria-disabled={isDisabled || undefined}
                          title={isDisabled ? `${item.label} (Coming soon)` : item.label}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                            isDisabled
                              ? "text-muted-foreground/40 cursor-not-allowed"
                              : isActive
                              ? "bg-primary/10 text-primary cursor-pointer"
                              : "text-foreground hover:bg-muted/60 cursor-pointer"
                          }`}
                        >
                          <Icon size={16} />
                        </button>
                      );
                    })}
                  </div>
                );
              })}

            {/* Recent conversations — circular initial badges */}
            {conversations.length > 0 && (
              <div className="w-full flex flex-col items-center gap-1">
                <div className="w-6 h-px bg-border/40 my-1" />
                {conversations.map((c) => {
                  const isActive = activeId === c.id && activeLabel === null;
                  const initial = (c.title || "?").trim().charAt(0).toUpperCase();
                  return (
                    <button
                      key={c.id}
                      onClick={() => onSelect(c.id)}
                      title={c.title}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full bg-muted/60 flex items-center justify-center text-[11px] font-semibold">
                        {initial}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-6 z-10"
            style={{
              background:
                "linear-gradient(to bottom, hsl(var(--background) / 0), hsl(var(--background) / 0.55) 55%, hsl(var(--background) / 0.72))",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          />
        </div>
      )}

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            {/* Primary nav */}
            <div className="px-3 py-2 flex flex-col gap-0.5">
              <NavRow icon={Home} label="Home" onClick={() => navigate("/home")} active={isHome} />
              <NavRow icon={Plus} label="New Chat" onClick={onNewChat} />
              
            </div>

            {/* Scrollable middle */}
            <div className="flex-1 min-h-0 overflow-y-auto claude-scrollbar px-3 pb-2">
              {/* Phases — flat nav, sections separated by dividers (Mercury-style) */}
              {phaseOverview
                .map((phase, idx) => {
                  const items = PHASE_ITEMS.find((p) => p.phaseId === phase.id)?.items ?? [];
                  const isFirst = idx === 0;
                  // Phase-level In Progress chip: any item in this phase marked
                  // in_progress at runtime promotes the whole phase header.
                  // Once the user has an active plan committed, the Plan & Commit
                  // phase is no longer "in progress" — hide the chip.
                  const phaseInProgress =
                    items.some((it) => itemStates[it.id] === "in_progress") &&
                    !(phase.id === "plan" && hasImplemented);
                  return (
                    <div
                      key={phase.id}
                      className={
                        isFirst
                          ? "pt-2"
                          : "pt-3 mt-3 border-t border-border/40"
                      }
                    >
                      <div className="flex items-center gap-2 px-2 pb-1">
                        <span className="text-[10.5px] text-muted-foreground">
                          {phase.label}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {items.map((item) => {
                          const Icon = item.icon;
                          // Runtime in_progress unlocks an otherwise-disabled item.
                          // (e.g., Strategic Framework activates once docs are uploaded.)
                          const isUnlockedByRuntime = itemStates[item.id] === "in_progress";
                          const isDisabled = !!item.disabled && !isUnlockedByRuntime;
                          const isOnArtifactRoute = item.route
                            ? location.pathname === item.route
                            : false;
                          const isActive = item.route
                            ? isOnArtifactRoute
                            : activeLabel === item.label;
                          const isComplete = phase.completedItems.includes(item.id);
                          const childSaved = savedItems.filter((s) => s.parentId === item.id);
                          return (
                            <div key={item.label} className="flex flex-col">
                              <button
                                onClick={() => !isDisabled && handleFrameworkClick(item)}
                                disabled={isDisabled}
                                aria-disabled={isDisabled || undefined}
                                title={isDisabled ? "Coming soon" : undefined}
                                className={`w-full flex items-center gap-2.5 h-8 px-2 rounded-lg text-left transition-colors ${
                                  isDisabled
                                    ? "text-muted-foreground/40 cursor-not-allowed"
                                    : isActive
                                    ? "bg-primary/10 text-primary cursor-pointer"
                                    : "text-foreground hover:bg-muted/60 cursor-pointer"
                                }`}
                              >
                                <Icon size={15} className="flex-shrink-0" />
                                <span className="text-[13px] font-medium truncate flex-1">{item.label}</span>
                                {item.id === "strategic_framework" && isUnlockedByRuntime && (
                                  <SidebarDraftChip />
                                )}
                                {isComplete && !isDisabled && (
                                  <Check size={12} className="flex-shrink-0 text-muted-foreground/50" />
                                )}
                              </button>
                              {item.id === "execution_health" && (
                                <button
                                  onClick={() => navigate("/reporting/budget-deep-dive")}
                                  title="Budget deep dive"
                                  className={`w-full flex items-center gap-2.5 h-8 px-2 rounded-lg text-left transition-colors cursor-pointer ${
                                    location.pathname === "/reporting/budget-deep-dive"
                                      ? "bg-primary/10 text-primary"
                                      : "text-foreground hover:bg-muted/60"
                                  }`}
                                >
                                  <Pin size={15} className="flex-shrink-0" />
                                  <span className="text-[13px] font-medium truncate flex-1">Budget deep dive</span>
                                </button>
                              )}
                              {childSaved.length > 0 && (
                                <div className="flex flex-col gap-0.5">
                                  {childSaved.map((child) => (
                                    <SavedChildRow key={child.id} child={child} />
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

              {/* Recent — separate zone, mirrors Mercury "Bookmarks" */}
              <div className="pt-3 mt-3 border-t border-border/40">
                <p className="text-[11px] text-muted-foreground px-2 pb-1">
                  Recent
                </p>
                <div className="flex flex-col">
                  {conversations.map((c) => {
                    const isActive = activeId === c.id && activeLabel === null;
                    return (
                      <button
                        key={c.id}
                        onClick={() => onSelect(c.id)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                          isActive ? "bg-primary/10 text-primary" : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="text-[12.5px] truncate flex-1 min-w-0 font-semibold">{c.title}</span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

function SidebarDraftChip() {
  const draft = useArtifactDraft("strategic_framework");
  const justSaved = useJustSaved("strategic_framework");
  const isDirty = draft.dirty;
  if (!isDirty && !justSaved) return null;
  const label = justSaved ? "Saved" : "Draft";
  const bg = justSaved ? "#DCFCE7" : "#E6E8EE";
  const fg = justSaved ? "#065F46" : "#1E2230";
  const dot = justSaved ? "#10B981" : "#6B7280";
  return (
    <span
      className="inline-flex items-center h-[18px] px-1.5 gap-1 rounded-sm text-[10px] font-medium whitespace-nowrap"
      style={{ backgroundColor: bg, color: fg }}
    >
      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: dot }} />
      {label}
    </span>
  );
}

export default FloatingSidebar;
