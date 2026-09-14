import { useState } from "react";
import { FormField, formInputClassName } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ApproveReportConfirmProps = {
  isSubmitting: boolean;
  errorMessage: string | null;
  onConfirm: (comment?: string) => void;
  onCancel: () => void;
  onRefresh?: () => void;
  showRefreshHint?: boolean;
};

export function ApproveReportConfirm({
  isSubmitting,
  errorMessage,
  onConfirm,
  onCancel,
  onRefresh,
  showRefreshHint = false,
}: ApproveReportConfirmProps) {
  const [comment, setComment] = useState("");

  function handleSubmit() {
    const trimmed = comment.trim();
    onConfirm(trimmed.length > 0 ? trimmed : undefined);
  }

  return (
    <div
      className="rounded-lg border border-emerald-500/40 bg-card p-4 shadow-sm"
      role="dialog"
      aria-labelledby="approve-report-title"
    >
      <h2
        id="approve-report-title"
        className="text-base font-semibold text-foreground"
      >
        Approve report?
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Approval marks this weekly report as complete. The team member will not
        be able to edit it unless a future reopening feature is added.
      </p>

      <FormField
        id="approve-comment"
        label="Approval note (optional)"
        className="mt-4"
      >
        <textarea
          id="approve-comment"
          rows={3}
          className={cn(formInputClassName(false), "min-h-20 py-2")}
          value={comment}
          disabled={isSubmitting}
          placeholder="Optional note for the review history…"
          onChange={(event) => setComment(event.target.value)}
        />
      </FormField>

      {errorMessage ? (
        <div className="mt-3 space-y-2" role="alert">
          <p className="text-sm text-destructive">{errorMessage}</p>
          {showRefreshHint && onRefresh ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isSubmitting}
            >
              Refresh report
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Approving…" : "Confirm approval"}
        </Button>
      </div>
    </div>
  );
}
