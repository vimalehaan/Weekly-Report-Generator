import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { FormField, formInputClassName } from "@/components/common/FormField";
import { Button, buttonVariants } from "@/components/ui/button";
import { isApiError } from "@/services/api";
import { createProject } from "@/services/projects";
import {
  createProjectFormSchema,
  type CreateProjectFormValues,
} from "@/schemas/project/project.schema";
import { managerProjectDetailPath, ROUTES } from "@/routes/paths";
import { getApiErrorMessage } from "@/utils/api-errors";
import { cn } from "@/lib/utils";

export function ManagerCreateProjectPage() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function onSubmit(values: CreateProjectFormValues) {
    setSubmitError(null);

    try {
      const project = await createProject({
        name: values.name,
        description: values.description,
      });
      navigate(managerProjectDetailPath(project.id), {
        state: { created: true },
      });
    } catch (error) {
      if (isApiError(error)) {
        setSubmitError(error.message);
      } else {
        setSubmitError(getApiErrorMessage(error));
      }
    }
  }

  return (
    <section className="mx-auto max-w-xl space-y-6">
      <div className="space-y-4">
        <Link
          to={ROUTES.manager.projects}
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Back to projects
        </Link>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create project
          </h1>
          <p className="text-sm text-muted-foreground">
            New projects are active immediately and appear in report task
            selectors for team members.
          </p>
        </div>
      </div>

      <form
        className="space-y-4 rounded-lg border border-border bg-card p-4"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <FormField
          id="project-name"
          label="Project name"
          error={errors.name?.message}
        >
          <input
            id="project-name"
            type="text"
            className={formInputClassName(Boolean(errors.name))}
            {...register("name")}
          />
        </FormField>

        <FormField
          id="project-description"
          label="Description (optional)"
          error={errors.description?.message}
        >
          <textarea
            id="project-description"
            rows={4}
            className={cn(
              formInputClassName(Boolean(errors.description)),
              "min-h-24 py-2",
            )}
            {...register("description")}
          />
        </FormField>

        {submitError ? (
          <p className="text-sm text-destructive" role="alert">
            {submitError}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link
            to={ROUTES.manager.projects}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Cancel
          </Link>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create project"}
          </Button>
        </div>
      </form>
    </section>
  );
}
