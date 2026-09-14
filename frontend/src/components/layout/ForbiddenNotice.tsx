import { useLocation } from "react-router-dom";

export function ForbiddenNotice() {
  const location = useLocation();
  const forbidden = Boolean(
    (location.state as { forbidden?: boolean } | null)?.forbidden,
  );

  if (!forbidden) {
    return null;
  }

  return (
    <p
      className="mb-4 rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
      role="status"
    >
      You do not have permission to access that page.
    </p>
  );
}
