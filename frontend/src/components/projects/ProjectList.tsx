import { Link } from "react-router-dom";
import { ProjectListItem } from "@/components/projects/ProjectListItem";
import { UserStatusBadge } from "@/components/users/UserStatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { managerProjectDetailPath } from "@/routes/paths";
import type { Project } from "@/types/project";
import { formatReportTimestamp } from "@/utils/report-dates";
import { cn } from "@/lib/utils";

type ProjectListProps = {
  projects: Project[];
};

export function ProjectList({ projects }: ProjectListProps) {
  return (
    <>
      <div className="space-y-3 md:hidden">
        {projects.map((project) => (
          <article
            key={project.id}
            className="rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">
                {project.name}
              </h3>
              <UserStatusBadge isActive={project.isActive} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {project.description ?? "No description"}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Updated {formatReportTimestamp(project.updatedAt)}
            </p>
            <Link
              to={managerProjectDetailPath(project.id)}
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
            {projects.map((project) => (
              <ProjectListItem key={project.id} project={project} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
