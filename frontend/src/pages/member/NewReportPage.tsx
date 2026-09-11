import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { CreateReportTaskRow } from "@/components/reports/create/CreateReportTaskRow";
import { ReportCatalogStatus } from "@/components/reports/create/ReportCatalogStatus";
import { FormField, formInputClassName } from "@/components/common/FormField";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  createEmptyTaskRow,
  createReportFormSchema,
  type CreateReportFormValues,
} from "@/schemas/report/create-report.schema";
import { createReport } from "@/services/reports";
import { getProjects } from "@/services/projects";
import { getTaskTypes } from "@/services/task-types";
import { memberReportDetailPath, ROUTES } from "@/routes/paths";
import type { Project } from "@/types/project";
import type { TaskType } from "@/types/task-type";
import { getApiErrorMessage } from "@/utils/api-errors";
import { mapCreateReportFormToInput } from "@/utils/map-create-report-input";
import { cn } from "@/lib/utils";
import { isApiError } from "@/services/api";

type CatalogState = "loading" | "ready" | "error";

export function NewReportPage() {
  const navigate = useNavigate();
  const [catalogState, setCatalogState] = useState<CatalogState>("loading");
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateReportFormValues>({
    resolver: zodResolver(createReportFormSchema),
    defaultValues: {
      weekStartDate: "",
      weekEndDate: "",
      tasks: [],
      achievements: [],
      blockers: [],
      nextWeekTasks: [],
      notes: "",
    },
  });

  const {
    fields: taskFields,
    append: appendTask,
    remove: removeTask,
  } = useFieldArray({
    control,
    name: "tasks",
  });

  const {
    fields: achievementFields,
    append: appendAchievement,
    remove: removeAchievement,
  } = useFieldArray({
    control,
    name: "achievements",
  });

  const {
    fields: blockerFields,
    append: appendBlocker,
    remove: removeBlocker,
  } = useFieldArray({
    control,
    name: "blockers",
  });

  const {
    fields: nextWeekFields,
    append: appendNextWeekTask,
    remove: removeNextWeekTask,
  } = useFieldArray({
    control,
    name: "nextWeekTasks",
  });

  const loadCatalog = useCallback(async () => {
    setCatalogState("loading");
    setCatalogError(null);

    try {
      const [projectList, taskTypeList] = await Promise.all([
        getProjects({ isActive: true }),
        getTaskTypes({ isActive: true }),
      ]);

      setProjects(projectList);
      setTaskTypes(taskTypeList);
      setCatalogState("ready");
    } catch (error) {
      setCatalogError(getApiErrorMessage(error));
      setCatalogState("error");
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const catalogReady = catalogState === "ready";
  const formDisabled = isSubmitting || !catalogReady || projects.length === 0;

  async function onSubmit(values: CreateReportFormValues) {
    setSubmitError(null);

    try {
      const report = await createReport(mapCreateReportFormToInput(values));
      navigate(memberReportDetailPath(report.id), {
        replace: true,
        state: { draftCreated: true },
      });
    } catch (error) {
      if (isApiError(error) && error.code === "VALIDATION_ERROR") {
        setSubmitError(error.message);
      } else {
        setSubmitError(getApiErrorMessage(error));
      }
    }
  }

  return (
    <section className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create Weekly Report
        </h1>
        <p className="text-sm text-muted-foreground">
          Save a draft with this week&apos;s tasks, achievements, blockers, and
          plans for next week.
        </p>
      </div>

      <ReportCatalogStatus
        isLoading={catalogState === "loading"}
        errorMessage={catalogState === "error" ? catalogError : null}
        onRetry={() => void loadCatalog()}
        projectsCount={projects.length}
        taskTypesCount={taskTypes.length}
      />

      <form
        className="space-y-8"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <fieldset disabled={formDisabled} className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-lg font-medium">Report period</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="weekStartDate"
                label="Week start"
                error={errors.weekStartDate?.message}
              >
                <input
                  id="weekStartDate"
                  type="date"
                  className={formInputClassName(Boolean(errors.weekStartDate))}
                  {...register("weekStartDate")}
                />
              </FormField>

              <FormField
                id="weekEndDate"
                label="Week end"
                error={errors.weekEndDate?.message}
              >
                <input
                  id="weekEndDate"
                  type="date"
                  className={formInputClassName(Boolean(errors.weekEndDate))}
                  {...register("weekEndDate")}
                />
              </FormField>
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
                No tasks added yet. Add at least one task to describe this
                week&apos;s work.
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
                    disabled={formDisabled}
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
                  appendAchievement({
                    description: "",
                    isKeyAchievement: false,
                  })
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

        {submitError ? (
          <p className="text-sm text-destructive" role="alert">
            {submitError}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to={ROUTES.member.reports}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "inline-flex justify-center",
            )}
          >
            Cancel
          </Link>
          <Button type="submit" disabled={formDisabled || isSubmitting}>
            {isSubmitting ? "Saving draft…" : "Save draft"}
          </Button>
        </div>
      </form>
    </section>
  );
}
