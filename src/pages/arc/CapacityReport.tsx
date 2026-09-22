import { AppLayout } from "@/components/arc/AppLayout";
import { demandInitiatives, CAPACITY_GUARDRAILS, arcSeed } from "@/config/arcData";
import { cn } from "@/lib/utils";
import { CHART_COLORS } from "@/lib/chartColors";
import { Users, AlertCircle, TrendingUp, Network } from "lucide-react";
import { ReportTitleIcon, ReportShareButton } from "@/components/arc/ReportHeaderBits";
import { WidgetMenu, tooltipStyle } from "@/components/arc/WidgetMenu";
import { ChartSkeleton, useChartLoading } from "@/components/arc/ChartSkeleton";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";

const ROLES = ["Clinical Informaticist", "Data Engineer", "PM", "EHR Analyst", "Business Analyst", "Software Engineer", "QA Analyst", "Security Analyst", "UX Designer", "DevOps Engineer"];

interface ProjectRow {
  projectName: string; portfolio: string; role: string;
  plannedFTEs: number; actualFTEs: number; variance: number;
}

const rows: ProjectRow[] = [];
demandInitiatives.slice(0, 25).forEach((proj) => {
  const roleCount = Math.floor(arcSeed(proj.id, 0) * 3) + 1;
  for (let r = 0; r < roleCount; r++) {
    const role = ROLES[Math.floor(arcSeed(proj.id, r + 1) * ROLES.length)];
    const planned = Math.floor(arcSeed(proj.id, r + 10) * 6) + 1;
    const actual = Math.max(0, planned + Math.floor(arcSeed(proj.id, r + 20) * 5) - 2);
    rows.push({ projectName: proj.name, portfolio: proj.department, role, plannedFTEs: planned, actualFTEs: actual, variance: actual - planned });
  }
});

const byRole = ROLES.map((role) => {
  const rr = rows.filter((r) => r.role === role);
  return {
    role: role.length > 14 ? role.slice(0, 13) + "…" : role,
    fullRole: role,
    Planned: rr.reduce((s, r) => s + r.plannedFTEs, 0),
    Actual: rr.reduce((s, r) => s + r.actualFTEs, 0),
  };
}).filter((r) => r.Planned > 0);

const portfolioNames = [...new Set(rows.map((r) => r.portfolio))];
const byPortfolio = portfolioNames.map((p) => {
  const pr = rows.filter((r) => r.portfolio === p);
  return {
    portfolio: p.length > 14 ? p.slice(0, 13) + "…" : p,
    Planned: pr.reduce((s, r) => s + r.plannedFTEs, 0),
    Actual: pr.reduce((s, r) => s + r.actualFTEs, 0),
  };
});

const monthlyTrend = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => {
  const base = 42 + Math.sin(i * 0.5) * 8;
  return {
    month: m,
    Planned: Math.round(base + i * 0.5),
    Actual: i < 6 ? Math.round(base + i * 0.5 + Math.sin(i * 1.3) * 5) : undefined,
    Forecast: i >= 5 ? Math.round(base + i * 0.3 + 2) : undefined,
  };
});

const totalPlanned = rows.reduce((s, r) => s + r.plannedFTEs, 0);
const totalActual = rows.reduce((s, r) => s + r.actualFTEs, 0);
const utilizationPct = ((totalActual / totalPlanned) * 100).toFixed(1);
const overAllocated = byRole.filter((r) => r.Actual > r.Planned);

const capacityIssueProjects = demandInitiatives.slice(0, 25).map((proj) => {
  const projRows = rows.filter((r) => r.projectName === proj.name);
  const planned = projRows.reduce((s, r) => s + r.plannedFTEs, 0);
  const actual = projRows.reduce((s, r) => s + r.actualFTEs, 0);
  const variance = actual - planned;
  return {
    id: proj.id, name: proj.name, portfolio: proj.department, priority: proj.priority,
    sponsor: proj.projectSponsor, manager: proj.projectManager,
    plannedFTEs: planned, actualFTEs: actual, variance,
    utilization: planned > 0 ? Math.round((actual / planned) * 100) : 0,
    riskLevel: proj.riskLevel,
    primaryRole: proj.criticalRolesRequired,
    status: variance > 0 ? "Over-allocated" : variance < -1 ? "Under-staffed" : "At capacity",
  };
}).filter((p) => p.variance !== 0).sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));

const pillBase = "text-xs font-semibold px-2.5 py-1 rounded-lg inline-block border";
const pill = (v: string) => {
  if (["Critical", "High", "Off Track", "Over-allocated"].includes(v)) return cn(pillBase, "bg-destructive/10 text-destructive border-destructive/20");
  if (["Medium", "Watch", "At Risk", "Under-staffed"].includes(v)) return cn(pillBase, "bg-warning/10 text-warning border-warning/20");
  return cn(pillBase, "bg-success/10 text-success border-success/20");
};

export default function CapacityReport() {
  const isLoading = useChartLoading();
  return (
    <AppLayout title="Capacity Report" titleIcon={<ReportTitleIcon icon={Network} bg="#7DD3C0" />} headerTrailing={<ReportShareButton />}>
      <div className="space-y-6 max-w-[1530px] mx-auto">
        {/* Hero */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex items-center gap-6 lg:pr-8 lg:border-r-2 border-border">
              <div className="text-display text-foreground">{totalActual}<span className="text-3xl text-muted-foreground font-semibold"> FTEs</span></div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2"><Users className="h-5 w-5 text-foreground" /><span className="text-headline text-foreground">{utilizationPct}% Utilized</span></div>
                <span className="text-caption text-muted-foreground">of {totalPlanned} planned FTEs across all portfolios</span>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                <span className="text-caption font-medium text-muted-foreground block mb-1">Planned</span>
                <span className="text-[1.5rem] font-semibold text-foreground block">{totalPlanned} FTEs</span>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                <span className="text-caption font-medium text-muted-foreground block mb-1">Actual</span>
                <span className="text-[1.5rem] font-semibold text-foreground block">{totalActual} FTEs</span>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                <span className="text-caption font-medium text-muted-foreground block mb-1">Variance</span>
                <span className={cn("text-[1.5rem] font-semibold block", totalActual - totalPlanned > 0 ? "text-destructive" : "text-success")}>
                  {totalActual - totalPlanned > 0 ? "+" : ""}{totalActual - totalPlanned}
                </span>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                <span className="text-caption font-medium text-muted-foreground block mb-1">Max Util.</span>
                <span className="text-[1.5rem] font-semibold text-foreground block">{CAPACITY_GUARDRAILS.utilization.max}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-headline text-foreground flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Capacity Trend</h3>
                <p className="text-caption text-muted-foreground mt-1">Monthly FTE allocation</p>
              </div>
              <WidgetMenu widgetName="Capacity Trend" />
            </div>
            <div className="h-[260px]">
              {isLoading ? <ChartSkeleton type="area" height="260px" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="capP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART_COLORS[3]} stopOpacity={0.15} /><stop offset="95%" stopColor={CHART_COLORS[3]} stopOpacity={0} /></linearGradient>
                      <linearGradient id="capA" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.25} /><stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} /></linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={40} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="Planned" stroke={CHART_COLORS[3]} strokeWidth={2} strokeDasharray="6 4" fill="url(#capP)" dot={false} />
                    <Area type="monotone" dataKey="Actual" stroke={CHART_COLORS[0]} strokeWidth={2} fill="url(#capA)" dot={{ r: 3, fill: CHART_COLORS[0] }} />
                    <Area type="monotone" dataKey="Forecast" stroke={CHART_COLORS[1]} strokeWidth={2} strokeDasharray="4 3" fill="none" dot={{ r: 3, fill: CHART_COLORS[1] }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex items-center justify-center gap-6 mt-2 text-caption text-muted-foreground">
              <div className="flex items-center gap-2"><div className="w-6 h-0.5 border-t-2 border-dashed" style={{ borderColor: CHART_COLORS[3] }} /><span>Planned</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: CHART_COLORS[0] }} /><span>Actual</span></div>
              <div className="flex items-center gap-2"><div className="w-6 h-0.5 border-t-2 border-dashed" style={{ borderColor: CHART_COLORS[1] }} /><span>Forecast</span></div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-headline text-foreground flex items-center gap-2"><Users className="h-4 w-4" /> Demand by Role</h3>
                <p className="text-caption text-muted-foreground mt-1">Planned vs. actual FTEs per role</p>
              </div>
              <WidgetMenu widgetName="Demand by Role" />
            </div>
            <div className="h-[260px]">
              {isLoading ? <ChartSkeleton type="horizontal-bar" height="260px" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byRole} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis type="category" dataKey="role" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={110} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="Planned" fill={CHART_COLORS[2]} radius={[0, 4, 4, 0]} barSize={10} />
                    <Bar dataKey="Actual" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} barSize={10} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex items-center justify-center gap-6 mt-2 text-caption text-muted-foreground">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: CHART_COLORS[2] }} /><span>Planned</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: CHART_COLORS[0] }} /><span>Actual</span></div>
            </div>
          </div>
        </div>

        {/* Portfolio Allocation */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-headline text-foreground">Portfolio Allocation</h3>
              <p className="text-caption text-muted-foreground mt-1">FTE distribution across portfolios</p>
            </div>
            <WidgetMenu widgetName="Portfolio Allocation" />
          </div>
          <div className="h-[220px]">
            {isLoading ? <ChartSkeleton height="220px" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byPortfolio} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="portfolio" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="Planned" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="Actual" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          {overAllocated.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {overAllocated.map((r, idx) => (
                <span key={idx} className="text-caption px-2 py-1 rounded-md border border-border bg-secondary flex items-center gap-1 font-semibold">
                  <AlertCircle className="h-3 w-3" />
                  {r.fullRole} +{r.Actual - r.Planned} over
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Issues Table */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary border border-border"><AlertCircle className="h-4 w-4 text-foreground" /></div>
              <div>
                <h3 className="text-headline text-foreground">Projects with Capacity Issues</h3>
                <p className="text-caption text-muted-foreground mt-0.5">{capacityIssueProjects.length} projects with staffing variances</p>
              </div>
            </div>
            <WidgetMenu widgetName="Capacity Issues" />
          </div>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-[1200px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["ID", "Project", "Portfolio", "Priority", "Status", "Planned", "Actual", "Variance", "Util %", "Risk", "Key Role", "Sponsor"].map((h) => (
                    <th key={h} className="text-caption font-semibold text-muted-foreground pb-3 pr-4 whitespace-nowrap text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {capacityIssueProjects.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2.5 pr-4 text-caption text-muted-foreground font-mono">{p.id}</td>
                    <td className="py-2.5 pr-4 font-medium text-foreground min-w-[240px]">{p.name}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{p.portfolio}</td>
                    <td className="py-2.5 pr-4"><span className={pill(p.priority)}>{p.priority}</span></td>
                    <td className="py-2.5 pr-4"><span className={pill(p.status)}>{p.status}</span></td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">{p.plannedFTEs}</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">{p.actualFTEs}</td>
                    <td className={cn("py-2.5 pr-4 text-right tabular-nums font-semibold", p.variance > 0 ? "text-destructive" : "text-warning")}>{p.variance > 0 ? "+" : ""}{p.variance}</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">{p.utilization}%</td>
                    <td className="py-2.5 pr-4"><span className={pill(p.riskLevel)}>{p.riskLevel}</span></td>
                    <td className="py-2.5 pr-4 text-muted-foreground text-caption">{p.primaryRole}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground text-caption">{p.sponsor}</td>
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
