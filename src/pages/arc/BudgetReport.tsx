import { AppLayout } from "@/components/arc/AppLayout";
import { demandInitiatives, BUDGET_GUARDRAILS, arcSeed } from "@/config/arcData";
import { cn } from "@/lib/utils";
import { CHART_COLORS } from "@/lib/chartColors";
import { DollarSign, AlertCircle, AlertTriangle, BarChart3 } from "lucide-react";
import { ReportTitleIcon, ReportShareButton } from "@/components/arc/ReportHeaderBits";
import { WidgetMenu, tooltipStyle } from "@/components/arc/WidgetMenu";
import { ChartSkeleton, useChartLoading } from "@/components/arc/ChartSkeleton";
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell, ComposedChart, Bar, Line,
  PieChart, Pie,
} from "recharts";

const rows = demandInitiatives.slice(0, 30).map((proj) => {
  const planned = proj.estimatedTotalBudget;
  const actualPct = 0.3 + arcSeed(proj.id, 0) * 0.5;
  const actual = +(planned * actualPct).toFixed(2);
  const projFactor = 0.85 + arcSeed(proj.id, 1) * 0.35;
  const projected = +(planned * projFactor).toFixed(2);
  return {
    id: proj.id, name: proj.name, portfolio: proj.department,
    plannedBudget: planned, budgetType: proj.capexOpexSplit,
    actualSpend: actual, projectedTotal: projected,
    variance: +(projected - planned).toFixed(2),
    pctConsumed: +((actual / planned) * 100).toFixed(0),
    overBudget: projected > planned * 1.1,
    priority: proj.priority, riskLevel: proj.riskLevel,
    sponsor: proj.projectSponsor, manager: proj.projectManager,
  };
});

const grandPlanned = rows.reduce((s, r) => s + r.plannedBudget, 0);
const grandActual = rows.reduce((s, r) => s + r.actualSpend, 0);
const grandProjected = rows.reduce((s, r) => s + r.projectedTotal, 0);
const overBudgetCount = rows.filter((r) => r.overBudget).length;

const monthlySpend = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => {
  const base = grandPlanned / 12;
  return {
    month: m,
    Planned: +base.toFixed(1),
    Actual: i < 6 ? +(base * (0.85 + arcSeed("month", i) * 0.3)).toFixed(1) : undefined,
    Forecast: i >= 5 ? +(base * (0.9 + arcSeed("fcast", i) * 0.25)).toFixed(1) : undefined,
  };
});

const portfolioNames = [...new Set(rows.map((r) => r.portfolio))];
const portfolioDonut = portfolioNames.map((p, i) => ({
  name: p.length > 16 ? p.slice(0, 15) + "…" : p,
  value: +rows.filter((r) => r.portfolio === p).reduce((s, r) => s + r.actualSpend, 0).toFixed(1),
  fill: CHART_COLORS[i % CHART_COLORS.length],
}));

const overBudgetProjects = rows.filter((r) => r.overBudget).map((r) => ({
  ...r, overPct: +((r.projectedTotal / r.plannedBudget - 1) * 100).toFixed(0),
  status: r.projectedTotal / r.plannedBudget > 1.2 ? "Critical" : r.projectedTotal / r.plannedBudget > 1.15 ? "At Risk" : "Watch",
}));

const pillBase = "text-xs font-semibold px-2.5 py-1 rounded-lg inline-block border";
const ragPill = (v: string) => {
  if (["Red", "Critical", "High", "Off Track"].includes(v)) return cn(pillBase, "bg-destructive/10 text-destructive border-destructive/20");
  if (["Amber", "At Risk", "Medium", "Watch"].includes(v)) return cn(pillBase, "bg-warning/10 text-warning border-warning/20");
  return cn(pillBase, "bg-success/10 text-success border-success/20");
};

export default function BudgetReport() {
  const isLoading = useChartLoading();
  return (
    <AppLayout title="Budget Report" titleIcon={<ReportTitleIcon icon={BarChart3} bg="#F4A28C" />} headerTrailing={<ReportShareButton />}>
      <div className="space-y-6 max-w-[1530px] mx-auto">
        {/* Hero */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex items-center gap-6 lg:pr-8 lg:border-r-2 border-border">
              <div className="text-display text-foreground">${grandActual.toFixed(1)}M</div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-foreground" />
                  <span className="text-headline text-foreground">{((grandActual / grandPlanned) * 100).toFixed(0)}% Consumed</span>
                </div>
                <span className="text-caption text-muted-foreground">of ${grandPlanned.toFixed(1)}M planned · Guardrail: ${BUDGET_GUARDRAILS.totalBudget}M</span>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { l: "Planned", v: `$${grandPlanned.toFixed(1)}M` },
                { l: "Actual YTD", v: `$${grandActual.toFixed(1)}M` },
                { l: "Projected", v: `$${grandProjected.toFixed(1)}M` },
                { l: "Over Budget", v: `${overBudgetCount} projects`, danger: overBudgetCount > 0 },
              ].map((k) => (
                <div key={k.l} className="bg-secondary/50 rounded-lg p-4 border border-border">
                  <span className="text-caption font-medium text-muted-foreground block mb-1">{k.l}</span>
                  <span className={cn("text-[1.5rem] font-semibold", k.danger ? "text-destructive" : "text-foreground")}>{k.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 shadow-soft">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-headline text-foreground flex items-center gap-2"><DollarSign className="h-4 w-4" /> Monthly Spend</h3>
                <p className="text-caption text-muted-foreground mt-1">Planned vs. actual vs. forecast ($M)</p>
              </div>
              <WidgetMenu widgetName="Monthly Spend" />
            </div>
            <div className="h-[260px]">
              {isLoading ? <ChartSkeleton height="260px" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlySpend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}M`} width={55} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${v}M`} />
                    <ReferenceLine x="Jun" stroke="hsl(var(--foreground))" strokeDasharray="3 3" strokeWidth={2} label={{ value: "Today", position: "top", fontSize: 10, fill: "hsl(var(--foreground))" }} />
                    <Line type="monotone" dataKey="Planned" stroke={CHART_COLORS[3]} strokeWidth={2} strokeDasharray="6 4" dot={false} />
                    <Bar dataKey="Actual" radius={[4, 4, 0, 0]} maxBarSize={28} fill={CHART_COLORS[0]} />
                    <Bar dataKey="Forecast" radius={[4, 4, 0, 0]} maxBarSize={28} fill={CHART_COLORS[2]} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex items-center justify-center gap-6 mt-2 text-caption text-muted-foreground">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: CHART_COLORS[0] }} /><span>Actual</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: CHART_COLORS[2] }} /><span>Forecast</span></div>
              <div className="flex items-center gap-2"><div className="w-6 h-0.5 border-t-2 border-dashed" style={{ borderColor: CHART_COLORS[3] }} /><span>Planned</span></div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-headline text-foreground">By Portfolio</h3>
                <p className="text-caption text-muted-foreground mt-1">Spend distribution</p>
              </div>
              <WidgetMenu widgetName="Portfolio Split" />
            </div>
            <div className="h-[200px]">
              {isLoading ? <ChartSkeleton type="pie" height="200px" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={portfolioDonut} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} strokeWidth={0}>
                      {portfolioDonut.map((e, idx) => <Cell key={idx} fill={e.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${v}M`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="space-y-1.5 mt-2 max-h-[140px] overflow-y-auto">
              {portfolioDonut.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-caption">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm" style={{ background: p.fill }} /><span className="text-muted-foreground">{p.name}</span></div>
                  <span className="font-medium text-foreground tabular-nums">${p.value}M</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FYE Forecast */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="text-caption font-medium text-muted-foreground">FYE Projected Total</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-metric">${grandProjected.toFixed(1)}M</span>
                <span className={cn("text-sm font-semibold", grandProjected > grandPlanned ? "text-destructive" : "text-success")}>
                  ({grandProjected > grandPlanned ? "+" : ""}${(grandProjected - grandPlanned).toFixed(1)}M vs plan)
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {rows.filter((r) => r.overBudget).slice(0, 4).map((r, idx) => (
                <span key={idx} className="text-caption px-2 py-1 rounded-md border border-border bg-secondary flex items-center gap-1 font-semibold">
                  <AlertCircle className="h-3 w-3" />
                  {r.name.length > 22 ? r.name.slice(0, 21) + "…" : r.name} +{((r.projectedTotal / r.plannedBudget - 1) * 100).toFixed(0)}%
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Over Budget Table */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary border border-border"><AlertTriangle className="h-4 w-4 text-foreground" /></div>
              <div>
                <h3 className="text-headline text-foreground">Projects Projected &gt;110% of Budget</h3>
                <p className="text-caption text-muted-foreground mt-0.5">{overBudgetProjects.length} projects exceeding threshold</p>
              </div>
            </div>
            <WidgetMenu widgetName="Over Budget Projects" />
          </div>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-[1300px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["ID", "Project", "Portfolio", "Priority", "Status", "Planned", "Actual YTD", "Projected", "Variance", "% Over", "Type", "Risk"].map((h) => (
                    <th key={h} className="text-caption font-semibold text-muted-foreground pb-3 pr-4 whitespace-nowrap text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overBudgetProjects.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2.5 pr-4 text-caption text-muted-foreground font-mono">{p.id}</td>
                    <td className="py-2.5 pr-4 font-medium text-foreground min-w-[240px]">{p.name}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{p.portfolio}</td>
                    <td className="py-2.5 pr-4"><span className={ragPill(p.priority)}>{p.priority}</span></td>
                    <td className="py-2.5 pr-4"><span className={ragPill(p.status)}>{p.status}</span></td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">${p.plannedBudget}M</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">${p.actualSpend}M</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">${p.projectedTotal}M</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-destructive font-semibold">+${p.variance}M</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-destructive font-semibold">+{p.overPct}%</td>
                    <td className="py-2.5 pr-4 text-muted-foreground text-caption">{p.budgetType}</td>
                    <td className="py-2.5 pr-4"><span className={ragPill(p.riskLevel)}>{p.riskLevel}</span></td>
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
