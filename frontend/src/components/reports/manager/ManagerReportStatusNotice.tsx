import type { ReportStatus } from "@/types/report";

type ManagerReportStatusNoticeProps = {
  status: ReportStatus;
};

export function ManagerReportStatusNotice({
  status,
}: ManagerReportStatusNoticeProps) {
  if (status === "SUBMITTED") {
    return (
      <p className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-foreground">
        This report is submitted and ready for review. You can request a
        correction, approve it, or leave a comment below.
      </p>
    );
  }

  if (status === "NEEDS_CORRECTION") {
    return (
      <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
        This report is awaiting resubmission from the team member. Review
        actions apply only while a report is in the submitted state.
      </p>
    );
  }

  if (status === "DRAFT") {
    return (
      <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        This report is still a draft. It cannot be reviewed until the team
        member submits it.
      </p>
    );
  }

  if (status === "APPROVED") {
    return (
      <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-950 dark:text-emerald-100">
        This report has been approved and is read-only.
      </p>
    );
  }

  return null;
}
