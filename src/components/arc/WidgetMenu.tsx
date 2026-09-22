import { MoreVertical, Download } from "lucide-react";
import { AiIcon } from "@/components/claude/AiIcon";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function WidgetMenu({ widgetName }: { widgetName: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50"
          aria-label={`Options for ${widgetName}`}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 z-50">
        <DropdownMenuItem onClick={() => toast(`Ask Arc about ${widgetName}`)} className="gap-2 cursor-pointer">
          <AiIcon className="h-4 w-4" /> Ask Arc
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast(`Exporting ${widgetName}…`)} className="gap-2 cursor-pointer">
          <Download className="h-4 w-4" /> Export
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const tooltipStyle = {
  fontSize: 11,
  borderRadius: 8,
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--card))",
  color: "hsl(var(--foreground))",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};
