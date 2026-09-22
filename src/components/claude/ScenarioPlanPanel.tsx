import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  DollarSign, Zap, Users, Target, TrendingUp, ArrowUp, ArrowDown,
  Layers, ChevronDown, ChevronUp, Save, Share2, Play, Trash2,
  Lock, Scissors, MoreHorizontal, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ShareButton } from "@/components/claude/ShareButton";
import { toast } from "sonner";
import { setItemState } from "@/hooks/use-phase-state";
import { EXISTING_PORTFOLIO_ROWS } from "@/config/existingPortfolioRows";
import scenarioAgentChip from "@/assets/scenario-agent-chip.svg";

/* ============================================================
 * Helpers — parse existing scenario_comparison data
 * ============================================================ */

const parseM = (s: string | undefined): number => {
  if (!s) return 0;
  const m = String(s).match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : 0;
};


const fmtMoney = (n: number): string => {
  if (!Number.isFinite(n)) return "0";
  const r = Math.round(n * 100) / 100;
  return Number.isInteger(r) ? `${r}` : r.toFixed(2).replace(/\.?0+$/, "");
};

const parsePct = (s: string | undefined): number => {
  if (!s) return 0;
  const m = String(s).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
};

const cellText = (c: any): string => (typeof c === "object" ? c?.t ?? "" : String(c ?? ""));
const cellColor = (c: any): "green" | "amber" | "red" | "" =>
  (typeof c === "object" ? c?.c : "") || "";

const rowByLabel = (rows: any[][], match: string) =>
  rows.find((r) => String(r[0]).toLowerCase().includes(match.toLowerCase())) || [];

/* ============================================================
 * Section card wrapper (collapsible)
 * ============================================================ */

function Section({
  icon: Icon, title, subtitle, children, defaultOpen = true, badge,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-card rounded-xl border border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg border" style={{ background: "#7B6FD4", borderColor: "#7B6FD4" }}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {badge}
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {open && <div className="px-4 pb-4 border-t border-border pt-4">{children}</div>}
    </div>
  );
}

/* ============================================================
 * KPI Cards
 * ============================================================ */

export function SummaryCard({
  icon: Icon, label, value, sub,
}: {
  icon: React.ElementType; label: string; value: string; sub?: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-secondary border border-border">
          <Icon className="h-3.5 w-3.5 text-foreground" />
        </div>
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

/* ============================================================
 * Capacity Heatmap (synthesized)
 * ============================================================ */

const ROLES = [
  { name: "Engineering", capacity: 0.30 },
  { name: "Product Management", capacity: 0.12 },
  { name: "Data & Analytics", capacity: 0.15 },
  { name: "Clinical Informatics", capacity: 0.13 },
  { name: "Security & Compliance", capacity: 0.10 },
  { name: "UX / Design", capacity: 0.08 },
  { name: "QA & Testing", capacity: 0.07 },
  { name: "Change Management", capacity: 0.05 },
];

function makeHeatmap(peakUtil: number, scenarioId: string) {
  // Distribute peak across roles with stable variance per scenario
  const seed = scenarioId.charCodeAt(0) || 65;
  return ROLES.map((role, i) => {
    const variance = ((seed + i * 7) % 30) / 100; // 0–0.3
    const bias = role.name === "Engineering" || role.name === "Clinical Informatics" ? 0.15 : 0;
    const base = peakUtil * (0.6 + variance + bias);
    const values = [0, 1, 2, 3].map((q) => {
      const wave = Math.sin((seed + i + q * 1.3) * 1.2) * 25;
      const v = Math.max(0, Math.round(base + wave - q * 6));
      return q === 3 && role.name !== "Engineering" ? 0 : v;
    });
    const nonZero = values.filter((v) => v > 0);
    const avg = nonZero.length ? Math.round(nonZero.reduce((a, b) => a + b, 0) / nonZero.length) : 0;
    const peak = Math.max(...values);
    return { ...role, values, avg, peak };
  });
}

function heatStyle(pct: number): React.CSSProperties {
  if (pct === 0) return { background: "hsl(240, 30%, 96%)", color: "hsl(var(--muted-foreground))" };
  if (pct > 110) return { background: "hsl(243, 60%, 45%)", color: "white" };
  if (pct > 100) return { background: "hsl(243, 55%, 55%)", color: "white" };
  if (pct >= 90) return { background: "hsl(243, 50%, 65%)", color: "white" };
  if (pct >= 70) return { background: "hsl(243, 45%, 75%)", color: "hsl(243, 60%, 20%)" };
  if (pct >= 40) return { background: "hsl(243, 40%, 85%)", color: "hsl(243, 60%, 25%)" };
  return { background: "hsl(243, 35%, 92%)", color: "hsl(243, 60%, 30%)" };
}

export function CapacityHeatmap({ peakUtil, scenarioId, fundedCount, capacity }: {
  peakUtil: number; scenarioId: string; fundedCount: number; capacity: number;
}) {
  const heat = useMemo(() => makeHeatmap(peakUtil, scenarioId), [peakUtil, scenarioId]);
  const overloaded = heat.filter((r) => r.peak > 100).length;
  const labels = ["Q1 FY26", "Q2 FY26", "Q3 FY26", "Q4 FY26"];

  return (
    <Section
      icon={Users}
      title="Capacity Heatmap"
      subtitle="Resource utilization by role / discipline × quarter"
      badge={
        overloaded > 0 ? (
          <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
            {overloaded} over-allocated
          </span>
        ) : null
      }
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-muted rounded-lg p-0.5">
            <button className="px-3 py-1 rounded-md text-xs font-medium text-muted-foreground">Monthly</button>
            <button className="px-3 py-1 rounded-md text-xs font-medium bg-background text-foreground shadow-sm">Quarterly</button>
          </div>
          <div className="text-[10px] text-muted-foreground">
            {fundedCount} funded initiatives · {capacity.toLocaleString()} FTE capacity
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `170px 50px 50px repeat(${labels.length}, 1fr)` }}>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">Role / Discipline</div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-center">Avg</div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-center">Peak</div>
              {labels.map((l) => (
                <div key={l} className="text-center text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{l}</div>
              ))}
            </div>
            {heat.map((role) => (
              <div key={role.name} className="grid gap-1 mb-1" style={{ gridTemplateColumns: `170px 50px 50px repeat(${labels.length}, 1fr)` }}>
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-medium truncate text-foreground">{role.name}</p>
                  <p className="text-[9px] text-muted-foreground">{Math.round(role.capacity * 100)}% of pool</p>
                </div>
                <div className={cn(
                  "rounded flex items-center justify-center h-8 text-[10px] font-bold",
                  role.avg > 100 ? "text-destructive" : role.avg >= 80 ? "text-amber-600" : "text-foreground"
                )}>
                  {role.avg}%
                </div>
                <div className={cn(
                  "rounded flex items-center justify-center h-8 text-[10px] font-bold",
                  role.peak > 100 ? "text-destructive" : role.peak >= 90 ? "text-amber-600" : "text-foreground"
                )}>
                  {role.peak}%
                </div>
                {role.values.map((pct, pi) => (
                  <div
                    key={pi}
                    className="rounded flex items-center justify-center h-8 text-[10px] font-semibold"
                    style={heatStyle(pct)}
                    title={`${role.name} · ${labels[pi]}: ${pct}%`}
                  >
                    {pct > 0 ? `${pct}%` : "—"}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-border">
          <span className="text-[10px] text-muted-foreground">Utilization:</span>
          <div className="flex gap-1.5 items-center flex-wrap">
            {[
              { l: "0%", p: 0 }, { l: "<40%", p: 30 }, { l: "40–70%", p: 55 },
              { l: "70–90%", p: 80 }, { l: "90–100%", p: 95 },
              { l: "100–110%", p: 105 }, { l: ">110%", p: 115 },
            ].map((x) => (
              <div key={x.l} className="flex items-center gap-1">
                <div className="w-4 h-3 rounded-sm" style={heatStyle(x.p)} />
                <span className="text-[9px] text-muted-foreground">{x.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================
 * Priority Stack (synthesized from projectDelta narrative)
 * ============================================================ */

const SAMPLE_INITIATIVES = [
  { id: "A1-02", name: "Sepsis Detection Tool", portfolio: "Patient Safety", department: "Clinical Quality", score: 92, priority: "High", budget: "$2.1M", fte: 12, status: "In review",
    rationale: "18% modeled mortality reduction. Vendor proven at 3 peer systems. Clean proposal with quantified patient safety benefit.",
    submitter: "Dr. Sarah Chen", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "Reduce sepsis mortality 30%", innovationHorizon: "H1", capexOpex: "30% / 70%", fundingSource: "Operating budget", benefitType: "Patient outcomes", criticalRoles: "Clinical Analyst, Data Scientist", vendorInvolved: "Yes", dependencies: 2, integrationComplexity: 5, riskType: "Clinical adoption", patientImpact: "High", regulatoryImpact: "Yes", kpis: "Sepsis mortality rate", baseline: "12.4%", target: "8.5%" },
  { id: "D1-01", name: "EHR Platform Core", portfolio: "Digital Transformation", department: "IT Infrastructure", score: 88, priority: "High", budget: "$5.4M", fte: 32, status: "In review",
    rationale: "Foundational infrastructure for every Digital Transformation objective. Vendor confirmed, scope locked.",
    submitter: "Marcus Patel", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 24, primaryOkr: "Unify clinical data systems", innovationHorizon: "H1", capexOpex: "45% / 55%", fundingSource: "Capital reserve", benefitType: "Operational efficiency", criticalRoles: "EHR Architect, PM, Integration Lead", vendorInvolved: "Yes", dependencies: 4, integrationComplexity: 8, riskType: "Technical / integration", patientImpact: "Medium", regulatoryImpact: "Yes", kpis: "Clinician documentation time", baseline: "42 min/shift", target: "28 min/shift" },
  { id: "A2-02", name: "OR Scheduling", portfolio: "Operational Excellence", department: "Surgical Services", score: 85, priority: "High", budget: "$2.8M", fte: 16, status: "In review",
    rationale: "Vendor selection complete. Strong KR alignment to OR turnaround. Realistic timeline, conservative benefit case.",
    submitter: "David Chen", investmentType: "Change", startQuarter: "Q2 FY27", durationMonths: 12, primaryOkr: "Improve OR turnaround time 20%", innovationHorizon: "H1", capexOpex: "20% / 80%", fundingSource: "Operating budget", benefitType: "Throughput / revenue", criticalRoles: "OR Lead, Scheduling Analyst, PM", vendorInvolved: "Yes", dependencies: 2, integrationComplexity: 5, riskType: "Workflow change", patientImpact: "Low", regulatoryImpact: "No", kpis: "OR turnaround time", baseline: "38 min", target: "30 min" },
  { id: "B1-02", name: "Telehealth Phase 2", portfolio: "Digital Transformation", department: "Virtual Care", score: 84, priority: "High", budget: "$2.6M", fte: 14, status: "In review",
    rationale: "Phase 1 hit 25% adoption target. Phase 2 expands specialties — strong fit but contingent on Phase 1 milestones.",
    submitter: "Lisa Torres", investmentType: "Grow", startQuarter: "Q2 FY27", durationMonths: 14, primaryOkr: "40% virtual visits", innovationHorizon: "H1", capexOpex: "15% / 85%", fundingSource: "Operating budget", benefitType: "Access / revenue", criticalRoles: "Telehealth PM, Clinical Lead", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Adoption", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Virtual visit share", baseline: "18%", target: "40%" },
  { id: "A2-01", name: "Hospital-Acquired Infection Prevention", portfolio: "Patient Safety", department: "Infection Control", score: 84, priority: "High", budget: "$1.8M", fte: 6, status: "In review",
    rationale: "Current system end-of-life Q2 — time-bound urgency. Compliance and patient safety driver.",
    submitter: "Dr. Reyes", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 10, primaryOkr: "Reduce HAI rate 18%", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Patient outcomes", criticalRoles: "IP Lead, Data Engineer", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Clinical adoption", patientImpact: "High", regulatoryImpact: "Yes", kpis: "HAI rate", baseline: "3.4%", target: "2.8%" },
  { id: "A1-01", name: "Staff Retention Analytics", portfolio: "Workforce Resilience", department: "People Analytics", score: 83, priority: "High", budget: "$2.1M", fte: 8, status: "In review",
    rationale: "Maps directly to 22%→16% turnover KR. Pilot data validated by HR. Marcus Webb has implementation track record.",
    submitter: "Marcus Webb", investmentType: "Change", startQuarter: "Q2 FY27", durationMonths: 9, primaryOkr: "Reduce nurse turnover 22→16%", innovationHorizon: "H1", capexOpex: "10% / 90%", fundingSource: "HR ops budget", benefitType: "Retention / cost avoidance", criticalRoles: "HRIS Analyst, Data Scientist", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 3, riskType: "Adoption", patientImpact: "None", regulatoryImpact: "No", kpis: "Nurse voluntary turnover", baseline: "22%", target: "16%" },
  { id: "C1-02", name: "Supply Chain Vendor Consolidation", portfolio: "Operational Excellence", department: "Supply Chain", score: 82, priority: "Medium", budget: "$2.2M", fte: 10, status: "In review",
    rationale: "Documented $1.4M annual run-rate savings. Two-year payback. Low execution risk.",
    submitter: "D. Chen", investmentType: "Run", startQuarter: "Q2 FY27", durationMonths: 10, primaryOkr: "Reduce supply spend 8%", innovationHorizon: "H1", capexOpex: "5% / 95%", fundingSource: "Operating budget", benefitType: "Cost savings", criticalRoles: "Sourcing Lead, PM", vendorInvolved: "Yes", dependencies: 0, integrationComplexity: 3, riskType: "Vendor risk", patientImpact: "None", regulatoryImpact: "No", kpis: "Supply run-rate", baseline: "$18.4M", target: "$17.0M" },
  { id: "B1-01", name: "Patient Portal Modernization", portfolio: "Digital Transformation", department: "Patient Experience", score: 81, priority: "Medium", budget: "$2.4M", fte: 11, status: "In review",
    rationale: "Modernizes legacy portal. Strong UX uplift. Owner unassigned — flagged for sponsor review.",
    submitter: "Unassigned", investmentType: "Change", startQuarter: "Q3 FY27", durationMonths: 12, primaryOkr: "Patient digital engagement", innovationHorizon: "H1", capexOpex: "20% / 80%", fundingSource: "Operating budget", benefitType: "Patient experience", criticalRoles: "Product Lead, UX, Engineering", vendorInvolved: "Yes", dependencies: 2, integrationComplexity: 6, riskType: "Adoption", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Portal MAU", baseline: "32k", target: "55k" },
  { id: "D1-02", name: "Clinical Data Warehouse", portfolio: "Digital Transformation", department: "Analytics Team", score: 78, priority: "Medium", budget: "$3.2M", fte: 18, status: "In review",
    rationale: "Named as a dependency in 3 other proposals. Worth a sequencing call before final selection.",
    submitter: "L. Torres", investmentType: "Change", startQuarter: "Q2 FY27", durationMonths: 18, primaryOkr: "Unified analytics platform", innovationHorizon: "H1", capexOpex: "40% / 60%", fundingSource: "Capital reserve", benefitType: "Operational efficiency", criticalRoles: "Data Engineer, Architect", vendorInvolved: "Yes", dependencies: 3, integrationComplexity: 7, riskType: "Technical / integration", patientImpact: "Low", regulatoryImpact: "Yes", kpis: "Source systems unified", baseline: "3", target: "9" },
  { id: "A1-04", name: "Medication Reconciliation Automation", portfolio: "Patient Safety", department: "Pharmacy", score: 76, priority: "Medium", budget: "$1.6M", fte: 7, status: "In review",
    rationale: "Reduces ADE risk. Vendor demoed, clean integration path. Benefit case understated.",
    submitter: "R. Patel", investmentType: "Change", startQuarter: "Q3 FY27", durationMonths: 9, primaryOkr: "Reduce med errors 25%", innovationHorizon: "H1", capexOpex: "15% / 85%", fundingSource: "Operating budget", benefitType: "Patient outcomes", criticalRoles: "Pharmacist Lead, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Workflow change", patientImpact: "High", regulatoryImpact: "Yes", kpis: "ADE rate", baseline: "1.8%", target: "1.3%" },
  { id: "C1-03", name: "Outpatient Referral Automation", portfolio: "Operational Excellence", department: "Ambulatory", score: 74, priority: "Medium", budget: "$2.0M", fte: 9, status: "In review",
    rationale: "Reduces leakage; modeled $0.9M revenue retention. Owner identified, scope defined.",
    submitter: "T. Brooks", investmentType: "Change", startQuarter: "Q3 FY27", durationMonths: 10, primaryOkr: "Reduce referral leakage", innovationHorizon: "H1", capexOpex: "10% / 90%", fundingSource: "Operating budget", benefitType: "Revenue retention", criticalRoles: "Ambulatory PM, Analyst", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Workflow change", patientImpact: "Low", regulatoryImpact: "No", kpis: "Outbound referral rate", baseline: "27%", target: "18%" },
  { id: "A1-03", name: "Surgical Safety Checklist Tool", portfolio: "Patient Safety", department: "Perioperative", score: 72, priority: "Medium", budget: "$1.6M", fte: 5, status: "In review",
    rationale: "Joint Commission alignment. Modest direct benefit but supports broader safety culture KRs.",
    submitter: "Dr. Reyes", investmentType: "Run", startQuarter: "Q3 FY27", durationMonths: 8, primaryOkr: "Surgical safety compliance", innovationHorizon: "H1", capexOpex: "5% / 95%", fundingSource: "Operating budget", benefitType: "Compliance", criticalRoles: "OR Lead, PM", vendorInvolved: "Yes", dependencies: 0, integrationComplexity: 2, riskType: "Adoption", patientImpact: "Medium", regulatoryImpact: "Yes", kpis: "Checklist compliance", baseline: "78%", target: "95%" },
  { id: "D2-01", name: "Leadership Development Track", portfolio: "Workforce Resilience", department: "Talent Development", score: 68, priority: "Medium", budget: "$1.7M", fte: 4, status: "In review",
    rationale: "Indirect KR connection. Long benefit horizon — strategic but not urgent.",
    submitter: "M. Webb", investmentType: "Run", startQuarter: "Q3 FY27", durationMonths: 12, primaryOkr: "Build leadership pipeline", innovationHorizon: "H2", capexOpex: "0% / 100%", fundingSource: "HR ops budget", benefitType: "Retention", criticalRoles: "L&D Lead", vendorInvolved: "Yes", dependencies: 0, integrationComplexity: 1, riskType: "Adoption", patientImpact: "None", regulatoryImpact: "No", kpis: "Internal leadership fill rate", baseline: "42%", target: "60%" },
];

export function PriorityStack({ fundedCount, totalBudget }: { fundedCount: number; totalBudget: number }) {
  const initiatives = EXISTING_PORTFOLIO_ROWS;
  // Score-sorted (preserve), with a budget cut line drawn after fundedCount funded items.
  const rows = initiatives;
  const fundedShown = Math.min(fundedCount, rows.length);
  const COL_SPAN = 30;

  return (
    <Section icon={Layers} title="Priority Stack" subtitle={`${rows.length} initiatives · ${fundedCount} funded`} defaultOpen>
      <div className="-mx-4 -mb-4 border-t border-border overflow-x-auto">
        <table className="w-full min-w-[2400px] text-[13px]">
          <thead>
            <tr className="border-b border-border">
              <th className="w-[56px] pl-4 pr-2 py-2.5 text-left text-[12px] font-normal text-muted-foreground">Score</th>
              <th className="px-3 py-2.5 text-left text-[12px] font-normal text-muted-foreground">Project Name</th>
              <th className="w-[110px] px-2 py-2.5 text-left text-[12px] font-normal text-muted-foreground">Status</th>
              <th className="px-3 py-2.5 text-left text-[12px] font-normal text-muted-foreground">Department</th>
              <th className="px-3 py-2.5 text-left text-[12px] font-normal text-muted-foreground">Portfolio</th>
              <th className="min-w-[375px] w-[375px] px-3 py-2.5 text-left text-[12px] font-normal text-muted-foreground">Score Rationale</th>
              <th className="w-[80px] px-2 py-2.5 text-left text-[12px] font-normal text-muted-foreground">Priority</th>
              <th className="w-[80px] px-2 py-2.5 text-left text-[12px] font-normal text-muted-foreground">Budget</th>
              <th className="w-[52px] px-2 py-2.5 text-left text-[12px] font-normal text-muted-foreground">FTEs</th>
              <th className="px-3 py-2.5 text-left text-[12px] font-normal text-muted-foreground whitespace-nowrap">Submitter</th>
              <th className="px-3 py-2.5 text-left text-[12px] font-normal text-muted-foreground whitespace-nowrap">Investment Type</th>
              <th className="px-3 py-2.5 text-left text-[12px] font-normal text-muted-foreground whitespace-nowrap">Start Quarter</th>
              <th className="px-3 py-2.5 text-left text-[12px] font-normal text-muted-foreground whitespace-nowrap">Duration (mo)</th>
              <th className="px-3 py-2.5 text-left text-[12px] font-normal text-muted-foreground whitespace-nowrap">Primary OKR</th>
              <th className="px-3 py-2.5 text-left text-[12px] font-normal text-muted-foreground whitespace-nowrap">Innovation Horizon</th>
              <th className="px-3 py-2.5 text-left text-[12px] font-normal text-muted-foreground whitespace-nowrap">CapEx / OpEx</th>
              <th className="px-3 py-2.5 text-left text-[12px] font-normal text-muted-foreground whitespace-nowrap">Funding Source</th>
              <th className="px-3 py-2.5 text-left text-[12px] font-normal text-muted-foreground whitespace-nowrap">Benefit Type</th>
              <th className="px-3 py-2.5 text-left text-[12px] font-normal text-muted-foreground whitespace-nowrap">Critical Roles</th>
              <th className="px-3 py-2.5 text-left text-[12px] font-normal text-muted-foreground whitespace-nowrap">Vendor Involved</th>
              <th className="px-3 py-2.5 text-left text-[12px] font-normal text-muted-foreground whitespace-nowrap">Dependencies</th>
              <th className="px-3 py-2.5 text-left text-[12px] font-normal text-muted-foreground whitespace-nowrap">Integration Complexity</th>
              <th className="px-3 py-2.5 text-left text-[12px] font-normal text-muted-foreground whitespace-nowrap">Primary Risk Type</th>
              <th className="px-3 py-2.5 text-left text-[12px] font-normal text-muted-foreground whitespace-nowrap">Patient Impact</th>
              <th className="px-3 py-2.5 text-left text-[12px] font-normal text-muted-foreground whitespace-nowrap">Regulatory Impact</th>
              <th className="px-3 py-2.5 text-left text-[12px] font-normal text-muted-foreground whitespace-nowrap">KPIs Impacted</th>
              <th className="px-3 py-2.5 text-left text-[12px] font-normal text-muted-foreground whitespace-nowrap">Baseline</th>
              <th className="px-3 py-2.5 text-left text-[12px] font-normal text-muted-foreground whitespace-nowrap">Target</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const showCut = i === fundedShown && i > 0;
              const below = i >= fundedShown;
              const priorityChip = r.priority === "High" ? { bg: "#FCD2D2", fg: "#5A0A0A" }
                : r.priority === "Medium" ? { bg: "#FDE7B3", fg: "#4A2D00" }
                : { bg: "#D6E4FF", fg: "#0A2A5A" };
              return (
                <React.Fragment key={r.id}>
                  {showCut && (
                    <tr className="bg-primary/5">
                      <td colSpan={COL_SPAN} className="px-4 py-2 border-y border-dashed border-primary/40">
                        <div className="flex items-center justify-between gap-3 text-[11px]">
                          <div className="flex items-center gap-2 font-semibold uppercase tracking-wider text-primary">
                            <Scissors className="w-3 h-3" />
                            Budget cut line
                          </div>
                          <div className="text-muted-foreground font-medium normal-case tracking-normal">
                            {fundedShown} above · ${fmtMoney(totalBudget)}M allocated · {rows.length - fundedShown} below the line
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  <tr className={cn("border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors", below && "opacity-50")}>
                    <td className="pl-4 pr-2 py-[14px]">
                      <span className="inline-flex items-center justify-center min-w-[30px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold font-mono">{r.score}</span>
                    </td>
                    <td className="px-3 py-[14px] font-medium text-foreground whitespace-nowrap max-w-[280px] overflow-hidden text-ellipsis" title={r.name}>{r.name}</td>
                    <td className="px-2 py-[14px] text-foreground/80 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold"
                        style={{ backgroundColor: "#B9F4C3", color: "#042F0A" }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.department}</td>
                    <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.portfolio}</td>
                    <td className="px-3 py-[14px] align-middle text-foreground/70 text-[12px] leading-snug min-w-[375px] w-[375px] max-w-[375px]" title={r.rationale}>
                      <span className="block overflow-hidden cursor-help" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{r.rationale}</span>
                    </td>
                    <td className="px-2 py-[14px]">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold"
                        style={{ backgroundColor: priorityChip.bg, color: priorityChip.fg }}
                      >
                        {r.priority}
                      </span>
                    </td>
                    <td className="px-2 py-[14px] text-foreground/80 whitespace-nowrap">{r.budget}</td>
                    <td className="px-2 py-[14px] text-foreground/80">{r.fte}</td>
                    <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.submitter}</td>
                    <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.investmentType}</td>
                    <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.startQuarter}</td>
                    <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.durationMonths}</td>
                    <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap max-w-[220px] overflow-hidden text-ellipsis" title={r.primaryOkr}>{r.primaryOkr}</td>
                    <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.innovationHorizon}</td>
                    <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.capexOpex}</td>
                    <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.fundingSource}</td>
                    <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.benefitType}</td>
                    <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap max-w-[220px] overflow-hidden text-ellipsis" title={r.criticalRoles}>{r.criticalRoles}</td>
                    <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.vendorInvolved}</td>
                    <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.dependencies}</td>
                    <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.integrationComplexity}/10</td>
                    <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.riskType}</td>
                    <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.patientImpact}</td>
                    <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.regulatoryImpact}</td>
                    <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap max-w-[220px] overflow-hidden text-ellipsis" title={r.kpis}>{r.kpis}</td>
                    <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.baseline}</td>
                    <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.target}</td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

/* ============================================================
 * Delta vs Current Plan
 * ============================================================ */

function DeltaPanel({ scenarioBudget, baselineBudget, scenarioCount, baselineCount }: {
  scenarioBudget: number; baselineBudget: number; scenarioCount: number; baselineCount: number;
}) {
  // Round to clean values to avoid floating-point artifacts (e.g. 5.100000000000001).
  const budgetDelta = Math.round((scenarioBudget - baselineBudget) * 100) / 100;
  const countDelta = scenarioCount - baselineCount;
  const fteDelta = countDelta * 30;

  const formatBudget = (v: number) => {
    // Round to 2 decimals max, drop trailing zeros (5.00 → 5, 5.10 → 5.1)
    const rounded = Math.round(v * 100) / 100;
    if (Number.isInteger(rounded)) return `${rounded}`;
    return rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  };

  const DeltaValue = ({ value, display, suffix = "" }: { value: number; display?: string; suffix?: string }) => (
    <span className={cn(
      "text-lg font-bold tabular-nums",
      value > 0 ? "text-emerald-600 dark:text-emerald-400" : value < 0 ? "text-destructive" : "text-muted-foreground"
    )}>
      {value > 0 ? "+" : ""}{display ?? value}{suffix}
    </span>
  );

  return (
    <Section icon={TrendingUp} title="Delta vs Current Plan" subtitle="Changes compared to the current plan">
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-lg bg-secondary/50 border border-border">
          <p className="text-[11px] text-muted-foreground mb-0.5">Budget</p>
          <DeltaValue value={budgetDelta} display={formatBudget(budgetDelta)} suffix="M" />
        </div>
        <div className="text-center p-3 rounded-lg bg-secondary/50 border border-border">
          <p className="text-[11px] text-muted-foreground mb-0.5">FTEs</p>
          <DeltaValue value={fteDelta} />
        </div>
        <div className="text-center p-3 rounded-lg bg-secondary/50 border border-border">
          <p className="text-[11px] text-muted-foreground mb-0.5">Funded Count</p>
          <DeltaValue value={countDelta} />
        </div>
      </div>
    </Section>
  );
}

/* ============================================================
 * Main panel
 * ============================================================ */

export function ScenarioPlanPanel({ artifact, hideAgentCallout = false }: { artifact: any; hideAgentCallout?: boolean }) {
  const sc = artifact;
  const firstId = sc?.scenarios?.[0]?.id || "A";
  const [viewingId, setViewingId] = useState<string>(firstId);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  if (!sc?.scenarios || !sc?.budget) {
    return <div className="text-xs text-muted-foreground">No scenario data available.</div>;
  }

  const keys = ["a", "b", "c", "d", "e", "f"];
  const rows = sc.budget.rows;
  const totalRow =
    rowByLabel(rows, "funded budget").length
      ? rowByLabel(rows, "funded budget")
      : rowByLabel(rows, "total budget").length
        ? rowByLabel(rows, "total budget")
        : rowByLabel(rows, "total envelope");
  const envelopeRow = rowByLabel(rows, "total envelope");
  const fundedRow = rowByLabel(rows, "projects funded");
  const peakRow = rowByLabel(rows, "fte peak") || rowByLabel(rows, "peak");
  const guardrailRow = rowByLabel(rows, "guardrail");
  const reserveRow = rowByLabel(rows, "reserve");

  const scenarioCards = sc.scenarios.map((s: any, i: number) => ({
    id: s.id,
    label: s.label,
    budget: cellText(totalRow[i + 1]),
    funded: cellText(fundedRow[i + 1]),
    desc: (sc.projectDelta?.[keys[i]]?.label || "").split(".")[0] + ".",
    guardrailColor: cellColor(guardrailRow[i + 1]) || "green",
    guardrailText: cellText(guardrailRow[i + 1]) || "OK",
  }));

  // Find baseline (first scenario)
  const baselineIdx = 0;
  const baselineBudget = parseM(cellText(totalRow[baselineIdx + 1]));
  const baselineCount = parseInt(cellText(fundedRow[baselineIdx + 1]) || "0", 10);

  const activeIdx = sc.scenarios.findIndex((s: any) => s.id === viewingId);
  const active = scenarioCards[activeIdx] || scenarioCards[0];
  const activeKey = keys[activeIdx];
  const totalBudget = parseM(active.budget);
  const fundedCount = parseInt(active.funded || "0", 10);
  const reserve = Math.round((parseM(cellText(reserveRow[activeIdx + 1])) || totalBudget * 0.15) * 100) / 100;
  const envelopeFromRow = parseM(cellText(envelopeRow[activeIdx + 1]));
  const envelopeBudget = envelopeFromRow || Math.round((totalBudget + reserve) * 100) / 100 || totalBudget;
  const peakUtil = parsePct(cellText(peakRow[activeIdx + 1])) || 90;
  const capacity = 3000;
  // Scale FTEs against funded count out of total active projects (45) — keeps proportions sensible.
  const totalActiveProjects = 45;
  const fundedFTEs = Math.round((fundedCount / totalActiveProjects) * 2785);
  const capUtil = Math.round((fundedFTEs / capacity) * 100);
  const velocityToCapacity = envelopeBudget > 0 ? Math.round((totalBudget / envelopeBudget) * 100) : 0;

  const dotColor = (c: string) =>
    c === "red" ? "bg-red-500" : c === "amber" ? "bg-amber-500" : "bg-green-500";

  // Long-form description from the AI's narrative
  const longDesc =
    sc.projectDelta?.[activeKey]?.label ||
    `${active.label} prioritizes a balanced portfolio across the four strategic themes while respecting capacity and budget guardrails.`;

  return (
    <div className="space-y-4">
      {/* Scenario Agent callout */}
      {!bannerDismissed && !hideAgentCallout && (
        <div
          className="relative rounded-xl border p-4 shadow-[var(--shadow-card)]"
          style={{
            background:
              "linear-gradient(135deg, hsl(265 70% 92%) 0%, hsl(265 60% 96%) 60%, hsl(265 55% 97%) 100%)",
            borderColor: "hsl(265 55% 84%)",
          }}
        >
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            aria-label="Dismiss"
            className="absolute top-2.5 right-2.5 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="mb-2">
            <img src={scenarioAgentChip} alt="Scenario agent" className="w-auto" style={{ height: 22 }} />
          </div>
          <p className="text-[13.5px] font-bold text-foreground leading-snug">I've modeled 3 funding scenarios against your envelope and capacity.</p>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Compare tradeoffs across budget, FTE capacity, and strategic coverage. The Recommended scenario funds 37 of 45 projects within your $42M envelope — cutting only the 8 lowest-scoring operational items.</p>
        </div>
      )}

      {/* Body card — tabs + content wrapped on the canvas */}
      <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] p-6 space-y-4">
      {/* Scenario picker — tabs (hidden when only one scenario) */}
      {scenarioCards.length > 1 && (
      <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/60 border border-border">
        {scenarioCards.map((c: any) => {
          const isViewing = c.id === viewingId;
          return (
            <button
              key={c.id}
              onClick={() => setViewingId(c.id)}
              className={cn(
                "flex-1 min-w-0 px-3 py-2 rounded-md text-left transition-all",
                isViewing
                  ? "bg-card shadow-sm ring-1 ring-border"
                  : "hover:bg-card/50"
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <h4 className={cn(
                  "text-xs font-semibold truncate",
                  isViewing ? "text-foreground" : "text-muted-foreground"
                )}>{c.label}</h4>
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColor(c.guardrailColor))} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className={cn(
                  "text-sm font-bold tracking-tight tabular-nums",
                  isViewing ? "text-foreground" : "text-muted-foreground"
                )}>{c.budget}</span>
                <span className="text-[10px] text-muted-foreground truncate">{c.funded} funded</span>
              </div>
            </button>
          );
        })}
      </div>
      )}

      {/* Scenario detail header — title + description + actions */}
      <div>
        <div className="mb-3">
          <h2 className="text-lg font-bold text-foreground">{active.label}</h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{longDesc}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const payload = {
                id: active.id,
                label: active.label,
                longDesc,
                totalBudget,
                envelopeBudget,
                fundedCount,
                fundedFTEs,
                capacity,
                capUtil,
                peakUtil,
                guardrailColor: active.guardrailColor,
                guardrailText: active.guardrailText,
                implementedAt: new Date().toISOString(),
              };
              try {
                localStorage.setItem("arc:implementedScenario", JSON.stringify(payload));
              } catch {}
              setItemState("active_plans", "in_progress");
              window.dispatchEvent(new CustomEvent("arc:scenarioImplemented", { detail: payload }));
              window.dispatchEvent(new CustomEvent("arc:planBaselineCreated", { detail: payload }));
              toast.success(`${active.label} is now your active plan.`);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-primary hover:bg-primary/90 text-xs font-medium text-primary-foreground transition-colors"
          >
            <Play className="h-3.5 w-3.5" />
            Implement & Baseline
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="More actions"
              className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 min-w-[160px] rounded-md border border-border bg-popover shadow-md py-1">
                <button
                  onClick={() => { setMenuOpen(false); toast.success("Scenario saved."); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-muted text-left"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save
                </button>
                <button
                  onClick={() => { setMenuOpen(false); toast.success("Share link copied."); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-muted text-left"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </button>
                <div className="my-1 border-t border-border" />
                <button
                  onClick={() => { setMenuOpen(false); toast.error("Delete is disabled in demo."); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 text-left"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
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

      {/* Delta vs current plan */}
      {activeIdx !== baselineIdx && (
        <DeltaPanel
          scenarioBudget={totalBudget}
          baselineBudget={baselineBudget}
          scenarioCount={fundedCount}
          baselineCount={baselineCount}
        />
      )}

      {/* Priority Stack */}
      <PriorityStack fundedCount={fundedCount} totalBudget={totalBudget} />

      {/* Capacity Heatmap */}
      <CapacityHeatmap
        peakUtil={peakUtil}
        scenarioId={active.id}
        fundedCount={fundedCount}
        capacity={capacity}
      />

      {/* Guardrail conflict callout */}
      {sc.guardrailConflict && active.guardrailColor === "red" && (
        <div className="rounded-lg border-l-4 border-l-destructive border border-border bg-card px-4 py-3 text-xs text-muted-foreground leading-relaxed">
          <div className="text-xs font-semibold text-foreground mb-1">{active.label} — not submittable</div>
          {sc.guardrailConflict}
        </div>
      )}
      </div>
    </div>
  );
}
