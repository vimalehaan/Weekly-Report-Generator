import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { ReportFormFields } from "@/components/reports/create/ReportFormFields";
import { ReportCatalogStatus } from "@/components/reports/create/ReportCatalogStatus";
import { Button, buttonVariants } from "@/components/ui/button";
import { useReportCatalog } from "@/hooks/useReportCatalog";
import {
  createReportFormSchema,
  type CreateReportFormValues,
} from "@/schemas/report/create-report.schema";
import { createReport } from "@/services/reports";
import { memberReportDetailPath, ROUTES } from "@/routes/paths";
import { getApiErrorMessage } from "@/utils/api-errors";
import { mapCreateReportFormToInput } from "@/utils/map-create-report-input";
import { cn } from "@/lib/utils";
import { isApiError } from "@/services/api";
import { useState } from "react";

export function NewReportPage() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    catalogState,
    catalogError,
    projects,
    taskTypes,
    reloadCatalog,
    catalogReady,
  } = useReportCatalog({ enabled: true });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateReportFormValues>({
    resolver: zodResolver(createReportFormSchema),
    defaultValues: {
      weekStartDate: "",
      tasks: [],
      achievements: [],
      blockers: [],
      nextWeekTasks: [],
      notes: "",
    },
  });

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
        onRetry={() => void reloadCatalog()}
        projectsCount={projects.length}
        taskTypesCount={taskTypes.length}
      />

      <form
        className="space-y-8"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <ReportFormFields
          register={register}
          control={control}
          errors={errors}
          projects={projects}
          taskTypes={taskTypes}
          disabled={formDisabled}
        />

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
