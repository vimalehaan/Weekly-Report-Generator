import { Link } from "react-router-dom";
import { UserListItem } from "@/components/users/UserListItem";
import { UserRoleBadge } from "@/components/users/UserRoleBadge";
import { UserStatusBadge } from "@/components/users/UserStatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { managerUserDetailPath } from "@/routes/paths";
import type { ManagedUser } from "@/types/user";
import { formatReportTimestamp } from "@/utils/report-dates";
import { formatUserDisplayName } from "@/utils/user-display";
import { cn } from "@/lib/utils";

type UserListProps = {
  users: ManagedUser[];
};

export function UserList({ users }: UserListProps) {
  return (
    <>
      <div className="space-y-3 md:hidden">
        {users.map((user) => (
          <article
            key={user.id}
            className="rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">
                {formatUserDisplayName(user)}
              </h3>
              <UserRoleBadge role={user.role} />
              <UserStatusBadge isActive={user.isActive} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Updated {formatReportTimestamp(user.updatedAt)}
            </p>
            <Link
              to={managerUserDetailPath(user.id)}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "mt-4 inline-flex",
              )}
            >
              Manage
            </Link>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-border bg-card md:block">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">
                Email
              </th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">
                Updated
              </th>
              <th className="px-4 py-3 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserListItem key={user.id} user={user} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
