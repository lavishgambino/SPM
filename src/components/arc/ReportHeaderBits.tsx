import { LucideIcon } from "lucide-react";
import { ShareButton } from "@/components/claude/ShareButton";
import { toast } from "sonner";

export function ReportTitleIcon({
  icon: Icon,
  bg = "#A5A3F5",
}: {
  icon: LucideIcon;
  bg?: string;
}) {
  return (
    <div
      className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: bg, color: "#FFFFFF" }}
    >
      <Icon className="w-4 h-4" strokeWidth={1.75} />
    </div>
  );
}

export function ReportShareButton() {
  return (
    <ShareButton
      onClick={() => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Share link copied");
      }}
    />
  );
}
