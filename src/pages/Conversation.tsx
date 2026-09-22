import React, { useState, useEffect, useRef, useCallback, useMemo, Fragment } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, FileText, Users, Send, Network, ClipboardCheck, Settings2, Share2, Search, AlertTriangle, Layers, Target, DollarSign, Shield, ExternalLink, Copy, Compass, ChevronRight, ChevronDown, Maximize2, Minimize2, X, MoreHorizontal, BookmarkPlus, Upload, Pencil, History, Scissors, CheckCircle2, XCircle, Flag, GitBranch, BarChart3, Calendar, Mail, UserPlus, Eye, Lock, Sliders, Briefcase, ListChecks, MessageSquare, PlayCircle, Pause, Plus, Filter, Download, RefreshCw, Zap, TrendingUp, ShieldCheck, FileSearch, Edit3, Bell, ArrowUpRight, Wallet, Sparkles, Plug } from "lucide-react";
import { AiIcon } from "@/components/claude/AiIcon";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import FloatingSidebar from "@/components/claude/FloatingSidebar";
import SmartsheetNav from "@/components/claude/SmartsheetNav";
import { useSidebarExpanded, setSidebarExpanded } from "@/hooks/use-sidebar-expanded";
import { setItemState, markItemComplete } from "@/hooks/use-phase-state";
import { useChat14Revealed, revealChat14, createUntitledChat, useUntitledCreated, isUntitledCreated } from "@/hooks/use-reveal-flags";
import Day1Flow from "@/components/claude/Day1Flow";
import { EpmoDashboardPanel, BudgetReportPanel, CapacityReportPanel, DailySpendForecastWidget } from "@/components/claude/EpmoDashboards";
import { ScenarioPlanPanel } from "@/components/claude/ScenarioPlanPanel";
import { EXISTING_PORTFOLIO_ROWS } from "@/config/existingPortfolioRows";
import TypingIndicator from "@/components/claude/TypingIndicator";
import { ShareButton } from "@/components/claude/ShareButton";
import { useArtifactDraft, useJustSaved, markArtifactDirty, saveArtifactDraft, resetArtifactDraft, type ArtifactDraftStatus } from "@/lib/artifact-draft";
import { Play, Square } from "lucide-react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import fastestChip from "@/assets/fastest-chip.svg";
import withAvatarChip from "@/assets/with-avatar-chip.svg";
import intakeAgentChip from "@/assets/intake-agent-chip.svg";
import scenarioAgentChip from "@/assets/scenario-agent-chip.svg";
import reportingAgentChip from "@/assets/reporting-agent-chip.svg";
import arcAgentChip from "@/assets/arc-agent-chip.svg";
import arcAgentOrb from "@/assets/arc-agent-orb.svg";
import avatar1 from "@/assets/avatars/avatar-1.svg";
import avatar2 from "@/assets/avatars/avatar-2.svg";
import avatar3 from "@/assets/avatars/avatar-3.svg";
import avatar4 from "@/assets/avatars/avatar-4.svg";
import avatar5 from "@/assets/avatars/avatar-5.svg";
import pdfIcon from "@/assets/file-icons/pdf.svg";
import pptxIcon from "@/assets/file-icons/pptx.svg";
import docxIcon from "@/assets/file-icons/docx.svg";

const PERSON_AVATARS = [avatar1, avatar2, avatar3, avatar4, avatar5];

// ============================================================
// Action / next-step icon resolver — first try the explicit `icon` key,
// otherwise infer a sensible icon from keywords in the label so we never
// fall back to a generic sparkle for every recommendation.
// ============================================================
const ACTION_ICON_KEYS: Record<string, any> = {
  sparkles: AiIcon, form: FileText, users: Users, send: Send, network: Network,
  review: ClipboardCheck, settings: Settings2, share: Share2, search: Search,
  alert: AlertTriangle, layers: Layers, approve: CheckCircle2, reject: XCircle,
  flag: Flag, scenario: GitBranch, chart: BarChart3, calendar: Calendar,
  mail: Mail, invite: UserPlus, view: Eye, lock: Lock, sliders: Sliders,
  portfolio: Briefcase, list: ListChecks, message: MessageSquare,
  play: PlayCircle, pause: Pause, add: Plus, filter: Filter, download: Download,
  refresh: RefreshCw, energy: Zap, trend: TrendingUp, shield: ShieldCheck,
  inspect: FileSearch, edit: Edit3, notify: Bell, target: Target, money: DollarSign,
  scissors: Scissors, history: History, upload: Upload, compass: Compass, wallet: Wallet,
};

function resolveActionIcon(iconKey: string | undefined, label: string | undefined): any {
  if (iconKey && ACTION_ICON_KEYS[iconKey]) return ACTION_ICON_KEYS[iconKey];
  const t = (label || "").toLowerCase();
  // Order matters — most specific first
  if (/\b(approve|accept|confirm|sign[- ]off|commit|submit)\b/.test(t)) return CheckCircle2;
  if (/\b(reject|decline|deny|cancel)\b/.test(t)) return XCircle;
  if (/\b(flag|escalat)/.test(t)) return Flag;
  if (/\b(scenario|model|what[- ]if|compare)\b/.test(t)) return GitBranch;
  if (/\b(prioriti|rank|score)/.test(t)) return ListChecks;
  if (/\b(budget|cap|envelope|fund|cost|money|spend|reserve)\b/.test(t)) return DollarSign;
  if (/\b(capacity|fte|resource|staff|team)\b/.test(t)) return Users;
  if (/\b(invite|add (collaborator|people|member))/.test(t)) return UserPlus;
  if (/\b(send|email|message|notify|reminder|announce)/.test(t)) return Mail;
  if (/\b(share|publish|distribute)\b/.test(t)) return Share2;
  if (/\b(deadline|schedule|date|window|timeline)\b/.test(t)) return Calendar;
  if (/\b(connect|integrat|sync|link|portfolio)/.test(t)) return Network;
  if (/\b(dashboard|report|chart|metric|kpi|analytics)\b/.test(t)) return BarChart3;
  if (/\b(goal|objective|kr|target|theme)\b/.test(t)) return Target;
  if (/\b(guardrail|governance|polic|rule|complian)/.test(t)) return ShieldCheck;
  if (/\b(risk|warn|conflict|overage|gap|issue|problem)\b/.test(t)) return AlertTriangle;
  if (/\b(config|setting|weight|parameter|criteria|rout)/.test(t)) return Settings2;
  if (/\b(form|intake|template|blueprint)\b/.test(t)) return FileText;
  if (/\b(edit|update|customize|adjust|change|modify|tweak)\b/.test(t)) return Edit3;
  if (/\b(review|inspect|audit|check)\b/.test(t)) return ClipboardCheck;
  if (/\b(open|view|show|see|see |display|preview)\b/.test(t)) return Eye;
  if (/\b(search|find|look up|locate)\b/.test(t)) return Search;
  if (/\b(upload|import|attach|drop)\b/.test(t)) return Upload;
  if (/\b(download|export)\b/.test(t)) return Download;
  if (/\b(start|begin|launch|kick[- ]off|run)\b/.test(t)) return PlayCircle;
  if (/\b(lock|baseline|freeze)\b/.test(t)) return Lock;
  if (/\b(history|past|previous|version)\b/.test(t)) return History;
  if (/\b(cut|trim|reduce|defer)/.test(t)) return Scissors;
  if (/\b(plan|step|workflow|process|stage)\b/.test(t)) return Layers;
  return Compass; // generic, but distinctive — never the AI sparkle
}

// ===========================================================================
// Strategic Framework — unified Setup & Config canvas combining Goals,
// Investment Envelopes, Guardrails (Capacity/Risk/Timing/Enforcement), and
// the Scoring Model. Layout: sticky left section nav + scrollable section
// cards on the right. Items use a shared toggle/value row pattern so the
// whole framework reads consistently across sections.
// ===========================================================================
type FwToolbarControl =
  | { kind: "select"; id: string; value: string; options: string[] }
  | { kind: "button"; id: string; label: string; icon?: "plug" };
type FwToolbar = { controls: FwToolbarControl[] };

type FwField = {
  label: string;
  desc?: string;
  value?: string;
  enabled?: boolean;
  type?: "toggle" | "value" | "weight" | "split" | "range";
  group?: boolean;
  children?: FwField[];
  /** Range fields */
  min?: number | string;
  max?: number | string;
  unit?: "%" | "$";
  /** Group rows: severity badge shown on right */
  severity?: "Warn" | "Block";
};
type FwSubsection = {
  id: string;
  label: string;
  desc?: string;
  enabled?: boolean;
  toolbar?: FwToolbar;
  fields: FwField[];
};
type FwSection = {
  id: string;
  label: string;
  icon: any;
  description?: string;
  fields?: FwField[];
  subsections?: FwSubsection[];
};

const STRATEGIC_FRAMEWORK_SECTIONS: FwSection[] = [
  {
    id: "goals",
    label: "Goals",
    icon: Target,
    description: "What the organization is optimizing for this planning cycle.",
    fields: [
      { label: "Goal name & description", desc: "What the org is optimizing for" },
      { label: "Goal owner", desc: "C-Suite sponsor per goal" },
      { label: "Active / inactive toggle", desc: "Enable or retire goals per cycle" },
      { label: "Fiscal year", desc: "Goals anchored to planning year" },
      { label: "Exempt categories", desc: "Work that bypasses scoring (e.g. compliance)" },
    ],
  },
  {
    id: "envelopes",
    label: "Investment Envelopes",
    icon: Wallet,
    description: "Spending caps, capacity, and allocation targets for the planning horizon.",
    subsections: [
      {
        id: "budget",
        label: "Budget",
        desc: "Currency-denominated spend, anchored to each timeframe.",
        enabled: true,
        toolbar: {
          controls: [
            { kind: "select", id: "cadence", value: "Yearly", options: ["Yearly", "Quarterly", "Monthly"] },
            { kind: "select", id: "fy", value: "FY27", options: ["FY26", "FY27", "FY28"] },
            { kind: "select", id: "currency", value: "$ USD", options: ["$ USD", "€ EUR", "£ GBP"] },
            { kind: "button", id: "erp", label: "Connect ERP", icon: "plug" },
          ],
        },
        fields: [
          { label: "Total Budget", desc: "Sum of CapEx and OpEx per period" },
          { label: "CapEx", desc: "Per fiscal year" },
          { label: "OpEx", desc: "Per fiscal year" },
        ],
      },
      {
        id: "capacity",
        label: "Capacity",
        desc: "People (FTE) devoted to this work.",
        enabled: true,
        toolbar: {
          controls: [
            { kind: "select", id: "cadence", value: "Yearly", options: ["Yearly", "Quarterly", "Monthly"] },
            { kind: "select", id: "fy", value: "FY27", options: ["FY26", "FY27", "FY28"] },
            { kind: "select", id: "group", value: "Group by Dept", options: ["Group by Dept", "Group by Role", "Group by Portfolio"] },
            { kind: "button", id: "hris", label: "Connect HRIS", icon: "plug" },
          ],
        },
        fields: [
          { label: "Total FTE", desc: "Sum of all job profiles per period" },
          { label: "Digital & IT", group: true, children: [
            { label: "Software Engineer" },
            { label: "Sr. Software Engineer" },
            { label: "IT Operations Engineer" },
            { label: "Solutions Architect" },
          ]},
          { label: "Clinical Informatics", group: true, children: [
            { label: "Clinical Informaticist" },
            { label: "Sr. Informatics Analyst" },
          ]},
          { label: "Performance Excellence", group: true, children: [
            { label: "Process Improvement Lead" },
            { label: "Quality Analyst" },
          ]},
          { label: "Program Management Office", group: true, children: [
            { label: "Program Manager" },
            { label: "Project Coordinator" },
          ]},
          { label: "Data & Analytics", group: true, children: [
            { label: "Data Engineer" },
            { label: "BI Analyst" },
          ]},
          { label: "No Department", group: true, children: [
            { label: "Contract Developer" },
          ]},
          { label: "Product", group: true, children: [
            { label: "Sr. Product Manager" },
          ]},
        ],
      },
      {
        id: "types",
        label: "Investment Types",
        desc: "Target allocation across run-the-business, change, and growth bets.",
        enabled: true,
        fields: [
          { label: "Run", desc: "% of total investment — keep the lights on", type: "weight" },
          { label: "Change", desc: "% of total investment — improve existing capabilities", type: "weight" },
          { label: "Grow", desc: "% of total investment — new bets & innovation", type: "weight" },
        ],
      },
    ],
  },
  {
    id: "guardrails",
    label: "Guardrails",
    icon: ShieldCheck,
    description: "Boundaries that protect the portfolio during planning and execution.",
    subsections: [
      {
        id: "planning",
        label: "Planning Guardrails",
        fields: [
          { label: "Budget Variance", desc: "Allowed deviation from approved envelope, by budget type", group: true, severity: "Warn", enabled: true, children: [
            { label: "CapEx", type: "range", unit: "%", min: -10, max: 5 },
            { label: "OpEx", type: "range", unit: "%", min: -8, max: 0 },
          ]},
          { label: "Investment Mix Variance", desc: "Allowed deviation from target share of investment mix, by category", group: true, severity: "Warn", enabled: true, children: [
            { label: "Run", type: "range", unit: "%", min: -15, max: 0 },
            { label: "Grow", type: "range", unit: "%", min: -5, max: 5 },
            { label: "Transform", type: "range", unit: "%", min: -5, max: 10 },
          ]},
          { label: "Capacity Buffer", desc: "Share of FTE unplanned to absorb unscheduled work", severity: "Block", enabled: true, value: "15%" },
        ],
      },
      {
        id: "execution",
        label: "Execution Guardrails",
        fields: [
          { label: "Schedule Drift", desc: "Slip between planned and actual end date before flagging", severity: "Warn", enabled: true, value: "10%" },
          { label: "Target Utilization", desc: "Booked utilization on an initiative before flagging", severity: "Warn", enabled: true, value: "105%" },
          { label: "Budget Drift", desc: "How far spend may run ahead of schedule progress", severity: "Block", enabled: true, value: "15%" },
        ],
      },
    ],
  },
  {
    id: "scoring",
    label: "Scoring Model",
    icon: Sliders,
    description: "Each request is scored 1–3 on every criterion, then weighted to produce a single ranking score. Weights must sum to 100%.",
    fields: [
      { label: "Strategic Alignment", desc: "How directly the project advances an active portfolio goal or key result.", type: "weight" },
      { label: "Financial Value / ROI", desc: "Expected financial return relative to investment and payback horizon.", type: "weight" },
      { label: "Demand & Evidence", desc: "Strength of validated demand signals supporting the request.", type: "weight" },
      { label: "Time-criticality", desc: "Urgency of the window — whether the project can wait or blocks other funded work.", type: "weight" },
    ],
  },
];


function fwCountFields(section: FwSection): { enabled: number; total: number } {
  const all = section.fields ?? section.subsections?.flatMap((s) => s.fields) ?? [];
  return { enabled: all.filter((f) => f.enabled).length, total: all.length };
}

function StrategicFrameworkRow({
  field,
  onToggle,
  onValueChange,
}: {
  field: FwField;
  onToggle: () => void;
  onValueChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const isSplit = field.type === "split";

  const Header = (
    <div className="flex items-center gap-3 min-w-0 flex-1">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={field.enabled}
        className={`relative w-9 h-5 rounded-full flex-shrink-0 transition-colors cursor-pointer ${
          field.enabled ? "bg-primary" : "bg-muted hover:bg-muted-foreground/30"
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
            field.enabled ? "left-[18px]" : "left-0.5"
          }`}
        />
      </button>
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-foreground">{field.label}</div>
        {field.desc && <div className="text-[11px] text-muted-foreground">{field.desc}</div>}
      </div>
    </div>
  );

  // Split editor (e.g., Run / Grow / Transform): three numeric inputs that always show their sum.
  if (isSplit) {
    const parsed = parseSplit(field.value);
    return (
      <div
        className={`px-3 py-2.5 rounded-lg border transition-colors ${
          field.enabled ? "border-border bg-background" : "border-border/50 bg-muted/20 opacity-70"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          {Header}
          {!field.enabled && <span className="text-muted-foreground/50 text-sm flex-shrink-0">—</span>}
        </div>
        {field.enabled && (
          <div className="mt-3 pl-12">
            <SplitAllocationEditor
              value={parsed}
              onChange={(next) => onValueChange(serializeSplit(next))}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
        field.enabled ? "border-border bg-background" : "border-border/50 bg-muted/20 opacity-70"
      }`}
    >
      {Header}
      <div className="flex-shrink-0 flex items-center gap-2">
        {editing ? (
          <ParamValueEditor
            value={field.value || ""}
            label={field.label}
            onSave={(v) => { onValueChange(v); setEditing(false); }}
            onCancel={() => setEditing(false)}
          />
        ) : field.enabled && field.value ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center px-3 py-1 rounded-md border border-border bg-background text-xs font-semibold text-foreground hover:bg-accent hover:border-primary/40 transition-colors cursor-pointer"
          >
            {field.value}
          </button>
        ) : field.enabled ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-primary hover:underline"
          >
            Set value
          </button>
        ) : (
          <span className="text-muted-foreground/50 text-sm">—</span>
        )}
        {field.severity && <SeverityBadge value={field.severity} />}
      </div>
    </div>
  );
}

function SeverityBadge({ value, onChange }: { value: "Warn" | "Block"; onChange?: (v: "Warn" | "Block") => void }) {
  const styles = value === "Warn"
    ? "bg-amber-100 text-amber-900 border-amber-200"
    : "bg-rose-100 text-rose-900 border-rose-200";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${styles}`}>
          {value} <ChevronDown className="w-3 h-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(["Warn", "Block"] as const).map((opt) => (
          <DropdownMenuItem key={opt} onClick={() => onChange?.(opt)}>{opt}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UnitSelect({ value, onChange }: { value: "%" | "$"; onChange: (v: "%" | "$") => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted">
          {value} <ChevronDown className="w-3 h-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {(["%", "$"] as const).map((opt) => (
          <DropdownMenuItem key={opt} onClick={() => onChange(opt)}>{opt}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RangeInput({ unit, value, onChange, onUnitChange }: {
  unit: "%" | "$"; value: number | string | undefined;
  onChange: (v: number) => void; onUnitChange: (u: "%" | "$") => void;
}) {
  return (
    <div className="relative flex items-center w-[140px] h-9 rounded-md border border-border bg-background">
      <div className="pl-1.5 pr-1 border-r border-border/60"><UnitSelect value={unit} onChange={onUnitChange} /></div>
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 min-w-0 bg-transparent text-right pr-2 text-[13px] outline-none"
      />
    </div>
  );
}

function GroupOrRangeRow({ field, onChange }: { field: FwField; onChange?: (patch: Partial<FwField>) => void }) {
  // Pure department-style group (FTE) — keep prior behavior.
  const isDept = field.group && field.children && field.children.every((c) => c.type !== "range");
  if (isDept) {
    const subtotal = field.value ?? (field.children
      ? field.children.reduce((sum, c) => sum + (Number(c.value) || 0), 0).toString()
      : "");
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground">{field.label}</span>
            <span className="text-[10px] text-muted-foreground/80">derived subtotal</span>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-md border border-border bg-background text-xs font-semibold text-foreground">
            {subtotal}
          </span>
        </div>
        {field.children && (
          <div className="space-y-1.5 pl-5 border-l border-border/60 ml-2">
            {field.children.map((c, i) => (
              <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-border bg-background">
                <div className="text-[13px] text-foreground">{c.label}</div>
                <span className="inline-flex items-center px-3 py-1 rounded-md border border-border bg-muted/30 text-xs font-semibold text-foreground min-w-[60px] justify-end">
                  {c.value ?? "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  // Guardrail group with range children.
  return (
    <div className="space-y-2">
      <div className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border ${field.enabled ? "border-primary/20 bg-primary/5" : "border-border/50 bg-muted/20 opacity-70"}`}>
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => onChange?.({ enabled: !field.enabled })}
            className={`relative w-9 h-5 rounded-full flex-shrink-0 transition-colors ${field.enabled ? "bg-primary" : "bg-muted hover:bg-muted-foreground/30"}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${field.enabled ? "left-[18px]" : "left-0.5"}`} />
          </button>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-foreground">{field.label}</div>
            {field.desc && <div className="text-[11px] text-muted-foreground">{field.desc}</div>}
          </div>
        </div>
        {field.severity && (
          <SeverityBadge value={field.severity} onChange={(v) => onChange?.({ severity: v })} />
        )}
      </div>
      {field.enabled && field.children && (
        <div className="space-y-1.5">
          {field.children.map((c, i) => {
            const unit = (c.unit ?? "%") as "%" | "$";
            const patchChild = (p: Partial<FwField>) => {
              if (!field.children) return;
              const next = field.children.map((cc, ix) => (ix === i ? { ...cc, ...p } : cc));
              onChange?.({ children: next });
            };
            return (
              <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-border bg-background">
                <div className="text-[13px] text-foreground">{c.label}</div>
                <div className="flex items-center gap-2">
                  <RangeInput unit={unit} value={c.min}
                    onChange={(v) => patchChild({ min: v })}
                    onUnitChange={(u) => patchChild({ unit: u })} />
                  <span className="text-muted-foreground text-xs">–</span>
                  <RangeInput unit={unit} value={c.max}
                    onChange={(v) => patchChild({ max: v })}
                    onUnitChange={(u) => patchChild({ unit: u })} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Back-compat alias
const DepartmentGroupRow = ({ field }: { field: FwField }) => <GroupOrRangeRow field={field} />;

const ERP_SYSTEMS = [
  { name: "SAP S/4HANA", desc: "Enterprise resource planning", domain: "sap.com" },
  { name: "Oracle NetSuite", desc: "Cloud financials & ERP", domain: "netsuite.com" },
  { name: "Workday Financials", desc: "Finance, HR & planning", domain: "workday.com" },
  { name: "Microsoft Dynamics 365", desc: "Finance & operations", domain: "microsoft.com" },
  { name: "Sage Intacct", desc: "Cloud accounting & ERP", domain: "sage.com" },
  { name: "Infor CloudSuite", desc: "Industry cloud ERP", domain: "infor.com" },
  { name: "Acumatica", desc: "Cloud business management", domain: "acumatica.com" },
  { name: "QuickBooks Enterprise", desc: "SMB finance & accounting", domain: "quickbooks.intuit.com" },
];

const HRIS_SYSTEMS = [
  { name: "Workday HCM", desc: "Human capital management", domain: "workday.com" },
  { name: "BambooHR", desc: "HR for growing companies", domain: "bamboohr.com" },
  { name: "ADP Workforce Now", desc: "Payroll & HR suite", domain: "adp.com" },
  { name: "UKG Pro", desc: "HCM & workforce management", domain: "ukg.com" },
  { name: "SAP SuccessFactors", desc: "Cloud HXM suite", domain: "sap.com" },
  { name: "Oracle HCM Cloud", desc: "Enterprise HCM", domain: "oracle.com" },
  { name: "Rippling", desc: "HR, IT & finance platform", domain: "rippling.com" },
  { name: "Gusto", desc: "Payroll, benefits & HR", domain: "gusto.com" },
];

function ConnectSystemModal({
  open, onOpenChange, kind, onSelect,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  kind: "erp" | "hris";
  onSelect: (s: { name: string; domain: string }) => void;
}) {
  const systems = kind === "erp" ? ERP_SYSTEMS : HRIS_SYSTEMS;
  const title = kind === "erp" ? "Connect an ERP system" : "Connect an HRIS";
  const desc = kind === "erp"
    ? "Pull live budget actuals into Arc. Pick the system your finance team uses."
    : "Pull live headcount and job profiles into Arc. Pick the system your people team uses.";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 pt-2">
          {systems.map((s) => (
            <button
              key={s.name}
              onClick={() => onSelect({ name: s.name, domain: s.domain })}
              className="flex items-center gap-3 p-3 rounded-lg text-left transition-colors hover:bg-accent border border-border"
            >
              <span className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 bg-background overflow-hidden border border-border">
                <img
                  src={`https://www.google.com/s2/favicons?sz=128&domain=${s.domain}`}
                  alt=""
                  className="w-6 h-6 object-contain"
                  onError={(ev) => { (ev.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-medium truncate text-foreground">{s.name}</span>
                <span className="block text-[11.5px] truncate text-muted-foreground">{s.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SubsectionToolbar({ toolbar, onChange }: { toolbar: FwToolbar; onChange?: (id: string, value: string) => void }) {
  const [erpOpen, setErpOpen] = React.useState(false);
  const [hrisOpen, setHrisOpen] = React.useState(false);
  const [connectedErp, setConnectedErp] = React.useState<{ name: string; domain: string } | null>(null);
  const [connectedHris, setConnectedHris] = React.useState<{ name: string; domain: string } | null>(null);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {toolbar.controls.map((c) => {
        if (c.kind === "select") {
          return (
            <DropdownMenu key={c.id}>
              <DropdownMenuTrigger asChild>
                <button type="button" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-background text-[12px] text-foreground hover:bg-accent">
                  {c.value} <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {c.options.map((opt) => (
                  <DropdownMenuItem key={opt} onClick={() => onChange?.(c.id, opt)}>{opt}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
        const isErp = c.id === "erp";
        const isHris = c.id === "hris";
        const connected = isErp ? connectedErp : isHris ? connectedHris : null;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              if (isErp) setErpOpen(true);
              else if (isHris) setHrisOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-background text-[12px] text-foreground hover:bg-accent"
          >
            {connected ? (
              <>
                <img
                  src={`https://www.google.com/s2/favicons?sz=64&domain=${connected.domain}`}
                  alt=""
                  className="w-3.5 h-3.5 object-contain"
                />
                {connected.name}
              </>
            ) : (
              <>
                {c.icon === "plug" ? <Plug className="w-3 h-3 text-muted-foreground" /> : <Zap className="w-3.5 h-3.5 text-muted-foreground" />}
                {c.label}
              </>
            )}
          </button>
        );
      })}
      <ConnectSystemModal open={erpOpen} onOpenChange={setErpOpen} kind="erp" onSelect={(s) => { setConnectedErp(s); setErpOpen(false); }} />
      <ConnectSystemModal open={hrisOpen} onOpenChange={setHrisOpen} kind="hris" onSelect={(s) => { setConnectedHris(s); setHrisOpen(false); }} />
    </div>
  );
}



// Parse "Run 50% / Grow 30% / Transform 20%" → {run, grow, transform}
function parseSplit(v?: string): { run: number; grow: number; transform: number } {
  const fallback = { run: 50, grow: 30, transform: 20 };
  if (!v) return fallback;
  const nums = (v.match(/\d+/g) || []).map(Number);
  if (nums.length < 3) return fallback;
  return { run: nums[0], grow: nums[1], transform: nums[2] };
}
function serializeSplit(s: { run: number; grow: number; transform: number }) {
  return `Run ${s.run}% / Change ${s.grow}% / Grow ${s.transform}%`;
}


function SplitAllocationEditor({
  value,
  onChange,
}: {
  value: { run: number; grow: number; transform: number };
  onChange: (next: { run: number; grow: number; transform: number }) => void;
}) {
  const total = value.run + value.grow + value.transform;
  const ok = total === 100;
  const segments: { key: "run" | "grow" | "transform"; label: string; hint: string; color: string }[] = [
    { key: "run", label: "Run", hint: "Keep the lights on", color: "bg-muted-foreground/40" },
    { key: "grow", label: "Change", hint: "Improve existing capabilities", color: "bg-primary/60" },
    { key: "transform", label: "Grow", hint: "New bets & innovation", color: "bg-primary" },
  ];

  return (
    <div className="space-y-2.5">
      {/* Stacked bar preview */}
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
        {segments.map((s) => (
          <div
            key={s.key}
            className={`${s.color} transition-all`}
            style={{ width: `${Math.max(0, Math.min(100, value[s.key]))}%` }}
            title={`${s.label} ${value[s.key]}%`}
          />
        ))}
      </div>
      {/* Three inputs */}
      <div className="grid grid-cols-3 gap-2">
        {segments.map((s) => (
          <label key={s.key} className="block">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`w-2 h-2 rounded-full ${s.color}`} />
              <span className="text-[11px] font-medium text-foreground">{s.label}</span>
            </div>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={100}
                value={value[s.key]}
                onChange={(e) => {
                  const n = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                  onChange({ ...value, [s.key]: n });
                }}
                className="w-full h-8 pl-2 pr-7 rounded-md border border-border bg-muted/40 text-[13px] text-foreground outline-none focus:border-primary/60"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">%</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{s.hint}</div>
          </label>
        ))}
      </div>
      {/* Sum indicator */}
      <div className="flex items-center justify-between text-[11px]">
        <span className={ok ? "text-muted-foreground" : "text-destructive"}>
          Total: <span className="font-semibold text-foreground">{total}%</span>
          {!ok && <span className="ml-1">— must equal 100%</span>}
        </span>
        <button
          type="button"
          onClick={() => onChange({ run: 50, grow: 30, transform: 20 })}
          className="text-primary hover:underline"
        >
          Reset to default
        </button>
      </div>
    </div>
  );
}

// ---- Goals tab — proper "list of goals" with inline cards & add action ----
type KeyResult = {
  id: string;
  label: string;
  name: string;
  metric: string;
  target: string;
  owner: string;
  targetDate: string;
  businessImpact: string;
};

type Goal = {
  id: string;
  name: string;
  description: string;
  owner: string;
  fiscalYear: string;
  startFY?: string;
  endFY?: string;
  weightPct?: number;
  active: boolean;
  exemptCategories: string;
  keyResults?: KeyResult[];
};

const EMPTY_GOAL = (): Goal => ({
  id: Math.random().toString(36).slice(2, 9),
  name: "",
  description: "",
  owner: "",
  fiscalYear: "FY27",
  startFY: "FY27",
  endFY: "FY27",
  weightPct: 25,
  active: true,
  exemptCategories: "",
  keyResults: [],
});

const EMPTY_KR = (goalIdx: number, krIdx: number): KeyResult => ({
  id: Math.random().toString(36).slice(2, 9),
  label: `KR ${goalIdx + 1}.${krIdx + 1}`,
  name: "",
  metric: "",
  target: "",
  owner: "",
  targetDate: "FY27",
  businessImpact: "",
});

function GoalsTab({
  goals,
  onChange,
  recommendations = [],
  onAcceptRecommendation,
  onDismissRecommendation,
}: {
  goals: Goal[];
  onChange: (next: Goal[]) => void;
  recommendations?: any[];
  onAcceptRecommendation?: (rec: any) => void;
  onDismissRecommendation?: (rec: any) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const update = (id: string, patch: Partial<Goal>) => {
    onChange(goals.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  };
  const remove = (id: string) => onChange(goals.filter((g) => g.id !== id));
  const add = () => {
    const g = EMPTY_GOAL();
    onChange([...goals, g]);
    setExpandedId(g.id);
  };
  const addKR = (goalId: string) => {
    const goalIdx = goals.findIndex((g) => g.id === goalId);
    if (goalIdx < 0) return;
    const goal = goals[goalIdx];
    const krs = goal.keyResults ?? [];
    const newKR = EMPTY_KR(goalIdx, krs.length);
    update(goalId, { keyResults: [...krs, newKR] });
  };
  const updateKR = (goalId: string, krId: string, patch: Partial<KeyResult>) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const next = (goal.keyResults ?? []).map((k) => (k.id === krId ? { ...k, ...patch } : k));
    update(goalId, { keyResults: next });
  };
  const removeKR = (goalId: string, krId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    update(goalId, { keyResults: (goal.keyResults ?? []).filter((k) => k.id !== krId) });
  };


  if (goals.length === 0) {
    return (
      <div className="pt-2">
        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
          <div className="mx-auto w-10 h-10 icon-tile bg-primary/10 text-primary flex items-center justify-center mb-3">
            <Target className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div className="text-[14px] font-semibold text-foreground">No goals yet</div>
          <p className="text-[12px] text-muted-foreground mt-1 max-w-sm mx-auto">
            Add the outcomes your organization is optimizing for this planning cycle. Each goal anchors prioritization downstream.
          </p>
          <button
            type="button"
            onClick={add}
            className="mt-4 inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" /> Add goal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-2 space-y-2">
      {goals.map((g, idx) => {
        const isOpen = expandedId === g.id;
        return (
          <div key={g.id} className="rounded-lg border border-border bg-background overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedId(isOpen ? null : g.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/30 transition-colors"
            >
              <div className="w-6 h-6 icon-tile bg-primary text-primary-foreground flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
                G{idx + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-foreground truncate">
                  {g.name || <span className="text-muted-foreground/60 italic">Untitled goal</span>}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {[g.owner, g.fiscalYear, g.active ? "Active" : "Inactive"].filter(Boolean).join(" · ")}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
              <div className="px-10 py-4 border-t border-border/60 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">Goal name</label>
                    <input
                      value={g.name}
                      onChange={(e) => update(g.id, { name: e.target.value })}
                      placeholder="e.g. Improve patient safety outcomes"
                      className="w-full h-8 px-2.5 rounded-md border border-border bg-muted/40 text-[13px] focus:outline-none focus:border-primary/60"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">Description</label>
                    <textarea
                      value={g.description}
                      onChange={(e) => update(g.id, { description: e.target.value })}
                      placeholder="What this goal is optimizing for"
                      rows={2}
                      className="w-full px-2.5 py-1.5 rounded-md border border-border bg-muted/40 text-[13px] focus:outline-none focus:border-primary/60 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">Goal owner</label>
                    <div className="relative">
                      {g.owner && (
                        <img
                          src={avatarForName(g.owner)}
                          alt=""
                          className="absolute left-1.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full object-cover ring-1 ring-border"
                        />
                      )}
                      <input
                        value={g.owner}
                        onChange={(e) => update(g.id, { owner: e.target.value })}
                        placeholder="C-Suite sponsor"
                        className={`w-full h-8 ${g.owner ? "pl-8" : "pl-2.5"} pr-2.5 rounded-md border border-border bg-muted/40 text-[13px] focus:outline-none focus:border-primary/60`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">Horizon</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        value={g.startFY ?? g.fiscalYear}
                        onChange={(e) => update(g.id, { startFY: e.target.value })}
                        placeholder="FY27"
                        className="w-full h-8 px-2.5 rounded-md border border-border bg-muted/40 text-[13px] focus:outline-none focus:border-primary/60"
                      />
                      <span className="text-muted-foreground text-[12px]">→</span>
                      <input
                        value={g.endFY ?? g.fiscalYear}
                        onChange={(e) => update(g.id, { endFY: e.target.value })}
                        placeholder="FY29"
                        className="w-full h-8 px-2.5 rounded-md border border-border bg-muted/40 text-[13px] focus:outline-none focus:border-primary/60"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">Goal weight</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={g.weightPct ?? 0}
                        onChange={(e) => update(g.id, { weightPct: Number(e.target.value) })}
                        className="w-full h-8 pl-2.5 pr-7 rounded-md border border-border bg-muted/40 text-[13px] focus:outline-none focus:border-primary/60"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground">%</span>
                    </div>
                  </div>
                </div>

                {/* Key Results */}
                <div className="pt-3 mt-1 border-t border-border/60">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-semibold text-foreground">Key Results</span>
                      <span className="text-[11px] text-muted-foreground">{(g.keyResults ?? []).length}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => addKR(g.id)}
                      className="inline-flex items-center gap-1 text-[11.5px] font-medium text-primary hover:underline"
                    >
                      <Plus className="w-3 h-3" /> Add key result
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(g.keyResults ?? []).map((kr, krIdx) => (
                      <div key={kr.id} className="rounded-md border border-border bg-background overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-2 bg-primary/[0.05] border-b border-border">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/15 text-primary">
                            KR {idx + 1}.{krIdx + 1}
                          </span>
                          <input
                            value={kr.name}
                            onChange={(e) => updateKR(g.id, kr.id, { name: e.target.value })}
                            placeholder="Key result name"
                            className="flex-1 bg-transparent outline-none text-[13px] font-semibold min-w-0"
                          />
                          <button
                            type="button"
                            onClick={() => removeKR(g.id, kr.id)}
                            className="text-[11px] text-muted-foreground hover:text-destructive shrink-0"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5 p-3">
                          <div>
                            <label className="text-[11px] font-medium text-muted-foreground block mb-1">Metric</label>
                            <input
                              value={kr.metric}
                              onChange={(e) => updateKR(g.id, kr.id, { metric: e.target.value })}
                              className="w-full h-8 px-2.5 rounded-md border border-border bg-muted/40 text-[12.5px] focus:outline-none focus:border-primary/60"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-medium text-muted-foreground block mb-1">Target</label>
                            <input
                              value={kr.target}
                              onChange={(e) => updateKR(g.id, kr.id, { target: e.target.value })}
                              className="w-full h-8 px-2.5 rounded-md border border-border bg-muted/40 text-[12.5px] focus:outline-none focus:border-primary/60"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-medium text-muted-foreground block mb-1">Owner</label>
                            <div className="relative">
                              {kr.owner && (
                                <img
                                  src={avatarForName(kr.owner)}
                                  alt=""
                                  className="absolute left-1.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full object-cover ring-1 ring-border"
                                />
                              )}
                              <input
                                value={kr.owner}
                                onChange={(e) => updateKR(g.id, kr.id, { owner: e.target.value })}
                                placeholder="Owner"
                                className={`w-full h-8 ${kr.owner ? "pl-8" : "pl-2.5"} pr-2.5 rounded-md border border-border bg-muted/40 text-[12.5px] focus:outline-none focus:border-primary/60`}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[11px] font-medium text-muted-foreground block mb-1">Target date</label>
                            <input
                              value={kr.targetDate}
                              onChange={(e) => updateKR(g.id, kr.id, { targetDate: e.target.value })}
                              placeholder="FY27"
                              className="w-full h-8 px-2.5 rounded-md border border-border bg-muted/40 text-[12.5px] focus:outline-none focus:border-primary/60"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="text-[11px] font-medium text-muted-foreground block mb-1">Business impact</label>
                            <input
                              value={kr.businessImpact}
                              onChange={(e) => updateKR(g.id, kr.id, { businessImpact: e.target.value })}
                              placeholder="e.g. $28M captured net revenue (Y1)"
                              className="w-full h-8 px-2.5 rounded-md border border-border bg-muted/40 text-[12.5px] focus:outline-none focus:border-primary/60"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => update(g.id, { active: !g.active })}
                      aria-pressed={g.active}
                      className={`relative w-9 h-5 rounded-full transition-colors ${g.active ? "bg-primary" : "bg-muted"}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${g.active ? "left-[18px]" : "left-0.5"}`} />
                    </button>
                    <span className="text-[12px] text-foreground">{g.active ? "Active this cycle" : "Inactive"}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => remove(g.id)}
                    className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Remove goal
                  </button>
                </div>
              </div>
            )}

          </div>
        );
      })}
      <button
        type="button"
        onClick={add}
        className="w-full flex items-center justify-center gap-1.5 h-9 rounded-lg border border-dashed border-border text-[12px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted/20 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Add goal
      </button>

      {recommendations.length > 0 && (
        <div className="pt-6 mt-2 border-t border-border/60">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-primary" strokeWidth={1.75} />
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
              AI Recommendations
            </h3>
            <span className="text-[10.5px] text-muted-foreground/70">
              {recommendations.length} additional {recommendations.length === 1 ? "goal" : "goals"}
            </span>
          </div>
          <div className="space-y-2">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="rounded-lg border border-primary/20 bg-primary/[0.04] p-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <img src={arcAgentOrb} alt="Arc agent" className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium text-foreground">{rec.name}</div>
                    {rec.owner && (
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Suggested owner · {rec.owner}
                      </div>
                    )}
                    {rec.rationale && (
                      <p className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed">
                        {rec.rationale}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => onAcceptRecommendation?.(rec)}
                        className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-primary text-primary-foreground text-[11.5px] font-medium hover:opacity-90 transition-opacity"
                      >
                        <Plus className="w-3 h-3" /> Add as goal
                      </button>
                      <button
                        type="button"
                        onClick={() => onDismissRecommendation?.(rec)}
                        className="h-7 px-2.5 rounded-md text-[11.5px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StrategicFrameworkPanel({ artifact, hideAgentCallout = false }: { artifact: any; hideAgentCallout?: boolean }) {
  const draftKey = "strategic_framework";
  const draft = useArtifactDraft(draftKey);
  const [frameworkCalloutDismissed, setFrameworkCalloutDismissed] = useState(false);

  const [goals, setGoalsState] = useState<Goal[]>(() =>
    Array.isArray(artifact.goals) ? artifact.goals : []
  );
  const [goalRecs, setGoalRecsState] = useState<any[]>(() =>
    Array.isArray(artifact.goalRecommendations) ? artifact.goalRecommendations : []
  );
  const [sections, setSectionsState] = useState<FwSection[]>(() =>
    (artifact.sections && Array.isArray(artifact.sections) ? artifact.sections : STRATEGIC_FRAMEWORK_SECTIONS).map((s: FwSection) => ({
      ...s,
      fields: s.fields?.map((f) => ({ ...f })),
      subsections: s.subsections?.map((ss) => ({ ...ss, fields: ss.fields.map((f) => ({ ...f })) })),
    }))
  );
  const [activeId, setActiveId] = useState<string>(sections[0]?.id || "goals");
  useChangeEffect([sections, goals, goalRecs], () => dispatchArtifactSaved(artifact?.title));

  // Wrap each setter so any user edit flips draft state to dirty.
  const setGoals: typeof setGoalsState = (v) => { markArtifactDirty(draftKey); setGoalsState(v); };
  const setGoalRecs: typeof setGoalRecsState = (v) => { markArtifactDirty(draftKey); setGoalRecsState(v); };
  const setSections: typeof setSectionsState = (v) => { markArtifactDirty(draftKey); setSectionsState(v); };

  const acceptRec = (rec: any) => {
    setGoals((prev) => [
      ...prev,
      {
        id: rec.id || Math.random().toString(36).slice(2, 9),
        name: rec.name || "",
        description: rec.rationale || "",
        owner: rec.owner || "",
        fiscalYear: "FY27",
        active: true,
        exemptCategories: "",
      },
    ]);
    setGoalRecs((prev) => prev.filter((r) => r.id !== rec.id));
  };
  const dismissRec = (rec: any) => {
    setGoalRecs((prev) => prev.filter((r) => r.id !== rec.id));
  };

  const updateField = (sectionId: string, subId: string | null, idx: number, patch: Partial<FwField>) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        if (subId == null && s.fields) {
          return { ...s, fields: s.fields.map((f, i) => (i === idx ? { ...f, ...patch } : f)) };
        }
        if (s.subsections) {
          return {
            ...s,
            subsections: s.subsections.map((ss) =>
              ss.id === subId ? { ...ss, fields: ss.fields.map((f, i) => (i === idx ? { ...f, ...patch } : f)) } : ss
            ),
          };
        }
        return s;
      })
    );
  };

  // Goals are managed as a real list, not toggle rows.
  const configSections = sections.filter((s) => s.id !== "goals");
  const configTotals = configSections.reduce(
    (acc, s) => {
      const c = fwCountFields(s);
      return { enabled: acc.enabled + c.enabled, total: acc.total + c.total };
    },
    { enabled: 0, total: 0 }
  );
  const totals = {
    enabled: configTotals.enabled + goals.length,
    total: configTotals.total + goals.length,
  };

  type Tab = { id: string; label: string; icon: any; count: string };
  const tabs: Tab[] = [
    { id: "goals", label: "Goals", icon: Target, count: String(goals.length) },
    ...configSections.map((s) => {
      const c = fwCountFields(s);
      return { id: s.id, label: s.label, icon: s.icon, count: `${c.enabled}/${c.total}` };
    }),
  ];
  const activeSection = configSections.find((s) => s.id === activeId);

  const handleSave = () => {
    saveArtifactDraft(draftKey);
    toast.success("Strategic Framework saved to Smartsheet");
  };

  return (
    <div>
      {/* Arc Agent callout — sits above the framework card on the canvas */}
      {!frameworkCalloutDismissed && !artifact.hideAgentCallout && !hideAgentCallout && (
        <div
          className="relative mb-4 rounded-xl border p-4 shadow-[var(--shadow-card)]"
          style={{
            background:
              "linear-gradient(135deg, hsl(212 80% 92%) 0%, hsl(212 70% 96%) 60%, hsl(214 60% 98%) 100%)",
            borderColor: "hsl(212 65% 84%)",
          }}
        >
          <button
            type="button"
            onClick={() => setFrameworkCalloutDismissed(true)}
            aria-label="Dismiss"
            className="absolute top-2.5 right-2.5 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="mb-2">
            <img src={arcAgentChip} alt="Arc agent" className="w-auto" style={{ height: 22 }} />
          </div>
          <p className="text-[13.5px] font-bold text-foreground leading-snug">I've drafted a Strategic Framework from your uploaded documents.</p>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Goals, envelopes, guardrails, and scoring are pre-filled from your themes, OKRs, and investment parameters. Arc will continue to search, update, and orchestrate changes to the system to help you meet your corporate goals.</p>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border p-6 shadow-[var(--shadow-card)] space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Strategic Framework</h2>
          <p className="text-[12.5px] text-muted-foreground mt-1">
            Goals, envelopes, guardrails, and scoring — everything Arc uses to plan the cycle.
          </p>
        </div>
        <DraftStatusChip status={draft.status} dirty={draft.dirty} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded-full border-2 border-primary/40 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-primary" />
          </div>
          <span className="text-foreground">
            <span className="font-semibold">{totals.enabled} of {totals.total}</span>{" "}
            <span className="text-muted-foreground">framework items configured</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">FY27 · {draft.status === "saved" && !draft.dirty ? "saved" : "draft"}</span>
        </div>
      </div>

      {/* Top tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map((t) => {
            const TabIcon = t.icon;
            const isActive = activeId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className={`group flex items-center gap-2 px-4 py-2.5 border-b-2 text-[12.5px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>{t.label}</span>
                <span className={`text-[10px] font-normal ${isActive ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active tab content */}
      <div className="min-w-0">
        {activeId === "goals" && (
          <GoalsTab
            goals={goals}
            onChange={setGoals}
            recommendations={goalRecs}
            onAcceptRecommendation={acceptRec}
            onDismissRecommendation={dismissRec}
          />
        )}
        {activeSection && (() => {
          const s = activeSection;
          return (
            <section key={s.id} id={`fw-section-${s.id}`} className="pt-2">
              {s.description && (
                <p className="text-[12px] text-muted-foreground mb-4">{s.description}</p>
              )}

              {s.fields && (
                <div className="space-y-2">
                  {s.fields.map((f, i) => (
                    <StrategicFrameworkRow
                      key={i}
                      field={f}
                      onToggle={() => updateField(s.id, null, i, { enabled: !f.enabled })}
                      onValueChange={(v) => updateField(s.id, null, i, { value: v, enabled: true })}
                    />
                  ))}
                </div>
              )}

              {s.subsections && (
                <div className="space-y-4">
                  {s.subsections.map((ss) => (
                    <SubsectionBlock
                      key={ss.id}
                      sectionId={s.id}
                      ss={ss}
                      onToggleEnabled={() =>
                        setSections((prev) => prev.map((sec) => sec.id !== s.id ? sec : {
                          ...sec,
                          subsections: sec.subsections?.map((x) => x.id === ss.id ? { ...x, enabled: !(x.enabled ?? true) } : x),
                        }))
                      }
                      updateField={updateField}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })()}
      </div>

      </div>
    </div>
  );
}

const CURRENCY_SYMBOLS: Record<string, string> = { "$ USD": "$", "€ EUR": "€", "£ GBP": "£" };
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function periodsFor(cadence: string, fy: string): string[] {
  if (cadence === "Quarterly") return ["Q1", "Q2", "Q3", "Q4"].map((q) => `${q} ${fy}`);
  if (cadence === "Monthly") return MONTHS_SHORT.map((m) => `${m} ${fy.replace(/^FY/, "'")}`);
  return [fy];
}

function parseAmount(v?: string): { num: number; suffix: string; isMoney: boolean } | null {
  if (!v) return null;
  const isMoney = /^[\$€£]/.test(v);
  const m = v.match(/-?\d+(?:\.\d+)?/);
  if (!m) return null;
  const suffix = (v.match(/[A-Za-z%]+$/) || [""])[0];
  return { num: parseFloat(m[0]), suffix, isMoney };
}

function formatAmount(symbol: string, num: number, suffix: string) {
  const r = Math.round(num * 10) / 10;
  const str = Number.isInteger(r) ? r.toString() : r.toFixed(1);
  return `${symbol}${str}${suffix}`;
}

function SubsectionBlock({
  sectionId,
  ss,
  onToggleEnabled,
  updateField,
}: {
  sectionId: string;
  ss: FwSubsection;
  onToggleEnabled: () => void;
  updateField: (sid: string, ssid: string | null, idx: number, patch: Partial<FwField>) => void;
}) {
  const enabled = ss.enabled ?? true;
  const [tbState, setTbState] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    ss.toolbar?.controls.forEach((c) => { if (c.kind === "select") map[c.id] = c.value; });
    return map;
  });
  const cadence = tbState.cadence ?? "Yearly";
  const fy = tbState.fy ?? "FY27";
  const currency = tbState.currency ?? "$ USD";
  const symbol = CURRENCY_SYMBOLS[currency] ?? "$";
  const periods = ss.toolbar ? periodsFor(cadence, fy) : [];

  const liveToolbar: FwToolbar | undefined = ss.toolbar
    ? { controls: ss.toolbar.controls.map((c) => c.kind === "select" ? { ...c, value: tbState[c.id] ?? c.value } : c) }
    : undefined;

  const renderPeriodValue = (field: FwField, i: number): string => {
    const parsed = parseAmount(field.value);
    if (!parsed) return field.value || "—";
    const per = parsed.num / Math.max(1, periods.length);
    const sym = parsed.isMoney ? symbol : "";
    return formatAmount(sym, per, parsed.suffix);
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className={`flex items-start justify-between gap-3 px-4 py-3 ${enabled ? "bg-primary/5" : "bg-muted/30"}`}>
        <div className="flex items-start gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleEnabled}
            className={`relative w-9 h-5 rounded-full flex-shrink-0 mt-0.5 transition-colors ${enabled ? "bg-primary" : "bg-muted hover:bg-muted-foreground/30"}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${enabled ? "left-[18px]" : "left-0.5"}`} />
          </button>
          <div className="min-w-0">
            <div className="text-[14px] font-semibold text-foreground">{ss.label}</div>
            {ss.desc && <div className="text-[12px] text-muted-foreground">{ss.desc}</div>}
          </div>
        </div>
        {liveToolbar && (
          <SubsectionToolbar
            toolbar={liveToolbar}
            onChange={(id, v) => setTbState((prev) => ({ ...prev, [id]: v }))}
          />
        )}
      </div>
      {enabled && (
        <div className="p-3 space-y-2">
          {ss.fields.map((f, i) => {
            if (f.group) {
              return (
                <GroupOrRangeRow
                  key={i}
                  field={f}
                  onChange={(patch) => updateField(sectionId, ss.id, i, patch)}
                />
              );
            }
            // If subsection has a period toolbar AND the field is a plain numeric value (not weight/split/range),
            // render period chips that respond to cadence / FY / currency.
            const isPlain = !f.type || f.type === "value";
            if (liveToolbar && isPlain && f.value) {
              return (
                <PeriodValueRow
                  key={i}
                  field={f}
                  periods={periods}
                  renderValue={(idx) => renderPeriodValue(f, idx)}
                  onToggle={() => updateField(sectionId, ss.id, i, { enabled: !f.enabled })}
                />
              );
            }
            return (
              <StrategicFrameworkRow
                key={i}
                field={f}
                onToggle={() => updateField(sectionId, ss.id, i, { enabled: !f.enabled })}
                onValueChange={(v) => updateField(sectionId, ss.id, i, { value: v, enabled: true })}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function PeriodValueRow({
  field,
  periods,
  renderValue,
  onToggle,
}: {
  field: FwField;
  periods: string[];
  renderValue: (i: number) => string;
  onToggle: () => void;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
      field.enabled ? "border-border bg-background" : "border-border/50 bg-muted/20 opacity-70"
    }`}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={onToggle}
          className={`relative w-9 h-5 rounded-full flex-shrink-0 transition-colors ${field.enabled ? "bg-primary" : "bg-muted hover:bg-muted-foreground/30"}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${field.enabled ? "left-[18px]" : "left-0.5"}`} />
        </button>
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-foreground">{field.label}</div>
          {field.desc && <div className="text-[11px] text-muted-foreground">{field.desc}</div>}
        </div>
      </div>
      <div className="flex items-end gap-1.5 shrink-0 flex-wrap justify-end max-w-[60%]">
        {periods.map((label, i) => (
          <div key={i} className="flex flex-col items-stretch" style={{ minWidth: 56 }}>
            {periods.length > 1 && (
              <div className="text-[10px] font-medium uppercase tracking-wider mb-1 text-right text-muted-foreground">{label}</div>
            )}
            <span className="inline-flex items-center justify-end px-2.5 py-1 rounded-md border border-border bg-muted/30 text-xs font-semibold text-foreground tabular-nums">
              {renderValue(i)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Status chip used in the artifact canvas header. Shows "Draft" while
 * the artifact has unsaved generated content, and "Saved" after the
 * user explicitly writes back to the source of truth.
 */
function DraftStatusChip({ status, dirty }: { status: ArtifactDraftStatus; dirty: boolean }) {
  const isSaved = status === "saved" && !dirty;
  const label = isSaved ? "Saved" : "Draft";
  return (
    <span
      className="inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-sm text-[11.5px] font-medium whitespace-nowrap"
      style={{ backgroundColor: "#E6E8EE", color: "#1E2230" }}
      aria-label={label}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: isSaved ? "#10B981" : "#6B7280" }}
      />
      {label}
    </span>
  );
}

function ArtifactDraftChip({ artifactKey, compact = false }: { artifactKey: string; compact?: boolean }) {
  const draft = useArtifactDraft(artifactKey);
  const justSaved = useJustSaved(artifactKey);
  const isDirty = draft.dirty;
  // Only render when there are unsaved edits (Draft) or right after a save (Saved).
  if (!isDirty && !justSaved) return null;
  const sizing = compact ? "h-[18px] px-1.5 text-[10px] gap-1" : "h-[20px] px-2 text-[11px] gap-1.5";
  const label = justSaved ? "Saved" : "Draft";
  const bg = justSaved ? "#DCFCE7" : "#E6E8EE";
  const fg = justSaved ? "#065F46" : "#1E2230";
  const dot = justSaved ? "#10B981" : "#6B7280";
  return (
    <span
      className={`inline-flex items-center rounded-sm whitespace-nowrap font-medium ${sizing}`}
      style={{ backgroundColor: bg, color: fg }}
      title={label}
    >
      <span
        className={`rounded-full ${compact ? "w-1 h-1" : "w-1.5 h-1.5"}`}
        style={{ backgroundColor: dot }}
      />
      {label}
    </span>
  );
}

// ---- Saved chip: dispatch + listen on a window event keyed by artifact title ----
const ARTIFACT_SAVED_EVENT = "arc:artifact-saved";
function dispatchArtifactSaved(title?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ARTIFACT_SAVED_EVENT, { detail: { title: title || "" } }));
}
function useArtifactSaved(title?: string, duration = 1800) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const onSaved = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      if (!title || !detail.title || detail.title === title) {
        setShown(true);
        window.clearTimeout((onSaved as any)._t);
        (onSaved as any)._t = window.setTimeout(() => setShown(false), duration);
      }
    };
    window.addEventListener(ARTIFACT_SAVED_EVENT, onSaved);
    return () => {
      window.removeEventListener(ARTIFACT_SAVED_EVENT, onSaved);
      window.clearTimeout((onSaved as any)._t);
    };
  }, [title, duration]);
  return shown;
}
function SavedChip({ title, className = "" }: { title?: string; className?: string }) {
  const shown = useArtifactSaved(title);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-medium transition-all duration-200 ${shown ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-0.5 pointer-events-none"} ${className}`}
      aria-live="polite"
    >
      <svg className="w-2.5 h-2.5" viewBox="0 0 16 16" fill="none">
        <path d="M3.5 8.5l3 3 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Saved
    </span>
  );
}

/**
 * Permanent toast that lives in the canvas header (centered between the
 * title and the Share button). Two states:
 *   - dirty:  amber dot + "Unsaved draft" + Discard / Save Changes actions
 *   - clean:  subtle muted pill — "Draft" or "Saved · just now"
 */
function StrategicFrameworkHeaderChip({ artifactKey }: { artifactKey: string }) {
  const justSaved = useJustSaved(artifactKey);
  // Only show a temporary green "Saved" chip right after save. Otherwise
  // render nothing — the centered banner handles the dirty/draft state.
  if (!justSaved) return null;
  return (
    <div
      className="pointer-events-auto inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-sm text-[11.5px] font-medium transition-opacity"
      style={{ backgroundColor: "#DCFCE7", color: "#065F46" }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#10B981" }} />
      Saved
    </div>
  );
}

function StrategicFrameworkHeaderToast({ artifactKey, label = "Strategic Framework", fullScreen = false }: { artifactKey: string; label?: string; fullScreen?: boolean }) {
  const draft = useArtifactDraft(artifactKey);
  const handleSave = () => {
    saveArtifactDraft(artifactKey);
    toast.success(`${label} saved to Smartsheet`);
  };
  const handleDiscard = () => {
    resetArtifactDraft(artifactKey, {
      status: draft.status === "saved" ? "saved" : "draft",
      version: draft.version,
      dirty: false,
      savedAt: draft.savedAt,
    });
  };

  if (!draft.dirty) return null;

  return (
    <div
      className="flex items-center justify-between gap-3 w-full py-2 border-b transition-[padding] duration-200 ease-out"
      style={{
        backgroundColor: "#E6E8EE",
        borderColor: "rgba(0,0,0,0.06)",
        paddingLeft: fullScreen ? "var(--content-left)" : 24,
        paddingRight: 24,
      }}
    >
      <div className="flex items-center gap-2 text-[12px] min-w-0">
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#6B7280" }} />
        <span style={{ color: "#1E2230" }} className="truncate">
          <span className="font-semibold">Unsaved draft</span>
          <span> — changes haven't been written to Smartsheet yet.</span>
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={handleDiscard}
          className="h-7 px-3 rounded-md text-[12px] font-semibold border hover:bg-black/5 transition-colors"
          style={{ color: "#1E2230", borderColor: "rgba(0,0,0,0.12)", backgroundColor: "transparent" }}
        >
          Discard
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="h-7 px-3 rounded-md text-[12px] font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#1E2230" }}
        >
          Save
        </button>
      </div>
    </div>
  );
}

// Skip-first-render effect for change detection
function useChangeEffect(deps: any[], cb: () => void) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    cb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
const avatarForName = (name?: string | null) => {
  if (!name) return PERSON_AVATARS[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PERSON_AVATARS[h % PERSON_AVATARS.length];
};

const ALL_DAYS = [
  { id: "untitled", title: "Untitled", subtitle: "" },
  { id: "14f", title: "Budget deep dive", subtitle: "Last message today" },
  { id: "11f", title: "FY27 plan creation", subtitle: "Last message today" },
  { id: "11", title: "Setting up first plan", subtitle: "Last message today" },
  { id: "13", title: "Intake Review & Scenario Planning", subtitle: "Last message 5 days ago" },
  { id: "14", title: "Budget deep dive", subtitle: "Last message today" },
];

const getDays = () => {
  if (typeof window === "undefined") return ALL_DAYS.filter((d) => ["11", "11f", "14f"].includes(d.id));
  const hasNewChat = sessionStorage.getItem("arc_new_chat_created") === "true";
  const hasChat14 = sessionStorage.getItem("arc_chat_14_revealed") === "true";
  const hasUntitled = isUntitledCreated();
  return ALL_DAYS.filter((d) => {
    if (d.id === "untitled") return hasUntitled;
    if (d.id === "13") return hasNewChat;
    if (d.id === "14") return hasChat14;
    return true;
  });
};

const DAYS = ALL_DAYS;

/**
 * Module-level cache for the per-chat extra messages the user generates during
 * a session. Survives route changes (Conversation re-mounts when the user
 * navigates away and back), but is reset on a full page refresh — which is
 * exactly the demo behaviour we want.
 */
let sessionExtraMessagesCache: Record<string, any[]> = {};

// Shared rows for the FY27 Intake Sheet — used by both the initial review view and the weighted-prioritization view.
const INTAKE_REVIEW_ROWS: any[] = [
          // ── 17 NEW THIS CYCLE — In review ──
          { id: "D1-01", name: "EHR Platform Core Infrastructure", score: 94, priority: "High", department: "IT Infrastructure", portfolio: "Digital Transformation", budget: "$5.4M", fte: 32, status: "In review", rationale: "Foundational infrastructure for every Digital Transformation objective. Vendor confirmed, scope locked. Direct delivery vehicle for Obj 1.",
            submitter: "Marcus Patel", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 30, primaryOkr: "Unify clinical data systems", innovationHorizon: "H1", capexOpex: "55% / 45%", fundingSource: "Capital reserve", benefitType: "Platform enablement", criticalRoles: "Platform Architect, PM, Integration Lead", vendorInvolved: "Yes", dependencies: 5, integrationComplexity: 9, riskType: "Technical / integration", patientImpact: "Medium", regulatoryImpact: "Yes", kpis: "System uptime, data latency", baseline: "98.2%", target: "99.9%" },
          { id: "A1-02", name: "Sepsis Detection Tool", score: 92, priority: "High", department: "Clinical Quality", portfolio: "Patient Safety", budget: "$2.1M", fte: 12, status: "In review", rationale: "18% modeled mortality reduction. Vendor proven at 3 peer systems. Clean proposal with quantified patient safety benefit.",
            submitter: "Dr. Sarah Chen", investmentType: "Change", startQuarter: "Q2 FY27", durationMonths: 12, primaryOkr: "Reduce sepsis mortality 30%", innovationHorizon: "H1", capexOpex: "30% / 70%", fundingSource: "Operating budget", benefitType: "Patient outcomes", criticalRoles: "Clinical Analyst, Data Scientist", vendorInvolved: "Yes", dependencies: 3, integrationComplexity: 6, riskType: "Clinical adoption", patientImpact: "High", regulatoryImpact: "Yes", kpis: "Sepsis mortality rate", baseline: "12.4%", target: "8.5%" },
          { id: "C1-01", name: "Staff Retention Analytics", score: 88, priority: "High", department: "People Analytics", portfolio: "Workforce Resilience", budget: "$2.1M", fte: 8, status: "In review", rationale: "Maps directly to 22%→16% turnover KR. Pilot data validated by HR. Marcus Webb has implementation track record.",
            submitter: "Marcus Webb", investmentType: "Change", startQuarter: "Q2 FY27", durationMonths: 10, primaryOkr: "Reduce nurse turnover 22→16%", innovationHorizon: "H1", capexOpex: "15% / 85%", fundingSource: "HR ops budget", benefitType: "Retention / cost avoidance", criticalRoles: "HRIS Analyst, Data Scientist, PM", vendorInvolved: "Yes", dependencies: 2, integrationComplexity: 4, riskType: "Adoption", patientImpact: "Low", regulatoryImpact: "No", kpis: "Nurse voluntary turnover", baseline: "22%", target: "16%" },
          { id: "B2-01", name: "OR Scheduling System", score: 86, priority: "High", department: "Surgical Services", portfolio: "Operational Excellence", budget: "$2.8M", fte: 16, status: "In review", rationale: "Vendor selection complete. Strong KR alignment to OR turnaround. Realistic timeline, conservative benefit case.",
            submitter: "David Chen", investmentType: "Change", startQuarter: "Q2 FY27", durationMonths: 12, primaryOkr: "Improve OR turnaround time 20%", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Throughput / revenue", criticalRoles: "OR Lead, Scheduling Analyst, PM", vendorInvolved: "Yes", dependencies: 2, integrationComplexity: 5, riskType: "Workflow change", patientImpact: "Low", regulatoryImpact: "No", kpis: "OR turnaround time", baseline: "38 min", target: "30 min" },
          { id: "A1-03", name: "HAI Surveillance Upgrade", score: 84, priority: "High", department: "Infection Control", portfolio: "Patient Safety", budget: "$1.8M", fte: 6, status: "In review", rationale: "Current system end-of-life Q2 — time-bound urgency. Compliance and patient safety driver.",
            submitter: "Dr. Priya Shah", investmentType: "Run", startQuarter: "Q2 FY27", durationMonths: 8, primaryOkr: "Reduce HAI rate 15%", innovationHorizon: "H1", capexOpex: "35% / 65%", fundingSource: "Operating budget", benefitType: "Patient outcomes", criticalRoles: "Infection Preventionist, IT Engineer", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 5, riskType: "Vendor end-of-life", patientImpact: "High", regulatoryImpact: "Yes", kpis: "HAI rate per 1k patient days", baseline: "1.8", target: "1.5" },
          { id: "D1-02", name: "Clinical Data Warehouse", score: 82, priority: "High", department: "Analytics Team", portfolio: "Digital Transformation", budget: "$3.2M", fte: 18, status: "In review", rationale: "Named as a dependency in 3 other proposals. Worth a Lisa call before final selection — surfaces a sequencing tradeoff.",
            submitter: "Lisa Tran", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 18, primaryOkr: "Unify clinical data systems", innovationHorizon: "H1", capexOpex: "50% / 50%", fundingSource: "Capital reserve", benefitType: "Platform enablement", criticalRoles: "Data Engineer, Data Architect, PM", vendorInvolved: "Yes", dependencies: 4, integrationComplexity: 8, riskType: "Sequencing dependency", patientImpact: "Low", regulatoryImpact: "Yes", kpis: "Cross-system query latency", baseline: "12 sec", target: "<2 sec" },
          { id: "B2-02", name: "Supply Chain Vendor Consolidation", score: 80, priority: "Medium", department: "Supply Chain", portfolio: "Operational Excellence", budget: "$2.2M", fte: 10, status: "In review", rationale: "Documented $1.4M annual run-rate savings. Two-year payback. Low execution risk.",
            submitter: "Karen Mosley", investmentType: "Run", startQuarter: "Q2 FY27", durationMonths: 14, primaryOkr: "Reduce supply spend 6%", innovationHorizon: "H1", capexOpex: "5% / 95%", fundingSource: "Operating budget", benefitType: "Cost reduction", criticalRoles: "Procurement Lead, Sourcing Analyst", vendorInvolved: "No", dependencies: 1, integrationComplexity: 3, riskType: "Vendor transition", patientImpact: "None", regulatoryImpact: "No", kpis: "Supply spend per case", baseline: "$1,840", target: "$1,720" },
          { id: "A1-04", name: "Surgical Safety Checklist Tool", score: 78, priority: "Medium", department: "Perioperative", portfolio: "Patient Safety", budget: "$1.6M", fte: 5, status: "In review", rationale: "Joint Commission alignment. Modest direct benefit but supports broader safety culture KRs.",
            submitter: "Dr. Andre Hill", investmentType: "Change", startQuarter: "Q3 FY27", durationMonths: 9, primaryOkr: "Reduce surgical adverse events 10%", innovationHorizon: "H1", capexOpex: "20% / 80%", fundingSource: "Operating budget", benefitType: "Patient outcomes", criticalRoles: "Perioperative Nurse Lead, IT Analyst", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 3, riskType: "Adoption", patientImpact: "Medium", regulatoryImpact: "Yes", kpis: "Surgical adverse event rate", baseline: "3.1%", target: "2.6%" },
          { id: "D1-03", name: "Telehealth Phase 2", score: 76, priority: "Medium", department: "Virtual Care", portfolio: "Digital Transformation", budget: "$2.6M", fte: 14, status: "In review", rationale: "Phase 1 hit 25% of adoption target. Phase 2 expands specialties — strong fit but contingent on Phase 1 milestones.",
            submitter: "Dr. Naomi Park", investmentType: "Change", startQuarter: "Q3 FY27", durationMonths: 12, primaryOkr: "Grow virtual visit volume 40%", innovationHorizon: "H2", capexOpex: "20% / 80%", fundingSource: "Operating budget", benefitType: "Access / revenue", criticalRoles: "Telehealth Director, Integration Eng., PM", vendorInvolved: "Yes", dependencies: 2, integrationComplexity: 6, riskType: "Phase 1 dependency", patientImpact: "Medium", regulatoryImpact: "Yes", kpis: "Virtual visits per month", baseline: "4,200", target: "5,900" },
          { id: "B2-03", name: "Outpatient Referral Automation", score: 74, priority: "Medium", department: "Ambulatory", portfolio: "Operational Excellence", budget: "$2.0M", fte: 9, status: "In review", rationale: "Reduces leakage; modeled $0.9M revenue retention. Owner identified, scope defined.",
            submitter: "Erica Vasquez", investmentType: "Change", startQuarter: "Q3 FY27", durationMonths: 10, primaryOkr: "Reduce referral leakage 18%", innovationHorizon: "H1", capexOpex: "20% / 80%", fundingSource: "Operating budget", benefitType: "Revenue retention", criticalRoles: "Ambulatory Ops Lead, Integration Eng.", vendorInvolved: "Yes", dependencies: 2, integrationComplexity: 5, riskType: "Workflow change", patientImpact: "Low", regulatoryImpact: "No", kpis: "Referral leakage rate", baseline: "31%", target: "25%" },
          { id: "A1-05", name: "Medication Reconciliation Automation", score: 72, priority: "Medium", department: "Pharmacy", portfolio: "Patient Safety", budget: "$1.6M", fte: 7, status: "In review", rationale: "Reduces ADE risk. Vendor demoed, clean integration path. Benefit case understated.",
            submitter: "Dr. Henry Liu", investmentType: "Change", startQuarter: "Q3 FY27", durationMonths: 10, primaryOkr: "Reduce ADE rate 20%", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Patient outcomes", criticalRoles: "Pharmacist Informaticist, IT Analyst", vendorInvolved: "Yes", dependencies: 2, integrationComplexity: 6, riskType: "Workflow / clinical adoption", patientImpact: "High", regulatoryImpact: "Yes", kpis: "Adverse drug event rate", baseline: "2.4%", target: "1.9%" },
          { id: "C1-02", name: "Leadership Development Track", score: 70, priority: "Medium", department: "Talent Development", portfolio: "Workforce Resilience", budget: "$1.7M", fte: 4, status: "In review", rationale: "Indirect KR connection. Long benefit horizon — strategic but not urgent.",
            submitter: "Janelle Brooks", investmentType: "Run", startQuarter: "Q4 FY27", durationMonths: 18, primaryOkr: "Improve internal promotion rate 25%", innovationHorizon: "H2", capexOpex: "5% / 95%", fundingSource: "HR ops budget", benefitType: "Retention / capability", criticalRoles: "L&D Lead, Org Dev. Consultant", vendorInvolved: "Yes", dependencies: 0, integrationComplexity: 2, riskType: "Engagement", patientImpact: "None", regulatoryImpact: "No", kpis: "Internal leadership fill rate", baseline: "38%", target: "55%" },
          { id: "B2-04", name: "Revenue Cycle Analytics", score: 68, priority: "Medium", department: "Finance", portfolio: "Operational Excellence", budget: "$1.6M", fte: 7, status: "In review", rationale: "Modeled $1.1M denial recovery. Depends on Clinical Data Warehouse — sequencing risk.",
            submitter: "Tom Reilly", investmentType: "Change", startQuarter: "Q4 FY27", durationMonths: 10, primaryOkr: "Reduce denial rate 15%", innovationHorizon: "H1", capexOpex: "15% / 85%", fundingSource: "Operating budget", benefitType: "Revenue recovery", criticalRoles: "Rev Cycle Analyst, BI Engineer", vendorInvolved: "Yes", dependencies: 3, integrationComplexity: 6, riskType: "Upstream dependency", patientImpact: "None", regulatoryImpact: "No", kpis: "Initial denial rate", baseline: "9.4%", target: "7.5%" },
          { id: "D1-04", name: "Patient Feedback Analytics", score: 64, priority: "Medium", department: "Patient Experience", portfolio: "Digital Transformation", budget: "$2.4M", fte: 11, status: "In review", rationale: "Soft KR alignment to NPS. Overlaps with existing survey platform — bundling opportunity not explored.",
            submitter: "Olivia Park", investmentType: "Change", startQuarter: "Q4 FY27", durationMonths: 12, primaryOkr: "Improve patient NPS +8 pts", innovationHorizon: "H2", capexOpex: "20% / 80%", fundingSource: "Operating budget", benefitType: "Experience / NPS", criticalRoles: "PX Analyst, Data Scientist", vendorInvolved: "Yes", dependencies: 2, integrationComplexity: 5, riskType: "Vendor overlap", patientImpact: "Low", regulatoryImpact: "No", kpis: "Patient NPS", baseline: "42", target: "50" },
          { id: "B2-05", name: "Facilities Energy Optimization", score: 58, priority: "Low", department: "Facilities", portfolio: "Operational Excellence", budget: "$1.2M", fte: 4, status: "In review", rationale: "ESG-aligned. ROI plausible but no KR in framework requires it. Could defer to FY28.",
            submitter: "Greg Mason", investmentType: "Run", startQuarter: "Q4 FY27", durationMonths: 14, primaryOkr: "—", innovationHorizon: "H2", capexOpex: "60% / 40%", fundingSource: "Capital reserve", benefitType: "Cost reduction / ESG", criticalRoles: "Facilities Eng., Sustainability Lead", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 3, riskType: "Construction / disruption", patientImpact: "None", regulatoryImpact: "No", kpis: "Energy spend per sq ft", baseline: "$3.10", target: "$2.65" },
          { id: "D1-05", name: "IT Asset Discovery", score: 52, priority: "Low", department: "IT Operations", portfolio: "Digital Transformation", budget: "$2.6M", fte: 12, status: "In review", rationale: "Operational hygiene, not strategic. Better funded from IT run budget than capital intake.",
            submitter: "Brian Kowalski", investmentType: "Run", startQuarter: "Q4 FY27", durationMonths: 9, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "10% / 90%", fundingSource: "IT ops budget", benefitType: "Risk / hygiene", criticalRoles: "IT Asset Manager, Security Eng.", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Coverage gaps", patientImpact: "None", regulatoryImpact: "No", kpis: "Asset inventory accuracy", baseline: "72%", target: "97%" },
          { id: "D1-06", name: "Contract Lifecycle Tool", score: 48, priority: "Low", department: "Legal & Procurement", portfolio: "Digital Transformation", budget: "$2.0M", fte: 6, status: "In review", rationale: "No KR alignment. Useful capability but doesn't advance any FY27 strategic objective.",
            submitter: "Megan Foster", investmentType: "Run", startQuarter: "Q4 FY27", durationMonths: 8, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "10% / 90%", fundingSource: "Operating budget", benefitType: "Operational efficiency", criticalRoles: "Legal Ops Analyst, Procurement Lead", vendorInvolved: "Yes", dependencies: 0, integrationComplexity: 3, riskType: "Adoption", patientImpact: "None", regulatoryImpact: "No", kpis: "Contract cycle time", baseline: "42 days", target: "18 days" },

          // ── ACTIVE PORTFOLIO PROJECTS — already approved & in execution ──
          { id: "AP-DT-01", name: "EHR Platform Core Infrastructure", score: 78, priority: "Medium", department: "IT / Digital", portfolio: "Digital Transformation", budget: "$5.4M", fte: 24, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Digital Transformation.",
            submitter: "Marcus Webb", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "High execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-DT-02", name: "Clinical Data Warehouse", score: 80, priority: "High", department: "IT / Digital", portfolio: "Digital Transformation", budget: "$3.2M", fte: 14, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Digital Transformation.",
            submitter: "F. Davies", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Medium execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-DT-03", name: "Telehealth Phase 2", score: 81, priority: "High", department: "IT / Digital", portfolio: "Digital Transformation", budget: "$2.6M", fte: 12, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Digital Transformation.",
            submitter: "I. Larsen", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Medium execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-DT-04", name: "Patient Feedback Analytics", score: 82, priority: "High", department: "IT / Digital", portfolio: "Digital Transformation", budget: "$2.4M", fte: 11, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Digital Transformation.",
            submitter: "Y. Cho", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Low execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-DT-05", name: "IT Asset Discovery", score: 89, priority: "High", department: "IT / Digital", portfolio: "Digital Transformation", budget: "$2.6M", fte: 12, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Digital Transformation.",
            submitter: "N. Patel", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Low execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-DT-06", name: "Contract Lifecycle Tool", score: 72, priority: "Medium", department: "IT / Digital", portfolio: "Digital Transformation", budget: "$2.0M", fte: 9, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Digital Transformation.",
            submitter: "C. Webb", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Low execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-DT-07", name: "EHR Consolidation Phase 3", score: 83, priority: "High", department: "IT / Digital", portfolio: "Digital Transformation", budget: "$4.2M", fte: 19, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Digital Transformation.",
            submitter: "Marcus Patel", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "High execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-DT-08", name: "API Gateway Modernization", score: 95, priority: "High", department: "IT / Digital", portfolio: "Digital Transformation", budget: "$1.9M", fte: 9, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Digital Transformation.",
            submitter: "V. Singh", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Medium execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-DT-09", name: "Cloud Migration Wave 2", score: 84, priority: "High", department: "IT / Digital", portfolio: "Digital Transformation", budget: "$3.8M", fte: 17, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Digital Transformation.",
            submitter: "B. Kowalski", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "High execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-DT-10", name: "Identity & Access Modernization", score: 79, priority: "Medium", department: "IT / Digital", portfolio: "Digital Transformation", budget: "$2.6M", fte: 12, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Digital Transformation.",
            submitter: "Victor Singh", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Medium execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-DT-11", name: "Mobile Clinician Workspace", score: 75, priority: "Medium", department: "IT / Digital", portfolio: "Digital Transformation", budget: "$1.7M", fte: 8, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Digital Transformation.",
            submitter: "H. Nair", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Low execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-DT-12", name: "Data Integration Hub", score: 71, priority: "Medium", department: "IT / Digital", portfolio: "Digital Transformation", budget: "$2.2M", fte: 10, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Digital Transformation.",
            submitter: "F. Davies", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Medium execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-PS-13", name: "Sepsis Detection Tool", score: 82, priority: "High", department: "Clinical Quality", portfolio: "Patient Safety", budget: "$2.1M", fte: 9, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Patient Safety.",
            submitter: "Dr. Sarah Chen", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "High execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-PS-14", name: "HAI Surveillance Upgrade", score: 85, priority: "High", department: "Clinical Quality", portfolio: "Patient Safety", budget: "$1.8M", fte: 8, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Patient Safety.",
            submitter: "M. Patel", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Medium execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-PS-15", name: "Surgical Safety Checklist Tool", score: 70, priority: "Medium", department: "Clinical Quality", portfolio: "Patient Safety", budget: "$1.6M", fte: 7, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Patient Safety.",
            submitter: "S. Nguyen", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Low execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-PS-16", name: "Medication Reconciliation Automation", score: 77, priority: "Medium", department: "Clinical Quality", portfolio: "Patient Safety", budget: "$1.6M", fte: 7, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Patient Safety.",
            submitter: "R. Alvarez", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Medium execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-PS-17", name: "Sepsis Early Warning System (Pilot)", score: 90, priority: "High", department: "Clinical Quality", portfolio: "Patient Safety", budget: "$2.8M", fte: 13, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Patient Safety.",
            submitter: "K. Owens", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Medium execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-PS-18", name: "Care Coordination Platform", score: 81, priority: "High", department: "Clinical Quality", portfolio: "Patient Safety", budget: "$2.0M", fte: 9, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Patient Safety.",
            submitter: "Helen Cho", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Medium execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-PS-19", name: "Fall Prevention Program", score: 83, priority: "High", department: "Clinical Quality", portfolio: "Patient Safety", budget: "$1.1M", fte: 5, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Patient Safety.",
            submitter: "J. Brooks", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Low execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-PS-20", name: "Bedside Risk Scoring", score: 80, priority: "High", department: "Clinical Quality", portfolio: "Patient Safety", budget: "$1.4M", fte: 6, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Patient Safety.",
            submitter: "Dr. Andre Hill", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Medium execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-PS-21", name: "Adverse Event Reporting Workspace", score: 79, priority: "Medium", department: "Clinical Quality", portfolio: "Patient Safety", budget: "$0.9M", fte: 4, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Patient Safety.",
            submitter: "K. Owens", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Low execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-PS-22", name: "Pediatric Safety Bundle", score: 95, priority: "High", department: "Clinical Quality", portfolio: "Patient Safety", budget: "$1.3M", fte: 6, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Patient Safety.",
            submitter: "Dr. Priya Shah", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Medium execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-OE-23", name: "OR Scheduling System", score: 82, priority: "High", department: "Operations", portfolio: "Operational Excellence", budget: "$2.8M", fte: 13, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Operational Excellence.",
            submitter: "David Chen", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Medium execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-OE-24", name: "Supply Chain Vendor Consolidation", score: 94, priority: "High", department: "Operations", portfolio: "Operational Excellence", budget: "$2.2M", fte: 10, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Operational Excellence.",
            submitter: "L. Hernandez", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Medium execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-OE-25", name: "Outpatient Referral Automation", score: 77, priority: "Medium", department: "Operations", portfolio: "Operational Excellence", budget: "$2.0M", fte: 9, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Operational Excellence.",
            submitter: "M. Doyle", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Medium execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-OE-26", name: "Revenue Cycle Analytics", score: 92, priority: "High", department: "Operations", portfolio: "Operational Excellence", budget: "$1.6M", fte: 7, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Operational Excellence.",
            submitter: "G. Foster", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Low execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-OE-27", name: "Facilities Energy Optimization", score: 80, priority: "High", department: "Operations", portfolio: "Operational Excellence", budget: "$1.2M", fte: 5, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Operational Excellence.",
            submitter: "E. Marquez", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Low execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-OE-28", name: "ED Throughput Optimization", score: 82, priority: "High", department: "Operations", portfolio: "Operational Excellence", budget: "$1.5M", fte: 7, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Operational Excellence.",
            submitter: "M. Doyle", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "High execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-OE-29", name: "Bed Management Platform", score: 73, priority: "Medium", department: "Operations", portfolio: "Operational Excellence", budget: "$1.8M", fte: 8, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Operational Excellence.",
            submitter: "S. Yamada", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Medium execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-OE-30", name: "Specialty Pharmacy Expansion", score: 70, priority: "Medium", department: "Operations", portfolio: "Operational Excellence", budget: "$2.4M", fte: 11, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Operational Excellence.",
            submitter: "Dr. Henry Liu", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Medium execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-OE-31", name: "Centralized Scheduling Automation", score: 86, priority: "High", department: "Operations", portfolio: "Operational Excellence", budget: "$1.4M", fte: 6, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Operational Excellence.",
            submitter: "L. Hernandez", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Medium execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-OE-32", name: "Procurement Analytics Workspace", score: 91, priority: "High", department: "Operations", portfolio: "Operational Excellence", budget: "$0.9M", fte: 4, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Operational Excellence.",
            submitter: "Karen Mosley", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Low execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-WR-33", name: "Staff Retention Analytics", score: 70, priority: "Medium", department: "People & HR", portfolio: "Workforce Resilience", budget: "$2.1M", fte: 9, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Workforce Resilience.",
            submitter: "Rachel Kim", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Medium execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-WR-34", name: "Leadership Development Track", score: 73, priority: "Medium", department: "People & HR", portfolio: "Workforce Resilience", budget: "$1.7M", fte: 8, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Workforce Resilience.",
            submitter: "P. Chen", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Low execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-WR-35", name: "Nursing Float Pool Platform", score: 73, priority: "Medium", department: "People & HR", portfolio: "Workforce Resilience", budget: "$1.4M", fte: 6, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Workforce Resilience.",
            submitter: "Megan Liu", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Medium execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-WR-36", name: "Ambient Documentation Pilot", score: 70, priority: "Medium", department: "People & HR", portfolio: "Workforce Resilience", budget: "$1.1M", fte: 5, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Workforce Resilience.",
            submitter: "H. Nair", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Low execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-WR-37", name: "Staff Scheduling App", score: 95, priority: "High", department: "People & HR", portfolio: "Workforce Resilience", budget: "$0.8M", fte: 4, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Workforce Resilience.",
            submitter: "Rachel Kim", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Medium execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-WR-38", name: "Workforce Wellbeing Program", score: 85, priority: "High", department: "People & HR", portfolio: "Workforce Resilience", budget: "$0.9M", fte: 4, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Workforce Resilience.",
            submitter: "D. Okafor", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Low execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-WR-39", name: "Internal Mobility Workspace", score: 87, priority: "High", department: "People & HR", portfolio: "Workforce Resilience", budget: "$0.7M", fte: 3, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Workforce Resilience.",
            submitter: "Janelle Brooks", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Low execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-CQ-40", name: "Sepsis Early Warning System (Pilot)", score: 90, priority: "High", department: "Quality", portfolio: "Clinical Quality", budget: "$2.8M", fte: 13, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Clinical Quality.",
            submitter: "Dr. Elena Marsh", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Medium execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-CQ-41", name: "Clinical Pathway Standardization", score: 80, priority: "High", department: "Quality", portfolio: "Clinical Quality", budget: "$1.5M", fte: 7, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Clinical Quality.",
            submitter: "S. Nguyen", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Medium execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-CQ-42", name: "Quality Reporting Workspace", score: 72, priority: "Medium", department: "Quality", portfolio: "Clinical Quality", budget: "$1.2M", fte: 5, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Clinical Quality.",
            submitter: "J. Brooks", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Low execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-CQ-43", name: "Discharge Planning Optimization", score: 90, priority: "High", department: "Quality", portfolio: "Clinical Quality", budget: "$1.6M", fte: 7, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Clinical Quality.",
            submitter: "R. Alvarez", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Medium execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-CQ-44", name: "Post-Discharge Follow-up", score: 70, priority: "Medium", department: "Quality", portfolio: "Clinical Quality", budget: "$1.0M", fte: 5, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Clinical Quality.",
            submitter: "K. Owens", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Low execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },
          { id: "AP-CQ-45", name: "Mortality Review Dashboard", score: 91, priority: "High", department: "Quality", portfolio: "Clinical Quality", budget: "$0.9M", fte: 4, status: "Approved", rationale: "Approved in a prior cycle. Currently active in execution under Clinical Quality.",
            submitter: "Dr. Elena Marsh", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 12, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "25% / 75%", fundingSource: "Operating budget", benefitType: "Strategic execution", criticalRoles: "Project Lead, Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 4, riskType: "Low execution risk", patientImpact: "Medium", regulatoryImpact: "No", kpis: "Delivery milestones", baseline: "—", target: "—" },

          // ── Rejected ──
          { id: "RJ-01", name: "Executive Reporting Dashboard", score: 45, priority: "Low", department: "Finance", portfolio: "Operational & Fin. Perf.", budget: "$1.2M", fte: 5, status: "Rejected", rationale: "No KR alignment, dependency on unbuilt warehouse. Resubmit blocked unless coupled with Clinical Data Warehouse.",
            submitter: "James O'Brien", investmentType: "Run", startQuarter: "Q4 FY27", durationMonths: 6, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "10% / 90%", fundingSource: "Operating budget", benefitType: "Operational", criticalRoles: "—", vendorInvolved: "Yes", dependencies: 0, integrationComplexity: 2, riskType: "Adoption", patientImpact: "None", regulatoryImpact: "No", kpis: "—", baseline: "—", target: "—" },
          { id: "RJ-02", name: "Print Services Modernization", score: 38, priority: "Low", department: "Facilities", portfolio: "Operational Excellence", budget: "$0.6M", fte: 3, status: "Rejected", rationale: "Operational hygiene with no strategic alignment. Belongs in run budget.",
            submitter: "Patrick Wells", investmentType: "Run", startQuarter: "Q4 FY27", durationMonths: 6, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "10% / 90%", fundingSource: "Operating budget", benefitType: "Operational", criticalRoles: "—", vendorInvolved: "Yes", dependencies: 0, integrationComplexity: 2, riskType: "Adoption", patientImpact: "None", regulatoryImpact: "No", kpis: "—", baseline: "—", target: "—" },
          { id: "RJ-03", name: "Mobile Visitor Check-in App", score: 41, priority: "Low", department: "Patient Experience", portfolio: "Digital Transformation", budget: "$0.9M", fte: 4, status: "Rejected", rationale: "Overlap with existing wayfinding app. Recommend bundling into next PX initiative.",
            submitter: "Nina Alvarez", investmentType: "Run", startQuarter: "Q4 FY27", durationMonths: 6, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "10% / 90%", fundingSource: "Operating budget", benefitType: "Operational", criticalRoles: "—", vendorInvolved: "Yes", dependencies: 0, integrationComplexity: 2, riskType: "Adoption", patientImpact: "None", regulatoryImpact: "No", kpis: "—", baseline: "—", target: "—" },
          { id: "RJ-04", name: "Conference Room Scheduling Tool", score: 32, priority: "Low", department: "Corporate Services", portfolio: "Operational Excellence", budget: "$0.3M", fte: 2, status: "Rejected", rationale: "Out of scope for strategic intake. Routed to facilities ops budget.",
            submitter: "Dana Holloway", investmentType: "Run", startQuarter: "Q4 FY27", durationMonths: 6, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "10% / 90%", fundingSource: "Operating budget", benefitType: "Operational", criticalRoles: "—", vendorInvolved: "Yes", dependencies: 0, integrationComplexity: 2, riskType: "Adoption", patientImpact: "None", regulatoryImpact: "No", kpis: "—", baseline: "—", target: "—" },
          { id: "RJ-05", name: "Wellness App Subscription Bundle", score: 36, priority: "Low", department: "Human Resources", portfolio: "Workforce Resilience", budget: "$0.4M", fte: 2, status: "Rejected", rationale: "Soft KR linkage and vendor proliferation concern. Folded into broader benefits review.",
            submitter: "Renee Patel", investmentType: "Run", startQuarter: "Q4 FY27", durationMonths: 6, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "10% / 90%", fundingSource: "Operating budget", benefitType: "Operational", criticalRoles: "—", vendorInvolved: "Yes", dependencies: 0, integrationComplexity: 2, riskType: "Adoption", patientImpact: "None", regulatoryImpact: "No", kpis: "—", baseline: "—", target: "—" },
];


// Follow-up responses triggered by action buttons
const ACTION_RESPONSES: Record<string, any[]> = {
  "Review the 5 new intake requests": [
    { role: "user", text: "Review the new requests." },
    {
      role: "ai",
      paragraphs: [
        "Here are the 5 submissions. I've already scored each one against your confirmed themes, goals, and weighted scoring model.",
      ],
      artifact: {
        title: "FY27 Intake Sheet",
        subtitle: "Scored against confirmed themes & weighted model · sorted by score",
        type: "intake_sheet",
        totalLabel: "5 submissions",
        rows: [
          { id: "A1-01", name: "Sepsis Early Warning System", score: 91, priority: "High", department: "Clinical Ops", portfolio: "Clinical Quality", budget: "$2.8M", fte: 14, status: "In review", rationale: "Highest strategic alignment in submission pool. Vendor contract expires Q2 — hard urgency signal. Quantified patient safety benefit is well-documented.",
            submitter: "Dr. Sarah Chen", investmentType: "Change", startQuarter: "Q2 FY27", durationMonths: 14, primaryOkr: "Reduce sepsis mortality 30%", innovationHorizon: "H1", capexOpex: "30% / 70%", fundingSource: "Operating budget", benefitType: "Patient outcomes", criticalRoles: "Clinical Analyst, Data Scientist", vendorInvolved: "Yes", dependencies: 3, integrationComplexity: 6, riskType: "Clinical adoption", patientImpact: "High", regulatoryImpact: "Yes", kpis: "Sepsis mortality rate", baseline: "12.4%", target: "8.5%" },
          { id: "D1-01", name: "EHR Consolidation Phase 3", score: 87, priority: "High", department: "IT Division", portfolio: "Digital Transformation", budget: "$4.2M", fte: 28, status: "In review", rationale: "Direct delivery vehicle for Digital Transformation Obj 1. Named owner with prior EHR experience. No blocking dependencies. Urgency confirmed by Phase 2 completion timeline.",
            submitter: "Marcus Patel", investmentType: "Change", startQuarter: "Q1 FY27", durationMonths: 24, primaryOkr: "Unify clinical data systems", innovationHorizon: "H1", capexOpex: "45% / 55%", fundingSource: "Capital reserve", benefitType: "Operational efficiency", criticalRoles: "EHR Architect, PM, Integration Lead", vendorInvolved: "Yes", dependencies: 4, integrationComplexity: 8, riskType: "Technical / integration", patientImpact: "Medium", regulatoryImpact: "Yes", kpis: "Clinician documentation time", baseline: "42 min/shift", target: "28 min/shift" },
          { id: "B2-01", name: "OR Scheduling Modernization", score: 84, priority: "High", department: "Operations", portfolio: "Operational Efficiency", budget: "$3.1M", fte: 19, status: "In review", rationale: "Strong alignment to OR turnaround KR. David Chen's team has prior scheduling implementation experience. Timeline is realistic. Benefit case is conservative but credible.",
            submitter: "David Chen", investmentType: "Change", startQuarter: "Q2 FY27", durationMonths: 12, primaryOkr: "Improve OR turnaround time 20%", innovationHorizon: "H1", capexOpex: "20% / 80%", fundingSource: "Operating budget", benefitType: "Throughput / revenue", criticalRoles: "OR Lead, Scheduling Analyst, PM", vendorInvolved: "Yes", dependencies: 2, integrationComplexity: 5, riskType: "Workflow change", patientImpact: "Low", regulatoryImpact: "No", kpis: "OR turnaround time", baseline: "38 min", target: "30 min" },
          { id: "C1-01", name: "Staff Scheduling App", score: 62, priority: "Medium", department: "HR", portfolio: "Workforce Resilience", budget: "$0.8M", fte: 6, status: "In review", rationale: "Weak KR connection — scheduling optimization is a contributing input to retention, not a direct driver of the 22%→16% turnover target. Benefit is understated relative to effort.",
            submitter: "Rachel Kim", investmentType: "Run", startQuarter: "Q3 FY27", durationMonths: 9, primaryOkr: "Reduce nurse turnover 22→16%", innovationHorizon: "H1", capexOpex: "10% / 90%", fundingSource: "HR ops budget", benefitType: "Retention / cost avoidance", criticalRoles: "HRIS Analyst, PM", vendorInvolved: "Yes", dependencies: 1, integrationComplexity: 3, riskType: "Adoption", patientImpact: "None", regulatoryImpact: "No", kpis: "Nurse voluntary turnover", baseline: "22%", target: "16%" },
          { id: "F1-01", name: "Executive Reporting Dashboard", score: 44, priority: "Low", department: "Finance", portfolio: "Operational & Fin. Perf.", budget: "$1.2M", fte: 5, status: "In review", rationale: "Board reporting is a governance output, not a strategic delivery vehicle. No KR in the framework requires an executive dashboard. Dependency on unbuilt data warehouse is unresolved.",
            submitter: "James O'Brien", investmentType: "Run", startQuarter: "Q4 FY27", durationMonths: 6, primaryOkr: "—", innovationHorizon: "H1", capexOpex: "15% / 85%", fundingSource: "Finance ops budget", benefitType: "Reporting / governance", criticalRoles: "BI Engineer, PM", vendorInvolved: "No", dependencies: 6, integrationComplexity: 7, riskType: "Data warehouse dependency", patientImpact: "None", regulatoryImpact: "No", kpis: "Exec reporting cycle time", baseline: "10 days", target: "2 days" },
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Five submissions scored. Here's what I'd do next:",
      ],
      nextSteps: [
        { icon: "review", label: "Approve the top 3 high-scoring projects", detail: "Sepsis Early Warning, EHR Consolidation Phase 3, and OR Scheduling Modernization all score above 80 with clear KR alignment. Move them to funded once you've eyeballed the rationale." },
        { icon: "alert", label: "Reject the Executive Reporting Dashboard", detail: "Score of 44, no KR alignment, and a dependency on an unbuilt data warehouse. Cleanest call in the queue — sending it back frees reviewer cycles for the borderline cases." },
        { icon: "settings", label: "Review weighting criteria", detail: "See the current weights driving every score — Goal Alignment, Business Value, Risk, and Effort — and adjust them if the model isn't reflecting how this portfolio should be prioritized." },
        { icon: "network", label: "Connect your Smartsheet portfolios", detail: "I can't yet check these 5 submissions against in-flight work for duplicates or budget conflicts. Connecting portfolios closes that gap before you commit." },
      ],
    },
  ],

  "Connect Portfolios": [
    { role: "user", text: "Connect Portfolios" },
    {
      role: "ai",
      paragraphs: [
        "I found **7 portfolios** with **45 active projects** across your Smartsheet workspace and connected all of them. Here's what I pulled in:",
      ],
      inline: {
        type: "portfolio_connect",
        rows: [
          { name: "Digital Transformation",  status: "Active", projects: 9, owner: "Marcus Webb",     lastUpdated: "Today" },
          { name: "Patient Safety",          status: "Active", projects: 7, owner: "Dr. Priya Shah",  lastUpdated: "Today" },
          { name: "Operational Excellence",  status: "Active", projects: 8, owner: "Lisa Torres",     lastUpdated: "Yesterday" },
          { name: "Workforce Resilience",    status: "Active", projects: 5, owner: "Sarah Kim",       lastUpdated: "2 days ago" },
          { name: "Clinical Quality",        status: "Active", projects: 6, owner: "Dr. Elena Marsh", lastUpdated: "Today" },
          { name: "Financial Performance",   status: "Active", projects: 6, owner: "James O'Brien",   lastUpdated: "Today" },
          { name: "Research & Innovation",   status: "Active", projects: 4, owner: "Dr. Amir Khan",   lastUpdated: "3 days ago" },
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "**I scored every active project across those portfolios against your confirmed strategic framework.** Here's the prioritized view — open it to see scoring rationale, KR alignment, and where each project falls relative to the cut line.",
      ],
      artifact: {
        title: "Intake Sheet - Existing Projects_Scored vs Strategic Plan",
        subtitle: "All active projects across connected portfolios · scored & prioritized",
        type: "intake_sheet",
        totalLabel: "45 active projects",
        rows: EXISTING_PORTFOLIO_ROWS,
       },
     },
     {
       role: "ai",
       paragraphs: [
         "With everything scored against the strategic plan, here's what I'd recommend tackling next:",
       ],
       nextSteps: [
         { icon: "layers", label: "Would you like to run scenarios on budget/cut line?", detail: "Pressure-test 2–3 funding scenarios against your envelope and capacity to see which projects fall above or below the cut line.", featured: true, featuredNote: "Recommended next step — see tradeoffs before locking the plan." },
         { icon: "alert", label: "Review the 6 projects flagged for vendor or delivery risk", detail: "Surface the at-risk initiatives so you can decide whether to continue, scope down, or pause before re-baselining." },
         { icon: "network", label: "Identify duplicate or overlapping initiatives across portfolios", detail: "I spotted potential overlap across Digital Transformation and Patient Experience — worth consolidating before next intake." },
       ],
     },
   ],
   "Connect portfolios": [
    { role: "user", text: "Connect portfolios" },
    {
      role: "ai",
      paragraphs: [
        "To connect your portfolios, I need the Smartsheet sheet IDs for each one. You can find these by opening a sheet in Smartsheet, going to File → Properties, and copying the Sheet ID.",
        "Paste your sheet IDs below — one per line, or comma-separated. I'll validate each connection and confirm what I can see.",
      ],
      actions: [
        { label: "Where do I find Sheet IDs?", style: "ghost" },
      ],
    },
  ],
  "Got it, let's connect portfolios": [
    { role: "user", text: "Got it, let's connect portfolios" },
    {
      role: "ai",
      paragraphs: [
        "To connect your portfolios, I need the Smartsheet sheet IDs for each one. You can find these by opening a sheet in Smartsheet, going to File → Properties, and copying the Sheet ID.",
        "Paste your sheet IDs below — one per line, or comma-separated. I'll validate each connection and confirm what I can see.",
      ],
      actions: [
        { label: "Where do I find Sheet IDs?", style: "ghost" },
      ],
    },
  ],
  "Upload strategy doc": [
    { role: "user", text: "Upload strategy doc" },
    {
      role: "ai",
      paragraphs: [
        "Upload your strategy document and I'll extract themes, objectives, and key results from it. Supported formats: PDF, DOCX, or plain text.",
        "I'll present what I find for your review — nothing gets confirmed until you approve it.",
      ],
    },
  ],
  "Enter manually": [
    { role: "user", text: "Enter manually" },
    {
      role: "ai",
      paragraphs: [
        "No problem. Let's define your investment guardrails manually. I'll walk you through each parameter one at a time.",
        "First — what's your total budget envelope for FY27? This is the top-line number before any reserves or allocations.",
      ],
    },
  ],
  "Where do I find Sheet IDs?": [
    { role: "user", text: "Where do I find Sheet IDs?" },
    {
      role: "ai",
      paragraphs: [
        "In Smartsheet, open any sheet and go to File → Properties. The Sheet ID is a numeric string at the top of the dialog. Copy it and paste it here.",
        "If you have workspace-level access, you can also find sheet IDs in the API panel under Account → Smartsheet API.",
      ],
    },
  ],
  "Apply all suggestions": [
    { role: "user", text: "Apply all suggestions" },
    {
      role: "ai",
      paragraphs: [
        "**Done** — all suggested values have been applied. Your investment parameters are now fully configured:",
      ],
      bullets: [
        { label: "Per-portfolio budget cap:", detail: "$6M" },
        { label: "Active project count limit:", detail: "≤8 per portfolio" },
      ],
      paragraphs2: [
        "Both values are marked as AI-derived. They'll be flagged for human review before intake opens. You can edit them anytime from the guardrails view.",
      ],
    },
  ],
  "Edit individually": [
    { role: "user", text: "Edit individually" },
    {
      role: "ai",
      paragraphs: [
        "Let's go through each pending parameter. First up:",
        "Per-portfolio budget cap — I'm suggesting $6M based on $42M total divided across 7 portfolios with the 15% reserve held back. Would you like to adjust this number?",
      ],
    },
  ],
  "Flag for Sarah Kim": [
    { role: "user", text: "Flag for Sarah Kim" },
    {
      role: "ai",
      paragraphs: [
        "**Flagged.** I've drafted a summary for Sarah Kim highlighting the 15% vs 18% reserve discrepancy between the uploaded financial plan and the H2 CFO guidance. You can review and send it, or I can queue it for your next sync.",
      ],
      actions: [
        { label: "Review draft", style: "primary" },
        { label: "Queue for next sync", style: "ghost" },
      ],
    },
  ],
  "Adjust FTE cap": [
    { role: "user", text: "Adjust FTE cap" },
    {
      role: "ai",
      paragraphs: [
        "Updated. Net available FTE capacity adjusted from 260 to 240, accounting for the 20 FTEs locked in Clinical Operations through Q2. This will be reflected in all scenario models going forward.",
      ],
    },
  ],
  "Proceed anyway": [
    { role: "user", text: "Proceed anyway" },
    {
      role: "ai",
      paragraphs: [
        "Understood. I've noted the conflicts but won't block progress. The three items are logged as known risks and will surface again during intake review. Moving on to prioritization setup.",
      ],
    },
  ],
  "Finish your investment parameters": [
    { role: "user", text: "Finish your investment parameters" },
    {
      role: "ai",
      paragraphs: [
        "Six governance parameters are still incomplete. I can suggest values based on your budget and FTE numbers, or you can fill them in directly — should take under 10 minutes. Want me to draft suggestions first?",
      ],
      actions: [
        { label: "Draft suggested values", style: "primary" },
        { label: "Fill in manually", style: "ghost" },
      ],
    },
  ],
  "Share the intake form more broadly": [
    { role: "user", text: "Share the intake form more broadly" },
    {
      role: "ai",
      paragraphs: [
        "Good call. I'll draft an announcement for theme owners and PMO leads with the form link, scope guidance, and the Feb 28 submission deadline. Want me to send it from your account or hand you the draft to review first?",
      ],
      actions: [
        { label: "Review draft first", style: "primary" },
        { label: "Send from my account", style: "ghost" },
      ],
    },
  ],
  "Add collaborators to your planning workspace": [
    { role: "user", text: "Add collaborators to your planning workspace" },
    {
      role: "ai",
      paragraphs: [
        "Who would you like to bring in? CFO, PMO, and theme owners is the typical set — they'll only see what's relevant to their scope. I can pull suggested invites from your org chart in Smartsheet.",
      ],
      actions: [
        { label: "Pull suggested invites", style: "primary" },
        { label: "Add manually", style: "ghost" },
      ],
    },
  ],
  "Review drafted objectives for Op. Excellence": [
    { role: "user", text: "Review drafted objectives for Op. Excellence" },
    {
      role: "ai",
      paragraphs: [
        "Here are two draft objectives for Operational Excellence based on your portfolio data and the themes already confirmed:",
      ],
      bullets: [
        { label: "Objective 2: Reduce supply chain lead times by 20%.", detail: "KR: Average PO-to-delivery cycle ≤14 days by Q3. KR: 95% of critical supplies maintain 30-day buffer stock." },
        { label: "Objective 3: Improve facility utilization across all sites.", detail: "KR: OR utilization rate ≥80% by Q4. KR: Outpatient clinic no-show rate ≤8%." },
      ],
      actions: [
        { label: "Approve both", style: "primary" },
        { label: "Edit before approving", style: "ghost" },
      ],
    },
  ],
  "Send reminder to Lisa Torres": [
    { role: "user", text: "Send reminder to Lisa Torres" },
    {
      role: "ai",
      paragraphs: [
        "Reminder drafted for Lisa Torres. It notes that Workforce Resilience has $4.9M reserved but no objectives defined, and that intake opens in 4 days. Would you like to send it now or customize the message first?",
      ],
      actions: [
        { label: "Send now", style: "primary" },
        { label: "Customize message", style: "ghost" },
      ],
    },
  ],
  "Select A and submit for intake": [
    { role: "user", text: "Select A and submit for intake" },
    {
      role: "ai",
      paragraphs: [
        "Scenario A has been selected as the plan of record. Before I submit for intake, please confirm:",
      ],
      bullets: [
        { label: "37 projects queued", detail: "across 7 portfolios" },
        { label: "$42M total budget", detail: "with $6.3M (15%) reserve" },
        { label: "240 FTEs allocated", detail: "within capacity limits" },
      ],
      actions: [
        { label: "Confirm and submit", style: "primary" },
        { label: "Review one more time", style: "ghost" },
      ],
    },
  ],
  "Review Scenario B": [
    { role: "user", text: "Review Scenario B" },
    {
      role: "ai",
      paragraphs: [
        "Scenario B is the conservative option. It defers Workforce Resilience entirely, saving $6M but carrying retention risk. 19 active projects, 355 FTEs, and a 22% reserve — well within all guardrails.",
        "The trade-off: Workforce Resilience was the most cited theme in last quarter's engagement survey. Full deferral may trigger attrition in clinical roles.",
      ],
    },
  ],
  "Review Scenario C": [
    { role: "user", text: "Review Scenario C" },
    {
      role: "ai",
      paragraphs: [
        "Scenario C is the accelerated option. It expands all themes and funds 31 active projects — but exceeds the FTE cap by 70 roles. The 12% reserve also falls below the CFO's 15% floor.",
        "This scenario would require either hiring 70 additional FTEs or renegotiating the capacity guardrail. I'd flag this as high-risk without executive sign-off.",
      ],
    },
  ],
  "Add dependency flag to Scenario A": [
    { role: "user", text: "Add dependency flag to Scenario A" },
    {
      role: "ai",
      paragraphs: [
        "Done. I've added a dependency flag between Digital Transformation Obj 1 (EHR go-live) and Operational Excellence Obj 1 (OR turnaround). If EHR slips past Q3, the system will automatically surface the downstream impact on OR turnaround timelines.",
      ],
    },
  ],
  "Open baseline worksheet": [
    { role: "user", text: "Open baseline worksheet" },
    {
      role: "ai",
      paragraphs: [
        "Here are the 8 KRs missing baseline measurements. I recommend scheduling a 2-hour session with theme owners to fill these in before intake closes.",
      ],
      bullets: [
        { label: "Digital Transformation:", detail: "Real-time dashboards live (no current count), Zero Tier-1 outages (no historical baseline)" },
        { label: "Patient Safety:", detail: "Door-to-antibiotic timing (no current measurement), Sepsis mortality rate (no FY24 baseline)" },
        { label: "Operational Excellence:", detail: "OR turnover time (no standardized measurement), First-case start tracking (not currently reported)" },
        { label: "Workforce Resilience:", detail: "All KRs pending — theme not yet defined" },
      ],
    },
  ],
  "Extract from your strategy docs": [
    { role: "user", text: "Extract from my strategy docs." },
    {
      role: "ai",
      paragraphs: [
        "Drop your documents below. I can read strategy decks, board plans, CFO memos, operating plans, and divisional goal documents. The more you upload the more I can pre-fill — you can always add more later.",
      ],
      artifactInline: true,
      artifact: {
        title: "Upload your documents",
        subtitle: "PDF, DOCX, PPTX, XLSX · up to 20MB each",
        type: "dropzone",
        accept: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md",
      },
    },
  ],
  "Start with your documents": [
    { role: "user", text: "Let's start with my documents." },
    {
      role: "ai",
      paragraphs: [
        "Drop your documents below. I can read strategy decks, board plans, CFO memos, operating plans, and divisional goal documents. The more you upload the more I can pre-fill — you can always add more later.",
      ],
      artifactInline: true,
      artifact: {
        title: "Upload your documents",
        subtitle: "PDF, DOCX, PPTX, XLSX · up to 20MB each",
        type: "dropzone",
        accept: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md",
      },
    },
  ],
  // Hidden scripted response triggered when the presenter "uploads" via the
  // dropzone or the paperclip in the input bar. File names are fixed for the demo.
  "__upload_docs__": [
    { role: "user", text: "[uploads FY27_BoardStrategicPlan.pdf, ClinicalDivision_Goals.docx, Operations_FY27_Plan.pdf, CFO_BudgetMemo.pptx, HR_WorkforcePlan.pptx]" },
    {
      role: "ai",
      paragraphs: [
        "**Done.** Across your five documents I found **5 goals** and recommend 2 more, and pulled out **10 of 16 investment parameters**.",
      ],
    },
    {
      role: "ai",
      paragraphs: [
        "Here's the draft Strategic Framework — goals, envelopes, guardrails, and scoring extracted across your documents. Review, edit, or add to it before it goes to theme owners.",
      ],
      artifact: {
        title: "Strategic Framework",
        subtitle: "4 goals · 2 recommended · 10 of 16 parameters configured",
        type: "strategic_framework",
        // Four active goals extracted from the uploaded docs. Shape matches
        // the GoalsTab `Goal` type so they render correctly.
        goals: [
          {
            id: "g-safety",
            name: "Patient Safety & Clinical Quality",
            description: "Reduce hospital-acquired infections, preventable harm events, and improve protocol compliance across the system.",
            owner: "Dr. Sarah Chen",
            fiscalYear: "FY27",
            startFY: "FY27",
            endFY: "FY29",
            weightPct: 30,
            active: true,
            exemptCategories: "regulatory",
            keyResults: [
              { id: "kr-s1", label: "KR 1.1", name: "Reduce 30-day readmissions", metric: "All-cause 30-day readmission rate", target: "13.0%", owner: "Dr. Aisha Bello", targetDate: "FY27", businessImpact: "Avoid $22M in CMS penalties and readmission cost" },
              { id: "kr-s2", label: "KR 1.2", name: "Drive down hospital-acquired infections", metric: "CLABSI/CAUTI standardized infection ratio", target: "≤0.80", owner: "Karen Doyle", targetDate: "FY27", businessImpact: "Avoid $9M cost, protect VBP reimbursement" },
              { id: "kr-s3", label: "KR 1.3", name: "Lift patient experience", metric: "HCAHPS 'would recommend' top-box percentile", target: "80th", owner: "Tomás Rivera", targetDate: "FY27", businessImpact: "Protects ~$14M of value-based purchasing at risk" },
            ],
          },
          {
            id: "g-access",
            name: "Access to Care & Throughput",
            description: "Cut appointment wait times, grow the ambulatory footprint, and stop out-of-network leakage to convert unmet demand into captured volume.",
            owner: "Michael Torres",
            fiscalYear: "FY27",
            startFY: "FY27",
            endFY: "FY29",
            weightPct: 25,
            active: true,
            exemptCategories: "",
            keyResults: [
              { id: "kr-a1", label: "KR 2.1", name: "Compress new-patient access", metric: "Median days to third-next-available appointment", target: "7", owner: "Luis Carrara", targetDate: "FY27", businessImpact: "$28M captured net revenue (Y1), $66M (3Y)" },
              { id: "kr-a2", label: "KR 2.2", name: "Grow the ambulatory network", metric: "Net new outpatient visits", target: "120,000", owner: "Dana Whitfield", targetDate: "FY29", businessImpact: "$42M net patient revenue (Y1), $150M (3Y)" },
              { id: "kr-a3", label: "KR 2.3", name: "Recapture network leakage", metric: "In-network retention rate", target: "80%", owner: "Erin Cho", targetDate: "FY27", businessImpact: "$35M recaptured revenue" },
            ],
          },
          {
            id: "g-workforce",
            name: "Workforce Stability & Engagement",
            description: "Reduce nurse turnover, lower agency utilization, and improve caregiver engagement.",
            owner: "Jennifer Walsh",
            fiscalYear: "FY27",
            startFY: "FY27",
            endFY: "FY29",
            weightPct: 25,
            active: true,
            exemptCategories: "",
            keyResults: [
              { id: "kr-w1", label: "KR 3.1", name: "Wean off contract labor", metric: "Agency labor as % of total nursing spend", target: "4%", owner: "Karen Doyle", targetDate: "FY28", businessImpact: "$48M annual labor savings at run-rate" },
              { id: "kr-w2", label: "KR 3.2", name: "Retain first-year nurses", metric: "RN first-year turnover", target: "18%", owner: "Nadia Okafor", targetDate: "FY27", businessImpact: "$19M avoided replacement and onboarding cost" },
              { id: "kr-w3", label: "KR 3.3", name: "Improve caregiver engagement", metric: "Press Ganey engagement percentile", target: "75th", owner: "Jennifer Walsh", targetDate: "FY27", businessImpact: "Correlated with 20% turnover reduction" },
            ],
          },
          {
            id: "g-finance",
            name: "Financial Performance & Efficiency",
            description: "Improve operating margin, reduce cost per adjusted discharge, and take out post-pandemic labor premium.",
            owner: "David Park",
            fiscalYear: "FY27",
            startFY: "FY27",
            endFY: "FY29",
            weightPct: 20,
            active: true,
            exemptCategories: "",
            keyResults: [
              { id: "kr-f1", label: "KR 4.1", name: "Reduce length of stay", metric: "Case-mix-adjusted average LOS", target: "−0.4 days", owner: "Greg Tanaka", targetDate: "FY27", businessImpact: "$26M throughput capacity and cost avoidance" },
              { id: "kr-f2", label: "KR 4.2", name: "Lift operating margin", metric: "Operating margin (bps improvement)", target: "+175 bps", owner: "David Park", targetDate: "FY29", businessImpact: "$80–90M run-rate margin improvement" },
              { id: "kr-f3", label: "KR 4.3", name: "Reduce cost per adjusted discharge", metric: "Cost per CMI-adjusted discharge", target: "−4%", owner: "Priya Raman", targetDate: "FY28", businessImpact: "$32M annualized cost reduction" },
            ],
          },

        ],
        // Two AI suggestions surfaced under the goals list. Each is a goal the
        // user can accept to add to the active list.
        goalRecommendations: [
          {
            id: "rec-equity",
            name: "Health Equity & Community Outcomes",
            rationale: "None of the four extracted goals address disparities in care or community-level outcomes. Peer health systems at your scale typically include this as a fifth pillar — and your board minutes referenced it twice in the last quarter.",
            owner: "Dr. Amara Okafor",
          },
          {
            id: "rec-digital",
            name: "Digital & Data Modernization",
            rationale: "Your CFO memo and operating plan both call out EHR optimization and analytics maturity, but no extracted goal anchors them. Adding this gives the digital portfolio a clear strategic owner.",
            owner: "Priya Natarajan",
          },
        ],
        // Partial autofill across the framework sections — a handful of obvious
        // fields ON, the rest left for the user to confirm.
        sections: [
          {
            id: "goals",
            label: "Goals",
            icon: Target,
            description: "What the organization is optimizing for this planning cycle.",
            fields: [
              { label: "Goal name & description", desc: "What the org is optimizing for", enabled: true },
              { label: "Goal owner", desc: "C-Suite sponsor per goal", enabled: true },
              { label: "Active / inactive toggle", desc: "Enable or retire goals per cycle" },
              { label: "Fiscal year", desc: "Goals anchored to planning year", value: "FY27", enabled: true },
              { label: "Exempt categories", desc: "Work that bypasses scoring (e.g. compliance)" },
            ],
          },
          {
            id: "envelopes",
            label: "Investment Envelopes",
            icon: Wallet,
            description: "Spending caps, capacity, and allocation targets for the planning horizon.",
            subsections: [
              {
                id: "budget",
                label: "Budget",
                desc: "Currency-denominated spend, anchored to each timeframe.",
                enabled: true,
                toolbar: {
                  controls: [
                    { kind: "select", id: "cadence", value: "Yearly", options: ["Yearly", "Quarterly", "Monthly"] },
                    { kind: "select", id: "fy", value: "FY27", options: ["FY26", "FY27", "FY28"] },
                    { kind: "select", id: "currency", value: "$ USD", options: ["$ USD", "€ EUR", "£ GBP"] },
                    { kind: "button", id: "erp", label: "Connect ERP", icon: "plug" },
                  ],
                },
                fields: [
                  { label: "Total Budget", desc: "Sum of CapEx and OpEx per period", value: "$240M", enabled: true },
                  { label: "CapEx", desc: "Per fiscal year", value: "$150M", enabled: true },
                  { label: "OpEx", desc: "Per fiscal year", value: "$90M", enabled: true },
                ],
              },
              {
                id: "capacity",
                label: "Capacity",
                desc: "People (FTE) devoted to this work.",
                enabled: true,
                toolbar: {
                  controls: [
                    { kind: "select", id: "cadence", value: "Yearly", options: ["Yearly", "Quarterly", "Monthly"] },
                    { kind: "select", id: "fy", value: "FY27", options: ["FY26", "FY27", "FY28"] },
                    { kind: "select", id: "group", value: "Group by Dept", options: ["Group by Dept", "Group by Role", "Group by Portfolio"] },
                    { kind: "button", id: "hris", label: "Connect HRIS", icon: "plug" },
                  ],
                },
                fields: [
                  { label: "Total FTE", desc: "Sum of all job profiles per period", value: "325", enabled: true },
                  { label: "Digital & IT", group: true, value: "140", children: [
                    { label: "Software Engineer", value: "60" },
                    { label: "Sr. Software Engineer", value: "30" },
                    { label: "IT Operations Engineer", value: "30" },
                    { label: "Solutions Architect", value: "20" },
                  ]},
                  { label: "Clinical Informatics", group: true, value: "45", children: [
                    { label: "Clinical Informaticist", value: "28" },
                    { label: "Sr. Informatics Analyst", value: "17" },
                  ]},
                  { label: "Performance Excellence", group: true, value: "60", children: [
                    { label: "Process Improvement Lead", value: "32" },
                    { label: "Quality Analyst", value: "28" },
                  ]},
                  { label: "Program Management Office", group: true, value: "40", children: [
                    { label: "Program Manager", value: "24" },
                    { label: "Project Coordinator", value: "16" },
                  ]},
                  { label: "Data & Analytics", group: true, value: "35", children: [
                    { label: "Data Engineer", value: "20" },
                    { label: "BI Analyst", value: "15" },
                  ]},
                  { label: "No Department", group: true, value: "5", children: [
                    { label: "Contract Developer", value: "5" },
                  ]},
                  { label: "Product", group: true, value: "0", children: [
                    { label: "Sr. Product Manager", value: "0" },
                  ]},
                ],
              },
              {
                id: "types",
                label: "Investment Types",
                desc: "Target allocation across run-the-business, change, and growth bets.",
                enabled: true,
                fields: [
                  { label: "Run", desc: "% of total investment — keep the lights on", type: "weight", value: "55", enabled: true },
                  { label: "Change", desc: "% of total investment — improve existing capabilities", type: "weight", value: "30", enabled: true },
                  { label: "Grow", desc: "% of total investment — new bets & innovation", type: "weight", value: "15", enabled: true },
                ],
              },
            ],
          },
          {
            id: "guardrails",
            label: "Guardrails",
            icon: ShieldCheck,
            description: "Boundaries that protect the portfolio during planning and execution.",
            subsections: [
              {
                id: "planning",
                label: "Planning Guardrails",
                fields: [
                  { label: "Budget Variance", desc: "Allowed deviation from approved envelope, by budget type", group: true, severity: "Warn", enabled: true, children: [
                    { label: "CapEx", type: "range", unit: "%", min: -10, max: 5 },
                    { label: "OpEx", type: "range", unit: "%", min: -8, max: 0 },
                  ]},
                  { label: "Investment Mix Variance", desc: "Allowed deviation from target share of investment mix, by category", group: true, severity: "Warn", enabled: true, children: [
                    { label: "Run", type: "range", unit: "%", min: -15, max: 0 },
                    { label: "Grow", type: "range", unit: "%", min: -5, max: 5 },
                    { label: "Transform", type: "range", unit: "%", min: -5, max: 10 },
                  ]},
                  { label: "Capacity Buffer", desc: "Share of FTE unplanned to absorb unscheduled work", severity: "Block", enabled: true, value: "15%" },
                ],
              },
              {
                id: "execution",
                label: "Execution Guardrails",
                fields: [
                  { label: "Schedule Drift", desc: "Slip between planned and actual end date before flagging", severity: "Warn", enabled: true, value: "10%" },
                  { label: "Target Utilization", desc: "Booked utilization on an initiative before flagging", severity: "Warn", enabled: true, value: "105%" },
                  { label: "Budget Drift", desc: "How far spend may run ahead of schedule progress", severity: "Block", enabled: true, value: "15%" },
                ],
              },
            ],
          },
          {
            id: "scoring",
            label: "Scoring Model",
            icon: Sliders,
            description: "Each request is scored 1–3 on every criterion, then weighted to produce a single ranking score. Weights must sum to 100%.",
            fields: [
              { label: "Strategic Alignment", desc: "How directly the project advances an active portfolio goal or key result.", type: "weight", value: "35", enabled: true },
              { label: "Financial Value / ROI", desc: "Expected financial return relative to investment and payback horizon.", type: "weight", value: "30", enabled: true },
              { label: "Demand & Evidence", desc: "Strength of validated demand signals supporting the request.", type: "weight", value: "20", enabled: true },
              { label: "Time-criticality", desc: "Urgency of the window — whether the project can wait or blocks other funded work.", type: "weight", value: "15", enabled: true },
            ],
          },

        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Once you're happy with the framework, here are the most useful next steps. Pick whichever fits your priorities today.",
      ],
      nextSteps: [
        { icon: "form", label: "Built your intake form and created an agent to monitor and track it", detail: "Pre-configure intake against your goals, envelopes, guardrails, and scoring model so submitters get the right fields the first time.", featured: true, featuredNote: "Recommended next step — every other decision flows from intake." },
        { icon: "calendar", label: "Set intake open / close dates", detail: "Lock the submission window against the fiscal calendar so portfolio leads know when requests are due and reviewers know when scoring begins." },
        { icon: "network", label: "Connect Smartsheet portfolios", detail: "Sync active projects so I can check the upcoming intake against in-flight work for duplicates, dependencies, and budget conflicts." },
      ],
    },
  ],
  "Determine planning cycle": [
    { role: "user", text: "Help me determine the planning cycle." },
    {
      role: "ai",
      paragraphs: [
        "Two patterns to choose from. Both are fully supported — the difference is how often you re-baseline and how intake flows in.",
      ],
      actions: [
        { label: "Use an annual plan", style: "ghost" },
        { label: "Use a continuous plan", style: "ghost" },
      ],
    },
    {
      role: "ai",
      paragraphs: [
        "**Annual plan** — Lock the funded set at the start of the fiscal year. Intake closes after baseline; mid-year changes require a formal replan. Best when budgets are fixed and governance is heavy.",
        "**Continuous plan** — Re-baseline on a recurring cadence (typically quarterly). Intake stays open and is scored against rolling envelope capacity. Best when priorities shift frequently or you fund in tranches.",
        "Pick one and I'll wire your goals, envelopes, and intake rules to that cadence. You can switch later — it just triggers a one-time replan.",
      ],
    },
  ],
  "Use an annual plan": [
    { role: "user", text: "Use an annual plan." },
    {
      role: "ai",
      paragraphs: [
        "Annual plan locked in. I've set the cadence to **fiscal-year baseline** — intake closes after the funded set is committed, and mid-year changes require a formal replan. Goals, envelopes, and scoring rules are now wired to that cadence.",
        "With the cadence set, the most leveraged next move is to **stand up the intake form**. Everything you've configured — themes, OKRs, envelopes, guardrails, scoring — flows directly into the form so submitters land on the right fields the first time.",
      ],
    },
    {
      role: "ai",
      paragraphs: [
        "Here's where I'd go from here. The first one is the critical path — the others can run in parallel.",
      ],
      nextSteps: [
        { icon: "form", label: "Built your intake form and created an agent to monitor and track it", detail: "Pre-configure intake against your goals, envelopes, guardrails, and scoring model so submitters get the right fields the first time. Nothing else can move until this is live.", featured: true, featuredNote: "Critical path — every other step depends on the form being live." },
        { icon: "calendar", label: "Set intake open / close dates", detail: "Lock the submission window against the fiscal calendar so portfolio leads know when requests are due and reviewers know when scoring begins." },
        { icon: "network", label: "Connect Smartsheet portfolios", detail: "Sync active projects so Arc can check incoming intake against in-flight work for duplicates, dependencies, and budget conflicts." },
      ],
    },
  ],
  "Use a continuous plan": [
    { role: "user", text: "Use a continuous plan." },
    {
      role: "ai",
      paragraphs: [
        "Continuous plan locked in. I've set the cadence to **rolling quarterly re-baseline** — intake stays open year-round and submissions are scored against rolling envelope capacity rather than an annual lock.",
        "With the cadence set, the most leveraged next move is to **stand up the intake form** so submissions can start flowing against your themes, envelopes, and scoring model.",
      ],
    },
    {
      role: "ai",
      paragraphs: [
        "Here's where I'd go from here. The first one is the critical path — the others can run in parallel.",
      ],
      nextSteps: [
        { icon: "form", label: "Built your intake form and created an agent to monitor and track it", detail: "Pre-configure intake against your goals, envelopes, guardrails, and scoring model so submitters get the right fields the first time. Required before continuous intake can open.", featured: true, featuredNote: "Critical path — required before continuous intake can open." },
        { icon: "calendar", label: "Set intake open / close dates", detail: "Confirm the quarterly checkpoint dates when Arc re-scores the open backlog against rolling envelope capacity." },
        { icon: "network", label: "Connect Smartsheet portfolios", detail: "Sync active projects so Arc can continuously check incoming intake against in-flight work for duplicates, dependencies, and budget conflicts." },
      ],
    },
  ],
  "Show me how Arc works": [
    { role: "user", text: "Walk me through how Arc works." },
    {
      role: "ai",
      paragraphs: [
        "Arc runs your planning cycle through four stages. Each stage produces an artifact you review and approve before moving on — nothing goes live without your sign-off.",
      ],
      artifact: {
        title: "Arc planning process",
        subtitle: "3 phases · You're in Phase 1",
        type: "phases",
        phases: [
          {
            num: 1,
            title: "Setup & Config",
            status: "active",
            steps: [
              { title: "Strategic Goals & Investment Parameters", desc: "Define org-level goals, investment envelopes (Run/Grow/Transform/ESG), and budget allocation across envelopes", details: "Anchor the year by setting the strategic outcomes the organization is funding toward, then translate them into envelopes (Run / Grow / Transform / ESG) with a target % allocation each. These envelopes become the cap-and-floor structure every downstream decision is measured against — no project can be funded if it pushes an envelope outside its agreed band." },
              { title: "Portfolio Setup", desc: "Define portfolios: name, owner, alignment to strategic goals and investment envelopes", details: "Stand up each portfolio with a single accountable owner, the strategic goals it ladders to, and the envelopes it can draw from. This is also where you set portfolio-level budget targets and capacity assumptions so intake later in the year has a frame to plug into." },
              { title: "Governance & Standards Config", desc: "Project blueprint, required metadata fields, scoring framework and weights, guardrails, intake rules", details: "Lock in the rules of the game before intake opens: the project blueprint (required fields, lifecycle stages), the scoring model (criteria + weights), guardrails (min/max envelope %, reserve, FTE caps), and intake rules (who can submit, what's required, approval routing). Done well, this prevents 80% of mid-year disputes." },
            ],
          },
          {
            num: 2,
            title: "Plan & Commit",
            status: "locked",
            steps: [
              { title: "Intake", desc: "Requests submitted against the blueprint; AI validates completeness and flags guardrail risks before scoring", details: "Submitters fill the standard project blueprint. Arc validates required metadata, checks for duplicates, and pre-flags any guardrail risk (envelope overrun, capacity conflict, missing sponsor) so reviewers don't waste cycles on incomplete or non-compliant requests." },
              { title: "Score & Prioritize", desc: "RICE pre-filter + weighted criteria applied; projects ranked; cut line drawn", details: "A RICE pre-filter knocks out low-signal requests, then your weighted scoring model ranks what's left. The system draws a tentative cut line based on available envelope capacity — everything above the line is a fund candidate, everything below is held for scenario testing." },
              { title: "Scenario Planning", desc: "Model constraint scenarios (budget, capacity, strategic mix) before committing", details: "Run what-ifs against the ranked list: what changes if the Transform envelope is cut 10%? If we add 5 FTE to a key portfolio? If we re-weight strategic alignment? Compare scenarios side-by-side on outcome mix, risk profile, and envelope health before locking anything." },
              { title: "Funding & Baseline Lock", desc: "Guardrail checks run, conflicts resolved, funded set committed and locked as the execution baseline", details: "Final guardrail sweep across the chosen scenario, conflicts resolved with sponsors, then the funded set is committed and locked as the execution baseline. Everything from this point measures actuals against this baseline." },
            ],
          },
          {
            num: 3,
            title: "Monitor & Adjust",
            status: "locked",
            steps: [
              { title: "Execution Monitoring", desc: "Actuals tracked against the locked baseline; drift, variance, and health surfaced proactively", details: "Live actuals (spend, schedule, scope, FTE) are continuously compared to baseline. Arc surfaces drift, variance trends, and portfolio-level health signals before they become escalations — so leadership sees problems while there's still time to act." },
              { title: "Replanning", desc: "Course correction when reality diverges from plan; scenarios re-run against live data", details: "When drift becomes material — a portfolio is over envelope, a strategic goal has slipped, capacity has changed — Arc re-runs scenario planning against live data so you can rebalance the funded set without starting the cycle from scratch." },
            ],
          },
        ],
      },
    },
  ],
  "Build the intake form": [
    { role: "user", text: "Build the intake form." },
    {
      role: "ai",
      paragraphs: [
        "Done. Your intake form is pre-configured against your themes, OKRs, investment parameters, and scoring model — submitters will be guided through every field with parameter context inline. Review on the right and edit any field before you share it.",
      ],
      artifact: {
        title: "Project Intake Form",
        subtitle: "Pre-configured from your themes, OKRs & investment parameters",
        type: "intake_form",
        banner: "Based on your Strategic Framework, we've created this intake form for you. Fields and parameters are pre-configured from your themes, OKRs, and investment parameters.",
        sections: [
          {
            id: "identity", title: "Initiative Identity", icon: "target",
            fields: [
              { label: "Initiative Name", required: true, type: "text", placeholder: "e.g., Ambient Clinical Documentation Pilot" },
              { label: "Investment Type", required: true, type: "select", placeholder: "Select type", helper: "Parameter: Investment Mix — Run 55% / Change 30% / Grow 15%", half: true },
              { label: "Requested Start Quarter", required: true, type: "select", placeholder: "Select quarter", half: true },
              { label: "Estimated Duration (months)", required: true, type: "text", placeholder: "e.g., 18", half: true },
              { label: "Portfolio", required: true, type: "select", placeholder: "Select portfolio", half: true },
              { label: "Submitter Name", required: true, type: "text", placeholder: "e.g., Dr. Sarah Chen" },
            ],
          },
          {
            id: "alignment", title: "Strategic Alignment", icon: "target",
            badge: "Parameter: ≥90% spend aligned to OKRs",
            fields: [
              { label: "Primary OKR Alignment", required: true, type: "select", placeholder: "Select primary OKR" },
              { label: "Strategic Alignment Rationale", required: true, type: "textarea", placeholder: "Explain how this initiative supports the selected OKR and strategic themes..." },
              { label: "Innovation Horizon", type: "select", placeholder: "Select horizon", helper: "Parameter: Horizon mix — H1 60% / H2 30% / H3 10%. Innovation (H3) capped at ≤15%." },
            ],
          },
          {
            id: "financial", title: "Financial Impact", icon: "dollar",
            badge: "Total Budget: $300M",
            fields: [
              { label: "Estimated Total Budget ($M)", required: true, type: "text", placeholder: "e.g., 5.2", helper: "Parameter: Single initiative cap ≤10% ($30M)", half: true },
              { label: "CapEx / OpEx Split", required: true, type: "select", placeholder: "Select split", helper: "Parameter: CapEx ≤35% / OpEx ≥65%", half: true },
              { label: "Funding Source", required: true, type: "select", placeholder: "Select source", half: true },
              { label: "Benefit Type", required: true, type: "select", placeholder: "Select benefit", half: true },
            ],
          },
          {
            id: "capacity", title: "Capacity & Resources", icon: "users",
            badge: "Total Capacity: 3,000 FTEs",
            fields: [
              { label: "Estimated FTEs Required", required: true, type: "text", placeholder: "e.g., 14", helper: "Parameter: Target utilization 82% / Max 90%", half: true },
              { label: "Critical Roles Required", type: "text", placeholder: "e.g., Data Scientist, Clinical Analyst, PM", helper: "Parameter: Critical role utilization ≤85%", half: true },
              { label: "Vendor / contractor involvement required", type: "checkbox", helper: "Parameter: External vendor spend ≤30% · Contractor mix ≤25%" },
            ],
          },
          {
            id: "risk", title: "Risk & Delivery Complexity", icon: "alert",
            fields: [
              { label: "Dependency Count", type: "text", placeholder: "e.g., 3", helper: "Parameter: ≤5 upstream dependencies", third: true },
              { label: "Integration Complexity (1-10)", type: "text", placeholder: "e.g., 6", helper: "Parameter: Score ≤7/10", third: true },
              { label: "Primary Risk Type", type: "select", placeholder: "Select risk", third: true },
              { label: "Patient Impact Level", required: true, type: "select", placeholder: "Select impact", half: true },
              { label: "Has regulatory / compliance impact", type: "checkbox", helper: "Parameter: Compliance floor ≥15%", half: true },
            ],
          },
          {
            id: "outcomes", title: "Expected Outcomes", icon: "shield",
            badge: "Parameter: Stop-loss at <70% KPI after 2 quarters",
            fields: [
              { label: "KPIs Impacted", required: true, type: "text", placeholder: "e.g., 30-day readmission rate" },
              { label: "Baseline Value", type: "text", placeholder: "e.g., 14.5% readmission", half: true },
              { label: "Target Value", type: "text", placeholder: "e.g., 10% readmission", half: true },
            ],
          },
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Your intake form is live. Here's what I'd do next:",
      ],
      nextSteps: [
        { icon: "network", label: "Connect portfolios and score existing projects against strategic plan", detail: "Sync active projects so I can flag duplicates, dependencies, and budget conflicts against incoming submissions before they're scored.", featured: true, featuredNote: "Recommended next step — gives every submission context against in-flight work." },
        { icon: "share", label: "Share intake form", detail: "Send the link to portfolio leads, theme owners, and PMs so they can start submitting." },
      ],
    },
  ],

  // ── Day 7 (chat 13) — step-by-step recap-driven flow ──
  "Review the 17 new intake proposals": [
    { role: "user", text: "Show me the 17 new intake proposals." },
    {
      role: "ai",
      paragraphs: [
        "Here's everything that came in this cycle, grouped by theme.",
      ],
      bullets: [
        { label: "Digital Transformation — 6 proposals · $18.2M requested (over $14M cap by $4.2M)", detail: "EHR Platform Core Infrastructure · Clinical Data Warehouse · Telehealth Phase 2 · Patient Feedback Analytics · IT Asset Discovery · Contract Lifecycle Tool" },
        { label: "Patient Safety & Clinical Excellence — 4 proposals · $7.1M (within cap)", detail: "Sepsis Detection Tool · HAI Surveillance Upgrade · Surgical Safety Checklist Tool · Medication Reconciliation Automation" },
        { label: "Operational Excellence — 5 proposals · $9.8M (within cap)", detail: "OR Scheduling System · Supply Chain Vendor Consolidation · Outpatient Referral Automation · Revenue Cycle Analytics · Facilities Energy Optimization" },
        { label: "Workforce Resilience — 2 proposals · $3.8M (well within cap)", detail: "Staff Retention Analytics · Leadership Development Track" },
      ],
      paragraphs2: [
        "I've added the 17 new submissions to the intake sheet alongside the **45 active projects** already running across your connected portfolios. **62 active + pending** in view — weighted scoring model applied with the cut line drawn against your **$42M FY27 envelope** ($35.7M spendable after reserve): 54 projects sit above the line; **8 fall below**.",
      ],
      artifact: {
        title: "Weighted Prioritization — FY27 Intake Sheet",
        subtitle: "Cut line drawn against $42M envelope · 54 above · 8 below",
        type: "intake_sheet",
        totalLabel: "62 projects · 8 below cut line",
        showCut: true,
        hideRejected: true,
        cutScore: 53,
        rows: INTAKE_REVIEW_ROWS,
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Now that the cut line is drawn, here's what I'd recommend tackling next:",
      ],
      nextSteps: [
        { icon: "layers", label: "Review 3 scenarios to pressure-test your cut line", detail: "Compare three pre-modeled funding scenarios (A/B/C) against budget, capacity, and guardrails before locking the plan.", featured: true, featuredNote: "Recommended next step — pressure-test the cut line before locking." },
        { icon: "review", label: "Implement and create baseline", detail: "Lock the current cut line as the FY27 baseline plan and publish it as the active plan of record." },
        { icon: "settings", label: "Edit weighting criteria", detail: "Adjust the criteria weights (strategic alignment, KR linkage, risk, complexity) and re-rank if the cut line isn't sitting where you'd expect." },
      ],
    },
  ],

  "Prioritize using weighting criteria": [
    { role: "user", text: "Prioritize using weighting criteria." },
    {
      role: "ai",
      paragraphs: [
        "Applied your weighted scoring model — strategic alignment, KR linkage, risk, and complexity — across every project in view. The cut line is drawn against your **$42M FY27 envelope** ($35.7M spendable after reserve): 54 projects sit above the line; **8 fall below** — a mix of in-review proposals and a handful of currently-active approved projects flagged for scenario review.",
      ],
      artifact: {
        title: "Weighted Prioritization — FY27 Intake Sheet",
        subtitle: "Cut line drawn against $42M envelope · 54 above · 8 below",
        type: "intake_sheet",
        totalLabel: "62 projects · 8 below cut line",
        showCut: true,
        hideRejected: true,
        cutScore: 53,
        rows: INTAKE_REVIEW_ROWS,
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Now that the cut line is drawn, here's where I'd go next:",
      ],
      nextSteps: [
        { icon: "layers", label: "Show me recommended scenarios", detail: "Compare three pre-modeled funding scenarios (A/B/C) against budget, capacity, and guardrails.", featured: true, featuredNote: "Recommended next step — pressure-test the cut line before locking." },
        { icon: "settings", label: "Edit weighting criteria", detail: "Adjust the criteria weights and re-rank if the cut line isn't sitting where you'd expect." },
        { icon: "alert", label: "Resolve Digital Transformation overage", detail: "Six new proposals total $18.2M against a $14M cap. The plan won't close cleanly until this $4.2M is reconciled." },
      ],
    },
  ],

  "Show me the scores": [
    { role: "user", text: "Show me the scores" },
    {
      role: "ai",
      paragraphs: [
        "Scored and ranked. Three tiers — recommended (80+), conditional (60–79), deferred (below 60). Every row has a rationale.",
        "Funding the recommended tier uses **48% of your $35.7M spendable envelope** and leaves $18.7M for conditionals.",
      ],
      artifact: {
        title: "Ranked list — 17 proposals scored",
        subtitle: "Weighted scoring model · rationale per row",
        type: "prioritization_table",
        sections: [
          {
            label: "RECOMMENDED — Score 80+",
            status: "green",
            projects: [
              { rank: 1, name: "EHR Platform Core Infrastructure", theme: "Digital Transform.", owner: "L. Torres", budget: "$5.4M", score: 94, rec: "Fund", rationale: "Foundational infrastructure for every Digital Transformation objective. Vendor confirmed, scope locked." },
              { rank: 2, name: "Sepsis Detection Tool", theme: "Patient Safety", owner: "Dr. Reyes", budget: "$2.1M", score: 92, rec: "Fund", rationale: "18% modeled mortality reduction. Vendor proven at 3 peer systems. Clean proposal." },
              { rank: 3, name: "Staff Retention Analytics", theme: "Workforce", owner: "M. Webb", budget: "$2.1M", score: 88, rec: "Fund", rationale: "Maps directly to turnover KR. Pilot data validated by HR." },
              { rank: 4, name: "OR Scheduling System", theme: "Operational Eff.", owner: "D. Chen", budget: "$2.8M", score: 86, rec: "Fund", rationale: "Vendor selection complete. Strong KR alignment to OR turnaround." },
              { rank: 5, name: "HAI Surveillance Upgrade", theme: "Patient Safety", owner: "Dr. Reyes", budget: "$1.8M", score: 84, rec: "Fund", rationale: "Current system end-of-life Q2. Time-bound urgency." },
              { rank: 6, name: "Telehealth Phase 2", theme: "Digital Transform.", owner: "L. Torres", budget: "$2.6M", score: 82, rec: "Fund", rationale: "Phase 1 met adoption threshold. Conditional release if Q2 capacity exceeds plan." },
            ],
          },
          {
            label: "CONDITIONAL — Score 60–79",
            status: "amber",
            projects: [
              { rank: 7, name: "Clinical Data Warehouse", theme: "Digital Transform.", owner: "L. Torres", budget: "$3.2M", score: 76, rec: "Conditional", rationale: "Foundational for Year 2 initiatives. KR alignment indirect." },
              { rank: 8, name: "Supply Chain Vendor Consolidation", theme: "Operational Eff.", owner: "D. Chen", budget: "$2.2M", score: 74, rec: "Conditional", rationale: "Solid financial case. Vendor timeline aggressive." },
              { rank: 9, name: "Leadership Development Track", theme: "Workforce", owner: "M. Webb", budget: "$1.7M", score: 71, rec: "Conditional", rationale: "Pipeline KR alignment. H2 budget gateable on H1 enrollment." },
              { rank: 10, name: "Surgical Safety Checklist Tool", theme: "Patient Safety", owner: "Dr. Reyes", budget: "$1.6M", score: 69, rec: "Conditional", rationale: "Important but no deadline. Compatible with existing workflow." },
              { rank: 11, name: "Outpatient Referral Automation", theme: "Operational Eff.", owner: "D. Chen", budget: "$2.0M", score: 65, rec: "Conditional", rationale: "Workflow scope still being defined by Ambulatory team." },
              { rank: 12, name: "Medication Reconciliation Automation", theme: "Patient Safety", owner: "Dr. Reyes", budget: "$1.6M", score: 62, rec: "Conditional", rationale: "Pharmacy KR connection clear. Integration complexity moderate." },
            ],
          },
          {
            label: "DEFERRED — Score below 60",
            status: "red",
            projects: [
              { rank: 13, name: "Patient Feedback Analytics", theme: "Digital Transform.", owner: "L. Torres", budget: "$2.4M", score: 58, rec: "Defer", rationale: "Overlaps with existing CX platform. KR alignment weak." },
              { rank: 14, name: "IT Asset Discovery", theme: "Digital Transform.", owner: "L. Torres", budget: "$2.6M", score: 54, rec: "Defer", rationale: "Operational maintenance. No KR alignment." },
              { rank: 15, name: "Contract Lifecycle Tool", theme: "Digital Transform.", owner: "L. Torres", budget: "$2.0M", score: 51, rec: "Defer", rationale: "Procurement efficiency. No theme objective alignment." },
              { rank: 16, name: "Revenue Cycle Analytics", theme: "Operational Eff.", owner: "D. Chen", budget: "$1.6M", score: 49, rec: "Defer", rationale: "Existing tools cover 80% of stated scope." },
              { rank: 17, name: "Facilities Energy Optimization", theme: "Operational Eff.", owner: "D. Chen", budget: "$1.2M", score: 44, rec: "Defer", rationale: "Capital project. Belongs in facilities budget, not strategic envelope." },
            ],
          },
        ],
        summary: {
          recommended: { count: 6, budget: "$17.0M" },
          conditional: { count: 6, budget: "$9.8M" },
          deferred: { count: 5, budget: "$11.8M" },
          envelope: "$35.7M",
          ifAllConditionals: "$26.8M — within envelope. $8.9M headroom.",
        },
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Want me to break down any specific score? Just ask by project name. Otherwise, the natural next step is to pressure-test these against the budget and capacity guardrails.",
      ],
      actions: [
        { label: "Show me recommended scenarios", style: "ghost" },
        { label: "Build a custom scenario", style: "ghost" },
      ],
    },
  ],

  "Show me recommended scenarios": [
    { role: "user", text: "Show me recommended scenarios" },
    {
      role: "ai",
      paragraphs: [
        "Three pre-modeled scenarios. Each does something different to the plan.",
      ],
      artifact: {
        title: "Scenario comparison — A, B, C",
        subtitle: "Three baselines compared against the 45 scored projects across 7 portfolios",
        type: "scenario_comparison",
        scenarios: [
          { id: "A", label: "A — Recommended ($42M)" },
          { id: "B", label: "B — Conservative ($38M)" },
          { id: "C", label: "C — Accelerated ($46M)" },
        ],
        budget: {
          cols: ["", "A — Recommended", "B — Conservative", "C — Accelerated"],
          rows: [
            ["Total envelope", "$42.0M", "$38.0M", "$46.0M"],
            ["Reserve held", "$6.3M", "$5.7M", "$6.9M"],
            ["Spendable", "$35.7M", "$32.3M", "$39.1M"],
            ["Funded budget", "$36.1M", "$34.9M", "$37.8M"],
            ["Projects funded", "37 of 45", "32 of 45", "43 of 45"],
            ["Projects cut", "8", "13", "2"],
            ["Portfolios covered", "7 of 7", "7 of 7", "7 of 7"],
            ["Q2 FTE peak", "92%", "85%", "108%"],
            ["Guardrail conflicts", { t: "None", c: "green" }, { t: "Workforce thin", c: "amber" }, { t: "FTE cap breach", c: "red" }],
            ["vs. plan as scored", { t: "Recommended", c: "green" }, { t: "–5 projects", c: "amber" }, { t: "+6 projects, conflict", c: "red" }],
          ],
        },
        projectDelta: {
          a: { label: "Funds the top 37 of 45 scored projects across all 7 portfolios. Cuts 8 of the lowest-scoring active projects (scores 35–42) — pure operational hygiene work with no KR linkage. Recommended baseline.", projects: null },
          b: { label: "Funds the top 32 of 45 scored projects. Cuts 13 — the 8 lowest plus 5 mid-low scorers. Workforce Resilience and Governance & Risk thin to skeleton coverage; saves $1.2M but loses retention and compliance redundancy.", projects: null },
          c: { label: "Funds 43 of 45 scored projects. Pulls in nearly everything but breaks the FTE guardrail in Q2 (108% utilization). Only the two lowest-scoring projects fall below the cut line.", projects: null },
        },
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Two things to surface now: Scenario C breaks the FTE guardrail the CFO set — you can override it, but not without a reason that overrides the guardrail. Scenarios A and B both show a Q2 capacity peak where EHR Platform Core, OR Scheduling, and Telehealth Phase 2 all land together. None of A, B, or C may be exactly what you want — if you'd rather pull specific levers, here's where to go next:",
      ],
      nextSteps: [
        { icon: "settings", label: "Build a custom scenario", detail: "Set your own caps and constraints — useful before locking the Digital Transformation overage decision." },
        { icon: "alert", label: "Resolve Digital Transformation overage", detail: "Six new proposals total $18.2M against a $14M cap. Reconciling the $4.2M is the cleanest way to make Scenario A close." },
        { icon: "review", label: "Lock Scenario A as the working baseline", detail: "Funds all 6 recommended + top 5 conditionals, no guardrail breach. Saves it as the plan-of-record so subsequent edits are tracked as deltas." },
      ],
    },
  ],

  "Build a custom scenario": [
    { role: "user", text: "Build a custom scenario" },
    {
      role: "ai",
      paragraphs: [
        "What constraints do you want me to model against? You can set any combination of these:",
      ],
      bullets: [
        { label: "Total budget", detail: "Default $42M · range $30M–$50M" },
        { label: "Theme caps", detail: "Per-theme budget ceilings · defaults to current theme caps" },
        { label: "Must-fund projects", detail: "Force inclusion even if conditional" },
        { label: "Must-defer projects", detail: "Force exclusion even if recommended" },
        { label: "Capacity ceiling", detail: "Max quarterly FTE utilization · default 100%" },
      ],
      paragraphs2: [
        "When you set the constraints and hit Model scenario, I'll return a fourth column next to A/B/C showing what your plan looks like under those conditions — same nine dimensions, side by side.",
        "You can tell me in plain language too. Something like \"cap Digital Transformation at $12M, force Medication Reconciliation in, keep capacity under 100%\" — I'll translate it to the form and model it.",
      ],
    },
  ],
  "Show me the new EPMO dashboard": [
    { role: "user", text: "Show me the new EPMO dashboard" },
    {
      role: "ai",
      paragraphs: [
        "**At a glance:** 41 active projects, 3 on track, 17 at risk, 21 off track. **$29.8M spent of $63M committed** for the year.",
        "That's noisier than it sounds — \"off track\" means schedule slip past 2 weeks or budget variance over 10%, not crisis. Most off-track projects have a known cause and an owner working it.",
        "The signal worth naming: **23 projects are projecting over 110% of budget.** Portfolio is trending to $47.7M vs $42M planned — about $5.7M over. That's the one pattern I'd pull on today.",
      ],
      artifact: {
        title: "EPMO Dashboard — Daily operating view",
        subtitle: "Live · refreshed from overnight sync",
        type: "epmo_dashboard",
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Everything on the dashboard is clickable. RAG segments filter the attention table. Portfolio bars drill into that portfolio's projects. Radar dimensions open their own focused views.",
      ],
      actions: [
        { label: "Dive deeper on the budget issue", desc: "Pull on the $4.6M variance — see which 4 projects drive 30% of the overrun and what's driving each one.", style: "primary" },
        { label: "Show me capacity", desc: "Open the capacity view — 105.6% utilization across the portfolio, with three roles over-allocated.", style: "ghost" },
      ],
    },
    { role: "user", text: "Dive deeper on the budget issue" },
    {
      role: "ai",
      paragraphs: [
        "Here's the shape of it.",
        "**$24.1M consumed YTD of $34.0M planned** — 71% through the budget with 8 months left. Trending to **$38.6M** full-year — that's $4.6M over plan.",
        "23 projects are projecting over 110% of budget. **Four of them are doing most of the damage:**",
      ],
      bullets: [
        { label: "EHR System Consolidation & Optimization", detail: "$2.5M planned → $2.89M projected (+16%)" },
        { label: "Healthcare Cybersecurity & Zero Trust", detail: "$1.8M → $2.06M (+14%)" },
        { label: "Patient Portal & Digital Front Door", detail: "$3.95M → $4.48M (+13%)" },
        { label: "HR & Workforce Management System Modernization", detail: "$0.9M → $1.01M (+12%)" },
      ],
      paragraphs2: [
        "Together they account for **$1.32M of the $4.6M variance** — just under 30%.",
      ],
      artifact: {
        title: "Budget Report — Cross-portfolio spend analysis",
        subtitle: "$24.1M of $34.0M planned · 71% consumed · 23 projects over 110%",
        type: "budget_report",
      },
    },
    {
      role: "ai",
      paragraphs: [
        "I have a read on this, but it's worth holding for one more beat. The same four projects showing up at the top of this list are also showing up in the capacity report — they're over-staffed relative to plan **and** over-budget. More people on the project, more money spent, and they're still off-track on schedule.",
        "That's not a spending problem, it's a scope or execution problem. Let me show you the capacity side before we decide what to do about it.",
      ],
      actions: [
        { label: "Yeah show me capacity", style: "primary" },
      ],
    },
    { role: "user", text: "Yeah show me capacity" },
    {
      role: "ai",
      paragraphs: [
        "Here it is. This is where the pattern gets clearer.",
        "**266 FTEs active, 252 planned — 105.6% utilized** across the portfolio. Variance +14 FTEs. Three roles are over-allocated:",
      ],
      bullets: [
        { label: "Security Analyst", detail: "+8 over plan" },
        { label: "UX Designer", detail: "+6 over plan" },
        { label: "DevOps Engineer", detail: "+3 over plan" },
      ],
      paragraphs2: [
        "16 projects have staffing variances. The top four over-allocated projects are — predictably — **the same four driving the budget overrun**:",
      ],
      artifact: {
        title: "Capacity Report — Cross-portfolio FTE allocation",
        subtitle: "266 FTEs · 105.6% utilized · 16 projects with capacity issues",
        type: "capacity_report",
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Here's the read now that you've seen both sides:",
        "Those four projects aren't over budget because they're doing more work. They're over budget because they're doing **the same work with more people**, and they're still slipping. EHR and Cybersecurity are both at 140% FTE utilization and still rated \"At Risk\" in the budget report. Adding headcount isn't closing the gap.",
        "This is the one pattern I'd pull on today. **Three options:**",
      ],
      bullets: [
        { label: "Option 1 — Execution review on the top four", detail: "Don't touch staffing yet. Get the four project owners (Carla Nguyen on EHR, the CISO on Cybersecurity, the UX lead on Patient Portal, the HR Systems lead) in a room next week. Ask what's actually blocking delivery. The capacity data suggests it's not a people problem — it's probably scope creep or a dependency issue that headcount can't solve." },
        { label: "Option 2 — Re-baseline the four projects", detail: "Accept the budget and schedule variance, update the plan, notify the sponsor group. Fast. Honest. But it doesn't solve why they're slipping." },
        { label: "Option 3 — Staffing freeze + scope review", detail: "Hard stop on adding people to these four projects. Scope review triggered. Most disruptive but gets to root cause if you believe something structural is wrong." },
      ],
      paragraphs2: [
        "**My read: Option 1.** The data says headcount isn't the lever. Find out what is before moving money or people.",
      ],
      actions: [
        { label: "Draft agenda for execution review with the four owners", style: "primary" },
        { label: "Export budget + capacity data for the review packet", style: "amber" },
      ],
    },
    { role: "user", text: "status" },
    {
      role: "ai",
      paragraphs: [
        "Where we landed today:",
      ],
      artifact: {
        title: "Session status — Day 45",
        subtitle: "Execution snapshot · 7 done · 2 pending",
        type: "readiness",
        pct: 78,
        rows: [
          { s: "green", l: "EPMO Dashboard reviewed", n: "Live view, refreshes with overnight sync" },
          { s: "green", l: "Budget issue surfaced", n: "$4.6M over plan · 4 projects driving 30% of the variance" },
          { s: "green", l: "Capacity issue surfaced", n: "105.6% utilization · same 4 projects over-staffed" },
          { s: "green", l: "Cross-cutting pattern identified", n: "Over-staffing isn't buying schedule on the top four" },
          { s: "green", l: "Three options framed for the top four", n: "Execution review recommended" },
          { s: "amber", l: "Execution review agenda — not drafted", n: "Say the word" },
          { s: "amber", l: "Review packet export — not generated", n: "Say the word" },
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Useful session. The pattern's visible now, and the next move is a scheduled conversation with four people rather than a plan revision. That's the cheaper path if the data's right.",
      ],
    },
  ],
};

const CONVERSATIONS: Record<string, any[]> = {
  "1": [
    { role: "user", text: "I need to set up our strategy planning process for next year. My boss wants everything ready for intake by end of month and I honestly don't know where to start." },
    {
      role: "ai",
      paragraphs: [
        "You're in the right place — and end of month is doable if we move in the right order. I've seen teams get into trouble here by jumping straight into writing objectives before the foundational pieces are in place. Let's avoid that.",
        "There are three things I need from you before we can build anything useful:",
      ],
      bullets: [
        { label: "Connect your portfolios.", detail: "Before we set any budget or headcount guardrails, I need to see what's actually running. If we set a cap of 25 active projects without knowing you already have 31 in flight, the guardrail is fiction from day one." },
        { label: "Upload your strategy document.", detail: "If your leadership team has already defined themes or goals for next year — even a rough deck or a Word doc — upload it. I'll extract what's there and draft it into a workable structure. If nothing exists yet, we'll build from scratch." },
        { label: "Define your investment guardrails.", detail: "Total budget, FTE capacity, reserve requirements. If you have a financial plan document, upload that too and I'll pull the numbers directly rather than asking you to retype them." },
      ],
      paragraphs2: [
        "The order matters: portfolios first, then goals, then guardrails. Each one feeds the next.",
        "Where do you want to start?",
      ],
      artifact: {
        title: "Setup steps",
        subtitle: "3 steps · portfolios → goals → guardrails",
        type: "steps",
        steps: [
          { num: 1, title: "Connect portfolios", desc: "Link your Smartsheet portfolios so Arc can read live project data", cta: "Connect", status: "active" },
          { num: 2, title: "Upload strategy document", desc: "Upload themes, goals, or a planning deck for extraction", cta: "Upload", status: "locked" },
          { num: 3, title: "Configure guardrails", desc: "Set budget caps, FTE limits, and reserve requirements", cta: "Configure", status: "locked" },
        ],
      },
    },
    { role: "user", text: "Ok. We have four portfolios in Smartsheet. Capital Projects, Clinical Operations, Workforce & HR, and IT & Infrastructure. How do I connect them?" },
    {
      role: "ai",
      paragraphs: [
        "Perfect — all four are supported. Here's how to connect them:",
        "In the left panel, go to Integrations → Smartsheet. You'll authenticate once with your Smartsheet credentials and then I'll show you a list of all the workspaces you have access to. Select the four portfolios you just named and confirm. The sync takes about two minutes.",
        "A few things to know before you do:",
      ],
      bullets: [
        { label: "I'll pull in project names, owners, current status, budget allocations, and FTE assignments.", detail: "I won't pull task-level detail — just the portfolio-level data I need to set guardrails and flag conflicts later." },
        { label: "Nothing gets written back to Smartsheet.", detail: "This is read-only." },
        { label: "If any of your portfolios have projects that are archived or on hold, they'll come in too.", detail: "I'll flag those separately so they don't inflate your active project count." },
      ],
      paragraphs2: [
        "Go ahead and connect them and come back here when it's done. I'll confirm what I found.",
      ],
    },
    { role: "user", text: "Done. All four are connected." },
    {
      role: "ai",
      paragraphs: [
        "Got them. Here's what came in:",
      ],
      artifact: {
        title: "Connected portfolios — initial sync",
        subtitle: "4 portfolios · 274 projects total",
        type: "table",
        cols: ["Portfolio", "Active projects", "Budget allocated", "Notes"],
        rows: [
          ["Capital Projects", "142", "$18.4M", "No issues"],
          ["Clinical Operations", "67", "$9.2M", "No issues"],
          ["Workforce & HR", "34", "$4.1M", { badge: "3 projects have no owner assigned", color: "amber" }],
          ["IT & Infrastructure", "31", "Not tagged", { badge: "Zero projects mapped to a strategic theme", color: "red" }],
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Two things I want to flag before we move on:",
      ],
      bullets: [
        { label: "Workforce & HR has 3 projects with no owner.", detail: "That's not blocking, but it means if those projects surface later in prioritization, nobody is accountable for them. Worth cleaning up in Smartsheet before intake." },
        { label: "IT & Infrastructure has no strategic alignment at all.", detail: "31 projects, none of them tagged to a theme. That's not uncommon this early in the process — but it does mean when we get to prioritization, this entire portfolio will show up as a blind spot. We'll need to map those projects to themes once you've defined them." },
      ],
      paragraphs2: [
        "Neither of these is a blocker today. Just want you to see it now rather than in week three.",
        "Ready to move to step two — uploading your strategy document?",
      ],
    },
    { role: "user", text: "Yes. Uploading now. It's a PowerPoint from our October planning offsite. Fair warning — it's pretty rough." },
    {
      role: "ai",
      paragraphs: [
        "Rough is fine. I'm looking for signal, not polish.",
      ],
      artifact: {
        title: "strategy-offsite-oct.pptx",
        subtitle: "Analyzing document…",
        type: "upload_progress",
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Done. Here's what I found in the deck:",
      ],
      artifact: {
        title: "Strategy document — extracted content",
        subtitle: "4 themes · 2 partial objectives · 0 KRs",
        type: "strategy_extract",
        themes: ["Digital Transformation", "Patient Safety & Clinical Excellence", "Operational Excellence", "Workforce Resilience"],
        objectives_note: "2 partial objectives found in the deck — both under Digital Transformation. No objectives found for the other 3 themes.",
        krs_note: "None. No measurable KRs were present in the document.",
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Good news and bad news.",
        "**Good news:** you have four named themes and some early thinking on Digital Transformation. That's a real starting point.",
        "**Bad news:** the other three themes are names without substance — no objectives, no KRs, no owners attached. That's not a problem I can solve from this document. Those will need to come from the people who own those themes.",
        "**Here's what I'll do right now:** I'll draft a set of starter objectives and KRs for each theme based on what I know about healthcare organizations at your scale. These are suggestions only — nothing is live until you review and approve them. Think of it as me doing the first draft so your theme owners aren't staring at a blank page.",
        "Want me to generate those drafts?",
      ],
    },
    { role: "user", text: "Yes please. And can you pull in the two objectives that were already in the deck?" },
    {
      role: "ai",
      paragraphs: [
        "Done. Here's what I've drafted:",
      ],
      artifact: {
        title: "Goals — draft view",
        subtitle: "4 themes · all drafts · nothing confirmed until you approve",
        type: "goals_draft",
        themes: [
          {
            s: "gray", name: "Digital Transformation", meta: "2 from deck + 1 AI-drafted · 6 draft KRs", expanded: true,
            objectives: [
              { source: "deck", title: "Objective 1: Complete EHR rollout across all 12 sites by Q3", krs: ["EHR go-live across 12 sites by Q3", "90% clinical staff adoption within 60 days"] },
              { source: "deck", title: "Objective 2: Expand virtual care to 40% of outpatient visits", krs: ["40% outpatient visits virtual by Q4", "Avg wait time under 8 min"] },
              { source: "ai", title: "Objective 3: Establish real-time operational dashboards", krs: ["Real-time dashboards live for all departments", "Zero Tier-1 data outages in H2"] },
            ],
          },
          { s: "gray", name: "Patient Safety & Clinical Excellence", meta: "2 AI-drafted objectives · 4 draft KRs — awaiting your review", expanded: false, objectives: [] },
          { s: "gray", name: "Operational Excellence", meta: "2 AI-drafted objectives · 4 draft KRs — awaiting your review", expanded: false, objectives: [] },
          { s: "gray", name: "Workforce Resilience", meta: "2 AI-drafted objectives · 4 draft KRs — awaiting your review", expanded: false, objectives: [] },
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "A few things I want to flag about these drafts before you review them:",
      ],
      bullets: [
        { label: "The Workforce Resilience objectives I drafted are intentionally conservative.", detail: "There's nothing in your deck that tells me what your organization actually means by workforce resilience — it could be retention, it could be training pipelines, it could be burnout reduction. I've drafted for the most common interpretation but this theme more than any other needs a human to write it. I'd recommend assigning it to whoever put it on the agenda in October." },
        { label: "The Patient Safety KRs I drafted use industry benchmark targets.", detail: "Your actual baseline may be better or worse than those benchmarks — once you connect your outcomes data or tell me your current HAI and sepsis numbers, I can recalibrate them." },
      ],
      paragraphs2: [
        "Don't approve these yet. Review them with your theme owners first. But they should give everyone a running start rather than a blank screen.",
        "Should we move to step three — guardrails?",
      ],
    },
    { role: "user", text: "Yes. I have our FY26 financial plan. Should I upload that or enter numbers manually?" },
    {
      role: "ai",
      paragraphs: [
        "Upload it. If the numbers are in the document I can pull them directly and you won't have to retype anything or risk a transcription error. Manual entry is there as a fallback if the document is too complex for me to parse cleanly.",
      ],
      artifact: {
        title: "Upload financial plan",
        subtitle: "PDF or Excel supported",
        type: "upload_progress",
      },
    },
    { role: "user", text: "Uploaded. It's the CFO's FY26 operating budget." },
    {
      role: "ai",
      paragraphs: [
        "Got it. Here's what I extracted:",
      ],
      artifact: {
        title: "Investment parameters — extracted from FY26 operating budget",
        subtitle: "3 of 5 confirmed · 2 require your input",
        type: "table",
        cols: ["Parameter", "Value", "Source", "Status"],
        rows: [
          ["Total budget", "$42M", "Page 3, FY27 capital allocation table", { badge: "Confirmed", color: "green" }],
          ["Minimum reserve", "15% ($6.3M)", "Page 7, CFO mandate footnote", { badge: "Confirmed", color: "green" }],
          ["Capacity by role", "260 FTEs", "Page 11, workforce plan appendix", { badge: "Confirmed", color: "green" }],
          ["Per-portfolio budget cap", "—", "Not found in document", { badge: "Needs input", color: "amber" }],
          ["Active project count limit", "—", "Not found in document", { badge: "Needs input", color: "amber" }],
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Three of five parameters came through cleanly. The document doesn't explicitly state a per-portfolio budget cap or a maximum active project count — those are typically set by the strategy team rather than the CFO, so that makes sense.",
        "For the two missing ones, I can suggest values based on what you've told me and what I can see in the portfolio data:",
      ],
      bullets: [
        { label: "Per-portfolio budget cap:", detail: "Based on $42M across 7 portfolios with the 15% reserve held back, an even split lands at $5.1M per portfolio. That said, your Digital Transformation portfolio already has $11.4M running against it — a $5.1M cap would immediately create a conflict. I'd recommend either setting it at $12M to give that portfolio room, or explicitly noting that Digital Transformation is exempt from the cap this cycle." },
        { label: "Active project count:", detail: "Your 7 portfolios currently have 45 active projects total. For net new projects entering through intake, based on your 260 FTE capacity and typical project load ratios, somewhere between 6–10 net new projects per portfolio is a reasonable envelope. I'd suggest a soft cap of 8 per portfolio with an exception process rather than a hard block." },
      ],
      paragraphs2: [
        "Do you want to set these or loop in someone from finance first?",
      ],
    },
    { role: "user", text: "I'll set them for now. $12M cap, 8 active projects per portfolio. We can adjust later." },
    {
      role: "ai",
      paragraphs: [
        "Set. Here's where everything stands at the end of this session:",
      ],
      artifact: {
        title: "Setup readiness",
        subtitle: "~40% complete",
        type: "readiness",
        pct: 40,
        rows: [
          { s: "green", l: "Portfolios connected", n: "7 portfolios · 45 projects synced" },
          { s: "amber", l: "Strategic themes defined", n: "4 themes drafted · not yet approved by theme owners" },
          { s: "amber", l: "Objectives & key results", n: "AI drafts ready · awaiting owner review" },
          { s: "green", l: "Investment parameters", n: "5 of 5 configured" },
          { s: "gray", l: "Ready for intake", n: "Complete themes and objectives first" },
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "You've made real progress today. Portfolios are live, guardrails are set, and your theme owners will have a draft to react to rather than a blank page. That's a meaningful head start.",
        "The only thing between you and being ready for prioritization is getting your theme owners to review the objectives I drafted and fill in what I couldn't. Based on your end-of-month intake deadline, I'd suggest getting that done within the next few days — missing KRs were the primary cause of your organization's late intake last year.",
        "A couple of things I'd do tonight before you log off:",
      ],
      bullets: [
        { label: "Assign Workforce Resilience to an owner.", detail: "Right now nobody is attached to that theme. If it goes unassigned it'll still be blank in week two." },
        { label: "Flag the IT & Infrastructure alignment gap to whoever runs that portfolio.", detail: "31 projects with no strategic theme is a prioritization problem waiting to happen. Better to surface it now." },
      ],
      paragraphs2: [
        "Come back tomorrow and I'll have pulled in any updates from the portfolio sync overnight. If you want, send the draft objectives to your theme owners tonight — the sooner they see them the more time they have to push back before the review session.",
      ],
    },
  ],
  "2": [
    { role: "user", text: "Back. What did I miss overnight?" },
    {
      role: "ai",
      paragraphs: [
        "A couple of things changed in your Smartsheet data overnight that are worth knowing before we finish the guardrails.",
      ],
      artifact: {
        title: "Overnight Smartsheet sync — changes detected",
        subtitle: "2 changes · 275 projects total",
        type: "table",
        cols: ["Portfolio", "Change", "Details"],
        rows: [
          ["Capital Projects", "Project P-118 added", "EHR implementation workstream. Owner: unassigned. Budget: $1.2M. Status: Planning."],
          ["Workforce & HR", "Owner assigned", "Sarah Chen added as owner of 'Staff Scheduling Modernization.' 2 projects still unowned."],
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Two things there. The unowned project in Workforce & HR getting an owner is a small win — you're down to 2 unresolved there.",
        "The new project P-118 is more interesting. It's an EHR implementation workstream added to Capital Projects overnight, which puts it squarely in Digital Transformation territory. The reason I'm flagging it now rather than later: you already have a drafted objective in Digital Transformation about launching the EHR platform. If P-118 is running in parallel to that objective with a separate owner and budget, you may be funding the same outcome twice before intake even opens. I'd keep an eye on that one.",
        "Nothing requires action right now. Ready to finish the guardrails?",
      ],
    },
    { role: "user", text: "Yes. Where did we leave off?" },
    {
      role: "ai",
      paragraphs: [
        "Three of five parameters confirmed yesterday. Two still need your input.",
      ],
      artifact: {
        title: "Investment envelope — current state",
        subtitle: "3 of 5 set · spendable ≈$35.7M",
        type: "table",
        cols: ["Parameter", "Value", "Status"],
        rows: [
          ["Total budget", "$42M", { badge: "Confirmed", color: "green" }],
          ["Minimum reserve", "15% / $6.3M", { badge: "Confirmed", color: "green" }],
          ["Capacity by role", "260 FTEs", { badge: "Confirmed", color: "green" }],
          ["Per-portfolio budget cap", "—", { badge: "Needs input", color: "amber" }],
          ["Active project count limit", "—", { badge: "Needs input", color: "amber" }],
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "The two missing ones are the ones that require judgment rather than a document — which is why they didn't come out of the CFO file. Let me give you my read on each and you can tell me where to land.",
        "Per-theme budget cap. This is the ceiling any single theme can spend through intake. With $34M minus the 15% reserve you have $28.9M to allocate across your themes. You have four themes drafted, but two are parked — Workforce Resilience and New Care Models aren't ready yet. If you divide $28.9M across your three active themes you get roughly $9.6M each, which is workable for Patient Safety and Operational Excellence but probably tight for Digital Transformation given what's already running in Capital Projects.",
        "Here's the conflict I want to surface before you set this number:",
      ],
      inline: {
        type: "conflict_callout",
        title: "Digital Transformation budget signal",
        body: "Capital Projects portfolio currently has $18.4M allocated to work that maps to Digital Transformation themes — including the newly added P-118. Combined with the $1.2M P-118 added overnight, Digital Transformation is already at $14.8M against a $14M cap. This doesn't break intake but it means zero new budget headroom for this theme unless P-118 is reconciled first.",
      },
      paragraphs2: [
        "My recommendation is $14M. It gives Digital Transformation room to operate without blowing the envelope, leaves roughly $7–8M each for your other two active themes, and still holds the 15% reserve intact. When Workforce Resilience and New Care Models come online you'll need to revisit — but that's a future problem, not today's.",
        "What do you want to set?",
      ],
      actions: [
        { label: "Set cap at $14M", style: "primary" },
        { label: "Flag for CFO review", style: "ghost" },
      ],
    },
    { role: "user", text: "$14M. That makes sense. What about the project count?" },
    {
      role: "ai",
      paragraphs: [
        "Active project count is about capacity, not budget. This is the limit on how many net new projects can enter through FY27 intake — separate from the 275 already running.",
        "Here's what the portfolio data tells me:",
      ],
      inline: {
        type: "capacity_breakdown",
        rows: [
          { label: "Current FTE capacity", value: "420 roles" },
          { label: "Projects already consuming capacity", value: "275 active" },
          { label: "Estimated available bandwidth for net new intake", value: "38–45 FTEs depending on project mix" },
        ],
        footnote: "Based on average 1.4 FTE per project across your current portfolio.",
      },
      paragraphs2: [
        "At your current average project size, 420 FTEs supporting 275 existing projects leaves meaningful but not unlimited room for new work. Somewhere between 20 and 30 net new projects is the defensible range. Under 20 and you're likely leaving funded objectives with nowhere to go. Over 30 and you start exceeding realistic capacity, especially given two themes still haven't come online yet and will add to the count when they do.",
        "I'd suggest 25. Conservative enough to protect execution quality, high enough that your three active themes can each bring in meaningful new work. You can raise it at mid-cycle review if the parked themes come online and need room.",
      ],
    },
    { role: "user", text: "25 is fine. Lock it in." },
    {
      role: "ai",
      paragraphs: [
        "Done.",
      ],
      artifact: {
        title: "Investment envelope — FY27",
        subtitle: "5 of 5 confirmed",
        type: "table",
        cols: ["Parameter", "Value", "Status"],
        rows: [
          ["Total budget", "$42M", { badge: "Confirmed", color: "green" }],
          ["Minimum reserve", "15% / $6.3M", { badge: "Confirmed", color: "green" }],
          ["Capacity by role", "260 FTEs", { badge: "Confirmed", color: "green" }],
          ["Per-portfolio budget cap", "$12M", { badge: "Confirmed", color: "green" }],
          ["Active project limit", "8 net new per portfolio", { badge: "Confirmed", color: "green" }],
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Envelope is closed. Before we move on I want to run one cross-check — now that all five parameters are set, I can look at your drafted objectives against the guardrails and tell you if anything already conflicts.",
      ],
      inline: {
        type: "processing",
        text: "Checking drafted objectives against confirmed guardrails…",
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Here's what came back:",
      ],
      artifact: {
        title: "Guardrail conflict check",
        subtitle: "Draft objectives vs. confirmed envelope",
        type: "guardrail_check",
        sections: [
          {
            status: "green",
            title: "No conflicts",
            items: [
              { name: "Patient Safety & Clinical Excellence", detail: "2 objectives, 4 KRs. No budget or capacity conflicts detected." },
              { name: "Operational Excellence", detail: "2 objectives, 4 KRs. No conflicts detected." },
            ],
          },
          {
            status: "amber",
            title: "Potential conflict — review recommended",
            items: [
              { name: "Digital Transformation", detail: "3 objectives, 6 KRs. Objective 1 (EHR platform launch) maps to Capital Projects spend currently at $13.6M before any new intake budget is applied. Combined with the $1.2M P-118 added overnight, Digital Transformation is already at $14.8M against a $14M cap. This means zero new budget headroom for this theme unless P-118 is reconciled first." },
            ],
          },
          {
            status: "gray",
            title: "Parked themes — not checked",
            items: [
              { name: "Workforce Resilience", detail: "No objectives to check against. Will run when theme is activated." },
              { name: "New Care Models", detail: "No objectives to check against. Will run when theme is activated." },
            ],
          },
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "The Digital Transformation flag is the one worth resolving before your theme owner gets to work. If P-118 is genuinely the EHR workstream that Objective 1 is describing, it should probably be tagged to this theme and counted against the cap — not floating separately in Capital Projects. If it's a different EHR workstream, it may represent exactly the kind of duplication I flagged this morning.",
        "Either way, someone needs to look at P-118 and make a call.",
      ],
      actions: [
        { label: "Assign P-118 review to theme owner", style: "primary" },
        { label: "Flag for portfolio review", style: "ghost" },
      ],
    },
    { role: "user", text: "Flag it for portfolio review. I'll let the Capital Projects team sort it out before we finalize that theme." },
    {
      role: "ai",
      paragraphs: [
        "**Flagged.** P-118 is marked for portfolio review — it won't block progress on the other two themes and it'll sit in the conflict queue until someone resolves it.",
      ],
      inline: {
        type: "status_update",
        icon: "flag",
        text: "P-118 conflict flagged · Pending portfolio review",
        detail: "Digital Transformation theme remains active and editable — the flag is informational, not a block.",
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Here's where everything stands coming out of this session:",
      ],
      artifact: {
        title: "Setup readiness",
        subtitle: "~65% complete",
        type: "readiness",
        pct: 65,
        rows: [
          { s: "green", l: "Portfolios connected", n: "4 portfolios · 275 projects — synced this morning. 1 new project flagged." },
          { s: "amber", l: "Strategic themes defined", n: "3 of 5 active · 2 parked · 1 conflict flag on Digital Transformation" },
          { s: "amber", l: "Objectives & key results", n: "7 objectives · 14 KRs · working drafts — no owner approvals received yet" },
          { s: "green", l: "Investment envelope & guardrails", n: "5 of 5 parameters confirmed · guardrail check complete · 1 conflict flagged" },
          { s: "gray", l: "Ready for intake", n: "Owner approvals needed on all three active themes before prioritization can begin" },
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "The guardrails are solid. What's left is people work — getting your theme owners to look at the drafted objectives and either approve them, edit them, or push back. That's not something I can do for you.",
        "If you haven't sent the draft objectives to your three active theme owners yet, tonight is the last comfortable moment to do it and still have time for a back-and-forth before the review session.",
        "Come back tomorrow. If any theme owners have touched the drafts overnight I'll have a summary waiting.",
        "A couple of things I'd do tonight before you log off:",
      ],
      bullets: [
        { label: "Assign Workforce Resilience to an owner.", detail: "Right now nobody is attached to that theme. If it goes unassigned it'll still be blank in week two." },
        { label: "Flag the IT & Infrastructure alignment gap to whoever runs that portfolio.", detail: "31 projects with no strategic theme is a prioritization problem waiting to happen. Better to surface it now." },
        { label: "P-118 conflict needs resolution before Digital Transformation is finalized.", detail: "The Capital Projects team needs to determine whether this is a duplicate of the EHR objective or a separate workstream." },
      ],
    },
  ],
  "3": [
    { role: "user", text: "Back. The intake sheet has been open for two days. What came in?" },
    {
      role: "ai",
      paragraphs: [
        "Seventeen project proposals submitted across your four themes. I've already pulled them all from the Smartsheet intake sheet and run them against your scoring model. Before I show you the ranked list, let me show you what came in by theme — because the distribution is uneven in a way worth knowing about before you look at scores.",
      ],
      artifact: {
        title: "Intake submissions — snapshot",
        subtitle: "17 proposals · $38.9M requested · $28.9M available",
        type: "table",
        cols: ["Theme", "Proposals", "Budget requested", "Notes"],
        rows: [
          ["Digital Transformation", "6", "$18.2M", { badge: "Exceeds $14M cap by $4.2M", color: "red" }],
          ["Patient Safety & Clinical Excellence", "4", "$7.1M", { badge: "Within cap", color: "green" }],
          ["Operational Excellence", "5", "$9.8M", { badge: "Within cap", color: "green" }],
          ["Workforce Resilience", "2", "$3.8M", { badge: "Within cap", color: "green" }],
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "The headline is that you have $10M more in requests than you have budget to fund. That's normal — intake almost always oversubscribes. The scoring model is what helps you make defensible decisions about what gets funded and what doesn't.",
        "Want me to walk through how the scoring works before I show you the ranked list?",
      ],
    },
    { role: "user", text: "Yes — briefly. I want to understand what's driving the scores." },
    {
      role: "ai",
      paragraphs: [
        "The model scores each proposal against five criteria weighted to reflect the priorities you set during setup. Here's how it's structured:",
      ],
      artifact: {
        title: "Weighted scoring model — FY27",
        subtitle: "5 criteria · max score 100",
        type: "scoring_model",
        criteria: [
          { name: "Strategic alignment", weight: "30%", desc: "How directly does this project advance one or more of your four approved theme objectives? Scored 1–5 against the specific KRs the project claims to support." },
          { name: "Financial return / impact", weight: "25%", desc: "Estimated value delivered relative to budget requested. For clinical projects, this includes patient outcome improvements." },
          { name: "Execution readiness", weight: "20%", desc: "Does the proposal have a named owner, a defined scope, and realistic resourcing? Proposals with gaps score lower." },
          { name: "Risk level", weight: "15%", desc: "Delivery risk based on project complexity, dependencies, and whether similar work has been attempted before. Lower risk scores higher." },
          { name: "Urgency / time sensitivity", weight: "10%", desc: "Is there a regulatory, clinical, or contractual reason this must happen in FY27 specifically?" },
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "One thing I want to be transparent about before you see the results: the strategic alignment score is the most subjective one. I'm scoring each proposal against the KRs your theme owners approved, but I'm making judgment calls about how closely a project's described scope maps to a KR's intent. Where I'm uncertain I've flagged it in the rationale column and suggested you or the theme owner make the final call.",
        "Ready to see the full ranked list?",
      ],
    },
    { role: "user", text: "Yes. Show me." },
    {
      role: "ai",
      paragraphs: [
        "Here's the full intake prioritization table. Sorted by score, highest to lowest. Proposals above 80 are recommended for funding. Between 60 and 80 are conditional — fundable but with caveats. Below 60 are flagged for deferral.",
      ],
      artifact: {
        title: "FY27 intake prioritization — scored and ranked",
        subtitle: "17 proposals · sorted by score · $28.9M spendable",
        type: "prioritization_table",
        sections: [
          {
            label: "RECOMMENDED FOR FUNDING",
            status: "green",
            projects: [
              { rank: 1, name: "EHR Platform — Core Infrastructure Build", theme: "Digital Transformation", owner: "Lisa Torres", budget: "$4.2M", score: 94, rec: "Fund", rationale: "Direct delivery vehicle for DT Obj 1. Named owner with implementation experience. No dependencies. Urgency confirmed — vendor contract renewal Q3." },
              { rank: 2, name: "Sepsis Early Detection — Clinical Decision Support Tool", theme: "Patient Safety", owner: "Dr. Reyes", budget: "$2.8M", score: 91, rec: "Fund", rationale: "Maps precisely to Patient Safety Obj 2 (sepsis response KR). Clinical outcome data from 3 comparable implementations. Low risk — proven technology, phased rollout." },
              { rank: 3, name: "Staff Retention Analytics Platform", theme: "Workforce Resilience", owner: "Marcus Webb", budget: "$1.9M", score: 88, rec: "Fund", rationale: "Directly enables WR Obj 1 KR: identify 85% at-risk staff by Q2. Vendor selected, pilot agreement signed. Only risk: data privacy compliance review." },
              { rank: 4, name: "OR Scheduling System Replacement", theme: "Operational Excellence", owner: "David Chen", budget: "$3.1M", score: 86, rec: "Fund", rationale: "Primary delivery for OpEx Obj 1 (OR turnaround –25%). Detailed scope and resource plan. Note: shares 8 FTEs with EHR infrastructure — dependency flagged." },
              { rank: 5, name: "HAI Surveillance and Reporting Upgrade", theme: "Patient Safety", owner: "Dr. Reyes", budget: "$1.6M", score: 85, rec: "Fund", rationale: "Supports Patient Safety Obj 1 KR: HAI rate –18%. Primary measurement infrastructure. Current reporting system end-of-life Q2." },
              { rank: 6, name: "Telehealth Platform Expansion — Phase 2", theme: "Digital Transformation", owner: "Lisa Torres", budget: "$3.4M", score: 82, rec: "Fund", rationale: "Maps to DT Obj 2 (40% virtual visits). Phase 1 running. Conditional on Phase 1 hitting 25% adoption by Q2 before Phase 2 budget releases." },
            ],
          },
          {
            label: "CONDITIONAL",
            status: "amber",
            projects: [
              { rank: 7, name: "Clinical Data Warehouse Modernization", theme: "Digital Transformation", owner: "Lisa Torres", budget: "$2.9M", score: 76, rec: "Conditional", rationale: "Maps to DT Obj 3 (dashboards). High alignment but weak execution readiness — no implementation lead, scope broader than Lisa's note limiting to clinical ops. Clarify scope." },
              { rank: 8, name: "Supply Chain Vendor Consolidation Program", theme: "Operational Excellence", owner: "David Chen", budget: "$1.8M", score: 74, rec: "Conditional", rationale: "Supports OpEx Obj 2 (vendor spend –12%). Solid financial case but timeline optimistic — assumes 6 months for 9–12 month negotiation cycle. Resubmit with revised timeline." },
              { rank: 9, name: "Leadership Development Track — Cohort 1", theme: "Workforce Resilience", owner: "Marcus Webb", budget: "$1.9M", score: 72, rec: "Conditional", rationale: "Supports WR Obj 2 (150 staff enrolled by Q2). Solid design. Budget timing concern — $1.9M in H1 with retention impact not visible until FY28. Recommend phasing." },
              { rank: 10, name: "Surgical Safety Checklist Digital Tool", theme: "Patient Safety", owner: "Dr. Reyes", budget: "$0.9M", score: 71, rec: "Conditional", rationale: "Supports Patient Safety Obj 1 (100% protocol adherence). Low budget, clear scope. Conditional: no integration path specified with clinical documentation system." },
              { rank: 11, name: "FTE Capacity Planning Model", theme: "Workforce Resilience", owner: "Marcus Webb", budget: "$1.9M", score: 68, rec: "Conditional", rationale: "Strategically sound but duplicates partial functionality of Rank 3 (Staff Retention Analytics). Marcus should clarify: sequential or merge into single engagement." },
              { rank: 12, name: "Outpatient Referral Workflow Automation", theme: "Digital Transformation", owner: null, budget: "$2.1M", score: 65, rec: "Conditional", rationale: "Moderate alignment to DT Obj 2. No named owner, no resourcing plan. Needs owner and technical scoping session before evaluation." },
            ],
          },
          {
            label: "FLAGGED FOR DEFERRAL",
            status: "red",
            projects: [
              { rank: 13, name: "Enterprise Knowledge Management System", theme: "Digital Transformation", owner: "Lisa Torres", budget: "$3.8M", score: 52, rec: "Defer", rationale: "Low strategic alignment — doesn't map to any approved DT objective. At $3.8M would push DT over $14M cap. Defer to FY28 or resubmit with explicit KR mapping." },
              { rank: 14, name: "Patient Portal Redesign", theme: "Digital Transformation", owner: null, budget: "$2.4M", score: 49, rec: "Defer", rationale: "Partial alignment to telehealth goals but focused on consumer experience, not clinical outcomes. No owner. No urgency. FY28 candidate." },
              { rank: 15, name: "Nurse Scheduling Optimization", theme: "Operational Excellence", owner: null, budget: "$1.2M", score: 47, rec: "Defer", rationale: "Weak alignment to approved OpEx objectives. May overlap with Rank 4 OR Scheduling. Discuss with David Chen." },
              { rank: 16, name: "Annual Staff Wellness Survey Digitization", theme: "Workforce Resilience", owner: null, budget: "$0.4M", score: 43, rec: "Defer", rationale: "Low strategic impact. Retention analytics (Rank 3) generates richer data. Fold useful elements into Rank 3." },
              { rank: 17, name: "Executive Dashboard — Board Reporting", theme: "Digital Transformation", owner: null, budget: "$1.2M", score: 38, rec: "Defer", rationale: "No KR alignment. Board reporting is governance, not strategic delivery. DT Obj 3 specifies operational dashboards. No owner." },
            ],
          },
        ],
        summary: {
          recommended: { count: 6, budget: "$17.0M" },
          conditional: { count: 6, budget: "$11.5M" },
          deferred: { count: 5, budget: "$9.0M" },
          envelope: "$28.9M",
          ifAllConditionals: "$28.5M — within envelope by $400K",
        },
      },
    },
    {
      role: "ai",
      paragraphs: [
        "That's the full picture. Before you make any decisions, a few things I want to surface:",
      ],
      bullets: [
        { label: "The Digital Transformation theme is the stress point.", detail: "Six proposals, $18.2M requested, $14M cap. Even with Ranks 13 and 14 deferred, funding Ranks 1, 6, 7, and 12 alone hits $13.6M. There's almost no room in that theme for the conditional proposals to resolve and get funded. Lisa Torres needs to know this." },
        { label: "Ranks 11 and 3 may be duplicates.", detail: "Marcus Webb submitted both the Staff Retention Analytics Platform and the FTE Capacity Planning Model. Before you make conditional decisions on Rank 11, Marcus should tell you whether these overlap. Funding both is $3.8M for work that might be achievable in one engagement." },
        { label: "Five of the seventeen proposals have no owner.", detail: "Ranks 12, 14, 15, 16, and 17. A project with no owner cannot be executed. I'd recommend not approving any ownerless proposal regardless of score." },
      ],
      paragraphs2: [
        "How do you want to work through this — go theme by theme, or start by locking in the recommended tier first?",
      ],
    },
    { role: "user", text: "Lock in the recommended tier first. Then we'll work through the conditionals." },
    {
      role: "ai",
      paragraphs: [
        "Recommended tier locked. Ranks 1 through 6 approved for funding pending the Rank 6 conditional on Phase 1 adoption.",
      ],
      inline: {
        type: "budget_register",
        approved: "$17.0M",
        remaining: "$11.9M",
        envelope: "$28.9M",
        note: "Ranks 1–5 approved. Rank 6 approved conditional on Phase 1 Q2 milestone.",
      },
    },
    {
      role: "ai",
      paragraphs: [
        "You have $11.9M left in the envelope and six conditional proposals totaling $11.5M. If every conditional resolves cleanly you're within the envelope by $400K. But three of the six have owner or scope issues that may not resolve in time for intake. Let's go through them and decide which ones are worth pursuing and which ones should be deferred now rather than conditionally held.",
        "Which conditional do you want to start with?",
      ],
    },
  ],
  "4": [
    { role: "user", text: "Let's do scenarios. What's the state of the list coming out of the prioritization session?" },
    {
      role: "ai",
      paragraphs: [
        "Here's where everything landed after the conditional work. Five conditionals resolved and were approved. Two were deferred — the FTE Capacity Planning Model overlap with the retention platform was confirmed by Marcus, and the outpatient referral proposal never got an owner.",
      ],
      artifact: {
        title: "Intake decisions — final status coming out of the prioritization session",
        subtitle: "11 approved · 6 deferred · $26.8M committed",
        type: "intake_decisions",
        sections: [
          {
            label: "Approved (11 projects)",
            status: "green",
            items: [
              "EHR Platform Core Infrastructure",
              "Sepsis Detection Tool",
              "Staff Retention Analytics",
              "OR Scheduling System",
              "HAI Surveillance Upgrade",
              "Telehealth Phase 2",
              "Clinical Data Warehouse (scope clarified by Lisa)",
              "Supply Chain Vendor Consolidation (timeline revised by David)",
              "Leadership Development Track (phased delivery agreed)",
              "Surgical Safety Checklist Tool (integration path confirmed by Dr. Reyes)",
              "Outpatient Referral Automation (owner assigned — James Park from Clinical Ops)",
            ],
          },
          {
            label: "Deferred to FY28 (6 projects)",
            status: "red",
            items: [
              "Enterprise Knowledge Management",
              "Patient Portal Redesign",
              "Nurse Scheduling Optimization",
              "Staff Wellness Survey Digitization",
              "Executive Dashboard — Board Reporting",
              "FTE Capacity Planning Model",
            ],
          },
        ],
        summary: {
          committed: "$26.8M",
          envelope: "$28.9M",
          headroom: "$2.1M",
          projects: "11 net new against 25-project cap · 14 slots remaining",
        },
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Clean position. You're $2.1M under the envelope and well within the project cap. That headroom matters when we run scenarios — it's the difference between a conservative plan and a brittle one.",
        "Ready to run the scenario planning artifacts?",
      ],
    },
    { role: "user", text: "Yes. Show me the full planning view first." },
    {
      role: "ai",
      paragraphs: [
        "Here's the full FY27 plan as it stands under Scenario A — your baseline balanced budget. This artifact has three views: the ranked list with cutline, a timeline, and a capacity heatmap. They're all showing the same 11 projects from different angles.",
      ],
      artifact: {
        title: "FY27 plan — Scenario A, full planning view",
        subtitle: "Ranked list · Timeline · Capacity · 11 projects · $26.8M",
        type: "planning_view",
        tabs: ["Ranked list", "Timeline", "Capacity"],
        header: {
          scenario: "Scenario A",
          total: "$34M",
          spendable: "$28.9M",
          projects: "11",
          committed: "$26.8M",
          headroom: "$2.1M",
        },
        rankedList: {
          funded: [
            { rank: 1, name: "EHR Platform Core Infrastructure", theme: "Digital Transformation", themeColor: "blue", owner: "Lisa Torres", budget: "$4.2M", score: 94, cumulative: "$4.2M" },
            { rank: 2, name: "Sepsis Early Detection Tool", theme: "Patient Safety", themeColor: "green", owner: "Dr. Reyes", budget: "$2.8M", score: 91, cumulative: "$7.0M" },
            { rank: 3, name: "Staff Retention Analytics Platform", theme: "Workforce Resilience", themeColor: "purple", owner: "Marcus Webb", budget: "$1.9M", score: 88, cumulative: "$8.9M" },
            { rank: 4, name: "OR Scheduling System Replacement", theme: "Operational Excellence", themeColor: "amber", owner: "David Chen", budget: "$3.1M", score: 86, cumulative: "$12.0M" },
            { rank: 5, name: "HAI Surveillance and Reporting Upgrade", theme: "Patient Safety", themeColor: "green", owner: "Dr. Reyes", budget: "$1.6M", score: 85, cumulative: "$13.6M" },
            { rank: 6, name: "Telehealth Platform Expansion Phase 2", theme: "Digital Transformation", themeColor: "blue", owner: "Lisa Torres", budget: "$3.4M", score: 82, cumulative: "$17.0M" },
            { rank: 7, name: "Clinical Data Warehouse Modernization", theme: "Digital Transformation", themeColor: "blue", owner: "Lisa Torres", budget: "$2.9M", score: 76, cumulative: "$19.9M" },
            { rank: 8, name: "Supply Chain Vendor Consolidation", theme: "Operational Excellence", themeColor: "amber", owner: "David Chen", budget: "$1.8M", score: 74, cumulative: "$21.7M" },
            { rank: 9, name: "Leadership Development Track", theme: "Workforce Resilience", themeColor: "purple", owner: "Marcus Webb", budget: "$1.9M", score: 72, cumulative: "$23.6M" },
            { rank: 10, name: "Surgical Safety Checklist Tool", theme: "Patient Safety", themeColor: "green", owner: "Dr. Reyes", budget: "$0.9M", score: 71, cumulative: "$24.5M" },
            { rank: 11, name: "Outpatient Referral Automation", theme: "Digital Transformation", themeColor: "blue", owner: "James Park", budget: "$2.3M", score: 65, cumulative: "$26.8M" },
          ],
          cutlineLabel: "Funding cutline — $26.8M committed · $2.1M headroom remaining · 14 project slots remaining",
          deferred: [
            { name: "Enterprise Knowledge Management", budget: "$3.8M", score: 52, reason: "No KR alignment" },
            { name: "Patient Portal Redesign", budget: "$2.4M", score: 49, reason: "No owner, no urgency" },
            { name: "Nurse Scheduling Optimization", budget: "$1.2M", score: 47, reason: "Scope overlap with Rank 4" },
            { name: "Staff Wellness Survey Digitization", budget: "$0.4M", score: 43, reason: "Low strategic impact" },
            { name: "Executive Dashboard — Board Reporting", budget: "$1.2M", score: 38, reason: "No KR alignment" },
            { name: "FTE Capacity Planning Model", budget: "$1.9M", score: 68, reason: "Scope overlap with Rank 3 — Marcus confirmed" },
          ],
        },
        timeline: {
          groups: [
            {
              theme: "Digital Transformation",
              color: "blue",
              projects: [
                { name: "EHR Platform Core Infrastructure", start: "Q1", end: "Q3", flag: "Go-live deadline — vendor contract renewal" },
                { name: "Telehealth Platform Phase 2", start: "Q2", end: "Q4", flag: "Releases only if Phase 1 hits 25% adoption" },
                { name: "Clinical Data Warehouse", start: "Q2", end: "Q3", flag: "Scope limited to clinical ops — Lisa Torres" },
                { name: "Outpatient Referral Automation", start: "Q3", end: "Q4", flag: null },
              ],
            },
            {
              theme: "Patient Safety",
              color: "green",
              projects: [
                { name: "Sepsis Detection Tool", start: "Q1", end: "Q2", flag: "Phased rollout — units 1–4 Q1, 5–8 Q2" },
                { name: "HAI Surveillance Upgrade", start: "Q1", end: "Q2", flag: "End-of-life on current system — hard deadline" },
                { name: "Surgical Safety Checklist Tool", start: "Q2", end: "Q3", flag: null },
              ],
            },
            {
              theme: "Operational Excellence",
              color: "amber",
              projects: [
                { name: "OR Scheduling System", start: "Q1", end: "Q3", flag: "Shares 8 FTEs with EHR infrastructure — dependency documented" },
                { name: "Supply Chain Vendor Consolidation", start: "Q2", end: "Q4", flag: "Timeline revised from 6 to 10 months — David Chen" },
              ],
            },
            {
              theme: "Workforce Resilience",
              color: "purple",
              projects: [
                { name: "Staff Retention Analytics", start: "Q1", end: "Q2", flag: "Predictive model live — feeds Q3 interventions" },
                { name: "Leadership Development Track", start: "Q1", end: "Q2", flag: "H2 delivery budget held pending Q2 retention data" },
              ],
            },
          ],
          callout: "Q2 is the highest-risk quarter. Five projects are either starting, hitting a milestone, or dependent on another project completing. A single slip in Q2 creates a cascade.",
        },
        capacity: {
          teams: [
            { name: "EHR Implementation", ftes: 28, q1: 95, q2: 95, q3: 75, q4: 40, note: "Shared with OR Scheduling in Q1–Q2" },
            { name: "Clinical Informatics", ftes: 14, q1: 80, q2: 92, q3: 78, q4: 50, note: "Data warehouse and HAI system overlap in Q2" },
            { name: "Process Improvement", ftes: 12, q1: 60, q2: 85, q3: 80, q4: 55, note: null },
            { name: "Vendor Management", ftes: 8, q1: 45, q2: 70, q3: 95, q4: 90, note: "Supply chain consolidation drives Q3–Q4 peak" },
            { name: "HR and Learning", ftes: 10, q1: 75, q2: 80, q3: 65, q4: 50, note: null },
            { name: "Clinical Quality", ftes: 9, q1: 95, q2: 85, q3: 60, q4: 40, note: "Dr. Reyes team running 3 concurrent projects Q1" },
            { name: "Digital Health", ftes: 6, q1: 50, q2: 100, q3: 85, q4: 75, note: "Telehealth Phase 2 creates Q2 spike if milestone met" },
          ],
          totals: { q1: 82, q2: 91, q3: 78, q4: 58 },
          totalFtes: 420,
          callout: "Q2 is the single capacity constraint. Two teams — EHR Implementation and Digital Health — are at or above 95% in Q2. No FTE buffer for unplanned work.",
        },
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Three things the planning view is telling me that I want to make sure are visible before we look at scenarios:",
      ],
      bullets: [
        { label: "Q2 is where this plan is most vulnerable.", detail: "Both the timeline and the heatmap are pointing at the same thing independently — five concurrent milestones and two teams at capacity ceiling in the same quarter. That's not a reason to change the plan, but it's a reason to make sure your Q2 governance checkpoint is locked in before you submit." },
        { label: "The EHR and OR Scheduling dependency is visible in the heatmap now.", detail: "The 28-FTE EHR implementation team is at 95% in Q1 and Q2. OR Scheduling draws from the same team. If EHR slips, OR Scheduling has nowhere to go because the team is already full." },
        { label: "Vendor Management is the hidden Q3–Q4 pressure.", detail: "Supply chain consolidation drives that team to 95% in Q3 and 90% in Q4. If any Q1 or Q2 work bleeds into Q3 and touches vendor systems, they'll have no capacity to absorb it." },
      ],
      paragraphs2: [
        "Ready to see the scenario comparison?",
      ],
    },
    { role: "user", text: "Yes. Show me scenarios." },
    {
      role: "ai",
      paragraphs: [
        "Here are three scenarios modeled against your confirmed guardrails. The comparison artifact shows each scenario across the same four views — budget, project list, timeline impact, and capacity impact — so you can see not just the numbers but what each scenario actually does to the plan.",
      ],
      artifact: {
        title: "Scenario comparison — FY27",
        subtitle: "A · B · C across budget, projects, timeline, and capacity",
        type: "scenario_comparison",
        scenarios: [
          { id: "A", label: "A — Balanced" },
          { id: "B", label: "B — Conservative" },
          { id: "C", label: "C — Accelerated" },
        ],
        budget: {
          cols: ["", "A — Balanced", "B — Conservative", "C — Accelerated"],
          rows: [
            ["Total budget", "$34M", "$28M", "$40M"],
            ["Reserve held", "$5.1M (15%)", "$6.2M (22%)", "$4.8M (12%)"],
            ["Spendable", "$28.9M", "$21.8M", "$35.2M"],
            ["Committed", "$26.8M", "$18.6M", "$32.2M"],
            ["Headroom", "$2.1M", "$3.2M", "$3.0M"],
            ["Guardrail conflicts", { t: "None", c: "green" }, { t: "None", c: "green" }, { t: "FTE cap breach — 468 vs 420", c: "red" }],
          ],
        },
        projectDelta: {
          a: { label: "All 11 projects funded as approved. No changes to ranked list or cutline.", projects: null },
          b: {
            label: "$7.1M reduction forces 3 projects below the cutline:",
            projects: [
              { name: "Leadership Development Track", budget: "$1.9M", reason: "Lowest score in Workforce Resilience. Retention analytics delivers more immediate impact." },
              { name: "Clinical Data Warehouse", budget: "$2.9M", reason: "Lisa scoped to clinical ops only — reduced scope reduces urgency. Dashboard capability partially delivered through HAI surveillance." },
              { name: "Outpatient Referral Automation", budget: "$2.3M", reason: "Lowest score of funded projects at 65. Owner recently assigned. No track record." },
            ],
            summary: "Cutline moves up. 8 projects funded. $18.6M committed. $3.2M headroom.",
          },
          c: {
            label: "All 11 retained. $8.4M additional headroom allows 3 deferred projects to re-enter:",
            projects: [
              { name: "FTE Capacity Planning Model", budget: "$1.9M", reason: "Marcus confirmed sequential to retention analytics, not duplicate. Viable with additional budget." },
              { name: "Patient Portal Redesign", budget: "$2.4M", reason: "Owner needed — still unassigned. Conditional on owner being named before intake closes." },
              { name: "Nurse Scheduling Optimization", budget: "$1.2M", reason: "David Chen confirmed additive to OR Scheduling. Scope is shift management layer." },
            ],
            summary: "14 projects. $32.2M committed. $3.0M headroom. Guardrail conflict: 468 FTEs — 48 over confirmed 420 cap.",
          },
        },
        timelineImpact: {
          a: "Timeline as shown in planning view. Q2 is the critical quarter. No changes.",
          b: "Q2 pressure reduces. Digital Health drops from 100% to 72%. Clinical Informatics drops from 92% to 74%. Overall Q2: 91% → 79%. Amber instead of red. More resilient to slippage.",
          c: "Q1 becomes new pressure point. Q2 worsens — Digital Health returns to 100%, EHR team stays at 95%. Patient Portal has no timeline because it has no owner. Net: Q1 turns amber→red. Q2 stays red.",
        },
        capacityImpact: {
          a: "Q2 91% overall. Two teams at ceiling.",
          b: "Q2 drops to 79%. No teams above 90% in any quarter. Most resilient capacity profile. Buffer exists for unplanned work.",
          c: "Q1 rises to 89%. Q2 rises to 97%. Three teams above 95% in Q2. No buffer for any unplanned event in Q1 or Q2.",
        },
        guardrailConflict: "Scenario C requires 468 FTEs across Q1–Q2 peak demand. Confirmed capacity is 420. The 48-person gap cannot be absorbed through overtime or contractor coverage at this scale without a formal workforce plan. Scenario C is not submittable under current guardrails without a CFO and HR exception.",
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Before you choose, the thing I want you to sit with is the difference between A and B, because that's the real decision.",
        "Scenario C is off the table unless you want to file an exception — 48 FTEs over guardrail isn't a rounding error.",
      ],
    },
    {
      role: "ai",
      paragraphs: [
        "Scenario B's case is stronger than the numbers suggest. Dropping 3 projects reduces Q2 utilization from red to amber — meaning the plan becomes resilient to slippage instead of brittle. The three projects that fall below the cutline are the three lowest-scoring funded projects. You lose $7.1M in committed spend but you gain a plan that can absorb a bad Q2 without cascading. And your reserve goes from 15% to 22% — the CFO will like that.",
        "Scenario A's case is that Marcus Webb earned Workforce Resilience a real plan. The Leadership Development Track that defers in Scenario B is one of only two Workforce Resilience projects. Marcus submitted fast, named himself as owner, cited real data. Deferring one of his two projects in the first cycle he's been active sends a signal. That's not in the spreadsheet.",
        "What's your read?",
      ],
    },
    { role: "user", text: "I want A. The Q2 risk is real but I'd rather manage it than cut Marcus's second project. I'll make sure the Q2 governance checkpoint is locked in." },
    {
      role: "ai",
      paragraphs: [
        "Scenario A selected. The right call to make deliberately rather than let the conservative option win by default.",
      ],
      inline: {
        type: "status_update",
        icon: "check",
        text: "Scenario A confirmed — 11 projects · $26.8M · 420 FTEs",
        detail: "Scenarios B and C removed from consideration.",
      },
    },
    {
      role: "ai",
      paragraphs: [
        "One thing before you submit. Looking at the capacity heatmap, the Q2 governance checkpoint needs to be more than a calendar reminder — it needs a specific trigger. Here's what I'd recommend building into the submission:",
      ],
      inline: {
        type: "conflict_callout_blue",
        title: "Q2 governance trigger — recommended submission note",
        body: "At Q2 checkpoint: if EHR implementation is not at 80% infrastructure completion and Telehealth Phase 1 has not hit 25% adoption, Telehealth Phase 2 budget release should be paused and Clinical Quality team capacity should be reviewed for reallocation. This prevents the Q2 cascade before it starts rather than responding to it after.",
      },
      paragraphs2: [
        "Do you want that language added to the submission package?",
      ],
    },
    { role: "user", text: "Yes. Add it." },
    {
      role: "ai",
      paragraphs: [
        "Added to submission package as a governance condition on Telehealth Phase 2.",
        "Here's your final submission state:",
      ],
      artifact: {
        title: "FY27 strategy plan — submission package",
        subtitle: "Scenario A — Balanced · Ready for intake · 4 days remaining",
        type: "submission_package",
        themes: [
          { name: "Digital Transformation", budget: "$13.8M", objectives: "4 projects", owner: "Lisa Torres + James Park", approved: "Approved", flag: "1 conditional release trigger (Telehealth Phase 2)" },
          { name: "Patient Safety & Clinical Excellence", budget: "$5.3M", objectives: "3 projects", owner: "Dr. Reyes", approved: "Approved", flag: null },
          { name: "Operational Excellence", budget: "$4.9M", objectives: "2 projects", owner: "David Chen", approved: "Approved", flag: "1 dependency flag (OR/EHR shared FTEs)" },
          { name: "Workforce Resilience", budget: "$3.8M", objectives: "2 projects", owner: "Marcus Webb", approved: "Approved", flag: "H2 delivery budget gated on Q2 retention data" },
        ],
        summary: {
          totalBudget: "$26.8M committed",
          reserve: "$5.1M (15%)",
          projects: "11 net new",
          ftes: "420",
          themes: "4 fully funded",
          conflicts: "0 guardrail conflicts",
          flags: "Q2 governance trigger documented",
        },
        deferred: "6 projects deferred to FY28 with documented rationale. New Care Models theme formally deferred — no operational owner.",
      },
    },
    {
      role: "ai",
      paragraphs: [
        "One open item before you submit:",
      ],
      inline: {
        type: "conflict_callout",
        title: "8 KRs have no FY26 baseline on file",
        body: "You can submit without baselines — intake won't block on this. But KRs without a starting point can't be tracked once execution begins. Dr. Reyes set her own baseline for HAI. Marcus Webb cited a specific turnover rate. The remaining 8 KRs across Digital Transformation and Operational Excellence have target numbers but no FY26 actuals attached.",
      },
      actions: [
        { label: "Open baseline worksheet", style: "primary" },
        { label: "Submit now — add baselines post-intake", style: "ghost" },
      ],
    },
    { role: "user", text: "I'll open the baseline worksheet and get it done before I submit. Then I'm submitting." },
    {
      role: "ai",
      paragraphs: [
        "Right call. Baseline worksheet is open — it's pre-populated with the 8 KRs that need actuals, with the relevant Smartsheet data pulled in where I could find it. A few fields Lisa and David will need to fill in manually from their records.",
      ],
      artifact: {
        title: "Baseline worksheet — 8 KRs pending",
        subtitle: "Pre-populated from Smartsheet · send to Lisa Torres and David Chen",
        type: "table",
        cols: ["KR", "Target", "FY26 Actual", "Owner"],
        rows: [
          ["EHR go-live across all sites", "Q3", "—", "Lisa Torres"],
          ["90% clinical staff adoption", "90%", "—", "Lisa Torres"],
          ["40% outpatient visits virtual", "40%", "12%", "Lisa Torres"],
          ["Real-time dashboards live", "All depts", "—", "Lisa Torres"],
          ["OR room turnover time –25%", "–25%", "42 min avg", "David Chen"],
          ["On-time first-case starts 85%", "85%", "71%", "David Chen"],
          ["Medical supply costs –12%", "–12%", "—", "David Chen"],
          ["Vendor invoice processing <5 days", "<5 days", "8.2 days", "David Chen"],
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Send it to them now. If they come back before the intake window closes you'll have a complete package. If they don't, you submit what you have and close the baselines in week one.",
        "Here is where you've landed:",
      ],
      artifact: {
        title: "Setup readiness",
        subtitle: "~95% complete",
        type: "readiness",
        pct: 95,
        rows: [
          { s: "green", l: "Portfolios connected", n: "4 portfolios · 274 projects · P-118 sunset · all aligned" },
          { s: "green", l: "Strategic themes defined", n: "4 themes active · 1 formally deferred · all owners confirmed" },
          { s: "green", l: "Objectives & key results", n: "9 objectives · 18 KRs · all owner-approved · 1 dependency documented · 8 baselines pending" },
          { s: "green", l: "Investment envelope & guardrails", n: "5 of 5 confirmed · zero conflicts · Scenario A selected" },
          { s: "green", l: "Ready for intake", n: "Submit when baselines are closed. Intake window: 4 days." },
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Ten days. Seventeen proposals evaluated. Eleven funded. Six deferred with documented rationale. Four themes, nine owner-approved objectives, eighteen KRs. A plan that fits the envelope, fits the guardrails, and comes with a governance trigger built in for the one quarter that needs it.",
        "Submit when the baselines land. I'll be here if intake reviewers come back with questions.",
      ],
    },
  ],
  "5": [
    { role: "user", text: "I'm initiating FY27 strategic planning. Please pull the FY26 framework from Smartsheet and identify structural gaps before I upload the new board plan." },
    {
      role: "ai",
      paragraphs: [
        "FY26 framework retrieved. I've assessed it against measurability and project alignment criteria before surfacing it here.",
      ],
      artifact: {
        title: "FY26 Strategic Framework — structural assessment",
        subtitle: "5 themes · alignment verification",
        type: "table",
        cols: ["Theme", "Objectives on record", "Projects claiming alignment", "Verified alignment rate", "Finding"],
        rows: [
          ["Clinical Quality & Patient Safety", "2", "31", "71%", "Strongest theme. Objectives existed and were specific enough to test against."],
          ["Digital Transformation", "0", "47", "0%", "Name only. No measurable basis for alignment. All 47 claims are unverifiable."],
          ["Operational Excellence", "0", "38", "0%", "Name only. Functioned as a catch-all category."],
          ["Workforce Development", "1", "14", "34%", "Single weak objective. High misalignment rate."],
          ["Innovation", "0", "22", "0%", "Name only. No structure."],
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "3 of 5 themes had no objectives. Without measurable objectives beneath each theme, project alignment cannot be enforced — it can only be asserted.",
        "The root cause is structural, not a theme-naming problem. For FY27 I'd recommend three layers: themes → objectives (2–3 per theme) → key results (2–3 per objective). A project should only be able to claim a theme by citing a specific KR it advances. That makes alignment auditable.",
        "Ready to proceed with document upload when you are.",
      ],
    },
    { role: "user", text: "Confirmed. Uploading the board strategic plan and all five division operating plans now." },
    {
      role: "ai",
      paragraphs: [
        "All six documents processed. Here is the cross-document synthesis before I generate draft themes.",
      ],
      artifact: {
        title: "Strategic input synthesis — convergence and conflict analysis",
        subtitle: "6 documents · 3 sections",
        type: "synthesis",
        sections: [
          {
            title: "High convergence across all six documents",
            status: "green",
            items: [
              "Patient safety and clinical outcomes (board plan + all 5 divisions)",
              "Digital infrastructure modernization — EHR and data platforms (board plan + IT + Clinical independently)",
              "Workforce pipeline and retention (board plan brief, HR division detailed and specific)",
            ],
          },
          {
            title: "Structural tensions requiring resolution before framework is finalized",
            status: "amber",
            items: [
              "Tension A: Finance division operating plan is organized around margin recovery and cost reduction. The board strategic plan does not use cost-reduction language — it frames all investment as growth. These are not incompatible but will produce prioritization conflict if the framework does not explicitly accommodate both frames. Recommend a CFO alignment conversation before Financial Performance is named as a theme.",
              "Tension B: Operations division plan emphasizes care coordination and discharge efficiency. Neither maps cleanly to board-stated themes. These objectives may need their own theme or explicit placement within Clinical Quality to avoid being absorbed into Operational Excellence by default.",
            ],
          },
          {
            title: "Critical gap: no budget envelope in any document",
            status: "red",
            items: [
              "The board plan is aspirational. Division plans are uncosted wish lists. Investment parameters cannot be finalized until the CFO provides a working budget figure. Recommend completing guardrail configuration in parallel with theme review rather than sequentially.",
            ],
          },
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Based on this synthesis, here is the proposed FY27 framework structure:",
      ],
      artifact: {
        title: "FY27 Strategic Framework — draft",
        subtitle: "5 themes · objectives with source attribution",
        type: "goals_draft",
        themes: [
          {
            s: "green", name: "Clinical Quality & Patient Safety", meta: "4 objectives · Sources: Board plan + Clinical division + Operations division", expanded: true,
            objectives: [
              { source: "deck", title: "Reduce preventable harm events across inpatient units", krs: [] },
              { source: "deck", title: "Improve sepsis recognition and response to national benchmark", krs: [] },
              { source: "deck", title: "Achieve top-quartile HAI rates across surgical and ICU settings", krs: [] },
              { source: "ai", title: "Improve discharge process efficiency and reduce preventable readmissions", krs: [] },
            ],
          },
          {
            s: "blue", name: "Digital Transformation & Data Infrastructure", meta: "3 objectives · Sources: Board plan + IT division + Clinical division", expanded: false,
            objectives: [
              { source: "deck", title: "Complete EHR consolidation across all facilities", krs: [] },
              { source: "deck", title: "Build real-time operational reporting capability for clinical leadership", krs: [] },
              { source: "ai", title: "Modernize data integration between clinical and operational systems", krs: [] },
            ],
          },
          {
            s: "purple", name: "Workforce Resilience & Pipeline", meta: "3 objectives · Sources: Board plan + HR division", expanded: false,
            objectives: [
              { source: "deck", title: "Reduce voluntary clinical staff turnover from 22% to target rate", krs: [] },
              { source: "ai", title: "Build internal leadership pipeline to reduce external senior hire dependency", krs: [] },
              { source: "ai", title: "Improve time-to-fill for critical clinical and operational roles", krs: [] },
            ],
          },
          {
            s: "amber", name: "Operational Efficiency & Care Coordination", meta: "2 objectives · Sources: Operations division + Finance division", expanded: false,
            objectives: [
              { source: "deck", title: "Reduce OR turnaround time and improve first-case on-time start rate", krs: [] },
              { source: "ai", title: "Optimize supply chain spend across high-volume categories", krs: [] },
            ],
          },
          {
            s: "gray", name: "Operational & Financial Performance", meta: "3 objectives · Sources: Finance division + Board plan", expanded: false,
            objectives: [
              { source: "deck", title: "Achieve target operating margin recovery", krs: [] },
              { source: "ai", title: "Reduce unwarranted clinical variation driving excess cost", krs: [] },
              { source: "ai", title: "Improve revenue cycle efficiency and net clean claim rate", krs: [] },
            ],
          },
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Two flags before you review: Theme 5 naming requires CFO sign-off given the internal signal it carries. The board plan language does not endorse cost-reduction framing explicitly. And discharge efficiency in Theme 4 above may belong in Theme 1 given your organization's clinical framing of that metric.",
      ],
    },
    { role: "user", text: "Move discharge efficiency to Theme 1. And I need to configure investment parameters now — I have the FY27 CFO budget memo." },
    {
      role: "ai",
      paragraphs: [
        "Discharge efficiency moved to Theme 1. Theme 4 now carries 2 objectives. CFO memo processed.",
      ],
      artifact: {
        title: "Investment parameters — extracted from CFO FY27 budget memo",
        subtitle: "3 of 5 confirmed · 2 require your input",
        type: "table",
        cols: ["Parameter", "Extracted value", "Source location", "Status"],
        rows: [
          ["Total portfolio budget", "$62M", "Page 2, capital allocation summary", { badge: "Confirmed", color: "green" }],
          ["Minimum reserve", "15% / $9.3M", "Page 4, CFO standing mandate", { badge: "Confirmed", color: "green" }],
          ["FTE capacity baseline", "420 roles", "Page 7, workforce plan appendix", { badge: "Confirmed", color: "green" }],
          ["Per-theme budget cap", "—", "Not in document", { badge: "Requires your input", color: "amber" }],
          ["Active project count limit", "—", "Not in document", { badge: "Requires your input", color: "amber" }],
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "3 of 5 parameters confirmed from document. 2 require EPMO input — these are typically governance decisions, not finance decisions.",
        "For the two remaining parameters, here is my read based on the portfolio data:",
      ],
      bullets: [
        { label: "Per-theme budget cap.", detail: "$62M minus 15% reserve leaves $52.7M spendable across five themes. Even split is $10.5M per theme. However your Digital Transformation theme has $14.2M of active FY26 work that will carry into FY27. A $10.5M cap creates an immediate structural conflict for that theme. Recommend $14M cap for Digital Transformation with $10M for the remaining four, or a single $13M cap applied uniformly with an exception process." },
        { label: "Active project count.", detail: "At 420 FTEs and your current average project staffing of 1.4 FTEs per project, the sustainable ceiling for net new intake projects is 22–30. I'd recommend 25 as the starting limit — conservative enough to protect execution quality, high enough that all five themes can contribute meaningful new work." },
      ],
    },
    { role: "user", text: "Set the per-theme cap at $13M uniform. Project limit at 25. Confirm and close the investment parameters." },
    {
      role: "ai",
      paragraphs: [
        "Parameters confirmed and locked.",
      ],
      artifact: {
        title: "Investment parameters — FY27 confirmed",
        subtitle: "5 of 5 confirmed",
        type: "table",
        cols: ["Parameter", "Value", "Status"],
        rows: [
          ["Total budget", "$62M", { badge: "Confirmed", color: "green" }],
          ["Reserve", "$9.3M (15%)", { badge: "Confirmed", color: "green" }],
          ["FTE capacity", "420", { badge: "Confirmed", color: "green" }],
          ["Per-theme cap", "$13M", { badge: "Confirmed", color: "green" }],
          ["Project limit", "25", { badge: "Confirmed", color: "green" }],
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Spendable envelope: $52.7M across five themes. Maximum per theme: $13M. Net new project capacity: 25.",
        "Strategic framework and investment parameters are now complete. Here is the full configuration state before you open intake:",
      ],
      artifact: {
        title: "FY27 planning configuration — summary",
        subtitle: "Framework + investment parameters",
        type: "readiness",
        pct: 100,
        rows: [
          { s: "green", l: "Strategic Framework", n: "5 themes confirmed · 15 objectives across themes · 30 draft KRs" },
          { s: "amber", l: "Theme ownership", n: "3 of 5 assigned · Digital Transformation and Operational Efficiency need owners" },
          { s: "green", l: "Total budget", n: "$62M total · $52.7M spendable" },
          { s: "green", l: "Per-theme cap", n: "$13M uniform" },
          { s: "green", l: "Project limit", n: "25 net new" },
          { s: "green", l: "Reserve", n: "15% locked" },
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "2 theme owners still unassigned. Recommend assigning before intake opens — unowned themes will attract proposals with no accountable reviewer.",
        "Recommend assigning theme owners to Digital Transformation and Operational Efficiency before intake opens. Proposals submitted to an unowned theme have no accountable reviewer during scoring.",
      ],
    },
  ],
  "6": [
    { role: "user", text: "Intake is closed. 34 final proposals confirmed. Run the full scoring model against the confirmed intake list and generate the prioritization output for committee review." },
    {
      role: "ai",
      paragraphs: [
        "Scoring complete. Applied your confirmed model: Strategic Alignment 30%, Financial Impact 25%, Execution Readiness 20%, Risk 15%, Urgency 10%. All 34 proposals scored.",
        "Before the full table — the structural summary the committee needs to understand first.",
      ],
      artifact: {
        title: "Prioritization structural summary — 34 proposals",
        subtitle: "Envelope position + pre-scoring issues",
        type: "committee_summary",
        envelope: {
          cols: ["Theme", "Proposals", "Budget requested", "Cap", "Position"],
          rows: [
            ["Clinical Quality", "8", "$13.8M", "$13M", { badge: "Over by $800K", color: "amber" }],
            ["Digital Transformation", "9", "$20.1M", "$13M", { badge: "Over by $7.1M", color: "red" }],
            ["Workforce Resilience", "5", "$6.4M", "$13M", { badge: "Under by $6.6M", color: "green" }],
            ["Operational Efficiency", "7", "$8.6M", "$13M", { badge: "Under by $4.4M", color: "green" }],
            ["Op. & Financial Performance", "5", "$7.3M", "$13M", { badge: "Under by $5.7M", color: "green" }],
          ],
          footer: "Total: 34 proposals · $56.2M requested · $52.7M spendable · over by $3.5M",
        },
        issues: [
          "4 proposals still have no owner — flagged as conditionally ineligible pending assignment.",
          "2 proposals confirmed as duplicates — Telehealth Infrastructure and Virtual Care Expansion. Committee must decide: merge, or one defers.",
          "1 proposal (Sepsis Early Warning) has a Q2 vendor contract expiry — urgency is real and time-bound.",
          "1 proposal (Clinical Data Platform) was scoped down by the theme owner after submission — budget figure in intake sheet may not reflect revised scope.",
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Only Digital Transformation and Clinical Quality are over-cap. Total portfolio over-cap is $3.5M — the smallest cut in the recommended tier would bring it within envelope.",
        "Here is the full scored and ranked table:",
      ],
      artifact: {
        title: "FY27 Intake — full prioritization table",
        subtitle: "34 proposals · sorted by score · $52.7M spendable",
        type: "prioritization_table",
        sections: [
          {
            label: "RECOMMENDED — Score 80+",
            status: "green",
            projects: [
              { rank: 1, name: "Sepsis Early Warning System", theme: "Clinical Quality", owner: "Dr. Reyes", budget: "$2.8M", score: 94, rec: "Fund", rationale: "Direct KR delivery. Vendor contract expires Q2 — hard urgency. Proven technology, phased rollout, low delivery risk." },
              { rank: 2, name: "EHR Consolidation — Phase 3", theme: "Digital Transform.", owner: "L. Torres", budget: "$4.1M", score: 92, rec: "Fund", rationale: "Final phase of multi-year program. Stopping now wastes prior investment. Full readiness confirmed by IT." },
              { rank: 3, name: "Staff Retention Analytics Platform", theme: "Workforce", owner: "M. Webb", budget: "$1.9M", score: 89, rec: "Fund", rationale: "Maps precisely to 22%→16% turnover KR. Owner submitted with vendor selected and pilot agreement signed." },
              { rank: 4, name: "OR Scheduling System Replacement", theme: "Operational Eff.", owner: "D. Chen", budget: "$3.1M", score: 87, rec: "Fund", rationale: "Strong KR alignment to OR turnaround objective. Comparable implementation completed FY24. Moderate complexity." },
              { rank: 5, name: "HAI Surveillance & Reporting Upgrade", theme: "Clinical Quality", owner: "Dr. Reyes", budget: "$1.6M", score: 85, rec: "Fund", rationale: "Current system end-of-life Q2 — urgency confirmed. KR-aligned. Low delivery risk." },
              { rank: 6, name: "Telehealth Expansion — Phase 2", theme: "Digital Transform.", owner: "L. Torres", budget: "$3.4M", score: 83, rec: "Fund", rationale: "Scale-up of active Phase 1. Conditional on Phase 1 hitting 25% adoption milestone by Q2." },
              { rank: 7, name: "Revenue Cycle Automation", theme: "Op. & Fin. Perf.", owner: "CFO Office", budget: "$2.1M", score: 82, rec: "Fund", rationale: "Strong KR alignment to net clean claim rate. Financial impact case well-documented by Finance division." },
              { rank: 8, name: "Discharge Process Redesign", theme: "Clinical Quality", owner: "Dr. Reyes", budget: "$2.2M", score: 81, rec: "Fund", rationale: "Maps to length-of-stay KR. Cross-functional — requires CMO and Operations co-ownership. Committee should confirm governance." },
              { rank: 9, name: "Supply Chain Consolidation", theme: "Operational Eff.", owner: "D. Chen", budget: "$1.8M", score: 81, rec: "Fund", rationale: "Solid financial return case. Vendor timeline revised to 10 months — realistic." },
              { rank: 10, name: "Leadership Development Track", theme: "Workforce", owner: "M. Webb", budget: "$1.9M", score: 80, rec: "Fund", rationale: "Pipeline KR alignment confirmed. Phase delivery recommended — H2 budget gated on H1 enrollment data." },
              { rank: 11, name: "Clinical Data Platform — Revised Scope", theme: "Digital Transform.", owner: "L. Torres", budget: "$2.2M", score: 80, rec: "Conditional", rationale: "Scope limited to clinical ops per owner revision. Conditional — revised scope must be resubmitted before release." },
              { rank: 12, name: "Infection Control Protocol System", theme: "Clinical Quality", owner: "Dr. Reyes", budget: "$0.5M", score: 80, rec: "Fund", rationale: "Low budget, high specificity. Fast to execute. Direct HAI protocol adherence KR." },
              { rank: 13, name: "Supply Chain Analytics Platform", theme: "Operational Eff.", owner: "D. Chen", budget: "$1.8M", score: 80, rec: "Fund", rationale: "Operational KR alignment. Complements Rank 9 — committee should confirm these are sequenced, not parallel." },
            ],
          },
          {
            label: "CONDITIONAL — Score 60–79",
            status: "amber",
            projects: [
              { rank: 14, name: "Virtual Care Expansion", theme: "Clinical Quality", owner: null, budget: "$2.1M", score: 76, rec: "Conditional", rationale: "No owner. Possible duplicate of Rank 6. Resolve before funding." },
              { rank: 15, name: "Telehealth Infrastructure Upgrade", theme: "Digital Transform.", owner: null, budget: "$1.8M", score: 74, rec: "Conditional", rationale: "Possible duplicate of Rank 14. Committee must resolve merge vs. defer." },
              { rank: 16, name: "Enterprise Knowledge Management", theme: "Digital Transform.", owner: "L. Torres", budget: "$3.8M", score: 71, rec: "Conditional", rationale: "KR alignment weak — no direct connection to any Digital Transformation objective. Requires resubmission with explicit KR mapping." },
              { rank: 17, name: "Workforce Scheduling Optimization", theme: "Operational Eff.", owner: null, budget: "$1.4M", score: 70, rec: "Conditional", rationale: "No owner. Scope overlaps with Rank 4 — David Chen should confirm additive." },
              { rank: 18, name: "Predictive Readmission Model", theme: "Clinical Quality", owner: "Dr. Reyes", budget: "$2.4M", score: 69, rec: "Conditional", rationale: "Pilot data not yet complete. Financial impact score cannot be validated. Conditional on pilot results." },
              { rank: 19, name: "Leadership Pipeline — External", theme: "Workforce", owner: "M. Webb", budget: "$1.2M", score: 68, rec: "Conditional", rationale: "Possible scope overlap with Rank 10. Marcus Webb to confirm sequential, not duplicative." },
              { rank: 20, name: "Staff Wellness Program", theme: "Workforce", owner: "M. Webb", budget: "$0.9M", score: 65, rec: "Conditional", rationale: "KR connection to turnover rate is indirect. Funding both Ranks 3 and 20 may be redundant." },
            ],
          },
          {
            label: "DEFERRED — Score below 60",
            status: "red",
            projects: [
              { rank: 26, name: "Executive Dashboard — Board Reporting", theme: "Digital Transform.", owner: null, budget: "$1.2M", score: 54, rec: "Defer", rationale: "No KR alignment. Board reporting is governance, not strategic delivery. Defer to FY28." },
              { rank: 27, name: "Annual Training Digitization", theme: "Workforce", owner: null, budget: "$0.8M", score: 51, rec: "Defer", rationale: "Maintenance activity. Does not advance leadership pipeline KR." },
              { rank: 28, name: "Facilities Maintenance Scheduling", theme: "Operational Eff.", owner: null, budget: "$1.4M", score: 48, rec: "Defer", rationale: "KR connection to OR turnaround is not established in proposal." },
            ],
          },
        ],
        summary: {
          recommended: { count: 13, budget: "$27.4M" },
          conditional: { count: 12, budget: "$17.8M" },
          deferred: { count: 9, budget: "$11.0M" },
          envelope: "$52.7M",
          ifAllConditionals: "$45.2M — within envelope. $7.5M headroom.",
        },
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Three committee decisions that will determine the outcome before any individual project is debated:",
      ],
      bullets: [
        { label: "The duplicate pair.", detail: "Ranks 14 and 15 are almost certainly the same project submitted by two different divisions. Resolving this before the meeting saves $1.8–2.1M and removes 30 minutes of table debate." },
        { label: "The ownerless rule.", detail: "Four proposals have no owner. If the committee agrees upfront that ownerless proposals are ineligible, these four are removed from discussion before scoring begins." },
        { label: "Digital Transformation over-cap.", detail: "Even after deferring Rank 16 and the duplicates, Digital Transformation may still be over $13M. Lisa Torres may need to select between her own proposals. Better to surface that to her before Thursday than during it." },
      ],
    },
    { role: "user", text: "Generate the committee-ready cutline view. Remove scores from the output — I want the committee focused on decisions, not debating methodology." },
    {
      role: "ai",
      paragraphs: [
        "Committee view generated. Scores removed. Decision framing only.",
      ],
      artifact: {
        title: "FY27 Prioritization — Committee Decision View",
        subtitle: "No scores · decision framing only",
        type: "committee_decision",
        aboveCutline: {
          label: "Above cutline — Recommended for approval",
          summary: "13 projects · $27.4M · All five themes represented · All have named owners and confirmed KR alignment",
          themes: [
            { name: "Clinical Quality", projects: [
              { name: "Sepsis Early Warning System", owner: "Dr. Reyes", budget: "$2.8M", rationale: "Vendor contract expires Q2. Direct KR delivery." },
              { name: "HAI Surveillance & Reporting Upgrade", owner: "Dr. Reyes", budget: "$1.6M", rationale: "Current system end-of-life Q2. KR-aligned." },
              { name: "Discharge Process Redesign", owner: "Dr. Reyes", budget: "$2.2M", rationale: "Length-of-stay KR. Requires CMO co-ownership." },
              { name: "Infection Control Protocol System", owner: "Dr. Reyes", budget: "$0.5M", rationale: "Low budget, high specificity. HAI protocol adherence." },
            ]},
            { name: "Digital Transformation", projects: [
              { name: "EHR Consolidation — Phase 3", owner: "L. Torres", budget: "$4.1M", rationale: "Final phase of multi-year program." },
              { name: "Telehealth Expansion — Phase 2", owner: "L. Torres", budget: "$3.4M", rationale: "Conditional on Phase 1 Q2 milestone." },
              { name: "Clinical Data Platform — Revised", owner: "L. Torres", budget: "$2.2M", rationale: "Scope limited to clinical ops. Revised scope pending." },
            ]},
            { name: "Workforce Resilience", projects: [
              { name: "Staff Retention Analytics Platform", owner: "M. Webb", budget: "$1.9M", rationale: "22%→16% turnover KR. Vendor selected." },
              { name: "Leadership Development Track", owner: "M. Webb", budget: "$1.9M", rationale: "Pipeline KR. H2 budget gated on H1 enrollment." },
            ]},
            { name: "Operational Efficiency", projects: [
              { name: "OR Scheduling System Replacement", owner: "D. Chen", budget: "$3.1M", rationale: "OR turnaround objective. Prior comparable implementation." },
              { name: "Supply Chain Consolidation", owner: "D. Chen", budget: "$1.8M", rationale: "Vendor timeline revised to 10 months." },
              { name: "Supply Chain Analytics Platform", owner: "D. Chen", budget: "$1.8M", rationale: "Complements consolidation. Confirm sequencing." },
            ]},
            { name: "Op. & Financial Performance", projects: [
              { name: "Revenue Cycle Automation", owner: "CFO Office", budget: "$2.1M", rationale: "Net clean claim rate KR. Finance-documented." },
            ]},
          ],
        },
        decisions: [
          { number: 1, title: "Duplicate resolution", time: "10 minutes", body: "Telehealth Infrastructure Upgrade (IT, $1.8M) and Virtual Care Expansion (Clinical Ops, $2.1M) describe substantially overlapping scope. Options: merge into single proposal, one defers to FY28, or committee confirms these are genuinely distinct." },
          { number: 2, title: "Ownerless proposals", time: "5 minutes", body: "4 proposals have no named project owner. Recommend committee ratify a standing rule: no proposal without a named owner may be approved. Removes 4 proposals from active discussion." },
          { number: 3, title: "Digital Transformation cap", time: "15 minutes", body: "After duplicate resolution and owner rule, Digital Transformation remains over $13M cap. Lisa Torres holds 3 proposals above the cutline ($9.7M combined). Committee should ask her to rank them and confirm whether all three can be executed in parallel with available FTEs." },
          { number: 4, title: "Conditional approvals", time: "20 minutes", body: "Six proposals are recommended for conditional approval pending specific resolution. Each has one named condition. Full list with conditions attached." },
        ],
        belowCutline: {
          label: "Below cutline — Deferred",
          summary: "9 projects · $11.0M · Deferred rationale documented per project. Available for FY28 resubmission.",
        },
        footer: "If all four decisions resolve as recommended, total approved portfolio: $45.2M · 25 projects · $7.5M headroom · all guardrails met.",
      },
    },
  ],
  "7": [
    { role: "user", text: "We have a potential mid-year budget situation. The CFO is signaling a possible 12% reduction from the approved $62M. I need to model the portfolio impact before the executive team session on Friday. Include a hold-flat scenario and an upside scenario as well for context." },
    {
      role: "ai",
      paragraphs: [
        "Understood. I'll model three scenarios: the 12% reduction, hold-flat at approved $62M, and a 10% growth scenario for comparative framing. Before the models, here is the current execution state — the scenarios need to be read against what's already spent and committed, not the original approved figures.",
      ],
      artifact: {
        title: "Current portfolio position — baseline for scenario modeling",
        subtitle: "$12.4M spent · 25 active projects · 8 weeks into FY27",
        type: "table",
        cols: ["Theme", "Approved budget", "Spent to date", "Committed not yet spent", "Available to reallocate"],
        rows: [
          ["Clinical Quality", "$9.8M", "$2.1M", "$4.2M", "$3.5M"],
          ["Digital Transformation", "$13.8M", "$4.8M", "$5.9M", "$3.1M"],
          ["Workforce Resilience", "$3.8M", "$0.6M", "$1.4M", "$1.8M"],
          ["Operational Efficiency", "$4.9M", "$2.4M", "$1.8M", "$0.7M"],
          ["Op. & Financial Performance", "$6.2M", "$2.5M", "$2.9M", "$0.8M"],
          ["Reserve", "$9.3M", "$0", "$0", "$9.3M (locked)"],
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Important constraint: $15.3M is already committed and in contract. Any reduction scenario can only act on the $35.2M not yet committed — not the full portfolio. This limits the realistic scope of cuts.",
        "Here are the three scenarios modeled against that constraint:",
      ],
      artifact: {
        title: "Scenario comparison — FY27 mid-year",
        subtitle: "A — Reduced · B — Hold flat · C — Growth",
        type: "scenario_comparison",
        scenarios: [
          { id: "A", label: "A — Reduced ($55M)" },
          { id: "B", label: "B — Hold flat ($62M)" },
          { id: "C", label: "C — Growth ($68M)" },
        ],
        budget: {
          cols: ["", "A — Reduced", "B — Hold flat", "C — Growth"],
          rows: [
            ["Total budget", "$55M", "$62M", "$68M"],
            ["Reserve (15%)", "$8.25M", "$9.3M", "$10.2M"],
            ["Spendable", "$46.75M", "$52.7M", "$57.8M"],
            ["Already spent", "$12.4M", "$12.4M", "$12.4M"],
            ["Already committed", "$15.3M", "$15.3M", "$15.3M"],
            ["Available to allocate", "$19.05M", "$25.0M", "$30.1M"],
            ["vs. current plan", { t: "–$5.95M", c: "red" }, { t: "Baseline", c: "green" }, { t: "+$5.1M", c: "green" }],
          ],
        },
        projectDelta: {
          a: {
            label: "18 projects continue as planned. 4 require scope reduction. 2 suspended.",
            projects: [
              { name: "Clinical Data Platform", budget: "$1.3M saved", reason: "Phase 1 only. Enterprise integration deferred." },
              { name: "Telehealth Phase 2", budget: "$0.8M saved", reason: "Scale to 6 sites instead of 11." },
              { name: "Leadership Dev — External", budget: "$0.8M saved", reason: "Reduced to 1 cohort." },
              { name: "Revenue Cycle Automation", budget: "$1.8M saved", reason: "Suspended — defer to FY28." },
              { name: "Leadership Track — H2", budget: "$1.2M saved", reason: "H2 phase suspended per original gate." },
            ],
            summary: "23 active projects. $46.75M spendable. $5.95M recovered.",
          },
          b: { label: "All 25 projects funded as approved. No changes.", projects: null },
          c: {
            label: "All 25 retained. 4 deferred projects re-enter from FY28 list.",
            projects: [
              { name: "Enterprise Knowledge Management", budget: "$3.8M", reason: "Re-enters with explicit KR mapping." },
              { name: "Predictive Readmission Model", budget: "$2.4M", reason: "Pilot data now available." },
              { name: "Staff Wellness Program", budget: "$0.9M", reason: "Additive value confirmed by M. Webb." },
              { name: "Workforce Scheduling", budget: "$1.4M", reason: "Owner assigned. Scope confirmed additive." },
            ],
            summary: "29 active projects. $57.8M spendable. Guardrail conflict: 488 FTEs — 68 over cap.",
          },
        },
        timelineImpact: {
          a: "Q2 pressure reduces significantly. FTE demand drops to 371 — buffer of 49 below guardrail. Most resilient capacity profile.",
          b: "Timeline as approved. Q2 at guardrail (420 FTEs). No buffer for unplanned work.",
          c: "Q2 worsens to 488 FTEs. 68 over guardrail. Exception required. HR workforce plan needed.",
        },
        capacityImpact: {
          a: "371 FTEs at Q2 peak. Buffer of 49. Low risk.",
          b: "420 FTEs at Q2 peak. At guardrail. Medium risk.",
          c: "488 FTEs at Q2 peak. Over by 68. High risk — exception needed.",
        },
        guardrailConflict: "Scenario C requires 488 FTEs at Q2 peak. Confirmed capacity is 420. The 68-person gap requires a formal workforce plan from HR or Q3 release dates for the 4 re-entering projects.",
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Three things worth surfacing for the executive team:",
      ],
      bullets: [
        { label: "The 12% cut is not evenly distributable.", detail: "$15.3M is already in contract. Cuts of $5.95M can only come from the $19M not yet committed — which means the effective reduction rate on uncommitted work is 31%, not 12%. The executive team should understand this before they agree to a headline number." },
        { label: "Operational Efficiency should not be cut mid-process.", detail: "OR Scheduling is in active vendor selection. Suspending it now means losing the RFP investment and restarting. The sunk cost argument is real here, not rhetorical." },
        { label: "Scenario C requires an FTE exception.", detail: "Growth of 4 projects adds 68 FTEs above the guardrail at Q2 peak. If growth is the direction, HR needs a parallel workforce plan or the projects need Q3 release dates rather than Q1." },
      ],
    },
    { role: "user", text: "Model the specific project suspensions and scope reductions for Scenario A. I need to be able to defend each decision to the project owners." },
    {
      role: "ai",
      paragraphs: [
        "Here are the specific decisions for Scenario A with rationale defensible to project owners.",
      ],
      artifact: {
        title: "Scenario A — project-level decisions",
        subtitle: "2 suspensions · 3 scope reductions · $5.9M recovered",
        type: "scenario_a_decisions",
        scopeReductions: [
          { project: "Clinical Data Platform", decision: "Reduce from $2.9M to $1.6M", saving: "$1.3M", rationale: "Phase 1 (clinical ops reporting) proceeds. Enterprise integration deferred to FY28. Owner already scoped this down voluntarily in intake — precedent exists.", ownerNote: "Phase 1 scope only as discussed at intake. Enterprise layer moves to FY28 planning cycle." },
          { project: "Telehealth Phase 2", decision: "Reduce from $3.4M to $2.6M", saving: "$0.8M", rationale: "Scale-up to 6 additional sites instead of 11. Phase 1 adoption data not yet at trigger threshold — smaller Phase 2 is consistent with actual Phase 1 performance.", ownerNote: "Scale adjusted to align with Phase 1 adoption trajectory. Remaining sites addressed in mid-year review." },
          { project: "Leadership Dev — External Cohort", decision: "Reduce from $1.2M to $0.4M", saving: "$0.8M", rationale: "Internal cohort (Rank 10) continues in full. External program reduces to 1 cohort instead of 3.", ownerNote: "Internal cohort protected. External program reduced to single cohort pending H1 retention data." },
        ],
        suspensions: [
          { project: "Revenue Cycle Automation", decision: "Suspend — defer to FY28", saving: "$1.8M", rationale: "No contracts signed. Lowest strategic alignment score in the approved tier. Financial impact KR can be partially addressed through existing revenue cycle processes.", ownerNote: "Project deferred to FY28 intake cycle. Budget reallocated. EPMO will support resubmission with updated scope." },
          { project: "Leadership Development Track — H2", decision: "Suspend H2 phase", saving: "$1.2M", rationale: "H2 budget was already gated on H1 enrollment data per original approval condition. H1 data not yet available. Suspension is consistent with the original conditional approval — not a new decision.", ownerNote: "H2 phase consistent with original gate condition. H1 data review in Q2 will inform FY28 planning." },
        ],
        totalSaving: "$5.9M",
        summary: "2 suspensions · 3 scope reductions · All five themes remain active · No clinical safety projects touched",
      },
    },
    {
      role: "ai",
      paragraphs: [
        "And here is the one-page executive summary formatted for the Friday session:",
      ],
      artifact: {
        title: "Scenario A executive summary — one page",
        subtitle: "Formatted for Friday executive session",
        type: "executive_summary",
        headline: "FY27 Portfolio — Mid-Year Scenario A: $55M",
        sections: [
          { label: "Situation", body: "$62M approved portfolio. CFO signaling potential 12% reduction. $15.3M already contracted — cuts limited to uncommitted budget only. Effective reduction rate on uncommitted work: 31%." },
          { label: "Response", body: "2 project suspensions, 3 scope reductions. No clinical quality or patient safety projects affected. No projects in active vendor selection disrupted. All five strategic themes remain funded." },
          { label: "Financial outcome", body: "$5.9M recovered. New total: $55M. Reserve maintained at 15% ($8.25M). 23 active projects vs. 25 approved." },
          { label: "Risk", body: "Leadership pipeline theme takes the largest proportional reduction (37%). If voluntary turnover does not improve in H1, this will become a governance issue by Q3." },
          { label: "Recommendation", body: "If reduction is confirmed, implement Scenario A as described. If reduction is under 8%, scope reductions alone are sufficient — no suspensions required." },
        ],
      },
    },
  ],
  "8": [
    { role: "user", text: "Q1 execution review. Pull current portfolio health across all active projects. I want baseline drift identified, milestone performance, budget actuals, and any capacity issues before I prepare the board report." },
    {
      role: "ai",
      paragraphs: [
        "Full Q1 health assessment complete. I've pulled status, spend, milestone, and KR data across all 23 active projects. The headline before the detail: the portfolio is amber. Not a crisis, but two themes have structural issues that will compound if not addressed before Q2.",
      ],
      artifact: {
        title: "Q1 Execution Health Dashboard — FY27",
        subtitle: "23 active projects · 4 summary metrics · theme health grid",
        type: "health_dashboard",
        metrics: [
          { label: "Overall portfolio health", value: "AMBER", detail: "16 of 23 projects on track (70%)", color: "amber" },
          { label: "Budget utilization", value: "$14.2M of $46.75M", detail: "30% — slightly below Q1 plan of 33%", color: "amber" },
          { label: "Milestone hit rate", value: "68%", detail: "22 of 32 Q1 milestones completed on time", color: "amber" },
          { label: "KR progress reporting", value: "61%", detail: "17 of 28 KRs have reported data. 11 still showing no Q1 actuals.", color: "amber" },
        ],
        themes: [
          { name: "Clinical Quality & Patient Safety", rag: "green", onTrack: "4 of 4", budget: "$3.2M of $9.8M (33%)", krs: "6 of 8 reporting", trend: "stable" },
          { name: "Digital Transformation", rag: "amber", onTrack: "2 of 4", budget: "$5.1M of $10.9M (47% — ahead)", krs: "3 of 6 reporting", trend: "deteriorating" },
          { name: "Workforce Resilience", rag: "amber", onTrack: "2 of 3", budget: "$0.9M of $2.4M (38%)", krs: "2 of 5 reporting", trend: "stable" },
          { name: "Operational Efficiency", rag: "red", onTrack: "2 of 4", budget: "$2.8M of $4.9M (57% — ahead)", krs: "3 of 5 reporting", trend: "deteriorating" },
          { name: "Op. & Financial Performance", rag: "green", onTrack: "2 of 2", budget: "$2.2M of $6.2M (35%)", krs: "3 of 4 reporting", trend: "stable" },
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Here is the baseline drift analysis:",
      ],
      artifact: {
        title: "Baseline drift report — Q1",
        subtitle: "10 KRs tracked · 4 drifting negatively",
        type: "table",
        cols: ["KR", "Theme", "Baseline", "Q1 actual", "Target", "Drift", "Assessment"],
        rows: [
          ["HAI rate per 1,000", "Clinical Quality", "4.2", "4.0", "3.4 by Q4", "–0.2 ahead", { badge: "On track", color: "green" }],
          ["Voluntary turnover rate", "Workforce", "22%", "22.1%", "16% by Q4", "+0.1%", { badge: "Marginal", color: "amber" }],
          ["OR first-case on-time start", "Operational Eff.", "64%", "61%", "85% by Q4", "–3pts below", { badge: "At risk", color: "red" }],
          ["OR room turnover time", "Operational Eff.", "38 min", "40 min", "28.5 min by Q4", "+2 min above", { badge: "At risk", color: "red" }],
          ["Telehealth visit rate", "Digital Transform.", "18%", "21%", "40% by Q4", "+3pts ahead", { badge: "On track", color: "green" }],
          ["EHR adoption rate", "Digital Transform.", "0%", "0%", "90% by Q4", "N/A — go-live Q3", { badge: "Expected", color: "green" }],
          ["Sepsis door-to-antibiotic", "Clinical Quality", "74 min", "71 min", "≤60 min by Q4", "–3 min ahead", { badge: "On track", color: "green" }],
          ["Net clean claim rate", "Op. & Fin. Perf.", "82%", "83%", "90% by Q4", "+1pt", { badge: "On track", color: "green" }],
          ["Workforce time-to-fill", "Workforce", "47 days", "51 days", "30 days by Q4", "+4 days above", { badge: "At risk", color: "red" }],
          ["Supply chain cost variance", "Operational Eff.", "0%", "+2.1%", "–12% by Q4", "Wrong direction", { badge: "At risk", color: "red" }],
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "4 KRs drifting negatively in Q1. All four are in Operational Efficiency — the same theme showing Red health status. Root cause is OR Scheduling implementation delay, which is creating downstream effects across multiple KRs.",
      ],
    },
    { role: "user", text: "Explain the Operational Efficiency deterioration. I need to understand root cause before I take this to the board." },
    {
      role: "ai",
      paragraphs: [
        "The Operational Efficiency deterioration traces to a single root cause with cascading effects. Here is the full causal chain.",
      ],
      artifact: {
        title: "Operational Efficiency — root cause analysis",
        subtitle: "Single root cause · cascading effects · 4 KRs impacted",
        type: "root_cause",
        chain: [
          "OR Scheduling System Replacement (Rank 4 — $3.1M) is 6 weeks behind plan. Vendor selection, originally due Week 3, was not completed until Week 9.",
          "OR staff still using manual scheduling → No improvement in turnaround time",
          "OR first-case on-time start rate declining (now 61%, down from 64% baseline)",
          "OR room turnover time increasing (now 40 min, up from 38 min baseline)",
          "OR throughput below plan → Surgical volume constraints → Patient flow pressure downstream",
        ],
        secondaryEffects: [
          "Shared FTE conflict: OR Scheduling team shares 8 FTEs with EHR implementation. 6-week delay shifts OR team availability into Q2 — compressing the same window EHR needs those FTEs.",
          "Supply chain impact: Consolidation savings partially dependent on stable OR procedure volume. Lower surgical throughput weakens vendor negotiation leverage.",
        ],
        projectStatus: {
          cols: ["Project", "Status", "Schedule", "Spend rate", "Root issue"],
          rows: [
            ["OR Scheduling System", { badge: "Red", color: "red" }, "6 weeks behind", "57% spent — ahead due to delay costs", "Vendor selection delay — now resolved. Implementation starts Week 11."],
            ["Supply Chain Consolidation", { badge: "Amber", color: "amber" }, "2 weeks behind", "On plan", "Dependent on OR volume stability."],
            ["OR Capacity Planning Tool", { badge: "Amber", color: "amber" }, "On schedule", "On plan", "No owner for 3 weeks — owner now assigned."],
            ["Discharge Process Redesign", { badge: "Amber", color: "amber" }, "3 weeks behind", "Underspent", "Cross-functional scope dispute unresolved."],
          ],
        },
      },
    },
    {
      role: "ai",
      paragraphs: [
        "The good news: the root cause is identifiable and the OR Scheduling vendor issue is now resolved. Implementation starts Week 11. If the implementation proceeds on its revised timeline, Q3 should show improvement across the KRs. The board needs to see this as a lagging recovery situation, not an accelerating problem.",
        "The risk: the shared FTE constraint in Q2 is real. If EHR implementation and OR Scheduling both draw on the same 8 implementation FTEs simultaneously, one of them will slip. This needs a resource allocation decision before Q2 begins.",
      ],
    },
    { role: "user", text: "Generate the full board report package. Executive summary, portfolio RAG, the four at-risk KRs with recovery plans, and a capacity outlook for Q2." },
    {
      role: "ai",
      paragraphs: [
        "Board report package generated. Four sections, formatted for executive audience.",
      ],
      artifact: {
        title: "Q1 Board Report — FY27 Portfolio Execution",
        subtitle: "Executive summary · RAG · At-risk KRs · Q2 capacity outlook",
        type: "board_report",
        sections: [
          {
            title: "Section 1 — Executive Summary",
            paragraphs: [
              "FY27 portfolio is 70% on track at end of Q1. Two themes — Clinical Quality and Operational & Financial Performance — are performing at or above plan. Operational Efficiency is the primary concern: a vendor selection delay on OR Scheduling has created schedule pressure across the theme and compressed shared FTE availability in Q2.",
              "Recovery plan is active. Three of four at-risk KRs in Operational Efficiency are expected to recover in Q2 once OR Scheduling implementation begins. One KR — workforce time-to-fill — requires separate attention independent of OR Scheduling.",
              "No budget overruns. No scope changes outside previously approved parameters. Reserve intact at $8.25M (15%).",
            ],
          },
          {
            title: "Section 2 — Portfolio RAG by Theme",
            paragraphs: [
              "Clinical Quality & Patient Safety: GREEN — 4 of 4 on track, 33% budget utilized, 6 of 8 KRs reporting. Stable.",
              "Digital Transformation: AMBER — 2 of 4 on track, 47% budget utilized (ahead), 3 of 6 KRs reporting. Deteriorating.",
              "Workforce Resilience: AMBER — 2 of 3 on track, 38% budget utilized, 2 of 5 KRs reporting. Stable.",
              "Operational Efficiency: RED — 2 of 4 on track, 57% budget utilized (ahead due to delay costs), 3 of 5 KRs reporting. Deteriorating.",
              "Op. & Financial Performance: GREEN — 2 of 2 on track, 35% budget utilized, 3 of 4 KRs reporting. Stable.",
            ],
            note: "Operational Efficiency RAG will be reviewed at the Q2 governance checkpoint April 1. Expected to move to Amber by end of Q2.",
          },
          {
            title: "Section 3 — At-Risk KRs with Recovery Plans",
            krs: [
              { kr: "OR first-case on-time start", current: "61%", target: "85%", rootCause: "OR Scheduling not yet live", recovery: "System live by end of Q2. Expected 68% by Q2, 80% by Q3.", owner: "David Chen" },
              { kr: "OR turnaround time", current: "40 min", target: "28.5 min", rootCause: "Same root cause — OR Scheduling", recovery: "Expected 35 min by Q2.", owner: "David Chen" },
              { kr: "Workforce time-to-fill", current: "51 days", target: "30 days", rootCause: "Market conditions + Leadership Development not yet generating pipeline", recovery: "Targeted recruitment acceleration plan by end of month.", owner: "Marcus Webb" },
              { kr: "Supply chain cost variance", current: "+2.1%", target: "–12%", rootCause: "Vendor consolidation savings dependent on stable OR volume", recovery: "Tracks with OR improvement. No independent action needed.", owner: "David Chen" },
            ],
          },
          {
            title: "Section 4 — Q2 Capacity Outlook",
            paragraphs: [
              "Key finding: EHR Implementation team and OR Scheduling team share 8 FTEs. Both projects require those FTEs in April–May. Combined demand is 112% of that team's capacity in April.",
              "Recommendation: EHR infrastructure build takes priority in April (contract milestone). OR Scheduling configuration begins May 1. Two-week sequencing delay is acceptable within revised timeline. David Chen and Lisa Torres have been briefed.",
              "Q2 FTE demand overall: 408 of 420 capacity (97%). Tight but within guardrail. No exception required.",
            ],
            note: "Full project-level data, KR actuals, and spend details available in the EPMO Smartsheet portfolio. Next formal review: Q2 Governance Checkpoint, April 1.",
          },
        ],
      },
    },
  ],
  "9": [
    { role: "user", text: "I want a current read on intake submissions. Intake is still open but I need to identify data quality issues and flag anything that will be a problem at committee before we get there." },
    {
      role: "ai",
      paragraphs: [
        "Current snapshot as of this morning. 27 of an expected ~35 proposals submitted. Eight days remaining in the intake window.",
      ],
      artifact: {
        title: "Intake submissions — live status",
        subtitle: "27 proposals received · intake window closes in 8 days",
        type: "table",
        cols: ["Theme", "Proposals in", "Budget requested", "Cap", "Projected position", "Data quality flags"],
        rows: [
          ["Clinical Quality & Patient Safety", "7", "$11.4M", "$13M", { badge: "Under", color: "green" }, "1 flag: pilot study not yet completed"],
          ["Digital Transformation", "8", "$19.2M", "$13M", { badge: "Over by $6.2M", color: "red" }, "3 flags: 2 no owner, 1 duplicate"],
          ["Workforce Resilience", "4", "$5.8M", "$13M", { badge: "Under", color: "green" }, "0 flags"],
          ["Operational Efficiency", "5", "$7.3M", "$13M", { badge: "Under", color: "green" }, "2 flags: 2 no owner"],
          ["Op. & Financial Performance", "3", "$4.1M", "$13M", { badge: "Under", color: "green" }, "0 flags"],
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Digital Transformation is tracking $6.2M over cap with 8 days remaining and likely 2–3 more proposals incoming. This theme will require the most committee time.",
        "Seven data quality issues identified across the 27 proposals. I'd recommend resolving as many as possible before intake closes rather than presenting a correctable problem to the committee.",
      ],
      artifact: {
        title: "Data quality issues — 27 proposals reviewed",
        subtitle: "7 issues · 4 missing owner · 1 duplicate · 1 incomplete evidence · 1 scope ambiguity",
        type: "issue_log",
        cols: ["Issue type", "Project", "Theme", "Detail", "Recommended action"],
        rows: [
          ["Missing owner", "Enterprise Data Lake", "Digital Transformation", "No project owner named. Owner field blank.", "Contact IT division lead for assignment before intake closes."],
          ["Missing owner", "Clinical Workflow Automation", "Digital Transformation", "No project owner named.", "Contact IT division lead."],
          ["Missing owner", "Vendor Consolidation Phase 2", "Operational Efficiency", "Submitted by procurement team but no named project owner.", "Assign before intake closes."],
          ["Missing owner", "OR Capacity Planning Tool", "Operational Efficiency", "No owner. Submitted by anonymous form entry.", "Cannot be scored without owner."],
          ["Possible duplicate", "Telehealth Infrastructure Upgrade", "Digital Transformation", "Scope overlaps with 'Virtual Care Expansion' from Clinical Ops. Combined ask: $3.9M.", "Flag both submitters — request scope clarification or merge."],
          ["Incomplete evidence", "Predictive Readmission Model", "Clinical Quality", "References pilot study results but no data attached.", "Request pilot data from Dr. Reyes' team."],
          ["Scope ambiguity", "Revenue Integrity Program", "Op. & Financial Perf.", "Describes both technology implementation and process redesign under one budget line.", "Request submitter to clarify or split."],
        ],
      },
    },
    {
      role: "ai",
      paragraphs: [
        "Three of the seven can be resolved before intake closes with a direct outreach. The duplicate and scope ambiguity issues need submitter input. The missing owner issues need division leads.",
        "Would you like me to draft outreach messages for the submitters and division leads for each open issue?",
      ],
    },
    { role: "user", text: "Yes. Draft the outreach. And flag any proposals where the KR mapping is weak — I don't want to discover that at committee." },
    {
      role: "ai",
      paragraphs: [
        "Outreach drafted for all seven issues. And here is the KR mapping quality assessment across all 27 proposals.",
      ],
      artifact: {
        title: "KR alignment quality — 27 proposals assessed",
        subtitle: "12 strong · 8 acceptable · 5 weak · 2 no KR cited",
        type: "kr_alignment",
        tiers: [
          {
            label: "STRONG ALIGNMENT",
            status: "green",
            count: 12,
            detail: "KR cited is specific, measurable, and directly advanced by the project scope. No action needed.",
            projects: null,
          },
          {
            label: "ACCEPTABLE ALIGNMENT",
            status: "amber",
            count: 8,
            detail: "KR cited is plausible but the connection is asserted rather than demonstrated. Flagged for committee awareness but not blocking.",
            projects: null,
          },
          {
            label: "WEAK ALIGNMENT",
            status: "red",
            count: 5,
            detail: "KR connection not established. Submitters should strengthen before committee.",
            projects: [
              { name: "Enterprise Knowledge Management", theme: "Digital Transformation", kr: "Claims real-time reporting KR", issue: "Knowledge management does not advance reporting capability. No credible mechanism." },
              { name: "Staff Wellness Initiative", theme: "Workforce Resilience", kr: "Claims turnover KR", issue: "Wellness programs are a contributing input, not a direct driver of the 22%→16% KR." },
              { name: "Executive Dashboard — Board Reporting", theme: "Digital Transformation", kr: "Claims data infrastructure KR", issue: "Board reporting is a governance output, not infrastructure." },
              { name: "Annual Training Digitization", theme: "Workforce Resilience", kr: "Claims leadership pipeline KR", issue: "Digitizing existing training is maintenance, not pipeline development." },
              { name: "Facilities Maintenance Scheduling", theme: "Operational Efficiency", kr: "Claims OR turnaround KR", issue: "Does not establish credible connection to OR throughput metrics." },
            ],
          },
        ],
        footer: "5 proposals with weak KR alignment represent $9.1M in requests. If not strengthened before committee, they will be challenged and the meeting will spend disproportionate time on them.",
      },
    },
    {
      role: "ai",
      paragraphs: [
        "My recommendation: contact the five weak-alignment submitters now and ask them to either strengthen the KR connection in writing or acknowledge the proposal may not score well on strategic alignment. Better to have that conversation before Thursday than during it.",
      ],
    },
    { role: "user", text: "Send the outreach drafts to my review queue. And I want a daily intake summary report for the remaining 8 days." },
    {
      role: "ai",
      paragraphs: [
        "Outreach drafts queued for your review. Daily summary report configured.",
      ],
      artifact: {
        title: "FY27 Intake Daily Brief — Day 5 of 13",
        subtitle: "Auto-refreshing from Smartsheet intake sheet · 7am daily",
        type: "daily_brief",
        metrics: [
          { label: "Proposals received", value: "27", color: "green" },
          { label: "Days remaining", value: "8", color: "amber" },
          { label: "Total requested", value: "$47.8M", color: "amber" },
          { label: "Open data quality issues", value: "7", color: "red" },
        ],
        newToday: [
          { name: "Sepsis Early Warning System", theme: "Clinical Quality", budget: "$2.8M", owner: "Dr. Reyes", flags: "No flags" },
          { name: "Supply Chain Analytics Platform", theme: "Operational Efficiency", budget: "$1.4M", owner: "David Chen", flags: "No flags" },
        ],
        overCapWatch: "Digital Transformation at $19.2M against $13M cap. Now $6.2M over. Trend: 1 new proposal per day average. Projected final over-cap: $8–9M.",
        dataQuality: "7 issues open / 0 resolved. Outreach drafted and queued for EPMO review.",
        recommendedAction: "Review and approve outreach drafts. Assign owners to 4 ownerless proposals before end of week.",
        footer: "Report will auto-refresh each morning. Direct alert if any new over-cap threshold is crossed or a duplicate pattern emerges.",
      },
    },
  ],
  // Chat 11 zero state — intro + 4 recommended actions only.
  // The rest of the Day 1 walkthrough lives in ACTION_RESPONSES (one entry per action).
  "11": [
    {
      role: "ai",
      greeting: { muted: "Hi there, Mary", main: "Let's build a plan." },
      paragraphs: [
        "A plan gives your organization a shared view of **investment decisions across every portfolio**. It defines **what gets funded**, how budget is allocated across investment areas, and how each initiative connects to your **strategic goals**.",
        "To get started, Arc needs to understand your **strategy and financial boundaries**. Pick whichever path fits where you are today.",
      ],
    },
    {
      role: "ai",
      paragraphs: [],
      actionsVariant: "onboarding",
      actions: [
        { label: "Extract from your strategy docs", desc: "Upload strategy decks, board plans, or budget memos. Arc will extract your goals, investment envelopes, and financial guardrails, then use them to anchor the plan across your portfolios.", icon: "form", mins: 5, badge: "Fastest way to get started", tone: "neutral", style: "ghost" },
        { label: "5 portfolios found — Connect them", desc: "Arc detected 5 Smartsheet portfolios in your workspace. Connect them so it can pull in active work, reconcile budgets, and check for duplicates as plans take shape.", icon: "connect", prompt: "Connect my Smartsheet portfolios", tone: "neutral", style: "ghost" },
        { label: "Learn how Arc works", desc: "See the full planning flow before you dive in.", icon: "view", prompt: "Walk me through the planning process", tone: "neutral", style: "ghost" },
      ],
    },
  ],
  "12": [
    {
      role: "ai",
      greeting: { muted: "Hi there, Mary", main: "Welcome back." },
      paragraphs: [
        "Here's what's happened since your last session.",
      ],
      recapHeader: "Since you've been gone · 4 days",
      statusInline: [
        { s: "green", l: "New intake requests", n: "5 project requests have been submitted to your intake form.", action: "Review the 5 new intake requests" },
        { s: "amber", l: "Investment parameters", n: "6 parameters are still incomplete. Your intake scoring model is running on partial data.", action: "Finish your investment parameters" },
        { s: "amber", l: "Portfolios not yet connected", n: "Smartsheet portfolios aren't connected yet — I can't check for duplicates or reconcile budgets against in-flight work until they are.", action: "Connect your Smartsheet portfolios" },
        { s: "gray", l: "No collaborators added", n: "Nobody else has been invited to review or contribute to your planning setup.", action: "Add collaborators to your planning workspace" },
      ],
      nextSteps: [],
    },
  ],
  "13": [
    {
      role: "ai",
      greeting: { muted: "Hi Mary", main: "Welcome back." },
      paragraphs: [
        "Here's what's happened since your last session.",
      ],
      recapHeader: "Since you've been gone · 5 days",
      statusInline: [
        { s: "green", l: "17 new intake proposals", n: "Pulled from Smartsheet and scored against your weighted model. Together with prior cycles, the intake sheet now holds 30 submissions.", action: "Review the 17 new intake proposals", recommended: true, hideStatusPill: true },
        { s: "green", l: "Changes have been made to your investment parameters", n: "Your CapEx percentage has been adjusted by Sarah Kim.", action: "Review investment parameter changes", hideStatusPill: true },
        { s: "gray", l: "Create scenario", n: "Build a custom funding scenario from scratch — pick projects, set constraints, and compare against the recommended tiers.", action: "Build a custom scenario", hideStatusPill: true },
      ],
      nextSteps: [],
    },
  ],
  "14": [
    {
      role: "ai",
      greeting: { muted: "Hi Mary", main: "Welcome back." },
       paragraphs: [
         "Annual planning is locked — we're in monitoring and replanning now. Overnight sync just ran, so budget, schedule, and capacity reflect today's state of the plan.",
       ],
       recapHeader: "Monitoring & replanning · 10 days into execution",
       statusInline: [
         { s: "red", l: "Portfolio trending $4.6M over budget", n: "23 projects projecting to $38.6M vs $34M planned. Four projects drive 30% of the variance — candidates for a mid-cycle replan.", action: "Dive deeper on the budget issue", agentChip: "risk" },
         { s: "amber", l: "Capacity at 105.6% utilization", n: "266 FTEs active vs 252 planned. Security Analyst, UX Designer, and DevOps Engineer are over-allocated and need rebalancing.", action: "Show me capacity", agentChip: "risk" },
         { s: "info", l: "Live EPMO monitoring dashboard", n: "Fresh budget, schedule, and capacity data synced 4 hours ago. Open the live view to see how execution is tracking against plan.", action: "Show me the new EPMO dashboard", agentChip: "reporting" },
         { s: "amber", l: "2 vendor SLA breaches detected", n: "Sepsis Detection Tool and OR Scheduling vendors missed agreed response windows in the last 7 days. Worth a check-in before the next milestone.", action: "Show vendor health", agentChip: "risk" },
         { s: "info", l: "Replan opportunity: Scenario B shift", n: "Modeling shows resequencing two H2 projects under Scenario B frees ~$1.8M and relieves capacity pressure without missing commitments.", action: "Open scenario comparison", agentChip: "scenario" },
         { s: "info", l: "3 milestones slipped this week", n: "EHR Integration, Patient Portal v2, and OR Scheduling each slipped 4–7 days. Downstream dependencies still hold — but worth a replan check.", action: "Review slipped milestones", agentChip: "reporting" },
       ],
      nextSteps: [],
    },
  ],
};

// Pre-built "expanded" conversations shown in Recents. These concatenate
// the chat's base messages with a curated sequence of follow-up exchanges so
// the user sees the full flow at once.
CONVERSATIONS["11f"] = [
  ...CONVERSATIONS["11"],
  ...(ACTION_RESPONSES["Extract from your strategy docs"] || []),
  ...(ACTION_RESPONSES["__upload_docs__"] || []),
  ...(ACTION_RESPONSES["Build the intake form"] || []),
  ...(ACTION_RESPONSES["Connect Portfolios"] || []),
  ...(ACTION_RESPONSES["Show me recommended scenarios"] || []),
  { role: "user", text: "Lock Scenario A as the working baseline" },
  {
    role: "ai",
    inline: {
      type: "plan_baseline_celebration",
      title: "Your plan has been created",
      scenarioLabel: "A — Recommended ($42M)",
      body: "A — Recommended ($42M) is now your baseline and will be used in out-of-the-box reporting. Any changes to your strategic framework will kick off your intake and scenario agents to adjust your plan and all your portfolios.",
    },
    nextSteps: [
      { icon: "review", label: "Review your Arc Dashboard", detail: "Open the Arc Dashboard to see your baseline plan, funded portfolio, and live capacity & budget signals in one view.", featured: true, featuredNote: "Recommended next step — confirm your baseline is reporting cleanly." },
      { icon: "alert", label: "Set up baseline alerts for budget and capacity drift", detail: "Have Arc notify you the moment a portfolio drifts more than 5% from baseline budget or breaches its capacity guardrail." },
      { icon: "network", label: "Share the baseline with portfolio leads for sign-off", detail: "Send the locked baseline to portfolio owners so each lead can confirm scope, sequencing, and team commitments before kickoff." },
    ],
  },
];

CONVERSATIONS["14f"] = [
  ...CONVERSATIONS["14"],
  ...(ACTION_RESPONSES["Show me the new EPMO dashboard"] || []),
];

// Untitled "New chat" — shares the same welcome-back empty state as chat 14
// (just the greeting + bento), but is rendered as a separate entry in Recents
// with the title "Untitled".
CONVERSATIONS["untitled"] = CONVERSATIONS["14"];

const SCENARIOS = {
  cols: ["", "A — Balanced", "B — Conservative", "C — Accelerated"],
  rows: [
    ["Total budget", "$34M", "$28M", "$40M"],
    ["Reserve held", "$5.1M · 15%", "$6.2M · 22%", "$4.8M · 12%"],
    ["Spendable", "$28.9M", "$21.8M", "$35.2M"],
    ["Digital Transformation", "$13.2M · funded", "$13.2M · funded", "$15.8M · expanded"],
    ["Patient Safety", "$9.8M · funded", { t: "$7.4M · partial", c: "amber" }, "$11.4M · expanded"],
    ["Operational Excellence", "$6.1M · funded", "$6.1M · funded", "$7.2M · expanded"],
    ["Workforce Resilience", "$4.5M · funded", { t: "$0 — deferred", c: "red" }, "$5.6M · funded"],
    ["Active projects", "24", "19", { t: "31", c: "amber" }],
    ["FTE headcount", "420", "355", { t: "490 · +70 over cap", c: "red" }],
    ["Risk level", { t: "Medium", c: "amber" }, { t: "Low", c: "green" }, { t: "High", c: "red" }],
    ["Guardrail conflicts", { t: "None", c: "green" }, { t: "None", c: "green" }, { t: "FTE cap exceeded", c: "red" }],
    ["Submittable today", { t: "Yes", c: "green" }, { t: "Yes — with deferral", c: "amber" }, { t: "No — requires exception", c: "red" }],
  ],
};

const dotColor: Record<string, string> = { green: "#22c55e", amber: "#f59e0b", red: "#ef4444", gray: "#6b7280" };

const badgeClass: Record<string, string> = {
  green: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50",
  amber: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50",
  red: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50",
};

const actionClass: Record<string, string> = {
  primary: "bg-accent text-foreground border-border hover:bg-accent/80",
  amber: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40 dark:hover:bg-amber-900/30",
  red: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40 dark:hover:bg-red-900/30",
  ghost: "bg-transparent text-muted-foreground border-border hover:bg-accent",
};

const themeColorMap: Record<string, string> = { blue: "#3b82f6", green: "#22c55e", amber: "#f59e0b", purple: "#a855f7" };
const quarterPositions: Record<string, number> = { Q1: 0, Q2: 25, Q3: 50, Q4: 75 };
const quarterWidths = (start: string, end: string) => {
  const s = quarterPositions[start] || 0;
  const e = (quarterPositions[end] || 75) + 25;
  return { left: `${s}%`, width: `${e - s}%` };
};
const heatColor = (v: number) => v >= 90 ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" : v >= 70 ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" : "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400";

function PlanningViewPanel({ artifact }: { artifact: any }) {
  const [activeTab, setActiveTab] = useState(0);
  const tabLabels = artifact.tabs || ["Ranked list", "Timeline", "Capacity"];

  return (
    <div>
      <div className="flex items-center gap-0.5 mb-4 border-b border-border">
        {tabLabels.map((tab: string, i: number) => (
          <button key={i} onClick={() => setActiveTab(i)} className={`text-xs px-3 py-2 font-medium transition-colors border-b-2 -mb-px ${activeTab === i ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{tab}</button>
        ))}
      </div>
      <div className="text-[10px] text-muted-foreground mb-3 px-1">
        {artifact.header.scenario} — {artifact.header.total} total · {artifact.header.spendable} spendable · {artifact.header.projects} projects · {artifact.header.committed} committed · {artifact.header.headroom} headroom
      </div>

      {activeTab === 0 && (
        <div>
          {artifact.rankedList.funded.map((p: any, i: number) => (
            <div key={i} className="py-2 border-b border-border last:border-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xs text-muted-foreground/50 font-mono w-4 flex-shrink-0 text-right">{p.rank}</span>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: themeColorMap[p.themeColor] || "#6b7280" }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground truncate">{p.name}</div>
                    <div className="text-[10px] text-muted-foreground">{p.owner} · {p.budget}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-bold ${p.score >= 80 ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>{p.score}</span>
                  <span className="text-[10px] text-muted-foreground">{p.cumulative}</span>
                </div>
              </div>
            </div>
          ))}
          <div className="my-3 flex items-center gap-2">
            <div className="flex-1 border-t-2 border-dashed border-muted-foreground/30" />
            <span className="text-[10px] text-muted-foreground/60 px-2 flex-shrink-0">FUNDING CUTLINE</span>
            <div className="flex-1 border-t-2 border-dashed border-muted-foreground/30" />
          </div>
          <div className="text-[10px] text-muted-foreground/50 mb-2 px-1">{artifact.rankedList.cutlineLabel}</div>
          {artifact.rankedList.deferred.map((p: any, i: number) => (
            <div key={i} className="py-1.5 opacity-40">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-muted-foreground truncate flex-1">{p.name}</div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground">{p.budget}</span>
                  <span className="text-[10px] text-red-400">{p.score}</span>
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground/50 ml-0">{p.reason}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 1 && (
        <div className="space-y-5">
          {artifact.timeline.groups.map((group: any, gi: number) => (
            <div key={gi}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ background: themeColorMap[group.color] || "#6b7280" }} />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{group.theme}</span>
              </div>
              <div className="relative">
                <div className="flex text-[9px] text-muted-foreground/40 mb-1">
                  <span className="w-1/4">Q1</span><span className="w-1/4">Q2</span><span className="w-1/4">Q3</span><span className="w-1/4">Q4</span>
                </div>
                {group.projects.map((proj: any, pi: number) => {
                  const pos = quarterWidths(proj.start, proj.end);
                  return (
                    <div key={pi} className="mb-2">
                      <div className="text-[10px] text-foreground/70 mb-0.5 truncate">{proj.name}</div>
                      <div className="relative h-4 w-full">
                        <div className="absolute h-full rounded-sm" style={{ background: themeColorMap[group.color], opacity: 0.3, left: pos.left, width: pos.width }} />
                      </div>
                      {proj.flag && <div className="text-[9px] text-muted-foreground/50 mt-0.5 ml-1">⚑ {proj.flag}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="rounded-lg border-l-4 border-l-amber-500 border border-border bg-card px-3 py-2 text-xs text-muted-foreground leading-relaxed">
            {artifact.timeline.callout}
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div>
          <div className="text-[10px] text-muted-foreground mb-2">{artifact.capacity.totalFtes} FTE total capacity</div>
          <div className="overflow-x-auto">
          <table className="w-full text-[10px] min-w-[400px]">
            <thead>
              <tr>
                <th className="text-left text-muted-foreground/50 font-medium pb-1 pr-2">Team</th>
                <th className="text-center text-muted-foreground/50 font-medium pb-1 w-12">Q1</th>
                <th className="text-center text-muted-foreground/50 font-medium pb-1 w-12">Q2</th>
                <th className="text-center text-muted-foreground/50 font-medium pb-1 w-12">Q3</th>
                <th className="text-center text-muted-foreground/50 font-medium pb-1 w-12">Q4</th>
              </tr>
            </thead>
            <tbody>
              {artifact.capacity.teams.map((team: any, i: number) => (
                <tr key={i} className="border-t border-border">
                  <td className="py-1.5 pr-2">
                    <div className="text-foreground/80 font-medium">{team.name}</div>
                    <div className="text-muted-foreground/40">{team.ftes} FTEs</div>
                    {team.note && <div className="text-muted-foreground/30 mt-0.5">{team.note}</div>}
                  </td>
                  {[team.q1, team.q2, team.q3, team.q4].map((v: number, qi: number) => (
                    <td key={qi} className="text-center py-1.5">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${heatColor(v)}`}>{v}%</span>
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t-2 border-foreground/20">
                <td className="py-1.5 pr-2 text-foreground font-bold">Total</td>
                {[artifact.capacity.totals.q1, artifact.capacity.totals.q2, artifact.capacity.totals.q3, artifact.capacity.totals.q4].map((v: number, qi: number) => (
                  <td key={qi} className="text-center py-1.5">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${heatColor(v)}`}>{v}%</span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          </div>
          <div className="rounded-lg border-l-4 border-l-red-500 border border-border bg-card px-3 py-2 text-xs text-muted-foreground leading-relaxed mt-3">
            {artifact.capacity.callout}
          </div>
        </div>
      )}
    </div>
  );
}

function ScenarioComparisonPanel({ artifact }: { artifact: any }) {
  const sc = artifact;
  const firstId = sc?.scenarios?.[0]?.id || "";
  const [viewingId, setViewingId] = React.useState<string>(firstId);

  if (!sc || !sc.scenarios || !sc.budget || !sc.projectDelta) {
    return <div className="text-xs text-muted-foreground">No scenario data available.</div>;
  }

  // Build per-scenario summary cards (Arc 6 style)
  const keys = ["a", "b", "c", "d", "e", "f"];
  const summaryRow = sc.budget.rows[0] || [];
  const fundedRow = sc.budget.rows.find((r: any[]) => String(r[0]).toLowerCase().includes("project")) || [];
  const guardrailRow = sc.budget.rows.find((r: any[]) => String(r[0]).toLowerCase().includes("guardrail")) || [];

  const cards = sc.scenarios.map((s: any, i: number) => {
    const budgetCell = summaryRow[i + 1];
    const budgetVal = typeof budgetCell === "object" ? budgetCell.t : budgetCell;
    const fundedCell = fundedRow[i + 1];
    const fundedVal = typeof fundedCell === "object" ? fundedCell.t : fundedCell;
    const guardrailCell = guardrailRow[i + 1];
    const guardrailColor = typeof guardrailCell === "object" ? guardrailCell.c : "green";
    const guardrailText = typeof guardrailCell === "object" ? guardrailCell.t : (guardrailCell || "OK");
    const k = keys[i];
    const desc = (sc.projectDelta?.[k]?.label || "").split(".")[0] + ".";
    return { id: s.id, label: s.label, budget: budgetVal, funded: fundedVal, desc, guardrailColor, guardrailText };
  });

  const dotColor = (c: string) =>
    c === "red" ? "bg-red-500" : c === "amber" ? "bg-amber-500" : "bg-green-500";

  return (
    <div>
      {/* Arc 6 — Scenario summary cards */}
      <div className="space-y-2 mb-6">
        {cards.map((c) => {
          const isViewing = c.id === viewingId;
          return (
            <button
              key={c.id}
              onClick={() => setViewingId(c.id)}
              className={`w-full text-left rounded-xl border p-4 transition-all ${
                isViewing
                  ? "border-primary bg-card shadow-md ring-1 ring-primary/20"
                  : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold text-foreground">{c.label}</h4>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor(c.guardrailColor)}`} />
                    {c.guardrailText}
                  </span>
                  {isViewing && (
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Viewing
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{c.desc}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-foreground tracking-tight">{c.budget}</span>
                <span className="text-xs text-muted-foreground">{c.funded} funded</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mb-5">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Budget summary</div>
        <table className="w-full text-xs">
          <thead>
            <tr>{sc.budget.cols.map((c: string, i: number) => <th key={i} className={`text-left text-[10px] text-muted-foreground/60 font-medium pb-1 pr-2 ${i === 0 ? "" : "text-center"}`}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {sc.budget.rows.map((row: any[], ri: number) => (
              <tr key={ri} className="border-t border-border">
                {row.map((cell: any, ci: number) => (
                  <td key={ci} className={`py-1.5 pr-2 text-xs ${ci === 0 ? "font-medium text-foreground/70" : "text-center"}`}>
                    {typeof cell === "object" && cell.t
                      ? <span className={cell.c === "green" ? "text-green-600 dark:text-green-400" : cell.c === "red" ? "text-red-600 dark:text-red-400" : cell.c === "amber" ? "text-amber-600 dark:text-amber-400" : "text-foreground"}>{cell.t}</span>
                      : <span className="text-foreground/70">{cell}</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-5">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Project list changes</div>
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="text-xs font-medium text-foreground mb-1">Scenario A</div>
            <div className="text-xs text-muted-foreground">{sc.projectDelta.a.label}</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="text-xs font-medium text-foreground mb-1">Scenario B</div>
            <div className="text-xs text-muted-foreground mb-2">{sc.projectDelta.b.label}</div>
            {sc.projectDelta.b.projects.map((p: any, i: number) => (
              <div key={i} className="flex items-start gap-2 py-1 border-t border-border first:border-0 first:pt-0">
                <span className="text-red-400 text-xs mt-0.5">−</span>
                <div className="flex-1">
                  <div className="text-xs text-foreground/70">{p.name} <span className="text-muted-foreground">({p.budget})</span></div>
                  <div className="text-[10px] text-muted-foreground/50">{p.reason}</div>
                </div>
              </div>
            ))}
            <div className="text-[10px] text-muted-foreground/50 mt-2 pt-1 border-t border-border">{sc.projectDelta.b.summary}</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="text-xs font-medium text-foreground mb-1">Scenario C</div>
            <div className="text-xs text-muted-foreground mb-2">{sc.projectDelta.c.label}</div>
            {sc.projectDelta.c.projects.map((p: any, i: number) => (
              <div key={i} className="flex items-start gap-2 py-1 border-t border-border first:border-0 first:pt-0">
                <span className="text-green-400 text-xs mt-0.5">+</span>
                <div className="flex-1">
                  <div className="text-xs text-foreground/70">{p.name} <span className="text-muted-foreground">({p.budget})</span></div>
                  <div className="text-[10px] text-muted-foreground/50">{p.reason}</div>
                </div>
              </div>
            ))}
            <div className="text-[10px] text-muted-foreground/50 mt-2 pt-1 border-t border-border">{sc.projectDelta.c.summary}</div>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Timeline impact</div>
        <div className="space-y-2">
          {["a", "b", "c"].map((key, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-3">
              <div className="text-xs font-medium text-foreground mb-1">Scenario {key.toUpperCase()}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{(sc.timelineImpact as any)[key]}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Capacity impact</div>
        <div className="space-y-2">
          {["a", "b", "c"].map((key, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-3">
              <div className="text-xs font-medium text-foreground mb-1">Scenario {key.toUpperCase()}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{(sc.capacityImpact as any)[key]}</div>
            </div>
          ))}
        </div>
      </div>

      {sc.guardrailConflict && (
        <div className="rounded-lg border-l-4 border-l-red-500 border border-border bg-card px-3 py-2 text-xs text-muted-foreground leading-relaxed">
          <div className="text-xs font-semibold text-foreground mb-1">Scenario C — not submittable</div>
          {sc.guardrailConflict}
        </div>
      )}
    </div>
  );
}

// Inline-editable text field used inside Goals/KRs
function InlineText({
  value,
  onChange,
  className,
  placeholder,
  multiline,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => { setDraft(value); }, [value]);
  const commit = () => { setEditing(false); if (draft !== value) onChange(draft); };
  if (editing) {
    return multiline ? (
      <textarea
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Escape") { setDraft(value); setEditing(false); } if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commit(); }}
        className={`w-full bg-muted/40 border border-primary/40 rounded-md px-2 py-1 outline-none focus:border-primary ${className || ""}`}
        rows={2}
      />
    ) : (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Escape") { setDraft(value); setEditing(false); } if (e.key === "Enter") commit(); }}
        className={`w-full bg-muted/40 border border-primary/40 rounded-md px-2 py-1 outline-none focus:border-primary ${className || ""}`}
        placeholder={placeholder}
      />
    );
  }
  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`text-left rounded-md px-1.5 py-0.5 -mx-1.5 hover:bg-muted/60 transition-colors cursor-text ${className || ""}`}
      title="Click to edit"
    >
      {value || <span className="text-muted-foreground/60">{placeholder || "Click to add"}</span>}
    </button>
  );
}

// Arc 6-style Goals artifact: numbered O1/O2 cards with owner + KR target pills
function GoalsArc6Panel({ artifact }: { artifact: any }) {
  const [objectives, setObjectives] = useState<any[]>(() =>
    (artifact.objectives || []).map((o: any) => ({
      ...o,
      krs: (o.krs || []).map((k: any) => (typeof k === "string" ? { text: k, target: "" } : { ...k })),
    }))
  );
  const [recs, setRecs] = useState<any[]>(() => Array.isArray(artifact.recommendations) ? [...artifact.recommendations] : []);
  const totalSubGoals = objectives.reduce((sum: number, o: any) => sum + (o.krs?.length || 0), 0);
  useChangeEffect([objectives, recs], () => dispatchArtifactSaved(artifact?.title));

  const updateObj = (i: number, patch: any) => setObjectives((prev) => prev.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  const updateKr = (i: number, j: number, patch: any) =>
    setObjectives((prev) => prev.map((o, idx) => idx === i ? { ...o, krs: o.krs.map((k: any, jdx: number) => jdx === j ? { ...k, ...patch } : k) } : o));
  const addKr = (i: number) => setObjectives((prev) => prev.map((o, idx) => idx === i ? { ...o, krs: [...(o.krs || []), { text: "New sub-goal", target: "" }] } : o));
  const removeKr = (i: number, j: number) =>
    setObjectives((prev) => prev.map((o, idx) => idx === i ? { ...o, krs: o.krs.filter((_: any, jdx: number) => jdx !== j) } : o));
  const addGoal = () => setObjectives((prev) => [...prev, { title: "New Goal", owner: "", krs: [] }]);
  const removeGoal = (i: number) => setObjectives((prev) => prev.filter((_, idx) => idx !== i));

  const approveRec = (rec: any, idx: number) => {
    const apply = rec.apply || {};
    if (apply.type === "addGoal" && apply.goal) {
      setObjectives((prev) => [...prev, apply.goal]);
    } else if (apply.type === "addKr" && typeof apply.objectiveIndex === "number") {
      setObjectives((prev) => prev.map((o, idx2) => idx2 === apply.objectiveIndex ? { ...o, krs: [...(o.krs || []), apply.kr] } : o));
    } else if (apply.type === "updateKr" && typeof apply.objectiveIndex === "number" && typeof apply.krIndex === "number") {
      setObjectives((prev) => prev.map((o, idx2) => idx2 === apply.objectiveIndex ? { ...o, krs: o.krs.map((k: any, jdx: number) => jdx === apply.krIndex ? { ...k, ...apply.patch } : k) } : o));
    } else if (apply.type === "updateGoal" && typeof apply.objectiveIndex === "number") {
      setObjectives((prev) => prev.map((o, idx2) => idx2 === apply.objectiveIndex ? { ...o, ...apply.patch } : o));
    }
    setRecs((prev) => prev.filter((_, idx2) => idx2 !== idx));
  };
  const dismissRec = (idx: number) => setRecs((prev) => prev.filter((_, idx2) => idx2 !== idx));

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Goals</h2>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded-full border-2 border-primary/40 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-primary" />
          </div>
          <span className="text-foreground"><span className="font-semibold">{objectives.length} goals</span> <span className="text-muted-foreground">with {totalSubGoals} sub-goals extracted</span></span>
        </div>
        <button onClick={addGoal} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
          <span className="text-base leading-none">+</span> Add Goal
        </button>
      </div>
      {objectives.map((obj: any, i: number) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                G{i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <InlineText
                  value={obj.title}
                  onChange={(v) => updateObj(i, { title: v })}
                  className="text-sm font-semibold text-foreground block w-full"
                />
                <div className="flex items-center gap-1.5 mt-1">
                  <img src={PERSON_AVATARS[i % PERSON_AVATARS.length]} alt="" className="w-4 h-4 rounded-full flex-shrink-0" />
                  <InlineText
                    value={obj.owner || ""}
                    onChange={(v) => updateObj(i, { owner: v })}
                    className="text-xs text-muted-foreground"
                    placeholder="Add owner"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border font-medium">{obj.krs?.length || 0} sub-goals</span>
              <button onClick={() => addKr(i)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border bg-card hover:bg-secondary text-xs text-muted-foreground transition-colors">
                + Sub-goal
              </button>
              <button onClick={() => removeGoal(i)} title="Delete goal" className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-border bg-card hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 text-xs text-muted-foreground transition-colors">
                ×
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {(obj.krs || []).map((kr: any, j: number) => (
              <div key={j} className="group flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border/50 hover:border-border transition-colors">
                <div className="flex-1 min-w-0">
                  <InlineText
                    value={kr.text}
                    onChange={(v) => updateKr(i, j, { text: v })}
                    className="text-xs text-foreground/90 block w-full"
                  />
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <InlineText
                    value={kr.target || ""}
                    onChange={(v) => updateKr(i, j, { target: v })}
                    className="text-xs font-semibold text-primary"
                    placeholder="Target"
                  />
                  <button onClick={() => removeKr(i, j)} title="Remove" className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded text-muted-foreground hover:text-destructive transition-all">×</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={addGoal} className="w-full rounded-xl border border-dashed border-border bg-card/50 hover:bg-card hover:border-primary/40 transition-colors p-4 flex items-center gap-3 text-left group">
        <div className="w-9 h-9 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-lg leading-none group-hover:bg-primary/10 group-hover:text-primary transition-colors">+</div>
        <div>
          <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Add Goal</div>
          <div className="text-xs text-muted-foreground/70">Define a new goal with sub-goals</div>
        </div>
      </button>
      {recs.length > 0 && (
        <div className="rounded-xl border p-4 space-y-3" style={{ backgroundColor: "hsl(233 100% 97%)", borderColor: "hsl(233 60% 88%)" }}>
          <div className="flex items-center gap-2">
            <AiIcon className="w-3.5 h-3.5" style={{ color: "hsl(236 72% 55%)" }} />
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "hsl(236 72% 45%)" }}>Arc Recommendations</span>
            <span className="text-[10px]" style={{ color: "hsl(236 35% 55%)" }}>{recs.length}</span>
          </div>
          <div className="space-y-2">
            {recs.map((rec: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border" style={{ backgroundColor: "hsl(233 100% 99%)", borderColor: "hsl(233 70% 92%)" }}>
                <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: "hsl(265 55% 88%)", border: "1px solid hsl(265 45% 75%)" }} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold" style={{ color: "hsl(220 40% 15%)" }}>{rec.title}</div>
                  <div className="text-xs mt-0.5 leading-relaxed" style={{ color: "hsl(220 20% 40%)" }}>{rec.detail}</div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => dismissRec(i)} className="text-[11px] px-2.5 py-1 rounded-md border font-medium transition hover:bg-muted" style={{ backgroundColor: "transparent", borderColor: "hsl(220 13% 85%)", color: "hsl(220 20% 40%)" }}>
                    Dismiss
                  </button>
                  <button onClick={() => approveRec(rec, i)} className="text-[11px] px-2.5 py-1 rounded-md font-medium hover:brightness-110 transition" style={{ backgroundColor: "hsl(236 72% 59%)", color: "hsl(0 0% 100%)" }}>
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Expandable card for an Arc-process phase sub-step
function PhaseStepCard({ step, active }: { step: any; active: boolean }) {
  const [open, setOpen] = useState(false);
  const hasDetails = !!step.details;
  return (
    <div
      className={`rounded-xl border transition-all ${
        active ? "border-border bg-background" : "border-border/60 bg-muted/20"
      } ${open ? "shadow-sm" : ""}`}
    >
      <button
        type="button"
        onClick={() => hasDetails && setOpen((v) => !v)}
        disabled={!hasDetails}
        className={`w-full text-left p-3.5 flex items-start gap-3 ${hasDetails ? "cursor-pointer" : "cursor-default"}`}
        aria-expanded={open}
      >
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-foreground/90 leading-snug">{step.title}</div>
          <div className="text-[12px] text-muted-foreground leading-relaxed mt-1">{step.desc}</div>
        </div>
        {hasDetails && (
          <ChevronDown
            className={`w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
            strokeWidth={2}
          />
        )}
      </button>
      {hasDetails && open && (
        <div className="px-3.5 pb-3.5 -mt-1">
          <div className="text-[12px] text-foreground/80 leading-relaxed pt-3 border-t border-border/60">
            {step.details}
          </div>
        </div>
      )}
    </div>
  );
}

// Inline value editor for parameter rows
function ParamValueEditor({
  value,
  label,
  onSave,
  onCancel,
}: { value: string; label: string; onSave: (v: string) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState(value || "");
  return (
    <div className="flex items-center gap-1">
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onSave(draft); if (e.key === "Escape") onCancel(); }}
        placeholder={label}
        className="w-32 px-2 py-1 text-xs rounded-md border border-primary/40 bg-muted/40 outline-none focus:border-primary"
      />
      <button onClick={() => onSave(draft)} className="text-[11px] px-2 py-1 rounded-md bg-primary text-primary-foreground font-medium">Save</button>
      <button onClick={onCancel} className="text-[11px] px-1.5 py-1 rounded-md text-muted-foreground hover:bg-muted">×</button>
    </div>
  );
}

// Arc 6-style Investment Parameters: top tabs + toggleable parameter rows with values pinned right
function ParamsArc6Panel({ artifact }: { artifact: any }) {
  const [cats, setCats] = useState<any[]>(() =>
    (artifact.categories || []).map((c: any) => ({ ...c, params: (c.params || []).map((p: any) => ({ ...p })) }))
  );
  const [activeCat, setActiveCat] = useState<string>(cats[0]?.id || "");
  const [editing, setEditing] = useState<string | null>(null); // "catId:idx"
  const [adding, setAdding] = useState<string | null>(null); // catId
  const [newParam, setNewParam] = useState<{ label: string; desc: string; value: string }>({ label: "", desc: "", value: "" });
  const [recs, setRecs] = useState<any[]>(() => Array.isArray(artifact.recommendations) ? [...artifact.recommendations] : []);
  useChangeEffect([cats, recs], () => dispatchArtifactSaved(artifact?.title));
  const active = cats.find((c) => c.id === activeCat) || cats[0];
  const totalEnabled = cats.reduce((s, c) => s + (c.params?.filter((p: any) => p.enabled).length || 0), 0);
  const totalAll = cats.reduce((s, c) => s + (c.params?.length || 0), 0);

  const updateParam = (catId: string, idx: number, patch: any) => {
    setCats((prev) =>
      prev.map((c) =>
        c.id === catId ? { ...c, params: c.params.map((p: any, i: number) => (i === idx ? { ...p, ...patch } : p)) } : c
      )
    );
  };

  const togglePin = (catId: string, idx: number, current: boolean) => {
    const next = !current;
    if (next) {
      const cat = cats.find((c) => c.id === catId);
      const p = cat?.params[idx];
      if (p && !p.value) {
        updateParam(catId, idx, { enabled: true });
        setEditing(`${catId}:${idx}`);
        return;
      }
    }
    updateParam(catId, idx, { enabled: next });
  };

  const submitNewParam = (catId: string) => {
    if (!newParam.label.trim()) { setAdding(null); return; }
    setCats((prev) =>
      prev.map((c) =>
        c.id === catId ? { ...c, params: [...c.params, { label: newParam.label.trim(), desc: newParam.desc.trim(), value: newParam.value.trim(), enabled: !!newParam.value.trim() }] } : c
      )
    );
    setNewParam({ label: "", desc: "", value: "" });
    setAdding(null);
  };

  const approveRec = (rec: any, idx: number) => {
    const apply = rec.apply || {};
    if (apply.type === "setParam" && apply.categoryId && apply.label) {
      setCats((prev) => prev.map((c) => {
        if (c.id !== apply.categoryId) return c;
        const existingIdx = c.params.findIndex((p: any) => p.label === apply.label);
        if (existingIdx >= 0) {
          return { ...c, params: c.params.map((p: any, i: number) => i === existingIdx ? { ...p, value: apply.value, enabled: true, ...(apply.desc ? { desc: apply.desc } : {}) } : p) };
        }
        return { ...c, params: [...c.params, { label: apply.label, desc: apply.desc || "", value: apply.value, enabled: true }] };
      }));
      if (apply.categoryId) setActiveCat(apply.categoryId);
    } else if (apply.type === "enableAll" && apply.categoryId) {
      setCats((prev) => prev.map((c) => c.id === apply.categoryId ? { ...c, params: c.params.map((p: any) => ({ ...p, enabled: true })) } : c));
    }
    setRecs((prev) => prev.filter((_, i) => i !== idx));
  };
  const dismissRec = (idx: number) => setRecs((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Investment Parameters</h2>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded-full border-2 border-primary/40 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-primary" />
          </div>
          <span className="text-foreground"><span className="font-semibold">{totalEnabled} of {totalAll}</span> <span className="text-muted-foreground">investment parameters enabled</span></span>
        </div>
        <button
          onClick={() => active && setAdding(active.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
        >
          <span className="text-base leading-none">+</span> Add Parameter
        </button>
      </div>
      <div className="border-b border-border overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {cats.map((c) => {
            const enabled = c.params?.filter((p: any) => p.enabled).length || 0;
            const total = c.params?.length || 0;
            const isActive = c.id === active?.id;
            const hasIncomplete = enabled < total;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${isActive ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                <span>{c.label}</span>
                <span className="text-[10px] text-muted-foreground/70 font-normal">{enabled}/{total}</span>
                {hasIncomplete && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
              </button>
            );
          })}
        </div>
      </div>
      {active && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold text-foreground">{active.label} Guardrails</div>
              <div className="text-[11px] text-muted-foreground">{active.params?.filter((p: any) => p.enabled).length || 0} of {active.params?.length || 0} enabled</div>
            </div>
            <button
              onClick={() => setAdding(active.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border bg-card hover:bg-secondary text-xs text-muted-foreground"
            >
              + Add
            </button>
          </div>
          <div className="space-y-2">
            {(active.params || []).map((p: any, i: number) => {
              const editKey = `${active.id}:${i}`;
              const isEditing = editing === editKey;
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between gap-3 px-3 py-3 rounded-lg border transition-colors ${p.enabled ? "border-border bg-background" : "border-border/50 bg-muted/20 opacity-70"}`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => togglePin(active.id, i, p.enabled)}
                      aria-pressed={p.enabled}
                      className={`relative w-9 h-5 rounded-full flex-shrink-0 transition-colors cursor-pointer ${p.enabled ? "bg-primary" : "bg-muted hover:bg-muted-foreground/30"}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${p.enabled ? "left-[18px]" : "left-0.5"}`} />
                    </button>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground">{p.label}</div>
                      {p.desc && <div className="text-[11px] text-muted-foreground">{p.desc}</div>}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {isEditing ? (
                      <ParamValueEditor
                        value={p.value || ""}
                        label={p.label}
                        onSave={(v) => { updateParam(active.id, i, { value: v, enabled: true }); setEditing(null); }}
                        onCancel={() => setEditing(null)}
                      />
                    ) : p.enabled && p.value ? (
                      <button
                        type="button"
                        onClick={() => setEditing(editKey)}
                        className="inline-flex items-center px-3 py-1 rounded-md border border-border bg-background text-xs font-semibold text-foreground hover:bg-accent hover:border-primary/40 transition-colors cursor-pointer"
                      >
                        {p.value}
                      </button>
                    ) : p.enabled ? (
                      <button
                        type="button"
                        onClick={() => setEditing(editKey)}
                        className="text-xs text-primary hover:underline"
                      >
                        Set value
                      </button>
                    ) : (
                      <span className="text-muted-foreground/50 text-sm">—</span>
                    )}
                  </div>
                </div>
              );
            })}
            {adding === active.id && (
              <div className="rounded-lg border border-primary/40 bg-background p-3 space-y-2">
                <input
                  autoFocus
                  value={newParam.label}
                  onChange={(e) => setNewParam((p) => ({ ...p, label: e.target.value }))}
                  placeholder="Parameter name"
                  className="w-full px-2 py-1.5 text-sm rounded-md border border-border bg-muted/40 outline-none focus:border-primary"
                />
                <input
                  value={newParam.desc}
                  onChange={(e) => setNewParam((p) => ({ ...p, desc: e.target.value }))}
                  placeholder="Short description (optional)"
                  className="w-full px-2 py-1.5 text-xs rounded-md border border-border bg-muted/40 outline-none focus:border-primary"
                />
                <div className="flex items-center gap-2">
                  <input
                    value={newParam.value}
                    onChange={(e) => setNewParam((p) => ({ ...p, value: e.target.value }))}
                    placeholder="Value (leave blank to add disabled)"
                    className="flex-1 px-2 py-1.5 text-xs rounded-md border border-border bg-muted/40 outline-none focus:border-primary"
                  />
                  <button onClick={() => submitNewParam(active.id)} className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-medium">Add</button>
                  <button onClick={() => { setAdding(null); setNewParam({ label: "", desc: "", value: "" }); }} className="text-xs px-2 py-1.5 rounded-md text-muted-foreground hover:bg-muted">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {recs.length > 0 && (
        <div className="rounded-xl border p-4 space-y-3" style={{ backgroundColor: "hsl(233 100% 97%)", borderColor: "hsl(233 60% 88%)" }}>
          <div className="flex items-center gap-2">
            <AiIcon className="w-3.5 h-3.5" style={{ color: "hsl(236 72% 55%)" }} />
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "hsl(236 72% 45%)" }}>Arc Recommendations</span>
            <span className="text-[10px]" style={{ color: "hsl(236 35% 55%)" }}>{recs.length}</span>
          </div>
          <div className="space-y-2">
            {recs.map((rec: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border" style={{ backgroundColor: "hsl(233 100% 99%)", borderColor: "hsl(233 70% 92%)" }}>
                <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: "hsl(265 55% 88%)", border: "1px solid hsl(265 45% 75%)" }} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold" style={{ color: "hsl(220 40% 15%)" }}>{rec.title}</div>
                  <div className="text-xs mt-0.5 leading-relaxed" style={{ color: "hsl(220 20% 40%)" }}>{rec.detail}</div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => dismissRec(i)} className="text-[11px] px-2.5 py-1 rounded-md border font-medium transition hover:bg-muted" style={{ backgroundColor: "transparent", borderColor: "hsl(220 13% 85%)", color: "hsl(220 20% 40%)" }}>
                    Dismiss
                  </button>
                  <button onClick={() => approveRec(rec, i)} className="text-[11px] px-2.5 py-1 rounded-md font-medium hover:brightness-110 transition" style={{ backgroundColor: "hsl(236 72% 59%)", color: "hsl(0 0% 100%)" }}>
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExtractionMetricsInline({ cards }: { cards: any[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const iconMap: Record<string, any> = { layers: Layers, target: Target, settings: Settings2, files: FileText };
  const open = cards.find((c) => c.id === openId);
  const statusColor = (s: string) => {
    if (s === "Confirmed" || s === "Parsed") return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50";
    if (s === "Recommended" || s === "Draft") return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50";
    if (s === "Missing") return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50";
    return "bg-muted text-foreground border-border";
  };

  return (
    <>
      <div className={`my-4 grid gap-3 ${cards.length <= 2 ? "grid-cols-1 sm:grid-cols-2" : cards.length === 3 ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2 lg:grid-cols-4"}`}>
        {cards.map((c) => {
          const Icon = iconMap[c.icon] || Layers;
          return (
            <button
              key={c.id}
              onClick={() => setOpenId(c.id)}
              className="group relative flex flex-col bg-card hover:bg-accent/30 transition-colors p-5 text-left min-h-[152px] rounded-2xl border border-border"
            >
              {/* Header: icon + label */}
              <div className="flex items-center gap-2 mb-6">
                <Icon className="h-3.5 w-3.5 text-primary/80 flex-shrink-0" strokeWidth={2} />
                <span className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.09em] truncate">{c.label}</span>
              </div>

              {/* Stats row */}
              <div className="flex items-end gap-5 mt-auto">
                <div className="flex flex-col">
                  <div className="text-[34px] font-semibold text-foreground leading-none tabular-nums tracking-tight">{c.primary}</div>
                  <div className="text-[10px] text-muted-foreground mt-2.5 uppercase tracking-wider">{c.primaryLabel}</div>
                </div>
                {c.secondary && (
                  <>
                    <div className="h-8 w-px bg-border mb-5" />
                    <div className="flex flex-col">
                      <div className="text-[34px] font-semibold text-foreground/35 leading-none tabular-nums tracking-tight">{c.secondary}</div>
                      <div className="text-[10px] text-muted-foreground mt-2.5 uppercase tracking-wider">{c.secondaryLabel}</div>
                    </div>
                  </>
                )}
              </div>

              {/* Hover arrow */}
              <div className="absolute top-4 right-4 text-primary/70 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </button>
          );
        })}
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpenId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base">{open.details.title}</DialogTitle>
                <DialogDescription className="text-xs">{open.details.subtitle}</DialogDescription>
              </DialogHeader>
              <div className="space-y-5 mt-2">
                {open.details.groups.map((g: any, gi: number) => (
                  <div key={gi}>
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{g.label}</div>
                    <div className="space-y-1.5">
                      {g.items.map((item: any, ii: number) => (
                        <div key={ii} className="flex items-start justify-between gap-3 px-3 py-2.5 rounded-lg border border-border bg-card">
                          <div className="min-w-0 flex-1">
                            <div className="text-[13px] font-medium text-foreground leading-snug">{item.name}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">{item.source}</div>
                          </div>
                          <span className={`text-[10.5px] px-2 py-0.5 rounded-md border font-medium flex-shrink-0 ${statusColor(item.status)}`}>{item.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function IntakeFormPanel({ artifact, hideAgentCallout = false }: { artifact: any; hideAgentCallout?: boolean }) {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const sectionIcons: Record<string, any> = { target: Target, dollar: DollarSign, users: Users, alert: AlertTriangle, shield: Shield };
  const renderField = (f: any, idx: number) => {
    const widthClass = f.half ? "md:col-span-1" : f.third ? "md:col-span-1" : "md:col-span-2";
    if (f.type === "checkbox") {
      return (
        <div key={idx} className={`${widthClass} flex items-center gap-3 pt-1`}>
          <div className="w-4 h-4 rounded border border-border bg-background flex-shrink-0" />
          <label className="text-[13px] text-foreground cursor-pointer">{f.label}</label>
          {f.helper && <span className="text-[11px] text-muted-foreground ml-auto">{f.helper}</span>}
        </div>
      );
    }
    return (
      <div key={idx} className={`${widthClass} space-y-1.5`}>
        <label className="text-[13px] font-medium text-foreground">
          {f.label}{f.required && <span className="text-foreground"> *</span>}
        </label>
        {f.type === "textarea" ? (
          <textarea
            placeholder={f.placeholder}
            rows={3}
            readOnly
            className="w-full text-[13px] rounded-md border border-border bg-muted/40 px-3 py-2 text-muted-foreground placeholder:text-muted-foreground/60 resize-none"
          />
        ) : f.type === "select" ? (
          <button type="button" className="w-full h-9 text-[13px] rounded-md border border-border bg-muted/40 px-3 flex items-center justify-between text-muted-foreground/70">
            <span>{f.placeholder}</span>
            <svg className="h-3.5 w-3.5 opacity-60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6l4 4 4-4"/></svg>
          </button>
        ) : (
          <input
            type="text"
            placeholder={f.placeholder}
            readOnly
            className="w-full h-9 text-[13px] rounded-md border border-border bg-muted/40 px-3 text-foreground placeholder:text-muted-foreground/60"
          />
        )}
        {f.helper && <p className="text-[11px] text-muted-foreground leading-snug">{f.helper}</p>}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* AI Banner — sits above the form card on the canvas */}
      {artifact.banner && !bannerDismissed && !hideAgentCallout && (
        <div
          className="relative mb-4 rounded-xl border p-4 shadow-[var(--shadow-card)]"
          style={{
            background:
              "linear-gradient(135deg, hsl(212 70% 92%) 0%, hsl(212 65% 96%) 60%, hsl(212 60% 97%) 100%)",
            borderColor: "hsl(212 55% 84%)",
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
            <img src={intakeAgentChip} alt="Intake agent" className="w-auto" style={{ height: 22 }} />
          </div>
          <p className="text-[13.5px] font-bold text-foreground leading-snug">Based on your Strategic Framework, we've created this intake form for you.</p>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Fields and parameters are pre-configured from your themes, OKRs, and investment parameters. Hover over any field to edit its label or remove it. The Intake Agent will also monitor and automatically find outstanding project proposals and score them against your weighting criteria.</p>
        </div>
      )}

      {/* Form container card */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-[var(--shadow-card)]">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-foreground">{artifact.title || "Project Intake Form"}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Submit a new initiative for portfolio evaluation</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-card text-xs font-medium text-foreground hover:bg-accent">
            <ExternalLink className="h-3.5 w-3.5" /> View Live Form
          </button>
          <ShareButton onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Share link copied"); }} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="More actions"
                className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-border bg-card text-foreground hover:bg-accent"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px]">
              <DropdownMenuItem
                className="text-[12px] gap-2"
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); }}
              >
                <Copy className="h-3.5 w-3.5" /> Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[12px] gap-2">
                <Pencil className="h-3.5 w-3.5" /> Edit Form
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[12px] gap-2">
                <Sparkles className="h-3.5 w-3.5" /> Edit with AI
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[12px] gap-2">
                <FileText className="h-3.5 w-3.5" /> View Intake Sheet
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-5">
        {(artifact.sections || []).map((sec: any, si: number) => {
          const Icon = sectionIcons[sec.icon] || Target;
          return (
            <section key={si} className="bg-card rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                <Icon className="h-4 w-4 text-primary" />
                {sec.title}
                {sec.badge && (
                  <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-md border border-border bg-background text-[11px] font-normal text-muted-foreground">
                    {sec.badge}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                {(sec.fields || []).map((f: any, i: number) => renderField(f, i))}
              </div>
              <button className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                <span className="text-sm leading-none">+</span> Add field
              </button>
            </section>
          );
        })}
      </div>

      <div className="flex justify-end pt-5 pb-2">
        <button className="inline-flex items-center gap-2 px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
          <Send className="h-4 w-4" /> Submit Initiative
        </button>
      </div>
      </div>
    </div>
  );
}

// Editable status pill for intake rows
const STATUS_OPTIONS = ["In review", "Approved", "Active", "Rejected"] as const;
function statusPillStyle(status: string): { backgroundColor: string; color: string } {
  switch (status) {
    case "Approved":
      return { backgroundColor: "#B9F4C3", color: "#042F0A" };
    case "Active":
      return { backgroundColor: "#D6E4FF", color: "#0A2A5A" };
    case "Rejected":
      return { backgroundColor: "#FCD2D2", color: "#5A0A0A" };
    case "In review":
    default:
      return { backgroundColor: "#FDE7B3", color: "#4A2D00" };
  }
}
// Session-scoped status store (in-memory; resets on page reload / new session)
const intakeStatusStore: Record<string, string> = {};
const intakeStatusListeners = new Set<() => void>();
function setIntakeStatus(key: string, value: string) {
  intakeStatusStore[key] = value;
  intakeStatusListeners.forEach((l) => l());
}
function useIntakeStatus(key: string | undefined, initial?: string) {
  const fallback = initial || "In review";
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    intakeStatusListeners.add(l);
    return () => { intakeStatusListeners.delete(l); };
  }, []);
  const current = key && intakeStatusStore[key] !== undefined ? intakeStatusStore[key] : fallback;
  return [current, (v: string) => { if (key) setIntakeStatus(key, v); }] as const;
}

function IntakeStatusCell({ initial, rowKey }: { initial?: string; rowKey?: string }) {
  const [status, setStatus] = useIntakeStatus(rowKey, initial);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-bold hover:opacity-80 transition-opacity"
          style={statusPillStyle(status)}
        >
          {status}
          <ChevronDown className="w-3 h-3 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[140px]">
        {STATUS_OPTIONS.map((opt) => (
          <DropdownMenuItem key={opt} onClick={() => setStatus(opt)} className="text-[12px]">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-bold mr-2"
              style={statusPillStyle(opt)}
            >{opt}</span>
            {status === opt && <span className="ml-auto text-muted-foreground text-[10px]">Current</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Editable scoring-weights model (matches the artifact panel "Scoring Weights" card)
function WeightingEditor({ data, onApply }: { data: any; onApply: () => void }) {
  const initial = data.criteria as Array<{ name: string; desc: string; weight: number }>;
  const [weights, setWeights] = useState<number[]>(initial.map((c) => c.weight));
  const total = weights.reduce((a, b) => a + b, 0);
  const valid = total === 100;
  const dirty = weights.some((w, i) => w !== initial[i].weight);

  const update = (idx: number, val: number) => {
    const next = [...weights];
    next[idx] = Math.max(0, Math.min(100, val));
    setWeights(next);
  };

  const reset = () => setWeights(initial.map((c) => c.weight));

  return (
    <div className="my-4 rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-primary" strokeWidth={1.75} />
          <h3 className="text-[13px] font-semibold text-foreground">Scoring weights</h3>
        </div>
        <span className={`text-[11px] font-medium tabular-nums ${valid ? "text-success" : "text-destructive"}`}>
          Total: {total}% / 100%
        </span>
      </div>

      <div className="px-4 py-4 space-y-4">
        {initial.map((c, i) => (
          <div key={i}>
            <div className="flex items-baseline justify-between gap-3 mb-1.5">
              <div className="min-w-0">
                <div className="text-[12.5px] font-medium text-foreground">{c.name}</div>
                <div className="text-[11.5px] text-muted-foreground leading-snug">{c.desc}</div>
              </div>
              <span className="text-[14px] font-semibold text-foreground tabular-nums w-[48px] text-right">{weights[i]}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={weights[i]}
              onChange={(e) => update(i, parseInt(e.target.value, 10))}
              className="w-full h-1.5 rounded-full appearance-none bg-muted accent-primary cursor-pointer"
            />
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-between gap-3">
        <span className="text-[11.5px] text-muted-foreground leading-snug">{data.note}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {dirty && (
            <button
              onClick={reset}
              className="text-[12px] text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-md hover:bg-muted transition-colors"
            >
              Reset
            </button>
          )}
          <button
            onClick={onApply}
            disabled={!valid || !dirty}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            Re-rank intake
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Arc 6-style Intake/Priority Stack table
function IntakeSheetPanel({ artifact }: { artifact: any }) {
  const rawRows = artifact.rows || [];
  const hideScore = !!artifact.hideScore;
  const hideRejected = !!artifact.hideRejected;
  // For the prioritized (cut-line) view we sort by score so the cut line cleanly separates above/below.
  // For the initial view we preserve the curated order (in-review first, then active approved).
  let rows = hideRejected ? rawRows.filter((r: any) => r.status !== "Rejected") : rawRows;
  if (artifact.showCut) {
    rows = [...rows].sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0));
  }
  const isEmpty = artifact.empty || rows.length === 0;
  const fundedCount = artifact.fundedCount ?? rows.filter((r: any) => r.status === "Funded" || r.status === "In review" || r.status === "Approved").length;
  const unfundedCount = artifact.unfundedCount ?? rows.filter((r: any) => r.status === "Rejected" || r.status === "Unfunded").length;
  const totalLabel = artifact.totalLabel ?? `${rows.length} ${rows.length === 1 ? "submission" : "submissions"}`;

  // Single budget cut line — applied to score-sorted rows when `showCut: true`.
  // Threshold chosen so a few in-review proposals AND a few already-approved projects sit below the line.
  const fundingCutAfterIdx = (() => {
    if (!artifact.showCut) return -1;
    if (rows.length < 8) return -1;
    const threshold = artifact.cutScore ?? 82;
    let last = -1;
    rows.forEach((r: any, i: number) => {
      if (typeof r.score === "number" && r.score >= threshold) last = i;
    });
    return last;
  })();

  const isRescored = !!artifact.rescored;
  const [saved, setSaved] = useState(false);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
          </svg>
          <h3 className="font-semibold text-foreground text-sm">{artifact.title || "Intake Sheet"}</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border font-medium">{totalLabel}</span>
          {isRescored && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">Re-ranked</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isEmpty && !isRescored && (
            <>
              
              {unfundedCount > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 font-medium">{unfundedCount} Rejected</span>
              )}
            </>
          )}
          {isRescored && (
            <button
              onClick={() => setSaved(true)}
              disabled={saved}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60 disabled:cursor-default transition-opacity"
            >
              {saved ? (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Saved
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  Save as record
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {isEmpty ? (
        <div className="px-6 py-16 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center mb-4">
            <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
            </svg>
          </div>
          <div className="text-sm font-medium text-foreground mb-1">No submissions yet</div>
          <div className="text-xs text-muted-foreground max-w-sm">{artifact.emptyMessage || "Share your intake form link to start collecting project requests."}</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[2400px] text-[13px]">
            <thead>
              <tr className="border-b border-border">
                {!hideScore && <th className="w-[56px] pl-4 pr-2 py-2.5 text-left text-[12px] font-normal text-muted-foreground">Score</th>}
                {isRescored && <th className="w-[88px] px-2 py-2.5 text-left text-[12px] font-normal text-muted-foreground">Change</th>}
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
              {rows.map((r: any, i: number) => {
                const rejected = r.status === "Rejected";
                const priorityColor = r.priority === "High" ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                  : r.priority === "Medium" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : r.priority === "Low" ? "bg-muted text-muted-foreground"
                  : "bg-muted text-muted-foreground";
                const COL_SPAN = 30 + (isRescored ? 1 : 0) - (hideScore ? 1 : 0);
                const showFundingCut = !isRescored && fundingCutAfterIdx >= 0 && i === fundingCutAfterIdx + 1;
                const aboveCount = fundingCutAfterIdx + 1;
                const belowCount = rows.length - aboveCount;
                return (
                  <Fragment key={i}>
                    {showFundingCut && (
                      <tr className="bg-destructive/10 border-y-2 border-dashed border-destructive">
                        <td colSpan={COL_SPAN} className="px-4 py-1.5">
                          <div className="flex items-center gap-2 text-[11px] font-semibold text-destructive">
                            <Scissors className="w-3.5 h-3.5" />
                            Budget Cutline — {aboveCount} above, {belowCount} below
                          </div>
                        </td>
                      </tr>
                    )}
                    <tr className={`border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors ${rejected ? "opacity-50" : ""}`}>
                      {!hideScore && (
                        <td className="pl-4 pr-2 py-[14px]">
                          <span className="inline-flex items-center justify-center min-w-[30px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold font-mono">{r.score}</span>
                        </td>
                      )}
                      {isRescored && (
                        <td className="px-2 py-[14px]">
                          {(() => {
                            const d = r.change ?? 0;
                            if (d > 0) return (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 tabular-nums">
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                                +{d}
                              </span>
                            );
                            if (d < 0) return (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-red-500/10 text-red-600 dark:text-red-400 tabular-nums">
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                                {d}
                              </span>
                            );
                            return (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground tabular-nums">
                                <span className="w-3 h-px bg-current" />
                                0
                              </span>
                            );
                          })()}
                        </td>
                      )}
                      <td className="px-3 py-[14px] font-semibold text-foreground whitespace-nowrap max-w-[280px] overflow-hidden text-ellipsis" title={r.name}>
                        <button type="button" className="text-left font-semibold text-foreground hover:text-primary hover:underline underline-offset-2 transition-colors truncate max-w-[260px]">{r.name}</button>
                      </td>
                      <td className="px-2 py-[14px] align-middle">
                        <IntakeStatusCell initial={r.status} rowKey={r.name} />
                      </td>
                      <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.department}</td>
                      <td className="px-3 py-[14px] whitespace-nowrap">
                        <button type="button" className="text-left text-foreground/80 hover:text-primary hover:underline underline-offset-2 transition-colors">{r.portfolio}</button>
                      </td>
                      <td className="px-3 py-[14px] align-middle text-foreground/70 text-[12px] leading-snug min-w-[375px] w-[375px] max-w-[375px]" title={r.rationale || ""}>
                        <span className="block overflow-hidden cursor-help" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{r.rationale || "—"}</span>
                      </td>
                      <td className="px-2 py-[14px]">
                        {r.priority ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${priorityColor}`}>{r.priority}</span>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-2 py-[14px] text-foreground/80 whitespace-nowrap">{r.budget}</td>
                      <td className="px-2 py-[14px] text-foreground/80">{r.fte}</td>
                      <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.submitter || "—"}</td>
                      <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.investmentType || "—"}</td>
                      <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.startQuarter || "—"}</td>
                      <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.durationMonths ?? "—"}</td>
                      <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap max-w-[220px] overflow-hidden text-ellipsis" title={r.primaryOkr}>{r.primaryOkr || "—"}</td>
                      <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.innovationHorizon || "—"}</td>
                      <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.capexOpex || "—"}</td>
                      <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.fundingSource || "—"}</td>
                      <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.benefitType || "—"}</td>
                      <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap max-w-[220px] overflow-hidden text-ellipsis" title={r.criticalRoles}>{r.criticalRoles || "—"}</td>
                      <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.vendorInvolved || "—"}</td>
                      <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.dependencies ?? "—"}</td>
                      <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.integrationComplexity != null ? `${r.integrationComplexity}/10` : "—"}</td>
                      <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.riskType || "—"}</td>
                      <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.patientImpact || "—"}</td>
                      <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.regulatoryImpact || "—"}</td>
                      <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap max-w-[220px] overflow-hidden text-ellipsis" title={r.kpis}>{r.kpis || "—"}</td>
                      <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.baseline || "—"}</td>
                      <td className="px-3 py-[14px] text-foreground/80 whitespace-nowrap">{r.target || "—"}</td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PortfolioConnectInline({ data }: { data: any }) {
  const rows = data.rows || [];

  // Mark portfolios nav active immediately — they're pre-connected.
  useEffect(() => {
    setItemState("portfolio_connect", "in_progress");
  }, []);

  // Stable avatar assignment per owner name
  const ownerAvatars = [avatar1, avatar2, avatar3, avatar4, avatar5];
  const avatarFor = (name: string) => {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return ownerAvatars[h % ownerAvatars.length];
  };

  return (
    <div className="my-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-xs">
          <thead>
            <tr className="border-b border-border/60">
              <th className="py-2.5 pl-3 pr-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Name</th>
              <th className="py-2.5 pr-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
              <th className="py-2.5 pr-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"># Projects</th>
              <th className="py-2.5 pr-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Owner</th>
              <th className="py-2.5 pr-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any, i: number) => {
              const statusChip =
                r.status === "Active"
                  ? { bg: "#B9F4C3", fg: "#042F0A" }
                  : r.status === "Archived"
                    ? { bg: "#E5E7EB", fg: "#1F2937" }
                    : { bg: "#FDE7B3", fg: "#4A2D00" };
              return (
                <tr key={i} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="py-3 pl-3 pr-3 font-medium text-foreground whitespace-nowrap max-w-[260px] overflow-hidden text-ellipsis rounded-l-lg" title={r.name}>
                    {r.name}
                  </td>
                  <td className="py-3 pr-3 whitespace-nowrap">
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold"
                      style={{ backgroundColor: statusChip.bg, color: statusChip.fg }}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-foreground/80 whitespace-nowrap">{r.projects}</td>
                  <td className="py-3 pr-3 text-foreground/80 whitespace-nowrap">
                    <span className="inline-flex items-center gap-2">
                      <img
                        src={avatarFor(r.owner)}
                        alt=""
                        className="h-5 w-5 rounded-full ring-1 ring-border/60 flex-shrink-0"
                      />
                      <span>{r.owner}</span>
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-foreground/80 whitespace-nowrap rounded-r-lg">{r.lastUpdated}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ArtifactPanel({ artifact, onClose, fullScreen = false, onToggleFullScreen, variant = "conversation" }: { artifact: any; onClose: () => void; fullScreen?: boolean; onToggleFullScreen?: () => void; variant?: "conversation" | "standalone" }) {
  const sidebarExpandedForHeader = useSidebarExpanded();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [selectedMetric, setSelectedMetric] = useState<number | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());
  const [resolvedDecisions, setResolvedDecisions] = useState<Set<number>>(new Set());
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'funded' | 'unfunded'>('all');
  const [historyOpen, setHistoryOpen] = useState(false);

  // Mock change log entries — varies slightly per artifact title for realism.
  const changeLog = useMemo(() => {
    const seed = (artifact?.title || "").length;
    const base = [
      { who: "Mary Chen", avatar: avatar1, when: "2 minutes ago", action: "Added", target: "RICE prioritization framework" },
      { who: "Arc", avatar: null, when: "3 minutes ago", action: "Generated", target: "initial draft from CFO Budget Memo" },
      { who: "Dr. Sarah Chen", avatar: avatar2, when: "18 minutes ago", action: "Edited", target: "Goal G1 — Patient Safety threshold" },
      { who: "Marcus Williams", avatar: avatar3, when: "1 hour ago", action: "Commented on", target: "Investment mix guardrail" },
      { who: "Mary Chen", avatar: avatar1, when: "Yesterday, 4:12 PM", action: "Created", target: artifact?.title || "this canvas" },
    ];
    return base.slice(0, Math.max(3, (seed % 3) + 4));
  }, [artifact?.title]);

  const toggleRow = (i: number) => setExpandedRows(prev => {
    const next = new Set(prev);
    next.has(i) ? next.delete(i) : next.add(i);
    return next;
  });
  const toggleSection = (i: number) => setCollapsedSections(prev => {
    const next = new Set(prev);
    next.has(i) ? next.delete(i) : next.add(i);
    return next;
  });
  const toggleDecision = (i: number) => {
    setResolvedDecisions(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
    toast.success(resolvedDecisions.has(i) ? "Decision unmarked" : "Decision marked as resolved");
  };

  if (!artifact) return null;
  return (
    <div className="flex flex-col canvas-bg h-full bg-background text-foreground">
      {artifact.type === "strategic_framework" && (
        <StrategicFrameworkHeaderToast artifactKey="strategic_framework" fullScreen={fullScreen} />
      )}
      {artifact.type === "intake_form" && (
        <StrategicFrameworkHeaderToast artifactKey="intake_form" label="Intake form" fullScreen={fullScreen} />
      )}
      <div
        className="relative flex items-center justify-between flex-shrink-0 transition-[padding] duration-200 ease-out"
        style={{
          height: "var(--header-height)",
          paddingTop: "var(--header-top)",
          paddingRight: 24,
          paddingLeft: fullScreen ? "var(--content-left)" : 24,
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {(() => {
            const isGoals = artifact.type === "goals_arc6" || artifact.type === "goals_draft" || /goal/i.test(artifact.title || "");
            const isParams = artifact.type === "params_arc6" || /investment param/i.test(artifact.title || "");
            const isFramework = artifact.type === "strategic_framework" || /strategic framework/i.test(artifact.title || "");
            const isPrioritization = artifact.type === "prioritization_table" || /prioriti/i.test(artifact.title || "");
            const isScenario = artifact.type === "scenario_comparison" || /scenario/i.test(artifact.title || "");
            const isHealth = artifact.type === "health_dashboard" || /health|dashboard|monitor/i.test(artifact.title || "");
            const isGuardrail = artifact.type === "guardrail_check" || /guardrail|governance/i.test(artifact.title || "");
            const isPortfolio = artifact.type === "portfolio_connect" || /portfolio/i.test(artifact.title || "");
            const isIntake = artifact.type === "intake_form" || artifact.type === "intake_sheet" || /intake/i.test(artifact.title || "");
            const Icon = isFramework ? Compass : isGoals ? Compass : isParams ? FileText : null;

            return (
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: artifactTileBg(artifact.type), color: artifactTileFg(artifact.type) }}
              >

                {Icon ? (
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <rect x="1.5" y="1.5" width="13" height="13" rx="2.5" stroke="currentColor" strokeWidth="1"/>
                    <line x1="4" y1="5.5" x2="12" y2="5.5" stroke="currentColor" strokeWidth="1"/>
                    <line x1="4" y1="8" x2="10" y2="8" stroke="currentColor" strokeWidth="1"/>
                  </svg>
                )}
              </div>
            );
          })()}
          <span className="text-base font-semibold text-foreground truncate">{artifact.title}</span>
          {artifact.type === "strategic_framework" && (
            <StrategicFrameworkHeaderChip artifactKey="strategic_framework" />
          )}
          {artifact.type === "intake_form" && (
            <StrategicFrameworkHeaderChip artifactKey="intake_form" />
          )}
          {(artifact.type === "prioritization_table" || /existing projects.*scored/i.test(artifact.title || "")) && (
            <img src={intakeAgentChip} alt="Intake agent" className="w-auto flex-shrink-0" style={{ height: 20 }} />
          )}
          <SavedChip title={artifact.title} className="text-[10px] px-2 py-0.5" />
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <div className="flex items-center gap-2 mr-1">
            <ShareButton
              onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Share link copied"); }}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all" title="More">
                <MoreHorizontal className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {variant === "standalone" && (
                <DropdownMenuItem onClick={() => {
                  // Edit with AI from standalone view → jump back into the
                  // conversation that owns this artifact.
                  onClose();
                }}>
                  <Sparkles className="w-4 h-4 mr-2" /> Edit with AI
                </DropdownMenuItem>
              )}
              {variant === "conversation" && fullScreen && (
                <DropdownMenuItem onClick={onClose}>
                  <MessageSquare className="w-4 h-4 mr-2" /> Start Conversation
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(artifact.title + " — " + (artifact.subtitle || "")); toast.success("Copied to clipboard"); }}>
                <Copy className="w-4 h-4 mr-2" /> Copy
              </DropdownMenuItem>
              {!(artifact.type === "goals_arc6" || artifact.type === "goals_draft" || artifact.type === "params_arc6" || artifact.type === "strategic_framework" || /goal|investment param|strategic framework/i.test(artifact.title || "")) && (
                <DropdownMenuItem onClick={() => {
                  window.dispatchEvent(new CustomEvent("arc:workspace:save", {
                    detail: {
                      title: artifact.title,
                      subtitle: artifact.subtitle,
                      type: artifact.type,
                      variant: artifact.variant,
                    },
                  }));
                  toast.success("Saved to workspace");
                }}>
                  <BookmarkPlus className="w-4 h-4 mr-2" /> Save to workspace
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setTimeout(() => setHistoryOpen(true), 50); }}>
                <History className="w-4 h-4 mr-2" /> View change log
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {variant === "conversation" && !fullScreen && (
            <button onClick={onToggleFullScreen} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all" title="Expand to full screen">
              <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          )}
          {variant === "conversation" && fullScreen && (
            <button onClick={onToggleFullScreen} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all" title="Exit full screen">
              <Minimize2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          )}
          {variant === "conversation" && !fullScreen && (
            <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all" title="Close">
              <X className="w-4 h-4" strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>
      <div
        id="arc-artifact-scroll"
        className="flex-1 overflow-y-auto py-8"
        style={{
          paddingLeft: fullScreen ? "var(--content-left)" : 48,
          paddingRight: fullScreen ? 48 : 48,
        }}
      >
        <div className={`${artifact.type === "intake_sheet" ? "max-w-[1400px] mx-auto" : artifact.type === "intake_form" ? "max-w-3xl mx-auto" : artifact.type === "strategic_framework" ? "max-w-[900px] mx-auto" : artifact.type === "scenario_comparison" ? "max-w-[900px] mx-auto" : artifact.type === "epmo_dashboard" || artifact.type === "budget_report" || artifact.type === "capacity_report" ? "max-w-[1600px] mx-auto bg-card rounded-xl border border-border shadow-[var(--shadow-card)] p-6" : "max-w-[900px] mx-auto bg-card rounded-xl border border-border shadow-[var(--shadow-card)] p-6"}`}>
        {artifact.type === "readiness" && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-xs font-medium text-foreground">{artifact.pct}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mb-4">
              <div className="h-1.5 rounded-full bg-foreground/40 transition-all" style={{ width: `${artifact.pct}%` }} />
            </div>
            {artifact.rows.map((r: any, i: number) => (
              <div key={i} className="flex items-center gap-2.5 py-2 border-b border-border last:border-0">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dotColor[r.s] }} />
                <span className="flex-1 text-sm text-foreground">{r.l}</span>
                <span className="text-xs text-muted-foreground">{r.n}</span>
              </div>
            ))}
          </div>
        )}
        {artifact.type === "table" && (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px] table-fixed">
            <thead>
              <tr>{artifact.cols.map((c: string, i: number) => <th key={i} className="text-left text-xs text-muted-foreground font-medium pb-2 pr-3 whitespace-nowrap">{c}</th>)}</tr>
            </thead>
            <tbody>
              {artifact.rows.map((row: any[], i: number) => (
                <tr key={i} className="border-t border-border">
                  {row.map((cell: any, j: number) => (
                    <td key={j} className={`py-2 pr-3 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[260px] ${j === 0 ? "font-medium text-foreground" : "text-muted-foreground"}`} title={typeof cell === "string" ? cell : undefined}>
                      {typeof cell === "object" && cell.badge
                        ? <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${badgeClass[cell.color]}`}>{cell.badge}</span>
                        : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
        {artifact.type === "goals" && artifact.themes.map((t: any, i: number) => (
          <div key={i} className="py-3 border-b border-border last:border-0">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: dotColor[t.s] }} />
              <div>
                <div className="text-sm font-medium text-foreground">{t.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{t.meta}</div>
                {t.krs.length > 0 && (
                  <div className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    {t.krs.map((k: string, j: number) => <div key={j} className="flex gap-1"><span className="text-muted-foreground/50">·</span>{k}</div>)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {artifact.type === "collab" && artifact.rows.map((r: any, i: number) => (
          <div key={i} className="flex items-start justify-between gap-3 py-3 border-b border-border last:border-0">
            <div>
              <div className="text-sm font-medium text-foreground">{r.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{r.role}</div>
              <div className="text-xs text-muted-foreground mt-1">{r.detail}</div>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border flex-shrink-0 ${badgeClass[r.urgency]}`}>
              {r.urgency === "red" ? "Urgent" : "Pending"}
            </span>
          </div>
        ))}
        {artifact.type === "steps" && (
          <div className="space-y-6">
            {artifact.intro && (
              <p className="text-[14px] leading-[1.7] text-foreground/85">{artifact.intro}</p>
            )}

            {/* Phase progress rail */}
            <div className="flex items-center gap-1.5 pt-1">
              {artifact.steps.map((s: any, i: number) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    s.status === "active" ? "bg-foreground" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <div className="-mt-4 text-[11px] text-muted-foreground">
              Phase 1 of 4
            </div>

            {/* Phase cards */}
            <div className="space-y-3 pt-2">
              {artifact.steps.map((step: any, i: number) => {
                const isActive = step.status === "active";
                const isLocked = step.status === "locked";
                return (
                  <div
                    key={i}
                    className={`rounded-xl border transition-all ${
                      isActive
                        ? "border-foreground/20 bg-card shadow-sm ring-1 ring-foreground/5"
                        : "border-border/60 bg-card/50"
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0 ${
                            isActive
                              ? "bg-foreground text-background"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {step.num}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <div className={`text-[14px] font-semibold ${isLocked ? "text-foreground/60" : "text-foreground"}`}>
                              {step.title}
                            </div>
                            <span
                              className={`text-[10.5px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                                isActive
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-muted-foreground/80"
                              }`}
                            >
                              {isLocked ? `🔒 ${step.cta}` : step.cta}
                            </span>
                          </div>
                          <div className={`text-[13px] leading-relaxed ${isLocked ? "text-muted-foreground/70" : "text-muted-foreground"}`}>
                            {step.desc}
                          </div>

                          {/* Detail grid — only show on non-locked or active */}
                          {(step.duration || step.deliverables || step.keyQuestion) && (
                            <div className={`mt-3.5 pt-3.5 border-t border-border/50 grid grid-cols-[110px_1fr] gap-x-4 gap-y-2.5 text-[12px] ${isLocked ? "opacity-70" : ""}`}>
                              {step.duration && (
                                <>
                                  <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground/70 font-medium pt-0.5">Duration</div>
                                  <div className="text-foreground/80">{step.duration}</div>
                                </>
                              )}
                              {step.deliverables && (
                                <>
                                  <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground/70 font-medium pt-0.5">Deliverables</div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {step.deliverables.map((d: string, di: number) => (
                                      <span key={di} className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted/70 text-foreground/80 text-[11.5px] border border-border/40">
                                        {d}
                                      </span>
                                    ))}
                                  </div>
                                </>
                              )}
                              {step.keyQuestion && (
                                <>
                                  <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground/70 font-medium pt-0.5">Key question</div>
                                  <div className="italic text-foreground/75 leading-snug">"{step.keyQuestion}"</div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Operating principles */}
            {artifact.principles && (
              <div className="pt-4 mt-2 border-t border-border/60">
                <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground/70 font-medium mb-3">How Arc operates</div>
                <div className="grid grid-cols-3 gap-3">
                  {artifact.principles.map((p: any, i: number) => (
                    <div key={i} className="rounded-lg border border-border/60 bg-card/50 p-3">
                      <div className="text-[12.5px] font-semibold text-foreground mb-1">{p.label}</div>
                      <div className="text-[11.5px] text-muted-foreground leading-relaxed">{p.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {artifact.type === "phases" && artifact.phases && (() => {
          return (
            <div className="space-y-5">
              {/* Header — title + description */}
              <div className="space-y-2">
                <h2 className="text-[22px] font-semibold tracking-tight text-foreground leading-tight">
                  {artifact.title || "Arc planning process"}
                </h2>
                <p className="text-[14px] leading-[1.7] text-muted-foreground">
                  {artifact.intro || "Arc structures planning into three phases that run in parallel as your portfolio matures. Setup defines the rules of the game, Plan & Commit converts demand into a funded baseline, and Monitor & Adjust keeps the plan honest against reality."}
                </p>
              </div>

              {/* Phase cards — non-linear, parallel layout */}
              <div className="space-y-4">
                {artifact.phases.map((phase: any, i: number) => {
                  const isActive = phase.status === "active";
                  const isLocked = phase.status === "locked";
                  return (
                    <div
                      key={i}
                      className={`relative rounded-2xl border p-5 transition-all ${
                        isActive
                          ? "border-foreground/15 bg-card shadow-sm"
                          : "border-border/60 bg-card/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`text-[10px] uppercase tracking-[0.14em] font-semibold ${isActive ? "text-foreground/60" : "text-muted-foreground/70"}`}>
                            Phase {phase.num}
                          </div>
                          <div className={`text-[16px] font-semibold tracking-tight ${isLocked ? "text-foreground/70" : "text-foreground"}`}>
                            {phase.title}
                          </div>
                        </div>
                        <span
                          className={`text-[10.5px] px-2.5 py-1 rounded-full font-semibold whitespace-nowrap inline-flex items-center gap-1.5 ${
                            isActive
                              ? "bg-foreground text-background"
                              : "bg-muted text-muted-foreground/80"
                          }`}
                        >
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-background animate-pulse" />}
                          {isActive ? "You are here" : isLocked ? "Up next" : "Done"}
                        </span>
                      </div>
                      {phase.desc && (
                        <div className={`text-[13px] leading-relaxed mb-4 ${isLocked ? "text-muted-foreground/70" : "text-muted-foreground"}`}>
                          {phase.desc}
                        </div>
                      )}

                      {/* Sub-items as a non-linear grid (expandable) */}
                      {phase.steps && phase.steps.length > 0 && (
                        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 ${isLocked ? "opacity-80" : ""}`}>
                          {phase.steps.map((s: any, si: number) => (
                            <PhaseStepCard key={si} step={s} active={isActive} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
        {artifact.type === "upload_progress" && (
          <div className="rounded-lg border border-border p-6 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 icon-tile bg-accent flex items-center justify-center">
              <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="1.5" width="12" height="13" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                <line x1="5" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1"/>
                <line x1="5" y1="8.5" x2="9" y2="8.5" stroke="currentColor" strokeWidth="1"/>
              </svg>
            </div>
            <div className="text-sm font-medium text-foreground">{artifact.title}</div>
            <div className="text-xs text-muted-foreground">{artifact.subtitle}</div>
          </div>
        )}
        {artifact.type === "dropzone" && (
          <DropzoneArtifact artifact={artifact} />
        )}
        {artifact.type === "strategy_extract" && (
          <div className="space-y-5">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Themes identified</div>
              <div className="flex flex-wrap gap-2">
                {artifact.themes.map((theme: string, i: number) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-accent text-foreground border border-border">
                    {theme}
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-900/30 text-amber-400 border border-amber-800/50 font-medium">Draft</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Objectives found</div>
              <div className="text-sm text-foreground/80">{artifact.objectives_note}</div>
            </div>
            <div className="border-t border-border pt-4">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Key results found</div>
              <div className="text-sm text-foreground/80">{artifact.krs_note}</div>
            </div>
          </div>
        )}
        {artifact.type === "goals_draft" && (
          <div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 mb-4 text-xs text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/10 dark:text-amber-400 flex items-center justify-between">
              <span>Everything here is a draft. Nothing is confirmed until you approve it.</span>
              <div className="flex gap-1.5">
                <button onClick={() => { artifact.themes.forEach((_: any, idx: number) => resolvedDecisions.add(500 + idx)); setResolvedDecisions(new Set(resolvedDecisions)); toast.success("All themes approved"); }} className="text-[10px] px-2 py-0.5 rounded bg-amber-600 text-white hover:bg-amber-700 transition-colors font-medium">Approve All</button>
              </div>
            </div>
            {artifact.themes.map((t: any, i: number) => {
              const isThemeExpanded = expandedRows.has(600 + i);
              const isApproved = resolvedDecisions.has(500 + i);
              const isDismissed = resolvedDecisions.has(700 + i);
              const themeColors: Record<string, string> = { green: "#1D9E75", blue: "#3B82F6", purple: "#8B5CF6", amber: "#EF9F27", gray: "#6B7280" };
              const dotCol = themeColors[t.s] || "#6B7280";
              return (
              <div key={i} className={`py-3 border-b border-border last:border-0 transition-all ${isDismissed ? "opacity-30" : ""}`}>
                <div className="flex items-start gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 transition-all" style={{ background: dotCol, boxShadow: isThemeExpanded ? `0 0 8px ${dotCol}40` : "none" }} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between cursor-pointer group" onClick={() => toggleRow(600 + i)}>
                      <div className="flex items-center gap-2">
                        <svg className={`h-3 w-3 text-muted-foreground/50 transition-transform ${isThemeExpanded ? "rotate-90" : ""}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4l4 4-4 4"/></svg>
                        <span className={`text-sm font-medium ${isApproved ? "text-[#1D9E75]" : "text-foreground"} group-hover:text-primary transition-colors`}>{t.name}</span>
                        {isApproved && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#1D9E75]/10 text-[#1D9E75] border border-[#1D9E75]/30 font-medium">Approved</span>}
                      </div>
                      <span className="text-[10px] text-muted-foreground/50">{t.objectives?.length || 0} objectives</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 ml-5">{t.meta}</div>
                    {isThemeExpanded && t.objectives?.map((obj: any, j: number) => {
                      const isObjExpanded = expandedRows.has(800 + i * 10 + j);
                      return (
                      <div key={j} className="mt-2 ml-5 pl-3 border-l-2 border-border/60 hover:border-primary/40 transition-colors">
                        <div className="flex items-center gap-1.5 text-xs cursor-pointer py-1 hover:bg-secondary/20 rounded-r-md px-1 -mx-1 transition-colors" onClick={() => toggleRow(800 + i * 10 + j)}>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${obj.source === "deck" ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50" : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50"}`}>
                            {obj.source === "deck" ? "From deck" : "AI draft"}
                          </span>
                          <span className="text-foreground font-medium flex-1">{obj.title}</span>
                          <svg className={`h-3 w-3 text-muted-foreground/30 transition-transform ${isObjExpanded ? "rotate-90" : ""}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4l4 4-4 4"/></svg>
                        </div>
                        {isObjExpanded && (
                          <div className="ml-1 mt-1.5 p-2.5 bg-secondary/20 rounded-lg border border-border/30 space-y-2">
                            {obj.krs?.length > 0 ? obj.krs.map((kr: string, k: number) => (
                              <div key={k} className="text-xs text-muted-foreground flex gap-1"><span className="text-muted-foreground/50">·</span>{kr}</div>
                            )) : <div className="text-[10px] text-muted-foreground/60 italic">No KRs defined yet</div>}
                            <div className="flex gap-2 pt-1 border-t border-border/20">
                              <button onClick={(e) => { e.stopPropagation(); toast.success(`"${obj.title}" approved`); }} className="text-[10px] px-2 py-0.5 rounded border border-[#1D9E75]/30 bg-[#1D9E75]/5 hover:bg-[#1D9E75]/15 text-[#1D9E75] transition-colors font-medium">Approve</button>
                              <button onClick={(e) => { e.stopPropagation(); toast(`Editing "${obj.title}"`); }} className="text-[10px] px-2 py-0.5 rounded border border-border bg-card hover:bg-secondary text-muted-foreground transition-colors">Edit</button>
                              <button onClick={(e) => { e.stopPropagation(); toast(`Add KRs to "${obj.title}"`); }} className="text-[10px] px-2 py-0.5 rounded border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary transition-colors">+ Add KR</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );})}
                    <div className="mt-2.5 ml-5 flex gap-2">
                      {!isApproved && !isDismissed && <>
                        <button onClick={() => { setResolvedDecisions(prev => { const n = new Set(prev); n.add(500 + i); return n; }); toast.success(`${t.name} approved`); }} className="text-[10px] px-2.5 py-1 rounded-md border border-[#1D9E75]/40 bg-[#1D9E75]/5 hover:bg-[#1D9E75]/15 text-[#1D9E75] transition-colors font-medium">Approve Theme</button>
                        <button onClick={() => toast(`Editing ${t.name}`)} className="text-[10px] px-2.5 py-1 rounded-md border border-border bg-card hover:bg-secondary text-muted-foreground transition-colors">Edit</button>
                        <button onClick={() => { setResolvedDecisions(prev => { const n = new Set(prev); n.add(700 + i); return n; }); toast(`${t.name} dismissed`); }} className="text-[10px] px-2.5 py-1 rounded-md border border-border bg-card hover:bg-secondary text-muted-foreground/60 hover:text-[#D85A30] transition-colors">Dismiss</button>
                      </>}
                      {isApproved && <button onClick={() => { setResolvedDecisions(prev => { const n = new Set(prev); n.delete(500 + i); return n; }); toast(`${t.name} unapproved`); }} className="text-[10px] px-2.5 py-1 rounded-md border border-border bg-card hover:bg-secondary text-muted-foreground transition-colors">Undo Approve</button>}
                      {isDismissed && <button onClick={() => { setResolvedDecisions(prev => { const n = new Set(prev); n.delete(700 + i); return n; }); toast(`${t.name} restored`); }} className="text-[10px] px-2.5 py-1 rounded-md border border-border bg-card hover:bg-secondary text-muted-foreground transition-colors">Restore</button>}
                    </div>
                  </div>
                </div>
              </div>
            );})}
          </div>
        )}
        {artifact.type === "scenarios" && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>{SCENARIOS.cols.map((c, i) => <th key={i} className={`text-left pb-2 pr-2 font-medium ${i === 0 ? "text-muted-foreground" : "text-foreground"}`}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {SCENARIOS.rows.map((row, i) => (
                  <tr key={i} className="border-t border-border">
                    {row.map((cell, j) => (
                      <td key={j} className={`py-1.5 pr-2 ${j === 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                        {typeof cell === "object"
                          ? <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium border ${badgeClass[(cell as any).c]}`}>{(cell as any).t}</span>
                          : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {artifact.type === "synthesis" && (
          <div className="space-y-5">
            {artifact.sections.map((section: any, i: number) => (
              <div key={i}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dotColor[section.status] }} />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{section.title}</span>
                </div>
                {section.items.map((item: string, j: number) => (
                  <div key={j} className="ml-4 py-2 border-b border-border last:border-0">
                    <div className="text-sm text-foreground leading-relaxed">{item}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        {artifact.type === "guardrail_check" && (
          <div className="space-y-5">
            {artifact.sections.map((section: any, i: number) => (
              <div key={i}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dotColor[section.status] }} />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{section.title}</span>
                </div>
                {section.items.map((item: any, j: number) => (
                  <div key={j} className="ml-4 py-2 border-b border-border last:border-0">
                    <div className="text-sm font-medium text-foreground">{item.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.detail}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        {artifact.type === "project_detail" && (
          <div>
            <div className="space-y-2 mb-4">
              {artifact.fields.map((f: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-xs text-muted-foreground">{f.label}</span>
                  <span className="text-sm font-medium text-foreground">{f.value}</span>
                </div>
              ))}
            </div>
            {artifact.conflict && (
              <div className="rounded-lg border-l-4 border-l-amber-500 border border-border bg-card px-4 py-3 mt-4">
                <div className="text-sm font-semibold text-foreground mb-2">{artifact.conflict.title}</div>
                <ul className="space-y-1.5">
                  {artifact.conflict.points.map((p: string, i: number) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2"><span className="text-muted-foreground/50 flex-shrink-0">•</span>{p}</li>
                  ))}
                </ul>
                {artifact.conflict.note && <div className="text-xs text-muted-foreground/70 mt-2 italic">{artifact.conflict.note}</div>}
              </div>
            )}
          </div>
        )}
        {artifact.type === "theme_detail" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${badgeClass[artifact.badge.color]}`}>{artifact.badge.text}</span>
              {artifact.budget && <span className="text-xs text-muted-foreground">{artifact.budget}</span>}
            </div>
            {artifact.objectives.map((obj: any, i: number) => (
              <div key={i} className="py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${badgeClass[obj.badge.color]}`}>{obj.badge.text}</span>
                  <span className="text-sm font-medium text-foreground">{obj.title}</span>
                </div>
                <div className="text-xs text-muted-foreground mb-1.5">Owner: {obj.owner}</div>
                {obj.krs.map((kr: string, j: number) => (
                  <div key={j} className="text-xs text-muted-foreground flex gap-1 ml-1"><span className="text-muted-foreground/50">·</span>{kr}</div>
                ))}
              </div>
            ))}
            {artifact.status && <div className="text-xs text-muted-foreground mt-3 italic">{artifact.status}</div>}
          </div>
        )}
        {artifact.type === "resource_overlap" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="text-xs font-medium text-foreground mb-2">{artifact.left.title}</div>
                {artifact.left.teams.map((t: string, i: number) => (
                  <div key={i} className="text-xs text-muted-foreground flex gap-1 mb-0.5"><span className="text-muted-foreground/50">·</span>{t}</div>
                ))}
                <div className="text-xs font-medium text-foreground mt-2">Total: {artifact.left.total}</div>
                <div className="text-xs text-muted-foreground">Duration: {artifact.left.duration}</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="text-xs font-medium text-foreground mb-2">{artifact.right.title}</div>
                {artifact.right.teams.map((t: string, i: number) => (
                  <div key={i} className="text-xs text-muted-foreground flex gap-1 mb-0.5"><span className="text-muted-foreground/50">·</span>{t}</div>
                ))}
                <div className="text-xs font-medium text-foreground mt-2">Total: {artifact.right.total}</div>
                <div className="text-xs text-muted-foreground">Duration: {artifact.right.duration}</div>
              </div>
            </div>
            <div className="rounded-lg border-l-4 border-l-amber-500 border border-border bg-card px-3 py-2 text-xs text-muted-foreground leading-relaxed">
              {artifact.overlap}
            </div>
          </div>
        )}
        {artifact.type === "submission_package" && (
          <div>
            {artifact.themes.map((t: any, i: number) => (
              <div key={i} className="py-3 border-b border-border last:border-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t.budget} · {t.objectives}</div>
                    <div className="text-xs text-muted-foreground">Owner: {t.owner} · Approved {t.approved}</div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50 flex-shrink-0">Approved</span>
                </div>
                {t.flag && <div className="text-xs text-amber-400 mt-1 flex items-center gap-1"><span>⚑</span>{t.flag}</div>}
              </div>
            ))}
            <div className="mt-4 rounded-lg border border-border bg-card p-3 space-y-1">
              <div className="grid grid-cols-2 gap-1 text-xs">
                <span className="text-muted-foreground">Total budget</span><span className="text-foreground font-medium">{artifact.summary.totalBudget}</span>
                <span className="text-muted-foreground">Reserve</span><span className="text-foreground font-medium">{artifact.summary.reserve}</span>
                <span className="text-muted-foreground">Net new projects</span><span className="text-foreground font-medium">{artifact.summary.projects}</span>
                <span className="text-muted-foreground">FTEs required</span><span className="text-foreground font-medium">{artifact.summary.ftes}</span>
                <span className="text-muted-foreground">Guardrail conflicts</span><span className="text-foreground font-medium">{artifact.summary.conflicts}</span>
                <span className="text-muted-foreground">Open flags</span><span className="text-foreground font-medium">{artifact.summary.flags}</span>
              </div>
            </div>
            {artifact.deferred && <div className="text-xs text-muted-foreground mt-3 italic">{artifact.deferred}</div>}
          </div>
        )}
        {artifact.type === "scoring_model" && (
          <div className="space-y-3">
            {artifact.criteria.map((c: any, i: number) => (
              <div key={i} className="flex gap-3 py-2.5 border-b border-border last:border-0">
                <div className="flex-shrink-0 w-12 text-right">
                  <span className="text-sm font-bold text-foreground">{c.weight}</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{c.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{c.desc}</div>
                </div>
              </div>
            ))}
            <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">Maximum score: 100. Below 60 = deferral review. Above 80 = recommended for funding.</div>
          </div>
        )}
        {artifact.type === "prioritization_table" && (() => {
          const allProjects = artifact.sections.flatMap((s: any) => s.projects.map((p: any) => ({ ...p, sectionStatus: s.status })));
          const funded = allProjects.filter((p: any) => p.rec === "Fund");
          const unfunded = allProjects.filter((p: any) => p.rec !== "Fund");
          return (
            <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)]">
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <svg className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M3 6h14M3 10h14M3 14h14"/><circle cx="10" cy="6" r="1.5" fill="currentColor"/><circle cx="10" cy="10" r="1.5" fill="currentColor"/><circle cx="10" cy="14" r="1.5" fill="currentColor"/></svg>
                    <h3 className="font-semibold text-foreground">Priority Stack</h3>
                    <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-medium">{allProjects.length} initiatives</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedFilter('all')} className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border transition-all ${selectedFilter === 'all' ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:border-primary/40'}`}>All</button>
                    <button onClick={() => setSelectedFilter('funded')} className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border transition-all ${selectedFilter === 'funded' ? 'border-[#1D9E75] text-[#1D9E75] bg-[#1D9E75]/10' : 'border-[#1D9E75]/40 text-[#1D9E75] bg-[#1D9E75]/10 hover:bg-[#1D9E75]/20'}`}>{funded.length} Funded</button>
                    <button onClick={() => setSelectedFilter('unfunded')} className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border transition-all ${selectedFilter === 'unfunded' ? 'border-[#D85A30] text-[#D85A30] bg-[#D85A30]/10' : 'border-[#D85A30]/40 text-[#D85A30] bg-[#D85A30]/10 hover:bg-[#D85A30]/20'}`}>{unfunded.length} Unfunded</button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-[10px] text-muted-foreground">
                      <th className="w-8 px-2 py-2.5"></th>
                      <th className="w-8 px-1 py-2.5"></th>
                      <th className="w-8 text-center py-2.5 font-medium">#</th>
                      <th className="text-left py-2.5 px-3 font-medium min-w-[220px]">Project Name</th>
                      <th className="w-16 text-center py-2.5 font-medium">Score</th>
                      <th className="w-16 text-center py-2.5 font-medium">Rec</th>
                      <th className="text-left py-2.5 px-3 font-medium">Theme</th>
                      <th className="text-left py-2.5 px-3 font-medium">Owner</th>
                      <th className="text-right py-2.5 px-3 font-medium">Budget</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allProjects
                      .filter((p: any) => selectedFilter === 'all' ? true : selectedFilter === 'funded' ? p.rec === 'Fund' : p.rec !== 'Fund')
                      .map((p: any, i: number) => {
                      const isFunded = p.rec === "Fund";
                      const isExpanded = expandedRows.has(p.rank);
                      const filteredProjects = allProjects.filter((pp: any) => selectedFilter === 'all' ? true : selectedFilter === 'funded' ? pp.rec === 'Fund' : pp.rec !== 'Fund');
                      const prevProject = filteredProjects[filteredProjects.indexOf(p) - 1];
                      const showCutline = selectedFilter === 'all' && prevProject && isFunded !== (prevProject.rec === "Fund");
                      return (
                        <React.Fragment key={p.rank}>
                          {showCutline && (
                            <tr className="bg-[#D85A30]/10 border-y-2 border-dashed border-[#D85A30]">
                              <td colSpan={9} className="py-1.5 px-4">
                                <div className="flex items-center gap-2">
                                  <svg className="h-3.5 w-3.5 text-[#D85A30]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 8h4M10 8h4M8 2l-2 6 2 6"/></svg>
                                  <span className="text-[10px] font-semibold text-[#D85A30]">Budget Cutline</span>
                                </div>
                              </td>
                            </tr>
                          )}
                          <tr onClick={() => toggleRow(p.rank)} className={`border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer ${!isFunded ? "opacity-50" : ""} ${isExpanded ? "bg-secondary/20" : ""}`}>
                            <td className="w-8 px-2 py-2.5 text-muted-foreground/30">
                              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><circle cx="5" cy="4" r="1.2"/><circle cx="5" cy="8" r="1.2"/><circle cx="5" cy="12" r="1.2"/><circle cx="11" cy="4" r="1.2"/><circle cx="11" cy="8" r="1.2"/><circle cx="11" cy="12" r="1.2"/></svg>
                            </td>
                            <td className="w-8 px-1 py-2.5 text-muted-foreground/30">
                              <svg className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4l4 4-4 4"/></svg>
                            </td>
                            <td className="text-center py-2.5 font-mono text-muted-foreground">{p.rank}</td>
                            <td className="py-2.5 px-3">
                              <span className="text-xs font-medium text-foreground">{p.name}</span>
                            </td>
                            <td className="text-center py-2.5">
                              <span className="inline-flex items-center justify-center w-9 h-6 rounded-full bg-primary text-primary-foreground text-[11px] font-bold cursor-help" title={`Score: ${p.score}/100`}>{p.score}</span>
                            </td>
                            <td className="text-center py-2.5">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                                p.rec === "Fund" ? "border-[#1D9E75]/30 text-[#1D9E75] bg-[#1D9E75]/10" :
                                p.rec === "Conditional" ? "border-[#EF9F27]/30 text-[#EF9F27] bg-[#EF9F27]/10" :
                                "border-[#D85A30]/30 text-[#D85A30] bg-[#D85A30]/10"
                              }`}>{p.rec}</span>
                            </td>
                            <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{p.theme}</td>
                            <td className="py-2.5 px-3">
                              {p.owner ? (
                                <span className="text-xs text-muted-foreground">{p.owner}</span>
                              ) : (
                                <span className="text-[10px] text-[#D85A30] font-medium">⚠ No owner</span>
                              )}
                            </td>
                            <td className="text-right py-2.5 px-3 text-xs font-medium text-foreground">{p.budget}</td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-secondary/10">
                              <td colSpan={9} className="px-6 py-3">
                                <div className="text-xs text-foreground/80 leading-relaxed mb-2">{p.rationale}</div>
                                <div className="flex items-center gap-3 mt-2">
                                  <button onClick={(e) => { e.stopPropagation(); toast.success(`${p.name} flagged for review`); }} className="text-[10px] px-2.5 py-1 rounded-md border border-border bg-card hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">Flag for Review</button>
                                  <button onClick={(e) => { e.stopPropagation(); toast(`Exported ${p.name} details`); }} className="text-[10px] px-2.5 py-1 rounded-md border border-border bg-card hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">Export Details</button>
                                  {p.owner && <button onClick={(e) => { e.stopPropagation(); toast(`Message drafted for ${p.owner}`); }} className="text-[10px] px-2.5 py-1 rounded-md border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-primary">Contact {p.owner}</button>}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary footer */}
              {artifact.summary && (
                <div className="p-4 border-t border-border">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Recommended ({artifact.summary.recommended.count})</span><span className="text-[#1D9E75] font-medium">{artifact.summary.recommended.budget}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Conditional ({artifact.summary.conditional.count})</span><span className="text-[#EF9F27] font-medium">{artifact.summary.conditional.budget}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Deferred ({artifact.summary.deferred.count})</span><span className="text-[#D85A30] font-medium">{artifact.summary.deferred.budget}</span></div>
                    <div className="flex justify-between"><span className="text-foreground font-medium">Envelope</span><span className="text-foreground font-medium">{artifact.summary.envelope}</span></div>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border/40">If all conditionals funded: {artifact.summary.ifAllConditionals}</div>
                </div>
              )}
            </div>
          );
        })()}
        {artifact.type === "intake_decisions" && (
          <div>
            {artifact.sections.map((section: any, si: number) => (
              <div key={si} className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dotColor[section.status] }} />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{section.label}</span>
                </div>
                <div className="space-y-1">
                  {section.items.map((item: string, ii: number) => (
                    <div key={ii} className={`text-xs leading-relaxed flex gap-2 ${section.status === "red" ? "text-muted-foreground/60" : "text-foreground/80"}`}>
                      <span className="text-muted-foreground/40 flex-shrink-0">·</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {artifact.summary && (
              <div className="rounded-lg border border-border bg-card p-3 mt-4 space-y-1">
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <span className="text-muted-foreground">Committed</span><span className="text-foreground font-medium">{artifact.summary.committed}</span>
                  <span className="text-muted-foreground">Spendable envelope</span><span className="text-foreground font-medium">{artifact.summary.envelope}</span>
                  <span className="text-muted-foreground">Headroom</span><span className="text-green-400 font-medium">{artifact.summary.headroom}</span>
                </div>
                <div className="text-xs text-muted-foreground/60 mt-2 pt-2 border-t border-border">{artifact.summary.projects}</div>
              </div>
            )}
          </div>
        )}
        {artifact.type === "committee_summary" && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-secondary border border-border">
                  <svg className="h-4 w-4 text-foreground" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="2" y="3" width="12" height="10" rx="1.5"/><line x1="2" y1="6" x2="14" y2="6"/><line x1="6" y1="6" x2="6" y2="13"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Envelope Position</h3>
                  <p className="text-[10px] text-muted-foreground">By strategic theme</p>
                </div>
              </div>
              <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead><tr className="border-b border-border">{artifact.envelope.cols.map((c: string, i: number) => <th key={i} className="text-left py-2 text-xs font-medium text-muted-foreground">{c}</th>)}</tr></thead>
                <tbody>{artifact.envelope.rows.map((row: any[], ri: number) => (
                  <tr key={ri} className="border-b border-border/50">{row.map((cell: any, ci: number) => (
                    <td key={ci} className="py-2 text-xs text-foreground">{typeof cell === "object" && cell?.badge ? <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border ${badgeClass[cell.color]}`}>{cell.badge}</span> : cell}</td>
                  ))}</tr>
                ))}</tbody>
              </table>
              </div>
              {artifact.envelope.footer && <div className="text-[10px] text-muted-foreground mt-3 pt-2 border-t border-border/40">{artifact.envelope.footer}</div>}
            </div>
            <div className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
                  <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M8 2l6 10H2L8 2z"/><line x1="8" y1="7" x2="8" y2="9"/><circle cx="8" cy="11" r="0.5" fill="currentColor"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Pre-Scoring Issues</h3>
                  <p className="text-[10px] text-muted-foreground">Requiring committee awareness</p>
                </div>
              </div>
              <div className="space-y-2">
                {artifact.issues.map((issue: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-foreground/85">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#EF9F27] mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {artifact.type === "committee_decision" && (
          <div className="space-y-4">
            {/* Above cutline card */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[#1D9E75]/10 border border-[#1D9E75]/30">
                  <svg className="h-4 w-4 text-[#1D9E75]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8l3 3 7-7"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{artifact.aboveCutline.label}</h3>
                  <p className="text-[10px] text-muted-foreground">{artifact.aboveCutline.summary}</p>
                </div>
              </div>
              {artifact.aboveCutline.themes.map((theme: any, ti: number) => (
                <div key={ti} className="mb-3 last:mb-0">
                  <button onClick={() => toggleSection(ti)} className="flex items-center gap-1.5 w-full text-left group">
                    <svg className={`h-3 w-3 text-muted-foreground/50 transition-transform ${collapsedSections.has(ti) ? "" : "rotate-90"}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4l4 4-4 4"/></svg>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">{theme.name}</span>
                    <span className="text-[10px] text-muted-foreground/30 ml-1">{theme.projects.length}</span>
                  </button>
                  {!collapsedSections.has(ti) && theme.projects.map((p: any, pi: number) => (
                    <div key={pi} onClick={() => toast(p.name, { description: `${p.owner} · ${p.budget} · ${p.rationale}` })} className="py-1.5 border-b border-border/40 last:border-0 cursor-pointer hover:bg-secondary/20 transition-colors rounded px-1 ml-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground">{p.name}</span>
                        <span className="text-xs font-medium text-foreground">{p.budget}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">{p.owner} · {p.rationale}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Decisions card */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[#2D2580]/10 border border-[#2D2580]/30 dark:bg-[#7B6FD4]/10 dark:border-[#7B6FD4]/30">
                  <svg className="h-4 w-4 text-[#2D2580] dark:text-[#7B6FD4]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2.5 1.5"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Decisions Required</h3>
                  <p className="text-[10px] text-muted-foreground">{artifact.decisions.length} items for committee</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {artifact.decisions.map((d: any, i: number) => (
                  <div key={i} onClick={() => toggleDecision(d.number)} className={`rounded-lg border p-3 cursor-pointer transition-all ${resolvedDecisions.has(d.number) ? "bg-[#1D9E75]/5 border-[#1D9E75]/30" : "bg-secondary/50 border-border/50 hover:border-primary/30"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${resolvedDecisions.has(d.number) ? "border-[#1D9E75] bg-[#1D9E75]" : "border-muted-foreground/30"}`}>
                          {resolvedDecisions.has(d.number) && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 8l3 3 7-7"/></svg>}
                        </div>
                        <span className={`text-xs font-medium ${resolvedDecisions.has(d.number) ? "text-muted-foreground line-through" : "text-foreground"}`}>Decision {d.number} — {d.title}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground bg-secondary rounded px-1.5 py-0.5">{d.time}</span>
                    </div>
                    <div className={`text-xs leading-relaxed ml-6 ${resolvedDecisions.has(d.number) ? "text-muted-foreground/60" : "text-muted-foreground"}`}>{d.body}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Below cutline card */}
            <div className="bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                <span className="text-xs font-medium text-muted-foreground">{artifact.belowCutline.label}</span>
              </div>
              <div className="text-xs text-muted-foreground">{artifact.belowCutline.summary}</div>
            </div>

            {artifact.footer && <div className="text-[10px] text-muted-foreground pt-2">{artifact.footer}</div>}
          </div>
        )}
        {artifact.type === "scenario_a_decisions" && (
          <div className="space-y-4">
            {/* Scope reductions card */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
                  <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M4 8h8M2 4l12 0M6 12h4"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Scope Reductions</h3>
                  <p className="text-[10px] text-muted-foreground">{artifact.scopeReductions.length} projects adjusted</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {artifact.scopeReductions.map((item: any, i: number) => (
                  <div key={i} onClick={() => toggleRow(200 + i)} className={`bg-secondary/50 rounded-lg border border-border/50 p-3 cursor-pointer transition-all hover:border-primary/30 ${expandedRows.has(200 + i) ? "ring-1 ring-primary/20" : ""}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <svg className={`h-3 w-3 text-muted-foreground transition-transform ${expandedRows.has(200 + i) ? "rotate-90" : ""}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4l4 4-4 4"/></svg>
                        <span className="text-xs font-medium text-foreground">{item.project}</span>
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border ${badgeClass.amber}`}>{item.saving}</span>
                    </div>
                    <div className="text-xs text-muted-foreground ml-5">{item.decision}</div>
                    {expandedRows.has(200 + i) && (
                      <div className="ml-5 mt-2 pt-2 border-t border-border/30 space-y-1.5">
                        <div className="text-xs text-foreground/80 leading-relaxed">{item.rationale}</div>
                        <div className="text-[10px] text-muted-foreground italic">Owner note: "{item.ownerNote}"</div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={(e) => { e.stopPropagation(); toast.success(`${item.project} acknowledged`); }} className="text-[10px] px-2.5 py-1 rounded-md border border-[#1D9E75]/30 bg-[#1D9E75]/5 hover:bg-[#1D9E75]/10 transition-colors text-[#1D9E75]">Acknowledge</button>
                          <button onClick={(e) => { e.stopPropagation(); toast(`Escalated ${item.project}`); }} className="text-[10px] px-2.5 py-1 rounded-md border border-border bg-card hover:bg-secondary transition-colors text-muted-foreground">Escalate</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Suspensions card */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40">
                  <svg className="h-4 w-4 text-red-600 dark:text-red-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><line x1="5" y1="5" x2="11" y2="11"/><line x1="11" y1="5" x2="5" y2="11"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Project Suspensions</h3>
                  <p className="text-[10px] text-muted-foreground">{artifact.suspensions.length} projects deferred</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {artifact.suspensions.map((item: any, i: number) => (
                  <div key={i} onClick={() => toggleRow(300 + i)} className={`bg-red-50/50 dark:bg-red-900/10 rounded-lg border border-red-200/60 dark:border-red-800/30 p-3 cursor-pointer transition-all hover:border-red-300 dark:hover:border-red-700/50 ${expandedRows.has(300 + i) ? "ring-1 ring-red-400/20" : ""}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <svg className={`h-3 w-3 text-red-400 transition-transform ${expandedRows.has(300 + i) ? "rotate-90" : ""}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4l4 4-4 4"/></svg>
                        <span className="text-xs font-medium text-foreground">{item.project}</span>
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border ${badgeClass.red}`}>{item.saving}</span>
                    </div>
                    <div className="text-xs text-muted-foreground ml-5">{item.decision}</div>
                    {expandedRows.has(300 + i) && (
                      <div className="ml-5 mt-2 pt-2 border-t border-red-200/30 dark:border-red-800/20 space-y-1.5">
                        <div className="text-xs text-foreground/80 leading-relaxed">{item.rationale}</div>
                        <div className="text-[10px] text-muted-foreground italic">Owner note: "{item.ownerNote}"</div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={(e) => { e.stopPropagation(); toast(`Challenge submitted for ${item.project}`); }} className="text-[10px] px-2.5 py-1 rounded-md border border-[#D85A30]/30 bg-[#D85A30]/5 hover:bg-[#D85A30]/10 transition-colors text-[#D85A30]">Challenge Deferral</button>
                          <button onClick={(e) => { e.stopPropagation(); toast.success(`${item.project} accepted`); }} className="text-[10px] px-2.5 py-1 rounded-md border border-border bg-card hover:bg-secondary transition-colors text-muted-foreground">Accept</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Summary card */}
            <div className="bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-card)]">
              <div className="text-xs text-muted-foreground">
                Total savings: <span className="text-foreground font-semibold">{artifact.totalSaving}</span> · {artifact.summary}
              </div>
            </div>
          </div>
        )}
        {artifact.type === "executive_summary" && (
          <div className="space-y-1">
            <div className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)] mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-secondary border border-border">
                  <svg className="h-4 w-4 text-foreground" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="2" y="2" width="12" height="12" rx="2"/><line x1="5" y1="5.5" x2="11" y2="5.5"/><line x1="5" y1="8" x2="9" y2="8"/><line x1="5" y1="10.5" x2="11" y2="10.5"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{artifact.headline}</h3>
                  <p className="text-[10px] text-muted-foreground">Executive briefing</p>
                </div>
              </div>
            </div>
            {artifact.sections.map((section: any, i: number) => (
              <div key={i} onClick={() => toggleSection(50 + i)} className={`bg-card rounded-xl border border-border p-4 shadow-[var(--shadow-card)] cursor-pointer transition-all hover:border-primary/20 ${collapsedSections.has(50 + i) ? "opacity-60" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{section.label}</div>
                  <svg className={`h-3 w-3 text-muted-foreground/50 transition-transform ${collapsedSections.has(50 + i) ? "" : "rotate-180"}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6l4 4 4-4"/></svg>
                </div>
                {!collapsedSections.has(50 + i) && <div className="text-xs text-foreground/85 leading-relaxed mt-1.5">{section.body}</div>}
              </div>
            ))}
          </div>
        )}
        {artifact.type === "health_dashboard" && (
          <div className="space-y-5">
            {/* Hero metric tiles */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-secondary border border-border">
                  <svg className="h-4 w-4 text-foreground" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M2 8h3l2-4 2 8 2-4h3"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Portfolio Health</h3>
                  <p className="text-[10px] text-muted-foreground">Q1 summary metrics</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {artifact.metrics.map((m: any, i: number) => (
                  <div key={i} className={`bg-secondary/50 rounded-lg border p-3 text-center cursor-pointer transition-all ${selectedMetric === i ? "border-primary ring-1 ring-primary/30 bg-primary/5" : "border-border/50 hover:border-primary/30"}`} onClick={() => { setSelectedMetric(selectedMetric === i ? null : i); toast(`${m.label}: ${m.value}`, { description: m.detail }); }}>
                    <div className={`text-lg font-bold ${m.color === "green" ? "text-[#1D9E75]" : m.color === "red" ? "text-[#D85A30]" : "text-[#EF9F27]"}`}>{m.value}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{m.label}</div>
                    <div className="text-[9px] text-muted-foreground/70 mt-0.5">{m.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Theme health grid */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-secondary border border-border">
                  <svg className="h-4 w-4 text-foreground" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="8" cy="8" r="6"/><path d="M8 4v4l3 2"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Theme Health</h3>
                  <p className="text-[10px] text-muted-foreground">RAG status by strategic theme</p>
                </div>
              </div>
              <div className="space-y-0">
                {artifact.themes.map((t: any, i: number) => (
                  <React.Fragment key={i}>
                  <div onClick={() => toggleRow(100 + i)} className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0 cursor-pointer hover:bg-secondary/20 transition-colors rounded-md px-1 -mx-1">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: t.rag === "green" ? "#1D9E75" : t.rag === "red" ? "#D85A30" : "#EF9F27" }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{t.name}</div>
                      <div className="text-[10px] text-muted-foreground">{t.onTrack} on track · {t.budget}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-muted-foreground">{t.krs}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${t.trend === "deteriorating" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-secondary text-muted-foreground"}`}>
                        {t.trend === "deteriorating" ? "↓ declining" : "→ stable"}
                      </span>
                      <svg className={`h-3 w-3 text-muted-foreground transition-transform ${expandedRows.has(100 + i) ? "rotate-90" : ""}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4l4 4-4 4"/></svg>
                    </div>
                  </div>
                  {expandedRows.has(100 + i) && (
                    <div className="ml-6 mb-2 p-3 bg-secondary/30 rounded-lg border border-border/30 text-xs space-y-1.5">
                      <div className="text-foreground/80 leading-relaxed">Status: <span className="font-medium">{t.onTrack}</span> · Budget: <span className="font-medium">{t.budget}</span> · KRs: <span className="font-medium">{t.krs}</span></div>
                      <div className="flex gap-2 pt-1">
                        <button onClick={(e) => { e.stopPropagation(); toast(`Drilled into ${t.name} theme details`); }} className="text-[10px] px-2.5 py-1 rounded-md border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-primary">View Projects</button>
                        <button onClick={(e) => { e.stopPropagation(); toast(`Exported ${t.name} report`); }} className="text-[10px] px-2.5 py-1 rounded-md border border-border bg-card hover:bg-secondary transition-colors text-muted-foreground">Export</button>
                      </div>
                    </div>
                  )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
        {artifact.type === "root_cause" && (
          <div className="space-y-5">
            {/* Causal chain card */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800/40">
                  <svg className="h-4 w-4 text-red-600 dark:text-red-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M8 2v8M8 12v1.5"/><circle cx="8" cy="8" r="6"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Causal Chain</h3>
                  <p className="text-[10px] text-muted-foreground">Root cause → downstream effects</p>
                </div>
              </div>
              <div className="space-y-0 ml-1">
                {artifact.chain.map((step: string, i: number) => (
                  <div key={i} onClick={() => toggleRow(400 + i)} className={`flex items-start gap-3 cursor-pointer rounded-md px-1 -mx-1 transition-colors ${expandedRows.has(400 + i) ? "bg-secondary/30" : "hover:bg-secondary/10"}`}>
                    <div className="flex flex-col items-center flex-shrink-0 mt-1">
                      <div className={`w-2.5 h-2.5 rounded-full transition-all ${expandedRows.has(400 + i) ? "scale-125" : ""}`} style={{ background: i === 0 ? "#D85A30" : "#B3ACEC" }} />
                      {i < artifact.chain.length - 1 && <div className="w-px h-6 bg-border" />}
                    </div>
                    <div className="pb-2 flex-1">
                      <span className="text-xs text-foreground/85 leading-relaxed">{step}</span>
                      {expandedRows.has(400 + i) && (
                        <div className="flex gap-2 mt-1.5">
                          <button onClick={(e) => { e.stopPropagation(); toast(`Root cause step ${i + 1} flagged`); }} className="text-[10px] px-2 py-0.5 rounded border border-border bg-card hover:bg-secondary text-muted-foreground transition-colors">Flag</button>
                          <button onClick={(e) => { e.stopPropagation(); toast(`Added comment to step ${i + 1}`); }} className="text-[10px] px-2 py-0.5 rounded border border-border bg-card hover:bg-secondary text-muted-foreground transition-colors">Comment</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Secondary effects card */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
                  <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M8 2l6 10H2L8 2z"/><line x1="8" y1="7" x2="8" y2="9"/><circle cx="8" cy="11" r="0.5" fill="currentColor"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Secondary Effects</h3>
                  <p className="text-[10px] text-muted-foreground">Downstream impact</p>
                </div>
              </div>
              {artifact.secondaryEffects.map((e: string, i: number) => (
                <div key={i} className="flex items-start gap-2.5 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#EF9F27] mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-foreground/80 leading-relaxed">{e}</span>
                </div>
              ))}
            </div>

            {/* Project status table card */}
            {artifact.projectStatus && (
              <div className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-secondary border border-border">
                    <svg className="h-4 w-4 text-foreground" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="2" y="3" width="12" height="10" rx="1.5"/><line x1="2" y1="6" x2="14" y2="6"/><line x1="6" y1="6" x2="6" y2="13"/></svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Project Status</h3>
                    <p className="text-[10px] text-muted-foreground">Operational Efficiency detail</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[500px]">
                  <thead><tr className="border-b border-border">{artifact.projectStatus.cols.map((c: string, i: number) => <th key={i} className="text-left py-1.5 text-[10px] font-medium text-muted-foreground">{c}</th>)}</tr></thead>
                  <tbody>{artifact.projectStatus.rows.map((row: any[], ri: number) => (
                    <tr key={ri} className="border-b border-border/50">{row.map((cell: any, ci: number) => (
                      <td key={ci} className="py-2 text-xs text-foreground">{typeof cell === "object" && cell?.badge ? <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border ${badgeClass[cell.color]}`}>{cell.badge}</span> : cell}</td>
                    ))}</tr>
                  ))}</tbody>
                </table>
                </div>
              </div>
            )}
          </div>
        )}
        {artifact.type === "board_report" && (
          <div className="space-y-4">
            {artifact.sections.map((section: any, si: number) => (
              <div key={si} className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-secondary border border-border">
                    <svg className="h-4 w-4 text-foreground" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
                      {si === 0 ? <><rect x="2" y="2" width="12" height="12" rx="2"/><line x1="5" y1="5.5" x2="11" y2="5.5"/><line x1="5" y1="8" x2="9" y2="8"/></> :
                       si === 1 ? <><circle cx="8" cy="8" r="6"/><path d="M8 4v4l3 2"/></> :
                       si === 2 ? <><path d="M2 8h3l2-4 2 8 2-4h3"/></> :
                       <><path d="M2 12h12M2 8h12M2 4h12"/></>}
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                </div>
                {section.paragraphs && section.paragraphs.map((p: string, pi: number) => (
                  <div key={pi} className="text-xs text-foreground/80 leading-relaxed mb-2">{p}</div>
                ))}
                {section.krs && (
                  <div className="space-y-2.5 mt-3">
                    {section.krs.map((kr: any, ki: number) => (
                      <div key={ki} onClick={() => toast(kr.kr, { description: `Current: ${kr.current} → Target: ${kr.target}\n${kr.recovery}` })} className="bg-secondary/50 rounded-lg border border-border/50 p-3 cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all active:scale-[0.99]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground">{kr.kr}</span>
                          <span className="text-[10px] text-muted-foreground bg-secondary rounded px-1.5 py-0.5">{kr.owner}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-1.5">
                          <span>Current: <span className="font-medium text-foreground">{kr.current}</span></span>
                          <span>Target: <span className="font-medium text-foreground">{kr.target}</span></span>
                        </div>
                        <div className="text-xs text-foreground/75 leading-relaxed">{kr.recovery}</div>
                      </div>
                    ))}
                  </div>
                )}
                {section.note && <div className="text-[10px] text-muted-foreground italic mt-3 pt-2 border-t border-border/40">{section.note}</div>}
              </div>
            ))}
          </div>
        )}
        {artifact.type === "issue_log" && (
          <div className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
                <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M8 2l6 10H2L8 2z"/><line x1="8" y1="7" x2="8" y2="9"/><circle cx="8" cy="11" r="0.5" fill="currentColor"/></svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Data Quality Issues</h3>
                <p className="text-[10px] text-muted-foreground">{artifact.rows.length} issues identified</p>
              </div>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[500px]">
              <thead><tr className="border-b border-border">{artifact.cols.map((c: string, i: number) => <th key={i} className="text-left py-2 text-[10px] font-medium text-muted-foreground">{c}</th>)}</tr></thead>
              <tbody>{artifact.rows.map((row: string[], ri: number) => (
                <tr key={ri} className="border-b border-border/50">{row.map((cell: string, ci: number) => (
                  <td key={ci} className={`py-2 text-xs ${ci === 0 ? "font-medium text-foreground" : "text-foreground/80"}`}>{cell}</td>
                ))}</tr>
              ))}</tbody>
            </table>
            </div>
          </div>
        )}
        {artifact.type === "kr_alignment" && (
          <div className="space-y-4">
            {artifact.tiers.map((tier: any, i: number) => (
              <div key={i} className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg border" style={{
                    background: tier.status === "green" ? "rgba(29,158,117,0.1)" : tier.status === "amber" ? "rgba(239,159,39,0.1)" : "rgba(216,90,48,0.1)",
                    borderColor: tier.status === "green" ? "rgba(29,158,117,0.3)" : tier.status === "amber" ? "rgba(239,159,39,0.3)" : "rgba(216,90,48,0.3)"
                  }}>
                    <div className="w-4 h-4 rounded-full" style={{ background: tier.status === "green" ? "#1D9E75" : tier.status === "amber" ? "#EF9F27" : "#D85A30" }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{tier.label}</h3>
                    <p className="text-[10px] text-muted-foreground">{tier.count} proposals · {tier.detail}</p>
                  </div>
                </div>
                {tier.projects && tier.projects.map((p: any, j: number) => (
                  <div key={j} onClick={() => toast(p.name, { description: `${p.theme} · Claims: ${p.kr}\n${p.issue}` })} className="py-2.5 border-b border-border/40 last:border-0 ml-1 cursor-pointer hover:bg-secondary/20 transition-colors rounded-md px-2 -mx-1">
                    <div className="text-xs font-medium text-foreground">{p.name} <span className="text-muted-foreground font-normal">· {p.theme}</span></div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Claims: {p.kr}</div>
                    <div className="text-xs text-red-600 dark:text-red-400 mt-0.5">{p.issue}</div>
                  </div>
                ))}
              </div>
            ))}
            {artifact.footer && <div className="text-[10px] text-muted-foreground border-t border-border pt-3 mt-1">{artifact.footer}</div>}
          </div>
        )}
        {artifact.type === "daily_brief" && (
          <div className="space-y-4">
            {/* Metric tiles card */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-secondary border border-border">
                  <svg className="h-4 w-4 text-foreground" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Daily Brief</h3>
                  <p className="text-[10px] text-muted-foreground">Intake snapshot</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {artifact.metrics.map((m: any, i: number) => (
                  <div key={i} onClick={() => toast(m.label, { description: m.value })} className="bg-secondary/50 rounded-lg border border-border/50 p-3 text-center cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all active:scale-95">
                    <div className={`text-lg font-bold ${m.color === "green" ? "text-[#1D9E75]" : m.color === "red" ? "text-[#D85A30]" : "text-[#2D2580]"}`}>{m.value}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* New proposals card */}
            {artifact.newToday && (
              <div className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-[#1D9E75]/10 border border-[#1D9E75]/30">
                    <svg className="h-4 w-4 text-[#1D9E75]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">New Since Yesterday</h3>
                </div>
                {artifact.newToday.map((p: any, i: number) => (
                  <div key={i} onClick={() => toast(`${p.name}`, { description: `${p.theme} · ${p.owner} · ${p.budget}` })} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0 cursor-pointer hover:bg-secondary/30 transition-colors rounded-md px-1 -mx-1">
                    <div>
                      <div className="text-xs font-medium text-foreground">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground">{p.theme} · {p.owner}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">{p.budget}</span>
                      <svg className="h-3 w-3 text-muted-foreground/50" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4l4 4-4 4"/></svg>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Status sections card */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-card)] space-y-4">
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Over-cap Watch</div>
                <div className="text-xs text-foreground/80 leading-relaxed">{artifact.overCapWatch}</div>
              </div>
              <div className="border-t border-border/40 pt-3">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Data Quality</div>
                <div className="text-xs text-foreground/80 leading-relaxed">{artifact.dataQuality}</div>
              </div>
            </div>

            {/* Recommended action card */}
            <div className="bg-card rounded-xl border border-[#2D2580]/30 dark:border-[#7B6FD4]/30 p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2D2580] dark:bg-[#7B6FD4]" />
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recommended Action Today</div>
              </div>
              <div className="text-xs text-foreground font-medium leading-relaxed">{artifact.recommendedAction}</div>
            </div>

            {artifact.footer && <div className="text-[10px] text-muted-foreground italic mt-1">{artifact.footer}</div>}
          </div>
        )}
        {artifact.type === "intake_sheet" && <IntakeSheetPanel artifact={artifact} />}
        {artifact.type === "goals_arc6" && <GoalsArc6Panel artifact={artifact} />}
        {artifact.type === "params_arc6" && <ParamsArc6Panel artifact={artifact} />}
        {artifact.type === "strategic_framework" && <StrategicFrameworkPanel artifact={artifact} hideAgentCallout={fullScreen} />}
        {artifact.type === "intake_form" && <IntakeFormPanel artifact={artifact} hideAgentCallout={fullScreen} />}
        {artifact.type === "planning_view" && <PlanningViewPanel artifact={artifact} />}
        {artifact.type === "scenario_comparison" && <ScenarioPlanPanel artifact={artifact} hideAgentCallout={fullScreen || artifact.hideAgentCallout} />}
        {artifact.type === "epmo_dashboard" && <EpmoDashboardPanel />}
        {artifact.type === "budget_report" && <BudgetReportPanel variant={artifact.variant} />}
        {artifact.type === "capacity_report" && <CapacityReportPanel />}
        </div>
      </div>

      <Dialog open={historyOpen} onOpenChange={(open) => {
        setHistoryOpen(open);
        if (!open) {
          // Safety net: ensure Radix releases body pointer-events lock after close.
          setTimeout(() => {
            if (document.body.style.pointerEvents === "none") {
              document.body.style.pointerEvents = "";
            }
          }, 200);
        }
      }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[15px]">
              <History className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
              Change log
            </DialogTitle>
            <DialogDescription className="text-[12.5px]">
              Recent edits to <span className="text-foreground font-medium">{artifact.title}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-1 max-h-[420px] overflow-y-auto pr-1">
            <ol className="relative border-l border-border ml-2">
              {changeLog.map((e, i) => (
                <li key={i} className="pl-4 pb-4 last:pb-1 relative">
                  <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-primary/70 ring-4 ring-background" />
                  <div className="flex items-start gap-2.5">
                    {e.avatar ? (
                      <img src={e.avatar} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0" style={{ backgroundColor: "#261BAB" }}>AI</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] text-foreground leading-snug">
                        <span className="font-semibold">{e.who}</span>
                        <span className="text-muted-foreground"> {e.action.toLowerCase()} </span>
                        <span>{e.target}</span>
                      </div>
                      <div className="text-[11.5px] text-muted-foreground mt-0.5">{e.when}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ArtifactTypeIcon({ type }: { type: string }) {
  if (type === "strategic_framework") {
    return <Compass className="w-3.5 h-3.5" strokeWidth={1.75} />;
  }
  if (type === "table" || type === "priority_stack") {
    return <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.2"/><line x1="1" y1="6" x2="15" y2="6" stroke="currentColor" strokeWidth="1"/><line x1="1" y1="10" x2="15" y2="10" stroke="currentColor" strokeWidth="1"/><line x1="6" y1="6" x2="6" y2="14" stroke="currentColor" strokeWidth="1"/></svg>;
  }
  if (type === "goals_draft") {
    return <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1"/><circle cx="8" cy="8" r="1" fill="currentColor"/></svg>;
  }
  if (type === "health_dashboard" || type === "daily_brief") {
    return <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none"><rect x="1" y="7" width="3" height="7" rx="0.5" fill="currentColor" opacity="0.5"/><rect x="5.5" y="4" width="3" height="10" rx="0.5" fill="currentColor" opacity="0.7"/><rect x="10" y="1" width="3" height="13" rx="0.5" fill="currentColor"/></svg>;
  }
  if (type === "scoring_model" || type === "guardrail_check") {
    return <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none"><path d="M8 1l2 4 4.5.7-3.3 3.1.8 4.5L8 11.2 3.9 13.3l.8-4.5L1.5 5.7 6 5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>;
  }
  if (type === "readiness") {
    return <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  }
  return <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="13" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.2"/><line x1="4" y1="5.5" x2="12" y2="5.5" stroke="currentColor" strokeWidth="1"/><line x1="4" y1="8" x2="10" y2="8" stroke="currentColor" strokeWidth="1"/><line x1="4" y1="10.5" x2="8" y2="10.5" stroke="currentColor" strokeWidth="1"/></svg>;
}

/** Background color for the colored artifact icon tile. */
function artifactTileBg(type?: string): string {
  if (type === "strategic_framework" || type === "intake_form" || type === "intake_sheet" || type === "scenario_comparison" || type === "budget_report" || type === "epmo_dashboard") return "#FE1E7E";
  return "#261BAB";
}
/** Icon color for the colored artifact icon tile. */
function artifactTileFg(type?: string): string {
  if (type === "strategic_framework") return "#FFFFFF";
  return "#FFFFFF";
}

function ArtifactMiniPreview({ artifact }: { artifact: any }) {
  // Table / priority_stack — show 4-5 mini rows
  if ((artifact.type === "table" || artifact.type === "priority_stack") && artifact.rows) {
    const previewRows = artifact.rows.slice(0, 5);
    const cols = artifact.cols || (artifact.type === "priority_stack" ? ["Rank", "Project", "Score", "Status"] : []);
    return (
      <div className="space-y-0.5">
        {cols.length > 0 && (
          <div className="flex gap-3 mb-2 pb-1.5 border-b border-border/30">
            {cols.slice(0, 4).map((c: string, i: number) => (
              <div key={i} className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex-1 truncate">{c}</div>
            ))}
          </div>
        )}
        {previewRows.map((row: any, i: number) => {
          const cells = Array.isArray(row) ? row : (row.cells || [row.name || row.title || "—", row.score || "", row.status || ""]);
          return (
            <div key={i} className="flex gap-3 py-1">
              {(Array.isArray(cells) ? cells : [cells]).slice(0, 4).map((cell: any, j: number) => (
                <div key={j} className="text-[11px] text-foreground/70 flex-1 truncate">{typeof cell === 'string' ? cell : String(cell)}</div>
              ))}
            </div>
          );
        })}
        {artifact.rows.length > 5 && (
          <div className="text-[10px] text-muted-foreground/60 pt-1.5">+{artifact.rows.length - 5} more rows</div>
        )}
      </div>
    );
  }

  // Goals draft — show theme pills with objectives
  if (artifact.type === "goals_draft" && artifact.themes) {
    return (
      <div className="space-y-2">
        {artifact.themes.slice(0, 4).map((t: any, i: number) => {
          const name = typeof t === "string" ? t : t.name;
          const objCount = typeof t === "object" && t.objectives ? t.objectives.length : 0;
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
              <span className="text-[11px] text-foreground/80 truncate">{name}</span>
              {objCount > 0 && <span className="text-[9px] text-muted-foreground ml-auto flex-shrink-0">{objCount} obj</span>}
            </div>
          );
        })}
        {artifact.themes.length > 4 && (
          <div className="text-[10px] text-muted-foreground/60">+{artifact.themes.length - 4} more themes</div>
        )}
      </div>
    );
  }

  // Strategy extract — show themes list
  if (artifact.type === "strategy_extract" && artifact.themes) {
    return (
      <div className="space-y-1.5">
        {artifact.themes.slice(0, 4).map((t: string, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-foreground/30 flex-shrink-0" />
            <span className="text-[11px] text-foreground/70 truncate">{t}</span>
          </div>
        ))}
      </div>
    );
  }

  // Dashboard / daily brief — show metric tiles
  if ((artifact.type === "health_dashboard" || artifact.type === "daily_brief") && artifact.metrics) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {artifact.metrics.slice(0, 6).map((m: any, i: number) => (
          <div key={i} className="rounded-lg bg-muted/50 px-3 py-2.5 text-center">
            <div className="text-sm font-bold text-foreground">{m.value}</div>
            <div className="text-[9px] text-muted-foreground truncate mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>
    );
  }

  // Readiness — show progress bar with items
  if (artifact.type === "readiness" && artifact.pct != null) {
    return (
      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-muted-foreground">Readiness</span>
            <span className="text-sm font-semibold text-foreground">{artifact.pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary/70 transition-all" style={{ width: `${artifact.pct}%` }} />
          </div>
        </div>
        {artifact.rows && artifact.rows.slice(0, 3).map((r: any, i: number) => (
          <div key={i} className="flex items-center justify-between text-[10px]">
            <span className="text-foreground/70 truncate">{r.label || r[0]}</span>
            <span className={`flex-shrink-0 ml-2 ${r.status === "done" || r.done ? "text-green-500" : "text-muted-foreground"}`}>{r.status || r.value || (r.done ? "✓" : "—")}</span>
          </div>
        ))}
      </div>
    );
  }

  // Scoring model — show criteria with weights
  if (artifact.type === "scoring_model" && artifact.criteria) {
    return (
      <div className="space-y-1.5">
        {artifact.criteria.slice(0, 5).map((c: any, i: number) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-[11px] text-foreground/70 truncate">{c.name}</span>
            <span className="text-[10px] font-medium text-primary/80 flex-shrink-0 ml-2">{c.weight}</span>
          </div>
        ))}
      </div>
    );
  }

  // Guardrail check — show sections
  if (artifact.type === "guardrail_check" && artifact.sections) {
    const passCount = artifact.sections.filter((s: any) => s.status === "pass" || s.status === "ok").length;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-foreground/70">{passCount} passed</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-foreground/70">{artifact.sections.length - passCount} flagged</span>
          </div>
        </div>
        {artifact.sections.slice(0, 3).map((s: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-[10px]">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.status === "pass" || s.status === "ok" ? "bg-green-500" : "bg-amber-500"}`} />
            <span className="text-foreground/60 truncate">{s.title || s.label || s.name}</span>
          </div>
        ))}
      </div>
    );
  }

  // Phases — show high-level phase names only
  if (artifact.type === "phases" && artifact.phases) {
    return (
      <div className="space-y-2">
        {artifact.phases.map((p: any, i: number) => {
          const isActive = p.status === "active";
          return (
            <div key={i} className="flex items-center gap-2.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {p.num}
              </div>
              <span className={`text-[11px] truncate ${isActive ? "text-foreground font-medium" : "text-foreground/70"}`}>{p.title}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Steps — show steps with labels
  if (artifact.type === "steps" && artifact.steps) {
    const done = artifact.steps.filter((s: any) => s.status === "done" || s.status === "complete").length;
    return (
      <div className="space-y-2">
        {artifact.steps.slice(0, 3).map((s: any, i: number) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${s.status === "done" || s.status === "complete" ? "bg-primary/20 text-primary" : s.status === "active" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {s.num}
            </div>
            <span className="text-[11px] text-foreground/70 truncate">{s.title}</span>
          </div>
        ))}
        <div className="text-[10px] text-muted-foreground">{done}/{artifact.steps.length} complete</div>
      </div>
    );
  }

  // Upload progress
  if (artifact.type === "upload_progress") {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
        <span className="text-[11px] text-muted-foreground">Processing…</span>
      </div>
    );
  }

  // Goals Arc6 — mini render of canvas: G# badge, title, owner, sub-goal pill + KR rows
  if (artifact.type === "goals_arc6" && artifact.objectives) {
    const objs = artifact.objectives.slice(0, 2);
    return (
      <div className="space-y-2 pointer-events-none">
        {objs.map((obj: any, i: number) => {
          const krs = (obj.krs || []).slice(0, 2);
          return (
            <div key={i} className="rounded-lg border border-border/80 bg-muted/60 p-2.5">
              <div className="flex items-start gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                  G{i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold text-foreground truncate leading-tight">{obj.title}</div>
                  {obj.owner && (
                    <div className="text-[9px] text-foreground/65 truncate mt-0.5">{obj.owner}</div>
                  )}
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-background/80 text-foreground/85 border border-border font-medium flex-shrink-0">
                  {obj.krs?.length || 0}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {krs.map((kr: any, j: number) => (
                  <div key={j} className="flex items-center justify-between gap-1.5 px-2 py-1 rounded-md bg-background/70 border border-border/70">
                    <span className="text-[9px] text-foreground/90 truncate flex-1">{kr.text}</span>
                    {kr.target && <span className="text-[9px] font-semibold text-primary flex-shrink-0">{kr.target}</span>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {artifact.objectives.length > 2 && (
          <div className="text-[10px] text-muted-foreground/60">+{artifact.objectives.length - 2} more goals</div>
        )}
      </div>
    );
  }

  // Params Arc6 — mini render of canvas: tab pills + parameter rows with toggles
  if (artifact.type === "params_arc6" && artifact.categories) {
    const cats = artifact.categories;
    const active = cats[0];
    const params = (active?.params || []).slice(0, 3);
    return (
      <div className="space-y-2 pointer-events-none">
        <div className="rounded-lg border border-border/80 bg-muted/60 p-1 overflow-hidden">
          <div className="flex gap-1">
            {cats.slice(0, 5).map((c: any, i: number) => {
              const enabled = c.params?.filter((p: any) => p.enabled).length || 0;
              const total = c.params?.length || 0;
              const isActive = i === 0;
              return (
                <div
                  key={c.id}
                  className={`flex items-center gap-1 px-1.5 py-1 rounded-md text-[9px] font-medium whitespace-nowrap ${isActive ? "bg-primary/20 text-primary" : "text-foreground/70"}`}
                >
                  <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[8px] font-bold ${isActive ? "bg-primary text-primary-foreground" : "bg-background/80 text-foreground/80"}`}>
                    {c.label[0]}
                  </span>
                  <span>{c.label}</span>
                  <span className="text-[8px] text-foreground/55 font-normal">{enabled}/{total}</span>
                </div>
              );
            })}
          </div>
        </div>
        {active && (
          <div className="rounded-lg border border-border/80 bg-muted/60 p-2 space-y-1">
            {params.map((p: any, i: number) => (
              <div
                key={i}
                className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-md border ${p.enabled ? "border-border/70 bg-background/80" : "border-border/40 bg-background/30 opacity-70"}`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className={`relative w-6 h-3 rounded-full flex-shrink-0 ${p.enabled ? "bg-primary" : "bg-muted-foreground/30"}`}>
                    <div className={`absolute top-0.5 w-2 h-2 rounded-full bg-white shadow ${p.enabled ? "left-[14px]" : "left-0.5"}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-medium text-foreground truncate leading-tight">{p.label}</div>
                  </div>
                </div>
                {p.enabled && p.value && (
                  <span className="text-[9px] font-semibold text-primary flex-shrink-0">{p.value}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Intake Sheet — mini render of canvas: header bar + 2 sample rows
  if (artifact.type === "intake_sheet") {
    const rows = (artifact.rows || []).slice(0, 2);
    const totalLabel = artifact.totalLabel ?? `${(artifact.rows || []).length} submissions`;
    const reviewCount = artifact.fundedCount ?? (artifact.rows || []).filter((r: any) => r.status === "In review" || r.status === "Funded").length;
    const isEmpty = artifact.empty || rows.length === 0;
    return (
      <div className="space-y-0 pointer-events-none rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-3 py-2 flex items-center justify-between gap-2 border-b border-border">
          <div className="flex items-center gap-1.5 min-w-0">
            <svg className="h-3 w-3 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
            </svg>
            <span className="text-[10px] font-semibold text-foreground truncate">{artifact.title}</span>
            <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border font-medium flex-shrink-0">{totalLabel}</span>
          </div>
          {!isEmpty && reviewCount > 0 && (
            <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-medium flex-shrink-0 whitespace-nowrap">{reviewCount} Under review</span>
          )}
        </div>
        {!isEmpty && (
          <div className="grid grid-cols-[28px_36px_1fr_70px_70px_70px] gap-2 items-center px-3 py-1.5 bg-muted/30 border-b border-border">
            <span />
            <span className="text-[7px] font-semibold text-muted-foreground uppercase tracking-wide">Score</span>
            <span className="text-[7px] font-semibold text-muted-foreground uppercase tracking-wide">Project</span>
            <span className="text-[7px] font-semibold text-muted-foreground uppercase tracking-wide">Status</span>
            <span className="text-[7px] font-semibold text-muted-foreground uppercase tracking-wide">Dept</span>
            <span className="text-[7px] font-semibold text-muted-foreground uppercase tracking-wide">Portfolio</span>
          </div>
        )}
        {isEmpty ? (
          <div className="px-3 py-6 text-center text-[10px] text-muted-foreground">No submissions yet</div>
        ) : (
          rows.map((r: any, i: number) => (
            <div key={i} className="grid grid-cols-[28px_36px_1fr_70px_70px_70px] gap-2 items-center px-3 py-2 border-b border-border/50 last:border-0">
              <span className="text-[8px] font-mono text-muted-foreground/50 truncate">{r.id || ""}</span>
              <span className="inline-flex items-center justify-center px-1 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold font-mono w-fit">{r.score}</span>
              <span className="text-[10px] font-medium text-foreground truncate">{r.name}</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-medium border bg-amber-500/10 text-amber-600 border-amber-500/20 w-fit whitespace-nowrap">{r.status || "In review"}</span>
              <span className="text-[9px] text-foreground/70 truncate">{r.department}</span>
              <span className="text-[9px] text-foreground/70 truncate">{r.portfolio}</span>
            </div>
          ))
        )}
      </div>
    );
  }

  // EPMO Dashboard mini — KPIs + RAG donut sliver + sparkline
  if (artifact.type === "epmo_dashboard") {
    const kpis = [
      { l: "Active", v: "41", tone: "text-foreground" },
      { l: "Off Track", v: "21", tone: "text-rose-500" },
      { l: "At Risk", v: "17", tone: "text-amber-500" },
      { l: "On Track", v: "3", tone: "text-emerald-500" },
    ];
    const rag = [
      { name: "Off Track", value: 21, color: "bg-rose-500" },
      { name: "At Risk", value: 17, color: "bg-amber-500" },
      { name: "On Track", value: 3, color: "bg-emerald-500" },
    ];
    const total = 41;
    const trend = [22, 19, 17, 14, 12, 10, 8, 6, 5, 4, 3, 3];
    const max = Math.max(...trend);
    return (
      <div className="space-y-2 pointer-events-none rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-3 py-2 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-semibold text-foreground truncate">EPMO Dashboard</span>
          </div>
          <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border font-medium">Live</span>
        </div>
        <div className="grid grid-cols-4 gap-2 px-3">
          {kpis.map((k) => (
            <div key={k.l} className="bg-muted/30 rounded-md px-2 py-1.5 border border-border/60">
              <div className={`text-[13px] font-semibold tabular-nums ${k.tone}`}>{k.v}</div>
              <div className="text-[8px] text-muted-foreground uppercase tracking-wide">{k.l}</div>
            </div>
          ))}
        </div>
        <div className="px-3 pb-2 grid grid-cols-[1fr_auto] gap-3 items-end">
          <div>
            <div className="text-[8px] text-muted-foreground mb-1 uppercase tracking-wide">RAG distribution</div>
            <div className="flex h-1.5 rounded-full overflow-hidden">
              {rag.map((r) => (
                <div key={r.name} className={r.color} style={{ width: `${(r.value / total) * 100}%` }} />
              ))}
            </div>
            <div className="flex gap-2 mt-1">
              {rag.map((r) => (
                <span key={r.name} className="flex items-center gap-1 text-[8px] text-muted-foreground">
                  <span className={`w-1.5 h-1.5 rounded-sm ${r.color}`} /> {r.value}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-px h-7">
            {trend.map((v, i) => (
              <div key={i} className="w-1 bg-primary/60 rounded-sm" style={{ height: `${(v / max) * 100}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Budget Report mini — hero metric + planned/actual bars
  if (artifact.type === "budget_report") {
    const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
    const planned = months.map(() => 2.83);
    const actual = [2.6, 2.9, 2.4, 2.7, 2.5, 2.8, 0, 0, 0, 0, 0, 0];
    const forecast = [0, 0, 0, 0, 0, 0, 2.95, 3.0, 2.85, 3.1, 2.9, 3.0];
    const max = 3.5;
    return (
      <div className="space-y-2 pointer-events-none rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-3 py-2 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className="text-[10px] font-semibold text-foreground truncate">Budget Report</span>
          </div>
          <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 border border-rose-500/20 font-medium">+$4.6M over</span>
        </div>
        <div className="grid grid-cols-3 gap-2 px-3">
          <div className="bg-muted/30 rounded-md px-2 py-1.5 border border-border/60">
            <div className="text-[13px] font-semibold tabular-nums text-foreground">$24.1M</div>
            <div className="text-[8px] text-muted-foreground uppercase tracking-wide">Actual YTD</div>
          </div>
          <div className="bg-muted/30 rounded-md px-2 py-1.5 border border-border/60">
            <div className="text-[13px] font-semibold tabular-nums text-foreground">$34.0M</div>
            <div className="text-[8px] text-muted-foreground uppercase tracking-wide">Planned</div>
          </div>
          <div className="bg-muted/30 rounded-md px-2 py-1.5 border border-border/60">
            <div className="text-[13px] font-semibold tabular-nums text-rose-500">23</div>
            <div className="text-[8px] text-muted-foreground uppercase tracking-wide">Over budget</div>
          </div>
        </div>
        <div className="px-3 pb-2">
          <div className="text-[8px] text-muted-foreground mb-1 uppercase tracking-wide">Monthly spend ($M)</div>
          <div className="flex items-end gap-1 h-10 relative">
            <div className="absolute left-0 right-0 border-t border-dashed border-foreground/20" style={{ bottom: `${(2.83 / max) * 100}%` }} />
            {months.map((m, i) => {
              const v = actual[i] || forecast[i];
              const isForecast = forecast[i] > 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <div
                    className={`w-full rounded-sm ${isForecast ? "bg-muted-foreground/30" : "bg-primary/70"}`}
                    style={{ height: `${(v / max) * 100}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Capacity Report mini — utilization + role bars
  if (artifact.type === "capacity_report") {
    const roles = [
      { r: "Security Analyst", p: 55, a: 63 },
      { r: "UX Designer", p: 75, a: 95 },
      { r: "DevOps Engineer", p: 45, a: 50 },
      { r: "QA Analyst", p: 50, a: 48 },
    ];
    const max = 100;
    return (
      <div className="space-y-2 pointer-events-none rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-3 py-2 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-[10px] font-semibold text-foreground truncate">Capacity Report</span>
          </div>
          <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20 font-medium">105.6% util</span>
        </div>
        <div className="grid grid-cols-3 gap-2 px-3">
          <div className="bg-muted/30 rounded-md px-2 py-1.5 border border-border/60">
            <div className="text-[13px] font-semibold tabular-nums text-foreground">266</div>
            <div className="text-[8px] text-muted-foreground uppercase tracking-wide">FTEs active</div>
          </div>
          <div className="bg-muted/30 rounded-md px-2 py-1.5 border border-border/60">
            <div className="text-[13px] font-semibold tabular-nums text-foreground">252</div>
            <div className="text-[8px] text-muted-foreground uppercase tracking-wide">Planned</div>
          </div>
          <div className="bg-muted/30 rounded-md px-2 py-1.5 border border-border/60">
            <div className="text-[13px] font-semibold tabular-nums text-amber-500">+14</div>
            <div className="text-[8px] text-muted-foreground uppercase tracking-wide">Variance</div>
          </div>
        </div>
        <div className="px-3 pb-2 space-y-1">
          <div className="text-[8px] text-muted-foreground uppercase tracking-wide">Roles · planned vs actual</div>
          {roles.map((r) => {
            const over = r.a > r.p;
            return (
              <div key={r.r} className="grid grid-cols-[80px_1fr_28px] gap-1.5 items-center">
                <span className="text-[9px] text-foreground/80 truncate">{r.r}</span>
                <div className="relative h-2 bg-muted/40 rounded-sm overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-primary/40" style={{ width: `${(r.p / max) * 100}%` }} />
                  <div className={`absolute inset-y-0 left-0 ${over ? "bg-amber-500" : "bg-emerald-500"} opacity-80`} style={{ width: `${(r.a / max) * 100}%`, mixBlendMode: "multiply" }} />
                </div>
                <span className={`text-[9px] tabular-nums text-right ${over ? "text-amber-600" : "text-foreground/60"}`}>{r.a}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Generic fallback — show a summary chip + skeleton "card" rows so every artifact gets a visual preview
  const summary = (() => {
    if (artifact.objectives) return `${artifact.objectives.length} goals`;
    if (artifact.categories) return `${artifact.categories.length} categories`;
    if (artifact.themes) return `${artifact.themes.length} themes`;
    if (artifact.criteria) return `${artifact.criteria.length} criteria`;
    if (artifact.sections) return `${artifact.sections.length} sections`;
    if (artifact.steps) return `${artifact.steps.length} steps`;
    if (artifact.rows) return `${artifact.rows.length} rows`;
    if (artifact.metrics) return `${artifact.metrics.length} metrics`;
    return artifact.subtitle || "Open to view";
  })();
  return (
    <div className="space-y-1.5 pointer-events-none">
      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-card border border-border text-[10px] font-medium text-foreground/80">
        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
        {summary}
      </div>
      <div className="rounded-lg border border-border bg-card p-2 space-y-1.5">
        <div className="h-2 rounded-full bg-muted/70 w-3/4" />
        <div className="h-2 rounded-full bg-muted/50 w-1/2" />
        <div className="h-2 rounded-full bg-muted/40 w-2/3" />
      </div>
    </div>
  );
}

// Branded file icons keyed by extension. Empty for now — chip rendering
// falls back to a text badge when no icon is registered.
const FILE_ICON: Record<string, string | undefined> = {
  pdf: pdfIcon,
  pptx: pptxIcon,
  ppt: pptxIcon,
  docx: docxIcon,
  doc: docxIcon,
};

// Mocked "ingested" documents shown after upload — independent of real filenames
const MOCK_INGESTED_DOCS: { name: string; ext: "pdf" | "pptx" }[] = [
  { name: "FY27_BoardStrategicPlan.pdf", ext: "pdf" },
  { name: "ClinicalDivision_Goals.pdf", ext: "pdf" },
  { name: "Operations_FY27_Plan.pdf", ext: "pdf" },
  { name: "CFO_BudgetMemo.pptx", ext: "pptx" },
  { name: "HR_WorkforcePlan.pptx", ext: "pptx" },
];

type DropzoneStage = "idle" | "ingesting" | "grouped" | "found";

function DropzoneArtifact({ artifact }: { artifact: any }) {
  const [isDragging, setIsDragging] = useState(false);
  const [fired, setFired] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fireUpload = () => {
    if (fired) return;
    setFired(true);
    window.dispatchEvent(new CustomEvent("arc:upload-docs"));
  };

  const handleFiles = (incoming: FileList | File[]) => {
    if (!Array.from(incoming).length) return;
    fireUpload();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  if (fired) return null;

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`rounded-2xl border-2 border-dashed p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-foreground/30 hover:bg-muted/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={artifact.accept || undefined}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <div className="w-12 h-12 icon-tile bg-primary/10 text-primary flex items-center justify-center mb-3">
          <Upload className="w-5 h-5" />
        </div>
        <div className="text-sm font-semibold text-foreground mb-1">
          {isDragging ? "Drop to upload" : "Drop files here or click to browse"}
        </div>
        <div className="text-xs text-muted-foreground">
          {artifact.subtitle || "PDF, DOCX, PPTX, XLSX · up to 20MB each"}
        </div>
      </div>
    </div>
  );
}

// Track artifacts whose loading reveal we've already played, so re-renders
// (e.g., switching chats and back) don't re-trigger the loading shimmer.
const REVEALED_ARTIFACTS = new Set<string>();

function InlineArtifactCard({
  artifact,
  activeArtifact,
  onArtifactClick,
  autoOpen,
}: {
  artifact: any;
  activeArtifact: any;
  onArtifactClick: (a: any) => void;
  autoOpen: boolean;
}) {
  const versionTag =
    (artifact?.sections?.length ?? artifact?.rows?.length ?? artifact?.objectives?.length ?? 0);
  const key = `${artifact?.type || "x"}::${artifact?.title || ""}::${versionTag}`;
  const alreadyRevealed = REVEALED_ARTIFACTS.has(key);
  const [loaded, setLoaded] = useState<boolean>(alreadyRevealed);

  useEffect(() => {
    if (loaded) return;
    const t = window.setTimeout(() => {
      REVEALED_ARTIFACTS.add(key);
      setLoaded(true);
      // Note: we no longer auto-open the artifact panel. The conversation stays
      // visible with the left sidebar open until the user clicks the preview
      // card themselves.
    }, 1800);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isActive = activeArtifact?.title === artifact?.title;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => loaded && onArtifactClick(artifact)}
      onKeyDown={(e) => {
        if (!loaded) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onArtifactClick(artifact);
        }
      }}
      aria-busy={!loaded}
      className={`rounded-xl border text-left w-full transition-colors overflow-hidden group ${loaded ? "cursor-pointer" : "cursor-default"} ${isActive ? "border-foreground/15" : "border-border/60 hover:border-border"}`}
    >
      {/* Body — loading shimmer or scaled-down preview */}
      <div className="relative w-full overflow-hidden canvas-bg" style={{ height: 83 }}>
        {!loaded ? (
          <div className="absolute inset-0 p-3 flex flex-col gap-2">
            <div className="h-2.5 w-1/3 rounded bg-muted animate-pulse" />
            <div className="h-2 w-2/3 rounded bg-muted/70 animate-pulse" />
            <div className="h-2 w-1/2 rounded bg-muted/70 animate-pulse" />
            <div className="h-2 w-3/5 rounded bg-muted/70 animate-pulse" />
          </div>
        ) : (
          <div
            className="absolute left-0 pointer-events-none select-none"
            style={{
              top: -(56 + 32 + 40) * 0.55,
              width: `${100 / 0.55}%`,
              height: 1200,
              transform: "scale(0.55)",
              transformOrigin: "top left",
            }}
            aria-hidden
          >
            <ArtifactPanel artifact={{ ...artifact, banner: undefined, hideAgentCallout: true }} onClose={() => {}} />
          </div>
        )}
      </div>
      {/* Footer with title + status */}
      <div className={`flex items-center gap-2.5 px-4 py-2.5 border-t transition-colors ${isActive ? "border-border bg-primary/25" : "border-border/60 bg-primary/10 group-hover:bg-primary/15"}`}>
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: artifactTileBg(artifact.type), color: artifactTileFg(artifact.type) }}
        >
          <ArtifactTypeIcon type={artifact.type} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="text-xs font-medium text-foreground truncate">{artifact.title}</div>
            {!loaded ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="w-1 h-1 rounded-full bg-muted-foreground/70 animate-pulse-dot" />
                <span className="w-1 h-1 rounded-full bg-muted-foreground/70 animate-pulse-dot [animation-delay:0.2s]" />
                <span className="w-1 h-1 rounded-full bg-muted-foreground/70 animate-pulse-dot [animation-delay:0.4s]" />
                <span className="ml-1">Building…</span>
              </span>
            ) : (
              <>
                {artifact.type === "strategic_framework" && <ArtifactDraftChip artifactKey="strategic_framework" compact />}
                {artifact.type === "intake_form" && <ArtifactDraftChip artifactKey="intake_form" compact />}
                <SavedChip title={artifact.title} className="text-[9px] px-1.5 py-0" />
              </>
            )}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{artifact.subtitle}</div>
        </div>
        {loaded && (
          <svg className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 16 16" fill="none">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
    </div>
  );
}

function MessageBlock({ msg, onArtifactClick, activeArtifact, onActionClick, isLast, prevRole, isFirst }: { msg: any; onArtifactClick: (a: any) => void; activeArtifact: any; onActionClick: (label: string) => void; isLast: boolean; prevRole?: string; isFirst?: boolean }) {
  const navigate = useNavigate();
  // Asymmetric spacing — Claude-like rhythm
  let wrapperSpacing = "";
  if (msg.role === "user") {
    wrapperSpacing = isFirst ? "mt-2 mb-3" : "mt-8 mb-3";
  } else {
    if (prevRole === "user") wrapperSpacing = "mt-0 mb-2";
    else wrapperSpacing = isFirst ? "mt-2 mb-2" : "mt-8 mb-2";
  }

  if (msg.role === "user") {
    // Special render: "[uploads file1, file2, ...]" → file chip stack
    const uploadsMatch = typeof msg.text === "string" ? msg.text.match(/^\[uploads?\s+(.+)\]$/i) : null;
    if (uploadsMatch) {
      const files = uploadsMatch[1].split(",").map((f: string) => f.trim()).filter(Boolean);
      return (
        <div className={`flex justify-end ${wrapperSpacing}`}>
          <div className="flex flex-wrap justify-end gap-1.5 max-w-[78%]">
            {files.map((name: string, i: number) => {
              const ext = (name.split(".").pop() || "").toLowerCase() as "pdf" | "pptx" | "docx";
              const icon = FILE_ICON[ext];
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-2 text-[12.5px] animate-fade-in"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
                >
                  {icon ? (
                    <img src={icon} alt={`${ext} icon`} className="w-6 h-6 flex-shrink-0" />
                  ) : (
                    <span className="inline-flex items-center justify-center w-6 h-6 icon-tile border bg-muted text-muted-foreground text-[10px] font-semibold uppercase">
                      {ext || "file"}
                    </span>
                  )}
                  <span className="text-foreground font-medium truncate max-w-[180px]">{name}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return (
      <div className={`flex justify-end ${wrapperSpacing}`}>
        <div className="max-w-[78%] bg-secondary text-secondary-foreground rounded-[18px] px-4 py-2.5 text-[15px] leading-[1.55]">
          {msg.text}
        </div>
      </div>
    );
  }

  // Transient "thinking" placeholder while we simulate Arc reasoning before applying changes
  if (msg._thinking) {
    return (
      <div className={wrapperSpacing}>
        <div className="flex items-center gap-1.5 py-1.5">
          <div className="w-2 h-2 rounded-full bg-muted-foreground/70 animate-pulse-dot" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground/70 animate-pulse-dot [animation-delay:0.2s]" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground/70 animate-pulse-dot [animation-delay:0.4s]" />
        </div>
      </div>
    );
  }

  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) {
        return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
      }
      if (/^\*[^*]+\*$/.test(part)) {
        return <em key={i} className="italic">{part.slice(1, -1)}</em>;
      }
      if (/^`[^`]+`$/.test(part)) {
        return <code key={i} className="px-1 py-0.5 rounded bg-muted text-foreground text-[12.5px] font-mono">{part.slice(1, -1)}</code>;
      }
      return <React.Fragment key={i}>{part}</React.Fragment>;
    });
  };

  // Render a chunk of assistant text as structured blocks: headings, bullet/numbered lists,
  // and paragraphs. Splits inline run-on lists like "Foo: ... Bar: ..." onto separate lines
  // so streamed model output is easier to scan.
  const renderRich = (text: string) => {
    if (!text) return null;
    // Strip trailing streaming caret for parsing, re-append at end
    const hasCaret = text.endsWith("▍");
    let body = hasCaret ? text.slice(0, -1) : text;

    // Heuristic: if a single line contains multiple "Title: sentence." segments,
    // break them onto their own lines so they render as a list.
    const lines = body.split(/\r?\n/).flatMap((line) => {
      const trimmed = line.trim();
      if (trimmed.length < 80) return [line];
      // Match patterns like "Word Word: ... ." that repeat 2+ times in one line.
      const segs = trimmed.match(/(?:^|\s)([A-Z][A-Za-z0-9 &/\-]{2,30}:\s)/g);
      if (!segs || segs.length < 2) return [line];
      // Split before each matched title.
      const parts: string[] = [];
      let rest = trimmed;
      const titleRe = /([A-Z][A-Za-z0-9 &/\-]{2,30}:\s)/;
      while (rest.length) {
        const m = rest.slice(1).match(titleRe);
        if (!m || m.index === undefined) { parts.push(rest); break; }
        const idx = m.index + 1;
        parts.push(rest.slice(0, idx).trim());
        rest = rest.slice(idx);
      }
      return parts.filter(Boolean).map((p) => `- ${p}`);
    });

    type Block =
      | { kind: "h"; level: 2 | 3; text: string }
      | { kind: "ul"; items: string[] }
      | { kind: "ol"; items: string[] }
      | { kind: "p"; text: string };

    const blocks: Block[] = [];
    let i = 0;
    while (i < lines.length) {
      const raw = lines[i];
      const line = raw.trim();
      if (!line) { i++; continue; }

      // Headings
      const h = line.match(/^(#{2,3})\s+(.*)$/);
      if (h) {
        blocks.push({ kind: "h", level: h[1].length === 2 ? 2 : 3, text: h[2] });
        i++; continue;
      }

      // Unordered list
      if (/^[-*]\s+/.test(line)) {
        const items: string[] = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
          i++;
        }
        blocks.push({ kind: "ul", items });
        continue;
      }

      // Ordered list
      if (/^\d+[.)]\s+/.test(line)) {
        const items: string[] = [];
        while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ""));
          i++;
        }
        blocks.push({ kind: "ol", items });
        continue;
      }

      // Paragraph (collect until blank or list/heading)
      const paraLines: string[] = [line];
      i++;
      while (i < lines.length) {
        const nxt = lines[i].trim();
        if (!nxt || /^[-*]\s+/.test(nxt) || /^\d+[.)]\s+/.test(nxt) || /^#{2,3}\s+/.test(nxt)) break;
        paraLines.push(nxt);
        i++;
      }
      blocks.push({ kind: "p", text: paraLines.join(" ") });
    }

    // Render with caret on the very last text block for streaming feedback.
    const renderItem = (s: string, withCaret: boolean) => (
      <>{renderInline(s)}{withCaret ? "▍" : null}</>
    );

    return (
      <>
        {blocks.map((b, idx) => {
          const isLast = idx === blocks.length - 1 && hasCaret;
          if (b.kind === "h") {
            const cls = b.level === 2
              ? "text-[16px] font-semibold text-foreground mt-4 mb-2 first:mt-0"
              : "text-[14px] font-semibold text-foreground mt-3 mb-1.5 first:mt-0";
            return <div key={idx} className={cls}>{renderItem(b.text, isLast)}</div>;
          }
          if (b.kind === "ul") {
            return (
              <ul key={idx} className="list-disc marker:text-muted-foreground/60 pl-5 space-y-1.5 mb-3">
                {b.items.map((it, j) => {
                  // Bold the leading "Title:" portion if present for scannability
                  const m = it.match(/^([A-Z][A-Za-z0-9 &/\-]{2,40}:)\s*(.*)$/);
                  const itemCaret = isLast && j === b.items.length - 1;
                  return (
                    <li key={j} className="pl-1">
                      {m
                        ? <><strong className="font-semibold text-foreground">{m[1]}</strong> {renderItem(m[2], itemCaret)}</>
                        : renderItem(it, itemCaret)}
                    </li>
                  );
                })}
              </ul>
            );
          }
          if (b.kind === "ol") {
            return (
              <ol key={idx} className="list-decimal marker:text-muted-foreground/60 pl-5 space-y-1.5 mb-3">
                {b.items.map((it, j) => (
                  <li key={j} className="pl-1">{renderItem(it, isLast && j === b.items.length - 1)}</li>
                ))}
              </ol>
            );
          }
          return <p key={idx} className="mb-3 last:mb-0">{renderItem(b.text, isLast)}</p>;
        })}
      </>
    );
  };

  return (
    <div className={wrapperSpacing}>
      {msg.greeting && (
        <div className="mb-6">
          <div className="text-[40px] font-semibold tracking-tight leading-[1.05]" style={{ color: "hsl(233 70% 70%)" }}>{msg.greeting.muted}</div>
          <div className="text-[40px] font-semibold text-foreground tracking-tight leading-[1.05]">{msg.greeting.main}</div>
        </div>
      )}
      {msg.paragraphs?.map((p: string, i: number) => (
        <div key={i} className="chat-prose mb-4">{renderRich(p)}</div>
      ))}
      {msg.inlineWidget === "daily_spend_forecast" && (
        <div className="mb-4">
          <DailySpendForecastWidget />
        </div>
      )}
      {msg.recommendations && msg.recommendations.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {msg.recommendations.map((rec: any, i: number) => {
            const label = typeof rec === "string" ? rec : rec.label;
            const detail = typeof rec === "string" ? undefined : rec.detail;
            return (
              <button
                key={i}
                onClick={() => window.dispatchEvent(new CustomEvent("arc:recommendation:accept", { detail: { text: label } }))}
                className="group relative flex items-stretch text-left rounded-xl border border-border/40 bg-gradient-to-r from-card to-muted/10 hover:from-muted/20 hover:to-muted/30 hover:border-border/80 hover:shadow-sm transition-all overflow-hidden"
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0 px-3 py-2.5">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ring-2"
                    style={{ background: "hsl(213 100% 50%)", boxShadow: "0 0 0 2px hsl(216 47% 79%)" }}
                    aria-hidden
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold text-foreground leading-snug tracking-tight">{label}</div>
                    {detail && <div className="text-[11.5px] text-muted-foreground leading-relaxed mt-0.5">{detail}</div>}
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all mt-0.5 flex-shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      )}
      {msg.statusInline && (() => {
        const PRIORITY: Record<string, number> = { red: -2, info: -1, amber: 1, green: 2, gray: 3 };
        const toneFor = (s: string) =>
          s === "green" ? { dot: "bg-success", ring: "ring-success/30", pill: "bg-success/10 text-success border-success/20", pillLabel: "On track", iconBg: "bg-success/10", iconText: "text-success" }
          : s === "amber" ? { dot: "bg-warning", ring: "ring-warning/30", pill: "bg-warning/10 text-warning border-warning/20", pillLabel: "At risk", iconBg: "bg-warning/10", iconText: "text-warning" }
          : s === "red" ? { dot: "bg-destructive", ring: "ring-destructive/30", pill: "bg-destructive/10 text-destructive border-destructive/20", pillLabel: "Off track", iconBg: "bg-destructive/10", iconText: "text-destructive" }
          : s === "info" ? { dot: "bg-primary", ring: "ring-primary/30", pill: "bg-primary/10 text-primary border-primary/20", pillLabel: "New", iconBg: "bg-primary/10", iconText: "text-primary" }
          : { dot: "bg-muted-foreground/40", ring: "ring-muted-foreground/20", pill: "bg-muted/40 text-muted-foreground border-border/40", pillLabel: "Idle", iconBg: "bg-muted/50", iconText: "text-muted-foreground" };
        // Sort by priority but keep original order as tiebreaker
        const indexed = msg.statusInline.map((row: any, i: number) => ({ row, i }));
        const sorted = [...indexed].sort((a, b) => {
          const pa = PRIORITY[a.row.s] ?? 4;
          const pb = PRIORITY[b.row.s] ?? 4;
          if (pa !== pb) return pa - pb;
          return a.i - b.i;
        });
        const [hero, ...rest] = sorted;
        const [side1, side2, wide] = rest;
        const AgentChip = ({ kind }: { kind: "reporting" | "risk" | "scenario" | "intake" }) => {
          if (kind === "reporting") {
            return <img src={reportingAgentChip} alt="Reporting agent" className="w-auto" style={{ height: 20 }} />;
          }
          if (kind === "scenario") {
            return <img src={scenarioAgentChip} alt="Scenario agent" className="w-auto" style={{ height: 20 }} />;
          }
          if (kind === "intake") {
            return <img src={intakeAgentChip} alt="Intake agent" className="w-auto" style={{ height: 20 }} />;
          }
          // Risk — inline JSX chip (red→amber) styled to match the other agent chips
          return (
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
        };
        const StatusTile = ({ row, className = "" }: any) => {
          const tone = toneFor(row.s);
          const Icon = resolveActionIcon(row.icon, row.l);
          // Agent-tinted icon tile (matches the chip at the bottom)
          const iconTileStyle =
            row.agentChip === "risk"
              ? { background: "linear-gradient(135deg, hsl(354 100% 59% / 0.08) 0%, hsl(30 97% 60% / 0.08) 100%)", color: "hsl(354 70% 55%)" }
              : row.agentChip === "reporting"
              ? { background: "linear-gradient(135deg, hsl(45 95% 55% / 0.12) 0%, hsl(28 95% 55% / 0.10) 100%)", color: "hsl(35 85% 50%)" }
              : row.agentChip === "scenario"
              ? { background: "linear-gradient(135deg, hsl(266 45% 42% / 0.08) 0%, hsl(259 53% 70% / 0.10) 100%)", color: "hsl(266 50% 55%)" }
              : row.agentChip === "intake"
              ? { background: "hsl(214 90% 60% / 0.07)", color: "hsl(214 80% 55%)" }
              : undefined;
          return (
            <button
              onClick={() => row.action && onActionClick(row.action)}
              className={`group relative text-left rounded-2xl border-[1.5px] border-border/70 bg-card hover:border-[hsl(265_55%_75%)] hover:shadow-sm transition-all overflow-hidden p-5 flex flex-col h-full ${className}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`icon-tile flex items-center justify-center w-9 h-9 ${row.agentChip ? "" : "bg-primary/10 text-primary"}`}
                  style={iconTileStyle}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div className="flex items-center gap-2">
                  {row.recommended && (
                    <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20">
                      Recommended
                    </span>
                  )}
                  {!row.hideStatusPill && !row.agentChip && (
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${tone.pill}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
                      {tone.pillLabel}
                    </span>
                  )}
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
              <div className="font-semibold text-foreground mb-1 text-[14px] leading-snug">
                {row.l}
              </div>
              <div className="text-muted-foreground text-[12px] leading-relaxed">
                {row.n}
              </div>
              {row.agentChip && (
                <div className="mt-auto pt-4">
                  <AgentChip kind={row.agentChip} />
                </div>
              )}
            </button>
          );
        };
        const StatusGrid = () => {
          const [expanded, setExpanded] = useState(false);
          const visible = sorted.slice(0, 3);
          const hidden = sorted.slice(3);
          return (
            <div className="mb-5">
              {msg.recapHeader && (
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80 whitespace-nowrap">
                    {msg.recapHeader}
                  </span>
                  <span className="flex-1 h-px bg-border/60" />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {visible.map(({ row, i }) => (
                  <StatusTile key={i} row={row} />
                ))}
                {expanded &&
                  hidden.map(({ row, i }) => (
                    <StatusTile key={i} row={row} />
                  ))}
              </div>
              {hidden.length > 0 && (
                <div className="mt-3 flex justify-center">
                  <button
                    onClick={() => setExpanded((v) => !v)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                  >
                    {expanded ? "Show less" : `Show ${hidden.length} more`}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
              )}
            </div>
          );
        };
        return <StatusGrid />;
      })()}
      {msg.bullets && (
        <ul className="chat-prose list-disc marker:text-muted-foreground/60 pl-5 space-y-2 mb-5">
          {msg.bullets.map((b: any, i: number) => (
            <li key={i} className="pl-1">
              <span className="font-semibold text-foreground">{b.label}</span> {renderRich(b.detail || "")}
            </li>
          ))}
        </ul>
      )}
      {msg.inline && msg.inline.type === "extraction_metrics" && (
        <ExtractionMetricsInline cards={msg.inline.cards} />
      )}
      {msg.inline && msg.inline.type === "conflict_callout" && (
        <div className="my-4 rounded-lg border-l-4 border border-border bg-card px-4 py-3" style={{ borderLeftColor: "hsl(var(--warning))" }}>
          <div className="text-sm font-semibold text-foreground mb-1">{msg.inline.title}</div>
          <div className="text-xs text-muted-foreground leading-relaxed">{msg.inline.body}</div>
        </div>
      )}
      {msg.inline && msg.inline.type === "conflict_callout_red" && (
        <div className="my-4 rounded-lg border-l-4 border border-border bg-card px-4 py-3" style={{ borderLeftColor: "hsl(var(--destructive))" }}>
          <div className="text-sm font-semibold text-foreground mb-1">{msg.inline.title}</div>
          <div className="text-xs text-muted-foreground leading-relaxed">{msg.inline.body}</div>
        </div>
      )}
      {msg.inline && msg.inline.type === "conflict_callout_blue" && (
        <div className="my-4 rounded-lg border-l-4 border border-border bg-card px-4 py-3" style={{ borderLeftColor: "hsl(var(--info))" }}>
          <div className="text-sm font-semibold text-foreground mb-1">{msg.inline.title}</div>
          <div className="text-xs text-muted-foreground leading-relaxed">{msg.inline.body}</div>
        </div>
      )}
      {msg.inline && msg.inline.type === "capacity_breakdown" && (
        <div className="my-4 rounded-lg border border-border bg-card px-4 py-3">
          {msg.inline.rows.map((r: any, i: number) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm text-foreground">{r.label}</span>
              <span className="text-sm font-medium text-foreground">{r.value}</span>
            </div>
          ))}
          {msg.inline.footnote && <div className="text-xs text-muted-foreground mt-2">{msg.inline.footnote}</div>}
        </div>
      )}
      {msg.inline && msg.inline.type === "processing" && (
        <div className="my-4 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-3 h-3 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          {msg.inline.text}
        </div>
      )}
      {msg.inline && msg.inline.type === "status_update" && (
        <div className="my-4 rounded-lg border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-amber-600 dark:text-amber-400">⚑</span>
            <span className="font-medium text-foreground">{msg.inline.text}</span>
          </div>
          {msg.inline.detail && <div className="text-xs text-muted-foreground mt-1">{msg.inline.detail}</div>}
        </div>
      )}
      {msg.inline && msg.inline.type === "portfolio_connect" && (
        <PortfolioConnectInline data={msg.inline} />
      )}
      {msg.inline && msg.inline.type === "decision_card" && (
        <div className="my-4 grid grid-cols-2 gap-3">
          {msg.inline.options.map((opt: any, i: number) => (
            <div key={i} className="rounded-lg border border-border bg-card px-4 py-3">
              <div className="text-sm font-medium text-foreground mb-1">{opt.title}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{opt.detail}</div>
            </div>
          ))}
        </div>
      )}
      {msg.inline && msg.inline.type === "processing" && (
        <div className="my-3 rounded-2xl border border-border/60 bg-card px-4 py-3 flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-muted border-t-primary animate-spin flex-shrink-0" />
          <span className="text-[13px] text-muted-foreground">{msg.inline.label}</span>
        </div>
      )}
      {msg.inline && msg.inline.type === "approved_rows" && (
        <div className="my-4 -mx-1 overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-border">
                <th className="pl-1 pr-2 py-2.5 w-[44px] text-left text-[12px] font-normal text-muted-foreground">Score</th>
                <th className="px-2 py-2.5 text-left text-[12px] font-normal text-muted-foreground">Project Name</th>
                <th className="px-2 py-2.5 w-[120px] text-left text-[12px] font-normal text-muted-foreground">Status</th>
                <th className="px-2 py-2.5 text-left text-[12px] font-normal text-muted-foreground">Department</th>
                <th className="px-2 py-2.5 text-left text-[12px] font-normal text-muted-foreground">Portfolio</th>
                <th className="px-2 py-2.5 w-[72px] text-left text-[12px] font-normal text-muted-foreground">Priority</th>
                <th className="px-2 py-2.5 w-[72px] text-left text-[12px] font-normal text-muted-foreground">Budget</th>
                <th className="px-2 py-2.5 w-[44px] text-left text-[12px] font-normal text-muted-foreground">FTEs</th>
              </tr>
            </thead>
            <tbody>
              {msg.inline.rows.map((r: any, i: number) => {
                const priorityColor = r.priority === "High" ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                  : r.priority === "Medium" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-muted text-muted-foreground";
                const isLast = i === msg.inline.rows.length - 1;
                return (
                  <tr key={i} className={isLast ? "" : "border-b border-border/40"}>
                    <td className="pl-1 pr-2 py-3 align-middle">
                      <span className="inline-flex items-center justify-center min-w-[28px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold font-mono">{r.score}</span>
                    </td>
                    <td className="px-2 py-3 font-medium text-foreground whitespace-nowrap max-w-[260px] overflow-hidden text-ellipsis" title={r.name}>{r.name}</td>
                    <td className="px-2 py-3 align-middle">
                      <IntakeStatusCell initial={r.status || "Approved"} rowKey={r.name} />
                    </td>
                    <td className="px-2 py-3 text-foreground/80 whitespace-nowrap">{r.department}</td>
                    <td className="px-2 py-3 text-foreground/80 whitespace-nowrap">{r.portfolio}</td>
                    <td className="px-2 py-3">
                      {r.priority ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${priorityColor}`}>{r.priority}</span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-2 py-3 text-foreground/80 whitespace-nowrap">{r.budget}</td>
                    <td className="px-2 py-3 text-foreground/80">{r.fte}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {msg.inline && msg.inline.type === "weighting_editor" && (
        <WeightingEditor data={msg.inline} onApply={() => onActionClick("Re-rank intake with new weights")} />
      )}
      {msg.inline && msg.inline.type === "share_table" && (
        <div className="my-4 rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border/60 flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[12.5px] font-medium text-foreground">{msg.inline.title || "PM Distribution List"}</span>
            </div>
            <span className="text-[11px] text-muted-foreground">{msg.inline.rows.length} recipients</span>
          </div>
          <div className="max-h-[280px] overflow-y-auto">
            <table className="w-full text-[12.5px]">
              <thead className="sticky top-0 bg-card border-b border-border/60">
                <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Role</th>
                  <th className="px-4 py-2 font-medium">Portfolio</th>
                  <th className="px-4 py-2 font-medium">Email</th>
                </tr>
              </thead>
              <tbody>
                {msg.inline.rows.map((r: any, i: number) => (
                  <tr key={i} className="border-b border-border/40 last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <img src={avatarForName(r.name)} alt="" className="w-5 h-5 rounded-full" />
                        <span className="text-foreground font-medium">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{r.role}</td>
                    <td className="px-4 py-2 text-muted-foreground">{r.portfolio}</td>
                    <td className="px-4 py-2 text-muted-foreground">{r.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {msg.inline && msg.inline.type === "budget_register" && (
        <div className="my-4 rounded-lg border border-border bg-card px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Budget register</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-foreground">Approved</span>
            <span className="text-sm font-bold text-green-400">{msg.inline.approved}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-foreground">Remaining</span>
            <span className="text-sm font-bold text-foreground">{msg.inline.remaining}</span>
          </div>
          <div className="flex items-center justify-between py-1 border-t border-border mt-1 pt-1">
            <span className="text-xs text-muted-foreground">Spendable envelope</span>
            <span className="text-xs text-muted-foreground">{msg.inline.envelope}</span>
          </div>
          {msg.inline.note && <div className="text-xs text-muted-foreground/60 mt-1.5">{msg.inline.note}</div>}
        </div>
      )}
      {msg.inline && msg.inline.type === "plan_baseline_celebration" && (
        <div className="my-5 relative overflow-hidden rounded-2xl border border-success/25">
          {/* Gradient backdrop — soft success wash */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, hsl(150 60% 96%) 0%, hsl(160 55% 94%) 50%, hsl(170 50% 95%) 100%)",
            }}
            aria-hidden
          />
          {/* Dark mode overlay */}
          <div
            className="absolute inset-0 hidden dark:block"
            style={{
              background:
                "linear-gradient(135deg, hsl(150 40% 14%) 0%, hsl(160 40% 13%) 50%, hsl(170 35% 14%) 100%)",
            }}
            aria-hidden
          />
          {/* Decorative sparkles */}
          <Sparkles
            className="absolute bottom-5 left-6 w-3 h-3 text-success opacity-50"
            aria-hidden
          />
          <Sparkles
            className="absolute top-10 left-12 w-2.5 h-2.5 text-success opacity-40"
            aria-hidden
          />

          <div className="relative px-6 py-7 flex flex-col items-center text-center">
            {/* Hero icon */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-success/15">
              <CheckCircle2 className="w-7 h-7 text-success" strokeWidth={2.25} />
            </div>



            {/* Headline */}
            <h3 className="text-[20px] font-bold text-foreground leading-tight mb-2">
              {msg.inline.title || "Your plan has been created"}
            </h3>



            {/* Body */}
            {msg.inline.body && (
              <p className="text-[12.5px] text-muted-foreground leading-relaxed max-w-[520px]">
                {msg.inline.body}
              </p>
            )}

            {/* Subtle CTA */}
            <button
              onClick={() => navigate("/active-plans")}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/60 bg-card/60 hover:bg-card text-[12px] font-medium text-foreground hover:border-border transition-colors"
            >
              View plan
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}
      {msg.paragraphs2?.map((p: string, i: number) => (
        <div key={`p2-${i}`} className="chat-prose mb-4">{renderRich(p)}</div>
      ))}
      {msg.nextSteps && (
        <div className="mt-4 flex flex-col gap-2">
          {msg.nextSteps.map((s: any, i: number) => {
            const Icon = resolveActionIcon(s.icon, s.label);
            if (s.featured) {
              const labelStr = String(s.label || "");
              const useScenarioChip = /run scenarios on budget|cut line/i.test(labelStr);
              const useReportingChip = /arc dashboard|review your arc/i.test(labelStr);
              const chipSrc = useReportingChip ? reportingAgentChip : useScenarioChip ? scenarioAgentChip : intakeAgentChip;
              const chipAlt = useReportingChip ? "Reporting agent" : useScenarioChip ? "Scenario agent" : "Intake agent";
              return (
                <button
                  key={i}
                  onClick={() => onActionClick(s.label)}
                  className="group relative text-left rounded-xl border border-border/60 bg-card hover:border-[hsl(255_45%_70%)] hover:shadow-md transition-all overflow-hidden p-3.5"
                >
                  <ChevronRight className="absolute top-3 right-3 w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  <div className="mb-2 pr-6">
                    <img src={chipSrc} alt={chipAlt} className="w-auto" style={{ height: 20 }} />
                  </div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap pr-6">
                    <div className="text-[13.5px] font-semibold text-foreground leading-snug tracking-tight">{s.label}</div>
                  </div>
                  <div>
                    {s.detail && <div className="text-[11.5px] text-muted-foreground leading-relaxed mb-2">{s.detail}</div>}
                    {s.featuredNote && (
                      <div className="text-[10.5px] text-[hsl(255_30%_42%)] dark:text-[hsl(255_40%_78%)] italic leading-relaxed">{s.featuredNote}</div>
                    )}
                  </div>
                </button>
              );
            }
            const stepLabel = String(s.label || "");
            // Agent color associations:
            // Risk agent (red→orange): risk-flagged review and overage resolution
            // Scenario agent (purple): custom scenario building and locking baselines
            // Arc agent (blue gradient): dashboard review, monitoring, and plan-wide alerts
            const isRiskAgent = /flagged for vendor or delivery risk|resolve digital transformation overage/i.test(stepLabel);
            const isScenarioAgent = /build a custom scenario|lock scenario .* as the working baseline/i.test(stepLabel);
            const isArcAgent = /arc dashboard|review your arc|set up baseline alerts|share the baseline with portfolio leads/i.test(stepLabel);
            let dotBg = "hsl(214 90% 60%)";
            let dotRing = "hsl(214 90% 88%)";
            if (isRiskAgent) {
              dotBg = "hsl(354 100% 59%)"; // #FF2C39
              dotRing = "hsl(30 97% 85%)"; // soft amber halo from #FDBD62
            } else if (isScenarioAgent) {
              dotBg = "hsl(266 45% 42%)"; // #633B9B
              dotRing = "hsl(259 53% 87%)"; // soft lavender halo from #B09EDD
            } else if (isArcAgent) {
              dotBg = "hsl(213 100% 50%)"; // #0072FF — Arc chip blue
              dotRing = "hsl(216 47% 79%)"; // soft Arc halo from #7C9AD4
            }
            return (
              <button
                key={i}
                onClick={() => onActionClick(s.label)}
                className="group relative flex items-stretch text-left rounded-xl border border-border/40 bg-gradient-to-r from-card to-muted/10 hover:from-muted/20 hover:to-muted/30 hover:border-border/80 hover:shadow-sm transition-all overflow-hidden"
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0 px-3 py-2.5">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ring-2"
                    style={{ background: dotBg, boxShadow: `0 0 0 2px ${dotRing}` }}
                    aria-hidden
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold text-foreground leading-snug tracking-tight">{s.label}</div>
                    {s.detail && <div className="text-[11.5px] text-muted-foreground leading-relaxed mt-0.5">{s.detail}</div>}
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all mt-0.5 flex-shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      )}
      {msg.actions && msg.actionsVariant === "onboarding" && (() => {
        const [hero, secondary1, secondary2] = msg.actions;
        const BentoTile = ({ a, size = "md", className = "" }: any) => {
          const Icon = resolveActionIcon(a.icon, a.label);
          const isLg = size === "lg";
          return (
            <button
              onClick={() => onActionClick(a.label)}
              className={`group relative text-left rounded-2xl border-[1.5px] border-border/70 bg-card hover:border-[hsl(265_55%_75%)] hover:shadow-sm transition-all overflow-hidden p-5 flex flex-col ${className}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`icon-tile flex items-center justify-center transition-colors ${isLg ? "w-11 h-11" : "w-9 h-9"}`}
                  style={
                    isLg
                      ? { background: "hsl(214 60% 92%)", color: "hsl(214 80% 42%)" }
                      : { background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }
                  }
                >
                  <Icon className={isLg ? "w-5 h-5" : "w-4 h-4"} strokeWidth={1.75} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className={`font-semibold text-foreground mb-1 ${isLg ? "text-[16px]" : "text-[14px]"}`}>
                {a.label}
              </div>
              <div className={`text-muted-foreground ${isLg ? "text-[13px] leading-relaxed" : "text-[12px] leading-relaxed"}`}>
                {a.desc}
              </div>
              {isLg && (
                <div className="mt-3">
                  <img src={withAvatarChip} alt="" className="w-auto" style={{ height: 23 }} />
                </div>
              )}
            </button>
          );
        };
        return (
          <div className="mt-4 grid grid-cols-5 gap-3 min-h-[360px]">
            <BentoTile a={hero} size="lg" className="col-span-3 row-span-2" />
            {secondary1 && <BentoTile a={secondary1} className="col-span-2" />}
            {secondary2 && <BentoTile a={secondary2} className="col-span-2" />}
          </div>
        );
      })()}
      {msg.actions && msg.actionsVariant !== "onboarding" && (
        <div className="mt-4 flex flex-col gap-2">
          {msg.actions.map((a: any, i: number) => (
            <button
              key={i}
              onClick={() => onActionClick(a.label)}
              className="group relative flex items-stretch text-left rounded-xl border border-border/40 bg-gradient-to-r from-card to-muted/10 hover:from-muted/20 hover:to-muted/30 hover:border-border/80 hover:shadow-sm transition-all overflow-hidden"
            >
              <div className="flex items-start gap-2.5 flex-1 min-w-0 px-3 py-2.5">
                <span
                  className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ring-2"
                  style={{ background: "hsl(213 100% 50%)", boxShadow: "0 0 0 2px hsl(216 47% 79%)" }}
                  aria-hidden
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-semibold text-foreground leading-snug tracking-tight">{a.label}</div>
                  {(a.desc || a.detail) && (
                    <div className="text-[11.5px] text-muted-foreground leading-relaxed mt-0.5">{a.desc || a.detail}</div>
                  )}
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all mt-0.5 flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}
      {msg.artifact && msg.artifactInline && msg.artifact.type === "steps" && (
        <div className="mt-3 space-y-2">
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="px-4 py-3 space-y-2">
              {msg.artifact.steps.map((s: any, i: number) => {
                const isActive = s.status === "active";
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0 ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {s.num}
                    </div>
                    <span className={`text-[13px] leading-snug ${isActive ? "text-foreground font-medium" : "text-foreground/80"}`}>{s.title}</span>
                  </div>
                );
              })}
            </div>
            <div className="px-4 py-2 border-t border-border/60 text-[11px] text-muted-foreground">
              0/{msg.artifact.steps.length} complete
            </div>
          </div>
        </div>
      )}
      {msg.artifact && msg.artifactInline && msg.artifact.type === "dropzone" && (
        <div className="mt-3">
          <DropzoneArtifact artifact={msg.artifact} />
        </div>
      )}
      {msg.artifact && !msg.artifactInline && (
        <InlineArtifactCard
          artifact={msg.artifact}
          activeArtifact={activeArtifact}
          onArtifactClick={onArtifactClick}
          autoOpen={isLast && !msg.noAutoOpen}
        />
      )}
      
    </div>
  );
}
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const Conversation = () => {
  const { projectId, chatId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeArtifact, setActiveArtifact] = useState<any>(null);
  const [artifactFullScreen, setArtifactFullScreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarExpanded = useSidebarExpanded();
  // Subscribe so the Recents list re-renders when Search reveals chat 14
  // or when New Chat creates an Untitled entry.
  useChat14Revealed();
  useUntitledCreated();

  // Auto-collapse the left nav whenever the canvas opens or expands to full
  // screen, so the artifact gets the full available width without the nav
  // covering it. Restoring the prior state on close would be jarring, so we
  // leave it collapsed and let the user re-expand.
  useEffect(() => {
    if (!activeArtifact) return;
    if (typeof window === "undefined") return;
    // Only auto-collapse when the canvas was opened from the conversation.
    // Sidebar-originated opens (variant === "standalone") should leave the
    // user's nav state alone.
    if (activeArtifact._variant === "standalone") return;
    if (localStorage.getItem("sidebar:expanded") !== "1") return;
    localStorage.setItem("sidebar:expanded", "0");
    window.dispatchEvent(
      new CustomEvent("arc:sidebar:expanded-changed", { detail: { expanded: false } })
    );
  }, [activeArtifact, artifactFullScreen]);
  const [extraMessages, setExtraMessagesState] = useState<Record<string, any[]>>(
    () => ({ ...sessionExtraMessagesCache })
  );
  // Wrap setter so updates also flow into the in-memory session cache, which
  // survives route changes (component unmount) but is wiped on full refresh.
  const setExtraMessages = useCallback(
    (updater: React.SetStateAction<Record<string, any[]>>) => {
      setExtraMessagesState((prev) => {
        const next = typeof updater === "function" ? (updater as any)(prev) : updater;
        sessionExtraMessagesCache = next;
        return next;
      });
    },
    []
  );
  const [inputValue, setInputValue] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [activeWidgetChip, setActiveWidgetChip] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initialMessageSentRef = useRef(false);

  const currentDay = DAYS.find(d => d.id === chatId) || DAYS[0];
  const isNewChat = !CONVERSATIONS[chatId || ""];
  const baseMessages = isNewChat ? [] : (CONVERSATIONS[chatId || "1"] || CONVERSATIONS["1"]);
  const extra = extraMessages[chatId || "1"] || [];
  const messages = useMemo(() => [...baseMessages, ...extra], [baseMessages, extra]);
  const allMessages = messages;

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  // Build conversation history for AI context
  const buildMessageHistory = useCallback(() => {
    const history: { role: string; content: string }[] = [];
    for (const msg of messages) {
      if (msg.role === "user") {
        history.push({ role: "user", content: msg.text });
      } else if (msg.role === "ai") {
        const parts: string[] = [];
        if (msg.paragraphs) parts.push(...msg.paragraphs);
        if (msg.bullets) parts.push(...msg.bullets.map((b: any) => `• ${b.label} ${b.detail}`));
        if (msg.paragraphs2) parts.push(...msg.paragraphs2);
        history.push({ role: "assistant", content: parts.join("\n\n") });
      }
    }
    return history;
  }, [messages]);

  const handleSend = useCallback(async (overrideText?: string) => {
    const text = (overrideText || inputValue).trim();
    if (!text || isStreaming) return;

    const key = chatId || "1";
    const userMsg = { role: "user", text };

    // ── Intercept: "add rice framework" while Intake Form artifact is open ──
    const wantsRice = /rice/i.test(text) && /(framework|scoring|add|model)/i.test(text);
    if (wantsRice && activeArtifact?.type === "intake_form") {
      const alreadyHasRice = (activeArtifact.sections || []).some((s: any) => s.id === "rice");
      const riceSection = {
        id: "rice",
        title: "RICE Scoring Framework",
        icon: "target",
        badge: "Reach × Impact × Confidence ÷ Effort",
        fields: [
          { label: "Reach (people / quarter)", required: true, type: "text", placeholder: "e.g., 12,000", helper: "How many users, patients, or stakeholders this affects per quarter", half: true },
          { label: "Impact", required: true, type: "select", placeholder: "Select impact (Massive 3 / High 2 / Medium 1 / Low 0.5 / Minimal 0.25)", half: true },
          { label: "Confidence (%)", required: true, type: "text", placeholder: "e.g., 80", helper: "How confident you are in Reach + Impact estimates (0–100%)", half: true },
          { label: "Effort (person-months)", required: true, type: "text", placeholder: "e.g., 6", helper: "Total team effort across all roles", half: true },
          { label: "Calculated RICE Score", type: "text", placeholder: "Auto-calculated from inputs above", helper: "Reach × Impact × Confidence ÷ Effort" },
          { label: "Scoring Rationale", type: "textarea", placeholder: "Briefly explain assumptions behind your RICE inputs..." },
        ],
      };

      const updatedArtifact = alreadyHasRice
        ? activeArtifact
        : { ...activeArtifact, sections: [...(activeArtifact.sections || []), riceSection] };

      // 1) Push user message + a "thinking" placeholder immediately
      const thinkingId = `__thinking_${Date.now()}`;
      setExtraMessages(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), userMsg, { role: "ai", _thinking: true, _id: thinkingId }],
      }));
      setInputValue("");
      setIsStreaming(true);
      scrollToBottom();

      // 2) After a short delay, swap thinking → real response + artifact preview card.
      //    The inline card itself plays a loading state and then opens the panel.
      window.setTimeout(() => {
        setExtraMessages(prev => {
          const next = { ...prev };
          // Replace thinking placeholder in current chat with the real reply + inline artifact preview card
          const arr = (next[key] || []).filter((m: any) => m?._id !== thinkingId);
          arr.push({
            role: "ai",
            paragraphs: [
              alreadyHasRice
                ? "RICE framework is already on the form. Scrolling you to it."
                : "Added the RICE Scoring Framework to the bottom of your intake form — Reach, Impact, Confidence, and Effort with rationale. Submitters will be guided through it just like the other sections.",
            ],
            nextSteps: alreadyHasRice
              ? undefined
              : [
                  { icon: "network", label: "Connect portfolios and score existing projects against strategic plan", detail: "Sync active projects so I can flag duplicates, dependencies, and budget conflicts against incoming submissions before they're scored.", featured: true, featuredNote: "Recommended next step — gives every submission context against in-flight work." },
                  { icon: "share", label: "Share intake form", detail: "Send the link to portfolio leads, theme owners, and PMs so they can start submitting against the new RICE-enabled form." },
                ],
          });
          // Inline artifact preview card (clickable to reopen) — handles its own loading + auto-open
          arr.push({ role: "ai", artifact: updatedArtifact });
          next[key] = arr;

          // Also update the artifact stored on whichever message originally produced it,
          // across all chats, so reopening keeps RICE in place.
          for (const k of Object.keys(next)) {
            next[k] = (next[k] || []).map((m: any) =>
              m?.artifact?.title === activeArtifact.title && m?._id !== thinkingId
                ? { ...m, artifact: updatedArtifact }
                : m
            );
          }
          return next;
        });

        setIsStreaming(false);
        scrollToBottom();

        // Saved chip + auto-scroll the artifact panel — fire AFTER the inline card
        // has finished its loading reveal (~1800ms) and opened the panel.
        setTimeout(() => {
          dispatchArtifactSaved(updatedArtifact.title);
          const el = document.getElementById("arc-artifact-scroll");
          if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
        }, 2000);
      }, 1600);

      return;
    }

    // ── Intercept: "share with PMs" → inline confirmation + scrollable PM table ──
    const wantsShare = /share/i.test(text) && /\bpm(s|'s)?\b/i.test(text);
    if (wantsShare) {
      const pmRows = [
        { name: "Maria Alvarez", role: "Senior PM", portfolio: "Patient Experience", email: "m.alvarez@health.org" },
        { name: "James O'Connor", role: "PM II", portfolio: "Clinical Ops", email: "j.oconnor@health.org" },
        { name: "Priya Raman", role: "Senior PM", portfolio: "Digital Health", email: "p.raman@health.org" },
        { name: "Tomás Herrera", role: "PM III", portfolio: "Revenue Cycle", email: "t.herrera@health.org" },
        { name: "Linh Tran", role: "PM II", portfolio: "Population Health", email: "l.tran@health.org" },
        { name: "David Kim", role: "Senior PM", portfolio: "Infrastructure", email: "d.kim@health.org" },
        { name: "Aisha Bello", role: "PM II", portfolio: "Patient Experience", email: "a.bello@health.org" },
        { name: "Marco Rossi", role: "PM III", portfolio: "Clinical Ops", email: "m.rossi@health.org" },
        { name: "Hannah Goldberg", role: "PM II", portfolio: "Digital Health", email: "h.goldberg@health.org" },
        { name: "Wei Zhang", role: "Senior PM", portfolio: "Quality & Safety", email: "w.zhang@health.org" },
        { name: "Olivia Park", role: "PM II", portfolio: "Revenue Cycle", email: "o.park@health.org" },
        { name: "Ethan Wallace", role: "PM III", portfolio: "Infrastructure", email: "e.wallace@health.org" },
        { name: "Noor Hassan", role: "PM II", portfolio: "Population Health", email: "n.hassan@health.org" },
        { name: "Carlos Mendes", role: "Senior PM", portfolio: "Clinical Ops", email: "c.mendes@health.org" },
        { name: "Sofia Lindqvist", role: "PM II", portfolio: "Digital Health", email: "s.lindqvist@health.org" },
        { name: "Rahul Desai", role: "PM III", portfolio: "Patient Experience", email: "r.desai@health.org" },
        { name: "Emma Whitfield", role: "PM II", portfolio: "Quality & Safety", email: "e.whitfield@health.org" },
        { name: "Jordan Reyes", role: "Senior PM", portfolio: "Revenue Cycle", email: "j.reyes@health.org" },
        { name: "Yuki Tanaka", role: "PM II", portfolio: "Infrastructure", email: "y.tanaka@health.org" },
        { name: "Grace Mwangi", role: "PM III", portfolio: "Population Health", email: "g.mwangi@health.org" },
        { name: "Lukas Becker", role: "PM II", portfolio: "Digital Health", email: "l.becker@health.org" },
        { name: "Anika Sharma", role: "Senior PM", portfolio: "Clinical Ops", email: "a.sharma@health.org" },
        { name: "Diego Fuentes", role: "PM II", portfolio: "Patient Experience", email: "d.fuentes@health.org" },
        { name: "Chloe Bennett", role: "PM III", portfolio: "Quality & Safety", email: "c.bennett@health.org" },
      ];

      const thinkingId = `__thinking_${Date.now()}`;
      setExtraMessages(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), userMsg, { role: "ai", _thinking: true, _id: thinkingId }],
      }));
      setInputValue("");
      setIsStreaming(true);
      scrollToBottom();

      window.setTimeout(() => {
        setExtraMessages(prev => {
          const next = { ...prev };
          const arr = (next[key] || []).filter((m: any) => m?._id !== thinkingId);
          arr.push({
            role: "ai",
            paragraphs: ["This intake sheet was shared with **Group 275**."],
            inline: {
              type: "share_table",
              title: "Group 275 — Project Managers",
              rows: pmRows,
            },
          });
          next[key] = arr;
          return next;
        });
        setIsStreaming(false);
        scrollToBottom();
      }, 1200);

      return;
    }

    // ── Intercept: widget chip active + forecast/trend question → inline widget reply ──
    const wantsForecastInline =
      activeWidgetChip &&
      (/\bforecast\b/i.test(text) || /\btrend\b/i.test(text) || /\bproject(ion)?\b/i.test(text));
    if (wantsForecastInline) {
      const widgetTitle = activeWidgetChip;
      const thinkingId = `__thinking_${Date.now()}`;
      setExtraMessages(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), { role: "user", text, widgetContext: widgetTitle }, { role: "ai", _thinking: true, _id: thinkingId }],
      }));
      setInputValue("");
      setActiveWidgetChip(null);
      setIsStreaming(true);
      scrollToBottom();

      window.setTimeout(() => {
        setExtraMessages(prev => {
          const next = { ...prev };
          const arr = (next[key] || []).filter((m: any) => m?._id !== thinkingId);
          arr.push({
            role: "ai",
            paragraphs: [
              "Here's the **5-day forecast** layered onto your daily spend, plus a 3-day moving average trend line. The trend is sloping **up** — burn is accelerating from ~$0.121M/day today toward ~$0.186M/day by May 8.",
            ],
            inlineWidget: "daily_spend_forecast",
            recommendations: [
              { label: "Track this budget metric for the next 6 days and alert me if it trends up or down", detail: "Arc will watch the daily burn vs. plan and ping you the moment the trend slope flips or breaches ±5%." },
              { label: "Flag the 4 projects driving the overrun and draft a containment plan for review", detail: "EHR Consolidation, Cloud Migration, Patient Portal, and Cybersecurity Zero Trust account for ~80% of the +$0.27M variance." },
              { label: "Run a forecast scenario assuming the hot pace continues and show FYE impact vs baseline", detail: "Projects FYE landing at ~$47.7M against the $42.0M plan — surfaces which portfolios breach guardrails first." },
            ],
          });
          next[key] = arr;
          return next;
        });
        setIsStreaming(false);
        scrollToBottom();
      }, 1200);

      return;
    }

    // ── Intercept: "execution snapshot for the last N days" → Budget Report (snapshot variant) ──
    const wantsSnapshot =
      /\b(execution|exec)\s+snapshot\b/i.test(text) ||
      (/\bsnapshot\b/i.test(text) && /\b(last|past)\s+\d+\s+days?\b/i.test(text)) ||
      (/\b(show|give|pull|get)\b/i.test(text) && /\b(last|past)\s+10\s+days?\b/i.test(text) && /\b(spend|burn|budget|execution)\b/i.test(text));
    if (wantsSnapshot) {
      const snapshotArtifact = {
        title: "Budget deep dive",
        subtitle: "$1.21M spent vs $0.94M planned · +29% over pace · 9 projects pacing hot",
        type: "budget_report",
        variant: "snapshot_10d",
      };

      const thinkingId = `__thinking_${Date.now()}`;
      setExtraMessages(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), userMsg, { role: "ai", _thinking: true, _id: thinkingId }],
      }));
      setInputValue("");
      setIsStreaming(true);
      scrollToBottom();

      window.setTimeout(() => {
        setExtraMessages(prev => {
          const next = { ...prev };
          const arr = (next[key] || []).filter((m: any) => m?._id !== thinkingId);
          arr.push({
            role: "ai",
            paragraphs: [
              "Here's the execution snapshot for the last 10 days. Daily burn ran **$0.121M/day vs $0.094M planned** — about **29% hot**, adding roughly **$0.27M to the projected overrun** in just this window.",
              "Nine projects paced above their daily plan. The same four driving the FYE overrun — **EHR Consolidation**, **Cloud Infrastructure Migration**, **Patient Portal**, and **Cybersecurity Zero Trust** — accounted for most of the movement.",
            ],
            artifact: snapshotArtifact,
          });
          next[key] = arr;
          return next;
        });
        setIsStreaming(false);
        scrollToBottom();
      }, 1200);

      return;
    }

    setExtraMessages(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), userMsg],
    }));
    setInputValue("");
    setIsStreaming(true);
    scrollToBottom();

    try {
      const history = [...buildMessageHistory(), { role: "user", content: text }];

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: history }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("Rate limited. Please wait a moment.");
        else if (resp.status === 402) toast.error("AI credits exhausted.");
        else toast.error("Failed to get response.");
        setIsStreaming(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantSoFar = "";
      let streamDone = false;

      // Add initial empty AI message
      setExtraMessages(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), userMsg, { role: "ai", paragraphs: [""], _streaming: true }].filter((m, i, arr) => {
          // Deduplicate the userMsg we already added
          if (m === userMsg && i !== arr.indexOf(userMsg)) return false;
          return true;
        }),
      }));

      // Actually, let's simplify: re-set extra with user + empty AI
      setExtraMessages(prev => {
        const existing = prev[key] || [];
        // The last item should be the userMsg we just added; add AI after it
        return {
          ...prev,
          [key]: [...existing, { role: "ai", paragraphs: ["▍"], _streaming: true }],
        };
      });
      scrollToBottom();

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const currentText = assistantSoFar;
              setExtraMessages(prev => {
                const arr = [...(prev[key] || [])];
                arr[arr.length - 1] = { role: "ai", paragraphs: [currentText + "▍"], _streaming: true };
                return { ...prev, [key]: arr };
              });
              scrollToBottom();
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) assistantSoFar += content;
          } catch {}
        }
      }

      // Finalize the AI message - split into paragraphs
      const finalParagraphs = assistantSoFar.split("\n\n").filter(p => p.trim());
      setExtraMessages(prev => {
        const arr = [...(prev[key] || [])];
        arr[arr.length - 1] = { role: "ai", paragraphs: finalParagraphs.length > 0 ? finalParagraphs : [assistantSoFar || "I couldn't generate a response."] };
        return { ...prev, [key]: arr };
      });
    } catch (e) {
      console.error("Chat error:", e);
      toast.error("Failed to send message.");
    } finally {
      setIsStreaming(false);
      scrollToBottom();
    }
  }, [inputValue, isStreaming, chatId, buildMessageHistory, scrollToBottom, activeArtifact, activeWidgetChip]);

  const handleActionClick = (rawLabel: string) => {
    // Alias renamed labels back to their canonical scripted-flow keys
    const LABEL_ALIASES: Record<string, string> = {
      "Built your intake form and created an agent to monitor and track it": "Build the intake form",
      "Connect portfolios and score existing projects against strategic plan": "Connect Portfolios",
    };
    const label = LABEL_ALIASES[rawLabel] || rawLabel;
    const key = chatId || "1";

    // ── Side effect: documents uploaded → Strategic Framework artifact appears ──
    // Only at this point does the sidebar item become active + show In Progress.
    if (label === "__upload_docs__") {
      setItemState("strategic_framework", "in_progress");
    }

    // ── Side effect: intake form built → Intake nav activates + draft is dirty ──
    if (label === "Build the intake form") {
      setItemState("intake", "in_progress");
      resetArtifactDraft("intake_form", { status: "draft", version: "1.0", dirty: true, savedAt: null });
    }

    // ── Side effect: intake sheet surfaced → Prioritization nav activates ──
    if (
      label === "Review the 5 new intake requests" ||
      label === "Review the 17 new intake proposals" ||
      label === "Show me the 17 new intake proposals" ||
      label === "Prioritize using weighting criteria" ||
      label === "Connect Portfolios" ||
      label === "Connect portfolios and score existing projects against strategic plan"
    ) {
      setItemState("prioritization", "in_progress");
    }

    // ── Side effect: scenario comparison surfaced → Scenarios nav activates ──
    if (
      label === "Show me recommended scenarios" ||
      label === "Yes. Show me scenarios." ||
      /scenario/i.test(label)
    ) {
      setItemState("scenarios", "in_progress");
    }

    // ── Intercept: "Approve the top 3 high-scoring projects" ──
    if (label === "Approve the top 3 high-scoring projects" || label === "Approve top 3: Sepsis EWS, OR Scheduling, EHR Phase 3") {
      const TOP_IDS = ["A1-01", "D1-01", "B2-01"];
      // Find latest intake_sheet across base + extra messages to grab row data
      const allMsgs = [...(baseMessages || []), ...((extraMessages[key] || []))];
      const intakeMsg = [...allMsgs].reverse().find((m: any) => m?.artifact?.type === "intake_sheet");
      const sourceRows: any[] = intakeMsg?.artifact?.rows || [];
      const approvedRows = TOP_IDS
        .map((id) => sourceRows.find((r) => r.id === id))
        .filter(Boolean)
        .map((r) => ({ ...r, status: "Approved" }));

      // 1) Push user bubble immediately
      setExtraMessages(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), { role: "user", text: "Approve the top 3 high-scoring projects." }],
      }));
      scrollToBottom();

      // 2) Persist status changes onto every intake_sheet artifact in this chat
      setExtraMessages(prev => {
        const next = { ...prev };
        const updateRows = (rows: any[]) =>
          (rows || []).map((r: any) => TOP_IDS.includes(r.id) ? { ...r, status: "Approved" } : r);
        for (const k of Object.keys(next)) {
          next[k] = (next[k] || []).map((m: any) =>
            m?.artifact?.type === "intake_sheet"
              ? { ...m, artifact: { ...m.artifact, rows: updateRows(m.artifact.rows) } }
              : m
          );
        }
        return next;
      });
      // Also patch the active artifact so an open panel reflects the change
      setActiveArtifact((prev: any) => {
        if (!prev || prev.type !== "intake_sheet") return prev;
        const updated = (prev.rows || []).map((r: any) => TOP_IDS.includes(r.id) ? { ...r, status: "Approved" } : r);
        return { ...prev, rows: updated };
      });

      // 3) After a beat, append the AI confirmation + inline approved rows
      setTimeout(() => {
        setExtraMessages(prev => ({
          ...prev,
          [key]: [...(prev[key] || []), {
            role: "ai",
            paragraphs: [
              `Approved 3 projects. They've been moved to the funded set and marked **Approved** on the intake sheet.`,
            ],
            inline: { type: "approved_rows", rows: approvedRows },
          }],
        }));
        scrollToBottom();
      }, 700);

      return;
    }

    // ── Intercept: "Re-rank intake with new weights" ──
    if (label === "Re-rank intake with new weights") {
      // Find the latest intake_sheet to seed rescored rows
      const allMsgs = [...(baseMessages || []), ...((extraMessages[key] || []))];
      const intakeMsg = [...allMsgs].reverse().find((m: any) => m?.artifact?.type === "intake_sheet");
      const sourceRows: any[] = intakeMsg?.artifact?.rows || [];

      // Adjusted score deltas keyed by id (slight shifts driven by new weights)
      const DELTAS: Record<string, number> = {
        "A1-01": +2, "D1-01": -1, "B2-01": +3, "C1-01": -4, "F1-01": +1,
      };
      const rescoredRows = sourceRows
        .map((r: any) => {
          const d = DELTAS[r.id] ?? 0;
          return { ...r, score: r.score + d, change: d };
        })
        .sort((a: any, b: any) => b.score - a.score);

      setExtraMessages(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), { role: "user", text: "Apply the new weights and re-rank the intake." }],
      }));
      scrollToBottom();

      // Show processing, then the new rescored intake-sheet artifact
      setTimeout(() => {
        setExtraMessages(prev => ({
          ...prev,
          [key]: [...(prev[key] || []), {
            role: "ai",
            paragraphs: [
              "Re-scored all 5 submissions against the updated weights. Movement is modest — Business Value carries less weight, RICE picked up 25%, so projects with stronger reach/impact ticked up while pure benefit-case submissions dipped slightly.",
            ],
            artifact: {
              title: "FY27 Intake Sheet — Re-ranked",
              subtitle: "Re-scored against updated weighting model · sorted by new score",
              type: "intake_sheet",
              rescored: true,
              totalLabel: `${rescoredRows.length} submissions`,
              rows: rescoredRows,
            },
          }],
        }));
        scrollToBottom();
      }, 900);

      // Follow-up: recommendations based on the new ranking
      setTimeout(() => {
        setExtraMessages(prev => ({
          ...prev,
          [key]: [...(prev[key] || []), {
            role: "ai",
            paragraphs: [
              "With the re-ranked sheet in hand, here's what I'd recommend acting on:",
            ],
            nextSteps: [
              { icon: "review", label: "Approve top 3: Sepsis EWS, OR Scheduling, EHR Phase 3", detail: "All three clear 85+ under the new model with strong RICE and clear KR alignment. Move them to funded and lock budget." },
              { icon: "alert", label: "Reject Executive Reporting Dashboard", detail: "Score nudged to 45 but still bottom of the pool — no KR alignment and an unresolved data warehouse dependency. Cleanest cut." },
              { icon: "search", label: "Send Staff Scheduling App back for rescope", detail: "Dropped to 58 under the new weights. KR linkage is indirect — ask HR to either tighten the benefit case or fold it into a broader workforce initiative." },
              { icon: "layers", label: "Run a scenario with only the top 3 funded", detail: "See how budget, capacity, and risk buffers look if you greenlight only the approved set before opening a second wave." },
              { icon: "share", label: "Share re-ranked sheet with portfolio leads", detail: "Give CFO, CMIO, and PMO leads visibility on the new ranking and recommendations before the funding meeting." },
            ],
          }],
        }));
        scrollToBottom();
      }, 2400);
      return;
    }

    // ── Intercept: "Review weighting criteria" → show editable global weights ──
    if (label === "Review weighting criteria") {
      setExtraMessages(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), { role: "user", text: "Review weighting criteria." }],
      }));
      scrollToBottom();
      setTimeout(() => {
        setExtraMessages(prev => ({
          ...prev,
          [key]: [...(prev[key] || []), {
            role: "ai",
            paragraphs: [
              "Here's the **scoring model** currently applied across all submissions in this portfolio. Adjust the weights below — I'll re-rank the intake sheet against the new model when you're ready.",
            ],
            inline: {
              type: "weighting_editor",
              criteria: [
                { name: "Goal Alignment", desc: "How closely the project maps to strategic goals & KRs", weight: 10 },
                { name: "Business Value", desc: "ROI, revenue generation, and cost savings potential", weight: 35 },
                { name: "Risk", desc: "Project risk level (lower risk = higher score)", weight: 10 },
                { name: "Effort / Complexity", desc: "Implementation difficulty (lower effort = higher score)", weight: 20 },
                { name: "RICE", desc: "Reach × Impact × Confidence ÷ Effort — cross-check on prioritization", weight: 25 },
              ],
              note: "Weights must total 100%. Last updated when this portfolio was created — no changes since intake opened.",
            },
          }],
        }));
        scrollToBottom();
      }, 700);
      return;
    }

    const ACTION_ALIASES: Record<string, string> = {
      "Review 3 scenarios to pressure-test your cut line": "Show me recommended scenarios",
      "Would you like to run scenarios on budget/cut line?": "Show me recommended scenarios",
    };
    const resolvedLabel = ACTION_ALIASES[label] || label;
    const response = ACTION_RESPONSES[resolvedLabel];
    if (!response) return;

    // Always append the user bubble (index 0) immediately so the action feels responsive.
    const firstIsUser = response[0]?.role === "user";
    const initialBatch = firstIsUser ? [response[0]] : [];
    if (initialBatch.length) {
      setExtraMessages(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), ...initialBatch],
      }));
      scrollToBottom();
    }

    // Stream the rest of the messages one at a time with a short delay between each.
    // Note: artifact panels are opened by the inline artifact card itself after its
    // built-in loading reveal — we no longer auto-open here.
    // Stream the rest of the messages one at a time. When a message contains an
    // artifact, wait for its inline build/reveal animation (~1800ms) to finish
    // before showing the next message — so things like "next steps" recommendations
    // appear AFTER the canvas has loaded, not before.
    const rest = response.slice(initialBatch.length);

    // Special case: "Show me the new EPMO dashboard" — stream the dashboard
    // artifact normally so it loads + opens, then dump everything else at once
    // (no shimmer, no auto-open hijack), so the user can read but not interact
    // with a long stream.
    if (resolvedLabel === "Show me the new EPMO dashboard") {
      // First message: AI reply with the EPMO dashboard artifact (canvas).
      // Second message: AI reply with recommended next-step actions.
      // Everything after that (the deep-dive conversation) is intentionally
      // skipped so the user lands on the canvas + recommendations only.
      const epmoMsg = rest[0];
      const nextStepsMsg = rest[1];
      setTimeout(() => {
        setExtraMessages(prevState => ({
          ...prevState,
          [key]: [...(prevState[key] || []), epmoMsg],
        }));
        scrollToBottom();
      }, 600);
      if (nextStepsMsg) {
        setTimeout(() => {
          setExtraMessages(prevState => ({
            ...prevState,
            [key]: [...(prevState[key] || []), nextStepsMsg],
          }));
          scrollToBottom();
        }, 600 + 2200);
      }
      return;
    }

    let cumulative = 0;
    rest.forEach((msg: any, i: number) => {
      const base = i === 0 ? 600 : 700;
      const prev = rest[i - 1];
      const artifactWait = prev?.artifact ? 2000 : 0;
      cumulative += base + artifactWait;
      const delay = cumulative;
      setTimeout(() => {
        setExtraMessages(prevState => ({
          ...prevState,
          [key]: [...(prevState[key] || []), msg],
        }));
        scrollToBottom();
      }, delay);
    });
  };

  // Handle initial message from navigation state (new chat from Index)
  useEffect(() => {
    const initialMessage = (location.state as any)?.initialMessage;
    if (initialMessage && !initialMessageSentRef.current) {
      initialMessageSentRef.current = true;
      window.history.replaceState({}, document.title);
      // Small delay to ensure component is fully mounted
      setTimeout(() => handleSend(initialMessage), 100);
    }
  }, []);

  useEffect(() => {
    setActiveArtifact(null);
    setArtifactFullScreen(false);
  }, [chatId]);

  // Broadcast active artifact changes so the sidebar can highlight the
  // matching workspace item (or clear highlight when nothing is open).
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("arc:activeArtifactChanged", {
        detail: activeArtifact
          ? { type: activeArtifact.type, title: activeArtifact.title }
          : null,
      })
    );
  }, [activeArtifact]);

  // Framework nav → open matching artifact full-screen.
  // Search across ALL conversation chats (Day 1, 2, 7, 20) plus current extras
  // so Goals/Investment Parameters/Prioritization/Scenarios are reachable from any chat.
  useEffect(() => {
    // Centralized nav-label → artifact type mapping. Used as a backstop so
    // a click always resolves to the correct canonical artifact type even
    // if the dispatched detail is partial.
    const NAV_LABEL_TO_TYPES: Record<string, string[]> = {
      "Strategic Framework": ["strategic_framework", "goals_arc6", "params_arc6"],
      "Goals": ["goals_arc6"],
      "Investment Parameters": ["params_arc6"],
      "Prioritization": ["intake_sheet"],
      "Scenarios": ["scenario_comparison"],
    };
    // Real conversation IDs in this app. The previous code used "1".."4"
    // which never matched, causing intermittent nav failures.
    const CHAT_IDS = DAYS.map((d) => d.id);

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        artifactType?: string;
        artifactTypes?: string[];
        navLabel?: string;
      };
      // Nav-label mapping is the source of truth — it overrides any
      // shorthand/legacy artifactType the sender may have dispatched.
      let wantedTypes: string[] = [];
      if (detail?.navLabel && NAV_LABEL_TO_TYPES[detail.navLabel]) {
        wantedTypes = NAV_LABEL_TO_TYPES[detail.navLabel];
      } else if (detail?.artifactTypes && detail.artifactTypes.length > 0) {
        wantedTypes = detail.artifactTypes;
      } else if (detail?.artifactType) {
        // Aliases: legacy shorthand → canonical artifact type.
        const TYPE_ALIASES: Record<string, string> = {
          prioritization: "intake_sheet",
          scenarios: "scenario_comparison",
        };
        wantedTypes = [TYPE_ALIASES[detail.artifactType] || detail.artifactType];
      }
      if (wantedTypes.length === 0) return;

      // Build pool from canonical chats (latest day last) plus any extras the
      // user has generated, so we always pick the newest matching artifact.
      const allFromDays = CHAT_IDS.flatMap((id) => CONVERSATIONS[id] || []);
      const allExtras = Object.values(extraMessages).flat();
      const pool = [...allFromDays, ...allExtras];
      // For Prioritization, prefer the "Existing Projects — Scored vs. Strategic Plan"
      // artifact when it exists in the pool, so the nav matches the in-conversation view.
      const preferredTitle = detail?.navLabel === "Intake Sheet" || detail?.navLabel === "Prioritization" ? "Intake Sheet - Existing Projects_Scored vs Strategic Plan" : null;
      const reversed = [...pool].reverse();
      const match =
        (preferredTitle &&
          reversed.find(
            (m: any) =>
              m?.artifact?.type &&
              wantedTypes.includes(m.artifact.type) &&
              m.artifact.title === preferredTitle,
          )) ||
        reversed.find((m: any) => m?.artifact?.type && wantedTypes.includes(m.artifact.type));

      if (!match?.artifact) {
        // No saved artifact yet — open an empty shell of the right type so the
        // user gets the page structure to start filling in, rather than a toast.
        const label = detail?.navLabel || wantedTypes[0];
        const mkParams = (labels: { label: string; desc: string }[]) =>
          labels.map((p) => ({ ...p, value: "", enabled: false }));
        const emptyShells: Record<string, any> = {
          goals_arc6: {
            type: "goals_arc6",
            title: "Goals",
            objectives: [],
            recommendations: [
              { title: "Start with Patient Safety & Clinical Quality", detail: "Most peer EPMOs anchor their plan with a quality goal. Typical sub-goals include reducing hospital-acquired infections, preventable harm events, and 30-day readmissions. Approve to drop in a starter goal you can edit.", apply: { type: "addGoal", goal: { title: "Patient Safety & Clinical Quality", owner: "", krs: [{ text: "Reduce hospital-acquired infections", target: "" }, { text: "Reduce preventable harm events", target: "" }, { text: "Reduce 30-day readmissions", target: "" }] } } },
              { title: "Add an Access & Throughput goal", detail: "Wait times, virtual visit penetration, and ED throughput are the three measures most boards ask about. I can add the goal scaffold and you fill in owners and targets.", apply: { type: "addGoal", goal: { title: "Access & Throughput", owner: "", krs: [{ text: "Reduce new-patient wait time", target: "" }, { text: "Increase virtual visit penetration", target: "" }, { text: "Improve ED door-to-provider time", target: "" }] } } },
              { title: "Add a Workforce Stability goal", detail: "Nurse turnover, agency utilization, and engagement scores are the standard trio. Drop it in as a placeholder and assign an HR owner.", apply: { type: "addGoal", goal: { title: "Workforce Stability", owner: "", krs: [{ text: "Reduce nurse turnover", target: "" }, { text: "Reduce agency utilization", target: "" }, { text: "Improve engagement score", target: "" }] } } },
              { title: "Add a Financial Performance goal", detail: "Operating margin and cost per adjusted discharge cover the basics. Add a liquidity or capital ROI sub-goal if your CFO tracks it.", apply: { type: "addGoal", goal: { title: "Financial Performance", owner: "", krs: [{ text: "Improve operating margin", target: "" }, { text: "Reduce cost per adjusted discharge", target: "" }] } } },
            ],
          },
          params_arc6: {
            type: "params_arc6",
            title: "Investment Parameters",
            categories: [
              { id: "budget", label: "Budget", params: mkParams([
                { label: "Total Budget", desc: "Annual EPMO investment cap (~3% of revenue)" },
                { label: "Investment Mix", desc: "Run / Change / Grow allocation" },
                { label: "Cost Structure", desc: "CapEx / OpEx ratio" },
                { label: "Vendors", desc: "External vendor spend of total budget" },
                { label: "Risk Buffer", desc: "Central contingency reserve" },
                { label: "Concentration", desc: "Single initiative budget cap" },
                { label: "Multi-Year", desc: "Committed multi-year spend of total budget" },
                { label: "Carryover", desc: "Prior-year carryover limit" },
              ]) },
              { id: "capacity", label: "Capacity", params: mkParams([
                { label: "FTE Capacity", desc: "Annual FTE allocation across portfolios" },
                { label: "Contractor Mix", desc: "Contractor share of delivery capacity" },
                { label: "Skill Coverage", desc: "Critical-skill bench depth" },
                { label: "Utilization Ceiling", desc: "Max sustained team utilization" },
                { label: "Onboarding Lead Time", desc: "Time-to-productive for new hires" },
                { label: "Cross-Team Loan", desc: "Capacity loaned across portfolios" },
              ]) },
              { id: "strategic", label: "Strategic", params: mkParams([
                { label: "Theme Coverage", desc: "Min spend per strategic theme" },
                { label: "OKR Alignment", desc: "Min % of work mapped to an OKR" },
                { label: "Bet Size", desc: "Max share for any single strategic bet" },
                { label: "Innovation Floor", desc: "Min spend on innovation / new bets" },
                { label: "Sunset Cadence", desc: "Annual review of low-value initiatives" },
                { label: "Geographic Mix", desc: "Spend balance across regions" },
              ]) },
              { id: "risk", label: "Risk", params: mkParams([
                { label: "Risk Appetite", desc: "Aggregate portfolio risk ceiling" },
                { label: "High-Risk Cap", desc: "Max share of high-risk initiatives" },
                { label: "Dependency Limit", desc: "Max cross-program dependencies per project" },
                { label: "Vendor Concentration", desc: "Max spend with any single vendor" },
                { label: "Continuity Reserve", desc: "Reserved capacity for incident response" },
              ]) },
              { id: "delivery", label: "Delivery", params: mkParams([
                { label: "Cycle Time", desc: "Target delivery cycle per initiative" },
                { label: "Milestone Cadence", desc: "Frequency of milestone reviews" },
                { label: "WIP Limit", desc: "Max active initiatives per portfolio" },
                { label: "On-Time Delivery", desc: "Target on-time milestone completion" },
                { label: "Change Velocity", desc: "Min releases per quarter" },
                { label: "Quality Gate", desc: "Required pre-release quality threshold" },
              ]) },
              { id: "compliance", label: "Compliance", params: mkParams([
                { label: "Regulatory Coverage", desc: "Mandatory regulatory work funded" },
                { label: "Audit Readiness", desc: "Annual audit-ready evidence cycles" },
                { label: "Privacy Review", desc: "Data privacy review threshold" },
                { label: "Security Review", desc: "Security review required above threshold" },
                { label: "Policy Alignment", desc: "Min policy-alignment score" },
              ]) },
              { id: "scenarios", label: "Scenarios", params: mkParams([
                { label: "Base Case", desc: "Default planning scenario" },
                { label: "Downside Case", desc: "Reduced-budget contingency" },
                { label: "Upside Case", desc: "Expanded-budget opportunity" },
                { label: "Stress Test", desc: "Max-stress scenario for governance" },
                { label: "Reforecast Cadence", desc: "Frequency of scenario reforecast" },
              ]) },
            ],
            recommendations: [],
          },
          intake_sheet: {
            type: "intake_sheet",
            title: "Weighted Prioritization — FY27 Intake Sheet",
            subtitle: "Cut line drawn against $28.9M envelope · 47 above · 15 below",
            totalLabel: "62 projects · 15 below cut line",
            showCut: true,
            hideRejected: true,
            cutScore: 73,
            rows: INTAKE_REVIEW_ROWS,
          },
          scenario_comparison: { type: "scenario_comparison", title: "Scenarios", scenarios: [] },
          strategic_framework: { type: "strategic_framework", title: "Strategic Framework" },
        };
        const shell = emptyShells[wantedTypes[0]];
        if (!shell) {
          toast.error(`Couldn't find the latest ${label} canvas yet.`);
          return;
        }
        setActiveArtifact({ ...shell, _variant: "standalone" });
        setArtifactFullScreen(true);
        return;
      }

      let art = match.artifact;
      // Scenarios opened from the left nav show ALL modeled scenarios
      // (e.g. A / B / C) so the user can compare and pick one to Implement.
      setActiveArtifact({ ...art, _variant: "standalone" });
      setArtifactFullScreen(true);
    };
    window.addEventListener("arc:openArtifact", handler as EventListener);

    // Open a workspace-saved artifact directly (carries its own type/variant/title).
    const savedHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { type?: string; title?: string; subtitle?: string; variant?: string } | null;
      if (!detail?.type) return;
      setActiveArtifact({
        type: detail.type,
        title: detail.title || "Saved artifact",
        subtitle: detail.subtitle,
        variant: detail.variant,
        _variant: "standalone",
      });
      setArtifactFullScreen(true);
    };
    window.addEventListener("arc:openSavedArtifact", savedHandler as EventListener);
    // Consume any pending artifact request stashed before navigation.
    // Retry briefly in case extras hydrate after mount.
    const pending = sessionStorage.getItem("arc:pendingArtifact");
    if (pending) {
      sessionStorage.removeItem("arc:pendingArtifact");
      try {
        const detail = JSON.parse(pending);
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("arc:openArtifact", { detail }));
        }, 80);
      } catch {}
    }
    return () => {
      window.removeEventListener("arc:openArtifact", handler as EventListener);
      window.removeEventListener("arc:openSavedArtifact", savedHandler as EventListener);
    };
  }, [extraMessages]);

  // Presenter walkthrough: dropzone or paperclip triggers the scripted upload flow.
  useEffect(() => {
    const handler = () => handleActionClick("__upload_docs__");
    window.addEventListener("arc:upload-docs", handler);
    return () => window.removeEventListener("arc:upload-docs", handler);
  });

  // Widget overflow menu — "Ask with AI" attaches a chip to the input that
  // scopes the next prompt to that widget. Save / Create New Dashboard show
  // a quick toast-like confirmation by reusing existing workspace plumbing.
  useEffect(() => {
    const askHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      setActiveWidgetChip(String(detail.title || "Widget"));
      setTimeout(() => inputRef.current?.focus(), 50);
    };
    window.addEventListener("arc:widget:askAI", askHandler as EventListener);
    return () => window.removeEventListener("arc:widget:askAI", askHandler as EventListener);
  }, []);

  // When a scenario is implemented & baselined, drop a confirmation message
  // into the active conversation thread with Arc-led next steps.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      const key = chatId || "1";
      const scenarioLabel = detail?.label ? String(detail.label) : "Your scenario";
      const baselineMsg = {
        role: "ai",
        inline: {
          type: "plan_baseline_celebration",
          title: "Your plan has been created",
          scenarioLabel,
          body: `${scenarioLabel} is now your baseline and will be used in out-of-the-box reporting. Any changes to your strategic framework will kick off your intake and scenario agents to adjust your plan and all your portfolios.`,
        },
        nextSteps: [
          { icon: "review", label: "Review your Arc Dashboard", detail: "Open the Arc Dashboard to see your baseline plan, funded portfolio, and live capacity & budget signals in one view.", featured: true, featuredNote: "Recommended next step — confirm your baseline is reporting cleanly." },
          { icon: "alert", label: "Set up baseline alerts for budget and capacity drift", detail: "Have Arc notify you the moment a portfolio drifts more than 5% from baseline budget or breaches its capacity guardrail." },
          { icon: "network", label: "Share the baseline with portfolio leads for sign-off", detail: "Send the locked baseline to portfolio owners so each lead can confirm scope, sequencing, and team commitments before kickoff." },
        ],
      };
      setExtraMessages(prev => {
        const existing = prev[key] || [];
        // Avoid double-append if the user clicks Implement & Baseline twice
        const alreadyAppended = existing.some((m: any) =>
          m?.inline?.type === "plan_baseline_celebration"
        );
        if (alreadyAppended) return prev;
        return { ...prev, [key]: [...existing, baselineMsg] };
      });
      scrollToBottom();
    };
    window.addEventListener("arc:planBaselineCreated", handler as EventListener);
    return () => window.removeEventListener("arc:planBaselineCreated", handler as EventListener);
  }, [chatId, setExtraMessages, scrollToBottom]);

  // When a user accepts an inline recommendation chip, handle special-cased
  // ones (e.g. the daily-spend tracking ack) by confirming + replaying the
  // other monitoring signals from the top of the conversation.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      const text = String(detail.text || "");
      if (!/track this budget metric/i.test(text)) return;
      const key = chatId || "1";
      const userEcho = { role: "user", text };
      const confirmation = {
        role: "ai",
        paragraphs: [
          "Done — I'll track the daily burn vs. plan for the next 6 days and ping you the moment the trend slope flips or breaches ±5%.",
          "While we're here, these are the other monitoring signals from this morning's sync worth a look:",
        ],
        statusInline: [
          { s: "red", l: "Portfolio trending $4.6M over budget", n: "23 projects projecting to $38.6M vs $34M planned. Four projects drive 30% of the variance — candidates for a mid-cycle replan.", action: "Dive deeper on the budget issue", agentChip: "risk" },
          { s: "amber", l: "Capacity at 105.6% utilization", n: "266 FTEs active vs 252 planned. Security Analyst, UX Designer, and DevOps Engineer are over-allocated and need rebalancing.", action: "Show me capacity", agentChip: "risk" },
          { s: "amber", l: "2 vendor SLA breaches detected", n: "Sepsis Detection Tool and OR Scheduling vendors missed agreed response windows in the last 7 days. Worth a check-in before the next milestone.", action: "Show vendor health", agentChip: "risk" },
          { s: "info", l: "Replan opportunity: Scenario B shift", n: "Modeling shows resequencing two H2 projects under Scenario B frees ~$1.8M and relieves capacity pressure without missing commitments.", action: "Open scenario comparison", agentChip: "scenario" },
          { s: "info", l: "3 milestones slipped this week", n: "EHR Integration, Patient Portal v2, and OR Scheduling each slipped 4–7 days. Downstream dependencies still hold — but worth a replan check.", action: "Review slipped milestones", agentChip: "reporting" },
        ],
      };
      setExtraMessages(prev => {
        const existing = prev[key] || [];
        const already = existing.some((m: any) =>
          m?.role === "user" && m?.text === text
        );
        if (already) return prev;
        return { ...prev, [key]: [...existing, userEcho] };
      });
      scrollToBottom();
      setTimeout(() => {
        setExtraMessages(prev => {
          const existing = prev[key] || [];
          return { ...prev, [key]: [...existing, confirmation] };
        });
        scrollToBottom();
      }, 700);
    };
    window.addEventListener("arc:recommendation:accept", handler as EventListener);
    return () => window.removeEventListener("arc:recommendation:accept", handler as EventListener);
  }, [chatId, setExtraMessages, scrollToBottom]);

  if (chatId === "5") {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <SmartsheetNav />
        <div className="flex-1 relative min-w-0">
          <FloatingSidebar
            conversations={getDays().map(d => ({ id: d.id, title: d.title, date: "Today", group: ["1","2","3","4"].includes(d.id) ? "original" : "new" }))}
            activeId={chatId || null}
            onSelect={(id) => { navigate(`/projects/${projectId}/chat/${id}`); }}
            onNewChat={() => {
              createUntitledChat();
              navigate(`/projects/${projectId}/chat/untitled`);
            }}
          />
          <div className="h-full min-w-0">
            <Day1Flow onBack={() => navigate(`/projects/${projectId}`)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <SmartsheetNav />
      <div className="flex-1 relative min-w-0">
      <FloatingSidebar
        conversations={getDays().map(d => ({ id: d.id, title: d.title, date: "Today", group: ["1","2","3","4"].includes(d.id) ? "original" : "new" }))}
        activeId={chatId || null}
        onSelect={(id) => {
          navigate(`/projects/${projectId}/chat/${id}`);
          setActiveArtifact(null);
          setArtifactFullScreen(false);
        }}
        onNewChat={() => {
          createUntitledChat();
          navigate(`/projects/${projectId}/chat/untitled`);
          setActiveArtifact(null);
          setArtifactFullScreen(false);
        }}
      />

      <div className="h-full flex flex-col min-w-0">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {!artifactFullScreen && (
          <ResizablePanel id="chat" order={1} defaultSize={activeArtifact ? 50 : 100} minSize={25}>
            <div className="flex flex-col h-full min-w-0 relative">
              <div className="bottom-glow" aria-hidden="true" />
              {/* Conversation header */}
              <div
                className="flex items-center bg-transparent flex-shrink-0 transition-[padding] duration-200 ease-out"
                style={{
                  height: "var(--header-height)",
                  paddingTop: "var(--header-top)",
                  paddingRight: 16,
                  paddingLeft: "var(--content-left-inner)",
                }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-1.5 min-w-0 max-w-full rounded-md px-2 py-1 -mx-2 hover:bg-muted/60 transition-colors group"
                      aria-label="Conversation options"
                    >
                      <span className="text-base font-semibold text-foreground truncate">{currentDay.title}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44 z-50">
                    <DropdownMenuItem onClick={() => toast("Rename conversation")} className="gap-2 cursor-pointer text-[13px]">
                      <Pencil className="w-3.5 h-3.5" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast("Share conversation")} className="gap-2 cursor-pointer text-[13px]">
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast("Conversation deleted")} className="gap-2 cursor-pointer text-[13px] text-destructive focus:text-destructive">
                      <X className="w-3.5 h-3.5" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex-1" />
                <ShareButton
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Share link copied");
                  }}
                  aria-label="Share conversation"
                />

              </div>
              <div
                className="flex-1 overflow-y-auto relative transition-[padding] duration-200 ease-out"
                ref={scrollRef}
                style={{ paddingLeft: "max(0px, calc(var(--content-left-inner) - 32px))" }}
              >
                <div className="max-w-[740px] mx-auto px-8 py-6">
                  {!messages[0]?.greeting && (
                    <div className="mb-8 pt-2">
                      <div className="text-[40px] font-semibold tracking-tight leading-[1.05]" style={{ color: "hsl(233 70% 70%)" }}>Hi there, Mary</div>
                      <h1 className="text-[40px] font-semibold text-foreground tracking-tight leading-[1.05]">Let's start planning.</h1>
                    </div>
                  )}
                  {messages.map((msg: any, i: number) => (
                    <MessageBlock
                      key={`${chatId}-${i}`}
                      msg={msg}
                      onArtifactClick={(a: any) => { setActiveArtifact(a); setArtifactFullScreen(false); setSidebarExpanded(false); }}
                      activeArtifact={activeArtifact}
                      onActionClick={handleActionClick}
                      isLast={i === messages.length - 1}
                      isFirst={i === 0}
                      prevRole={i > 0 ? messages[i - 1].role : undefined}
                    />
                  ))}
                </div>
              </div>

              {/* Input bar */}
              <div
                className="px-8 pt-2 relative z-10 transition-[padding] duration-200 ease-out"
                style={{
                  paddingBottom: "40px",
                  paddingLeft: "max(32px, var(--content-left-inner))",
                }}
              >
                <div className="max-w-[740px] mx-auto">
                  <div
                    className={`rounded-2xl bg-card transition-all ${
                      isInputFocused ? "p-[2px]" : "p-px border border-border/40"
                    }`}
                    style={
                      isInputFocused
                        ? {
                            background: "linear-gradient(135deg, #ACB3FF, #D7DAF7)",
                            boxShadow: "0 6px 24px -8px hsl(0 0% 0% / 0.35), 0 2px 4px -2px hsl(0 0% 0% / 0.2)",
                          }
                        : { boxShadow: "0 4px 16px -8px hsl(0 0% 0% / 0.25)" }
                    }
                  >
                    <div className="rounded-[14px] bg-card px-4 py-4">
                    {activeWidgetChip && (
                      <div className="mb-2 flex items-center gap-1.5 flex-wrap">
                        <div className="inline-flex items-center gap-1.5 h-6 pl-2 pr-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-[11.5px] font-medium">
                          <BarChart3 className="w-3 h-3" strokeWidth={2} />
                          <span className="truncate max-w-[260px]">{activeWidgetChip}</span>
                          <button
                            onClick={() => setActiveWidgetChip(null)}
                            className="w-4 h-4 rounded-full hover:bg-primary/15 flex items-center justify-center transition-colors"
                            aria-label="Remove widget context"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    )}
                    <textarea
                      ref={inputRef as any}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder="What would you like to do?"
                      rows={2}
                      disabled={isStreaming}
                      className={`w-full resize-none bg-transparent text-[14px] leading-[1.5] text-foreground placeholder:text-muted-foreground/60 focus:outline-none ${isInputFocused ? "caret-primary" : "caret-transparent"}`}
                      style={{ minHeight: "52px", maxHeight: "250px" }}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => window.dispatchEvent(new CustomEvent("arc:upload-docs"))}
                          title="Upload documents"
                          className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted/40 transition-all"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                          </svg>
                        </button>
                        <button
                          title="Voice input"
                          className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted/40 transition-all"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="2" width="6" height="12" rx="3" />
                            <path d="M5 10a7 7 0 0 0 14 0" />
                            <line x1="12" y1="19" x2="12" y2="22" />
                          </svg>
                        </button>
                      </div>
                      <button
                        onClick={() => handleSend()}
                        disabled={!inputValue.trim() || isStreaming}
                        className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
                        </svg>
                      </button>
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ResizablePanel>
          )}
          {activeArtifact && (
            <>
              {!artifactFullScreen && <ResizableHandle className="!bg-transparent !w-0" />}
              <ResizablePanel id="artifact" order={2} defaultSize={artifactFullScreen ? 100 : 50} minSize={25}>
                <ArtifactPanel artifact={activeArtifact} fullScreen={artifactFullScreen} variant={activeArtifact?._variant ?? "conversation"} onToggleFullScreen={() => setArtifactFullScreen((v) => !v)} onClose={() => { setActiveArtifact(null); setArtifactFullScreen(false); }} />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
    </div>
  );
};

export default Conversation;
