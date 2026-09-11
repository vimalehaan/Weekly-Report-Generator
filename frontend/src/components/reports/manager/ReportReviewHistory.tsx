import { Button } from "@/components/ui/button";
import type { ReportReview } from "@/types/review";
import { formatReportTimestamp } from "@/utils/report-dates";
import { formatReviewActionLabel } from "@/utils/review-display";
import { formatUserDisplayName } from "@/utils/user-display";

type ReportReviewHistoryProps = {
  reviews: ReportReview[];
  loadState: "idle" | "loading" | "success" | "error";
  errorMessage: string | null;
  onRetry: () => void;
};

export function ReportReviewHistory({
  reviews,
  loadState,
  errorMessage,
  onRetry,
}: ReportReviewHistoryProps) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">
          Review history
        </h2>
        <p className="text-sm text-muted-foreground">
          Manager actions and comments recorded for submitted versions.
        </p>
      </div>

      {loadState === "loading" ? (
        <p className="text-sm text-muted-foreground" role="status">
          Loading reviews…
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

      {loadState === "success" && reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No reviews or comments yet for this report.
        </p>
      ) : null}

      {loadState === "success" && reviews.length > 0 ? (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-md border border-border bg-muted/20 px-3 py-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {formatUserDisplayName(review.reviewer)}
                </span>
                <span className="inline-flex rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {formatReviewActionLabel(review.action)}
                </span>
                <span className="text-xs text-muted-foreground">
                  Version {review.reportVersion.versionNumber}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatReportTimestamp(review.createdAt)}
              </p>
              {review.comment ? (
                <p className="mt-2 text-sm whitespace-pre-wrap text-foreground">
                  {review.comment}
                </p>
              ) : (
                <p className="mt-2 text-sm italic text-muted-foreground">
                  No comment provided.
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
