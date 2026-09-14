import { ReportListItem } from "@/components/reports/ReportListItem";
import type { ReportListItem as ReportListItemData } from "@/types/report";

type ReportListProps = {
  reports: ReportListItemData[];
};

export function ReportList({ reports }: ReportListProps) {
  return (
    <ul className="space-y-3">
      {reports.map((report) => (
        <li key={report.id}>
          <ReportListItem report={report} />
        </li>
      ))}
    </ul>
  );
}
