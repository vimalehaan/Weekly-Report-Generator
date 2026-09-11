import { Button } from "@/components/ui/button";

type DeactivateUserConfirmProps = {
  userName: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeactivateUserConfirm({
  userName,
  isSubmitting,
  errorMessage,
  onConfirm,
  onCancel,
}: DeactivateUserConfirmProps) {
  return (
    <div
      className="rounded-lg border border-destructive/40 bg-card p-4 shadow-sm"
      role="dialog"
      aria-labelledby="deactivate-user-title"
    >
      <h2
        id="deactivate-user-title"
        className="text-base font-semibold text-foreground"
      >
        Deactivate account?
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{userName}</span> will not
        be able to sign in while inactive. You can reactivate the account later.
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
