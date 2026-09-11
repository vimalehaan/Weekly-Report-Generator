import type { CreateReportFormValues } from "@/schemas/report/create-report.schema";
import type { CreateReportInput } from "@/types/report";

export function mapCreateReportFormToInput(
  values: CreateReportFormValues,
): CreateReportInput {
  return {
    weekStartDate: values.weekStartDate,
    weekEndDate: values.weekEndDate,
    tasks: values.tasks.map((task) => ({
      projectId: task.projectId,
      taskTypeId: task.taskTypeId === "" ? null : task.taskTypeId,
      taskName: task.taskName,
      priority: task.priority,
      plannedPercentage: task.plannedPercentage,
      actualPercentage: task.actualPercentage,
      status: task.status,
      plannedHours: task.plannedHours,
      spentHours: task.spentHours,
      ...(task.deliverable && task.deliverable.length > 0
        ? { deliverable: task.deliverable }
        : {}),
    })),
    nextWeekTasks: values.nextWeekTasks.map((task) => task.description),
    achievements: values.achievements,
    blockers: values.blockers,
    ...(values.notes && values.notes.length > 0 ? { notes: values.notes } : {}),
  };
}
