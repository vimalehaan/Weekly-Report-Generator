import type { Report } from "@/types/report";
type ReportDetailViewProps = {
  report: Report;
};

function formatHours(value: string): string {
  return value;
}

function formatLabel(value: string): string {
  return value.replaceAll("_", " ");
}

export function ReportDetailView({ report }: ReportDetailViewProps) {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-lg font-medium">Tasks</h2>
        {report.reportTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks recorded.</p>
        ) : (
          <ul className="space-y-4">
            {report.reportTasks.map((task, index) => (
              <li
                key={task.id}
                className="space-y-3 rounded-lg border border-border bg-card p-4"
              >
                <p className="text-sm font-medium text-foreground">
                  Task {index + 1}: {task.taskName}
                </p>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Project</dt>
                    <dd>{task.project.name}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Task type</dt>
                    <dd>{task.taskType?.name ?? "None"}</dd>
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
                    <dd>{formatHours(task.plannedHours)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Spent hours</dt>
                    <dd>{formatHours(task.spentHours)}</dd>
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
        {report.achievements.length === 0 ? (
          <p className="text-sm text-muted-foreground">No achievements listed.</p>
        ) : (
          <ul className="space-y-2">
            {report.achievements.map((achievement) => (
              <li
                key={achievement.id}
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
        {report.blockers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No blockers listed.</p>
        ) : (
          <ul className="space-y-2">
            {report.blockers.map((blocker) => (
              <li
                key={blocker.id}
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
          <p className="text-sm text-muted-foreground">
            No next-week tasks listed.
          </p>
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
