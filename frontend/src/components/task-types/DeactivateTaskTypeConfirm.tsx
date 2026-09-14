import { Button } from "@/components/ui/button";

type DeactivateTaskTypeConfirmProps = {
  taskTypeName: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeactivateTaskTypeConfirm({
  taskTypeName,
  isSubmitting,
  errorMessage,
  onConfirm,
  onCancel,
}: DeactivateTaskTypeConfirmProps) {
  return (
    <div
      className="rounded-lg border border-destructive/40 bg-card p-4 shadow-sm"
      role="dialog"
      aria-labelledby="deactivate-task-type-title"
    >
      <h2
        id="deactivate-task-type-title"
        className="text-base font-semibold text-foreground"
      >
        Deactivate task type?
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{taskTypeName}</span> will
        be marked inactive and hidden from new report task selections. Existing
        reports that reference this task type are unchanged. This is not a
        permanent delete.
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
          variant="destructive"
          size="sm"
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Deactivating…" : "Confirm deactivation"}
        </Button>
      </div>
    </div>
  );
}
