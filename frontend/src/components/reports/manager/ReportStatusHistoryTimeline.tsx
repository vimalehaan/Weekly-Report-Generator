import { Button } from "@/components/ui/button";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import type { ReportStatusHistoryEntry } from "@/types/review";
import { formatReportTimestamp } from "@/utils/report-dates";
import { formatUserDisplayName } from "@/utils/user-display";

type ReportStatusHistoryTimelineProps = {
  entries: ReportStatusHistoryEntry[];
  loadState: "idle" | "loading" | "success" | "error";
  errorMessage: string | null;
  onRetry: () => void;
};

export function ReportStatusHistoryTimeline({
  entries,
  loadState,
  errorMessage,
  onRetry,
}: ReportStatusHistoryTimelineProps) {
  const chronological = [...entries].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">
          Status timeline
        </h2>
        <p className="text-sm text-muted-foreground">
          Workflow transitions recorded by the system.
        </p>
      </div>

      {loadState === "loading" ? (
        <p className="text-sm text-muted-foreground" role="status">
          Loading status history…
        </p>
      ) : null}

      {loadState === "error" ? (
        <div className="space-y-2" role="alert">
          <p className="text-sm text-destructive">{errorMessage}</p>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}

      {loadState === "success" && chronological.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No status changes have been recorded yet.
        </p>
      ) : null}

      {loadState === "success" && chronological.length > 0 ? (
        <ol className="relative space-y-0 border-l border-border pl-4">
          {chronological.map((entry) => (
            <li key={entry.id} className="relative pb-6 last:pb-0">
              <span
                className="absolute -left-[calc(0.25rem+1px)] top-1.5 size-2 rounded-full bg-primary"
                aria-hidden
              />
              <div className="flex flex-wrap items-center gap-2">
                <ReportStatusBadge status={entry.fromStatus} />
                <span className="text-xs text-muted-foreground" aria-hidden>
                  →
                </span>
                <ReportStatusBadge status={entry.toStatus} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatReportTimestamp(entry.createdAt)} ·{" "}
                {formatUserDisplayName(entry.changedBy)}
              </p>
              {entry.comment ? (
                <p className="mt-2 text-sm whitespace-pre-wrap text-foreground">
                  {entry.comment}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
