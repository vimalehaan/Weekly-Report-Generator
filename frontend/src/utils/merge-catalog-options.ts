import type { Report } from "@/types/report";
import type { Project } from "@/types/project";
import type { TaskType } from "@/types/task-type";

function sortByName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

export function mergeProjectsForForm(
  activeProjects: Project[],
  report: Report | null,
): Project[] {
  const byId = new Map(activeProjects.map((project) => [project.id, project]));

  if (report) {
    for (const task of report.reportTasks) {
      const project = task.project;
      if (project && !byId.has(project.id)) {
        byId.set(project.id, project);
      }
    }
  }

  return sortByName(Array.from(byId.values()));
}

export function mergeTaskTypesForForm(
  activeTaskTypes: TaskType[],
  report: Report | null,
): TaskType[] {
  const byId = new Map(activeTaskTypes.map((taskType) => [taskType.id, taskType]));

  if (report) {
    for (const task of report.reportTasks) {
      if (task.taskType && !byId.has(task.taskType.id)) {
        byId.set(task.taskType.id, task.taskType);
      }
    }
  }

  return sortByName(Array.from(byId.values()));
}

export function formatCatalogOptionLabel(
  name: string,
  isActive: boolean,
): string {
  return isActive ? name : `${name} (inactive)`;
}
