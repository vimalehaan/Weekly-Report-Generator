/**
 * Report nextWeekTasks may be string[] (API-created) or legacy seed objects
 * { task, priority } stored in JSONB.
 */
export function formatNextWeekTaskLabel(item: unknown): string {
  if (typeof item === "string") {
    return item;
  }

  if (item && typeof item === "object" && "task" in item) {
    const record = item as { task?: unknown; priority?: unknown };
    if (typeof record.task === "string") {
      const task = record.task.trim();
      if (typeof record.priority === "string" && record.priority.trim()) {
        return `${task} (${record.priority.trim()} priority)`;
      }
      return task;
    }
  }

  return String(item);
}
