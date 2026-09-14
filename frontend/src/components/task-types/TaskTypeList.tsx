import { Link } from "react-router-dom";
import { TaskTypeListItem } from "@/components/task-types/TaskTypeListItem";
import { UserStatusBadge } from "@/components/users/UserStatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { managerTaskTypeDetailPath } from "@/routes/paths";
import type { TaskType } from "@/types/task-type";
import { formatReportTimestamp } from "@/utils/report-dates";
import { cn } from "@/lib/utils";

type TaskTypeListProps = {
  taskTypes: TaskType[];
};

export function TaskTypeList({ taskTypes }: TaskTypeListProps) {
  return (
    <>
      <div className="space-y-3 md:hidden">
        {taskTypes.map((taskType) => (
          <article
            key={taskType.id}
            className="rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">
                {taskType.name}
              </h3>
              <UserStatusBadge isActive={taskType.isActive} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {taskType.description ?? "No description"}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Updated {formatReportTimestamp(taskType.updatedAt)}
            </p>
            <Link
              to={managerTaskTypeDetailPath(taskType.id)}
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
              <th className="hidden px-4 py-3 font-medium md:table-cell">
                Description
              </th>
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
            {taskTypes.map((taskType) => (
              <TaskTypeListItem key={taskType.id} taskType={taskType} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
