import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Bell,
  TrendingUp,
  AlertTriangle,
  Users,
  Compass,
  BarChart3,
  GitBranch,
  DollarSign,
  ChevronRight,
  Clock,
  FileText,
  FolderKanban,
  LayoutGrid,
} from "lucide-react";
import FloatingSidebar from "@/components/claude/FloatingSidebar";
import ChatInput from "@/components/claude/ChatInput";
import SmartsheetNav from "@/components/claude/SmartsheetNav";
import { revealChat14, createUntitledChat, isUntitledCreated } from "@/hooks/use-reveal-flags";
import reportingAgentChip from "@/assets/reporting-agent-chip.svg";
import scenarioAgentChip from "@/assets/scenario-agent-chip.svg";

const ALL_SIDEBAR_CONVERSATIONS = [
  { id: "untitled", title: "Untitled", date: "Now" },
  { id: "14f", title: "Budget deep dive", date: "Today" },
  { id: "11f", title: "FY27 plan creation", date: "Today" },
  { id: "11", title: "Setting up first plan", date: "Today" },
  { id: "13", title: "Intake Review & Scenario Planning", date: "5 days ago" },
];

const getSidebarConversations = () => {
  const hasNewChat = typeof window !== "undefined" && sessionStorage.getItem("arc_new_chat_created") === "true";
  const hasUntitled = typeof window !== "undefined" && isUntitledCreated();
  return ALL_SIDEBAR_CONVERSATIONS.filter((c) => {
    if (c.id === "untitled") return hasUntitled;
    if (c.id === "13") return hasNewChat;
    return true;
  });
};

type AgentKind = "risk" | "reporting" | "scenario" | null;

const RiskAgentChip = () => (
  <span
    className="inline-flex items-center gap-1.5 rounded-[8px] pl-1 pr-2.5 py-0.5"
    style={{
      background:
        "linear-gradient(90deg, hsl(354 100% 59% / 0.22) 0%, hsl(30 97% 60% / 0.22) 100%)",
    }}
  >
    <span
      className="w-3 h-3 rounded-full flex-shrink-0"
      style={{
        background:
          "linear-gradient(135deg, hsl(354 100% 59%) 0%, hsl(30 97% 60%) 100%)",
      }}
      aria-hidden
    />
    <span className="text-[11px] leading-none font-medium text-foreground">
      <span className="font-semibold">Risk</span> Agent
    </span>
  </span>
);

const AgentChip = ({ kind }: { kind: AgentKind }) => {
  if (kind === "risk") return <RiskAgentChip />;
  if (kind === "reporting")
    return <img src={reportingAgentChip} alt="Reporting agent" className="w-auto" style={{ height: 20 }} />;
  if (kind === "scenario")
    return <img src={scenarioAgentChip} alt="Scenario agent" className="w-auto" style={{ height: 20 }} />;
  return null;
};

const agentTileStyle = (agent: AgentKind) => {
  if (agent === "risk")
    return {
      background:
        "linear-gradient(135deg, hsl(354 100% 59% / 0.10) 0%, hsl(30 97% 60% / 0.10) 100%)",
      color: "hsl(354 70% 55%)",
    } as const;
  if (agent === "reporting")
    return {
      background:
        "linear-gradient(135deg, hsl(45 95% 55% / 0.14) 0%, hsl(28 95% 55% / 0.12) 100%)",
      color: "hsl(35 85% 50%)",
    } as const;
  if (agent === "scenario")
    return {
      background:
        "linear-gradient(135deg, hsl(266 45% 42% / 0.10) 0%, hsl(259 53% 70% / 0.12) 100%)",
      color: "hsl(266 50% 55%)",
    } as const;
  return null;
};

interface SuggestionTile {
  label: string;
  desc: string;
  prompt: string;
  Icon: any;
  agent: AgentKind;
  route?: string;
}

// Proactive recommendations — pulled from the Monitoring & Replanning state.
const SUGGESTIONS: SuggestionTile[] = [
  {
    label: "Portfolio trending $4.6M over budget",
    desc: "23 projects projecting to $38.6M vs $34M planned. Four projects drive 30% of the variance — candidates for a mid-cycle replan.",
    prompt: "Dive deeper on the budget issue",
    Icon: DollarSign,
    agent: "risk",
  },
  {
    label: "Live EPMO monitoring dashboard",
    desc: "Fresh budget, schedule, and capacity data synced 4 hours ago. Open the live view to see how execution is tracking against plan.",
    prompt: "Show me the new EPMO dashboard",
    Icon: BarChart3,
    agent: "reporting",
  },
  {
    label: "Replan opportunity: Scenario B shift",
    desc: "Modeling shows resequencing two H2 projects under Scenario B frees ~$1.8M and relieves capacity pressure without missing commitments.",
    prompt: "Open scenario comparison",
    Icon: GitBranch,
    agent: "scenario",
  },
  {
    label: "3 milestones slipped this week",
    desc: "EHR Integration, Patient Portal v2, and OR Scheduling each slipped 4–7 days. Downstream dependencies still hold — but worth a replan check.",
    prompt: "Review slipped milestones",
    Icon: Compass,
    agent: "reporting",
  },
  {
    label: "Capacity at 105.6% utilization",
    desc: "266 FTEs active vs 252 planned. Security Analyst, UX Designer, and DevOps Engineer are over-allocated and need rebalancing.",
    prompt: "Show me capacity",
    Icon: Users,
    agent: "risk",
  },
  {
    label: "2 vendor SLA breaches detected",
    desc: "Sepsis Detection Tool and OR Scheduling vendors missed agreed response windows in the last 7 days. Worth a check-in before the next milestone.",
    prompt: "Show vendor health",
    Icon: Bell,
    agent: "risk",
  },
];

interface RecentItem {
  name: string;
  kind: "Chat" | "Workspace" | "Sheet" | "Portfolio";
  opened: string;
  route: string;
}

const RECENTS: RecentItem[] = [
  { name: "Budget deep dive", kind: "Chat", opened: "Just now", route: "/projects/2/chat/14f" },
  { name: "FY27 plan creation", kind: "Chat", opened: "1h ago", route: "/projects/2/chat/11f" },
  { name: "Setting up first plan", kind: "Chat", opened: "Today", route: "/projects/2/chat/11" },
];

const recentIcon = (k: RecentItem["kind"]) => {
  if (k === "Chat") return Bell;
  if (k === "Portfolio") return LayoutGrid;
  if (k === "Workspace") return FolderKanban;
  return FileText;
};

const Home = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"suggested" | "recents">("suggested");

  const handleSend = (text: string) => {
    const value = text.trim();
    if (!value) return;
    // Route new chats into chat 14 (active monitoring conversation) with the
    // user's prompt seeded — preserves the existing behaviour pattern.
    revealChat14();
    navigate(`/projects/2/chat/14`, { state: { initialMessage: value } });
  };

  const iconTileStyle = {
    background: "hsl(241 65% 95%)",
    color: "#4644D8",
  } as const;

  return (
    <div className="flex min-h-screen bg-background">
      <SmartsheetNav />
      <div
        className="flex-1 relative min-w-0 transition-[padding] duration-200 ease-out"
        style={{ paddingLeft: "var(--content-left-inner)" }}
      >
        <FloatingSidebar
          conversations={getSidebarConversations()}
          activeId={null}
          onSelect={(id) => navigate(`/projects/2/chat/${id}`)}
          onNewChat={() => {
            createUntitledChat();
            navigate(`/projects/2/chat/untitled`);
          }}
        />

        <div className="h-screen flex flex-col min-w-0 relative overflow-auto">
          <div className="flex-1 relative z-[1]">
            <div className="bottom-glow" aria-hidden="true" style={{ position: "fixed" }} />
            <div className="max-w-[720px] mx-auto px-4 pt-24 pb-16">
              {/* Greeting */}
              <div className="mb-10 text-left">
                <div
                  className="text-[40px] font-semibold tracking-tight leading-[1.1]"
                  style={{ color: "hsl(233 70% 70%)" }}
                >
                  Hey Mary,
                </div>
                <h1 className="text-[40px] font-semibold text-foreground tracking-tight leading-[1.1]">
                  Let's move your work
                  <br />
                  forward intelligently…
                </h1>
              </div>

              {/* Input */}
              <div className="mb-20">
                <ChatInput
                  onSend={handleSend}
                  isLoading={false}
                  placeholder="Ask about any of these, or start something new…"
                />
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 border-b border-border/60 mb-5">
                <button
                  onClick={() => setTab("suggested")}
                  className={`relative px-3 py-2.5 text-[13px] font-medium transition-colors ${
                    tab === "suggested"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Suggested Next Steps
                  {tab === "suggested" && (
                    <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-primary rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setTab("recents")}
                  className={`relative px-3 py-2.5 text-[13px] font-medium transition-colors ${
                    tab === "recents"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Recents
                  {tab === "recents" && (
                    <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-primary rounded-full" />
                  )}
                </button>
              </div>

              {/* Tab content */}
              {tab === "suggested" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {SUGGESTIONS.map((a) => {
                    const Icon = a.Icon;
                    const agentStyle = agentTileStyle(a.agent);
                    const tileStyle = agentStyle ?? iconTileStyle;
                    return (
                      <button
                        key={a.label}
                        onClick={() => handleSend(a.prompt)}
                        className="group relative text-left rounded-2xl border-[1.5px] border-border/70 bg-card hover:border-[hsl(265_55%_75%)] hover:shadow-sm transition-all overflow-hidden p-5 flex flex-col"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className="icon-tile flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
                            style={tileStyle}
                          >
                            <Icon className="w-4 h-4" strokeWidth={1.75} />
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="font-semibold text-foreground mb-1 text-[14px]">
                          {a.label}
                        </div>
                        <div className="text-muted-foreground text-[12px] leading-relaxed">
                          {a.desc}
                        </div>
                        {a.agent && (
                          <div className="mt-3 self-start">
                            <AgentChip kind={a.agent} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {RECENTS.map((r) => {
                    const Icon = recentIcon(r.kind);
                    return (
                      <button
                        key={r.name}
                        onClick={() => navigate(r.route)}
                        className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card hover:border-[hsl(265_55%_75%)] hover:shadow-sm transition-all p-3 text-left"
                      >
                        <div
                          className="icon-tile flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
                          style={iconTileStyle}
                        >
                          <Icon className="w-4 h-4" strokeWidth={1.75} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13.5px] font-medium text-foreground truncate">
                            {r.name}
                          </div>
                          <div className="text-[11.5px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <span>{r.kind}</span>
                            <span>·</span>
                            <Clock className="w-3 h-3" />
                            <span>{r.opened}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
