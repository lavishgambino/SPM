import {
  Activity, AlertTriangle, BarChart3, Target, DollarSign, Users, TrendingUp, AlertCircle,
  MoreHorizontal, Sparkles, BookmarkPlus, LayoutDashboard,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, Legend, ComposedChart, ReferenceLine,
} from "recharts";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Arc 6 palette — extended indigo→neutral ramp used across all charts
const CHART_COLORS = [
  "#2D2580", "#4A3DB5", "#7B6FD4", "#A89FE3", "#CDC6F0",
  "#3E8F6E", "#6FB893", "#A6D7BB", "#D9A441", "#E6C07B",
  "#C0594E", "#D88B82", "#7C7299", "#B0AAC0", "#888780",
];

const tooltipStyle = {
  fontSize: 11,
  borderRadius: 8,
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--card))",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

// Semantic status colors via design tokens
const STATUS = {
  off: { fg: "hsl(var(--destructive))", bg: "hsl(var(--destructive) / 0.12)", border: "hsl(var(--destructive) / 0.25)" },
  at:  { fg: "hsl(var(--warning))",     bg: "hsl(var(--warning) / 0.14)",     border: "hsl(var(--warning) / 0.28)" },
  ok:  { fg: "hsl(var(--success))",     bg: "hsl(var(--success) / 0.14)",     border: "hsl(var(--success) / 0.28)" },
};

// Legacy aliases — route old call sites to the semantic system
const RAG_OFF = STATUS.off.fg;
const RAG_AT  = STATUS.at.fg;
const RAG_OK  = STATUS.ok.fg;
const PILL_OFF = STATUS.off.bg;
const PILL_AT  = STATUS.at.bg;
const PILL_OK  = STATUS.ok.bg;

/* ============================================================
 * Shared primitives — ArtifactCard, ArtifactHero, ChartFrame, Legend, Pill
 * ============================================================ */

function ArtifactCard({
  icon: Icon, title, subtitle, action, className = "", children,
}: {
  icon?: React.ElementType; title: string; subtitle?: string;
  action?: React.ReactNode; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={`bg-card rounded-xl border border-border p-6 ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className="p-2 rounded-lg bg-secondary border border-border shrink-0">
              <Icon className="h-4 w-4 text-foreground" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">{title}</h3>
            {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function ArtifactHero({
  title, subtitle, kpis,
}: {
  title: React.ReactNode; subtitle?: string;
  kpis: { label: string; value: React.ReactNode; tone?: "default" | "off" | "at" | "ok" }[];
}) {
  const toneClass = (t?: string) =>
    t === "off" ? "text-destructive" : t === "at" ? "text-warning" : t === "ok" ? "text-success" : "text-foreground";
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        <div className="lg:pr-8 lg:border-r-2 border-border">
          <div className="text-2xl font-bold text-foreground">{title}</div>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={`grid grid-cols-2 lg:grid-cols-${Math.min(kpis.length, 4)} gap-4 flex-1`}>
          {kpis.map((k) => (
            <div key={k.label} className="text-center">
              <div className={`text-2xl font-semibold tabular-nums ${toneClass(k.tone)}`}>{k.value}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{k.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChartFrame({ height = 240, children }: { height?: number; children: React.ReactNode }) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children as any}
      </ResponsiveContainer>
    </div>
  );
}

function ChartLegend({ items }: { items: { label: string; color: string; dashed?: boolean }[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 mt-3 text-[11px] text-muted-foreground">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-2">
          {it.dashed ? (
            <div className="w-6 h-0 border-t-2 border-dashed" style={{ borderColor: it.color }} />
          ) : (
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: it.color }} />
          )}
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

function Pill({ tone, children }: { tone: "off" | "at" | "ok"; children: React.ReactNode }) {
  const s = STATUS[tone];
  return (
    <span
      className="text-[11px] font-semibold px-2.5 py-1 rounded-md border whitespace-nowrap"
      style={{ background: s.bg, color: s.fg, borderColor: s.border }}
    >
      {children}
    </span>
  );
}

const toneFor = (txt: string): "off" | "at" | "ok" => {
  const t = (txt || "").toLowerCase();
  if (t.includes("critical") || t.includes("off") || t.includes("over") || (t.includes("high") && !t.includes("highlight"))) return "off";
  if (t.includes("medium") || t.includes("at risk") || t.includes("watch") || t.includes("under")) return "at";
  return "ok";
};


/* ============================================================
 * EPMO DASHBOARD
 * ============================================================ */
export function EpmoDashboardPanel() {
  const ragData = [
    { name: "On Track", value: 3, fill: CHART_COLORS[0] },
    { name: "At Risk", value: 17, fill: CHART_COLORS[1] },
    { name: "Off Track", value: 21, fill: CHART_COLORS[3] },
  ];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const healthTrend = months.map((m, i) => ({
    month: m,
    OnTrack: Math.round(22 + Math.sin(i * 0.4) * 3 - i * 0.3),
    AtRisk: Math.round(10 + Math.cos(i * 0.6) * 3 + i * 0.2),
    OffTrack: Math.round(5 + i * 0.15 + Math.sin(i) * 1.5),
  }));

  const portfolioSpend = [
    { name: "Digital & AI", planned: 82, actual: 39, projected: 86 },
    { name: "Clinical Ops", planned: 65, actual: 28, projected: 61 },
    { name: "Infrastructure", planned: 48, actual: 25, projected: 52 },
    { name: "Revenue Cycle", planned: 42, actual: 19, projected: 40 },
    { name: "Compliance", planned: 38, actual: 21, projected: 44 },
    { name: "Patient Exp.", planned: 26, actual: 11, projected: 24 },
  ];

  const typeDistribution = [
    { name: "Change", value: 17, fill: CHART_COLORS[0] },
    { name: "Grow", value: 16, fill: CHART_COLORS[5] },
    { name: "Run", value: 8, fill: CHART_COLORS[1] },
  ];

  const milestoneRadar = [
    { dimension: "Budget", current: 78, target: 90 },
    { dimension: "Schedule", current: 65, target: 85 },
    { dimension: "Scope", current: 82, target: 90 },
    { dimension: "Quality", current: 88, target: 85 },
    { dimension: "Resources", current: 72, target: 80 },
    { dimension: "Risk Mgmt", current: 60, target: 75 },
  ];

  const decisionVelocity = months.slice(0, 10).map((m, i) => ({
    month: m,
    Decisions: Math.round(8 + Math.sin(i * 0.8) * 4 + i * 0.3),
    Escalations: Math.round(3 + Math.cos(i * 1.1) * 2),
    Resolved: Math.round(6 + Math.sin(i * 0.5) * 3 + i * 0.2),
  }));

  const attentionProjects = [
    { id: "PRJ-031", name: "Patient Loyalty & Consumer Health Portal", portfolio: "Patient Experience", priority: "High", rag: "Off Track", budget: "+22%", schedule: "+30d", ftes: 4, risk: "Medium", sponsor: "Greg Mason" },
    { id: "PRJ-020", name: "Patient Experience & Voice of Patient", portfolio: "Patient Experience", priority: "Medium", rag: "Off Track", budget: "+22%", schedule: "+29d", ftes: 2, risk: "Low", sponsor: "Lisa Park" },
    { id: "PRJ-032", name: "Health System Treasury & Cash Mgmt", portfolio: "Finance", priority: "Medium", rag: "Off Track", budget: "+21%", schedule: "+29d", ftes: 3, risk: "Low", sponsor: "Helen Cho" },
    { id: "PRJ-021", name: "Enterprise Clinical Data Warehouse", portfolio: "Clinical Informatics", priority: "High", rag: "Off Track", budget: "+21%", schedule: "+28d", ftes: 7, risk: "High", sponsor: "Carla Nguyen" },
    { id: "PRJ-010", name: "CMS Quality Reporting Automation", portfolio: "Compliance & Privacy", priority: "Critical", rag: "Off Track", budget: "+20%", schedule: "+28d", ftes: 3, risk: "High", sponsor: "Helen Cho" },
  ];

  const pillFor = (txt: string) => {
    const t = (txt || "").toLowerCase();
    if (t.includes("critical") || t.includes("off") || t.includes("high")) return { bg: PILL_OFF, fg: RAG_OFF };
    if (t.includes("medium") || t.includes("at risk") || t.includes("watch")) return { bg: PILL_AT, fg: RAG_AT };
    return { bg: PILL_OK, fg: RAG_OK };
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="lg:pr-8 lg:border-r-2 border-border">
            <div className="text-2xl font-bold text-foreground">EPMO Dashboard</div>
            <p className="text-xs text-muted-foreground mt-1">Daily operating view — state of the plan at a glance</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
            <div className="text-center">
              <div className="text-2xl font-semibold text-foreground">41</div>
              <div className="text-[11px] text-muted-foreground">Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold" style={{ color: RAG_OFF }}>21</div>
              <div className="text-[11px] text-muted-foreground">Off Track</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold" style={{ color: RAG_AT }}>17</div>
              <div className="text-[11px] text-muted-foreground">At Risk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-foreground">$29.8M</div>
              <div className="text-[11px] text-muted-foreground">Spent of $63M</div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-secondary border border-border"><Target className="h-4 w-4 text-foreground" /></div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">RAG Status</h3>
              <p className="text-[11px] text-muted-foreground">Current project health</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[180px] h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={ragData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                    {ragData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 shrink-0">
              {ragData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                  <div>
                    <span className="text-sm font-semibold text-foreground">{d.value}</span>
                    <span className="text-[11px] text-muted-foreground ml-1">{d.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-secondary border border-border"><Activity className="h-4 w-4 text-foreground" /></div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Plan Health Trend</h3>
              <p className="text-[11px] text-muted-foreground">Monthly RAG distribution over time</p>
            </div>
          </div>
          <div className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={healthTrend}>
                <defs>
                  <linearGradient id="gOn" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.3} /><stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0.05} /></linearGradient>
                  <linearGradient id="gAt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={CHART_COLORS[1]} stopOpacity={0.3} /><stop offset="100%" stopColor={CHART_COLORS[1]} stopOpacity={0.05} /></linearGradient>
                  <linearGradient id="gOff" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={CHART_COLORS[3]} stopOpacity={0.3} /><stop offset="100%" stopColor={CHART_COLORS[3]} stopOpacity={0.05} /></linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="OnTrack" name="On Track" stackId="1" stroke={CHART_COLORS[0]} fill="url(#gOn)" strokeWidth={2} />
                <Area type="monotone" dataKey="AtRisk" name="At Risk" stackId="1" stroke={CHART_COLORS[1]} fill="url(#gAt)" strokeWidth={2} />
                <Area type="monotone" dataKey="OffTrack" name="Off Track" stackId="1" stroke={CHART_COLORS[3]} fill="url(#gOff)" strokeWidth={2} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-secondary border border-border"><DollarSign className="h-4 w-4 text-foreground" /></div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Portfolio Spend Overview</h3>
              <p className="text-[11px] text-muted-foreground">Planned vs actual vs projected ($M)</p>
            </div>
          </div>
          <div className="w-full h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={portfolioSpend} barGap={2} barSize={14}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={35} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${v}M`} />
                <Bar dataKey="planned" name="Planned" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="projected" name="Projected" fill={CHART_COLORS[3]} radius={[4, 4, 0, 0]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-secondary border border-border"><BarChart3 className="h-4 w-4 text-foreground" /></div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Initiative Mix</h3>
              <p className="text-[11px] text-muted-foreground">Run / Change / Grow</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[180px] h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                    {typeDistribution.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 shrink-0">
              {typeDistribution.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                  <div>
                    <span className="text-sm font-semibold text-foreground">{d.value}</span>
                    <span className="text-[11px] text-muted-foreground ml-1">{d.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-secondary border border-border"><Target className="h-4 w-4 text-foreground" /></div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Execution Health Radar</h3>
              <p className="text-[11px] text-muted-foreground">Current vs target across dimensions</p>
            </div>
          </div>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={milestoneRadar}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} axisLine={false} />
                <Radar name="Current" dataKey="current" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.2} strokeWidth={2} />
                <Radar name="Target" dataKey="target" stroke={CHART_COLORS[3]} fill={CHART_COLORS[3]} fillOpacity={0.1} strokeWidth={2} strokeDasharray="4 4" />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-secondary border border-border"><TrendingUp className="h-4 w-4 text-foreground" /></div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Decision & Escalation Velocity</h3>
              <p className="text-[11px] text-muted-foreground">Monthly decisions, escalations & resolution</p>
            </div>
          </div>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={decisionVelocity}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="Decisions" stroke={CHART_COLORS[0]} strokeWidth={2.5} dot={{ r: 3, fill: CHART_COLORS[0] }} />
                <Line type="monotone" dataKey="Escalations" stroke={CHART_COLORS[1]} strokeWidth={2} dot={{ r: 3, fill: CHART_COLORS[1] }} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="Resolved" stroke={CHART_COLORS[5]} strokeWidth={2} dot={{ r: 3, fill: CHART_COLORS[5] }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Attention table */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-secondary border border-border"><AlertTriangle className="h-4 w-4 text-foreground" /></div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Projects Needing Attention</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">20 projects flagged · sorted by severity</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left">
                {["Project ID", "Project Name", "Portfolio", "Priority", "RAG", "Budget Var.", "Schedule Slip", "FTEs", "Risk", "Sponsor"].map((h) => (
                  <th key={h} className="text-[10px] font-semibold text-muted-foreground pb-3 pr-4 whitespace-nowrap uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attentionProjects.map((p) => {
                const pri = pillFor(p.priority);
                const rag = pillFor(p.rag);
                const risk = pillFor(p.risk);
                return (
                  <tr key={p.id} className="border-b border-border/50">
                    <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground font-mono text-[11px]">{p.id}</td>
                    <td className="py-3 pr-4 font-medium text-foreground">{p.name}</td>
                    <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">{p.portfolio}</td>
                    <td className="py-3 pr-4 whitespace-nowrap"><span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: pri.bg, color: pri.fg }}>{p.priority}</span></td>
                    <td className="py-3 pr-4 whitespace-nowrap"><span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: rag.bg, color: rag.fg }}>{p.rag}</span></td>
                    <td className="py-3 pr-4 text-right tabular-nums font-semibold" style={{ color: RAG_OFF }}>{p.budget}</td>
                    <td className="py-3 pr-4 text-right tabular-nums font-semibold" style={{ color: RAG_OFF }}>{p.schedule}</td>
                    <td className="py-3 pr-4 text-right tabular-nums text-foreground">{p.ftes}</td>
                    <td className="py-3 pr-4 whitespace-nowrap"><span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: risk.bg, color: risk.fg }}>{p.risk}</span></td>
                    <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">{p.sponsor}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * BUDGET REPORT
 * ============================================================ */
export function BudgetReportPanel({ variant }: { variant?: string } = {}) {
  const isSnapshot = variant === "snapshot_10d" || variant === "snapshot_10d_forecast";
  const showForecast = variant === "snapshot_10d_forecast";

  // ── Snapshot mode: last 10 days actual + next 5 days forecast, with smoothed trend ──
  const planned = 0.094;
  const actuals = [0.118, 0.102, 0.131, 0.097, 0.142, 0.124, 0.089, 0.128, 0.144, 0.163];
  // Forecast continues the recent hot pace, easing slightly
  // Forecast trends worse — accelerating burn over the next 5 days
  const forecasts = [0.138, 0.149, 0.158, 0.171, 0.186];

  // 3-point centered moving average across the combined series for a smooth trend
  const combinedSeries = [...actuals, ...forecasts];
  const trend = combinedSeries.map((_, i) => {
    const a = combinedSeries[i - 1] ?? combinedSeries[i];
    const b = combinedSeries[i];
    const c = combinedSeries[i + 1] ?? combinedSeries[i];
    return +((a + b + c) / 3).toFixed(3);
  });

  const dailySpend = isSnapshot
    ? Array.from({ length: 15 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (9 - i));
        const month = d.toLocaleString("en-US", { month: "short" });
        const dayNum = d.getDate();
        const isForecast = i >= 10;
        return {
          day: `${month} ${dayNum}`,
          dayNum,
          month,
          Planned: planned,
          Actual: isForecast ? undefined : actuals[i],
          Forecast: isForecast ? forecasts[i - 10] : undefined,
          Trend: trend[i],
        };
      })
    : [];

  const monthlySpend = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => ({
    month: m,
    Planned: 2.83,
    Actual: i < 6 ? +(2.4 + Math.sin(i) * 0.4).toFixed(2) : undefined,
    Forecast: i >= 5 ? +(2.7 + Math.cos(i) * 0.3).toFixed(2) : undefined,
  }));

  const portfolioDonut = [
    { name: "Clinical Informatics", value: 6.2, fill: CHART_COLORS[0] },
    { name: "Information Tech", value: 4.1, fill: CHART_COLORS[1] },
    { name: "Patient Experience", value: 6.3, fill: CHART_COLORS[3] },
    { name: "Human Resources", value: 0.8, fill: CHART_COLORS[5] },
    { name: "Supply Chain", value: 1.3, fill: CHART_COLORS[2] },
    { name: "Finance", value: 0.7, fill: "hsl(150, 40%, 60%)" },
    { name: "Compliance & Pr.", value: 0.8, fill: "hsl(280, 50%, 60%)" },
    { name: "Revenue Cycle", value: 0.2, fill: "hsl(20, 80%, 55%)" },
    { name: "Nursing & Clinical", value: 1.9, fill: "hsl(200, 60%, 55%)" },
    { name: "Pharmacy", value: 1.0, fill: "hsl(340, 50%, 60%)" },
    { name: "Population Health", value: 0.7, fill: "hsl(50, 70%, 55%)" },
  ];

  // Snapshot: which portfolios moved most in the last 10 days
  const portfolioDelta10d = [
    { name: "Clinical Informatics", delta: 0.42 },
    { name: "Information Technology", delta: 0.31 },
    { name: "Patient Experience", delta: 0.27 },
    { name: "Supply Chain", delta: 0.11 },
    { name: "Human Resources", delta: 0.08 },
    { name: "Compliance & Privacy", delta: 0.06 },
    { name: "Revenue Cycle", delta: 0.04 },
  ];

  const overChips = [
    { name: "EHR System Consolid.", pct: "+16%" },
    { name: "Healthcare Cybersec.", pct: "+14%" },
    { name: "Patient Portal & Di.", pct: "+13%" },
    { name: "HR & Workforce Mana.", pct: "+12%" },
  ];

  // 10-day movers — projects that burned most vs their daily plan over the window
  const topMovers10d = [
    { id: "PRJ-001", name: "EHR System Consolidation & Optimization", portfolio: "Clinical Informatics", priority: "Critical", status: "At Risk", planned10d: "$0.069M", actual10d: "$0.124M", delta: "+$0.055M", pace: "+80%" },
    { id: "PRJ-011", name: "Cloud Infrastructure Migration", portfolio: "Information Technology", priority: "High", status: "At Risk", planned10d: "$0.088M", actual10d: "$0.142M", delta: "+$0.054M", pace: "+61%" },
    { id: "PRJ-003", name: "Patient Portal & Digital Front Door", portfolio: "Patient Experience", priority: "High", status: "Watch", planned10d: "$0.108M", actual10d: "$0.156M", delta: "+$0.048M", pace: "+44%" },
    { id: "PRJ-002", name: "Healthcare Cybersecurity & Zero Trust", portfolio: "Information Technology", priority: "Critical", status: "Watch", planned10d: "$0.049M", actual10d: "$0.071M", delta: "+$0.022M", pace: "+45%" },
    { id: "PRJ-005", name: "Clinical Supply Chain Visibility Platform", portfolio: "Supply Chain & Procur…", priority: "High", status: "Watch", planned10d: "$0.033M", actual10d: "$0.047M", delta: "+$0.014M", pace: "+42%" },
    { id: "PRJ-010", name: "CMS Quality Reporting Automation", portfolio: "Compliance & Privacy", priority: "Critical", status: "At Risk", planned10d: "$0.014M", actual10d: "$0.022M", delta: "+$0.008M", pace: "+57%" },
  ];

  const overBudgetProjects = [
    { id: "PRJ-001", name: "EHR System Consolidation & Optimization", portfolio: "Clinical Informatics", priority: "Critical", status: "At Risk", planned: "$2.5M", actual: "$1.84M", projected: "$2.89M", variance: "+$0.39M", over: "+16%" },
    { id: "PRJ-002", name: "Healthcare Cybersecurity & Zero Trust", portfolio: "Information Technology", priority: "Critical", status: "Watch", planned: "$1.8M", actual: "$1.3M", projected: "$2.06M", variance: "+$0.26M", over: "+14%" },
    { id: "PRJ-003", name: "Patient Portal & Digital Front Door", portfolio: "Patient Experience", priority: "High", status: "Watch", planned: "$3.95M", actual: "$2.79M", projected: "$4.48M", variance: "+$0.53M", over: "+13%" },
    { id: "PRJ-004", name: "HR & Workforce Management System Mode…", portfolio: "Human Resources", priority: "High", status: "Watch", planned: "$0.9M", actual: "$0.62M", projected: "$1.01M", variance: "+$0.11M", over: "+12%" },
    { id: "PRJ-005", name: "Clinical Supply Chain Visibility Plat…", portfolio: "Supply Chain & Procur…", priority: "High", status: "Watch", planned: "$1.2M", actual: "$0.81M", projected: "$1.34M", variance: "+$0.14M", over: "+12%" },
    { id: "PRJ-006", name: "Enterprise Health Data Governance Pro…", portfolio: "Clinical Informatics", priority: "Medium", status: "Watch", planned: "$0.45M", actual: "$0.3M", projected: "$0.5M", variance: "+$0.05M", over: "+11%" },
    { id: "PRJ-010", name: "CMS Quality Reporting Automation", portfolio: "Compliance & Privacy", priority: "Critical", status: "At Risk", planned: "$0.52M", actual: "$0.4M", projected: "$0.61M", variance: "+$0.09M", over: "+17%" },
    { id: "PRJ-011", name: "Cloud Infrastructure Migration - Clin…", portfolio: "Information Technology", priority: "High", status: "At Risk", planned: "$3.2M", actual: "$2.42M", projected: "$3.74M", variance: "+$0.54M", over: "+17%" },
    { id: "PRJ-012", name: "Healthcare Marketing Analytics Platfo…", portfolio: "Patient Experience", priority: "Medium", status: "At Risk", planned: "$0.42M", actual: "$0.31M", projected: "$0.49M", variance: "+$0.07M", over: "+17%" },
    { id: "PRJ-013", name: "Payer Contract Management System", portfolio: "Revenue Cycle", priority: "Medium", status: "At Risk", planned: "$0.31M", actual: "$0.23M", projected: "$0.36M", variance: "+$0.05M", over: "+16%" },
  ];

  const pillFor = (txt: string) => {
    const t = (txt || "").toLowerCase();
    if (t.includes("critical") || t.includes("at risk")) return { bg: PILL_OFF, fg: RAG_OFF };
    if (t.includes("high") || t.includes("watch")) return { bg: PILL_AT, fg: RAG_AT };
    return { bg: PILL_OK, fg: RAG_OK };
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-col xl:flex-row xl:items-center gap-6">
          <div className="flex items-center gap-4 xl:pr-8 xl:border-r-2 border-border min-w-0">
            <div className="text-3xl font-bold text-foreground whitespace-nowrap">{isSnapshot ? "$1.21M" : "$29.8M"}</div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-foreground shrink-0" />
                <span className="text-sm font-semibold text-foreground">
                  {isSnapshot ? "Last 10 days · spend" : "71% Consumed"}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                {isSnapshot
                  ? "vs $0.94M planned · +$0.27M (+29%) over pace"
                  : "of $42.0M planned · Guardrail: $300M"}
              </span>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-0">
            {(isSnapshot
              ? [
                  { l: "Planned (10d)", v: "$0.94M" },
                  { l: "Actual (10d)", v: "$1.21M", red: true },
                  { l: "Daily burn", v: "$0.121M", red: true },
                  { l: "Projects pacing hot", v: "9 of 78", red: true },
                ]
              : [
                  { l: "Planned", v: "$42.0M" },
                  { l: "Actual YTD", v: "$29.8M" },
                  { l: "Projected", v: "$47.7M" },
                  { l: "Over Budget", v: "23 projects", red: true },
                ]
            ).map((k) => (
              <div key={k.l} className="bg-secondary/50 rounded-lg p-3 border border-border min-w-0">
                <div className="text-[11px] text-muted-foreground mb-1 leading-tight line-clamp-2 min-h-[2em]">{k.l}</div>
                <div className="font-semibold truncate text-xl" style={{ color: k.red ? RAG_OFF : "hsl(var(--foreground))" }}>{k.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 relative">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {isSnapshot
                  ? (showForecast ? "Daily Spend — Last 10 days + 5-day forecast" : "Daily Spend — Last 10 days")
                  : "Monthly Spend"}
              </h3>
              <p className="text-[11px] text-muted-foreground mb-3">
                {isSnapshot
                  ? (showForecast ? "Actual, planned, forecast, and trend ($M)" : "Actual vs. planned daily burn ($M)")
                  : "Planned vs. actual vs. forecast ($M)"}
              </p>
            </div>
            {isSnapshot && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-1.5 -mt-1 -mr-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    aria-label="Widget options"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem
                    onClick={() => window.dispatchEvent(new CustomEvent("arc:widget:save", { detail: { title: "Daily Spend — Last 10 days" } }))}
                    className="gap-2 text-[13px]"
                  >
                    <BookmarkPlus className="h-3.5 w-3.5" /> Save
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => window.dispatchEvent(new CustomEvent("arc:widget:newDashboard", { detail: { title: "Daily Spend — Last 10 days" } }))}
                    className="gap-2 text-[13px]"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" /> Create New Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => window.dispatchEvent(new CustomEvent("arc:widget:askAI", { detail: { title: "Daily Spend — Last 10 days" } }))}
                    className="gap-2 text-[13px]"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Ask with AI
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              {isSnapshot ? (
                <ComposedChart data={showForecast ? dailySpend : dailySpend.slice(0, 10)} margin={{ top: 10, right: 10, left: -10, bottom: 12 }} barCategoryGap="8%" barGap={2}>
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    interval={0}
                    height={42}
                    tick={(props: any) => {
                      const { x, y, index } = props;
                      const series = showForecast ? dailySpend : dailySpend.slice(0, 10);
                      const item = series[index];
                      const prev = index > 0 ? series[index - 1] : null;
                      const showMonth = !prev || prev.month !== item.month;
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text x={0} y={0} dy={12} textAnchor="middle" fontSize={11} fill="hsl(var(--muted-foreground))">
                            {item.dayNum}
                          </text>
                          {showMonth && (
                            <text x={0} y={0} dy={26} textAnchor="middle" fontSize={10} fontWeight={600} fill="hsl(var(--foreground))">
                              {item.month}
                            </text>
                          )}
                        </g>
                      );
                    }}
                  />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}M`} width={55} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => (v == null ? "—" : `$${v}M`)} />
                  {showForecast && (
                    <ReferenceLine x={dailySpend[9]?.day} stroke="hsl(var(--foreground))" strokeDasharray="3 3" strokeWidth={2} label={{ value: "Today", position: "top", fontSize: 10 }} />
                  )}
                  <Bar dataKey="Actual" radius={[4, 4, 0, 0]} maxBarSize={64} fill={CHART_COLORS[0]} />
                  {showForecast && (
                    <Bar dataKey="Forecast" radius={[4, 4, 0, 0]} maxBarSize={64} fill={CHART_COLORS[1]} fillOpacity={0.55} />
                  )}
                  <Line type="monotone" dataKey="Planned" stroke={CHART_COLORS[3]} strokeWidth={3} strokeDasharray="6 4" dot={false} />
                  {showForecast && (
                    <Line type="monotone" dataKey="Trend" stroke={CHART_COLORS[10]} strokeWidth={3.5} dot={false} />
                  )}
                </ComposedChart>
              ) : (
                <ComposedChart data={monthlySpend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}M`} width={55} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${v}M`} />
                  <ReferenceLine x="Jun" stroke="hsl(var(--foreground))" strokeDasharray="3 3" strokeWidth={2} label={{ value: "Today", position: "top", fontSize: 10 }} />
                  <Line type="monotone" dataKey="Planned" stroke={CHART_COLORS[3]} strokeWidth={2} strokeDasharray="6 4" dot={false} />
                  <Bar dataKey="Actual" radius={[4, 4, 0, 0]} maxBarSize={28} fill={CHART_COLORS[0]} />
                  <Bar dataKey="Forecast" radius={[4, 4, 0, 0]} maxBarSize={28} fill={CHART_COLORS[1]} />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-2 text-[11px] text-muted-foreground flex-wrap">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: CHART_COLORS[0] }} /><span>Actual</span></div>
            {isSnapshot && showForecast && (
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: CHART_COLORS[1], opacity: 0.55 }} /><span>Forecast</span></div>
            )}
            {!isSnapshot && (
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: CHART_COLORS[1] }} /><span>Forecast</span></div>
            )}
            {isSnapshot && showForecast && (
              <div className="flex items-center gap-2"><div className="w-6 h-0.5" style={{ background: CHART_COLORS[10] }} /><span>Trend (3-day avg)</span></div>
            )}
            <div className="flex items-center gap-2"><div className="w-6 h-0.5 border-t-2 border-dashed" style={{ borderColor: CHART_COLORS[3] }} /><span>Planned</span></div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground">
            {isSnapshot ? "Portfolio Movement (10d)" : "By Portfolio"}
          </h3>
          <p className="text-[11px] text-muted-foreground mb-3">
            {isSnapshot ? "Spend recorded in the last 10 days ($M)" : "Spend distribution"}
          </p>
          {isSnapshot ? (
            <>
              <div className="w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={portfolioDelta10d} layout="vertical" margin={{ top: 5, right: 10, left: 5, bottom: 0 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}M`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={130} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${v}M`} />
                    <Bar dataKey="delta" radius={[0, 4, 4, 0]} fill={CHART_COLORS[0]} maxBarSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 mt-2 text-[11px]">
                {portfolioDelta10d.map((p) => (
                  <div key={p.name} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{p.name}</span>
                    <span className="font-medium text-foreground tabular-nums">${p.delta.toFixed(2)}M</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={portfolioDonut} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} strokeWidth={0}>
                      {portfolioDonut.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${v}M`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 mt-2 text-[11px]">
                {portfolioDonut.map((p) => (
                  <div key={p.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: p.fill }} />
                      <span className="text-muted-foreground">{p.name}</span>
                    </div>
                    <span className="font-medium text-foreground tabular-nums">${p.value}M</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* FYE / Snapshot summary band */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[11px] text-muted-foreground">
              {isSnapshot ? "Pace impact on FYE projection" : "FYE Projected Total"}
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-foreground">{isSnapshot ? "+$0.27M" : "$38.6M"}</span>
              <span className="text-sm font-semibold" style={{ color: RAG_OFF }}>
                {isSnapshot ? "added to overrun in 10 days" : "(+$4.6M vs plan)"}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {overChips.map((c) => (
              <span key={c.name} className="text-[11px] px-2 py-1 rounded-md border border-foreground/30 bg-secondary flex items-center gap-1 font-semibold">
                <AlertCircle className="h-3 w-3" />
                {c.name} {c.pct}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Table — snapshot shows top movers, default shows all over-budget */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-secondary border border-border"><AlertTriangle className="h-4 w-4 text-foreground" /></div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {isSnapshot ? "Top Movers — Last 10 days" : "Projects Projected >110% of Budget"}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isSnapshot
                ? "Projects burning fastest above their daily plan over the window"
                : "23 projects exceeding budget threshold"}
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          {isSnapshot ? (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Project ID", "Project Name", "Portfolio", "Priority", "Status", "Planned (10d)", "Actual (10d)", "Δ Spend", "Pace vs Plan"].map((h) => (
                    <th key={h} className="text-[10px] font-semibold text-muted-foreground pb-3 pr-4 whitespace-nowrap uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topMovers10d.map((p) => {
                  const pri = pillFor(p.priority);
                  const st = pillFor(p.status);
                  return (
                    <tr key={p.id} className="border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/40 group">
                      <td className="py-3 pr-4 pl-2 whitespace-nowrap text-muted-foreground font-mono text-[11px]">{p.id}</td>
                      <td className="py-3 pr-4 font-medium text-foreground group-hover:text-primary group-hover:underline underline-offset-2 decoration-primary/40">{p.name}</td>
                      <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">{p.portfolio}</td>
                      <td className="py-3 pr-4 whitespace-nowrap"><span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: pri.bg, color: pri.fg }}>{p.priority}</span></td>
                      <td className="py-3 pr-4 whitespace-nowrap"><span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: st.bg, color: st.fg }}>{p.status}</span></td>
                      <td className="py-3 pr-4 text-right tabular-nums text-foreground">{p.planned10d}</td>
                      <td className="py-3 pr-4 text-right tabular-nums text-foreground">{p.actual10d}</td>
                      <td className="py-3 pr-4 text-right tabular-nums font-semibold" style={{ color: RAG_OFF }}>{p.delta}</td>
                      <td className="py-3 pr-4 text-right tabular-nums font-semibold" style={{ color: RAG_OFF }}>{p.pace}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Project ID", "Project Name", "Portfolio", "Priority", "Status", "Planned", "Actual YTD", "Projected", "Variance", "% Over"].map((h) => (
                    <th key={h} className="text-[10px] font-semibold text-muted-foreground pb-3 pr-4 whitespace-nowrap uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overBudgetProjects.map((p) => {
                  const pri = pillFor(p.priority);
                  const st = pillFor(p.status);
                  return (
                    <tr key={p.id} className="border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/40 group">
                      <td className="py-3 pr-4 pl-2 whitespace-nowrap text-muted-foreground font-mono text-[11px]">{p.id}</td>
                      <td className="py-3 pr-4 font-medium text-foreground group-hover:text-primary group-hover:underline underline-offset-2 decoration-primary/40">{p.name}</td>
                      <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">{p.portfolio}</td>
                      <td className="py-3 pr-4 whitespace-nowrap"><span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: pri.bg, color: pri.fg }}>{p.priority}</span></td>
                      <td className="py-3 pr-4 whitespace-nowrap"><span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: st.bg, color: st.fg }}>{p.status}</span></td>
                      <td className="py-3 pr-4 text-right tabular-nums text-foreground">{p.planned}</td>
                      <td className="py-3 pr-4 text-right tabular-nums text-foreground">{p.actual}</td>
                      <td className="py-3 pr-4 text-right tabular-nums text-foreground">{p.projected}</td>
                      <td className="py-3 pr-4 text-right tabular-nums font-semibold" style={{ color: RAG_OFF }}>{p.variance}</td>
                      <td className="py-3 pr-4 text-right tabular-nums font-semibold" style={{ color: RAG_OFF }}>{p.over}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * CAPACITY REPORT
 * ============================================================ */
export function CapacityReportPanel() {
  const monthlyTrend = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => {
    const base = 42 + Math.sin(i * 0.5) * 8;
    return {
      month: m,
      Planned: Math.round(base + i * 0.5),
      Actual: i < 6 ? Math.round(base + i * 0.5 + Math.sin(i * 1.3) * 5) : undefined,
      Forecast: i >= 5 ? Math.round(base + i * 0.3 + 2) : undefined,
    };
  });

  const byRole = [
    { role: "QA Analyst", Planned: 50, Actual: 48 },
    { role: "Security Anal…", Planned: 55, Actual: 63 },
    { role: "UX Designer", Planned: 75, Actual: 95 },
    { role: "DevOps Engine…", Planned: 45, Actual: 50 },
  ];

  const byPortfolio = [
    { portfolio: "Clinical In…", Planned: 60, Actual: 70 },
    { portfolio: "Information…", Planned: 32, Actual: 38 },
    { portfolio: "Patient Exp…", Planned: 28, Actual: 36 },
    { portfolio: "Human Resou…", Planned: 18, Actual: 18 },
    { portfolio: "Supply Chai…", Planned: 18, Actual: 22 },
    { portfolio: "Finance", Planned: 8, Actual: 10 },
    { portfolio: "Compliance …", Planned: 22, Actual: 25 },
    { portfolio: "Revenue Cyc…", Planned: 15, Actual: 18 },
    { portfolio: "Nursing & C…", Planned: 12, Actual: 15 },
    { portfolio: "Pharmacy", Planned: 10, Actual: 12 },
    { portfolio: "Population…", Planned: 6, Actual: 8 },
  ];

  const overAllocated = [
    { role: "Security Analyst", over: 8 },
    { role: "UX Designer", over: 6 },
    { role: "DevOps Engineer", over: 3 },
  ];

  const capacityIssueProjects = [
    { id: "PRJ-001", name: "EHR System Consolidation & Optimizati…", portfolio: "Clinical Informatics", priority: "Critical", status: "Over-allocated", planned: 15, actual: 21, variance: "+6", util: "140%", risk: "High", role: "Clinical In…" },
    { id: "PRJ-002", name: "Healthcare Cybersecurity & Zero Trust…", portfolio: "Information Technology", priority: "Critical", status: "Over-allocated", planned: 15, actual: 21, variance: "+6", util: "140%", risk: "High", role: "CISO" },
    { id: "PRJ-003", name: "Patient Portal & Digital Front Door", portfolio: "Patient Experience", priority: "High", status: "Over-allocated", planned: 15, actual: 18, variance: "+3", util: "120%", risk: "Medium", role: "UX Desig…" },
    { id: "PRJ-004", name: "HR & Workforce Management System Mode…", portfolio: "Human Resources", priority: "High", status: "Over-allocated", planned: 15, actual: 18, variance: "+3", util: "120%", risk: "Medium", role: "HR Syste…" },
    { id: "PRJ-005", name: "Clinical Supply Chain Visibility Plat…", portfolio: "Supply Chain & Procur…", priority: "High", status: "Over-allocated", planned: 12, actual: 15, variance: "+3", util: "125%", risk: "High", role: "Supply C…" },
    { id: "PRJ-006", name: "Enterprise Health Data Governance Pro…", portfolio: "Clinical Informatics", priority: "Medium", status: "Over-allocated", planned: 12, actual: 15, variance: "+3", util: "125%", risk: "Low", role: "Data Gov…" },
    { id: "PRJ-007", name: "Physician Engagement & Referral CRM", portfolio: "Clinical Informatics", priority: "High", status: "Over-allocated", planned: 12, actual: 15, variance: "+3", util: "125%", risk: "Medium", role: "CRM Dev…" },
    { id: "PRJ-010", name: "CMS Quality Reporting Automation", portfolio: "Compliance & Privacy", priority: "Critical", status: "Over-allocated", planned: 12, actual: 15, variance: "+3", util: "125%", risk: "High", role: "Quality A…" },
    { id: "PRJ-011", name: "Cloud Infrastructure Migration - Clin…", portfolio: "Information Technology", priority: "High", status: "Over-allocated", planned: 12, actual: 15, variance: "+3", util: "125%", risk: "High", role: "Cloud Arc…" },
    { id: "PRJ-018", name: "Clinical Learning Management & Compet…", portfolio: "Human Resources", priority: "Medium", status: "Under-staffed", planned: 6, actual: 3, variance: "-3", util: "50%", risk: "Low", role: "L&D Lead…" },
    { id: "PRJ-019", name: "Medical Device Integration & IoT Plat…", portfolio: "Clinical Informatics", priority: "High", status: "Under-staffed", planned: 6, actual: 3, variance: "-3", util: "50%", risk: "Medium", role: "Biomedic…" },
    { id: "PRJ-022", name: "Value-Based Care Contract Performance…", portfolio: "Population Health", priority: "High", status: "Under-staffed", planned: 9, actual: 6, variance: "-3", util: "67%", risk: "Medium", role: "Populatio…" },
    { id: "PRJ-023", name: "Digital Twin for OR Scheduling Optimi…", portfolio: "Nursing & Clinical Op…", priority: "Medium", status: "Under-staffed", planned: 6, actual: 3, variance: "-3", util: "50%", risk: "High", role: "OR Analy…" },
    { id: "PRJ-024", name: "IT Service Management - ServiceNow He…", portfolio: "Information Technology", priority: "Medium", status: "Under-staffed", planned: 6, actual: 3, variance: "-3", util: "50%", risk: "Low", role: "ITSM Lea…" },
  ];

  const pillFor = (txt: string) => {
    const t = (txt || "").toLowerCase();
    if (t.includes("critical") || t.includes("over") || t.includes("high")) return { bg: PILL_OFF, fg: RAG_OFF };
    if (t.includes("medium") || t.includes("under")) return { bg: PILL_AT, fg: RAG_AT };
    return { bg: PILL_OK, fg: RAG_OK };
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex items-center gap-6 lg:pr-8 lg:border-r-2 border-border">
            <div className="text-3xl font-bold text-foreground">266 <span className="text-lg text-muted-foreground font-semibold">FTEs</span></div>
            <div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-foreground" />
                <span className="text-sm font-semibold text-foreground">105.6% Utilized</span>
              </div>
              <span className="text-[11px] text-muted-foreground">of 252 planned FTEs across all portfolios</span>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-secondary/50 rounded-lg p-3 border border-border">
              <div className="text-[11px] text-muted-foreground mb-1">Planned</div>
              <div className="text-lg font-semibold text-foreground">252 FTEs</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 border border-border">
              <div className="text-[11px] text-muted-foreground mb-1">Actual</div>
              <div className="text-lg font-semibold text-foreground">266 FTEs</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 border border-border">
              <div className="text-[11px] text-muted-foreground mb-1">Variance</div>
              <div className="text-lg font-semibold" style={{ color: RAG_OFF }}>+14</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 border border-border">
              <div className="text-[11px] text-muted-foreground mb-1">Max Util.</div>
              <div className="text-lg font-semibold text-foreground">90%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Capacity Trend</h3>
          <p className="text-[11px] text-muted-foreground mb-3">Monthly FTE allocation (2026)</p>
          <div className="w-full h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="capP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART_COLORS[3]} stopOpacity={0.15} /><stop offset="95%" stopColor={CHART_COLORS[3]} stopOpacity={0} /></linearGradient>
                  <linearGradient id="capA" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.25} /><stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} /></linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="Planned" stroke={CHART_COLORS[3]} strokeWidth={2} strokeDasharray="6 4" fill="url(#capP)" dot={false} />
                <Area type="monotone" dataKey="Actual" stroke={CHART_COLORS[0]} strokeWidth={2} fill="url(#capA)" dot={{ r: 3, fill: CHART_COLORS[0] }} />
                <Area type="monotone" dataKey="Forecast" stroke={CHART_COLORS[1]} strokeWidth={2} strokeDasharray="4 3" fill="none" dot={{ r: 3, fill: CHART_COLORS[1] }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-2 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2"><div className="w-6 h-0.5 border-t-2 border-dashed" style={{ borderColor: CHART_COLORS[3] }} /><span>Planned</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: CHART_COLORS[0] }} /><span>Actual</span></div>
            <div className="flex items-center gap-2"><div className="w-6 h-0.5 border-t-2 border-dashed" style={{ borderColor: CHART_COLORS[1] }} /><span>Forecast</span></div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Users className="h-4 w-4" /> Demand by Role</h3>
          <p className="text-[11px] text-muted-foreground mb-3">Planned vs. actual FTEs per role</p>
          <div className="w-full h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byRole} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="role" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} width={110} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="Planned" fill={CHART_COLORS[1]} radius={[0, 4, 4, 0]} barSize={10} />
                <Bar dataKey="Actual" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-2 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: CHART_COLORS[1] }} /><span>Planned</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: CHART_COLORS[0] }} /><span>Actual</span></div>
          </div>
        </div>
      </div>

      {/* Portfolio allocation */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-foreground">Portfolio Allocation</h3>
        <p className="text-[11px] text-muted-foreground mb-3">FTE distribution across portfolios</p>
        <div className="w-full h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byPortfolio} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="portfolio" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="Planned" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} barSize={14} />
              <Bar dataKey="Actual" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {overAllocated.map((r) => (
            <span key={r.role} className="text-[11px] px-2 py-1 rounded-md border border-foreground/30 bg-secondary flex items-center gap-1 font-semibold">
              <AlertCircle className="h-3 w-3" />
              {r.role} +{r.over} over
            </span>
          ))}
        </div>
      </div>

      {/* Capacity issues table */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-secondary border border-border"><AlertCircle className="h-4 w-4 text-foreground" /></div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Projects with Capacity Issues</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">16 projects with staffing variances</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left">
                {["ID", "Project", "Portfolio", "Priority", "Status", "Planned", "Actual", "Variance", "Util %", "Risk", "Key Role"].map((h) => (
                  <th key={h} className="text-[10px] font-semibold text-muted-foreground pb-3 pr-4 whitespace-nowrap uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {capacityIssueProjects.map((p) => {
                const pri = pillFor(p.priority);
                const st = pillFor(p.status);
                const risk = pillFor(p.risk);
                return (
                  <tr key={p.id} className="border-b border-border/50">
                    <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground font-mono text-[11px]">{p.id}</td>
                    <td className="py-3 pr-4 font-medium text-foreground">{p.name}</td>
                    <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">{p.portfolio}</td>
                    <td className="py-3 pr-4 whitespace-nowrap"><span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: pri.bg, color: pri.fg }}>{p.priority}</span></td>
                    <td className="py-3 pr-4 whitespace-nowrap"><span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: st.bg, color: st.fg }}>{p.status}</span></td>
                    <td className="py-3 pr-4 text-right tabular-nums text-foreground">{p.planned}</td>
                    <td className="py-3 pr-4 text-right tabular-nums text-foreground">{p.actual}</td>
                    <td className="py-3 pr-4 text-right tabular-nums font-semibold" style={{ color: p.variance.startsWith("+") ? RAG_OFF : RAG_AT }}>{p.variance}</td>
                    <td className="py-3 pr-4 text-right tabular-nums font-semibold text-foreground">{p.util}</td>
                    <td className="py-3 pr-4 whitespace-nowrap"><span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: risk.bg, color: risk.fg }}>{p.risk}</span></td>
                    <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">{p.role}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * Inline DailySpend + Forecast widget (for chat inline rendering)
 * ============================================================ */
export function DailySpendForecastWidget() {
  const planned = 0.094;
  const actuals = [0.118, 0.102, 0.131, 0.097, 0.142, 0.124, 0.089, 0.128, 0.144, 0.163];
  const forecasts = [0.148, 0.172, 0.198, 0.227, 0.261];
  const combined = [...actuals, ...forecasts];
  const trend = combined.map((_, i) => {
    const a = combined[i - 1] ?? combined[i];
    const b = combined[i];
    const c = combined[i + 1] ?? combined[i];
    return +((a + b + c) / 3).toFixed(3);
  });
  const data = Array.from({ length: 15 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (9 - i));
    const month = d.toLocaleString("en-US", { month: "short" });
    const dayNum = d.getDate();
    const isForecast = i >= 10;
    return {
      day: `${month} ${dayNum}`,
      dayNum,
      month,
      Planned: planned,
      Actual: isForecast ? undefined : actuals[i],
      Forecast: isForecast ? forecasts[i - 10] : undefined,
      Trend: trend[i],
    };
  });

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Daily Spend — Last 10 days + 5-day forecast
        </h3>
        <p className="text-[11px] text-muted-foreground">Actual, planned, forecast, and trend ($M)</p>
      </div>
      <div className="w-full h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 12 }} barCategoryGap="2%" barGap={1}>
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
              interval={0}
              height={42}
              tick={(props: any) => {
                const { x, y, index } = props;
                const item = data[index];
                const prev = index > 0 ? data[index - 1] : null;
                const showMonth = !prev || prev.month !== item.month;
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text x={0} y={0} dy={12} textAnchor="middle" fontSize={11} fill="hsl(var(--muted-foreground))">
                      {item.dayNum}
                    </text>
                    {showMonth && (
                      <text x={0} y={0} dy={26} textAnchor="middle" fontSize={10} fontWeight={600} fill="hsl(var(--foreground))">
                        {item.month}
                      </text>
                    )}
                  </g>
                );
              }}
            />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}M`} width={55} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => (v == null ? "—" : `$${v}M`)} />
            <ReferenceLine x={data[9]?.day} stroke="hsl(var(--foreground))" strokeDasharray="3 3" strokeWidth={2} label={{ value: "Today", position: "top", fontSize: 10 }} />
            <Bar dataKey="Actual" radius={[4, 4, 0, 0]} maxBarSize={80} fill={CHART_COLORS[0]} />
            <Bar dataKey="Forecast" radius={[4, 4, 0, 0]} maxBarSize={80} fill={CHART_COLORS[1]} fillOpacity={0.55} />
            <Line type="monotone" dataKey="Planned" stroke={CHART_COLORS[3]} strokeWidth={3} strokeDasharray="6 4" dot={false} />
            <Line type="monotone" dataKey="Trend" stroke={CHART_COLORS[10]} strokeWidth={3.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-5 mt-2 text-[11px] text-muted-foreground flex-wrap">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: CHART_COLORS[0] }} /><span>Actual</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: CHART_COLORS[1], opacity: 0.55 }} /><span>Forecast</span></div>
        <div className="flex items-center gap-2"><div className="w-6 h-0.5" style={{ background: CHART_COLORS[10] }} /><span>Trend (3-day avg)</span></div>
        <div className="flex items-center gap-2"><div className="w-6 h-0.5 border-t-2 border-dashed" style={{ borderColor: CHART_COLORS[3] }} /><span>Planned</span></div>
      </div>
    </div>
  );
}
