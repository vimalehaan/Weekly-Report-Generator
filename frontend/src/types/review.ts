import type { User } from "@/types/auth";
import type { Report, ReportStatus } from "@/types/report";

export const REVIEW_ACTIONS = [
  "REQUEST_CORRECTION",
  "APPROVE",
  "COMMENT",
] as const;

export type ReviewAction = (typeof REVIEW_ACTIONS)[number];

export type ReportVersionSummary = {
  id: string;
  versionNumber: number;
  createdAt: string;
};

export type ReportReview = {
  id: string;
  action: ReviewAction;
  comment: string | null;
  createdAt: string;
  reviewer: User;
  reportVersion: ReportVersionSummary;
};

export type ReportStatusHistoryEntry = {
  id: string;
  fromStatus: ReportStatus;
  toStatus: ReportStatus;
  comment: string | null;
  createdAt: string;
  changedBy: User;
};

export type RequestCorrectionInput = {
  comment: string;
};

export type ApproveReportInput = {
  comment?: string;
};

export type AddCommentInput = {
  comment: string;
};

export type ReportReviewListResponse = {
  data: ReportReview[];
};

export type ReportReviewResponse = {
  data: ReportReview;
};

export type ReportStatusHistoryResponse = {
  data: ReportStatusHistoryEntry[];
};

export type ReviewMutationReportResponse = {
  data: Report;
};
