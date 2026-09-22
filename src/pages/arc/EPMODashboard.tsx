import { useState, useMemo, Fragment } from "react";
import { AppLayout } from "@/components/arc/AppLayout";
import { demandInitiatives } from "@/config/arcData";
import { LayoutDashboard, Pencil, Plus, RotateCcw, Save, X } from "lucide-react";
import { ReportTitleIcon, ReportShareButton } from "@/components/arc/ReportHeaderBits";
import { AiIcon } from "@/components/claude/AiIcon";
import { Button } from "@/components/ui/button";
import { useChartLoading } from "@/components/arc/ChartSkeleton";
import { AiSummaryPanel } from "@/components/arc/AiSummaryPanel";
import { WidgetLibrarySheet } from "@/components/arc/WidgetLibrarySheet";
import { AiSuggestionsSheet, type LayoutAction } from "@/components/arc/AiSuggestionsSheet";
import { renderWidget } from "@/components/arc/epmoWidgetRenderer";
import { DEFAULT_LAYOUT, getWidget } from "@/config/epmoWidgets";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { arcSeed } from "@/config/arcData";

const ragCounts = { Green: 0, Amber: 0, Red: 0 };
demandInitiatives.forEach((p) => {
  const r = arcSeed(p.id, 0);
  if (r < 0.5) ragCounts.Green++;
  else if (r < 0.8) ragCounts.Amber++;
  else ragCounts.Red++;
});

const totalPlannedBudget = demandInitiatives.reduce((s, p) => s + p.estimatedTotalBudget, 0);
const totalActualSpend = +(totalPlannedBudget * 0.47).toFixed(1);

// Most-viewed widgets — used for subtle indicator dots
const MOST_VIEWED = new Set(["attention", "spendOverview"]);

const NARRATIVE = "17 projects are off track this week, a 12% increase from last month. Budget variance is widening in Clinical Informatics and Patient Experience portfolios — both are trending toward end-of-year overrun if current burn rates hold. Three escalations remain unresolved past their SLA. Recommend reviewing the ADA Compliance and Epic EHR programs in this week's governance meeting.";

const ACTIONS = [
  "Review ADA Compliance and Epic EHR in governance meeting",
  "Resolve 3 SLA-breached escalations",
  "Investigate Clinical Informatics burn rate",
];

function gridSpan(id: string): string {
  const def = getWidget(id);
  if (!def) return "xl:col-span-1";
  if (def.size === "full") return "xl:col-span-3";
  if (def.size === "twoThirds") return "xl:col-span-2";
  return "xl:col-span-1";
}

export default function EPMODashboard() {
  const isLoading = useChartLoading();

  // Layout state
  const [layout, setLayout] = useState<string[]>(DEFAULT_LAYOUT);
  const [savedLayout, setSavedLayout] = useState<string[]>(DEFAULT_LAYOUT);
  const [editMode, setEditMode] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  const enterEdit = () => {
    setSavedLayout(layout);
    setEditMode(true);
  };
  const cancelEdit = () => {
    setLayout(savedLayout);
    setEditMode(false);
    setLibraryOpen(false);
    setSuggestionsOpen(false);
    toast("Changes discarded");
  };
  const saveEdit = () => {
    setSavedLayout(layout);
    setEditMode(false);
    setLibraryOpen(false);
    setSuggestionsOpen(false);
    toast.success("Layout saved");
  };
  const resetDefault = () => {
    setLayout(DEFAULT_LAYOUT);
    toast("Reset to default layout");
  };

  const handleAdd = (id: string) => {
    setLayout((l) => (l.includes(id) ? l : [...l, id]));
    toast.success(`${getWidget(id)?.name} added`);
  };
  const handleRemove = (id: string) => {
    setLayout((l) => l.filter((x) => x !== id));
  };

  const handleAiAction = (a: LayoutAction) => {
    setLayout((current) => {
      const next = [...current];
      const idx = next.indexOf(a.widgetId);
      switch (a.type) {
        case "add":
          if (idx === -1) next.push(a.widgetId);
          return next;
        case "remove":
          return next.filter((x) => x !== a.widgetId);
        case "moveTop":
          if (idx > -1) next.splice(idx, 1);
          next.unshift(a.widgetId);
          return next;
        case "expand":
          if (idx === -1) next.push(a.widgetId);
          return next;
      }
    });
    // Auto-enter edit mode so the change is reviewable before save
    if (!editMode) {
      setSavedLayout(layout);
      setEditMode(true);
    }
  };

  const applyTemplate = (newLayout: string[]) => {
    if (!editMode) {
      setSavedLayout(layout);
      setEditMode(true);
    }
    setLayout(newLayout);
    setSuggestionsOpen(false);
  };

  const presentIds = useMemo(() => layout, [layout]);

  return (
    <AppLayout title="EPMO Dashboard" titleIcon={<ReportTitleIcon icon={LayoutDashboard} bg="#A5A3F5" />} headerTrailing={<ReportShareButton />}>
      <div className="space-y-6 max-w-[1530px] mx-auto pb-32">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-display text-foreground">Healthcare EPMO</h1>
            <p className="text-body text-muted-foreground mt-1">Continuous Planning Platform</p>
          </div>

          {!editMode && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setSuggestionsOpen(true)}
                className="gap-2"
                style={{ color: "hsl(245 70% 50%)" }}
              >
                <AiIcon className="h-4 w-4" /> Optimize with AI
              </Button>
              <Button variant="outline" onClick={enterEdit} className="gap-2">
                <Pencil className="h-3.5 w-3.5" /> Edit Dashboard
              </Button>
            </div>
          )}
        </div>

        {/* AI Executive Summary */}
        <AiSummaryPanel
          narrative={NARRATIVE}
          actions={ACTIONS}
          asOf="Mar 20, 2027"
          refreshedAgo="2h ago"
        />

        {/* Hero KPI strip */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex items-center gap-6 lg:pr-8 lg:border-r-2 border-border">
              <div>
                <div className="text-display text-foreground">EPMO Dashboard</div>
                <p className="text-body text-muted-foreground mt-1">Daily operating view — state of the plan at a glance</p>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
              <div className="text-center">
                <span className="text-[1.5rem] font-semibold text-foreground block">{demandInitiatives.length}</span>
                <span className="text-caption text-muted-foreground">Active Projects</span>
              </div>
              <div className="text-center">
                <span className="text-[1.5rem] font-semibold text-destructive block">{ragCounts.Red}</span>
                <span className="text-caption text-muted-foreground">Off Track</span>
              </div>
              <div className="text-center">
                <span className="text-[1.5rem] font-semibold text-warning block">{ragCounts.Amber}</span>
                <span className="text-caption text-muted-foreground">At Risk</span>
              </div>
              <div className="text-center">
                <span className="text-[1.5rem] font-semibold text-foreground block">${totalActualSpend}M</span>
                <span className="text-caption text-muted-foreground">Spent of ${totalPlannedBudget.toFixed(0)}M</span>
              </div>
            </div>
          </div>
        </div>

        {/* Widget grid */}
        <div className={cn("grid grid-cols-1 xl:grid-cols-3 gap-6", editMode && "pt-3")}>
          {layout.map((id) => (
            <Fragment key={id}>
              <div className={cn(gridSpan(id))}>
                {renderWidget({
                  id,
                  isLoading,
                  editMode,
                  onRemove: () => handleRemove(id),
                  mostViewed: !editMode && MOST_VIEWED.has(id),
                })}
              </div>
            </Fragment>
          ))}
          {layout.length === 0 && (
            <div className="xl:col-span-3 rounded-xl border-2 border-dashed border-border p-12 text-center">
              <p className="text-sm text-muted-foreground mb-3">No widgets on this dashboard.</p>
              <Button onClick={() => setLibraryOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Add Widget
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Edit Mode toolbar */}
      {editMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <div className="bg-card rounded-full border border-border shadow-elevated px-2 py-2 flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setLibraryOpen(true)} className="rounded-full gap-2">
              <Plus className="h-4 w-4" /> Add Widget
            </Button>
            <div className="h-5 w-px bg-border mx-1" />
            <Button
              size="sm"
              onClick={() => setSuggestionsOpen(true)}
              className="rounded-full gap-2 text-white"
              style={{
                background: "linear-gradient(135deg, hsl(245 70% 60%), hsl(265 65% 65%))",
              }}
            >
              <AiIcon className="h-4 w-4" /> AI Suggestions
            </Button>
            <div className="h-5 w-px bg-border mx-1" />
            <Button variant="ghost" size="sm" onClick={resetDefault} className="rounded-full gap-2">
              <RotateCcw className="h-4 w-4" /> Reset to Default
            </Button>
            <div className="h-5 w-px bg-border mx-1" />
            <Button variant="ghost" size="sm" onClick={cancelEdit} className="rounded-full gap-2">
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button size="sm" onClick={saveEdit} className="rounded-full gap-2">
              <Save className="h-4 w-4" /> Save Layout
            </Button>
          </div>
        </div>
      )}

      <WidgetLibrarySheet
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        presentIds={presentIds}
        onAdd={handleAdd}
      />

      <AiSuggestionsSheet
        open={suggestionsOpen}
        onOpenChange={setSuggestionsOpen}
        presentIds={presentIds}
        onApplyAction={handleAiAction}
        onApplyTemplate={applyTemplate}
      />
    </AppLayout>
  );
}
