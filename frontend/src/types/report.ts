import type { User } from "@/types/auth";
import type { Project } from "@/types/project";
import type { TaskType } from "@/types/task-type";

export const REPORT_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "NEEDS_CORRECTION",
  "APPROVED",
] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_STATUSES = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
  "BLOCKED",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export type ReportTask = {
  id: string;
  reportId: string;
  projectId: string;
  taskTypeId: string | null;
  taskName: string;
  priority: TaskPriority;
  plannedPercentage: number;
  actualPercentage: number;
  status: TaskStatus;
  plannedHours: string;
  spentHours: string;
  deliverable: string | null;
  createdAt: string;
  updatedAt: string;
  project: Project;
  taskType: TaskType | null;
};

export type Achievement = {
  id: string;
  reportId: string;
  description: string;
  isKeyAchievement: boolean;
  createdAt: string;
};

export type Blocker = {
  id: string;
  reportId: string;
  description: string;
  isKeyIssue: boolean;
  createdAt: string;
};

export type Report = {
  id: string;
  userId: string;
  weekStartDate: string;
  weekEndDate: string;
  status: ReportStatus;
  nextWeekTasks: string[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
  reportTasks: ReportTask[];
  achievements: Achievement[];
  blockers: Blocker[];
};

export type ReportListItem = {
  id: string;
  userId: string;
  weekStartDate: string;
  weekEndDate: string;
  status: ReportStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
  _count: {
    reportTasks: number;
    achievements: number;
    blockers: number;
  };
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ReportListFilters = {
  page?: number;
  limit?: number;
  status?: ReportStatus;
  weekStartDate?: string;
  userId?: string;
};

export type ReportTaskInput = {
  projectId: string;
  taskTypeId?: string | null;
  taskName: string;
  priority: TaskPriority;
  plannedPercentage: number;
  actualPercentage: number;
  status: TaskStatus;
  plannedHours: number;
  spentHours: number;
  deliverable?: string;
};

export type AchievementInput = {
  description: string;
  isKeyAchievement: boolean;
};

export type BlockerInput = {
  description: string;
  isKeyIssue: boolean;
};

export type CreateReportInput = {
  weekStartDate: string;
  weekEndDate: string;
  tasks: ReportTaskInput[];
  nextWeekTasks: string[];
  achievements: AchievementInput[];
  blockers: BlockerInput[];
  notes?: string;
};

export type UpdateReportInput = {
  weekStartDate?: string;
  weekEndDate?: string;
  tasks?: ReportTaskInput[];
  nextWeekTasks?: string[];
  achievements?: AchievementInput[];
  blockers?: BlockerInput[];
  notes?: string;
};

export type ReportSnapshotTask = {
  projectId: string;
  projectName: string;
  taskTypeId: string | null;
  taskTypeName: string | null;
  taskName: string;
  priority: TaskPriority;
  plannedPercentage: number;
  actualPercentage: number;
  status: TaskStatus;
  plannedHours: number;
  spentHours: number;
  deliverable: string | null;
};

export type ReportSnapshotAchievement = {
  description: string;
  isKeyAchievement: boolean;
};

export type ReportSnapshotBlocker = {
  description: string;
  isKeyIssue: boolean;
};

export type ReportVersionContent = {
  report: {
    weekStartDate: string;
    weekEndDate: string;
    status: ReportStatus;
    notes: string | null;
    nextWeekTasks: string[];
  };
  tasks: ReportSnapshotTask[];
  achievements: ReportSnapshotAchievement[];
  blockers: ReportSnapshotBlocker[];
};

export type ReportVersion = {
  id: string;
  reportId: string;
  versionNumber: number;
  content: ReportVersionContent;
  createdBy: string;
  createdAt: string;
  creator: User;
};

export type ReportResponse = {
  data: Report;
};

export type ReportListResponse = {
  data: ReportListItem[];
  pagination: PaginationMeta;
};

export type ReportVersionListResponse = {
  data: ReportVersion[];
};

export type ReportVersionResponse = {
  data: ReportVersion;
};
