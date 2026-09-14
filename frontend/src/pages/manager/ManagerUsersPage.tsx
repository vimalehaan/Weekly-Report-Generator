import { useCallback, useEffect, useState } from "react";
import {
  UserListFilters,
  userListFiltersToApi,
  type UserListFilterValues,
} from "@/components/users/UserListFilters";
import { UserList } from "@/components/users/UserList";
import { Button } from "@/components/ui/button";
import { getUsers } from "@/services/users";
import type { ManagedUser } from "@/types/user";
import { getApiErrorMessage } from "@/utils/api-errors";

type LoadState = "loading" | "success" | "error";

const EMPTY_FILTERS: UserListFilterValues = {
  role: "",
  activeStatus: "all",
};

export function ManagerUsersPage() {
  const [filters, setFilters] = useState<UserListFilterValues>(EMPTY_FILTERS);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoadState("loading");
    setErrorMessage(null);

    try {
      const data = await getUsers(userListFiltersToApi(filters));
      setUsers(data);
      setLoadState("success");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
      setLoadState("error");
    }
  }, [filters]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const hasActiveFilters =
    filters.role !== "" || filters.activeStatus !== "all";

  const isEmpty =
    loadState === "success" && users.length === 0;

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">User management</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          View and manage team member and manager accounts. Update names and
          activate or deactivate access. Roles cannot be changed here.
        </p>
      </div>

      <UserListFilters
        values={filters}
        disabled={loadState === "loading"}
        onChange={setFilters}
      />

      {loadState === "loading" ? (
        <div
          className="flex min-h-[240px] items-center justify-center rounded-lg border border-border bg-card"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <p className="text-sm text-muted-foreground">Loading users…</p>
        </div>
      ) : null}

      {loadState === "error" ? (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6"
          role="alert"
        >
          <p className="text-sm font-medium text-foreground">
            Could not load users
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              void loadUsers();
            }}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
          <h2 className="text-lg font-medium text-foreground">
            {hasActiveFilters ? "No matching users" : "No users found"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Try adjusting or clearing your filters."
              : "There are no user accounts in the system yet."}
          </p>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-6"
              onClick={() => setFilters(EMPTY_FILTERS)}
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      ) : null}

      {loadState === "success" && users.length > 0 ? (
        <UserList users={users} />
      ) : null}
    </section>
  );
}
