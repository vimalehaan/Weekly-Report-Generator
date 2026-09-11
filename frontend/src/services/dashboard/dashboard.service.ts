import { apiRequest } from "@/services/api";
import type {
  DashboardActivityItem,
  DashboardData,
  DashboardFilters,
  DashboardMemberStatusRow,
  DashboardProjectWorkload,
  DashboardRecentActivityResponse,
  DashboardStatusByMemberResponse,
  DashboardSummary,
  DashboardSummaryResponse,
  DashboardTaskTrendPoint,
  DashboardTaskTrendsResponse,
  DashboardTaskTypeTime,
  DashboardTimeByTaskTypeResponse,
  DashboardWorkloadByProjectResponse,
} from "@/types/dashboard";
import { buildQueryString } from "@/utils/query-string";

const DASHBOARD_BASE_PATH = "/api/v1/dashboard";

function buildDashboardQuery(filters: DashboardFilters = {}): string {
  return buildQueryString({
    weekStartDate: filters.weekStartDate,
  });
}

export async function getDashboardSummary(
  filters: DashboardFilters = {},
): Promise<DashboardSummary> {
  const response = await apiRequest<DashboardSummaryResponse>(
    `${DASHBOARD_BASE_PATH}/summary${buildDashboardQuery(filters)}`,
  );

  return response.data;
}

export async function getDashboardTaskTrends(
  filters: DashboardFilters = {},
): Promise<DashboardTaskTrendPoint[]> {
  const response = await apiRequest<DashboardTaskTrendsResponse>(
    `${DASHBOARD_BASE_PATH}/task-trends${buildDashboardQuery(filters)}`,
  );

  return response.data;
}

export async function getDashboardStatusByMember(
  filters: DashboardFilters = {},
): Promise<DashboardMemberStatusRow[]> {
  const response = await apiRequest<DashboardStatusByMemberResponse>(
    `${DASHBOARD_BASE_PATH}/status-by-member${buildDashboardQuery(filters)}`,
  );

  return response.data;
}

export async function getDashboardWorkloadByProject(
  filters: DashboardFilters = {},
): Promise<DashboardProjectWorkload[]> {
  const response = await apiRequest<DashboardWorkloadByProjectResponse>(
    `${DASHBOARD_BASE_PATH}/workload-by-project${buildDashboardQuery(filters)}`,
  );

  return response.data;
}

export async function getDashboardTimeByTaskType(
  filters: DashboardFilters = {},
): Promise<DashboardTaskTypeTime[]> {
  const response = await apiRequest<DashboardTimeByTaskTypeResponse>(
    `${DASHBOARD_BASE_PATH}/time-by-task-type${buildDashboardQuery(filters)}`,
  );

  return response.data;
}

export async function getDashboardRecentActivity(
  filters: DashboardFilters = {},
): Promise<DashboardActivityItem[]> {
  const response = await apiRequest<DashboardRecentActivityResponse>(
    `${DASHBOARD_BASE_PATH}/recent-activity${buildDashboardQuery(filters)}`,
  );

  return response.data;
}

export async function getDashboardData(
  filters: DashboardFilters = {},
): Promise<DashboardData> {
  const [
    summary,
    taskTrends,
    statusByMember,
    workloadByProject,
    timeByTaskType,
    recentActivity,
  ] = await Promise.all([
    getDashboardSummary(filters),
    getDashboardTaskTrends(filters),
    getDashboardStatusByMember(filters),
    getDashboardWorkloadByProject(filters),
    getDashboardTimeByTaskType(filters),
    getDashboardRecentActivity(filters),
  ]);

  return {
    summary,
    taskTrends,
    statusByMember,
    workloadByProject,
    timeByTaskType,
    recentActivity,
  };
}
