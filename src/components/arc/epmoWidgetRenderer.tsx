import { cn } from "@/lib/utils";
import { CHART_COLORS } from "@/lib/chartColors";
import { WidgetMenu, tooltipStyle } from "@/components/arc/WidgetMenu";
import { ChartSkeleton } from "@/components/arc/ChartSkeleton";
import { AiIcon } from "@/components/claude/AiIcon";
import {
  Activity, BarChart3, Target, DollarSign, Users, Shield,
  GitBranch, FileText, Minus, ExternalLink, TrendingUp, ListChecks,
  Network, AlertTriangle, Layers,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Legend, ComposedChart,
} from "recharts";
import { demandInitiatives, arcSeed } from "@/config/arcData";
import { getWidget } from "@/config/epmoWidgets";
import { X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import React from "react";

// ============== Shared data ==============
const ragCounts = { Green: 0, Amber: 0, Red: 0 };
demandInitiatives.forEach((p) => {
  const r = arcSeed(p.id, 0);
  if (r < 0.5) ragCounts.Green++;
  else if (r < 0.8) ragCounts.Amber++;
  else ragCounts.Red++;
});
const ragData = [
  { name: "On Track", value: ragCounts.Green, fill: CHART_COLORS[0] },
  { name: "At Risk",  value: ragCounts.Amber, fill: CHART_COLORS[2] },
  { name: "Off Track", value: ragCounts.Red,  fill: CHART_COLORS[12] },
];

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const healthTrend = months.map((m, i) => ({
  month: m,
  OnTrack: Math.round(22 + Math.sin(i * 0.4) * 3 - i * 0.3),
  AtRisk: Math.round(10 + Math.cos(i * 0.6) * 3 + i * 0.2),
  OffTrack: Math.round(5 + i * 0.15 + Math.sin(i) * 1.5),
}));

const portfolioSpend = [
  { name: "Digital & AI",   planned: 82, actual: 39, projected: 86 },
  { name: "Clinical Ops",   planned: 65, actual: 28, projected: 61 },
  { name: "Infrastructure", planned: 48, actual: 25, projected: 52 },
  { name: "Revenue Cycle",  planned: 42, actual: 19, projected: 40 },
  { name: "Compliance",     planned: 38, actual: 21, projected: 44 },
  { name: "Patient Exp.",   planned: 26, actual: 11, projected: 24 },
];

const milestoneRadar = [
  { dimension: "Budget", current: 78, target: 90 },
  { dimension: "Schedule", current: 65, target: 85 },
  { dimension: "Scope", current: 82, target: 90 },
  { dimension: "Quality", current: 88, target: 85 },
  { dimension: "Resources", current: 72, target: 80 },
  { dimension: "Risk Mgmt", current: 60, target: 75 },
];

const typeDistribution = [
  { name: "Change", value: demandInitiatives.filter((p) => p.initiativeType === "change").length, fill: CHART_COLORS[0] },
  { name: "Grow",   value: demandInitiatives.filter((p) => p.initiativeType === "grow").length,   fill: CHART_COLORS[2] },
  { name: "Run",    value: demandInitiatives.filter((p) => p.initiativeType === "run").length,    fill: CHART_COLORS[5] },
];

const burnRateData = months.map((m, i) => ({
  month: m,
  cumulative: Math.round((i + 1) * 4.2 + Math.sin(i) * 1.2),
  projected: i >= 6 ? Math.round((i + 1) * 4.5 + i * 0.3) : null,
}));

const budgetVsActual = portfolioSpend.map((p) => ({
  name: p.name, budget: p.planned, actual: p.actual, variance: p.actual - p.planned * 0.5,
}));

const capexOpex = [
  { name: "CapEx", value: 162, fill: CHART_COLORS[1] },
  { name: "OpEx", value: 139, fill: CHART_COLORS[2] },
];

const fteUtil = [
  { name: "Engineering",     planned: 42, actual: 48 },
  { name: "Clinical Systems", planned: 28, actual: 33 },
  { name: "Data & Analytics", planned: 18, actual: 22 },
  { name: "Security",         planned: 14, actual: 12 },
  { name: "PMO",              planned: 9,  actual: 10 },
];

const capacityHeatTeams = ["Engineering", "Clinical Systems", "Data & Analytics", "Security", "PMO"];
const capacityHeatQuarters = ["Q1", "Q2", "Q3", "Q4"];

const teamLoadData = capacityHeatTeams.map((t, i) => ({
  name: t,
  Q1: 65 + ((i * 7) % 25),
  Q2: 78 + ((i * 11) % 18),
  Q3: 90 + ((i * 5) % 12),
  Q4: 72 + ((i * 13) % 22),
}));

const decisionLog = [
  { id: "D-104", text: "Approved $1.4M scope expansion for Epic EHR Phase 2",            ts: "2h ago",  tag: "Budget" },
  { id: "D-103", text: "Deferred Mobile Patient Portal to FY28 Q1",                       ts: "1d ago",  tag: "Scope" },
  { id: "D-102", text: "Escalated ADA Compliance milestone slip to steering committee",   ts: "2d ago",  tag: "Risk" },
  { id: "D-101", text: "Reassigned Data Lake migration lead — Marcus Chen → Priya Patel", ts: "4d ago",  tag: "People" },
  { id: "D-100", text: "Closed Q1 capacity replan — net +6 FTEs reallocated",             ts: "1w ago",  tag: "Capacity" },
];

const escalationData = months.slice(0, 9).map((m, i) => ({
  month: m,
  raised: 4 + ((i * 3) % 6),
  resolved: 3 + ((i * 2) % 5),
}));

const approvalQueue = [
  { id: "PRJ-2041", name: "Cardiology Imaging AI Pilot",    submitter: "Dr. Lin Park",      days: 9, tier: "Committee",  override: true  },
  { id: "PRJ-2055", name: "Pharmacy Inventory Modernization", submitter: "Sarah Bennett",   days: 7, tier: "Committee",  override: false },
  { id: "PRJ-2068", name: "EHR Single Sign-On Refresh",      submitter: "Marcus Reilly",    days: 5, tier: "Auto-Route", override: false },
  { id: "PRJ-2079", name: "Patient Discharge Workflow Redesign", submitter: "Aisha Whitman", days: 4, tier: "Committee", override: false },
  { id: "PRJ-2084", name: "Data Lake Cost Optimization",     submitter: "Ravi Patel",       days: 3, tier: "Auto-Route", override: false },
  { id: "PRJ-2091", name: "Telehealth Capacity Expansion",   submitter: "Dr. Owen Reyes",   days: 2, tier: "Committee",  override: true  },
];

const programs = [
  { id: "P-01", name: "ADA Compliance",         rag: "Amber", complete: 62, observation: "Mobile Remediation milestone at risk of missing June deadline." },
  { id: "P-02", name: "Epic EHR Modernization", rag: "Green", complete: 78, observation: "On track. Phase 2 cutover planned for August." },
  { id: "P-03", name: "Clinical Data Lake",     rag: "Red",   complete: 41, observation: "Vendor delays threaten Q3 milestone — mitigation in progress." },
  { id: "P-04", name: "Patient Engagement",     rag: "Green", complete: 55, observation: "Steady delivery cadence; CSAT pilot tracking +8% above baseline." },
  { id: "P-05", name: "Cybersecurity Uplift",   rag: "Amber", complete: 49, observation: "Identity migration scope grew 15% — replan underway." },
];

// OKR heatmap: themes × portfolios with %
const themes = ["Digital Transformation", "Patient Safety", "Operational Excellence", "Workforce Resilience"];
const portfolios = ["Digital & AI", "Clinical Ops", "Infrastructure", "Revenue Cycle", "Compliance", "Patient Exp."];
const okrCells: Record<string, Record<string, number>> = {};
themes.forEach((t, ti) => {
  okrCells[t] = {};
  portfolios.forEach((p, pi) => {
    if (t === "Workforce Resilience") {
      okrCells[t][p] = 8 + ((ti + pi) * 5) % 22; // intentionally low
    } else {
      okrCells[t][p] = 25 + ((ti * 7 + pi * 11) % 60);
    }
  });
});

const pillBase = "text-xs font-semibold px-2.5 py-1 rounded-lg inline-block";
function ragPill(rag: string) {
  if (rag === "Red")   return cn(pillBase, "bg-destructive/10 text-destructive border border-destructive/20");
  if (rag === "Amber") return cn(pillBase, "bg-warning/10 text-warning border border-warning/20");
  return cn(pillBase, "bg-success/10 text-success border border-success/20");
}

const attentionProjects = demandInitiatives.slice(0, 35).map((proj) => {
  const r = (idx: number) => arcSeed(proj.id, idx);
  const ragVal = r(0) < 0.5 ? "Green" : r(0) < 0.8 ? "Amber" : "Red";
  const budgetVar = Math.round(r(1) * 30 - 8);
  const schedSlip = Math.round(r(2) * 35 - 5);
  const reasons: string[] = [];
  if (ragVal === "Red") reasons.push("Red RAG");
  if (budgetVar > 10) reasons.push(`Budget +${budgetVar}%`);
  if (schedSlip > 14) reasons.push(`Schedule +${schedSlip}d`);
  return {
    id: proj.id, name: proj.name, portfolio: proj.department, priority: proj.priority,
    rag: ragVal, budgetVariance: budgetVar, scheduleSlip: schedSlip, ftes: proj.estimatedFTEs,
    riskLevel: proj.riskLevel, sponsor: proj.projectSponsor, reason: reasons.length ? reasons.join(" · ") : "Watch list",
  };
}).filter((p) => p.rag !== "Green" || p.budgetVariance > 10 || p.scheduleSlip > 14)
  .sort((a, b) => {
    const score = (p: typeof attentionProjects[number]) =>
      (p.rag === "Red" ? 30 : p.rag === "Amber" ? 15 : 0) + Math.max(0, p.budgetVariance) + Math.max(0, p.scheduleSlip / 2);
    return score(b) - score(a);
  }).slice(0, 20);

// ============== Card chrome ==============
interface CardProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  isLoading: boolean;
  editMode: boolean;
  onRemove?: () => void;
  /** Show "Most viewed" usage indicator dot */
  mostViewed?: boolean;
  children: React.ReactNode;
  className?: string;
}

function WidgetCard({ title, subtitle, icon, isLoading, editMode, onRemove, mostViewed, children, className }: CardProps) {
  return (
    <div
      className={cn(
        "relative bg-card rounded-xl border border-border p-6 shadow-soft",
        editMode && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
        className
      )}
    >
      {editMode && (
        <>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-6 w-6 rounded-md bg-card border border-border flex items-center justify-center cursor-grab text-muted-foreground">
            <GripVertical className="h-3.5 w-3.5" />
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-md bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
              aria-label={`Remove ${title}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </>
      )}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary border border-border">{icon}</div>
          <div>
            <h3 className="text-headline text-foreground flex items-center gap-2">
              {title}
              {mostViewed && (
                <span
                  title="You view this widget most often."
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: "hsl(var(--success))", boxShadow: "0 0 0 3px hsl(var(--success) / 0.2)" }}
                  aria-label="Most viewed"
                />
              )}
            </h3>
            {subtitle && <p className="text-caption text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        <WidgetMenu widgetName={title} />
      </div>
      {isLoading ? <ChartSkeleton height="220px" /> : children}
    </div>
  );
}

// ============== Renderer ==============
interface RenderProps {
  id: string;
  isLoading: boolean;
  editMode: boolean;
  onRemove: () => void;
  mostViewed?: boolean;
}

export function renderWidget({ id, isLoading, editMode, onRemove, mostViewed }: RenderProps): React.ReactNode {
  const def = getWidget(id);
  if (!def) return null;

  const common = { editMode, onRemove, isLoading, mostViewed };

  switch (id) {
    case "rag":
      return (
        <WidgetCard {...common} title="RAG Status" subtitle="All portfolios" icon={<Target className="h-4 w-4 text-foreground" />}>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="60%" height={220}>
              <PieChart>
                <Pie data={ragData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                  {ragData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {ragData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                  <div>
                    <span className="text-sm font-semibold text-foreground">{d.value}</span>
                    <span className="text-caption text-muted-foreground ml-1">{d.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </WidgetCard>
      );

    case "healthTrend":
      return (
        <WidgetCard {...common} title="Plan Health Trend" subtitle="Current FY · monthly RAG" icon={<Activity className="h-4 w-4 text-foreground" />}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={healthTrend}>
              <defs>
                <linearGradient id="gOn" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.3} /><stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0.05} /></linearGradient>
                <linearGradient id="gAt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={CHART_COLORS[2]} stopOpacity={0.3} /><stop offset="100%" stopColor={CHART_COLORS[2]} stopOpacity={0.05} /></linearGradient>
                <linearGradient id="gOff" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={CHART_COLORS[12]} stopOpacity={0.3} /><stop offset="100%" stopColor={CHART_COLORS[12]} stopOpacity={0.05} /></linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={30} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="OnTrack" name="On Track" stackId="1" stroke={CHART_COLORS[0]} fill="url(#gOn)" strokeWidth={2} />
              <Area type="monotone" dataKey="AtRisk" name="At Risk" stackId="1" stroke={CHART_COLORS[2]} fill="url(#gAt)" strokeWidth={2} />
              <Area type="monotone" dataKey="OffTrack" name="Off Track" stackId="1" stroke={CHART_COLORS[12]} fill="url(#gOff)" strokeWidth={2} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            </AreaChart>
          </ResponsiveContainer>
        </WidgetCard>
      );

    case "spendOverview":
      return (
        <WidgetCard {...common} title="Portfolio Spend Overview" subtitle="Planned vs actual vs projected ($M)" icon={<DollarSign className="h-4 w-4 text-foreground" />}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={portfolioSpend} barGap={2} barSize={14}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={35} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${v}M`} />
              <Bar dataKey="planned"   name="Planned"   fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual"    name="Actual"    fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="projected" name="Projected" fill={CHART_COLORS[3]} radius={[4, 4, 0, 0]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            </BarChart>
          </ResponsiveContainer>
        </WidgetCard>
      );

    case "initiativeMix":
      return (
        <WidgetCard {...common} title="Initiative Mix" subtitle="Run / Change / Grow" icon={<BarChart3 className="h-4 w-4 text-foreground" />}>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="60%" height={220}>
              <PieChart>
                <Pie data={typeDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                  {typeDistribution.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {typeDistribution.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                  <div>
                    <span className="text-sm font-semibold text-foreground">{d.value}</span>
                    <span className="text-caption text-muted-foreground ml-1">{d.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </WidgetCard>
      );

    case "healthRadar":
      return (
        <WidgetCard {...common} title="Execution Health Radar" subtitle="Current vs target across dimensions" icon={<Target className="h-4 w-4 text-foreground" />}>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={milestoneRadar}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} />
              <Radar name="Current" dataKey="current" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.3} />
              <Radar name="Target"  dataKey="target"  stroke={CHART_COLORS[2]} fill={CHART_COLORS[2]} fillOpacity={0.1} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            </RadarChart>
          </ResponsiveContainer>
        </WidgetCard>
      );

    case "riskHeatmap": {
      const cells = [];
      for (let l = 1; l <= 5; l++) for (let i = 1; i <= 5; i++) {
        const sev = l * i;
        cells.push({ l, i, sev, count: ((l * 7 + i * 11) % 6) + 1 });
      }
      return (
        <WidgetCard {...common} title="Risk Heatmap" subtitle="Likelihood × impact" icon={<AlertTriangle className="h-4 w-4 text-foreground" />}>
          <div className="flex flex-col items-center gap-2">
            <div className="grid grid-cols-5 gap-1.5" style={{ width: 240 }}>
              {cells.map((c) => {
                const op = 0.15 + (c.sev / 25) * 0.85;
                const color = c.sev >= 15 ? "hsl(var(--destructive))" : c.sev >= 8 ? CHART_COLORS[7] : CHART_COLORS[5];
                return (
                  <div key={`${c.l}-${c.i}`} className="aspect-square rounded flex items-center justify-center text-xs font-semibold text-white"
                    style={{ background: color, opacity: op }}>
                    {c.count}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-caption text-muted-foreground" style={{ width: 240 }}>
              <span>Low impact</span><span>High impact</span>
            </div>
          </div>
        </WidgetCard>
      );
    }

    case "attention":
      return (
        <WidgetCard {...common} title="Projects Needing Attention" subtitle={`${attentionProjects.length} projects flagged`} icon={<Activity className="h-4 w-4 text-foreground" />}>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["ID","Project","Portfolio","Priority","RAG","Budget Δ","Schedule Δ","FTEs","Risk","Sponsor","Reason"].map((h) => (
                    <th key={h} className="text-caption font-semibold text-muted-foreground pb-3 pr-4 whitespace-nowrap text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attentionProjects.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2.5 pr-4 text-caption text-muted-foreground font-mono">{p.id}</td>
                    <td className="py-2.5 pr-4 font-medium text-foreground min-w-[240px]">{p.name}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{p.portfolio}</td>
                    <td className="py-2.5 pr-4"><span className={ragPill(p.priority === "Critical" ? "Red" : p.priority === "High" ? "Amber" : "Green")}>{p.priority}</span></td>
                    <td className="py-2.5 pr-4"><span className={ragPill(p.rag)}>{p.rag}</span></td>
                    <td className={cn("py-2.5 pr-4 text-right tabular-nums font-semibold", p.budgetVariance > 10 ? "text-destructive" : p.budgetVariance > 0 ? "text-warning" : "text-success")}>{p.budgetVariance > 0 ? "+" : ""}{p.budgetVariance}%</td>
                    <td className={cn("py-2.5 pr-4 text-right tabular-nums font-semibold", p.scheduleSlip > 14 ? "text-destructive" : p.scheduleSlip > 0 ? "text-warning" : "text-success")}>{p.scheduleSlip > 0 ? "+" : ""}{p.scheduleSlip}d</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">{p.ftes}</td>
                    <td className="py-2.5 pr-4"><span className={ragPill(p.riskLevel === "High" ? "Red" : p.riskLevel === "Medium" ? "Amber" : "Green")}>{p.riskLevel}</span></td>
                    <td className="py-2.5 pr-4 text-muted-foreground text-caption">{p.sponsor}</td>
                    <td className="py-2.5 pr-4 text-caption text-muted-foreground">{p.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </WidgetCard>
      );

    case "budgetVsActual":
      return (
        <WidgetCard {...common} title="Budget vs. Actuals" subtitle="By portfolio ($M)" icon={<DollarSign className="h-4 w-4 text-foreground" />}>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={budgetVsActual}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={35} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="budget" name="Budget" fill={CHART_COLORS[3]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="Actual" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="variance" name="Variance" stroke={CHART_COLORS[12]} strokeWidth={2} dot />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </WidgetCard>
      );

    case "capexOpex":
      return (
        <WidgetCard {...common} title="CapEx / OpEx Breakdown" subtitle="Total spend split ($M)" icon={<DollarSign className="h-4 w-4 text-foreground" />}>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="60%" height={220}>
              <PieChart>
                <Pie data={capexOpex} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                  {capexOpex.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${v}M`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {capexOpex.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                  <div>
                    <span className="text-sm font-semibold text-foreground">${d.value}M</span>
                    <span className="text-caption text-muted-foreground ml-1">{d.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </WidgetCard>
      );

    case "burnRate":
      return (
        <WidgetCard {...common} title="Burn Rate" subtitle="Cumulative spend ($M)" icon={<TrendingUp className="h-4 w-4 text-foreground" />}>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={burnRateData}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={30} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${v}M`} />
              <Line type="monotone" dataKey="cumulative" name="Actual" stroke={CHART_COLORS[1]} strokeWidth={2} dot />
              <Line type="monotone" dataKey="projected" name="Projected" stroke={CHART_COLORS[3]} strokeWidth={2} strokeDasharray="4 4" dot={false} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </WidgetCard>
      );

    case "fteUtil":
      return (
        <WidgetCard {...common} title="FTE Utilization" subtitle="Planned vs actual" icon={<Users className="h-4 w-4 text-foreground" />}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={fteUtil} layout="vertical" barGap={4} barSize={12}>
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={120} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="planned" name="Planned" fill={CHART_COLORS[3]} radius={[0, 4, 4, 0]} />
              <Bar dataKey="actual"  name="Actual"  fill={CHART_COLORS[1]} radius={[0, 4, 4, 0]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            </BarChart>
          </ResponsiveContainer>
        </WidgetCard>
      );

    case "capacityHeat": {
      const heatCells: { team: string; q: string; load: number }[] = [];
      capacityHeatTeams.forEach((t, ti) => capacityHeatQuarters.forEach((q, qi) => {
        heatCells.push({ team: t, q, load: 60 + ((ti * 13 + qi * 17) % 50) });
      }));
      return (
        <WidgetCard {...common} title="Capacity Heat Map" subtitle="Team × quarter load %" icon={<Layers className="h-4 w-4 text-foreground" />}>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `120px repeat(${capacityHeatQuarters.length}, 1fr)` }}>
            <div />
            {capacityHeatQuarters.map((q) => (
              <div key={q} className="text-caption text-muted-foreground text-center font-medium">{q}</div>
            ))}
            {capacityHeatTeams.map((t) => (
              <React.Fragment key={t}>
                <div className="text-caption text-muted-foreground py-2">{t}</div>
                {capacityHeatQuarters.map((q) => {
                  const cell = heatCells.find((c) => c.team === t && c.q === q)!;
                  const isOver = cell.load > 100;
                  const color = isOver ? "hsl(var(--destructive))" : cell.load > 85 ? CHART_COLORS[7] : CHART_COLORS[1];
                  const op = 0.2 + (cell.load / 130) * 0.7;
                  return (
                    <div key={`${t}-${q}`} className="rounded h-10 flex items-center justify-center text-xs font-semibold text-white"
                      style={{ background: color, opacity: op }}>
                      {cell.load}%
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </WidgetCard>
      );
    }

    case "teamLoad":
      return (
        <WidgetCard {...common} title="Team Load by Quarter" subtitle="Load index by team" icon={<Users className="h-4 w-4 text-foreground" />}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={teamLoadData}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={30} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="Q1" fill={CHART_COLORS[3]} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Q2" fill={CHART_COLORS[2]} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Q3" fill={CHART_COLORS[1]} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Q4" fill={CHART_COLORS[0]} radius={[3, 3, 0, 0]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            </BarChart>
          </ResponsiveContainer>
        </WidgetCard>
      );

    case "decisionLog":
      return (
        <WidgetCard {...common} title="Decision Log Feed" subtitle="Recent strategic decisions" icon={<ListChecks className="h-4 w-4 text-foreground" />}>
          <div className="divide-y divide-border">
            {decisionLog.map((d) => (
              <div key={d.id} className="py-3 flex items-start gap-3">
                <span className="text-caption font-mono text-muted-foreground shrink-0 mt-0.5">{d.id}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{d.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-caption text-muted-foreground">{d.ts}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">{d.tag}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </WidgetCard>
      );

    case "approvalQueue":
      return (
        <WidgetCard {...common} title="Approval Queue" subtitle={`${approvalQueue.length} pending across portfolios`} icon={<ListChecks className="h-4 w-4 text-foreground" />}>
          <div className="space-y-2">
            {approvalQueue.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground truncate">{a.name}</span>
                    {a.override && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20">
                        PRIORITY
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-caption text-muted-foreground">
                    <span>{a.submitter}</span>
                    <span>·</span>
                    <span className={cn(a.days >= 7 && "text-destructive font-semibold")}>{a.days}d waiting</span>
                    <span>·</span>
                    <span className="font-medium">{a.tier}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toast(`Opening intake record ${a.id}`)}
                  className="text-xs font-semibold text-primary hover:underline shrink-0"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        </WidgetCard>
      );

    case "programRollup":
      return (
        <WidgetCard {...common} title="Program Health Roll-up" subtitle="All active programs" icon={<GitBranch className="h-4 w-4 text-foreground" />}>
          <div className="space-y-2">
            {programs.map((p) => (
              <div key={p.id} className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">{p.name}</span>
                    <span className={ragPill(p.rag)}>{p.rag === "Red" ? "Off Track" : p.rag === "Amber" ? "At Risk" : "On Track"}</span>
                    <span className="text-caption text-muted-foreground whitespace-nowrap">{p.complete}% complete</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast(`Opening ${p.name}`)}
                    className="text-xs font-semibold text-primary hover:underline shrink-0"
                  >
                    View Program
                  </button>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${p.complete}%`, background: CHART_COLORS[1] }} />
                </div>
                <p className="mt-2 text-caption text-muted-foreground italic flex items-start gap-1.5">
                  <AiIcon className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                  {p.observation}
                </p>
              </div>
            ))}
          </div>
        </WidgetCard>
      );

    case "okrHeatmap":
      return (
        <WidgetCard {...common} title="OKR Alignment Heatmap" subtitle="Strategic themes × portfolios" icon={<Target className="h-4 w-4 text-foreground" />}>
          <div className="overflow-x-auto -mx-6 px-6">
            <div className="grid gap-1.5 min-w-[700px]" style={{ gridTemplateColumns: `200px repeat(${portfolios.length}, 1fr)` }}>
              <div />
              {portfolios.map((p) => (
                <div key={p} className="text-caption text-muted-foreground text-center font-medium px-1">{p}</div>
              ))}
              {themes.map((t) => (
                <React.Fragment key={t}>
                  <div className="text-sm text-foreground py-2 font-medium">{t}</div>
                  {portfolios.map((p) => {
                    const v = okrCells[t][p];
                    const color = v >= 60 ? "hsl(150 60% 38%)" : v >= 30 ? "hsl(38 92% 45%)" : "hsl(0 75% 55%)";
                    const op = 0.18 + (v / 100) * 0.72;
                    return (
                      <div key={`${t}-${p}`} className="rounded h-12 flex items-center justify-center text-sm font-semibold text-white"
                        style={{ background: color, opacity: op }}>
                        {v}%
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div
            className="mt-4 p-3 rounded-lg flex items-start gap-2"
            style={{ background: "hsl(245 60% 97%)", border: "1px solid hsl(245 50% 92%)" }}
          >
            <AiIcon className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "hsl(245 70% 50%)" }} />
            <p className="text-sm text-foreground/90">
              <span className="font-semibold">AI Insight:</span> Workforce Resilience is the least-covered theme across all portfolios. 6 active projects have no theme alignment.
            </p>
          </div>
        </WidgetCard>
      );

    // Custom blocks
    case "textBlock":
      return (
        <WidgetCard {...common} title="Text / Header Block" icon={<FileText className="h-4 w-4 text-foreground" />}>
          <p className="text-sm text-muted-foreground">Free-form text or section header. Click the menu to edit content.</p>
        </WidgetCard>
      );
    case "divider":
      return (
        <div className={cn("relative", editMode && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background rounded-xl p-2")}>
          {editMode && onRemove && (
            <button type="button" onClick={onRemove} className="absolute -top-2 -right-2 h-6 w-6 rounded-md bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-destructive z-10">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-caption text-muted-foreground uppercase tracking-wider">Section</span>
            <div className="h-px flex-1 bg-border" />
          </div>
        </div>
      );
    case "externalLink":
      return (
        <WidgetCard {...common} title="External Link" icon={<ExternalLink className="h-4 w-4 text-foreground" />}>
          <a href="#" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <ExternalLink className="h-4 w-4" /> Open external dashboard
          </a>
        </WidgetCard>
      );
    case "kpiTile":
      return (
        <WidgetCard {...common} title="KPI Tile" icon={<Shield className="h-4 w-4 text-foreground" />}>
          <div className="text-center py-6">
            <div className="text-4xl font-bold text-foreground">$24.2M</div>
            <p className="text-caption text-muted-foreground mt-1">↑ 4% vs last month</p>
          </div>
        </WidgetCard>
      );

    case "escalation":
      return (
        <WidgetCard {...common} title="Escalation Velocity" subtitle="Raised vs resolved per month" icon={<Network className="h-4 w-4 text-foreground" />}>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={escalationData}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={30} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="raised"   name="Raised"   stroke={CHART_COLORS[12]} strokeWidth={2} dot />
              <Line type="monotone" dataKey="resolved" name="Resolved" stroke={CHART_COLORS[5]} strokeWidth={2} dot />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </WidgetCard>
      );

    case "crossDeps":
      return (
        <WidgetCard {...common} title="Cross-Portfolio Dependencies" subtitle="Cross-cutting blockers" icon={<Network className="h-4 w-4 text-foreground" />}>
          <div className="space-y-2">
            {[
              { from: "Digital & AI", to: "Clinical Ops", count: 12 },
              { from: "Infrastructure", to: "Compliance", count: 8 },
              { from: "Revenue Cycle", to: "Patient Exp.", count: 5 },
              { from: "Clinical Ops", to: "Compliance", count: 4 },
            ].map((d, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-border">
                <span className="text-sm font-medium text-foreground flex-1">{d.from}</span>
                <ArrowRightSymbol />
                <span className="text-sm font-medium text-foreground flex-1 text-right">{d.to}</span>
                <span className="text-xs font-bold tabular-nums text-primary">{d.count}</span>
              </div>
            ))}
          </div>
        </WidgetCard>
      );

    default:
      return null;
  }
}

function ArrowRightSymbol() {
  return <span className="text-muted-foreground">→</span>;
}

export const WIDGET_GRID_SPAN: Record<string, string> = {
  full: "xl:col-span-3",
  twoThirds: "xl:col-span-2",
  half: "xl:col-span-1",
  third: "xl:col-span-1",
};

/** Bonus: small unused import suppressor — keep linter calm */
const _Minus = Minus;
void _Minus;
