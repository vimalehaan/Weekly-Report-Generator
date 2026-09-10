import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function HomePage() {
  const { user } = useAuth();
  const location = useLocation();
  const forbidden = Boolean(
    (location.state as { forbidden?: boolean } | null)?.forbidden,
  );

  if (!user) {
    return null;
  }

  return (
    <section className="space-y-4">
      {forbidden ? (
        <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
          You do not have permission to access that page.
        </p>
      ) : null}

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome, {user.firstName}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          You are signed in as {user.email} ({user.role.replace("_", " ")}).
          Report, dashboard, and management features will be added in upcoming
          milestones.
        </p>
      </div>
    </section>
  );
}
