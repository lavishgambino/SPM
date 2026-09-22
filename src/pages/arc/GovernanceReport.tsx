import { useState, KeyboardEvent } from "react";
import { AppLayout } from "@/components/arc/AppLayout";
import { demandInitiatives, arcSeed } from "@/config/arcData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Send, Check, ShieldCheck, GripVertical, Trash2, Plus, ChevronDown, ChevronRight,
  ListChecks, Calendar, RefreshCw, User, Tag, FileWarning, AlertTriangle, Pencil, Lock, X, Zap,
} from "lucide-react";
import { toast } from "sonner";
import { WidgetMenu } from "@/components/arc/WidgetMenu";

const COMPLIANCE_STATUSES = ["Compliant", "Partially Compliant", "Non-Compliant", "Pending Review"] as const;
const MISSING_FIELDS = ["Budget actuals", "Risk register", "Status update", "Milestone dates", "Resource allocation", "Sponsor sign-off", "RAID log", "Benefits tracker"];

function generateRows() {
  return demandInitiatives.slice(0, 30).map((proj) => {
    const r = (idx: number) => arcSeed(proj.id, idx);
    const compIdx = Math.floor(r(0) * COMPLIANCE_STATUSES.length);
    const missingCount = Math.floor(r(1) * 4);
    const missing: string[] = [];
    for (let m = 0; m < missingCount; m++) {
      const field = MISSING_FIELDS[Math.floor(r(m + 2) * MISSING_FIELDS.length)];
      if (!missing.includes(field)) missing.push(field);
    }
    const daysSince = Math.floor(r(10) * 45);
    const now = new Date(2027, 2, 20);
    const lastDate = new Date(now);
    lastDate.setDate(lastDate.getDate() - daysSince);
    return {
      id: proj.id, name: proj.name, portfolio: proj.department,
      complianceStatus: COMPLIANCE_STATUSES[compIdx],
      fieldsMissing: missing,
      lastUpdated: lastDate.toISOString().split("T")[0],
      daysSinceUpdate: daysSince,
      reminderSent: r(11) > 0.7,
      priority: proj.priority, riskLevel: proj.riskLevel,
      sponsor: proj.projectSponsor, manager: proj.projectManager,
      budget: proj.estimatedTotalBudget,
    };
  }).sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate);
}

const pillBase = "text-xs font-semibold px-2.5 py-1 rounded-lg inline-block border";
const pill = (v: string) => {
  if (["Critical", "High", "Non-Compliant"].includes(v)) return cn(pillBase, "bg-destructive/10 text-destructive border-destructive/20");
  if (["Medium", "Partially Compliant", "Pending Review"].includes(v)) return cn(pillBase, "bg-warning/10 text-warning border-warning/20");
  return cn(pillBase, "bg-success/10 text-success border-success/20");
};

type FieldType = "Dropdown" | "Date" | "Text" | "Taxonomy" | "Number" | "User";
type GovField = {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  type: FieldType;
  required: boolean;
  isDefault: boolean;
  enabled: boolean;
  values?: string[];
  expanded?: boolean;
  structural?: boolean;
};

const INITIAL_FIELDS: GovField[] = [
  { id: "f1", name: "Compliance Status", icon: ShieldCheck, type: "Dropdown", required: true, isDefault: true, enabled: true },
  { id: "f2", name: "Data Freshness Threshold", icon: Calendar, type: "Number", required: true, isDefault: true, enabled: true },
  { id: "f3", name: "Review Frequency", icon: RefreshCw, type: "Dropdown", required: false, isDefault: true, enabled: true },
  { id: "f4", name: "Responsible Owner", icon: User, type: "User", required: true, isDefault: true, enabled: true },
  {
    id: "f5", name: "Risk Category", icon: Tag, type: "Taxonomy",
    required: true, isDefault: true, enabled: true, expanded: true, structural: true,
    values: ["RAID log", "Sponsor sign-off", "Benefits tracker", "Status update", "Risk register"],
  },
  { id: "f6", name: "Missing Fields Policy", icon: FileWarning, type: "Dropdown", required: false, isDefault: true, enabled: true },
  { id: "f7", name: "Escalation Path", icon: AlertTriangle, type: "Text", required: false, isDefault: true, enabled: false },
];

type Rule = {
  id: string;
  name: string;
  dotClass: string;
  conditions: string[];
  action: string;
  actionTone: "warning" | "destructive" | "primary";
};

const INITIAL_RULES: Rule[] = [
  {
    id: "r1", name: "Tier 1 — Auto-Flag", dotClass: "bg-warning",
    conditions: ["Days Since Update > 14", "Missing Fields > 2"],
    action: "Flag as Non-Compliant", actionTone: "warning",
  },
  {
    id: "r2", name: "Tier 2 — Escalate to Sponsor", dotClass: "bg-destructive",
    conditions: ["Days Since Update > 30", "Risk = High"],
    action: "Send Reminder & Notify Sponsor", actionTone: "destructive",
  },
];

export default function GovernanceReport() {
  const [rows] = useState(generateRows);
  const [sentReminders, setSentReminders] = useState<Set<string>>(new Set());
  const [fields, setFields] = useState<GovField[]>(INITIAL_FIELDS);
  const [rules] = useState<Rule[]>(INITIAL_RULES);
  const [newValue, setNewValue] = useState("");

  const sendReminder = (id: string) => {
    setSentReminders((prev) => new Set(prev).add(id));
    toast.success(`Reminder sent to PM for ${id}`);
  };

  const toggleField = (id: string) =>
    setFields((f) => f.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x)));
  const toggleExpand = (id: string) =>
    setFields((f) => f.map((x) => (x.id === id ? { ...x, expanded: !x.expanded } : x)));
  const removeField = (id: string) => {
    setFields((f) => f.filter((x) => x.id !== id));
    toast.success("Field removed");
  };
  const addField = () => {
    const id = `f${Date.now()}`;
    setFields((f) => [...f, { id, name: "Untitled Field", icon: ListChecks, type: "Text", required: false, isDefault: false, enabled: true }]);
    toast.success("Field added");
  };
  const removeValue = (fieldId: string, val: string) =>
    setFields((f) => f.map((x) => (x.id === fieldId ? { ...x, values: (x.values || []).filter((v) => v !== val) } : x)));
  const addValue = (fieldId: string) => {
    if (!newValue.trim()) return;
    setFields((f) => f.map((x) => (x.id === fieldId ? { ...x, values: [...(x.values || []), newValue.trim()] } : x)));
    setNewValue("");
  };
  const onValueKey = (e: KeyboardEvent<HTMLInputElement>, fieldId: string) => {
    if (e.key === "Enter") { e.preventDefault(); addValue(fieldId); }
  };

  const compliantCount = rows.filter((r) => r.complianceStatus === "Compliant").length;
  const partialCount = rows.filter((r) => r.complianceStatus === "Partially Compliant").length;
  const nonCompliantCount = rows.filter((r) => r.complianceStatus === "Non-Compliant").length;
  const overdueCount = rows.filter((r) => r.daysSinceUpdate > 14).length;

  const sectionLabel = "text-[11px] uppercase tracking-wider font-semibold text-muted-foreground";
  const metaPill = "text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded border";

  return (
    <AppLayout title="Blueprints">
      <div className="space-y-6 max-w-[1530px] mx-auto">
        {/* KPI Summary */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex items-center gap-6 lg:pr-8 lg:border-r-2 border-border">
              <div className="text-display text-foreground">{compliantCount}<span className="text-3xl text-muted-foreground font-semibold">/{rows.length}</span></div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-success" /><span className="text-headline text-foreground">Fully Compliant</span></div>
                <span className="text-caption text-muted-foreground">Projects with complete, up-to-date data</span>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-secondary/50 rounded-lg p-4 border border-border"><span className="text-caption font-medium text-muted-foreground block mb-1">Compliant</span><span className="text-title text-success">{compliantCount}</span></div>
              <div className="bg-secondary/50 rounded-lg p-4 border border-border"><span className="text-caption font-medium text-muted-foreground block mb-1">Partial</span><span className="text-title text-warning">{partialCount}</span></div>
              <div className="bg-secondary/50 rounded-lg p-4 border border-border"><span className="text-caption font-medium text-muted-foreground block mb-1">Non-Compliant</span><span className="text-title text-destructive">{nonCompliantCount}</span></div>
              <div className="bg-secondary/50 rounded-lg p-4 border border-border"><span className="text-caption font-medium text-muted-foreground block mb-1">Overdue (&gt;14d)</span><span className="text-title text-foreground">{overdueCount}</span></div>
            </div>
          </div>
        </div>

        {/* Governance Fields */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary border border-border"><ListChecks className="h-4 w-4 text-foreground" /></div>
              <div>
                <h3 className="text-headline text-foreground">Governance Fields</h3>
                <p className="text-caption text-muted-foreground mt-0.5">Configure the fields tracked for governance & data quality across all projects.</p>
              </div>
            </div>
            <span className="text-caption text-muted-foreground">{fields.filter(f => f.enabled).length} of {fields.length} enabled</span>
          </div>

          <div className="mt-5 space-y-2">
            {fields.map((field) => {
              const Icon = field.icon;
              const isExpandable = field.type === "Taxonomy";
              return (
                <div key={field.id} className={cn("rounded-lg border border-border bg-background/40 transition-colors", !field.enabled && "opacity-60")}>
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <GripVertical className="h-4 w-4 text-muted-foreground/60 cursor-grab shrink-0" />
                    <Switch checked={field.enabled} onCheckedChange={() => toggleField(field.id)} />
                    {isExpandable ? (
                      <button onClick={() => toggleExpand(field.id)} className="text-muted-foreground hover:text-foreground">
                        {field.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    ) : (
                      <span className="w-4" />
                    )}
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm font-medium text-foreground">{field.name}</span>
                    <div className="flex items-center gap-1.5">
                      {field.isDefault && <span className={cn(metaPill, "bg-secondary/50 text-muted-foreground border-border")}>Default</span>}
                      {field.required && <span className={cn(metaPill, "bg-destructive/10 text-destructive border-destructive/20")}>Required</span>}
                    </div>
                    <div className="flex-1" />
                    <span className="text-caption text-muted-foreground">{field.type}</span>
                    <button onClick={() => removeField(field.id)} className="text-muted-foreground/60 hover:text-destructive p-1 rounded">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {isExpandable && field.expanded && (
                    <div className="border-t border-border/60 px-3 py-3 space-y-3 bg-muted/20">
                      <div className="flex items-center gap-2 px-1">
                        <Lock className="h-3 w-3 text-muted-foreground" />
                        <span className={sectionLabel}>Structural Label</span>
                        <span className="text-sm text-foreground">{field.name}</span>
                        <span className="ml-auto text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded border bg-primary/10 text-primary border-primary/20">Arc-owned</span>
                      </div>
                      <div className="rounded-md border border-border bg-card p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={sectionLabel}>Configurable Values</span>
                          <span className="text-caption text-muted-foreground">{(field.values || []).length} values</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(field.values || []).map((v) => (
                            <span key={v} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                              {v}
                              <button onClick={() => removeValue(field.id, v)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <Input
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            onKeyDown={(e) => onValueKey(e, field.id)}
                            placeholder="Add a value (e.g. Cybersecurity Risk)"
                            className="h-8 text-sm"
                          />
                          <Button size="sm" variant="outline" onClick={() => addValue(field.id)} className="h-8 gap-1">
                            <Plus className="h-3 w-3" /> Add Value
                          </Button>
                        </div>
                      </div>
                      <p className="text-caption text-muted-foreground italic flex items-center gap-1.5 px-1">
                        <Lock className="h-3 w-3" /> Taxonomy fields are structurally fixed — they appear on every project and feed Arc's risk signals — but values are defined by your organization.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={addField}
              className="w-full py-3 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add Field
            </button>
          </div>
        </div>

        {/* Compliance Rules */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary border border-border"><Zap className="h-4 w-4 text-foreground" /></div>
              <div>
                <h3 className="text-headline text-foreground">Compliance Rules</h3>
                <p className="text-caption text-muted-foreground mt-0.5">Define routing rules that determine how non-compliant projects are flagged and escalated.</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule) => (
              <div key={rule.id} className="rounded-lg border border-border bg-background/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", rule.dotClass)} />
                    <span className="text-sm font-semibold text-foreground">{rule.name}</span>
                  </div>
                  <button className="text-caption text-primary hover:underline inline-flex items-center gap-1">
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                </div>
                <div className="space-y-1.5">
                  <span className={sectionLabel}>Conditions (AND)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {rule.conditions.map((c) => (
                      <span key={c} className="text-xs px-2 py-1 rounded-md bg-secondary/60 text-foreground border border-border font-mono">{c}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className={sectionLabel}>Action</span>
                  <div>
                    <span className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border",
                      rule.actionTone === "warning" && "bg-warning/10 text-warning border-warning/20",
                      rule.actionTone === "destructive" && "bg-destructive/10 text-destructive border-destructive/20",
                      rule.actionTone === "primary" && "bg-primary/10 text-primary border-primary/20",
                    )}>
                      {rule.action}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => toast.success("Rule added")}
            className="mt-4 w-full py-3 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Rule
          </button>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary border border-border"><ShieldCheck className="h-4 w-4 text-foreground" /></div>
              <div>
                <h3 className="text-headline text-foreground">Governance & Data Quality</h3>
                <p className="text-caption text-muted-foreground mt-0.5">{rows.length} projects · sorted by staleness</p>
              </div>
            </div>
            <WidgetMenu widgetName="Governance Table" />
          </div>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-[1300px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["ID", "Project", "Portfolio", "Priority", "Compliance", "Days Since", "Last Updated", "Missing Fields", "Budget", "Risk", "Sponsor", "Reminder"].map((h) => (
                    <th key={h} className="text-caption font-semibold text-muted-foreground pb-3 pr-4 whitespace-nowrap text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const wasSent = sentReminders.has(r.id) || r.reminderSent;
                  return (
                    <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2.5 pr-4 text-caption text-muted-foreground font-mono">{r.id}</td>
                      <td className="py-2.5 pr-4 font-medium text-foreground min-w-[240px]">{r.name}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground">{r.portfolio}</td>
                      <td className="py-2.5 pr-4"><span className={pill(r.priority)}>{r.priority}</span></td>
                      <td className="py-2.5 pr-4"><span className={pill(r.complianceStatus)}>{r.complianceStatus}</span></td>
                      <td className={cn("py-2.5 pr-4 text-right tabular-nums font-semibold", r.daysSinceUpdate > 21 ? "text-destructive" : r.daysSinceUpdate > 14 ? "text-warning" : "text-success")}>{r.daysSinceUpdate}d</td>
                      <td className="py-2.5 pr-4 text-muted-foreground text-caption">{r.lastUpdated}</td>
                      <td className="py-2.5 pr-4 min-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {r.fieldsMissing.length === 0 ? <span className="text-caption text-muted-foreground">—</span> : r.fieldsMissing.map((f) => (
                            <span key={f} className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-warning/10 text-warning border border-warning/20">{f}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 pr-4 text-right tabular-nums">${r.budget}M</td>
                      <td className="py-2.5 pr-4"><span className={pill(r.riskLevel)}>{r.riskLevel}</span></td>
                      <td className="py-2.5 pr-4 text-muted-foreground text-caption">{r.sponsor}</td>
                      <td className="py-2.5 pr-4 text-center">
                        {wasSent ? (
                          <span className="inline-flex items-center gap-1 text-success text-caption font-semibold"><Check className="h-3 w-3" /> Sent</span>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => sendReminder(r.id)} className="h-7 text-xs gap-1">
                            <Send className="h-3 w-3" /> Send
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
