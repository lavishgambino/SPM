import { useState } from "react";
import { AppLayout } from "@/components/arc/AppLayout";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  LayoutGrid,
  List,
  Columns,
  MoreHorizontal,
  Share2,
  ExternalLink,
  Sparkles,
  FolderKanban,
  Plus,
  Link2,
  Radar,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import avatar1 from "@/assets/avatars/avatar-1.svg";
import avatar2 from "@/assets/avatars/avatar-2.svg";
import avatar3 from "@/assets/avatars/avatar-3.svg";
import avatar4 from "@/assets/avatars/avatar-4.svg";

/* ── Types ─────────────────────────────────────────────── */
type Status = "on-track" | "at-risk" | "off-track" | "planning" | "complete" | "active" | "archived";

interface Project {
  id: string;
  name: string;
  lead: string;
  budget: string;
  risk: "low" | "medium" | "high";
  status: Status;
  kind: "project" | "workspace";
}
interface Portfolio {
  id: string;
  name: string;
  department: string;
  sponsor: string;
  priority: "P0" | "P1" | "P2";
  budget: string;
  risk: string;
  status: Status;
  syncedAgo: string;
  /** Total project count to display in the badge (overrides projects.length when set). */
  projectCount?: number;
  projects: Project[];
}

/* ── Data ──────────────────────────────────────────────── */
const portfolios: Portfolio[] = [
  {
    id: "digital-transformation",
    name: "Digital Transformation",
    department: "CIO / Chief Digital Officer",
    sponsor: "Marcus Webb",
    priority: "P0",
    budget: "$22.0M",
    risk: "$22.0M",
    status: "active",
    syncedAgo: "Today",
    projectCount: 12,
    projects: [
      { id: "dt-1", name: "EHR Platform Core Infrastructure", lead: "Marcus Webb",   budget: "$5.4M", risk: "high",   status: "at-risk",  kind: "project" },
      { id: "dt-2", name: "Clinical Data Warehouse",          lead: "F. Davies",     budget: "$3.2M", risk: "medium", status: "on-track", kind: "workspace" },
      { id: "dt-3", name: "Telehealth Phase 2",               lead: "I. Larsen",     budget: "$2.6M", risk: "medium", status: "at-risk",  kind: "project" },
      { id: "dt-4", name: "Patient Feedback Analytics",       lead: "Y. Cho",        budget: "$2.4M", risk: "low",    status: "on-track", kind: "project" },
      { id: "dt-5", name: "IT Asset Discovery",               lead: "N. Patel",      budget: "$2.6M", risk: "low",    status: "planning", kind: "project" },
      { id: "dt-6", name: "Contract Lifecycle Tool",          lead: "C. Webb",       budget: "$2.0M", risk: "low",    status: "planning", kind: "project" },
      { id: "dt-7", name: "EHR Consolidation Phase 3",        lead: "Marcus Patel",  budget: "$4.2M", risk: "high",   status: "off-track",kind: "project" },
      { id: "dt-8", name: "API Gateway Modernization",        lead: "V. Singh",      budget: "$1.9M", risk: "medium", status: "on-track", kind: "project" },
      { id: "dt-9", name: "Cloud Migration Wave 2",           lead: "B. Kowalski",   budget: "$3.8M", risk: "high",   status: "at-risk",  kind: "project" },
      { id: "dt-10",name: "Identity & Access Modernization",  lead: "Victor Singh",  budget: "$2.6M", risk: "medium", status: "planning", kind: "project" },
      { id: "dt-11",name: "Mobile Clinician Workspace",       lead: "H. Nair",       budget: "$1.7M", risk: "low",    status: "on-track", kind: "workspace" },
      { id: "dt-12",name: "Data Integration Hub",             lead: "F. Davies",     budget: "$2.2M", risk: "medium", status: "planning", kind: "project" },
    ],
  },
  {
    id: "patient-safety",
    name: "Patient Safety",
    department: "Chief Medical Officer",
    sponsor: "Dr. Priya Shah",
    priority: "P0",
    budget: "$8.3M",
    risk: "$8.3M",
    status: "active",
    syncedAgo: "Today",
    projectCount: 10,
    projects: [
      { id: "ps-1", name: "Sepsis Detection Tool",              lead: "Dr. Sarah Chen", budget: "$2.1M", risk: "high",   status: "at-risk",  kind: "project" },
      { id: "ps-2", name: "HAI Surveillance Upgrade",           lead: "M. Patel",       budget: "$1.8M", risk: "medium", status: "on-track", kind: "project" },
      { id: "ps-3", name: "Surgical Safety Checklist Tool",     lead: "S. Nguyen",      budget: "$1.6M", risk: "low",    status: "on-track", kind: "project" },
      { id: "ps-4", name: "Medication Reconciliation Automation",lead: "R. Alvarez",    budget: "$1.6M", risk: "medium", status: "planning", kind: "project" },
      { id: "ps-5", name: "Sepsis Early Warning System (Pilot)",lead: "K. Owens",       budget: "$2.8M", risk: "medium", status: "on-track", kind: "project" },
      { id: "ps-6", name: "Care Coordination Platform",         lead: "Helen Cho",      budget: "$2.0M", risk: "medium", status: "planning", kind: "project" },
      { id: "ps-7", name: "Fall Prevention Program",            lead: "J. Brooks",      budget: "$1.1M", risk: "low",    status: "on-track", kind: "project" },
      { id: "ps-8", name: "Bedside Risk Scoring",               lead: "Dr. Andre Hill", budget: "$1.4M", risk: "medium", status: "at-risk",  kind: "project" },
      { id: "ps-9", name: "Adverse Event Reporting Workspace",  lead: "K. Owens",       budget: "$0.9M", risk: "low",    status: "planning", kind: "workspace" },
      { id: "ps-10",name: "Pediatric Safety Bundle",            lead: "Dr. Priya Shah", budget: "$1.3M", risk: "medium", status: "planning", kind: "project" },
    ],
  },
  {
    id: "operational-excellence",
    name: "Operational Excellence",
    department: "Chief Operating Officer",
    sponsor: "Lisa Torres",
    priority: "P1",
    budget: "$10.4M",
    risk: "$10.4M",
    status: "active",
    syncedAgo: "Yesterday",
    projectCount: 10,
    projects: [
      { id: "oe-1", name: "OR Scheduling System",            lead: "David Chen",     budget: "$2.8M", risk: "medium", status: "on-track", kind: "project" },
      { id: "oe-2", name: "Supply Chain Vendor Consolidation",lead: "L. Hernandez",  budget: "$2.2M", risk: "medium", status: "at-risk",  kind: "project" },
      { id: "oe-3", name: "Outpatient Referral Automation",  lead: "M. Doyle",       budget: "$2.0M", risk: "medium", status: "on-track", kind: "workspace" },
      { id: "oe-4", name: "Revenue Cycle Analytics",         lead: "G. Foster",      budget: "$1.6M", risk: "low",    status: "on-track", kind: "project" },
      { id: "oe-5", name: "Facilities Energy Optimization",  lead: "E. Marquez",     budget: "$1.2M", risk: "low",    status: "planning", kind: "project" },
      { id: "oe-6", name: "ED Throughput Optimization",      lead: "M. Doyle",       budget: "$1.5M", risk: "high",   status: "at-risk",  kind: "project" },
      { id: "oe-7", name: "Bed Management Platform",         lead: "S. Yamada",      budget: "$1.8M", risk: "medium", status: "planning", kind: "project" },
      { id: "oe-8", name: "Specialty Pharmacy Expansion",    lead: "Dr. Henry Liu",  budget: "$2.4M", risk: "medium", status: "on-track", kind: "project" },
      { id: "oe-9", name: "Centralized Scheduling Automation",lead: "L. Hernandez", budget: "$1.4M", risk: "medium", status: "planning", kind: "project" },
      { id: "oe-10",name: "Procurement Analytics Workspace", lead: "Karen Mosley",   budget: "$0.9M", risk: "low",    status: "on-track", kind: "workspace" },
    ],
  },
  {
    id: "workforce-resilience",
    name: "Workforce Resilience",
    department: "Chief Nursing Officer",
    sponsor: "Sarah Kim",
    priority: "P1",
    budget: "$3.8M",
    risk: "$3.8M",
    status: "active",
    syncedAgo: "2 days ago",
    projectCount: 7,
    projects: [
      { id: "wr-1", name: "Staff Retention Analytics",      lead: "Rachel Kim",  budget: "$2.1M", risk: "medium", status: "at-risk",  kind: "project" },
      { id: "wr-2", name: "Leadership Development Track",   lead: "P. Chen",     budget: "$1.7M", risk: "low",    status: "planning", kind: "project" },
      { id: "wr-3", name: "Nursing Float Pool Platform",    lead: "Megan Liu",   budget: "$1.4M", risk: "medium", status: "on-track", kind: "project" },
      { id: "wr-4", name: "Ambient Documentation Pilot",    lead: "H. Nair",     budget: "$1.1M", risk: "low",    status: "planning", kind: "project" },
      { id: "wr-5", name: "Staff Scheduling App",           lead: "Rachel Kim",  budget: "$0.8M", risk: "medium", status: "at-risk",  kind: "project" },
      { id: "wr-6", name: "Workforce Wellbeing Program",    lead: "D. Okafor",   budget: "$0.9M", risk: "low",    status: "on-track", kind: "project" },
      { id: "wr-7", name: "Internal Mobility Workspace",    lead: "Janelle Brooks", budget: "$0.7M", risk: "low", status: "planning", kind: "workspace" },
    ],
  },
  {
    id: "clinical-quality",
    name: "Clinical Quality",
    department: "Chief Quality Officer",
    sponsor: "Dr. Elena Marsh",
    priority: "P0",
    budget: "$2.8M",
    risk: "$2.8M",
    status: "active",
    syncedAgo: "Today",
    projectCount: 6,
    projects: [
      { id: "cq-1", name: "Sepsis Early Warning System (Pilot)", lead: "Dr. Elena Marsh", budget: "$2.8M", risk: "medium", status: "on-track", kind: "project" },
      { id: "cq-2", name: "Clinical Pathway Standardization",    lead: "S. Nguyen",        budget: "$1.5M", risk: "medium", status: "at-risk",  kind: "project" },
      { id: "cq-3", name: "Quality Reporting Workspace",         lead: "J. Brooks",        budget: "$1.2M", risk: "low",    status: "on-track", kind: "workspace" },
      { id: "cq-4", name: "Discharge Planning Optimization",     lead: "R. Alvarez",       budget: "$1.6M", risk: "medium", status: "planning", kind: "project" },
      { id: "cq-5", name: "Post-Discharge Follow-up",            lead: "K. Owens",         budget: "$1.0M", risk: "low",    status: "planning", kind: "project" },
      { id: "cq-6", name: "Mortality Review Dashboard",          lead: "Dr. Elena Marsh",  budget: "$0.9M", risk: "low",    status: "on-track", kind: "project" },
    ],
  },
];

/* ── Pastel chip palette (matches Browse chip designs) ── */
const statusStyles: Record<Status, { label: string; bg: string; fg: string }> = {
  "on-track":  { label: "On track",  bg: "#B9F4C3", fg: "#042F0A" }, // green
  "at-risk":   { label: "At risk",   bg: "#FDE6AF", fg: "#322301" }, // amber
  "off-track": { label: "Off track", bg: "#FFE0E3", fg: "#570006" }, // pink
  planning:    { label: "Planning",  bg: "#E5E7F0", fg: "#212536" }, // neutral
  complete:    { label: "Complete",  bg: "#E2E4FA", fg: "#1A1F66" }, // indigo
  active:      { label: "Active",    bg: "#D6F5DD", fg: "#0B3D17" }, // mint green
  archived:    { label: "Archived",  bg: "#ECEDF2", fg: "#5A5F73" }, // gray
};

/* ── Deterministic helpers (Owner / Due / % / Updated) ── */
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
const OWNERS = [
  "Dr. Elena Marsh", "T. Whitfield", "A. Rivera", "G. Foster", "R. Adeyemi",
  "M. Greene", "M. Patel", "S. Nguyen", "L. Hernandez", "P. Chen",
  "V. Kapoor", "I. Larsen", "C. Webb", "J. Brooks", "K. Owens",
];
function ownerFor(id: string, fallback?: string) {
  return fallback ?? OWNERS[hash(id) % OWNERS.length];
}
function dueFor(id: string) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const h = hash(id + "due");
  return `${months[h % 12]} ${(h % 27) + 1}, 2026`;
}
function percentFor(id: string, status: Status) {
  const base = hash(id + "pct") % 100;
  if (status === "complete") return 100;
  if (status === "planning") return Math.min(20, base % 20);
  if (status === "off-track") return 10 + (base % 35);
  if (status === "at-risk") return 30 + (base % 40);
  return 45 + (base % 45);
}
function updatedFor(id: string) {
  const opts = ["2m ago", "12m ago", "1h ago", "3h ago", "Yesterday", "2d ago", "5d ago"];
  return opts[hash(id + "upd") % opts.length];
}

/* Generate filler projects so the expanded list matches `projectCount`. */
const FILLER_NAMES = [
  "Workflow automation initiative", "Data quality remediation", "Vendor consolidation review",
  "Compliance audit readiness", "Stakeholder alignment workshop", "Capacity planning model",
  "Risk register refresh", "Integration platform upgrade", "Dashboard rationalization",
  "Change management rollout", "Reporting standardization", "Service catalog cleanup",
  "Training program rollout", "Pilot evaluation report", "KPI framework redesign",
  "Cost optimization analysis", "Resource allocation review", "Process mining assessment",
  "Knowledge base migration", "Tooling consolidation", "Roadmap refinement",
  "Operating model review", "Benchmarking study", "Maturity assessment",
];
const FILLER_STATUSES: Status[] = ["on-track", "at-risk", "planning", "off-track", "complete"];
const FILLER_RISKS: Project["risk"][] = ["low", "medium", "high"];

function expandedProjects(p: Portfolio): Project[] {
  const target = p.projectCount ?? p.projects.length;
  if (p.projects.length >= target) return p.projects.slice(0, target);
  const extras: Project[] = [];
  const need = target - p.projects.length;
  for (let i = 0; i < need; i++) {
    const seed = hash(p.id + "filler" + i);
    const name = FILLER_NAMES[seed % FILLER_NAMES.length];
    const status = p.status === "archived" ? "complete" : FILLER_STATUSES[seed % FILLER_STATUSES.length];
    const risk = FILLER_RISKS[seed % FILLER_RISKS.length];
    const budget = `$${(0.4 + (seed % 35) / 10).toFixed(1)}M`;
    extras.push({
      id: `${p.id}-f${i}`,
      name,
      lead: OWNERS[seed % OWNERS.length],
      budget,
      risk,
      status,
      kind: seed % 5 === 0 ? "workspace" : "project",
    });
  }
  return [...p.projects, ...extras];
}

function StatusChip({ status }: { status: Status }) {
  const s = statusStyles[status];
  return (
    <span
      className="inline-flex items-center justify-center h-7 text-xs font-semibold px-3 rounded-[8px] whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      {s.label}
    </span>
  );
}

/* Generic pastel chip — reusable across the app */
export const chipStyles = {
  amber:   { bg: "#FDE6AF", fg: "#322301" },
  green:   { bg: "#B9F4C3", fg: "#042F0A" },
  pink:    { bg: "#FFE0E3", fg: "#570006" },
  blue:    { bg: "#D6E6FF", fg: "#0B2B66" },
  indigo:  { bg: "#E2E4FA", fg: "#1A1F66" },
  neutral: { bg: "#E5E7F0", fg: "#212536" },
} as const;

/* Owner pill: avatar image + name in a soft rounded chip */
const AVATAR_IMAGES = [avatar1, avatar2, avatar3, avatar4];

function OwnerChip({ name }: { name: string }) {
  const src = AVATAR_IMAGES[hash(name) % AVATAR_IMAGES.length];
  return (
    <span className="inline-flex items-center gap-1.5 h-7 pl-1 pr-2.5 rounded-full bg-muted/60 max-w-full">
      <img
        src={src}
        alt=""
        aria-hidden
        className="h-5 w-5 rounded-full shrink-0 object-cover"
      />
      <span className="text-xs font-medium text-foreground truncate">{name}</span>
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden min-w-[40px]">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums shrink-0 w-9 text-right">{value}%</span>
    </div>
  );
}

/* ── Duotone icons ─────────────────────────────────────── */
function PortfolioIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M4.8 11.7c0-.36.29-.65.65-.65.38 0 .68-.32.65-.7L5.85 6.6c-.08-1.17.97-2.1 2.13-1.89l8.54 1.58c.79.15 1.38.8 1.46 1.6l.27 2.73c.02.24.23.43.47.43.26 0 .47.21.47.47v5.83c0 .99-.8 1.8-1.8 1.8H6.6c-.99 0-1.8-.81-1.8-1.8V11.7Z" fill="#86E4D1"/>
      <path d="M8.61 5.28h-.81c-.73 0-1.32.59-1.32 1.32v4.68H4.8V6.6c0-1.66 1.34-3 3-3h.81c.64 0 1.27.2 1.79.58.52.37 1.14.57 1.79.57h4c1.66 0 3 1.35 3 3v3.53h-1.68V7.75c0-.73-.59-1.32-1.32-1.32h-4c-.99 0-1.96-.31-2.77-.9-.23-.16-.51-.25-.8-.25Z" fill="#0F6151"/>
      <path d="M8.61 7.94H7.8c-.73 0-1.32.59-1.32 1.32v2.14H4.8V9.26c0-1.66 1.34-3 3-3h.81c.64 0 1.27.2 1.79.58.52.37 1.14.57 1.79.57h4c1.66 0 3 1.35 3 3v.99h-1.68V9.41c0-.73-.59-1.32-1.32-1.32h-4c-.99 0-1.96-.31-2.77-.9-.23-.16-.51-.25-.8-.25Z" fill="#0F6151"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M17.4 11.65H6.6c-.73 0-1.32.59-1.32 1.32v4.43c0 .73.59 1.32 1.32 1.32h10.8c.73 0 1.32-.59 1.32-1.32v-4.43c0-.73-.59-1.32-1.32-1.32ZM6.6 9.97c-1.66 0-3 1.34-3 3v4.43c0 1.66 1.34 3 3 3h10.8c1.66 0 3-1.34 3-3v-4.43c0-1.66-1.34-3-3-3H6.6Z" fill="#0F6151"/>
      <path d="M9.6 14c0-.44.36-.8.8-.8h3.2c.44 0 .8.36.8.8 0 .44-.36.8-.8.8h-3.2c-.44 0-.8-.36-.8-.8Z" fill="#0F6151"/>
    </svg>
  );
}
function WorkspaceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M4.8 8.4C4.8 7.07 5.87 6 7.2 6h1.67c.47 0 .94.14 1.33.4l.59.4c.4.26.86.4 1.33.4h4.68c1.33 0 2.4 1.07 2.4 2.4v6c0 1.32-1.07 2.4-2.4 2.4H7.2c-1.33 0-2.4-1.08-2.4-2.4V8.4Z" fill="#98DCF1"/>
      <path d="M11.99 18.72c-1.63 0-3.27.01-4.9 0-1.65-.02-3.13-1.29-3.42-2.91-.04-.25-.07-.5-.07-.75 0-2.04 0-4.08 0-6.12 0-1.8 1.19-3.25 2.95-3.6.17-.04.34-.06.51-.06.44 0 .89-.02 1.33 0 .71.04 1.34.32 1.92.74.33.25.7.43 1.12.5.13.02.25.03.38.03 1.7 0 3.4-.01 5.1 0 1.66.01 3.13 1.27 3.43 2.89.04.25.07.5.07.74.01 1.65 0 3.29 0 4.94 0 1.79-1.36 3.34-3.14 3.55-.17.02-.34.03-.51.03-1.59 0-3.18 0-4.77 0Zm0-1.68c.91 0 1.81 0 2.72 0 .71 0 1.42.01 2.13 0 1.06-.03 1.87-.88 1.87-1.93 0-1.65 0-3.29 0-4.94 0-1.08-.86-1.93-1.94-1.93-1.64 0-3.27 0-4.91 0-.61.01-1.21-.1-1.76-.37-.32-.16-.62-.37-.93-.57-.29-.18-.59-.31-.93-.32-.38-.02-.75-.03-1.13-.01-1.04.06-1.83.88-1.83 1.9 0 2.09 0 4.18 0 6.27 0 .32.07.62.23.9.39.68.98 1 1.76 1.01 1.58 0 3.16-.01 4.74-.01Z" fill="#0B5C75"/>
      <path d="M9.72 16c-.72 0-1.44 0-2.17 0-.39 0-.6-.22-.59-.6 0-.07 0-.14.02-.2.17-1.05.95-1.77 2.02-1.81.52-.03 1.05-.02 1.58 0 1.04.06 1.92 1.03 1.9 2.08-.01.31-.24.53-.57.53-.49.01-.97.01-1.46.01h-.73Z" fill="#0B5C75"/>
      <path d="M11.06 12c-.94-.01-1.7-.78-1.69-1.71.01-.94.78-1.7 1.71-1.69.94.01 1.7.78 1.69 1.72-.01.94-.78 1.69-1.71 1.68Z" fill="#0B5C75"/>
    </svg>
  );
}

/* ── Inline action button ─────────────────────────────── */
function InlineAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Share2;
  label: string;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          aria-label={label}
          className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          <Icon className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

function RowMenu({ label, type }: { label: string; type: "portfolio" | "project" }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onClick={(e) => e.stopPropagation()}
        className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        aria-label="More actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal truncate">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => toast.success(`Opened in Arc conversation`)}>
          <Sparkles className="h-4 w-4 mr-2" /> Open in AI conversation
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.success(`Duplicated ${label}`)}>
          <FolderKanban className="h-4 w-4 mr-2" /> Duplicate {type}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => toast.success(`Archived ${label}`)}>
          Archive {type}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ── Page ──────────────────────────────────────────────── */
type TabKey = "all" | "portfolios" | "programs" | "projects";
type ViewKey = "grid" | "list" | "split";

export default function Portfolios() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<TabKey>("all");
  const [view, setView] = useState<ViewKey>("split");
  const [sort, setSort] = useState<"alpha" | "recent" | "owner">("alpha");
  // Portfolios are connected via the conversational flow; always show populated view.
  const hasPortfolios = true;
  const scanning = false;
  const runScan = () => {};

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const open = (label: string) => toast.success(`Opening ${label}`);
  const share = (label: string) => toast.success(`Share link copied for ${label}`);

  const sorted = [...portfolios].sort((a, b) =>
    sort === "alpha" ? a.name.localeCompare(b.name) : 0
  );

  // Grid: chevron | name | status | owner | due | %complete | updated | actions
  const gridColsDefault =
    "grid-cols-[40px_minmax(280px,2.2fr)_minmax(120px,1fr)_minmax(160px,1.2fr)_minmax(130px,1fr)_minmax(110px,0.7fr)_minmax(160px,1.4fr)_140px]";
  // Projects tab adds a Portfolio column after Name
  const gridColsProjects =
    "grid-cols-[40px_minmax(240px,1.8fr)_minmax(160px,1.2fr)_minmax(120px,1fr)_minmax(160px,1.2fr)_minmax(130px,1fr)_minmax(110px,0.7fr)_minmax(160px,1.4fr)_140px]";
  const gridCols = tab === "projects" ? gridColsProjects : gridColsDefault;

  const tabs: { key: TabKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "portfolios", label: "Portfolios" },
    { key: "programs", label: "Programs" },
    { key: "projects", label: "Projects" },
  ];

  const sortLabel = sort === "alpha" ? "Alphabetical" : sort === "recent" ? "Recently updated" : "Owner";

  const titleIcon = (
    <div
      className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: "#A5A3F5", color: "#FFFFFF" }}
    >
      <FolderKanban className="w-4 h-4" strokeWidth={1.75} />
    </div>
  );

  const headerTrailing = hasPortfolios ? (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-1.5 h-7 px-3 rounded-lg",
          "bg-[#4644D8] text-white text-[13px] font-semibold leading-none",
          "hover:bg-[#3D3BC4] active:bg-[#3633B0] transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-[#4644D8]/40",
        )}
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Add portfolio</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Add a portfolio
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => toast.success("Create new portfolio")}>
          <FolderKanban className="h-4 w-4 mr-2" />
          <div className="flex flex-col">
            <span className="text-sm">Create new portfolio</span>
            <span className="text-[11px] text-muted-foreground">Start from a blank portfolio</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.success("Connect existing portfolio")}>
          <Link2 className="h-4 w-4 mr-2" />
          <div className="flex flex-col">
            <span className="text-sm">Connect existing portfolio</span>
            <span className="text-[11px] text-muted-foreground">Link from Smartsheet workspace</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null;

  return (
    <AppLayout title="Portfolios" titleIcon={titleIcon} headerTrailing={headerTrailing}>
      <TooltipProvider delayDuration={150}>
        <div className="space-y-4 max-w-[1200px] mx-auto">

          {!hasPortfolios ? (
            <EmptyPortfoliosState scanning={scanning} onScan={runScan} />
          ) : (
            <>
          {/* Tabs + view toggle row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {tabs.map((t) => {
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={cn(
                      "px-4 h-9 rounded-full text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1">
              <ViewBtn icon={LayoutGrid} active={view === "grid"} onClick={() => setView("grid")} label="Grid view" />
              <ViewBtn icon={List} active={view === "list"} onClick={() => setView("list")} label="List view" />
              <ViewBtn icon={Columns} active={view === "split"} onClick={() => setView("split")} label="Split view" />
            </div>
          </div>

          {/* Sort row */}
          <div className="px-1">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground h-8 px-2 rounded-md hover:bg-muted/50 transition-colors">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span>{sortLabel}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => setSort("alpha")}>Alphabetical</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSort("recent")}>Recently updated</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSort("owner")}>Owner</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Column headers */}
          <div
            className={cn(
              "grid gap-4 items-center px-2 pb-2 border-b border-border/60",
              gridCols
            )}
          >
            <div />
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Name</div>
            {tab === "projects" && (
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Portfolio</div>
            )}
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Owner</div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Due date</div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">% Complete</div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Last updated</div>
            <div />
          </div>

          {/* List — behavior depends on active tab */}
          <div className="divide-y divide-border/60">
            {tab === "projects" ? (
              // Flat list of all projects/workspaces across portfolios
              sorted.flatMap((p) =>
                expandedProjects(p).map((proj) => {
                  const projPct = percentFor(proj.id, proj.status);
                  return (
                    <div
                      key={proj.id}
                      onClick={() => open(proj.name)}
                      className={cn(
                        "grid gap-4 items-center py-3 px-2 hover:bg-muted/30 transition-colors cursor-pointer group rounded-md",
                        gridCols
                      )}
                    >
                      <div />
                      <div className="flex items-center gap-2.5 min-w-0">
                        <WorkspaceIcon className="h-5 w-5 shrink-0" />
                        <span className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {proj.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <PortfolioIcon className="h-4 w-4 shrink-0" />
                        <span className="text-sm text-foreground/80 truncate">{p.name}</span>
                      </div>
                      <div><StatusChip status={proj.status} /></div>
                      <div className="min-w-0"><OwnerChip name={ownerFor(proj.id, proj.lead)} /></div>
                      <div className="text-sm text-foreground/80 truncate tabular-nums">{dueFor(proj.id)}</div>
                      <div><ProgressBar value={projPct} /></div>
                      <div className="text-xs text-muted-foreground truncate">{updatedFor(proj.id)}</div>
                      <div className="flex items-center justify-end gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                        <InlineAction icon={Share2} label="Share" onClick={() => share(proj.name)} />
                        <InlineAction icon={ExternalLink} label="Open" onClick={() => open(proj.name)} />
                        <InlineAction icon={Sparkles} label="Open in AI" onClick={() => toast.success(`Opened in Arc conversation`)} />
                        <RowMenu label={proj.name} type="project" />
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              sorted.map((p) => {
                const isOpen = tab === "all" && expanded.has(p.id);
                const showChevron = tab === "all";
                const pPct = percentFor(p.id, p.status);
                return (
                  <div key={p.id}>
                    {/* Portfolio row */}
                    <div
                      onClick={() => showChevron ? toggle(p.id) : open(p.name)}
                      className={cn(
                        "grid gap-4 items-center py-3 px-2 hover:bg-muted/30 transition-colors cursor-pointer group rounded-md",
                        gridCols
                      )}
                    >
                      <div className="flex justify-center">
                        {showChevron && (
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform",
                              isOpen && "rotate-90"
                            )}
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <PortfolioIcon className="h-5 w-5 shrink-0" />
                        <button
                          onClick={(e) => { e.stopPropagation(); open(p.name); }}
                          className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate text-left"
                        >
                          {p.name}
                        </button>
                        <span className="inline-flex items-center text-[11px] px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground shrink-0">
                          {p.projectCount ?? p.projects.length}
                        </span>
                      </div>
                      <div><StatusChip status={p.status} /></div>
                      <div className="min-w-0"><OwnerChip name={p.sponsor} /></div>
                      <div className="text-sm text-foreground/80 truncate tabular-nums">{dueFor(p.id)}</div>
                      <div><ProgressBar value={pPct} /></div>
                      <div className="text-xs text-muted-foreground truncate">{p.syncedAgo}</div>
                      <div className="flex items-center justify-end gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                        <InlineAction icon={Share2} label="Share" onClick={() => share(p.name)} />
                        <InlineAction icon={ExternalLink} label="Open" onClick={() => open(p.name)} />
                        <InlineAction icon={Sparkles} label="Open in AI" onClick={() => toast.success(`Opened in Arc conversation`)} />
                        <RowMenu label={p.name} type="portfolio" />
                      </div>
                    </div>

                    {/* Expanded children — only in 'all' view */}
                    {isOpen && (
                      <div className="divide-y divide-border/60">
                        {expandedProjects(p).map((proj) => {
                          const projPct = percentFor(proj.id, proj.status);
                          return (
                            <div
                              key={proj.id}
                              onClick={() => open(proj.name)}
                              className={cn(
                                "grid gap-4 items-center py-2.5 px-2 hover:bg-muted/30 transition-colors cursor-pointer group rounded-md",
                                gridCols
                              )}
                            >
                              <div />
                              <div className="flex items-center gap-2.5 min-w-0 pl-6">
                                <WorkspaceIcon className="h-5 w-5 shrink-0" />
                                <span className="text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                  {proj.name}
                                </span>
                              </div>
                              <div><StatusChip status={proj.status} /></div>
                              <div className="min-w-0"><OwnerChip name={ownerFor(proj.id, proj.lead)} /></div>
                              <div className="text-xs text-foreground/80 truncate tabular-nums">{dueFor(proj.id)}</div>
                              <div><ProgressBar value={projPct} /></div>
                              <div className="text-xs text-muted-foreground truncate">{updatedFor(proj.id)}</div>
                              <div className="flex items-center justify-end gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                                <InlineAction icon={Share2} label="Share" onClick={() => share(proj.name)} />
                                <InlineAction icon={ExternalLink} label="Open" onClick={() => open(proj.name)} />
                                <InlineAction icon={Sparkles} label="Open in AI" onClick={() => toast.success(`Opened in Arc conversation`)} />
                                <RowMenu label={proj.name} type="project" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
            </>
          )}
        </div>
      </TooltipProvider>
    </AppLayout>
  );
}


/* ── View toggle button ───────────────────────────────── */
function ViewBtn({
  icon: Icon,
  active,
  onClick,
  label,
}: {
  icon: typeof LayoutGrid;
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "h-9 w-9 inline-flex items-center justify-center rounded-md transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

/* ── Empty state: no portfolios connected ─────────────── */
function EmptyPortfoliosState({
  scanning,
  onScan,
}: {
  scanning: boolean;
  onScan: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm p-12 flex flex-col items-center text-center">
      <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
        <FolderKanban className="h-7 w-7" />
      </div>
      <h2 className="text-lg font-semibold text-foreground tracking-tight">
        No portfolios connected yet
      </h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-md">
        Arc can scan your connected Smartsheet workspace to discover active portfolios,
        programs, and projects, then bring them in as a starting point.
      </p>

      <div className="flex items-center gap-2 mt-6">
        <button
          onClick={onScan}
          disabled={scanning}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70"
        >
          {scanning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Scanning…
            </>
          ) : (
            <>
              <Radar className="h-4 w-4" />
              Scan for portfolios
            </>
          )}
        </button>
        <button
          onClick={() => toast.success("Create new portfolio")}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-border text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add manually
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground mt-5">
        Scans are read-only — nothing is modified in Smartsheet.
      </p>
    </div>
  );
}
