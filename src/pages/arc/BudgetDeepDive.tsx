import { Pin } from "lucide-react";
import { AppLayout } from "@/components/arc/AppLayout";
import { BudgetReportPanel } from "@/components/claude/EpmoDashboards";
import { ReportTitleIcon, ReportShareButton } from "@/components/arc/ReportHeaderBits";

export default function BudgetDeepDive() {
  return (
    <AppLayout
      title="Budget deep dive"
      titleIcon={<ReportTitleIcon icon={Pin} bg="#F4A28C" />}
      headerTrailing={<ReportShareButton />}
    >
      <div className="max-w-[1530px] mx-auto">
        <BudgetReportPanel variant="snapshot_10d" />
      </div>
    </AppLayout>
  );
}
