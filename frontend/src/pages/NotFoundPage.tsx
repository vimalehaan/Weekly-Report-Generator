import { Link } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getDefaultDashboardPath, ROUTES } from "@/routes/paths";
import { cn } from "@/lib/utils";

export function NotFoundPage() {
  const { isAuthenticated, user } = useAuth();

  const homePath =
    isAuthenticated && user
      ? getDefaultDashboardPath(user.role)
      : ROUTES.login;

  const homeLabel =
    isAuthenticated && user ? "Go to dashboard" : "Go to sign in";

  return (
    <section className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center space-y-4 py-8">
      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        404
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        The page you requested does not exist or may have been moved. Check the
        URL or use the navigation to return to the application.
      </p>
      <div className="flex flex-wrap gap-2 pt-2">
        <Link to={homePath} className={cn(buttonVariants({ size: "sm" }))}>
          {homeLabel}
        </Link>
        {!isAuthenticated ? (
          <Link
            to={ROUTES.register}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Create account
          </Link>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
          >
            Go back
          </Button>
        )}
      </div>
    </section>
  );
}
