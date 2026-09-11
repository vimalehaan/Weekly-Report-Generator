import { Link } from "react-router-dom";
import { UserRoleBadge } from "@/components/users/UserRoleBadge";
import { UserStatusBadge } from "@/components/users/UserStatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { managerUserDetailPath } from "@/routes/paths";
import type { ManagedUser } from "@/types/user";
import { formatReportTimestamp } from "@/utils/report-dates";
import { formatUserDisplayName } from "@/utils/user-display";
import { cn } from "@/lib/utils";

type UserListItemProps = {
  user: ManagedUser;
};

export function UserListItem({ user }: UserListItemProps) {
  const detailPath = managerUserDetailPath(user.id);
  const displayName = formatUserDisplayName(user);

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-3 align-top">
        <span className="font-medium text-foreground">{displayName}</span>
      </td>
      <td className="hidden px-4 py-3 align-top text-muted-foreground sm:table-cell">
        {user.email}
      </td>
      <td className="px-4 py-3 align-top">
        <UserRoleBadge role={user.role} />
      </td>
      <td className="px-4 py-3 align-top">
        <UserStatusBadge isActive={user.isActive} />
      </td>
      <td className="hidden px-4 py-3 align-top text-xs text-muted-foreground lg:table-cell">
        {formatReportTimestamp(user.updatedAt)}
      </td>
      <td className="px-4 py-3 align-top text-right">
        <Link
          to={detailPath}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Manage
        </Link>
      </td>
    </tr>
  );
}
