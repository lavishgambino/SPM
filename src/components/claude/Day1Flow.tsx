import { useState, useMemo } from "react";
import { ArrowLeft, Check, ChevronRight, X, FileText, Upload, AlertTriangle, Plus, Trash2, Compass, DollarSign, Users, Target, Shield, Pencil, Info } from "lucide-react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Switch } from "@/components/ui/switch";

interface Portfolio {
  id: string;
  name: string;
  projects: number;
  budget: string;
  budgetWarn?: boolean;
  owner: string;
  ownerWarn?: boolean;
  sync: string;
  warn?: boolean;
}

interface Theme {
  id: string;
  name: string;
  goals: string[];
  expanded: boolean;
}

const PORTFOLIOS: Portfolio[] = [
  { id: "cap", name: "Capital Projects", projects: 142, budget: "$18.4M", owner: "Lisa Torres", sync: "Today" },
  { id: "clin", name: "Clinical Operations", projects: 67, budget: "$9.2M", owner: "Dr. Reyes", sync: "Today" },
  { id: "wf", name: "Workforce & HR", projects: 34, budget: "$4.1M", owner: "Marcus Webb", sync: "Yesterday" },
  { id: "it", name: "IT & Infrastructure", projects: 31, budget: "Untagged", budgetWarn: true, owner: "Unassigned", ownerWarn: true, sync: "3 days ago", warn: true },
  { id: "fin", name: "Finance & Compliance", projects: 18, budget: "$2.8M", owner: "CFO Office", sync: "Today" },
  { id: "res", name: "Research & Innovation", projects: 12, budget: "$1.6M", owner: "Unassigned", ownerWarn: true, sync: "1 week ago", warn: true },
];

const SUGGESTED_THEMES = [
  "Digital Transformation & Data Infrastructure",
  "Workforce Resilience & Pipeline",
  "Operational Efficiency & Care Coordination",
  "Operational & Financial Performance",
];

const PARAM_FIELDS = [
  { key: "budget", label: "Total portfolio budget", placeholder: "e.g. $62M", source: "CFO memo or finance plan", hint: "The total capital and operating budget allocated for FY27 strategic initiatives" },
  { key: "reserve", label: "Minimum reserve %", placeholder: "e.g. 15%", source: "CFO standing mandate", hint: "Percentage of total budget held in reserve — not available for project allocation" },
  { key: "fte", label: "FTE capacity baseline", placeholder: "e.g. 420 roles", source: "HR workforce plan", hint: "Total FTE headcount available for project work across all active portfolios" },
  { key: "themecap", label: "Per-theme budget cap", placeholder: "e.g. $13M", source: "EPMO governance decision", hint: "Maximum budget any single strategic theme can claim through intake" },
  { key: "newproj", label: "Net new project limit", placeholder: "e.g. 25 projects", source: "EPMO governance decision", hint: "Maximum number of net new projects permitted to enter through FY27 intake" },
];

// ───────────────────────── Message primitives (match other convos) ─────────────────────────
const UserMessage = ({ text }: { text: string }) => (
  <div className="flex justify-end py-5">
    <div className="max-w-[70%] bg-muted/60 dark:bg-accent/60 rounded-2xl px-5 py-3 text-[14px] text-foreground leading-relaxed">
      {text}
    </div>
  </div>
);

const AiMessage = ({ children, divider = true }: { children: React.ReactNode; divider?: boolean }) => (
  <div className="py-5">
    {children}
    {divider && <div className="border-b border-border/40 mt-5" />}
  </div>
);

const Para = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[14px] text-foreground/85 leading-[1.75] mb-3.5">{children}</p>
);

// ───────────────────────── Portfolio Table ─────────────────────────
const PortfolioTable = ({
  selected, onToggle, onConfirm, locked, totalProjects,
}: {
  selected: Set<string>;
  onToggle: (id: string) => void;
  onConfirm: () => void;
  locked: boolean;
  totalProjects: number;
}) => {
  const count = selected.size;
  return (
    <div className="my-3 rounded-xl border border-border bg-card overflow-hidden">
      <div className="grid grid-cols-[40px_2fr_80px_100px_140px_110px] gap-2 px-4 py-2.5 border-b border-border bg-muted/40 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <div></div>
        <div>Portfolio</div>
        <div className="text-right">Projects</div>
        <div className="text-right">Budget</div>
        <div>Owner</div>
        <div>Last sync</div>
      </div>
      {PORTFOLIOS.map((p) => {
        const isSel = selected.has(p.id);
        return (
          <button
            key={p.id}
            disabled={locked}
            onClick={() => onToggle(p.id)}
            className={`w-full grid grid-cols-[40px_2fr_80px_100px_140px_110px] gap-2 px-4 py-3 border-b border-border last:border-0 text-left text-[13px] transition-colors ${
              locked ? "cursor-default" : "cursor-pointer hover:bg-muted/40"
            } ${isSel ? "bg-primary/5" : ""}`}
          >
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                isSel ? "bg-primary border-primary" : "border-border bg-background"
              }`}>
                {isSel && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
              </div>
            </div>
            <div className="flex items-center gap-2 text-foreground font-medium min-w-0">
              <span className="truncate">{p.name}</span>
              {p.warn && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
            </div>
            <div className="text-right text-muted-foreground tabular-nums">{p.projects}</div>
            <div className={`text-right tabular-nums ${p.budgetWarn ? "text-amber-500" : "text-muted-foreground"}`}>{p.budget}</div>
            <div className={`truncate ${p.ownerWarn ? "text-red-500" : "text-muted-foreground"}`}>{p.owner}</div>
            <div className="text-muted-foreground text-[12px]">{p.sync}</div>
          </button>
        );
      })}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-t border-border">
        <div className="text-[12px] text-muted-foreground flex items-center gap-2">
          {locked ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-500" />
              <span className="text-foreground font-medium">{count} connected</span>
              <span>· {totalProjects} projects</span>
            </>
          ) : (
            <span><span className="text-foreground font-medium">{count}</span> selected</span>
          )}
        </div>
        {!locked && (
          <button
            disabled={count === 0}
            onClick={onConfirm}
            className="text-[12px] px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          >
            Connect {count > 0 ? count : ""} portfolio{count === 1 ? "" : "s"}
          </button>
        )}
      </div>
    </div>
  );
};

// ───────────────────────── Artifact Chip ─────────────────────────
const ArtifactChip = ({
  title, subtitle, complete, active, onClick,
}: { title: string; subtitle: string; complete: boolean; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
      active ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-card hover:border-border hover:shadow-sm"
    }`}
  >
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${complete ? "bg-green-500/10" : "bg-muted"}`}>
      <FileText className={`w-4 h-4 ${complete ? "text-green-600" : "text-muted-foreground"}`} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[13px] font-semibold text-foreground truncate">{title}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{subtitle}</div>
    </div>
    {complete ? (
      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
        <Check className="w-3 h-3 text-white" strokeWidth={3} />
      </div>
    ) : (
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    )}
  </button>
);

// ───────────────────────── Themes Panel (Arc 6 style) ─────────────────────────
const THEME_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-cyan-500",
];

const ThemesPanel = ({
  themes, setThemes, locked, onSave, onClose,
}: {
  themes: Theme[];
  setThemes: (t: Theme[]) => void;
  locked: boolean;
  onSave: () => void;
  onClose: () => void;
}) => {
  const [newTheme, setNewTheme] = useState("");
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState<Record<string, string>>({});

  const usedNames = new Set(themes.map(t => t.name));
  const suggestions = SUGGESTED_THEMES.filter(s => !usedNames.has(s));
  const totalGoals = themes.reduce((acc, t) => acc + t.goals.length, 0);

  const addTheme = (name: string) => {
    if (!name.trim()) return;
    setThemes([...themes, { id: crypto.randomUUID(), name: name.trim(), goals: [], expanded: true }]);
    setNewTheme("");
  };

  const removeTheme = (id: string) => setThemes(themes.filter(t => t.id !== id));

  const addGoal = (themeId: string) => {
    const goal = (newGoal[themeId] || "").trim();
    if (!goal) return;
    setThemes(themes.map(t => t.id === themeId ? { ...t, goals: [...t.goals, goal] } : t));
    setNewGoal({ ...newGoal, [themeId]: "" });
  };

  const removeGoal = (themeId: string, idx: number) => {
    setThemes(themes.map(t => t.id === themeId ? { ...t, goals: t.goals.filter((_, i) => i !== idx) } : t));
  };

  return (
    <div className="flex flex-col h-full bg-muted/20">
      <div className="flex items-start justify-between px-6 py-4 border-b border-border bg-background flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 icon-tile bg-primary/10 flex items-center justify-center">
            <Compass className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-foreground">Strategic Themes</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">{themes.length} themes · {totalGoals} goals defined</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
          <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-medium text-foreground">What are Strategic Themes?</p>
            <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">
              The highest-level investment categories for FY27. Every initiative, OKR, and portfolio gets tagged to one or more themes.
            </p>
          </div>
        </div>

        {themes.map((theme, idx) => {
          const color = THEME_COLORS[idx % THEME_COLORS.length];
          const isEditing = editingThemeId === theme.id;
          return (
            <div key={theme.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden group">
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white shrink-0 ${color}`}>
                    <Compass className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[15px] font-semibold text-foreground leading-tight">{theme.name}</h3>
                      {!locked && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingThemeId(isEditing ? null : theme.id)}
                            className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => removeTheme(theme.id)}
                            className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    {theme.goals.length > 0 ? (
                      <div className="mt-2 space-y-1.5">
                        {theme.goals.map((g, i) => (
                          <div key={i} className="group/goal flex items-start gap-2 text-[13px] text-muted-foreground leading-relaxed">
                            <Target className="h-3 w-3 text-primary/60 mt-1 shrink-0" />
                            <span className="flex-1">{g}</span>
                            {!locked && isEditing && (
                              <button onClick={() => removeGoal(theme.id, i)} className="opacity-0 group-hover/goal:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[13px] text-muted-foreground mt-1.5 italic">No goals defined yet — click edit to add</p>
                    )}
                    {!locked && isEditing && (
                      <div className="flex items-center gap-2 mt-3">
                        <input
                          value={newGoal[theme.id] || ""}
                          onChange={(e) => setNewGoal({ ...newGoal, [theme.id]: e.target.value })}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addGoal(theme.id); } }}
                          placeholder="Add a goal…"
                          className="flex-1 text-[12px] px-3 py-1.5 rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button onClick={() => addGoal(theme.id)} className="text-[11px] px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90">
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {!locked && suggestions.map((s) => (
          <button
            key={s}
            onClick={() => addTheme(s)}
            className="w-full bg-muted/20 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all p-5 text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 icon-tile bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                <Plus className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-semibold text-foreground">{s}</h3>
                <p className="text-[12px] text-muted-foreground mt-0.5">Click to add this theme</p>
              </div>
            </div>
          </button>
        ))}

        {!locked && (
          <div className="bg-card rounded-xl border-2 border-dashed border-border p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 icon-tile bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                <Plus className="h-5 w-5" />
              </div>
              <div className="flex-1 flex items-center gap-2">
                <input
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTheme(newTheme); } }}
                  placeholder="Define a new strategic theme…"
                  className="flex-1 text-[13px] px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={() => addTheme(newTheme)}
                  disabled={!newTheme.trim()}
                  className="text-[12px] px-3 py-2 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-30 hover:bg-primary/90 transition-colors"
                >
                  Add Theme
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-background flex-shrink-0">
        <div className="text-[12px] text-muted-foreground">
          <span className="text-foreground font-semibold">{themes.length}</span> theme{themes.length === 1 ? "" : "s"} · <span className="text-foreground font-semibold">{totalGoals}</span> goal{totalGoals === 1 ? "" : "s"}
        </div>
        {locked ? (
          <div className="flex items-center gap-1.5 text-[12px] text-emerald-600 font-medium">
            <Check className="w-3.5 h-3.5" /> Saved
          </div>
        ) : (
          <button
            disabled={themes.length === 0}
            onClick={onSave}
            className="text-[12px] px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-30 hover:bg-primary/90 transition-colors"
          >
            Save themes & goals
          </button>
        )}
      </div>
    </div>
  );
};

// ───────────────────────── Params Panel (Arc 6 guardrails style) ─────────────────────────
const PARAM_CATEGORIES = [
  { id: "budget", name: "Budget Guardrails", shortName: "Budget", icon: DollarSign },
  { id: "capacity", name: "Capacity", shortName: "Capacity", icon: Users },
  { id: "strategic", name: "Strategic", shortName: "Strategic", icon: Target },
];

const ParamsPanel = ({
  params, setParams, locked, onConfirm, onClose,
}: {
  params: Record<string, string>;
  setParams: (p: Record<string, string>) => void;
  locked: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(PARAM_FIELDS.map(f => [f.key, true]))
  );
  const [selectedCategory, setSelectedCategory] = useState("budget");

  const filledCount = PARAM_FIELDS.filter(f => params[f.key]?.trim()).length;
  const enabledCount = PARAM_FIELDS.filter(f => enabled[f.key]).length;
  const allFilled = filledCount === 5;

  const totalNum = parseFloat((params.budget || "").replace(/[^0-9.]/g, ""));
  const reserveNum = parseFloat((params.reserve || "").replace(/[^0-9.]/g, ""));
  const showEnvelope = !isNaN(totalNum) && !isNaN(reserveNum) && totalNum > 0;
  const envelope = showEnvelope ? (totalNum * (1 - reserveNum / 100)).toFixed(1) : "0";

  const startEdit = (key: string, currentVal: string) => {
    setEditingId(key);
    setDraft(currentVal);
  };
  const saveEdit = () => {
    if (editingId) {
      setParams({ ...params, [editingId]: draft });
    }
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full bg-muted/20">
      <div className="flex items-start justify-between px-6 py-4 border-b border-border bg-background flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 icon-tile bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-foreground">Investment Parameters</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">{enabledCount} of {PARAM_FIELDS.length} parameters enabled · {filledCount} configured</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-hidden p-4 flex flex-col gap-4">
        <div className="bg-card rounded-xl border border-border shadow-sm flex-shrink-0">
          <div className="flex items-center gap-1 p-2 overflow-x-auto">
            {PARAM_CATEGORIES.map((cat) => {
              const isSel = cat.id === selectedCategory;
              const isAvail = cat.id === "budget";
              return (
                <button
                  key={cat.id}
                  disabled={!isAvail}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg transition-colors text-left whitespace-nowrap ${
                    isSel
                      ? "bg-primary/10 border border-primary/20"
                      : isAvail
                        ? "hover:bg-muted/50 border border-transparent"
                        : "border border-transparent opacity-40 cursor-not-allowed"
                  }`}
                >
                  <div className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${
                    isSel ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    <cat.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[13px] font-medium leading-tight ${isSel ? "text-primary" : "text-foreground"}`}>{cat.shortName}</span>
                    <span className="text-[10.5px] text-muted-foreground leading-tight">
                      {isAvail ? `${enabledCount} / ${PARAM_FIELDS.length} enabled` : "Coming soon"}
                    </span>
                  </div>
                  {isAvail && enabledCount > 0 && (
                    <div className={`h-1.5 w-1.5 rounded-full shrink-0 ml-1 ${enabledCount === PARAM_FIELDS.length ? "bg-emerald-500" : "bg-amber-500"}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="bg-card rounded-xl border border-border shadow-sm h-full flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 icon-tile bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-foreground">Budget Guardrails</h3>
                  <p className="text-[11px] text-muted-foreground">{enabledCount} of {PARAM_FIELDS.length} enabled</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {!locked && (
                <button className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-border bg-muted/10 hover:bg-muted/30 transition-colors text-left">
                  <Upload className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <div className="text-[12px] font-medium text-foreground">Upload CFO document to auto-fill</div>
                    <div className="text-[11px] text-muted-foreground">Drop a budget memo or Excel file</div>
                  </div>
                </button>
              )}

              {PARAM_FIELDS.map((f) => {
                const val = params[f.key] || "";
                const isOn = enabled[f.key];
                const isEditing = editingId === f.key;
                return (
                  <div
                    key={f.key}
                    className={`p-3.5 rounded-lg border transition-all ${
                      isOn ? "bg-background border-border" : "bg-muted/20 border-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Switch
                        checked={isOn}
                        onCheckedChange={(v) => !locked && setEnabled({ ...enabled, [f.key]: v })}
                        disabled={locked}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-[13px] font-semibold ${isOn ? "text-foreground" : "text-muted-foreground"}`}>
                          {f.label}
                        </h4>
                        <p className={`text-[11px] mt-0.5 ${isOn ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
                          {f.hint}
                        </p>
                      </div>

                      {isEditing && !locked ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <input
                            autoFocus
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingId(null); }}
                            placeholder={f.placeholder}
                            className="text-[13px] font-semibold px-2.5 py-1.5 rounded-md border border-primary bg-background focus:outline-none w-[120px] text-right"
                          />
                          <button onClick={saveEdit} className="h-7 w-7 rounded-md flex items-center justify-center text-emerald-600 hover:bg-emerald-500/10">
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => isOn && !locked && startEdit(f.key, val)}
                          disabled={!isOn || locked}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-[13px] font-semibold transition-colors shrink-0 tabular-nums ${
                            isOn
                              ? locked
                                ? "bg-emerald-500/5 border-emerald-500/30 text-foreground"
                                : val
                                  ? "bg-background border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer text-foreground"
                                  : "bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50 cursor-pointer text-amber-700 dark:text-amber-400"
                              : "bg-muted/30 border-transparent text-muted-foreground cursor-not-allowed"
                          }`}
                        >
                          {val || (isOn ? f.placeholder.replace("e.g. ", "") : "—")}
                          {isOn && !locked && <Pencil className="h-3 w-3 text-muted-foreground" />}
                          {locked && val && <Check className="h-3 w-3 text-emerald-600" />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {showEnvelope && (
                <div className={`mt-3 rounded-xl border px-4 py-3.5 transition-colors ${locked ? "border-emerald-500/40 bg-emerald-500/5" : "border-primary/30 bg-primary/5"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Calculated spendable envelope</div>
                    {locked && <Check className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <div className="text-2xl font-bold text-foreground tabular-nums">${envelope}M</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">After {reserveNum}% reserve on ${totalNum}M total</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-background flex-shrink-0">
        <div className="text-[12px] text-muted-foreground">
          {locked ? (
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <Check className="w-3.5 h-3.5" /> Parameters locked
            </span>
          ) : (
            <span><span className="text-foreground font-semibold">{filledCount}</span> of {PARAM_FIELDS.length} parameters configured</span>
          )}
        </div>
        {!locked && (
          <button
            disabled={!allFilled}
            onClick={onConfirm}
            className="text-[12px] px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-30 hover:bg-primary/90 transition-colors"
          >
            Confirm & lock parameters
          </button>
        )}
      </div>
    </div>
  );
};

// ───────────────────────── Main Day1 Flow ─────────────────────────
interface Day1FlowProps {
  onBack: () => void;
}

const Day1Flow = ({ onBack }: Day1FlowProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set(["cap", "clin", "wf", "it", "fin"]));
  const [portfoliosConfirmed, setPortfoliosConfirmed] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState<"themes" | "params" | null>(null);

  const [themes, setThemes] = useState<Theme[]>([
    {
      id: "t1",
      name: "Clinical Quality & Patient Safety",
      expanded: true,
      goals: [
        "Reduce preventable harm events across all inpatient units",
        "Achieve top-quartile HAI rates in surgical and ICU settings",
      ],
    },
  ]);
  const [themesComplete, setThemesComplete] = useState(false);

  const [params, setParams] = useState<Record<string, string>>({});
  const [paramsComplete, setParamsComplete] = useState(false);

  const day1Complete = themesComplete && paramsComplete;

  const connectedPortfolios = useMemo(
    () => PORTFOLIOS.filter(p => selected.has(p.id)),
    [selected]
  );
  const totalProjects = connectedPortfolios.reduce((s, p) => s + p.projects, 0);
  const warnings = connectedPortfolios.filter(p => p.warn);
  const totalGoals = themes.reduce((s, t) => s + t.goals.length, 0);

  const togglePortfolio = (id: string) => {
    if (portfoliosConfirmed) return;
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <div className="flex h-full bg-background overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={activeArtifact ? 55 : 100} minSize={35}>
          <div className="flex flex-col h-full min-w-0">
            {/* Header — matches other conversations */}
            <div className="h-11 flex items-center px-4 gap-2 border-b border-border/50 bg-background/80 backdrop-blur-sm flex-shrink-0">
              <button
                onClick={onBack}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className="text-sm font-medium text-foreground truncate">Strategic Framework</span>
                <span className="text-sm text-muted-foreground">· FY27</span>
              </div>
              {day1Complete && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 text-[11px] font-medium">
                  <Check className="w-3 h-3" strokeWidth={3} />
                  Day 1 complete
                </div>
              )}
            </div>

            {/* Conversation — full flow visible at once */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-[680px] mx-auto px-6 py-6">

                {/* Step 1: Opening */}
                <div className="mb-8 pt-2">
                  <div className="text-[40px] font-semibold tracking-tight leading-[1.05]" style={{ color: "hsl(233 70% 70%)" }}>Hi there, Mary.</div>
                  <h1 className="text-[40px] font-semibold text-foreground tracking-tight leading-[1.05]">Let's start planning.</h1>
                </div>
                <AiMessage>
                  <Para>
                    Arc is your AI planning partner for enterprise portfolio management — I'll guide your EPMO from strategy definition through intake, prioritization, scenario planning, and execution monitoring across all your portfolios. I do the heavy lifting. You make the final calls, and nothing goes live until you approve it.
                  </Para>
                  <Para>
                    Setup takes about 10 minutes. To get started, I need to understand your organization's strategy and investment boundaries. Pick whichever fits where you are today:
                  </Para>
                  <div className="mt-4 space-y-2">
                    <button className="w-full text-left px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted/40 hover:border-border/80 transition-colors flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-foreground mb-0.5">Start with your documents</div>
                        <div className="text-[12px] text-muted-foreground leading-relaxed">Strategy decks, board plans, or budget memos — I'll extract your goals, themes, and financial guardrails.</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted/40 hover:border-border/80 transition-colors flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-foreground mb-0.5">Start with strategy</div>
                        <div className="text-[12px] text-muted-foreground leading-relaxed">Walk through your strategic themes and priorities in a guided conversation. We'll set financials after.</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted/40 hover:border-border/80 transition-colors flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-foreground mb-0.5">Start with financials</div>
                        <div className="text-[12px] text-muted-foreground leading-relaxed">Set your investment envelopes, budget caps, and scoring weights directly. We'll map strategy around them.</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted/40 hover:border-border/80 transition-colors flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-foreground mb-0.5">Show me how Arc works</div>
                        <div className="text-[12px] text-muted-foreground leading-relaxed">Walk me through the planning process before I dive in.</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
                    </button>
                  </div>
                </AiMessage>

                {/* Step 2 */}
                <UserMessage text="New planning cycle — FY27." />
                <AiMessage>
                  <Para>
                    Understood. I've scanned your environment and found 6 portfolios available. Select the ones you want Arc to monitor and plan against for FY27. I'll use the connected portfolio data to inform guardrails, surface capacity constraints, and validate project alignment during intake.
                  </Para>
                  <PortfolioTable
                    selected={selected}
                    onToggle={togglePortfolio}
                    onConfirm={() => setPortfoliosConfirmed(true)}
                    locked={portfoliosConfirmed}
                    totalProjects={totalProjects}
                  />
                </AiMessage>

                {/* Step 3: Post-connection (always visible) */}
                <AiMessage>
                  <Para>
                    <span className="font-semibold text-foreground">{connectedPortfolios.length} portfolios connected</span> — {totalProjects} projects now available for planning.
                  </Para>
                  {warnings.length > 0 && (
                    <div className="my-4 rounded-lg border-l-4 border-l-amber-500 border border-border bg-card px-4 py-3">
                      <div className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        {warnings.length === 1 ? "One data quality issue" : "Two data quality issues"} to resolve before intake:
                      </div>
                      <ul className="space-y-1.5 text-xs text-muted-foreground leading-relaxed">
                        {warnings.find(w => w.id === "it") && (
                          <li className="flex gap-2"><span>·</span> IT & Infrastructure — budget fields untagged — guardrail calculations will be unreliable until resolved</li>
                        )}
                        {warnings.find(w => w.id === "res") && (
                          <li className="flex gap-2"><span>·</span> Research & Innovation — no portfolio owner assigned</li>
                        )}
                      </ul>
                    </div>
                  )}
                  <Para>
                    To complete the strategic framework I need two things from you. Open each artifact and configure them — you can work through them in any order.
                  </Para>
                  <div className="mt-4 space-y-2.5">
                    <ArtifactChip
                      title="Strategic Themes & Goals"
                      subtitle={themesComplete ? `${themes.length} themes · ${totalGoals} goals defined` : "Define themes and measurable goals for FY27"}
                      complete={themesComplete}
                      active={activeArtifact === "themes"}
                      onClick={() => setActiveArtifact(activeArtifact === "themes" ? null : "themes")}
                    />
                    <ArtifactChip
                      title="Investment Parameters"
                      subtitle={paramsComplete ? "5 of 5 parameters confirmed and locked" : "Set budget, capacity, and guardrail parameters"}
                      complete={paramsComplete}
                      active={activeArtifact === "params"}
                      onClick={() => setActiveArtifact(activeArtifact === "params" ? null : "params")}
                    />
                  </div>
                </AiMessage>

                {/* Step 4: Completion (always visible — toggles styling when not complete) */}
                <AiMessage divider={false}>
                  <div className={`rounded-xl border px-4 py-3 mb-4 ${day1Complete ? "border-green-500/30 bg-green-500/5" : "border-border bg-muted/30"}`}>
                    <div className="flex items-start gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${day1Complete ? "bg-green-500" : "bg-muted-foreground/30"}`}>
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground mb-1">
                          {day1Complete ? "Day 1 setup complete." : "Day 1 setup — pending completion"}
                        </div>
                        <div className="text-[13px] text-foreground/80 leading-relaxed">
                          {connectedPortfolios.length} portfolios connected · {themesComplete ? `${themes.length} themes confirmed` : "themes pending"} · {paramsComplete ? "5 investment parameters locked" : "parameters pending"}.
                          {day1Complete && " I'll generate draft objectives and KRs and surface any conflicts between your guardrails and live portfolio data."}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[14px] text-foreground/85 leading-[1.7] font-semibold mb-2">Two recommended actions before the next session:</p>
                  <ul className="space-y-2 text-[14px] text-foreground/80 mb-4">
                    <li className="flex gap-2"><span className="text-muted-foreground">–</span> Assign theme owners — I'll need an accountable reviewer on each theme before intake opens.</li>
                    <li className="flex gap-2"><span className="text-muted-foreground">–</span> Upload the board strategic plan or division operating plans — I'll use them to strengthen draft objectives beyond portfolio inference.</li>
                  </ul>
                  <div className="flex flex-wrap gap-2">
                    <button className="text-xs px-3 py-1.5 rounded-lg border border-primary bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                      Review draft objectives
                    </button>
                    <button className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card text-foreground font-medium hover:bg-muted transition-colors">
                      Upload strategic documents
                    </button>
                    <button className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card text-foreground font-medium hover:bg-muted transition-colors">
                      Assign theme owners
                    </button>
                  </div>
                </AiMessage>
              </div>
            </div>

            {/* Input bar — matches other conversations */}
            <div className="px-6 pb-4 pt-2">
              <div className="max-w-[680px] mx-auto">
                <div className="rounded-2xl bg-card/90 glass-card border border-border/50 dark:border-border/30 px-5 py-4" style={{ boxShadow: "var(--shadow-elevated)" }}>
                  <textarea
                    placeholder="Message Arc…"
                    rows={1}
                    className="w-full resize-none bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                    style={{ minHeight: "24px", maxHeight: "200px" }}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <button className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted/40 transition-all">
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="8" y1="3" x2="8" y2="13" /><line x1="3" y1="8" x2="13" y2="8" />
                      </svg>
                    </button>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground/60 select-none">Arc</span>
                      <button className="w-9 h-9 icon-tile bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 active:scale-95">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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

        {activeArtifact && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={45} minSize={30}>
              {activeArtifact === "themes" ? (
                <ThemesPanel
                  themes={themes}
                  setThemes={setThemes}
                  locked={themesComplete}
                  onSave={() => setThemesComplete(true)}
                  onClose={() => setActiveArtifact(null)}
                />
              ) : (
                <ParamsPanel
                  params={params}
                  setParams={setParams}
                  locked={paramsComplete}
                  onConfirm={() => setParamsComplete(true)}
                  onClose={() => setActiveArtifact(null)}
                />
              )}
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

export default Day1Flow;
