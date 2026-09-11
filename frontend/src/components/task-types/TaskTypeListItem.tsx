import { Link } from "react-router-dom";
import { UserStatusBadge } from "@/components/users/UserStatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { managerTaskTypeDetailPath } from "@/routes/paths";
import type { TaskType } from "@/types/task-type";
import { formatReportTimestamp } from "@/utils/report-dates";
import { cn } from "@/lib/utils";

type TaskTypeListItemProps = {
  taskType: TaskType;
};

export function TaskTypeListItem({ taskType }: TaskTypeListItemProps) {
  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-3 align-top">
        <span className="font-medium text-foreground">{taskType.name}</span>
      </td>
      <td className="hidden px-4 py-3 align-top text-sm text-muted-foreground md:table-cell">
        {taskType.description ? (
          <span className="line-clamp-2">{taskType.description}</span>
        ) : (
          <span className="italic">No description</span>
        )}
      </td>
      <td className="px-4 py-3 align-top">
        <UserStatusBadge isActive={taskType.isActive} />
      </td>
      <td className="hidden px-4 py-3 align-top text-xs text-muted-foreground lg:table-cell">
        {formatReportTimestamp(taskType.updatedAt)}
      </td>
      <td className="px-4 py-3 align-top text-right">
        <Link
          to={managerTaskTypeDetailPath(taskType.id)}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Manage
        </Link>
      </td>
    </tr>
  );
}
