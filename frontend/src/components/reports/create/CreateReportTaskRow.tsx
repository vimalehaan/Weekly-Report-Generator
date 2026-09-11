import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { FormField, formInputClassName } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import type { CreateReportFormValues } from "@/schemas/report/create-report.schema";
import type { Project } from "@/types/project";
import type { TaskType } from "@/types/task-type";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/types/report";
import { formatCatalogOptionLabel } from "@/utils/merge-catalog-options";

type CreateReportTaskRowProps = {
  index: number;
  register: UseFormRegister<CreateReportFormValues>;
  errors: FieldErrors<CreateReportFormValues>;
  projects: Project[];
  taskTypes: TaskType[];
  onRemove: () => void;
  disabled?: boolean;
};

export function CreateReportTaskRow({
  index,
  register,
  errors,
  projects,
  taskTypes,
  onRemove,
  disabled = false,
}: CreateReportTaskRowProps) {
  const taskErrors = errors.tasks?.[index];

  return (
    <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-foreground">Task {index + 1}</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={disabled}
        >
          Remove task
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id={`tasks.${index}.projectId`}
          label="Project"
          error={taskErrors?.projectId?.message}
        >
          <select
            id={`tasks.${index}.projectId`}
            className={formInputClassName(Boolean(taskErrors?.projectId))}
            disabled={disabled || projects.length === 0}
            {...register(`tasks.${index}.projectId`)}
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {formatCatalogOptionLabel(project.name, project.isActive)}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          id={`tasks.${index}.taskTypeId`}
          label="Task type"
          error={taskErrors?.taskTypeId?.message}
        >
          <select
            id={`tasks.${index}.taskTypeId`}
            className={formInputClassName(Boolean(taskErrors?.taskTypeId))}
            disabled={disabled}
            {...register(`tasks.${index}.taskTypeId`)}
          >
            <option value="">None</option>
            {taskTypes.map((taskType) => (
              <option key={taskType.id} value={taskType.id}>
                {formatCatalogOptionLabel(taskType.name, taskType.isActive)}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField
        id={`tasks.${index}.taskName`}
        label="Task name / description"
        error={taskErrors?.taskName?.message}
      >
        <input
          id={`tasks.${index}.taskName`}
          type="text"
          className={formInputClassName(Boolean(taskErrors?.taskName))}
          disabled={disabled}
          {...register(`tasks.${index}.taskName`)}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id={`tasks.${index}.priority`}
          label="Priority"
          error={taskErrors?.priority?.message}
        >
          <select
            id={`tasks.${index}.priority`}
            className={formInputClassName(Boolean(taskErrors?.priority))}
            disabled={disabled}
            {...register(`tasks.${index}.priority`)}
          >
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority.replace("_", " ")}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          id={`tasks.${index}.status`}
          label="Status"
          error={taskErrors?.status?.message}
        >
          <select
            id={`tasks.${index}.status`}
            className={formInputClassName(Boolean(taskErrors?.status))}
            disabled={disabled}
            {...register(`tasks.${index}.status`)}
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ")}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id={`tasks.${index}.plannedPercentage`}
          label="Planned completion (%)"
          error={taskErrors?.plannedPercentage?.message}
        >
          <input
            id={`tasks.${index}.plannedPercentage`}
            type="number"
            min={0}
            max={100}
            step={1}
            className={formInputClassName(Boolean(taskErrors?.plannedPercentage))}
            disabled={disabled}
            {...register(`tasks.${index}.plannedPercentage`, {
              valueAsNumber: true,
            })}
          />
        </FormField>

        <FormField
          id={`tasks.${index}.actualPercentage`}
          label="Actual completion (%)"
          error={taskErrors?.actualPercentage?.message}
        >
          <input
            id={`tasks.${index}.actualPercentage`}
            type="number"
            min={0}
            max={100}
            step={1}
            className={formInputClassName(Boolean(taskErrors?.actualPercentage))}
            disabled={disabled}
            {...register(`tasks.${index}.actualPercentage`, {
              valueAsNumber: true,
            })}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id={`tasks.${index}.plannedHours`}
          label="Planned hours"
          error={taskErrors?.plannedHours?.message}
        >
          <input
            id={`tasks.${index}.plannedHours`}
            type="number"
            min={0}
            step={0.25}
            className={formInputClassName(Boolean(taskErrors?.plannedHours))}
            disabled={disabled}
            {...register(`tasks.${index}.plannedHours`, { valueAsNumber: true })}
          />
        </FormField>

        <FormField
          id={`tasks.${index}.spentHours`}
          label="Spent hours"
          error={taskErrors?.spentHours?.message}
        >
          <input
            id={`tasks.${index}.spentHours`}
            type="number"
            min={0}
            step={0.25}
            className={formInputClassName(Boolean(taskErrors?.spentHours))}
            disabled={disabled}
            {...register(`tasks.${index}.spentHours`, { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <FormField
        id={`tasks.${index}.deliverable`}
        label="Deliverable (optional)"
        error={taskErrors?.deliverable?.message}
      >
        <input
          id={`tasks.${index}.deliverable`}
          type="text"
          className={formInputClassName(Boolean(taskErrors?.deliverable))}
          disabled={disabled}
          {...register(`tasks.${index}.deliverable`)}
        />
      </FormField>
    </div>
  );
}
