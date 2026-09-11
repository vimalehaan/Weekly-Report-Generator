import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormReturn,
} from "react-hook-form";
import { useController, useFieldArray } from "react-hook-form";
import { CreateReportTaskRow } from "@/components/reports/create/CreateReportTaskRow";
import { FormField, formInputClassName } from "@/components/common/FormField";
import { WeekWindowDatePicker } from "@/components/common/WeekWindowDatePicker";
import { Button } from "@/components/ui/button";
import {
  createEmptyTaskRow,
  type CreateReportFormValues,
} from "@/schemas/report/create-report.schema";
import type { Project } from "@/types/project";
import type { TaskType } from "@/types/task-type";
import {
  computeWeekEndFromWeekStart,
  isIsoDateString,
} from "@/utils/report-dates";
import { cn } from "@/lib/utils";

type ReportFormFieldsProps = {
  register: UseFormRegister<CreateReportFormValues>;
  control: Control<CreateReportFormValues>;
  errors: FieldErrors<CreateReportFormValues>;
  projects: Project[];
  taskTypes: TaskType[];
  disabled?: boolean;
};

export function ReportFormFields({
  register,
  control,
  errors,
  projects,
  taskTypes,
  disabled = false,
}: ReportFormFieldsProps) {
  const { field: weekStartField } = useController({
    name: "weekStartDate",
    control,
  });

  const weekEndDate = isIsoDateString(weekStartField.value)
    ? computeWeekEndFromWeekStart(weekStartField.value)
    : null;
  const { fields: taskFields, append: appendTask, remove: removeTask } =
    useFieldArray({ control, name: "tasks" });

  const {
    fields: achievementFields,
    append: appendAchievement,
    remove: removeAchievement,
  } = useFieldArray({ control, name: "achievements" });

  const {
    fields: blockerFields,
    append: appendBlocker,
    remove: removeBlocker,
  } = useFieldArray({ control, name: "blockers" });

  const {
    fields: nextWeekFields,
    append: appendNextWeekTask,
    remove: removeNextWeekTask,
  } = useFieldArray({ control, name: "nextWeekTasks" });

  return (
    <fieldset disabled={disabled} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-lg font-medium">Report period</h2>
        <p className="text-sm text-muted-foreground">
          Choose the week start date. The calendar highlights the full seven-day
          reporting window (six days after the start).
        </p>
        <div className="max-w-md space-y-4">
          <FormField
            id="weekStartDate"
            label="Week start"
            error={errors.weekStartDate?.message}
          >
            <WeekWindowDatePicker
              id="weekStartDate"
              value={weekStartField.value}
              onChange={weekStartField.onChange}
              onBlur={weekStartField.onBlur}
              disabled={disabled}
              invalid={Boolean(errors.weekStartDate)}
            />
          </FormField>

          {weekEndDate ? (
            <div className="space-y-2">
              <p className="text-sm font-medium leading-none text-foreground">
                Week end
              </p>
              <p
                className={cn(
                  formInputClassName(false),
                  "flex min-h-9 items-center bg-muted/40 tabular-nums text-foreground",
                )}
              >
                {weekEndDate}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-medium">Tasks</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendTask(createEmptyTaskRow())}
          >
            Add task
          </Button>
        </div>

        {errors.tasks?.message ? (
          <p className="text-sm text-destructive" role="alert">
            {errors.tasks.message}
          </p>
        ) : null}

        {taskFields.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tasks added yet. Add at least one task to describe this week&apos;s
            work.
          </p>
        ) : (
          <div className="space-y-4">
            {taskFields.map((field, index) => (
              <CreateReportTaskRow
                key={field.id}
                index={index}
                register={register}
                errors={errors}
                projects={projects}
                taskTypes={taskTypes}
                onRemove={() => removeTask(index)}
                disabled={disabled}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-medium">Achievements</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendAchievement({ description: "", isKeyAchievement: false })
            }
          >
            Add achievement
          </Button>
        </div>

        {achievementFields.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Optional. Add highlights from this week.
          </p>
        ) : (
          <div className="space-y-3">
            {achievementFields.map((field, index) => (
              <div
                key={field.id}
                className="space-y-3 rounded-lg border border-border p-4"
              >
                <FormField
                  id={`achievements.${index}.description`}
                  label={`Achievement ${index + 1}`}
                  error={errors.achievements?.[index]?.description?.message}
                >
                  <input
                    id={`achievements.${index}.description`}
                    type="text"
                    className={formInputClassName(
                      Boolean(errors.achievements?.[index]?.description),
                    )}
                    {...register(`achievements.${index}.description`)}
                  />
                </FormField>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-input"
                    {...register(`achievements.${index}.isKeyAchievement`)}
                  />
                  Key achievement
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAchievement(index)}
                >
                  Remove achievement
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-medium">Blockers</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendBlocker({ description: "", isKeyIssue: false })
            }
          >
            Add blocker
          </Button>
        </div>

        {blockerFields.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Optional. Add issues that slowed progress.
          </p>
        ) : (
          <div className="space-y-3">
            {blockerFields.map((field, index) => (
              <div
                key={field.id}
                className="space-y-3 rounded-lg border border-border p-4"
              >
                <FormField
                  id={`blockers.${index}.description`}
                  label={`Blocker ${index + 1}`}
                  error={errors.blockers?.[index]?.description?.message}
                >
                  <input
                    id={`blockers.${index}.description`}
                    type="text"
                    className={formInputClassName(
                      Boolean(errors.blockers?.[index]?.description),
                    )}
                    {...register(`blockers.${index}.description`)}
                  />
                </FormField>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-input"
                    {...register(`blockers.${index}.isKeyIssue`)}
                  />
                  Key issue
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBlocker(index)}
                >
                  Remove blocker
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-medium">Next week</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendNextWeekTask({ description: "" })}
          >
            Add task
          </Button>
        </div>

        {nextWeekFields.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Optional. List planned work for next week.
          </p>
        ) : (
          <div className="space-y-3">
            {nextWeekFields.map((field, index) => (
              <div key={field.id} className="flex flex-col gap-2 sm:flex-row">
                <FormField
                  id={`nextWeekTasks.${index}.description`}
                  label={`Next week task ${index + 1}`}
                  error={errors.nextWeekTasks?.[index]?.description?.message}
                  className="flex-1"
                >
                  <input
                    id={`nextWeekTasks.${index}.description`}
                    type="text"
                    className={formInputClassName(
                      Boolean(errors.nextWeekTasks?.[index]?.description),
                    )}
                    {...register(`nextWeekTasks.${index}.description`)}
                  />
                </FormField>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="sm:mt-7"
                  onClick={() => removeNextWeekTask(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Notes</h2>
        <FormField
          id="notes"
          label="Additional notes (optional)"
          error={errors.notes?.message}
        >
          <textarea
            id="notes"
            rows={4}
            className={cn(
              formInputClassName(Boolean(errors.notes)),
              "min-h-24 py-2",
            )}
            {...register("notes")}
          />
        </FormField>
      </section>
    </fieldset>
  );
}

export type ReportFormControl = UseFormReturn<CreateReportFormValues>;
