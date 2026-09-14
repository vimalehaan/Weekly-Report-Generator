import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApproveReportConfirm } from "@/components/reports/manager/ApproveReportConfirm";
import { ManagerCommentForm } from "@/components/reports/manager/ManagerCommentForm";
import { ManagerReportStatusNotice } from "@/components/reports/manager/ManagerReportStatusNotice";
import { ReportReviewHistory } from "@/components/reports/manager/ReportReviewHistory";
import { ReportStatusHistoryTimeline } from "@/components/reports/manager/ReportStatusHistoryTimeline";
import { RequestCorrectionConfirm } from "@/components/reports/manager/RequestCorrectionConfirm";
import { ReportDetailView } from "@/components/reports/ReportDetailView";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { isApiError } from "@/services/api";
import { getReportById } from "@/services/reports";
import {
  addComment,
  approveReport,
  getReviews,
  getStatusHistory,
  requestCorrection,
} from "@/services/reviews";
import { ROUTES } from "@/routes/paths";
import type { Report } from "@/types/report";
import type { ReportReview, ReportStatusHistoryEntry } from "@/types/review";
import { getApiErrorMessage } from "@/utils/api-errors";
import {
  formatReportTimestamp,
  formatReportWeekRange,
} from "@/utils/report-dates";
import {
  getWorkflowConflictMessage,
} from "@/utils/review-display";
import { formatUserDisplayName } from "@/utils/user-display";
import { cn } from "@/lib/utils";

type PageLoadState = "loading" | "success" | "not-found" | "forbidden" | "error";
type SectionLoadState = "idle" | "loading" | "success" | "error";

function formatActionError(error: unknown): {
  message: string;
  showRefresh: boolean;
} {
  const message = getApiErrorMessage(error);
  const showRefresh = isApiError(error) && error.status === 409;

  return {
    message: showRefresh ? `${message} ${getWorkflowConflictMessage()}` : message,
    showRefresh,
  };
}

export function ManagerReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loadState, setLoadState] = useState<PageLoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<ReportReview[]>([]);
  const [reviewsLoadState, setReviewsLoadState] =
    useState<SectionLoadState>("idle");
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const [statusHistory, setStatusHistory] = useState<ReportStatusHistoryEntry[]>(
    [],
  );
  const [historyLoadState, setHistoryLoadState] =
    useState<SectionLoadState>("idle");
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [showCorrectionConfirm, setShowCorrectionConfirm] = useState(false);
  const [correctionSubmitting, setCorrectionSubmitting] = useState(false);
  const [correctionError, setCorrectionError] = useState<string | null>(null);
  const [correctionRefreshHint, setCorrectionRefreshHint] = useState(false);

  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [approveSubmitting, setApproveSubmitting] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [approveRefreshHint, setApproveRefreshHint] = useState(false);

  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentFormKey, setCommentFormKey] = useState(0);

  const loadReport = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!reportId) {
        setLoadState("not-found");
        return null;
      }

      if (!options?.silent) {
        setLoadState("loading");
        setLoadError(null);
      }

      try {
        const data = await getReportById(reportId);
        setReport(data);
        setLoadState("success");
        return data;
      } catch (error) {
        if (isApiError(error)) {
          if (error.status === 404) {
            setLoadState("not-found");
            return null;
          }

          if (error.status === 403) {
            setLoadState("forbidden");
            return null;
          }
        }

        setLoadError(getApiErrorMessage(error));
        setLoadState("error");
        return null;
      }
    },
    [reportId],
  );

  const loadReviews = useCallback(async () => {
    if (!reportId) {
      return;
    }

    setReviewsLoadState("loading");
    setReviewsError(null);

    try {
      const data = await getReviews(reportId);
      setReviews(data);
      setReviewsLoadState("success");
    } catch (error) {
      setReviewsError(getApiErrorMessage(error));
      setReviewsLoadState("error");
    }
  }, [reportId]);

  const loadStatusHistory = useCallback(async () => {
    if (!reportId) {
      return;
    }

    setHistoryLoadState("loading");
    setHistoryError(null);

    try {
      const data = await getStatusHistory(reportId);
      setStatusHistory(data);
      setHistoryLoadState("success");
    } catch (error) {
      setHistoryError(getApiErrorMessage(error));
      setHistoryLoadState("error");
    }
  }, [reportId]);

  const refreshReviewContext = useCallback(async () => {
    await Promise.all([
      loadReport({ silent: true }),
      loadReviews(),
      loadStatusHistory(),
    ]);
  }, [loadReport, loadReviews, loadStatusHistory]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  useEffect(() => {
    if (loadState === "success" && reportId) {
      void loadReviews();
      void loadStatusHistory();
    }
  }, [loadState, reportId, loadReviews, loadStatusHistory]);

  function closeCorrectionDialog() {
    if (correctionSubmitting) {
      return;
    }

    setShowCorrectionConfirm(false);
    setCorrectionError(null);
    setCorrectionRefreshHint(false);
  }

  function closeApproveDialog() {
    if (approveSubmitting) {
      return;
    }

    setShowApproveConfirm(false);
    setApproveError(null);
    setApproveRefreshHint(false);
  }

  async function handleRequestCorrection(comment: string) {
    if (!reportId) {
      return;
    }

    setCorrectionSubmitting(true);
    setCorrectionError(null);
    setCorrectionRefreshHint(false);

    try {
      const updated = await requestCorrection(reportId, { comment });
      setReport(updated);
      setShowCorrectionConfirm(false);
      setSuccessMessage("Correction requested. The team member can update and resubmit.");
      await Promise.all([loadReviews(), loadStatusHistory()]);
    } catch (error) {
      const formatted = formatActionError(error);
      setCorrectionError(formatted.message);
      setCorrectionRefreshHint(formatted.showRefresh);
    } finally {
      setCorrectionSubmitting(false);
    }
  }

  async function handleApprove(optionalComment?: string) {
    if (!reportId) {
      return;
    }

    setApproveSubmitting(true);
    setApproveError(null);
    setApproveRefreshHint(false);

    try {
      const updated = await approveReport(
        reportId,
        optionalComment ? { comment: optionalComment } : {},
      );
      setReport(updated);
      setShowApproveConfirm(false);
      setSuccessMessage("Report approved successfully.");
      await Promise.all([loadReviews(), loadStatusHistory()]);
    } catch (error) {
      const formatted = formatActionError(error);
      setApproveError(formatted.message);
      setApproveRefreshHint(formatted.showRefresh);
    } finally {
      setApproveSubmitting(false);
    }
  }

  async function handleAddComment(comment: string) {
    if (!reportId) {
      return;
    }

    setCommentSubmitting(true);
    setCommentError(null);

    try {
      await addComment(reportId, { comment });
      setCommentFormKey((value) => value + 1);
      setSuccessMessage("Comment posted.");
      await loadReviews();
    } catch (error) {
      setCommentError(getApiErrorMessage(error));
    } finally {
      setCommentSubmitting(false);
    }
  }

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
          to={ROUTES.manager.reports}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Back to team reports
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
          to={ROUTES.manager.reports}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Back to team reports
        </Link>
      </section>
    );
  }

  if (loadState === "error") {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Team report</h1>
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6"
          role="alert"
        >
          <p className="text-sm font-medium text-foreground">
            Could not load report
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              void loadReport();
            }}
          >
            Retry
          </Button>
        </div>
      </section>
    );
  }

  if (!report) {
    return null;
  }

  const memberName = formatUserDisplayName(report.user);
  const canReview = report.status === "SUBMITTED";
  const canComment = report.status !== "DRAFT";

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link
          to={ROUTES.manager.reports}
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Back to team reports
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {memberName}&apos;s report
              </h1>
              <ReportStatusBadge status={report.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {formatReportWeekRange(report.weekStartDate, report.weekEndDate)}
              {" · "}
              Updated {formatReportTimestamp(report.updatedAt)}
            </p>
            <p className="text-sm text-muted-foreground">{report.user.email}</p>
          </div>

          {canReview ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-amber-500/50 text-amber-900 hover:bg-amber-500/10 dark:text-amber-100"
                onClick={() => {
                  setSuccessMessage(null);
                  setShowApproveConfirm(false);
                  setShowCorrectionConfirm(true);
                }}
              >
                Request correction
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                onClick={() => {
                  setSuccessMessage(null);
                  setShowCorrectionConfirm(false);
                  setShowApproveConfirm(true);
                }}
              >
                Approve
              </Button>
            </div>
          ) : null}
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

      <ManagerReportStatusNotice status={report.status} />

      {showCorrectionConfirm ? (
        <RequestCorrectionConfirm
          isSubmitting={correctionSubmitting}
          errorMessage={correctionError}
          showRefreshHint={correctionRefreshHint}
          onRefresh={() => {
            void refreshReviewContext();
          }}
          onConfirm={(comment) => {
            void handleRequestCorrection(comment);
          }}
          onCancel={closeCorrectionDialog}
        />
      ) : null}

      {showApproveConfirm ? (
        <ApproveReportConfirm
          isSubmitting={approveSubmitting}
          errorMessage={approveError}
          showRefreshHint={approveRefreshHint}
          onRefresh={() => {
            void refreshReviewContext();
          }}
          onConfirm={(comment) => {
            void handleApprove(comment);
          }}
          onCancel={closeApproveDialog}
        />
      ) : null}

      <ReportDetailView report={report} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ReportReviewHistory
          reviews={reviews}
          loadState={reviewsLoadState}
          errorMessage={reviewsError}
          onRetry={() => {
            void loadReviews();
          }}
        />

        <ReportStatusHistoryTimeline
          entries={statusHistory}
          loadState={historyLoadState}
          errorMessage={historyError}
          onRetry={() => {
            void loadStatusHistory();
          }}
        />
      </div>

      {canComment ? (
        <ManagerCommentForm
          key={commentFormKey}
          disabled={commentSubmitting}
          isSubmitting={commentSubmitting}
          errorMessage={commentError}
          onSubmit={(comment) => {
            void handleAddComment(comment);
          }}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Comments are available after the report has been submitted at least
          once.
        </p>
      )}
    </section>
  );
}
