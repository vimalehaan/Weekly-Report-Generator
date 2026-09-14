import type { ReviewAction } from "@/types/review";

const REVIEW_ACTION_LABELS: Record<ReviewAction, string> = {
  REQUEST_CORRECTION: "Correction requested",
  APPROVE: "Approved",
  COMMENT: "Comment",
};

export function formatReviewActionLabel(action: ReviewAction): string {
  return REVIEW_ACTION_LABELS[action];
}

export function getWorkflowConflictMessage(): string {
  return "The report may have changed since you opened it. Refresh to see the latest status, then try again if the action is still available.";
}
