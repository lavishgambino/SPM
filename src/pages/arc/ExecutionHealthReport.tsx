import { AppLayout } from "@/components/arc/AppLayout";
import { demandInitiatives, arcSeed } from "@/config/arcData";
import { cn } from "@/lib/utils";
import { CHART_COLORS } from "@/lib/chartColors";
import { AlertTriangle, CheckCircle2, Activity, HeartPulse } from "lucide-react";
import { ReportTitleIcon, ReportShareButton } from "@/components/arc/ReportHeaderBits";
import { WidgetMenu, tooltipStyle } from "@/components/arc/WidgetMenu";
import { ChartSkeleton, useChartLoading } from "@/components/arc/ChartSkeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

const RAG_OPTIONS = ["Green", "Amber", "Red"] as const;
const MILESTONE_STATUS = ["On Track", "At Risk", "Delayed", "Complete"] as const;

const rows = demandInitiatives.slice(0, 30).map((proj, i) => {
  const r = (idx: number) => arcSeed(proj.id, idx);
  const ragIdx = r(0) < 0.5 ? 0 : r(0) < 0.8 ? 1 : 2;
  const milIdx = r(1) < 0.4 ? 0 : r(1) < 0.65 ? 3 : r(1) < 0.85 ? 1 : 2;
  const schedVar = Math.floor(r(2) * 60) - 15;
  const planned = proj.estimatedTotalBudget;
  const projected = +(planned * (0.88 + r(3) * 0.3)).toFixed(2);
  const budgetVar = +((projected - planned) / planned * 100).toFixed(0);
  const hasDep = r(4) > 0.75 && schedVar > 14;
  return {
    id: proj.id, name: proj.name, portfolio: proj.department, priorityRank: i + 1,
    rag: RAG_OPTIONS[ragIdx], milestoneStatus: MILESTONE_STATUS[milIdx],
    scheduleVariance: schedVar, plannedBudget: planned, projectedSpend: projected,
    budgetVariance: budgetVar, hasDependencyConflict: hasDep,
    dependencyNote: hasDep ? `Blocks PRJ-${String(Math.floor(r(5) * 30) + 1).padStart(3, "0")}` : undefined,
    priority: proj.priority, riskLevel: proj.riskLevel,
    sponsor: proj.projectSponsor, manager: proj.projectManager, ftes: proj.estimatedFTEs,
  };
});

const greenCount = rows.filter((r) => r.rag === "Green").length;
const amberCount = rows.filter((r) => r.rag === "Amber").length;
const redCount = rows.filter((r) => r.rag === "Red").length;
const depConflicts = rows.filter((r) => r.hasDependencyConflict).length;
const isHighlighted = (r: typeof rows[number]) => r.rag === "Red" || r.scheduleVariance > 14 || r.budgetVariance > 10;

const ragDonut = [
  { name: "Red", value: redCount, fill: CHART_COLORS[12] },
  { name: "Amber", value: amberCount, fill: CHART_COLORS[7] },
  { name: "Green", value: greenCount, fill: CHART_COLORS[5] },
];

const schedBuckets = [
  { label: "< 0d", count: rows.filter((r) => r.scheduleVariance < 0).length },
  { label: "0–7d", count: rows.filter((r) => r.scheduleVariance >= 0 && r.scheduleVariance <= 7).length },
  { label: "8–14d", count: rows.filter((r) => r.scheduleVariance > 7 && r.scheduleVariance <= 14).length },
  { label: "15–30d", count: rows.filter((r) => r.scheduleVariance > 14 && r.scheduleVariance <= 30).length },
  { label: "> 30d", count: rows.filter((r) => r.scheduleVariance > 30).length },
];

const pillBase = "text-xs font-semibold px-2.5 py-1 rounded-lg inline-block border";
const pill = (v: string) => {
  if (["Red", "Critical", "High", "Delayed", "Off Track"].includes(v)) return cn(pillBase, "bg-destructive/10 text-destructive border-destructive/20");
  if (["Amber", "Medium", "At Risk", "Watch"].includes(v)) return cn(pillBase, "bg-warning/10 text-warning border-warning/20");
  return cn(pillBase, "bg-success/10 text-success border-success/20");
};

export default function ExecutionHealthReport() {
  const isLoading = useChartLoading();
  return (
    <AppLayout title="Execution Health" titleIcon={<ReportTitleIcon icon={HeartPulse} bg="#EF8A8A" />} headerTrailing={<ReportShareButton />}>
      <div className="space-y-6 max-w-[1530px] mx-auto">
        <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex items-center gap-6 lg:pr-8 lg:border-r-2 border-border">
              <div className="text-display text-foreground">{greenCount}<span className="text-3xl text-muted-foreground font-semibold">/{rows.length}</span></div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-success" /><span className="text-headline text-foreground">Projects on Track</span></div>
                <span className="text-caption text-muted-foreground">Sorted by priority rank</span>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-secondary/50 rounded-lg p-4 border border-border"><span className="text-caption font-medium text-muted-foreground block mb-1">Green</span><span className="text-title text-success">{greenCount}</span></div>
              <div className="bg-secondary/50 rounded-lg p-4 border border-border"><span className="text-caption font-medium text-muted-foreground block mb-1">Amber</span><span className="text-title text-warning">{amberCount}</span></div>
              <div className="bg-secondary/50 rounded-lg p-4 border border-border"><span className="text-caption font-medium text-muted-foreground block mb-1">Red</span><span className="text-title text-destructive">{redCount}</span></div>
              <div className="bg-secondary/50 rounded-lg p-4 border border-border"><span className="text-caption font-medium text-muted-foreground block mb-1">Dep. Conflicts</span><span className="text-title text-foreground">{depConflicts}</span></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-headline text-foreground flex items-center gap-2"><Activity className="h-4 w-4" /> RAG Distribution</h3>
                <p className="text-caption text-muted-foreground mt-1">Project health breakdown</p>
              </div>
              <WidgetMenu widgetName="RAG Distribution" />
            </div>
            <div className="h-[200px]">
              {isLoading ? <ChartSkeleton type="pie" height="200px" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ragDonut} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} strokeWidth={0}>
                      {ragDonut.map((e, idx) => <Cell key={idx} fill={e.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex items-center justify-center gap-6 mt-2 text-caption">
              {ragDonut.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.fill }} />
                  <span className="text-muted-foreground">{r.name}</span>
                  <span className="font-semibold text-foreground">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-headline text-foreground flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Schedule Variance</h3>
                <p className="text-caption text-muted-foreground mt-1">Distribution of schedule drift</p>
              </div>
              <WidgetMenu widgetName="Schedule Variance" />
            </div>
            <div className="h-[200px]">
              {isLoading ? <ChartSkeleton height="200px" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={schedBuckets} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={36}>
                      {schedBuckets.map((_, idx) => <Cell key={idx} fill={CHART_COLORS[idx]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary border border-border"><Activity className="h-4 w-4 text-foreground" /></div>
              <div>
                <h3 className="text-headline text-foreground">Execution Health by Project</h3>
                <p className="text-caption text-muted-foreground mt-0.5">Sorted by priority rank · {rows.filter(isHighlighted).length} flagged</p>
              </div>
            </div>
            <WidgetMenu widgetName="Execution Health" />
          </div>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-[1300px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Rank", "ID", "Project", "Portfolio", "Priority", "RAG", "Milestone", "Sched Δ", "Budget Δ", "Budget", "FTEs", "Risk", "Sponsor", "Dep."].map((h) => (
                    <th key={h} className="text-caption font-semibold text-muted-foreground pb-3 pr-4 whitespace-nowrap text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2.5 pr-4 text-caption text-muted-foreground tabular-nums">{r.priorityRank}</td>
                    <td className="py-2.5 pr-4 text-caption text-muted-foreground font-mono">{r.id}</td>
                    <td className="py-2.5 pr-4 font-medium text-foreground min-w-[240px]">{r.name}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{r.portfolio}</td>
                    <td className="py-2.5 pr-4"><span className={pill(r.priority)}>{r.priority}</span></td>
                    <td className="py-2.5 pr-4"><span className={pill(r.rag)}>{r.rag}</span></td>
                    <td className="py-2.5 pr-4"><span className={pill(r.milestoneStatus)}>{r.milestoneStatus}</span></td>
                    <td className={cn("py-2.5 pr-4 text-right tabular-nums font-semibold", r.scheduleVariance > 14 ? "text-destructive" : r.scheduleVariance > 0 ? "text-warning" : "text-success")}>{r.scheduleVariance > 0 ? "+" : ""}{r.scheduleVariance}d</td>
                    <td className={cn("py-2.5 pr-4 text-right tabular-nums font-semibold", r.budgetVariance > 10 ? "text-destructive" : r.budgetVariance > 0 ? "text-warning" : "text-success")}>{r.budgetVariance > 0 ? "+" : ""}{r.budgetVariance}%</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">${r.plannedBudget}M</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">{r.ftes}</td>
                    <td className="py-2.5 pr-4"><span className={pill(r.riskLevel)}>{r.riskLevel}</span></td>
                    <td className="py-2.5 pr-4 text-muted-foreground text-caption">{r.sponsor}</td>
                    <td className="py-2.5 pr-4 text-caption text-muted-foreground min-w-[160px]">{r.dependencyNote ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
