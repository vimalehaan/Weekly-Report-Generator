import { Button } from "@/components/ui/button";

type SubmitReportConfirmProps = {
  isResubmit: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function SubmitReportConfirm({
  isResubmit,
  isSubmitting,
  errorMessage,
  onConfirm,
  onCancel,
}: SubmitReportConfirmProps) {
  return (
    <div
      className="rounded-lg border border-border bg-card p-4 shadow-sm"
      role="dialog"
      aria-labelledby="submit-report-title"
    >
      <h2 id="submit-report-title" className="text-base font-semibold">
        {isResubmit ? "Resubmit report?" : "Submit report?"}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {isResubmit
          ? "Resubmitting sends the corrected report back for manager review. You will not be able to edit it while it is submitted."
          : "Submitting moves this report into the review workflow. You will not be able to edit it while it awaits review."}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Make sure at least one task is included before submitting.
      </p>

      {errorMessage ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
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
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? isResubmit
              ? "Resubmitting…"
              : "Submitting…"
            : isResubmit
              ? "Confirm resubmit"
              : "Confirm submit"}
        </Button>
      </div>
    </div>
  );
}
