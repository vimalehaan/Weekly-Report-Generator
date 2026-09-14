import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useParams } from "react-router-dom";
import { DeactivateProjectConfirm } from "@/components/projects/DeactivateProjectConfirm";
import { UserStatusBadge } from "@/components/users/UserStatusBadge";
import { FormField, formInputClassName } from "@/components/common/FormField";
import { Button, buttonVariants } from "@/components/ui/button";
import { isApiError } from "@/services/api";
import {
  deactivateProject,
  getProjectById,
  updateProject,
} from "@/services/projects";
import {
  updateProjectFormSchema,
  type UpdateProjectFormValues,
} from "@/schemas/project/project.schema";
import { ROUTES } from "@/routes/paths";
import type { Project } from "@/types/project";
import { getApiErrorMessage } from "@/utils/api-errors";
import { formatReportTimestamp } from "@/utils/report-dates";
import { cn } from "@/lib/utils";

type LoadState = "loading" | "success" | "not-found" | "error";

export function ManagerProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();

  const [project, setProject] = useState<Project | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    (location.state as { created?: boolean } | null)?.created
      ? "Project created successfully."
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
  } = useForm<UpdateProjectFormValues>({
    resolver: zodResolver(updateProjectFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const loadProject = useCallback(async () => {
    if (!projectId) {
      setLoadState("not-found");
      return;
    }

    setLoadState("loading");
    setLoadError(null);

    try {
      const data = await getProjectById(projectId);
      setProject(data);
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
  }, [projectId, reset]);

  useEffect(() => {
    void loadProject();
  }, [loadProject]);

  async function onSave(values: UpdateProjectFormValues) {
    if (!projectId || !project) {
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

    if (trimmedName !== project.name) {
      payload.name = trimmedName;
    }

    const currentDescription = project.description ?? "";
    if (trimmedDescription !== currentDescription) {
      payload.description =
        trimmedDescription.length > 0 ? trimmedDescription : null;
    }

    if (Object.keys(payload).length === 0) {
      setSaveError("No changes to save.");
      return;
    }

    try {
      const updated = await updateProject(projectId, payload);
      setProject(updated);
      reset({
        name: updated.name,
        description: updated.description ?? "",
      });
      setSuccessMessage("Project updated successfully.");
    } catch (error) {
      if (isApiError(error)) {
        setSaveError(error.message);
      } else {
        setSaveError(getApiErrorMessage(error));
      }
    }
  }

  async function handleActivate() {
    if (!projectId) {
      return;
    }

    setStatusUpdating(true);
    setStatusError(null);
    setSuccessMessage(null);

    try {
      const updated = await updateProject(projectId, { isActive: true });
      setProject(updated);
      setSuccessMessage("Project reactivated.");
    } catch (error) {
      setStatusError(getApiErrorMessage(error));
    } finally {
      setStatusUpdating(false);
    }
  }

  async function handleConfirmDeactivate() {
    if (!projectId) {
      return;
    }

    setStatusUpdating(true);
    setStatusError(null);
    setSuccessMessage(null);

    try {
      const updated = await deactivateProject(projectId);
      setProject(updated);
      setShowDeactivateConfirm(false);
      setSuccessMessage("Project deactivated.");
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
        <p className="text-sm text-muted-foreground">Loading project…</p>
      </div>
    );
  }

  if (loadState === "not-found") {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Project not found
        </h1>
        <p className="text-sm text-muted-foreground">
          This project does not exist.
        </p>
        <Link
          to={ROUTES.manager.projects}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Back to projects
        </Link>
      </section>
    );
  }

  if (loadState === "error") {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Project</h1>
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6"
          role="alert"
        >
          <p className="text-sm font-medium text-foreground">
            Could not load project
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              void loadProject();
            }}
          >
            Retry
          </Button>
        </div>
      </section>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col gap-4">
        <Link
          to={ROUTES.manager.projects}
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Back to projects
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {project.name}
              </h1>
              <UserStatusBadge isActive={project.isActive} />
            </div>
            <p className="text-xs text-muted-foreground">
              Created {formatReportTimestamp(project.createdAt)} · Updated{" "}
              {formatReportTimestamp(project.updatedAt)}
            </p>
          </div>

          {project.isActive ? (
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
              Deactivate project
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
              {statusUpdating ? "Reactivating…" : "Reactivate project"}
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
        <DeactivateProjectConfirm
          projectName={project.name}
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
            Project details
          </h2>
          <p className="text-sm text-muted-foreground">
            Project names must be unique. Clear the description to remove it.
          </p>
        </div>

        <FormField
          id="edit-project-name"
          label="Project name"
          error={errors.name?.message}
        >
          <input
            id="edit-project-name"
            type="text"
            className={formInputClassName(Boolean(errors.name))}
            {...register("name")}
          />
        </FormField>

        <FormField
          id="edit-project-description"
          label="Description"
          error={errors.description?.message}
        >
          <textarea
            id="edit-project-description"
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
