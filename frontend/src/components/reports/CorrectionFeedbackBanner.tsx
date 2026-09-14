import type { ReportReview } from "@/types/review";
import { formatReportTimestamp } from "@/utils/report-dates";
import { formatUserDisplayName } from "@/utils/user-display";

type CorrectionFeedbackBannerProps = {
  reviews: ReportReview[];
};

export function CorrectionFeedbackBanner({
  reviews,
}: CorrectionFeedbackBannerProps) {
  const latestCorrection = reviews.find(
    (review) => review.action === "REQUEST_CORRECTION" && review.comment,
  );

  if (!latestCorrection?.comment) {
    return null;
  }

  return (
    <div
      className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-4"
      role="status"
    >
      <h2 className="text-sm font-semibold text-foreground">
        Correction requested
      </h2>
      <p className="mt-2 text-sm whitespace-pre-wrap text-foreground">
        {latestCorrection.comment}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        {formatUserDisplayName(latestCorrection.reviewer)} ·{" "}
        {formatReportTimestamp(latestCorrection.createdAt)}
      </p>
    </div>
  );
}
