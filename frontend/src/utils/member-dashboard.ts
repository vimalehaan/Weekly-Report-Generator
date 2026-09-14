import type { PaginationMeta, ReportListItem, ReportStatus } from "@/types/report";

export function selectFocusReport(
  reports: ReportListItem[],
): ReportListItem | null {
  if (reports.length === 0) {
    return null;
  }

  const needsCorrection = reports.find(
    (report) => report.status === "NEEDS_CORRECTION",
  );

  return needsCorrection ?? reports[0] ?? null;
}

export function getPrimaryActionLabel(status: ReportStatus): string {
  switch (status) {
    case "DRAFT":
      return "Continue report";
    case "SUBMITTED":
      return "View report";
    case "NEEDS_CORRECTION":
      return "Review corrections";
    case "APPROVED":
      return "View approved report";
    default:
      return "View report";
  }
}

export type MemberDashboardSummaryMetrics = {
  submittedCount: number;
  approvedCount: number;
  needsCorrectionCount: number;
  openBlockersCount: number;
  draftCount: number;
  isPartialDataset: boolean;
  totalReports: number;
};

export function computeMemberDashboardSummary(
  reports: ReportListItem[],
  pagination: PaginationMeta,
): MemberDashboardSummaryMetrics {
  const isPartialDataset = pagination.total > reports.length;

  let submittedCount = 0;
  let approvedCount = 0;
  let needsCorrectionCount = 0;
  let openBlockersCount = 0;
  let draftCount = 0;

  for (const report of reports) {
    if (report.status === "DRAFT") {
      draftCount += 1;
    } else {
      submittedCount += 1;
    }

    if (report.status === "APPROVED") {
      approvedCount += 1;
    }

    if (report.status === "NEEDS_CORRECTION") {
      needsCorrectionCount += 1;
    }

    openBlockersCount += report._count.blockers;
  }

  return {
    submittedCount,
    approvedCount,
    needsCorrectionCount,
    openBlockersCount,
    draftCount,
    isPartialDataset,
    totalReports: pagination.total,
  };
}

export function formatReportCountsSummary(
  report: ReportListItem,
): string {
  const parts: string[] = [];

  const tasks = report._count.reportTasks;
  if (tasks === 0) {
    parts.push("No tasks logged");
  } else if (tasks === 1) {
    parts.push("1 task");
  } else {
    parts.push(`${tasks} tasks`);
  }

  if (report._count.achievements > 0) {
    parts.push(
      report._count.achievements === 1
        ? "1 achievement"
        : `${report._count.achievements} achievements`,
    );
  }

  if (report._count.blockers > 0) {
    parts.push(
      report._count.blockers === 1
        ? "1 blocker"
        : `${report._count.blockers} blockers`,
    );
  }

  return parts.join(" · ");
}
