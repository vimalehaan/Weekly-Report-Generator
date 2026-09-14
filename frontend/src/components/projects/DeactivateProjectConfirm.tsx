import { Button } from "@/components/ui/button";

type DeactivateProjectConfirmProps = {
  projectName: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeactivateProjectConfirm({
  projectName,
  isSubmitting,
  errorMessage,
  onConfirm,
  onCancel,
}: DeactivateProjectConfirmProps) {
  return (
    <div
      className="rounded-lg border border-destructive/40 bg-card p-4 shadow-sm"
      role="dialog"
      aria-labelledby="deactivate-project-title"
    >
      <h2
        id="deactivate-project-title"
        className="text-base font-semibold text-foreground"
      >
        Deactivate project?
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{projectName}</span> will
        be marked inactive and hidden from new report task selections. Existing
        reports that reference this project are unchanged. This is not a
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
