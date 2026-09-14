import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useParams } from "react-router-dom";
import { DeactivateTaskTypeConfirm } from "@/components/task-types/DeactivateTaskTypeConfirm";
import { UserStatusBadge } from "@/components/users/UserStatusBadge";
import { FormField, formInputClassName } from "@/components/common/FormField";
import { Button, buttonVariants } from "@/components/ui/button";
import { isApiError } from "@/services/api";
import {
  deactivateTaskType,
  getTaskTypeById,
  updateTaskType,
} from "@/services/task-types";
import {
  updateTaskTypeFormSchema,
  type UpdateTaskTypeFormValues,
} from "@/schemas/task-type/task-type.schema";
import { ROUTES } from "@/routes/paths";
import type { TaskType } from "@/types/task-type";
import { getApiErrorMessage } from "@/utils/api-errors";
import { formatReportTimestamp } from "@/utils/report-dates";
import { cn } from "@/lib/utils";

type LoadState = "loading" | "success" | "not-found" | "error";

export function ManagerTaskTypeDetailPage() {
  const { taskTypeId } = useParams<{ taskTypeId: string }>();
  const location = useLocation();

  const [taskType, setTaskType] = useState<TaskType | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    (location.state as { created?: boolean } | null)?.created
      ? "Task type created successfully."
      : null,
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateTaskTypeFormValues>({
    resolver: zodResolver(updateTaskTypeFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const loadTaskType = useCallback(async () => {
    if (!taskTypeId) {
      setLoadState("not-found");
      return;
    }

    setLoadState("loading");
    setLoadError(null);

    try {
      const data = await getTaskTypeById(taskTypeId);
      setTaskType(data);
      reset({
        name: data.name,
        description: data.description ?? "",
      });
      setLoadState("success");
    } catch (error) {
      if (isApiError(error) && error.status === 404) {
        setLoadState("not-found");
        return;
      }

      setLoadError(getApiErrorMessage(error));
      setLoadState("error");
    }
  }, [taskTypeId, reset]);

  useEffect(() => {
    void loadTaskType();
  }, [loadTaskType]);

  async function onSave(values: UpdateTaskTypeFormValues) {
    if (!taskTypeId || !taskType) {
      return;
    }

    setSaveError(null);
    setSuccessMessage(null);

    const trimmedName = values.name.trim();
    const trimmedDescription = values.description.trim();

    const payload: {
      name?: string;
      description?: string | null;
    } = {};

    if (trimmedName !== taskType.name) {
      payload.name = trimmedName;
    }

    const currentDescription = taskType.description ?? "";
    if (trimmedDescription !== currentDescription) {
      payload.description =
        trimmedDescription.length > 0 ? trimmedDescription : null;
    }

    if (Object.keys(payload).length === 0) {
      setSaveError("No changes to save.");
      return;
    }

    try {
      const updated = await updateTaskType(taskTypeId, payload);
      setTaskType(updated);
      reset({
        name: updated.name,
        description: updated.description ?? "",
      });
      setSuccessMessage("Task type updated successfully.");
    } catch (error) {
      if (isApiError(error)) {
        setSaveError(error.message);
      } else {
        setSaveError(getApiErrorMessage(error));
      }
    }
  }

  async function handleActivate() {
    if (!taskTypeId) {
      return;
    }

    setStatusUpdating(true);
    setStatusError(null);
    setSuccessMessage(null);

    try {
      const updated = await updateTaskType(taskTypeId, { isActive: true });
      setTaskType(updated);
      setSuccessMessage("Task type reactivated.");
    } catch (error) {
      setStatusError(getApiErrorMessage(error));
    } finally {
      setStatusUpdating(false);
    }
  }

  async function handleConfirmDeactivate() {
    if (!taskTypeId) {
      return;
    }

    setStatusUpdating(true);
    setStatusError(null);
    setSuccessMessage(null);

    try {
      const updated = await deactivateTaskType(taskTypeId);
      setTaskType(updated);
      setShowDeactivateConfirm(false);
      setSuccessMessage("Task type deactivated.");
    } catch (error) {
      setStatusError(getApiErrorMessage(error));
    } finally {
      setStatusUpdating(false);
    }
  }

  if (loadState === "loading") {
    return (
      <div
        className="flex min-h-[40vh] items-center justify-center"
        role="status"
        aria-busy="true"
      >
        <p className="text-sm text-muted-foreground">Loading task type…</p>
      </div>
    );
  }

  if (loadState === "not-found") {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Task type not found
        </h1>
        <p className="text-sm text-muted-foreground">
          This task type does not exist.
        </p>
        <Link
          to={ROUTES.manager.taskTypes}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Back to task types
        </Link>
      </section>
    );
  }

  if (loadState === "error") {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Task type</h1>
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6"
          role="alert"
        >
          <p className="text-sm font-medium text-foreground">
            Could not load task type
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              void loadTaskType();
            }}
          >
            Retry
          </Button>
        </div>
      </section>
    );
  }

  if (!taskType) {
    return null;
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col gap-4">
        <Link
          to={ROUTES.manager.taskTypes}
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Back to task types
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {taskType.name}
              </h1>
              <UserStatusBadge isActive={taskType.isActive} />
            </div>
            <p className="text-xs text-muted-foreground">
              Created {formatReportTimestamp(taskType.createdAt)} · Updated{" "}
              {formatReportTimestamp(taskType.updatedAt)}
            </p>
          </div>

          {taskType.isActive ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
              disabled={statusUpdating}
              onClick={() => {
                setStatusError(null);
                setShowDeactivateConfirm(true);
              }}
            >
              Deactivate task type
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={statusUpdating}
              onClick={() => {
                void handleActivate();
              }}
            >
              {statusUpdating ? "Reactivating…" : "Reactivate task type"}
            </Button>
          )}
        </div>
      </div>

      {successMessage ? (
        <p
          className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-950 dark:text-emerald-100"
          role="status"
        >
          {successMessage}
        </p>
      ) : null}

      {statusError ? (
        <p className="text-sm text-destructive" role="alert">
          {statusError}
        </p>
      ) : null}

      {showDeactivateConfirm ? (
        <DeactivateTaskTypeConfirm
          taskTypeName={taskType.name}
          isSubmitting={statusUpdating}
          errorMessage={statusError}
          onConfirm={() => {
            void handleConfirmDeactivate();
          }}
          onCancel={() => {
            if (!statusUpdating) {
              setShowDeactivateConfirm(false);
              setStatusError(null);
            }
          }}
        />
      ) : null}

      <form
        className="space-y-4 rounded-lg border border-border bg-card p-4"
        onSubmit={handleSubmit(onSave)}
        noValidate
      >
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">
            Task type details
          </h2>
          <p className="text-sm text-muted-foreground">
            Task type names must be unique. Clear the description to remove it.
          </p>
        </div>

        <FormField
          id="edit-task-type-name"
          label="Task type name"
          error={errors.name?.message}
        >
          <input
            id="edit-task-type-name"
            type="text"
            className={formInputClassName(Boolean(errors.name))}
            {...register("name")}
          />
        </FormField>

        <FormField
          id="edit-task-type-description"
          label="Description"
          error={errors.description?.message}
        >
          <textarea
            id="edit-task-type-description"
            rows={4}
            className={cn(
              formInputClassName(Boolean(errors.description)),
              "min-h-24 py-2",
            )}
            {...register("description")}
          />
        </FormField>

        {saveError ? (
          <p className="text-sm text-destructive" role="alert">
            {saveError}
          </p>
        ) : null}

        <Button type="submit" size="sm" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </section>
  );
}
