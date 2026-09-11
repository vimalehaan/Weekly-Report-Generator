import { Link } from "react-router-dom";
import { UserStatusBadge } from "@/components/users/UserStatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { managerProjectDetailPath } from "@/routes/paths";
import type { Project } from "@/types/project";
import { formatReportTimestamp } from "@/utils/report-dates";
import { cn } from "@/lib/utils";

type ProjectListItemProps = {
  project: Project;
};

export function ProjectListItem({ project }: ProjectListItemProps) {
  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-3 align-top">
        <span className="font-medium text-foreground">{project.name}</span>
      </td>
      <td className="hidden px-4 py-3 align-top text-sm text-muted-foreground md:table-cell">
        {project.description ? (
          <span className="line-clamp-2">{project.description}</span>
        ) : (
          <span className="italic">No description</span>
        )}
      </td>
      <td className="px-4 py-3 align-top">
        <UserStatusBadge isActive={project.isActive} />
      </td>
      <td className="hidden px-4 py-3 align-top text-xs text-muted-foreground lg:table-cell">
        {formatReportTimestamp(project.updatedAt)}
      </td>
      <td className="px-4 py-3 align-top text-right">
        <Link
          to={managerProjectDetailPath(project.id)}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Manage
        </Link>
      </td>
    </tr>
  );
}
