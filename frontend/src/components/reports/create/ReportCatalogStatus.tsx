import { Button } from "@/components/ui/button";

type ReportCatalogStatusProps = {
  isLoading: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  projectsCount: number;
  taskTypesCount: number;
};

export function ReportCatalogStatus({
  isLoading,
  errorMessage,
  onRetry,
  projectsCount,
  taskTypesCount,
}: ReportCatalogStatusProps) {
  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Loading projects and task types…
      </p>
    );
  }

  if (errorMessage) {
    return (
      <div
        className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-3"
        role="alert"
      >
        <p className="text-sm text-foreground">Could not load form options</p>
        <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={onRetry}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (projectsCount === 0) {
    return (
      <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        No active projects are available. A manager must add projects before you
        can log tasks on a report.
      </p>
    );
  }

  if (taskTypesCount === 0) {
    return (
      <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        No active task types are available. Task type is optional, but you may
        want a manager to configure task types for clearer reporting.
      </p>
    );
  }

  return null;
}
