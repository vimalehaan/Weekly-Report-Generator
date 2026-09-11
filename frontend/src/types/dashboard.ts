export type DashboardFilters = {
  weekStartDate?: string;
};

export type DashboardComplianceCalculation = {
  expectedTeamMembers: number;
  completedReports: number;
  formula: string;
};

export type DashboardSummary = {
  totalSubmitted: number;
  compliance: number;
  needsCorrection: number;
  openBlockers: number;
  weekStartDate?: string;
  complianceCalculation?: DashboardComplianceCalculation;
};

export type DashboardTaskTrendPoint = {
  weekStartDate: string;
  totalTasks: number;
};

export type DashboardMemberStatusRow = {
  userId: string;
  userName: string;
  DRAFT: number;
  SUBMITTED: number;
  NEEDS_CORRECTION: number;
  APPROVED: number;
};

export type DashboardProjectWorkload = {
  projectId: string;
  projectName: string;
  taskCount: number;
  plannedHours: number;
  spentHours: number;
};

export type DashboardTaskTypeTime = {
  taskTypeId: string | null;
  taskTypeName: string;
  spentHours: number;
};

export type DashboardActivityType = "STATUS_CHANGE" | "REVIEW";

export type DashboardActivityItem = {
  id: string;
  type: DashboardActivityType;
  reportId: string;
  userId: string;
  userName: string;
  description: string;
  createdAt: string;
};

export type DashboardSummaryResponse = {
  data: DashboardSummary;
};

export type DashboardTaskTrendsResponse = {
  data: DashboardTaskTrendPoint[];
};

export type DashboardStatusByMemberResponse = {
  data: DashboardMemberStatusRow[];
};

export type DashboardWorkloadByProjectResponse = {
  data: DashboardProjectWorkload[];
};

export type DashboardTimeByTaskTypeResponse = {
  data: DashboardTaskTypeTime[];
};

export type DashboardRecentActivityResponse = {
  data: DashboardActivityItem[];
};

export type DashboardData = {
  summary: DashboardSummary;
  taskTrends: DashboardTaskTrendPoint[];
  statusByMember: DashboardMemberStatusRow[];
  workloadByProject: DashboardProjectWorkload[];
  timeByTaskType: DashboardTaskTypeTime[];
  recentActivity: DashboardActivityItem[];
};
