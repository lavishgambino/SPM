// Catalog of all widgets available on the EPMO Dashboard.
// Used by the default layout, the Widget Library slide-over, and the
// AI Suggestions slide-over.

export type WidgetCategory =
  | "Status & Health"
  | "Financial"
  | "Capacity"
  | "Governance"
  | "Programs"
  | "Custom";

export interface WidgetDef {
  id: string;
  name: string;
  description: string;
  category: WidgetCategory;
  /** Visual sizing on the dashboard grid */
  size: "half" | "full" | "third" | "twoThirds";
  /** Tiny inline svg/emoji thumbnail kind for the picker */
  thumb: "donut" | "line" | "radar" | "heatmap" | "bars" | "table" | "list" | "kpi" | "text" | "divider" | "link";
}

export const WIDGET_CATALOG: WidgetDef[] = [
  // Status & Health
  { id: "rag",            name: "RAG Status",                 description: "Donut showing On Track / At Risk / Off Track project counts.", category: "Status & Health", size: "third",     thumb: "donut" },
  { id: "healthTrend",    name: "Plan Health Trend",          description: "Stacked monthly distribution of project RAG over time.",        category: "Status & Health", size: "twoThirds", thumb: "line" },
  { id: "healthRadar",    name: "Execution Health Radar",     description: "Multi-dimensional radar of current vs target health.",          category: "Status & Health", size: "half",      thumb: "radar" },
  { id: "riskHeatmap",    name: "Risk Heatmap",               description: "Likelihood × impact heatmap of active risks.",                  category: "Status & Health", size: "half",      thumb: "heatmap" },
  { id: "attention",      name: "Projects Needing Attention", description: "Top 20 projects flagged by RAG, budget variance, or schedule slip.", category: "Status & Health", size: "full",   thumb: "table" },

  // Financial
  { id: "spendOverview",  name: "Portfolio Spend Overview",   description: "Planned vs actual vs projected spend by portfolio.",            category: "Financial", size: "twoThirds", thumb: "bars" },
  { id: "budgetVsActual", name: "Budget vs. Actuals",         description: "Bar + trend line comparing budgeted vs actual spend.",          category: "Financial", size: "half",      thumb: "bars" },
  { id: "capexOpex",      name: "CapEx / OpEx Breakdown",     description: "Split of capital and operating expenditure.",                   category: "Financial", size: "half",      thumb: "donut" },
  { id: "burnRate",       name: "Burn Rate",                  description: "Cumulative spend trend with projection.",                       category: "Financial", size: "half",      thumb: "line" },

  // Capacity
  { id: "fteUtil",        name: "FTE Utilization",            description: "Planned vs actual FTE allocation by portfolio.",                category: "Capacity", size: "half",      thumb: "bars" },
  { id: "capacityHeat",   name: "Capacity Heat Map",          description: "Team-by-quarter capacity load heatmap.",                        category: "Capacity", size: "half",      thumb: "heatmap" },
  { id: "teamLoad",       name: "Team Load by Quarter",       description: "Bar chart of team load by quarter.",                            category: "Capacity", size: "half",      thumb: "bars" },

  // Governance
  { id: "decisionLog",    name: "Decision Log Feed",          description: "Recent strategic decisions captured by the EPMO.",              category: "Governance", size: "half",     thumb: "list" },
  { id: "approvalQueue",  name: "Approval Queue",             description: "Pending approvals across portfolios.",                          category: "Governance", size: "half",     thumb: "list" },
  { id: "escalation",     name: "Escalation Velocity",        description: "Rate of escalations and resolution times.",                     category: "Governance", size: "half",     thumb: "line" },
  { id: "initiativeMix",  name: "Initiative Mix",             description: "Run / Change / Grow distribution of initiatives.",              category: "Governance", size: "third",    thumb: "donut" },
  { id: "okrHeatmap",     name: "OKR Alignment Heatmap",      description: "Themes × portfolios coverage matrix with AI insight.",          category: "Governance", size: "full",     thumb: "heatmap" },

  // Programs
  { id: "programRollup",  name: "Program Health Roll-up",     description: "RAG, % complete, and AI observation per program.",              category: "Programs", size: "half",       thumb: "list" },
  { id: "crossDeps",      name: "Cross-Portfolio Dependencies", description: "Map of cross-cutting dependencies between portfolios.",       category: "Programs", size: "half",       thumb: "list" },

  // Custom
  { id: "textBlock",      name: "Text / Header Block",        description: "Free-form text or section header.",                             category: "Custom", size: "full",         thumb: "text" },
  { id: "divider",        name: "Divider",                    description: "Horizontal section divider with optional label.",               category: "Custom", size: "full",         thumb: "divider" },
  { id: "externalLink",   name: "External Link",              description: "Embed a link to an external dashboard or doc.",                 category: "Custom", size: "half",         thumb: "link" },
  { id: "kpiTile",        name: "KPI Tile",                   description: "Single metric with optional comparison.",                       category: "Custom", size: "third",        thumb: "kpi" },
];

/** Default widget layout for EPMO Dashboard (in render order). */
export const DEFAULT_LAYOUT: string[] = [
  "rag",
  "healthTrend",
  "spendOverview",
  "initiativeMix",
  "healthRadar",
  "okrHeatmap",
  "approvalQueue",
  "programRollup",
  "attention",
];

export function getWidget(id: string): WidgetDef | undefined {
  return WIDGET_CATALOG.find((w) => w.id === id);
}

export const WIDGET_CATEGORIES: WidgetCategory[] = [
  "Status & Health",
  "Financial",
  "Capacity",
  "Governance",
  "Programs",
  "Custom",
];
