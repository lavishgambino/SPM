import { useEffect, useState } from "react";
import { AppLayout } from "@/components/arc/AppLayout";
import { DollarSign, Zap, Users, Target, Save, Play, Trash2 } from "lucide-react";
import { ShareButton } from "@/components/claude/ShareButton";
import { SummaryCard, PriorityStack, CapacityHeatmap } from "@/components/claude/ScenarioPlanPanel";
import { toast } from "sonner";

interface ImplementedScenario {
  id: string;
  label: string;
  longDesc?: string;
  totalBudget: number;
  envelopeBudget: number;
  fundedCount: number;
  fundedFTEs: number;
  capacity: number;
  capUtil: number;
  peakUtil: number;
}

const fmtMoney = (n: number): string => {
  if (!Number.isFinite(n)) return "0";
  const r = Math.round(n * 100) / 100;
  return Number.isInteger(r) ? `${r}` : r.toFixed(2).replace(/\.?0+$/, "");
};

export default function ActivePlans() {
  const [implemented, setImplemented] = useState<ImplementedScenario | null>(null);

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem("arc:implementedScenario");
        setImplemented(raw ? JSON.parse(raw) : null);
      } catch {
        setImplemented(null);
      }
    };
    read();
    const onUpdated = () => read();
    window.addEventListener("arc:scenarioImplemented", onUpdated);
    window.addEventListener("storage", onUpdated);
    return () => {
      window.removeEventListener("arc:scenarioImplemented", onUpdated);
      window.removeEventListener("storage", onUpdated);
    };
  }, []);

  // Empty state — no scenario implemented yet
  if (!implemented) {
    return (
      <AppLayout title="Active Plan">
        <div className="max-w-[1530px] mx-auto">
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <h2 className="text-lg font-semibold text-foreground mb-2">No active plan yet</h2>
            <p className="text-sm text-muted-foreground">
              Implement a scenario from <span className="font-medium text-foreground">Scenarios</span> to make it your active plan.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const {
    label,
    longDesc,
    totalBudget,
    envelopeBudget,
    fundedCount,
    fundedFTEs,
    capacity,
    capUtil,
    peakUtil,
    id,
  } = implemented;

  const velocityToCapacity = envelopeBudget > 0 ? Math.round((totalBudget / envelopeBudget) * 100) : 0;

  return (
    <AppLayout title="Active Plan">
      <div className="space-y-4 max-w-[1530px] mx-auto">
        {/* Header — title + description + actions */}
        <div>
          <div className="mb-3">
            <h1 className="text-lg font-bold text-foreground">FY27 — Annual Plan</h1>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {longDesc ||
                `${label} is your committed plan, prioritizing a balanced portfolio across the strategic themes while respecting capacity and budget guardrails.`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors">
              <Save className="h-3.5 w-3.5" />
              Save
            </button>
            <ShareButton />
            <button
              disabled
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/60 text-xs font-medium text-primary-foreground cursor-default"
            >
              <Play className="h-3.5 w-3.5" />
              Implemented
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("arc:implementedScenario");
                window.dispatchEvent(new CustomEvent("arc:scenarioImplemented"));
                toast.success("Active plan cleared");
              }}
              className="ml-auto inline-flex items-center justify-center w-7 h-7 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
              title="Clear active plan"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard
            icon={DollarSign}
            label="Total Budget"
            value={`$${fmtMoney(totalBudget)}M`}
            sub={`of $${fmtMoney(envelopeBudget)}M envelope`}
          />
          <SummaryCard
            icon={Zap}
            label="Velocity to Capacity"
            value={`${velocityToCapacity}%`}
            sub={`$${fmtMoney(envelopeBudget - totalBudget)}M remaining`}
          />
          <SummaryCard
            icon={Users}
            label="Total FTEs"
            value={fundedFTEs.toLocaleString()}
            sub={`of ${capacity.toLocaleString()} cap`}
          />
          <SummaryCard
            icon={Target}
            label="Capacity Utilization"
            value={`${capUtil}%`}
            sub={`Target: 82%`}
          />
        </div>

        {/* Priority Stack */}
        <PriorityStack fundedCount={fundedCount} totalBudget={totalBudget} />

        {/* Capacity Heatmap */}
        <CapacityHeatmap
          peakUtil={peakUtil}
          scenarioId={id}
          fundedCount={fundedCount}
          capacity={capacity}
        />
      </div>
    </AppLayout>
  );
}
