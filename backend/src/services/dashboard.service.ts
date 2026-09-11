import {
  Prisma,
  ReportStatus,
  ReviewAction,
  RoleName,
} from "@prisma/client";
import { prisma } from "../config/database.js";
import type { JwtPayload } from "../types/auth.js";
import { AppError } from "../utils/app-error.js";

const DEFAULT_TREND_WEEKS = 8;
const DEFAULT_ACTIVITY_LIMIT = 15;

export type DashboardFilters = {
  weekStartDate?: string;
};

type WeekScope =
  | {
      mode: "single";
      weekStartDate: Date;
    }
  | {
      mode: "range";
      weekStartDateFrom: Date;
      weekStartDateTo: Date;
    };

type ActivityRecord = {
  id: string;
  type: string;
  reportId: string;
  userId: string;
  userName: string;
  description: string;
  createdAt: Date;
};

function parseDateString(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function decimalToNumber(value: Prisma.Decimal | null | undefined): number {
  return value ? value.toNumber() : 0;
}

function assertManager(authUser: JwtPayload): void {
  if (authUser.role !== RoleName.MANAGER) {
    throw new AppError(403, "FORBIDDEN", "Insufficient permissions");
  }
}

async function resolveWeekScope(filters?: DashboardFilters): Promise<WeekScope> {
  if (filters?.weekStartDate) {
    return {
      mode: "single",
      weekStartDate: parseDateString(filters.weekStartDate),
    };
  }

  const latestReport = await prisma.report.findFirst({
    orderBy: { weekStartDate: "desc" },
    select: { weekStartDate: true },
  });

  if (!latestReport) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return {
      mode: "single",
      weekStartDate: today,
    };
  }

  const weekStartDateTo = latestReport.weekStartDate;
  const weekStartDateFrom = new Date(weekStartDateTo);
  weekStartDateFrom.setUTCDate(
    weekStartDateFrom.getUTCDate() - 7 * (DEFAULT_TREND_WEEKS - 1),
  );

  return {
    mode: "range",
    weekStartDateFrom,
    weekStartDateTo,
  };
}

function buildReportWeekWhere(scope: WeekScope): Prisma.ReportWhereInput {
  if (scope.mode === "single") {
    return { weekStartDate: scope.weekStartDate };
  }

  return {
    weekStartDate: {
      gte: scope.weekStartDateFrom,
      lte: scope.weekStartDateTo,
    },
  };
}

function buildStatusHistoryDescription(
  fromStatus: ReportStatus | null,
  toStatus: ReportStatus,
): string {
  if (toStatus === ReportStatus.SUBMITTED) {
    return "Report submitted";
  }

  if (toStatus === ReportStatus.NEEDS_CORRECTION) {
    return "Correction requested";
  }

  if (toStatus === ReportStatus.APPROVED) {
    return "Report approved";
  }

  if (toStatus === ReportStatus.DRAFT && fromStatus === null) {
    return "Report created";
  }

  return `Report moved from ${fromStatus ?? "none"} to ${toStatus}`;
}

function buildReviewDescription(action: ReviewAction): string {
  switch (action) {
    case ReviewAction.REQUEST_CORRECTION:
      return "Correction requested";
    case ReviewAction.APPROVE:
      return "Report approved";
    case ReviewAction.COMMENT:
      return "Review comment added";
    default:
      return "Review activity recorded";
  }
}

async function getActiveTeamMemberCount(): Promise<number> {
  return prisma.user.count({
    where: {
      isActive: true,
      role: {
        name: RoleName.TEAM_MEMBER,
      },
    },
  });
}

export async function getSummary(authUser: JwtPayload, filters?: DashboardFilters) {
  assertManager(authUser);

  const scope = await resolveWeekScope(filters);
  const reportWeekWhere = buildReportWeekWhere(scope);

  const [totalSubmitted, needsCorrection, openBlockers, completedReports, expectedTeamMembers] =
    await Promise.all([
      prisma.report.count({
        where: {
          ...reportWeekWhere,
          status: {
            in: [ReportStatus.SUBMITTED, ReportStatus.APPROVED],
          },
        },
      }),
      prisma.report.count({
        where: {
          ...reportWeekWhere,
          status: ReportStatus.NEEDS_CORRECTION,
        },
      }),
      prisma.blocker.count({
        where: {
          report: reportWeekWhere,
        },
      }),
      scope.mode === "single"
        ? prisma.report.count({
            where: {
              weekStartDate: scope.weekStartDate,
              status: {
                in: [ReportStatus.SUBMITTED, ReportStatus.APPROVED],
              },
              user: {
                isActive: true,
                role: {
                  name: RoleName.TEAM_MEMBER,
                },
              },
            },
          })
        : Promise.resolve(0),
      scope.mode === "single"
        ? getActiveTeamMemberCount()
        : Promise.resolve(0),
    ]);

  const compliance =
    scope.mode === "single" && expectedTeamMembers > 0
      ? Number(((completedReports / expectedTeamMembers) * 100).toFixed(2))
      : 0;

  return {
    totalSubmitted,
    compliance,
    needsCorrection,
    openBlockers,
    weekStartDate:
      scope.mode === "single"
        ? formatDate(scope.weekStartDate)
        : undefined,
    complianceCalculation:
      scope.mode === "single"
        ? {
            expectedTeamMembers,
            completedReports,
            formula:
              "(completed team-member reports with status SUBMITTED or APPROVED for the selected week / active TEAM_MEMBER users) × 100",
          }
        : undefined,
  };
}

export async function getTaskTrends(authUser: JwtPayload, filters?: DashboardFilters) {
  assertManager(authUser);

  const scope = await resolveWeekScope(filters);
  const reportWeekWhere = buildReportWeekWhere(scope);

  const reports = await prisma.report.findMany({
    where: reportWeekWhere,
    select: {
      weekStartDate: true,
      _count: {
        select: {
          reportTasks: true,
        },
      },
    },
    orderBy: {
      weekStartDate: "asc",
    },
  });

  return reports.map((report) => ({
    weekStartDate: formatDate(report.weekStartDate),
    totalTasks: report._count.reportTasks,
  }));
}

export async function getStatusByMember(
  authUser: JwtPayload,
  filters?: DashboardFilters,
) {
  assertManager(authUser);

  // Lifetime counts per member when no week is selected. Other dashboard KPIs
  // use the default eight-week window; this chart aligns with each member's
  // full report history (same reports they see on their dashboard).
  const reportWeekWhere: Prisma.ReportWhereInput = filters?.weekStartDate
    ? buildReportWeekWhere(await resolveWeekScope(filters))
    : {};

  const teamMembers = await prisma.user.findMany({
    where: {
      isActive: true,
      role: {
        name: RoleName.TEAM_MEMBER,
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const reports = await prisma.report.findMany({
    where: {
      ...reportWeekWhere,
      user: {
        role: {
          name: RoleName.TEAM_MEMBER,
        },
      },
    },
    select: {
      userId: true,
      status: true,
    },
  });

  const statusCountsByUser = new Map<
    string,
    Record<ReportStatus, number>
  >();

  for (const member of teamMembers) {
    statusCountsByUser.set(member.id, {
      [ReportStatus.DRAFT]: 0,
      [ReportStatus.SUBMITTED]: 0,
      [ReportStatus.NEEDS_CORRECTION]: 0,
      [ReportStatus.APPROVED]: 0,
    });
  }

  for (const report of reports) {
    const counts = statusCountsByUser.get(report.userId);
    if (counts) {
      counts[report.status] += 1;
    }
  }

  return teamMembers.map((member) => {
    const counts = statusCountsByUser.get(member.id)!;

    return {
      userId: member.id,
      userName: `${member.firstName} ${member.lastName}`,
      DRAFT: counts[ReportStatus.DRAFT],
      SUBMITTED: counts[ReportStatus.SUBMITTED],
      NEEDS_CORRECTION: counts[ReportStatus.NEEDS_CORRECTION],
      APPROVED: counts[ReportStatus.APPROVED],
    };
  });
}

export async function getWorkloadByProject(
  authUser: JwtPayload,
  filters?: DashboardFilters,
) {
  assertManager(authUser);

  const scope = await resolveWeekScope(filters);
  const reportWeekWhere = buildReportWeekWhere(scope);

  const groupedTasks = await prisma.reportTask.groupBy({
    by: ["projectId"],
    where: {
      report: reportWeekWhere,
    },
    _count: {
      _all: true,
    },
    _sum: {
      plannedHours: true,
      spentHours: true,
    },
  });

  const projectIds = groupedTasks.map((group) => group.projectId);
  const projects = await prisma.project.findMany({
    where: {
      id: {
        in: projectIds,
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const projectNameById = new Map(projects.map((project) => [project.id, project.name]));

  return groupedTasks
    .map((group) => ({
      projectId: group.projectId,
      projectName: projectNameById.get(group.projectId) ?? "Unknown project",
      taskCount: group._count._all,
      plannedHours: decimalToNumber(group._sum.plannedHours),
      spentHours: decimalToNumber(group._sum.spentHours),
    }))
    .sort((a, b) => a.projectName.localeCompare(b.projectName));
}

export async function getTimeByTaskType(
  authUser: JwtPayload,
  filters?: DashboardFilters,
) {
  assertManager(authUser);

  const scope = await resolveWeekScope(filters);
  const reportWeekWhere = buildReportWeekWhere(scope);

  const groupedTasks = await prisma.reportTask.groupBy({
    by: ["taskTypeId"],
    where: {
      report: reportWeekWhere,
    },
    _sum: {
      spentHours: true,
    },
  });

  const taskTypeIds = groupedTasks
    .map((group) => group.taskTypeId)
    .filter((taskTypeId): taskTypeId is string => taskTypeId !== null);

  const taskTypes = await prisma.taskType.findMany({
    where: {
      id: {
        in: taskTypeIds,
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const taskTypeNameById = new Map(
    taskTypes.map((taskType) => [taskType.id, taskType.name]),
  );

  return groupedTasks
    .map((group) => ({
      taskTypeId: group.taskTypeId,
      taskTypeName: group.taskTypeId
        ? (taskTypeNameById.get(group.taskTypeId) ?? "Unknown task type")
        : "Uncategorized",
      spentHours: decimalToNumber(group._sum.spentHours),
    }))
    .sort((a, b) => b.spentHours - a.spentHours);
}

export async function getRecentActivity(
  authUser: JwtPayload,
  filters?: DashboardFilters,
) {
  assertManager(authUser);

  const scope = await resolveWeekScope(filters);
  const reportWeekWhere = buildReportWeekWhere(scope);

  const [statusHistory, reviews] = await Promise.all([
    prisma.reportStatusHistory.findMany({
      where: {
        report: reportWeekWhere,
      },
      include: {
        changer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: DEFAULT_ACTIVITY_LIMIT,
    }),
    prisma.reportReview.findMany({
      where: {
        reportVersion: {
          report: reportWeekWhere,
        },
      },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        reportVersion: {
          select: {
            reportId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: DEFAULT_ACTIVITY_LIMIT,
    }),
  ]);

  const statusActivities: ActivityRecord[] = statusHistory.map((entry) => ({
    id: entry.id,
    type: "STATUS_CHANGE",
    reportId: entry.reportId,
    userId: entry.changer.id,
    userName: `${entry.changer.firstName} ${entry.changer.lastName}`,
    description: buildStatusHistoryDescription(entry.fromStatus, entry.toStatus),
    createdAt: entry.createdAt,
  }));

  const reviewActivities: ActivityRecord[] = reviews.map((review) => ({
    id: review.id,
    type: "REVIEW",
    reportId: review.reportVersion.reportId,
    userId: review.reviewer.id,
    userName: `${review.reviewer.firstName} ${review.reviewer.lastName}`,
    description: buildReviewDescription(review.action),
    createdAt: review.createdAt,
  }));

  return [...statusActivities, ...reviewActivities]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, DEFAULT_ACTIVITY_LIMIT)
    .map((activity) => ({
      ...activity,
      createdAt: activity.createdAt.toISOString(),
    }));
}
