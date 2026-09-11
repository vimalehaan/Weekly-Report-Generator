import type { CreateReportFormValues } from "@/schemas/report/create-report.schema";
import type { Report } from "@/types/report";

function toDateInputValue(isoDate: string): string {
  return isoDate.slice(0, 10);
}

function parseHours(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseNextWeekTasks(value: Report["nextWeekTasks"]): { description: string }[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => ({
    description: typeof item === "string" ? item : String(item),
  }));
}

export function mapReportToFormValues(report: Report): CreateReportFormValues {
  return {
    weekStartDate: toDateInputValue(report.weekStartDate),
    weekEndDate: toDateInputValue(report.weekEndDate),
    tasks: report.reportTasks.map((task) => ({
      projectId: task.projectId,
      taskTypeId: task.taskTypeId ?? "",
      taskName: task.taskName,
      priority: task.priority,
      plannedPercentage: task.plannedPercentage,
      actualPercentage: task.actualPercentage,
      status: task.status,
      plannedHours: parseHours(task.plannedHours),
      spentHours: parseHours(task.spentHours),
      deliverable: task.deliverable ?? "",
    })),
    achievements: report.achievements.map((achievement) => ({
      description: achievement.description,
      isKeyAchievement: achievement.isKeyAchievement,
    })),
    blockers: report.blockers.map((blocker) => ({
      description: blocker.description,
      isKeyIssue: blocker.isKeyIssue,
    })),
    nextWeekTasks: parseNextWeekTasks(report.nextWeekTasks),
    notes: report.notes ?? "",
  };
}
