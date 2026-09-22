import { useState, useEffect } from "react";
import { Plus, Search, History, Home, Sun, Moon, Play, Square, PanelLeftClose, PanelLeftOpen, Compass, Inbox, Layers, GitBranch, ShieldCheck, Wrench, Network, Briefcase, LayoutDashboard, Activity, BarChart3, HeartPulse, FileText, Lightbulb, Archive, ChevronDown, Settings2, Target, ClipboardList, ListChecks, Sliders, Lock, LineChart, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ArcLogo from "./ArcLogo";
import iconPlanning from "@/assets/nav/planning.svg";
import userAvatar from "@/assets/user-avatar.svg";

interface Conversation {
  id: string;
  title: string;
  date: string;
  group?: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const SidebarButton = ({
  icon: Icon,
  active = false,
  onClick,
  title,
  label,
  expanded,
}: {
  icon: React.ElementType;
  active?: boolean;
  onClick?: () => void;
  title?: string;
  label?: string;
  expanded?: boolean;
}) => (
  <button
    onClick={onClick}
    title={title}
    className={`${expanded ? "w-full justify-start gap-2.5 px-2" : "w-8 justify-center"} h-8 rounded-lg flex items-center transition-all cursor-pointer ${
      active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
    }`}
  >
    <Icon size={16} className="flex-shrink-0" />
    {expanded && label && <span className="text-[13px] font-medium truncate">{label}</span>}
  </button>
);

const PlaybackButton = ({ expanded }: { expanded: boolean }) => {
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const onToggle = () => setPlaying((p) => !p);
    window.addEventListener("arc:playback:state", onToggle as EventListener);
    return () => window.removeEventListener("arc:playback:state", onToggle as EventListener);
  }, []);
  return (
    <button
      onClick={() => {
        setPlaying((p) => !p);
        window.dispatchEvent(new CustomEvent("arc:playback"));
      }}
      title={playing ? "Reset conversation" : "Show full conversation"}
      className={`${expanded ? "w-full justify-start gap-2.5 px-2" : "w-8 justify-center"} h-8 rounded-lg flex items-center transition-all cursor-pointer mb-1 ${
        playing
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      }`}
    >
      {playing ? <Square size={12} fill="currentColor" className="flex-shrink-0" /> : <Play size={14} fill="currentColor" className="flex-shrink-0" />}
      {expanded && <span className="text-[13px] font-medium">{playing ? "Reset" : "Full conversation"}</span>}
    </button>
  );
};

type FrameworkItem = { label: string; icon: React.ElementType; artifactType: string; artifactTypes?: string[]; route?: string };
type FrameworkGroup = { label: string; icon: React.ElementType; items: FrameworkItem[] };

const FRAMEWORK_GROUPS: FrameworkGroup[] = [
  {
    label: "Setup & Config",
    icon: Settings2,
    items: [
      { label: "Goals", icon: Target, artifactType: "goals_arc6" },
      { label: "Investment Parameters", icon: Sliders, artifactType: "params_arc6" },
      { label: "Portfolios", icon: Briefcase, artifactType: "portfolio_connect", route: "/portfolios" },
      { label: "Blueprints", icon: ShieldCheck, artifactType: "guardrail_check", route: "/governance" },
    ],
  },
  {
    label: "Plan & Commit",
    icon: Layers,
    items: [
      { label: "Intake Sheet", icon: ListChecks, artifactType: "intake_sheet" },
      { label: "Scenarios", icon: GitBranch, artifactType: "scenario_comparison" },
      { label: "Active Plans", icon: ClipboardList, artifactType: "active_plans", route: "/active-plans" },
    ],
  },
  {
    label: "Monitor & Adjust",
    icon: Activity,
    items: [
      { label: "EPMO Dashboard", icon: LayoutDashboard, artifactType: "health_dashboard", route: "/reporting/epmo" },
      { label: "Capacity Report", icon: Network, artifactType: "health_dashboard", route: "/reporting/capacity" },
      { label: "Budget Report", icon: BarChart3, artifactType: "health_dashboard", route: "/reporting/budget" },
      { label: "Execution Health", icon: HeartPulse, artifactType: "health_dashboard", route: "/reporting/execution-health" },
    ],
  },
];

const FrameworkNav = ({
  groups,
  activeLabel,
  onSelectItem,
  onNavigate,
}: {
  groups: FrameworkGroup[];
  activeLabel: string | null;
  onSelectItem: (label: string) => void;
  onNavigate: (route: string) => void;
}) => {
  const handleClick = (item: FrameworkItem) => {
    onSelectItem(item.label);
    if (item.route) {
      onNavigate(item.route);
      return;
    }
    const detail = {
      artifactType: item.artifactType,
      artifactTypes: item.artifactTypes,
      navLabel: item.label,
    };
    const onConversation = /^\/projects\/[^/]+\/chat\/[^/]+/.test(window.location.pathname);
    if (!onConversation) {
      // Stash the pending artifact request and navigate to the latest conversation
      sessionStorage.setItem("arc:pendingArtifact", JSON.stringify(detail));
      onNavigate("/projects/2/chat/14");
      return;
    }
    window.dispatchEvent(new CustomEvent("arc:openArtifact", { detail }));
  };

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => (
        <div key={group.label}>
          {/* Section heading — non-interactive label style */}
          <div className="px-2 pb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
              {group.label}
            </span>
          </div>
          <div className="flex flex-col">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeLabel === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => handleClick(item)}
                  className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon size={13} className="flex-shrink-0" />
                  <span className="text-[12px] font-medium truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const DISCLOSURE_KEY = "arc:disclosure:full";
const ONBOARDING_ALLOWED_LABELS = new Set(["Goals", "Investment Parameters", "Portfolios"]);

const ChatSidebar = ({ conversations, activeId, onSelect, onNewChat, isOpen, onToggle }: ChatSidebarProps) => {
  const navigate = useNavigate();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeKind, setActiveKind] = useState<"section" | "conversation">(activeId ? "conversation" : "section");
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [fullDisclosure, setFullDisclosure] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(DISCLOSURE_KEY) === "1";
  });

  // Listen for cross-component disclosure changes
  useEffect(() => {
    const onChange = () => setFullDisclosure(localStorage.getItem(DISCLOSURE_KEY) === "1");
    window.addEventListener("arc:disclosure:changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("arc:disclosure:changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  // Filter conversations + framework groups based on disclosure state
  const visibleConversations = fullDisclosure
    ? conversations
    : conversations
        .filter((c) => c.id === "11")
        .map((c) => ({ ...c, title: "Strategic setup &..." }));

  const visibleFrameworkGroups = fullDisclosure
    ? FRAMEWORK_GROUPS
    : FRAMEWORK_GROUPS
        .map((g) => ({ ...g, items: g.items.filter((it) => ONBOARDING_ALLOWED_LABELS.has(it.label)) }))
        .filter((g) => g.items.length > 0);

  const handleNewChat = () => {
    localStorage.setItem(DISCLOSURE_KEY, "1");
    setFullDisclosure(true);
    window.dispatchEvent(new Event("arc:disclosure:changed"));
    navigate("/");
  };

  // When a conversation is active (e.g. /projects/x/chat/y), clear the section highlight
  useEffect(() => {
    if (activeId) {
      setActiveKind("conversation");
      setActiveLabel(null);
    }
  }, [activeId]);
  const [expanded, setExpanded] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebar:expanded") === "1";
  });
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  const toggleExpanded = () => {
    setExpanded((v) => {
      const next = !v;
      localStorage.setItem("sidebar:expanded", next ? "1" : "0");
      return next;
    });
    setHistoryOpen(false);
  };

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <motion.div
      animate={{ width: expanded ? 232 : 56 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={`relative flex flex-col py-4 ${expanded ? "px-3 items-stretch" : "px-2 items-center"} h-screen border-r border-border/50 flex-shrink-0 bg-background`}
    >
      {/* Brand + collapse toggle */}
      <div className={`flex items-center mb-3 ${expanded ? "justify-between" : "justify-center"}`}>
        <div className={`flex items-center gap-2 ${expanded ? "" : ""}`}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#F5D9A3" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="22" width="22" viewBox="0 -960 960 960" fill="#7A4A0E">
              <path d="M236.6-163.89q-49.51-49.39-49.51-119.7v-319.82q-35.24-13.96-57.62-45.26-22.38-31.3-22.38-71.33 0-52.29 36.62-88.9 36.63-36.6 88.95-36.6t88.87 36.6q36.56 36.61 36.56 88.9 0 40.03-22.38 71.33-22.38 31.3-57.62 45.26v319.83q0 32.28 22.9 55.18t55.42 22.9q32.52 0 55.31-22.94 22.78-22.94 22.78-55.15v-392.82q0-70.31 49.39-119.7t119.82-49.39q70.42 0 119.81 49.39t49.39 119.7v319.82q35.24 13.96 57.62 45.26 22.38 31.3 22.38 71.33 0 52.15-36.57 88.83-36.58 36.67-88.83 36.67t-88.92-36.67q-36.68-36.68-36.68-88.83 0-39.92 22.38-71.66 22.38-31.73 57.62-44.93v-319.82q0-32.52-22.9-55.31-22.9-22.78-55.42-22.78t-55.31 22.78q-22.78 22.79-22.78 55.2v392.93q0 70.31-49.39 119.7t-119.7 49.39q-70.3 0-119.81-49.39Zm-3.95-518.02q16.22 0 27.24-10.97t11.02-27.19q0-16.21-11.02-27.11-11.02-10.91-27.24-10.91-16.21 0-27.18 10.92-10.97 10.93-10.97 27.07t10.97 27.17q10.97 11.02 27.18 11.02Zm494.86 480q16.15 0 27.07-10.97 10.92-10.97 10.92-27.19 0-16.21-10.92-27.11-10.92-10.91-27.07-10.91-16.14 0-27.28 10.92-11.14 10.93-11.14 27.07t11.14 27.17q11.14 11.02 27.28 11.02ZM232.83-720Zm494.58 480Z"/>
            </svg>
          </div>
          {expanded && <span className="text-[14px] font-semibold tracking-tight">Arc</span>}
        </div>
        {expanded && (
          <button
            onClick={toggleExpanded}
            title="Collapse sidebar"
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <PanelLeftClose size={15} />
          </button>
        )}
      </div>

      {!expanded && (
        <button
          onClick={toggleExpanded}
          title="Expand sidebar"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer mb-2"
        >
          <PanelLeftOpen size={15} />
        </button>
      )}

      {/* Controls group */}
      <div className={`flex flex-col gap-1 ${expanded ? "items-stretch" : "items-center"}`}>
        <SidebarButton icon={Plus} onClick={handleNewChat} title="New chat" label="New chat" expanded={expanded} />
        <SidebarButton icon={Search} title="Search" label="Search" expanded={expanded} />
        <div className={`${expanded ? "w-full" : "w-6"} h-px bg-border/30 my-1`} />
      </div>

      {/* Collapsed sections nav with hover popovers */}
      {!expanded && (
        <div className="mt-3 flex flex-col items-center gap-1">
          {visibleFrameworkGroups.map((group) => {
            const GroupIcon = group.icon;
            const hasActiveItem =
              activeKind === "section" && group.items.some((it) => it.label === activeLabel);
            return (
              <div key={group.label} className="relative group">
                <button
                  title={group.label}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    hasActiveItem
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <GroupIcon size={16} />
                </button>
                <div className="absolute left-full top-0 ml-2 z-[100] w-56 rounded-xl bg-popover/95 glass-card border border-border/50 py-2 px-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity"
                  style={{ boxShadow: "var(--shadow-elevated)" }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 px-3 pb-1.5">
                    {group.label}
                  </p>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeKind === "section" && activeLabel === item.label;
                    return (
                      <button
                        key={item.label}
                        onClick={() => {
                          setActiveKind("section");
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
                            navigate("/projects/2/chat/14");
                            return;
                          }
                          window.dispatchEvent(
                            new CustomEvent("arc:openArtifact", { detail })
                          );
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                          isActive ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground"
                        }`}
                      >
                        <Icon size={13} className="flex-shrink-0" />
                        <span className="text-[12px] font-medium truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recents icon (collapsed only) — sits directly below Reporting */}
      {!expanded && (
        <div className="mt-1 flex flex-col items-center">
          <div className="relative group">
            <button
              title="Conversations"
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                activeKind === "conversation"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <History size={16} />
            </button>
            <div
              className="absolute left-full top-0 ml-2 z-[100] w-72 rounded-xl bg-popover/95 glass-card border border-border/50 py-2 px-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity"
              style={{ boxShadow: "var(--shadow-elevated)" }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 px-3 pb-1.5">Conversations</p>
              {visibleConversations.map((c, i) => {
                const prevGroup = i > 0 ? visibleConversations[i - 1].group : undefined;
                const showDivider = i > 0 && c.group !== prevGroup;
                const isActive = activeKind === "conversation" && activeId === c.id;
                return (
                  <div key={c.id}>
                    {showDivider && <div className="my-1.5 mx-3 border-t border-border/40" />}
                    <button
                      onClick={() => { setActiveKind("conversation"); setActiveLabel(null); onSelect(c.id); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                        isActive ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium truncate">{c.title}</p>
                      </div>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Framework nav (expanded only) */}
      {expanded && (
        <div className="mt-4 flex-1 overflow-y-auto -mx-1 px-1 space-y-3">
          <div>
            <FrameworkNav
              groups={visibleFrameworkGroups}
              activeLabel={activeKind === "section" ? activeLabel : null}
              onSelectItem={(label) => { setActiveKind("section"); setActiveLabel(label); }}
              onNavigate={(route) => navigate(route)}
            />
          </div>

          <div className="mx-2 border-t border-border/50" />

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 px-2 pb-1.5">Conversations</p>
            <div className="flex flex-col">
              {visibleConversations.map((c, i) => {
                const prevGroup = i > 0 ? visibleConversations[i - 1].group : undefined;
                const showDivider = i > 0 && c.group !== prevGroup;
                return (
                  <div key={c.id}>
                    {showDivider && <div className="my-1.5 mx-2 border-t border-border/40" />}
                    <button
                      onClick={() => { setActiveKind("conversation"); setActiveLabel(null); onSelect(c.id); }}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                        activeKind === "conversation" && activeId === c.id ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium truncate">{c.title}</p>
                      </div>
                      {activeKind === "conversation" && activeId === c.id && <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Spacer (collapsed only) */}
      {!expanded && <div className="flex-1" />}

    </motion.div>
  );
};

export default ChatSidebar;
