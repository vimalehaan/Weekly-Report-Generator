import type { ReportStatus } from "@/types/report";

export function canEditReport(status: ReportStatus): boolean {
  return status === "DRAFT" || status === "NEEDS_CORRECTION";
}

export function canSubmitReport(status: ReportStatus): boolean {
  return canEditReport(status);
}

export function getReportStatusHint(status: ReportStatus): string | null {
  switch (status) {
    case "SUBMITTED":
      return "This report has been submitted and is awaiting manager review. Editing is not available until a correction is requested.";
    case "NEEDS_CORRECTION":
      return "Your manager requested corrections. Update the report and resubmit when ready.";
    case "APPROVED":
      return "This report has been approved and is read-only.";
    case "DRAFT":
      return null;
    default:
      return null;
  }
}
