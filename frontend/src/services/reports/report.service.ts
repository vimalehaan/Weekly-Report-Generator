import { apiRequest } from "@/services/api";
import type {
  CreateReportInput,
  Report,
  ReportListFilters,
  ReportListItem,
  ReportListResponse,
  ReportResponse,
  ReportVersion,
  ReportVersionListResponse,
  ReportVersionResponse,
  UpdateReportInput,
  PaginationMeta,
} from "@/types/report";
import { buildQueryString } from "@/utils/query-string";

const REPORTS_BASE_PATH = "/api/v1/reports";

export async function getReports(
  filters: ReportListFilters = {},
): Promise<{ reports: ReportListItem[]; pagination: PaginationMeta }> {
  const query = buildQueryString({
    page: filters.page,
    limit: filters.limit,
    status: filters.status,
    weekStartDate: filters.weekStartDate,
    userId: filters.userId,
  });

  const response = await apiRequest<ReportListResponse>(
    `${REPORTS_BASE_PATH}${query}`,
  );

  return {
    reports: response.data,
    pagination: response.pagination,
  };
}

export async function getReportById(reportId: string): Promise<Report> {
  const response = await apiRequest<ReportResponse>(
    `${REPORTS_BASE_PATH}/${reportId}`,
  );

  return response.data;
}

export async function createReport(input: CreateReportInput): Promise<Report> {
  const response = await apiRequest<ReportResponse>(REPORTS_BASE_PATH, {
    method: "POST",
    body: input,
  });

  return response.data;
}

export async function updateReport(
  reportId: string,
  input: UpdateReportInput,
): Promise<Report> {
  const response = await apiRequest<ReportResponse>(
    `${REPORTS_BASE_PATH}/${reportId}`,
    {
      method: "PATCH",
      body: input,
    },
  );

  return response.data;
}

export async function submitReport(reportId: string): Promise<Report> {
  const response = await apiRequest<ReportResponse>(
    `${REPORTS_BASE_PATH}/${reportId}/submit`,
    {
      method: "POST",
    },
  );

  return response.data;
}

export async function getReportVersions(
  reportId: string,
): Promise<ReportVersion[]> {
  const response = await apiRequest<ReportVersionListResponse>(
    `${REPORTS_BASE_PATH}/${reportId}/versions`,
  );

  return response.data;
}

export async function getReportVersionByNumber(
  reportId: string,
  versionNumber: number,
): Promise<ReportVersion> {
  const response = await apiRequest<ReportVersionResponse>(
    `${REPORTS_BASE_PATH}/${reportId}/versions/${versionNumber}`,
  );

  return response.data;
}
