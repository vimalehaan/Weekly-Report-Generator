import { useState } from "react";
import { FormField, formInputClassName } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RequestCorrectionConfirmProps = {
  isSubmitting: boolean;
  errorMessage: string | null;
  onConfirm: (comment: string) => void;
  onCancel: () => void;
  onRefresh?: () => void;
  showRefreshHint?: boolean;
};

export function RequestCorrectionConfirm({
  isSubmitting,
  errorMessage,
  onConfirm,
  onCancel,
  onRefresh,
  showRefreshHint = false,
}: RequestCorrectionConfirmProps) {
  const [comment, setComment] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit() {
    const trimmed = comment.trim();

    if (trimmed.length === 0) {
      setValidationError("Comment is required");
      return;
    }

    setValidationError(null);
    onConfirm(trimmed);
  }

  return (
    <div
      className="rounded-lg border border-amber-500/40 bg-card p-4 shadow-sm"
      role="dialog"
      aria-labelledby="request-correction-title"
    >
      <h2
        id="request-correction-title"
        className="text-base font-semibold text-foreground"
      >
        Request correction?
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        The report will move to{" "}
        <span className="font-medium text-foreground">Needs correction</span>.
        The team member can edit and resubmit. Your comment will be recorded in
        the review history.
      </p>

      <FormField
        id="correction-comment"
        label="Correction comment"
        error={validationError ?? undefined}
        className="mt-4"
      >
        <textarea
          id="correction-comment"
          rows={4}
          className={cn(
            formInputClassName(Boolean(validationError)),
            "min-h-24 py-2",
          )}
          value={comment}
          disabled={isSubmitting}
          placeholder="Describe what needs to be fixed…"
          onChange={(event) => {
            setComment(event.target.value);
            if (validationError) {
              setValidationError(null);
            }
          }}
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
          variant="default"
          className="bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending…" : "Confirm correction request"}
        </Button>
      </div>
    </div>
  );
}
