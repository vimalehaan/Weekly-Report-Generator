import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useParams } from "react-router-dom";
import { ReportDetailView } from "@/components/reports/ReportDetailView";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { SubmitReportConfirm } from "@/components/reports/SubmitReportConfirm";
import { ReportFormFields } from "@/components/reports/create/ReportFormFields";
import { ReportCatalogStatus } from "@/components/reports/create/ReportCatalogStatus";
import { Button, buttonVariants } from "@/components/ui/button";
import { useReportCatalog } from "@/hooks/useReportCatalog";
import {
  createReportFormSchema,
  type CreateReportFormValues,
} from "@/schemas/report/create-report.schema";
import {
  getReportById,
  submitReport,
  updateReport,
} from "@/services/reports";
import { memberReportVersionsPath, ROUTES } from "@/routes/paths";
import type { Report } from "@/types/report";
import { isApiError } from "@/services/api";
import { getApiErrorMessage } from "@/utils/api-errors";
import { mapCreateReportFormToInput } from "@/utils/map-create-report-input";
import { mapReportToFormValues } from "@/utils/map-report-to-form-values";
import {
  canEditReport,
  canSubmitReport,
  getReportStatusHint,
} from "@/utils/report-workflow";
import {
  formatReportTimestamp,
  formatReportWeekRange,
} from "@/utils/report-dates";
import { cn } from "@/lib/utils";

type PageMode = "view" | "edit";
type LoadState = "loading" | "success" | "not-found" | "forbidden" | "error";

export function MemberReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const location = useLocation();

  const [report, setReport] = useState<Report | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mode, setMode] = useState<PageMode>("view");
  const [successMessage, setSuccessMessage] = useState<string | null>(
    (location.state as { draftCreated?: boolean } | null)?.draftCreated
      ? "Draft saved successfully."
      : null,
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const {
    catalogState,
    catalogError,
    projects,
    taskTypes,
    reloadCatalog,
    catalogReady,
  } = useReportCatalog({
    report,
    enabled: mode === "edit",
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
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

  const loadReport = useCallback(async () => {
    if (!reportId) {
      setLoadState("not-found");
      return;
    }

    setLoadState("loading");
    setLoadError(null);

    try {
      const data = await getReportById(reportId);
      setReport(data);
      setLoadState("success");
    } catch (error) {
      if (isApiError(error)) {
        if (error.status === 404) {
          setLoadState("not-found");
          return;
        }

        if (error.status === 403) {
          setLoadState("forbidden");
          return;
        }
      }

      setLoadError(getApiErrorMessage(error));
      setLoadState("error");
    }
  }, [reportId]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  useEffect(() => {
    if (mode === "edit" && report) {
      reset(mapReportToFormValues(report));
    }
  }, [mode, report, reset]);

  function enterEditMode() {
    if (!report || !canEditReport(report.status)) {
      return;
    }

    setSaveError(null);
    setSuccessMessage(null);
    setMode("edit");
  }

  function cancelEdit() {
    setSaveError(null);
    setMode("view");
  }

  async function onSave(values: CreateReportFormValues) {
    if (!reportId) {
      return;
    }

    setSaveError(null);

    try {
      const updated = await updateReport(
        reportId,
        mapCreateReportFormToInput(values),
      );
      setReport(updated);
      setMode("view");
      setSuccessMessage("Changes saved successfully.");
    } catch (error) {
      if (isApiError(error) && error.code === "VALIDATION_ERROR") {
        setSaveError(error.message);
      } else {
        setSaveError(getApiErrorMessage(error));
      }
    }
  }

  async function handleConfirmSubmit() {
    if (!reportId) {
      return;
    }

    setSubmitError(null);
    setIsSubmittingReport(true);

    try {
      const updated = await submitReport(reportId);
      setReport(updated);
      setShowSubmitConfirm(false);
      setMode("view");
      setSuccessMessage(
        updated.status === "SUBMITTED"
          ? report?.status === "NEEDS_CORRECTION"
            ? "Report resubmitted successfully."
            : "Report submitted successfully."
          : "Report updated successfully.",
      );
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsSubmittingReport(false);
    }
  }

  const formDisabled =
    isSubmitting || !catalogReady || projects.length === 0;

  if (loadState === "loading") {
    return (
      <div
        className="flex min-h-[40vh] items-center justify-center"
        role="status"
        aria-busy="true"
      >
        <p className="text-sm text-muted-foreground">Loading report…</p>
      </div>
    );
  }

  if (loadState === "not-found") {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Report not found</h1>
        <p className="text-sm text-muted-foreground">
          This report does not exist or you do not have access to it.
        </p>
        <Link
          to={ROUTES.member.reports}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Back to My Reports
        </Link>
      </section>
    );
  }

  if (loadState === "forbidden") {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Access denied</h1>
        <p className="text-sm text-muted-foreground">
          You do not have permission to view this report.
        </p>
        <Link
          to={ROUTES.member.reports}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Back to My Reports
        </Link>
      </section>
    );
  }

  if (loadState === "error" || !report) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Could not load report
        </h1>
        <p className="text-sm text-muted-foreground">{loadError}</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void loadReport()}>
            Retry
          </Button>
          <Link
            to={ROUTES.member.reports}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Back to My Reports
          </Link>
        </div>
      </section>
    );
  }

  const statusHint = getReportStatusHint(report.status);
  const editable = canEditReport(report.status);
  const submittable = canSubmitReport(report.status);
  const hasVersionHistory =
    report.status === "SUBMITTED" ||
    report.status === "NEEDS_CORRECTION" ||
    report.status === "APPROVED";

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Link
            to={ROUTES.member.reports}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to My Reports
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {formatReportWeekRange(report.weekStartDate, report.weekEndDate)}
            </h1>
            <ReportStatusBadge status={report.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Last updated {formatReportTimestamp(report.updatedAt)}
          </p>
        </div>

        {mode === "view" && !showSubmitConfirm ? (
          <div className="flex flex-wrap gap-2">
            {editable ? (
              <Button type="button" variant="outline" size="sm" onClick={enterEditMode}>
                Edit
              </Button>
            ) : null}
            {submittable ? (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setSubmitError(null);
                  setShowSubmitConfirm(true);
                }}
              >
                {report.status === "NEEDS_CORRECTION" ? "Resubmit" : "Submit"}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {successMessage ? (
        <p
          className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-900 dark:text-emerald-100"
          role="status"
        >
          {successMessage}
        </p>
      ) : null}

      {statusHint ? (
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          {statusHint}
        </p>
      ) : null}

      {mode === "view" && hasVersionHistory ? (
        <p className="text-sm">
          <Link
            to={memberReportVersionsPath(report.id)}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            View submitted version snapshots
          </Link>
        </p>
      ) : null}

      {showSubmitConfirm ? (
        <SubmitReportConfirm
          isResubmit={report.status === "NEEDS_CORRECTION"}
          isSubmitting={isSubmittingReport}
          errorMessage={submitError}
          onConfirm={() => void handleConfirmSubmit()}
          onCancel={() => {
            setShowSubmitConfirm(false);
            setSubmitError(null);
          }}
        />
      ) : null}

      {mode === "view" ? <ReportDetailView report={report} /> : null}

      {mode === "edit" ? (
        <>
          <ReportCatalogStatus
            isLoading={catalogState === "loading"}
            errorMessage={catalogState === "error" ? catalogError : null}
            onRetry={() => void reloadCatalog()}
            projectsCount={projects.length}
            taskTypesCount={taskTypes.length}
          />

          <form
            className="space-y-8"
            onSubmit={handleSubmit(onSave)}
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

            {saveError ? (
              <p className="text-sm text-destructive" role="alert">
                {saveError}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={cancelEdit}
                disabled={isSubmitting}
              >
                Cancel edit
              </Button>
              <Button type="submit" disabled={formDisabled || isSubmitting}>
                {isSubmitting ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </>
      ) : null}
    </section>
  );
}
