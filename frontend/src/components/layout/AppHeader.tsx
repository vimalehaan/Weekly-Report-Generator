import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/constants/app";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/routes/paths";
import { getAuthErrorMessage } from "@/utils/auth-errors";

export function AppHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setLogoutError(null);
    setIsLoggingOut(true);

    try {
      await logout();
    } catch (error) {
      setLogoutError(getAuthErrorMessage(error));
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          to={ROUTES.home}
          className="text-sm font-semibold tracking-tight text-foreground"
        >
          {APP_NAME}
        </Link>

        <div className="flex items-center gap-3">
          {logoutError ? (
            <p className="text-xs text-destructive" role="alert">
              {logoutError}
            </p>
          ) : null}

          {isAuthenticated && user ? (
            <>
              <p className="hidden text-sm text-muted-foreground sm:block">
                {user.firstName} {user.lastName}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Signing out…" : "Sign out"}
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to={ROUTES.login}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Sign in
              </Link>
              <Link
                to={ROUTES.register}
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
