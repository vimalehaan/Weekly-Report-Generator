import { Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/constants/app";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/routes/paths";
import { getAuthErrorMessage } from "@/utils/auth-errors";
import { formatRoleName } from "@/utils/role";

type AppHeaderProps = {
  variant?: "public" | "app";
  homePath?: string;
  onOpenMobileNav?: () => void;
};

export function AppHeader({
  variant = "public",
  homePath = ROUTES.home,
  onOpenMobileNav,
}: AppHeaderProps) {
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

  const isAppShell = variant === "app";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card">
      <div
        className={cn(
          "flex h-14 items-center justify-between gap-4 px-4",
          isAppShell ? "md:px-6" : "mx-auto max-w-6xl",
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          {isAppShell ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="md:hidden"
              onClick={onOpenMobileNav}
              aria-label="Open navigation menu"
            >
              <Menu className="size-4" />
            </Button>
          ) : null}

          {!isAppShell ? (
            <Link
              to={homePath}
              className="truncate text-sm font-semibold tracking-tight text-foreground"
            >
              {APP_NAME}
            </Link>
          ) : (
            <p className="truncate text-sm font-medium text-muted-foreground md:hidden">
              {APP_NAME}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {logoutError ? (
            <p className="text-xs text-destructive" role="alert">
              {logoutError}
            </p>
          ) : null}

          {isAuthenticated && user ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-foreground">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatRoleName(user.role)}
                </p>
              </div>
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
