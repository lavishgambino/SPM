import { useMemo, useState } from "react";
import { Search, Plus, Check } from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  WIDGET_CATALOG, WIDGET_CATEGORIES, type WidgetDef,
} from "@/config/epmoWidgets";

interface WidgetLibrarySheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Widgets currently on the dashboard. Used to disable already-added items. */
  presentIds: string[];
  onAdd: (id: string) => void;
}

function Thumb({ kind }: { kind: WidgetDef["thumb"] }) {
  // Tiny inline svg illustrations using purple palette
  const purple = "#7B6FD4";
  const purpleLight = "#B3ACEC";
  const purplePale = "#DDD9F7";
  switch (kind) {
    case "donut":
      return (
        <svg viewBox="0 0 60 60" className="h-12 w-12">
          <circle cx="30" cy="30" r="20" fill="none" stroke={purplePale} strokeWidth="8" />
          <circle cx="30" cy="30" r="20" fill="none" stroke={purple} strokeWidth="8"
            strokeDasharray="80 200" strokeLinecap="round" transform="rotate(-90 30 30)" />
        </svg>
      );
    case "line":
      return (
        <svg viewBox="0 0 80 40" className="h-10 w-20">
          <polyline fill="none" stroke={purple} strokeWidth="2"
            points="2,30 14,22 26,26 38,12 50,18 62,8 78,14" />
          <polyline fill="none" stroke={purpleLight} strokeWidth="2" opacity="0.5"
            points="2,34 14,28 26,30 38,22 50,24 62,18 78,20" />
        </svg>
      );
    case "radar":
      return (
        <svg viewBox="0 0 60 60" className="h-12 w-12">
          <polygon points="30,8 50,22 44,46 16,46 10,22"
            fill={purplePale} stroke={purple} strokeWidth="1.5" />
        </svg>
      );
    case "heatmap":
      return (
        <svg viewBox="0 0 60 40" className="h-10 w-16">
          {[0, 1, 2, 3].map((c) => [0, 1, 2].map((r) => {
            const op = 0.25 + ((c + r) % 4) * 0.2;
            return <rect key={`${c}-${r}`} x={2 + c * 14} y={2 + r * 12} width="12" height="10"
              fill={purple} opacity={op} rx="1.5" />;
          }))}
        </svg>
      );
    case "bars":
      return (
        <svg viewBox="0 0 60 40" className="h-10 w-16">
          {[18, 28, 14, 32, 22].map((h, i) => (
            <rect key={i} x={4 + i * 11} y={36 - h} width="7" height={h} rx="1.5" fill={purple} opacity={0.5 + i * 0.1} />
          ))}
        </svg>
      );
    case "table":
    case "list":
      return (
        <svg viewBox="0 0 60 40" className="h-10 w-16">
          {[0, 1, 2, 3].map((r) => (
            <g key={r}>
              <rect x="2" y={4 + r * 9} width="20" height="5" rx="1" fill={purplePale} />
              <rect x="26" y={4 + r * 9} width="32" height="5" rx="1" fill={purple} opacity={0.5} />
            </g>
          ))}
        </svg>
      );
    case "kpi":
      return (
        <svg viewBox="0 0 60 40" className="h-10 w-12">
          <text x="30" y="26" textAnchor="middle" fontSize="18" fontWeight="700" fill={purple}>42</text>
        </svg>
      );
    case "text":
      return (
        <svg viewBox="0 0 60 40" className="h-10 w-16">
          <rect x="4" y="8" width="40" height="4" rx="1" fill={purple} />
          <rect x="4" y="18" width="52" height="3" rx="1" fill={purpleLight} />
          <rect x="4" y="25" width="48" height="3" rx="1" fill={purpleLight} />
        </svg>
      );
    case "divider":
      return (
        <svg viewBox="0 0 60 40" className="h-10 w-16">
          <line x1="4" y1="20" x2="56" y2="20" stroke={purple} strokeWidth="2" />
        </svg>
      );
    case "link":
      return (
        <svg viewBox="0 0 60 40" className="h-10 w-12">
          <rect x="10" y="10" width="40" height="20" rx="3" fill="none" stroke={purple} strokeWidth="1.5" />
          <path d="M22 20 L40 20 M36 16 L40 20 L36 24" stroke={purple} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

export function WidgetLibrarySheet({ open, onOpenChange, presentIds, onAdd }: WidgetLibrarySheetProps) {
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WIDGET_CATEGORIES.map((cat) => ({
      category: cat,
      widgets: WIDGET_CATALOG.filter(
        (w) => w.category === cat && (!q || w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q))
      ),
    })).filter((g) => g.widgets.length > 0);
  }, [query]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Widget Library</SheetTitle>
          <SheetDescription>Drop a widget onto your dashboard</SheetDescription>
        </SheetHeader>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search widgets..."
            className="pl-9 border-primary/50 focus-visible:ring-primary"
          />
        </div>

        <div className="mt-6 space-y-7 pb-12">
          {grouped.map((group) => (
            <div key={group.category}>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                {group.category}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {group.widgets.map((w) => {
                  const present = presentIds.includes(w.id);
                  return (
                    <button
                      key={w.id}
                      type="button"
                      disabled={present}
                      onClick={() => onAdd(w.id)}
                      className={cn(
                        "group text-left rounded-xl border p-3 transition-all",
                        present
                          ? "border-success/40 bg-success/5 cursor-default"
                          : "border-border hover:border-primary hover:shadow-card-hover bg-card"
                      )}
                    >
                      <div
                        className="rounded-lg flex items-center justify-center mb-2 h-20"
                        style={{ background: "hsl(245 60% 97%)" }}
                      >
                        <Thumb kind={w.thumb} />
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-semibold text-foreground leading-tight">{w.name}</div>
                        {present ? (
                          <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        ) : (
                          <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 mt-0.5" />
                        )}
                      </div>
                      <p className="text-caption text-muted-foreground mt-1 line-clamp-2">{w.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 -mx-6 px-6 py-3 bg-card border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Done
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
