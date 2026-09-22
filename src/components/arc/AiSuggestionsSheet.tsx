import { useState } from "react";
import { Check, X, ArrowRight, Send } from "lucide-react";
import { AiIcon } from "@/components/claude/AiIcon";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Activity, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";
import { getWidget } from "@/config/epmoWidgets";

export interface LayoutAction {
  type: "add" | "remove" | "moveTop" | "expand";
  widgetId: string;
}

interface UsageSuggestion {
  id: string;
  text: string;
  action: LayoutAction;
}

const USAGE_SUGGESTIONS: UsageSuggestion[] = [
  {
    id: "u1",
    text: "You open the Projects Needing Attention table first in 9 of your last 10 sessions. Consider pinning it to the top.",
    action: { type: "moveTop", widgetId: "attention" },
  },
  {
    id: "u2",
    text: "Decision & Escalation Velocity is your most-viewed chart. Consider expanding it to full width.",
    action: { type: "expand", widgetId: "escalation" },
  },
  {
    id: "u3",
    text: "You haven't interacted with the Initiative Mix chart in 3 weeks. Consider removing or replacing it.",
    action: { type: "remove", widgetId: "initiativeMix" },
  },
];

interface Template {
  id: string;
  name: string;
  description: string;
  layout: string[];
}

const TEMPLATES: Template[] = [
  {
    id: "t1",
    name: "Healthcare EPMO — Clinical Focus",
    description: "Optimized for orgs tracking clinical quality and patient safety projects. Surfaces RAG by portfolio, capacity heat map, compliance field coverage, and risk taxonomy distribution.",
    layout: ["rag", "healthTrend", "capacityHeat", "riskHeatmap", "okrHeatmap", "attention"],
  },
  {
    id: "t2",
    name: "Healthcare EPMO — Financial Governance",
    description: "For finance-heavy PMOs. Leads with CapEx/OpEx time series, budget variance by portfolio, burn rate trend, and OKR alignment heatmap.",
    layout: ["capexOpex", "budgetVsActual", "spendOverview", "burnRate", "okrHeatmap", "attention"],
  },
  {
    id: "t3",
    name: "Healthcare EPMO — Regulatory & Compliance",
    description: "Surfaces escalation velocity, decision log feed, governance field completion rate, and approval queue front and center.",
    layout: ["escalation", "approvalQueue", "decisionLog", "rag", "healthRadar", "attention"],
  },
];

const ASK_PROMPTS = [
  "Show me more about budget risk",
  "I need to present this to the CFO",
  "Surface compliance gaps",
  "Make this simpler — fewer widgets",
  "What should I add for a Monday morning review?",
];

interface AskResponse {
  preface: string;
  actions: { id: string; text: string; layoutAction: LayoutAction }[];
}

function generateAskResponse(prompt: string): AskResponse {
  const lower = prompt.toLowerCase();
  if (lower.includes("cfo") || lower.includes("budget") || lower.includes("financ")) {
    return {
      preface: "For a CFO presentation, I'd suggest:",
      actions: [
        { id: "a1", text: "Move Portfolio Spend Overview to the top",       layoutAction: { type: "moveTop", widgetId: "spendOverview" } },
        { id: "a2", text: "Add a Budget vs. Actuals bar chart",              layoutAction: { type: "add", widgetId: "budgetVsActual" } },
        { id: "a3", text: "Add CapEx/OpEx Breakdown widget",                 layoutAction: { type: "add", widgetId: "capexOpex" } },
        { id: "a4", text: "Remove Initiative Mix donut",                     layoutAction: { type: "remove", widgetId: "initiativeMix" } },
      ],
    };
  }
  if (lower.includes("compliance") || lower.includes("governance") || lower.includes("audit")) {
    return {
      preface: "To surface compliance gaps, try:",
      actions: [
        { id: "a1", text: "Add Decision Log Feed",        layoutAction: { type: "add", widgetId: "decisionLog" } },
        { id: "a2", text: "Add Escalation Velocity",      layoutAction: { type: "add", widgetId: "escalation" } },
        { id: "a3", text: "Pin Approval Queue to the top", layoutAction: { type: "moveTop", widgetId: "approvalQueue" } },
      ],
    };
  }
  if (lower.includes("simpler") || lower.includes("fewer")) {
    return {
      preface: "To simplify your view:",
      actions: [
        { id: "a1", text: "Remove Initiative Mix donut",        layoutAction: { type: "remove", widgetId: "initiativeMix" } },
        { id: "a2", text: "Remove Execution Health Radar",      layoutAction: { type: "remove", widgetId: "healthRadar" } },
      ],
    };
  }
  if (lower.includes("monday") || lower.includes("review")) {
    return {
      preface: "For a Monday morning review, I'd recommend:",
      actions: [
        { id: "a1", text: "Pin Projects Needing Attention to the top", layoutAction: { type: "moveTop", widgetId: "attention" } },
        { id: "a2", text: "Add Approval Queue",                         layoutAction: { type: "add", widgetId: "approvalQueue" } },
        { id: "a3", text: "Add Program Health Roll-up",                 layoutAction: { type: "add", widgetId: "programRollup" } },
      ],
    };
  }
  return {
    preface: "Based on your request, I'd suggest:",
    actions: [
      { id: "a1", text: "Add Risk Heatmap",                  layoutAction: { type: "add", widgetId: "riskHeatmap" } },
      { id: "a2", text: "Pin Plan Health Trend to the top",  layoutAction: { type: "moveTop", widgetId: "healthTrend" } },
    ],
  };
}

interface AiSuggestionsSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  presentIds: string[];
  onApplyAction: (action: LayoutAction) => void;
  onApplyTemplate: (layout: string[]) => void;
}

export function AiSuggestionsSheet({
  open, onOpenChange, presentIds, onApplyAction, onApplyTemplate,
}: AiSuggestionsSheetProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [askInput, setAskInput] = useState("");
  const [askResponse, setAskResponse] = useState<AskResponse | null>(null);
  const [askDismissed, setAskDismissed] = useState<Set<string>>(new Set());

  const apply = (action: LayoutAction, label: string) => {
    onApplyAction(action);
    toast.success(label);
  };

  const handleAsk = (prompt?: string) => {
    const q = (prompt ?? askInput).trim();
    if (!q) return;
    setAskInput(q);
    setAskResponse(generateAskResponse(q));
    setAskDismissed(new Set());
  };

  const visibleUsage = USAGE_SUGGESTIONS.filter((s) => !dismissed.has(s.id));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, hsl(245 70% 65%), hsl(265 65% 70%))",
                color: "white",
              }}
            >
              <AiIcon className="h-5 w-5" />
            </div>
            <div className="text-left">
              <SheetTitle>AI Dashboard Assistant</SheetTitle>
              <SheetDescription>
                Personalised suggestions, industry templates, and conversational tweaks.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="usage" className="mt-5">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="usage" className="gap-1.5">
              <Activity className="h-3.5 w-3.5" /> Your Usage
            </TabsTrigger>
            <TabsTrigger value="industry" className="gap-1.5">
              <LayoutTemplate className="h-3.5 w-3.5" /> Industry
            </TabsTrigger>
            <TabsTrigger value="ask" className="gap-1.5">
              <AiIcon className="h-3.5 w-3.5" /> Ask AI
            </TabsTrigger>
          </TabsList>

          {/* USAGE */}
          <TabsContent value="usage" className="mt-4 space-y-3">
            <p className="text-caption text-muted-foreground">
              Based on how you've used this dashboard over the past 30 days.
            </p>

            {visibleUsage.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                All caught up. New suggestions appear as Arc learns your patterns.
              </div>
            ) : (
              <>
                {visibleUsage.map((s) => (
                  <div key={s.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex gap-2.5">
                      <AiIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground/90 leading-relaxed">{s.text}</p>
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                      <Button
                        size="sm" variant="ghost"
                        onClick={() => setDismissed((d) => new Set([...d, s.id]))}
                        className="gap-1.5 h-8"
                      >
                        <X className="h-3.5 w-3.5" /> Dismiss
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          apply(s.action, "Widget repositioned — review and save when ready.");
                          setDismissed((d) => new Set([...d, s.id]));
                        }}
                        className="gap-1.5 h-8"
                      >
                        <Check className="h-3.5 w-3.5" /> Apply
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  className="w-full mt-2 gap-2"
                  onClick={() => {
                    visibleUsage.forEach((s) => onApplyAction(s.action));
                    setDismissed(new Set(USAGE_SUGGESTIONS.map((s) => s.id)));
                    toast.success(`Applied ${visibleUsage.length} suggestions`);
                  }}
                >
                  Apply All Suggestions <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </TabsContent>

          {/* INDUSTRY */}
          <TabsContent value="industry" className="mt-4 space-y-3">
            <p className="text-caption text-muted-foreground">
              Pre-built dashboard configurations used by similar Healthcare EPMOs.
            </p>
            {TEMPLATES.map((t) => (
              <div key={t.id} className="rounded-xl border border-border bg-card p-4">
                {/* Mini layout thumbnail */}
                <div
                  className="rounded-lg p-3 mb-3"
                  style={{ background: "hsl(245 60% 97%)" }}
                >
                  <div className="grid grid-cols-3 gap-1.5">
                    {t.layout.slice(0, 6).map((wid, i) => {
                      const w = getWidget(wid);
                      const span = w?.size === "full" ? "col-span-3" : w?.size === "twoThirds" ? "col-span-2" : "col-span-1";
                      return (
                        <div
                          key={i}
                          className={cn("h-6 rounded", span)}
                          style={{ background: "hsl(245 50% 80%)", opacity: 0.4 + i * 0.08 }}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="text-sm font-semibold text-foreground">{t.name}</div>
                <p className="text-caption text-muted-foreground mt-1 leading-relaxed">{t.description}</p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm" variant="outline"
                    onClick={() => toast(`Previewing ${t.name}`)}
                    className="flex-1 h-8"
                  >
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      onApplyTemplate(t.layout);
                      toast.success(`Applied template. Previous layout saved as "My Layout — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}"`);
                    }}
                    className="flex-1 h-8"
                  >
                    Apply Template
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* ASK AI */}
          <TabsContent value="ask" className="mt-4 space-y-3">
            <div className="relative">
              <Input
                value={askInput}
                onChange={(e) => setAskInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAsk(); }}
                placeholder="Tell Arc what you want to track or change..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => handleAsk()}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded-md text-primary hover:bg-primary/10"
                aria-label="Ask"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {ASK_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleAsk(p)}
                  className="text-xs px-2.5 py-1.5 rounded-full border border-border bg-card hover:border-primary hover:text-primary transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>

            {askResponse && (
              <div className="mt-2 space-y-3">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex gap-2.5">
                    <AiIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground/90 leading-relaxed">{askResponse.preface}</p>
                  </div>
                </div>

                {askResponse.actions.filter((a) => !askDismissed.has(a.id)).map((a) => (
                  <div key={a.id} className="rounded-xl border border-border bg-card p-4">
                    <p className="text-sm text-foreground/90 leading-relaxed">{a.text}</p>
                    <div className="flex justify-end gap-2 mt-3">
                      <Button
                        size="sm" variant="ghost"
                        onClick={() => setAskDismissed((d) => new Set([...d, a.id]))}
                        className="gap-1.5 h-8"
                      >
                        <X className="h-3.5 w-3.5" /> Dismiss
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          apply(a.layoutAction, "Applied. Review and save when ready.");
                          setAskDismissed((d) => new Set([...d, a.id]));
                        }}
                        className="gap-1.5 h-8"
                      >
                        <Check className="h-3.5 w-3.5" /> Apply
                      </Button>
                    </div>
                  </div>
                ))}

                {askResponse.actions.filter((a) => !askDismissed.has(a.id)).length > 1 && (
                  <Button
                    className="w-full gap-2"
                    onClick={() => {
                      askResponse.actions
                        .filter((a) => !askDismissed.has(a.id))
                        .forEach((a) => onApplyAction(a.layoutAction));
                      setAskDismissed(new Set(askResponse.actions.map((a) => a.id)));
                      toast.success("All suggestions applied");
                    }}
                  >
                    Apply All <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
