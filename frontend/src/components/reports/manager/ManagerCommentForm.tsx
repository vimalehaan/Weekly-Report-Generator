import { useState } from "react";
import { FormField, formInputClassName } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ManagerCommentFormProps = {
  disabled?: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (comment: string) => void;
};

export function ManagerCommentForm({
  disabled = false,
  isSubmitting,
  errorMessage,
  onSubmit,
}: ManagerCommentFormProps) {
  const [comment, setComment] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmed = comment.trim();

    if (trimmed.length === 0) {
      setValidationError("Comment is required");
      return;
    }

    setValidationError(null);
    onSubmit(trimmed);
  }

  return (
    <form
      className="space-y-4 rounded-lg border border-border bg-card p-4"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">
          Add manager comment
        </h2>
        <p className="text-sm text-muted-foreground">
          Comments are attached to the latest submitted version and appear in
          review history.
        </p>
      </div>

      <FormField
        id="manager-comment"
        label="Comment"
        error={validationError ?? undefined}
      >
        <textarea
          id="manager-comment"
          rows={3}
          className={cn(
            formInputClassName(Boolean(validationError)),
            "min-h-20 py-2",
          )}
          value={comment}
          disabled={disabled || isSubmitting}
          placeholder="Leave feedback for the team member…"
          onChange={(event) => {
            setComment(event.target.value);
            if (validationError) {
              setValidationError(null);
            }
          }}
        />
      </FormField>

      {errorMessage ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <Button type="submit" size="sm" disabled={disabled || isSubmitting}>
        {isSubmitting ? "Posting…" : "Post comment"}
      </Button>
    </form>
  );
}
