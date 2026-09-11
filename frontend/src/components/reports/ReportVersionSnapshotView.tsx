import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import type { ReportVersionContent } from "@/types/report";
import { formatReportWeekRange } from "@/utils/report-dates";

type ReportVersionSnapshotViewProps = {
  content: ReportVersionContent;
};

function formatLabel(value: string): string {
  return value.replaceAll("_", " ");
}

export function ReportVersionSnapshotView({
  content,
}: ReportVersionSnapshotViewProps) {
  const { report, tasks, achievements, blockers } = content;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium text-foreground">
          {formatReportWeekRange(report.weekStartDate, report.weekEndDate)}
        </p>
        <ReportStatusBadge status={report.status} />
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Tasks</h2>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks in snapshot.</p>
        ) : (
          <ul className="space-y-4">
            {tasks.map((task, index) => (
              <li
                key={`${task.projectId}-${task.taskName}-${index}`}
                className="space-y-3 rounded-lg border border-border bg-card p-4"
              >
                <p className="text-sm font-medium text-foreground">
                  Task {index + 1}: {task.taskName}
                </p>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Project</dt>
                    <dd>{task.projectName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Task type</dt>
                    <dd>{task.taskTypeName ?? "None"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Priority</dt>
                    <dd>{formatLabel(task.priority)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>{formatLabel(task.status)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Planned hours</dt>
                    <dd>{task.plannedHours}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Spent hours</dt>
                    <dd>{task.spentHours}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Planned completion</dt>
                    <dd>{task.plannedPercentage}%</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Actual completion</dt>
                    <dd>{task.actualPercentage}%</dd>
                  </div>
                  {task.deliverable ? (
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">Deliverable</dt>
                      <dd>{task.deliverable}</dd>
                    </div>
                  ) : null}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Achievements</h2>
        {achievements.length === 0 ? (
          <p className="text-sm text-muted-foreground">No achievements.</p>
        ) : (
          <ul className="space-y-2">
            {achievements.map((achievement, index) => (
              <li
                key={`${achievement.description}-${index}`}
                className="rounded-md border border-border px-3 py-2 text-sm"
              >
                <p>{achievement.description}</p>
                {achievement.isKeyAchievement ? (
                  <span className="mt-2 inline-flex rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-200">
                    Key achievement
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Blockers</h2>
        {blockers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No blockers.</p>
        ) : (
          <ul className="space-y-2">
            {blockers.map((blocker, index) => (
              <li
                key={`${blocker.description}-${index}`}
                className="rounded-md border border-border px-3 py-2 text-sm"
              >
                <p>{blocker.description}</p>
                {blocker.isKeyIssue ? (
                  <span className="mt-2 inline-flex rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-900 dark:text-amber-100">
                    Key issue
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Next week</h2>
        {report.nextWeekTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No next-week tasks.</p>
        ) : (
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {report.nextWeekTasks.map((task, index) => (
              <li key={`${index}-${task}`}>{task}</li>
            ))}
          </ul>
        )}
      </section>

      {report.notes ? (
        <section className="space-y-2">
          <h2 className="text-lg font-medium">Notes</h2>
          <p className="rounded-md border border-border bg-muted/30 px-3 py-3 text-sm whitespace-pre-wrap">
            {report.notes}
          </p>
        </section>
      ) : null}
    </div>
  );
}
