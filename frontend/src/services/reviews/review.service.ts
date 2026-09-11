import { apiRequest } from "@/services/api";
import type { Report } from "@/types/report";
import type {
  AddCommentInput,
  ApproveReportInput,
  ReportReview,
  ReportReviewListResponse,
  ReportReviewResponse,
  ReportStatusHistoryEntry,
  ReportStatusHistoryResponse,
  RequestCorrectionInput,
  ReviewMutationReportResponse,
} from "@/types/review";

function reportPath(reportId: string): string {
  return `/api/v1/reports/${reportId}`;
}

export async function requestCorrection(
  reportId: string,
  input: RequestCorrectionInput,
): Promise<Report> {
  const response = await apiRequest<ReviewMutationReportResponse>(
    `${reportPath(reportId)}/request-correction`,
    {
      method: "POST",
      body: input,
    },
  );

  return response.data;
}

export async function approveReport(
  reportId: string,
  input: ApproveReportInput = {},
): Promise<Report> {
  const body: ApproveReportInput = {};

  if (input.comment !== undefined && input.comment.trim().length > 0) {
    body.comment = input.comment.trim();
  }

  const response = await apiRequest<ReviewMutationReportResponse>(
    `${reportPath(reportId)}/approve`,
    {
      method: "POST",
      body,
    },
  );

  return response.data;
}

export async function addComment(
  reportId: string,
  input: AddCommentInput,
): Promise<ReportReview> {
  const response = await apiRequest<ReportReviewResponse>(
    `${reportPath(reportId)}/comments`,
    {
      method: "POST",
      body: input,
    },
  );

  return response.data;
}

export async function getReviews(reportId: string): Promise<ReportReview[]> {
  const response = await apiRequest<ReportReviewListResponse>(
    `${reportPath(reportId)}/reviews`,
  );

  return response.data;
}

export async function getStatusHistory(
  reportId: string,
): Promise<ReportStatusHistoryEntry[]> {
  const response = await apiRequest<ReportStatusHistoryResponse>(
    `${reportPath(reportId)}/status-history`,
  );

  return response.data;
}
