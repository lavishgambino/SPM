import { useState } from "react";
import { ChevronDown, ChevronUp, RefreshCw, Copy, ArrowRight } from "lucide-react";
import { AiIcon } from "@/components/claude/AiIcon";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AiSummaryPanelProps {
  /** Plain-language narrative — 3-5 sentences */
  narrative: string;
  /** AI-generated action recommendations shown as chips */
  actions: string[];
  /** "As of" date label (e.g. "Mar 20, 2027") */
  asOf: string;
  /** Freshness label (e.g. "2h ago") */
  refreshedAgo?: string;
}

export function AiSummaryPanel({
  narrative,
  actions,
  asOf,
  refreshedAgo = "2h ago",
}: AiSummaryPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const handleRegenerate = () => {
    setRegenerating(true);
    setTimeout(() => {
      setRegenerating(false);
      toast.success("Summary regenerated");
    }, 900);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(narrative).catch(() => {});
    toast.success("Summary copied to clipboard");
  };

  return (
    <div
      className="relative rounded-xl border p-5 shadow-soft overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, hsl(245 60% 98%) 0%, hsl(265 55% 97%) 50%, hsl(228 55% 97%) 100%)",
        borderColor: "hsl(245 40% 90%)",
      }}
    >
      {/* Subtle top accent stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, hsl(265 55% 78%) 0%, hsl(245 70% 65%) 50%, hsl(228 80% 70%) 100%)",
        }}
      />

      {/* Header row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md"
            style={{
              color: "hsl(245 70% 50%)",
              background: "hsl(245 60% 94%)",
              border: "1px solid hsl(245 50% 88%)",
            }}
          >
            <AiIcon className="h-3 w-3" />
            AI Summary
          </span>
          <span className="text-caption text-muted-foreground">
            · interprets the page in plain language
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-caption text-muted-foreground">
            As of {asOf} · Refreshed {refreshedAgo}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleRegenerate}
              className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/60 transition-colors"
              aria-label="Regenerate summary"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", regenerating && "animate-spin")} />
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/60 transition-colors"
              aria-label="Copy summary"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setExpanded((s) => !s)}
              className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/60 transition-colors"
              aria-label={expanded ? "Collapse summary" : "Expand summary"}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            {narrative}
          </p>

          {actions.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {actions.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toast(`Action queued: ${a}`)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/70 border transition-colors hover:bg-white"
                  style={{
                    color: "hsl(245 70% 45%)",
                    borderColor: "hsl(245 40% 86%)",
                  }}
                >
                  <ArrowRight className="h-3 w-3" />
                  {a}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
