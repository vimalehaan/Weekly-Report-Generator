import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { FormField, formInputClassName } from "@/components/common/FormField";
import { Button, buttonVariants } from "@/components/ui/button";
import { isApiError } from "@/services/api";
import { createTaskType } from "@/services/task-types";
import {
  createTaskTypeFormSchema,
  type CreateTaskTypeFormValues,
} from "@/schemas/task-type/task-type.schema";
import { managerTaskTypeDetailPath, ROUTES } from "@/routes/paths";
import { getApiErrorMessage } from "@/utils/api-errors";
import { cn } from "@/lib/utils";

export function ManagerCreateTaskTypePage() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskTypeFormValues>({
    resolver: zodResolver(createTaskTypeFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function onSubmit(values: CreateTaskTypeFormValues) {
    setSubmitError(null);

    try {
      const taskType = await createTaskType({
        name: values.name,
        description: values.description,
      });
      navigate(managerTaskTypeDetailPath(taskType.id), {
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
          to={ROUTES.manager.taskTypes}
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Back to task types
        </Link>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create task type
          </h1>
          <p className="text-sm text-muted-foreground">
            New task types are active immediately and appear in report task
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
          id="task-type-name"
          label="Task type name"
          error={errors.name?.message}
        >
          <input
            id="task-type-name"
            type="text"
            className={formInputClassName(Boolean(errors.name))}
            {...register("name")}
          />
        </FormField>

        <FormField
          id="task-type-description"
          label="Description (optional)"
          error={errors.description?.message}
        >
          <textarea
            id="task-type-description"
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
            to={ROUTES.manager.taskTypes}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Cancel
          </Link>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create task type"}
          </Button>
        </div>
      </form>
    </section>
  );
}
