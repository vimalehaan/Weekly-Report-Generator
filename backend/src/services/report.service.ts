import {
  Prisma,
  ReportStatus,
  RoleName,
  type Report,
} from "@prisma/client";
import { prisma } from "../config/database.js";
import type { JwtPayload } from "../types/auth.js";
import type { SafeUser } from "../types/user.js";
import { AppError } from "../utils/app-error.js";
import type {
  AchievementInput,
  BlockerInput,
  CreateReportInput,
  ReportTaskInput,
  UpdateReportInput,
} from "../validators/report.validator.js";

const EDITABLE_STATUSES: ReportStatus[] = [
  ReportStatus.DRAFT,
  ReportStatus.NEEDS_CORRECTION,
];

const SUBMITTABLE_STATUSES: ReportStatus[] = [
  ReportStatus.DRAFT,
  ReportStatus.NEEDS_CORRECTION,
];

type GetReportsFilters = {
  status?: ReportStatus;
  userId?: string;
  weekStartDate?: string;
  page?: number;
  limit?: number;
};

type SafeUserWithRole = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  role: {
    name: RoleName;
  };
};

const safeUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  isActive: true,
  role: {
    select: {
      name: true,
    },
  },
} as const;

const reportDetailInclude = {
  user: {
    select: safeUserSelect,
  },
  reportTasks: {
    include: {
      project: true,
      taskType: true,
    },
    orderBy: {
      createdAt: "asc" as const,
    },
  },
  achievements: {
    orderBy: {
      createdAt: "asc" as const,
    },
  },
  blockers: {
    orderBy: {
      createdAt: "asc" as const,
    },
  },
} as const;

function parseDateString(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function formatDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function assertValidWeekDateRange(
  weekStartDate: string,
  weekEndDate: string,
): void {
  if (weekEndDate < weekStartDate) {
    throw new AppError(
      422,
      "VALIDATION_ERROR",
      "weekEndDate must not be before weekStartDate",
    );
  }
}

function validateUpdateWeekDateRange(
  input: UpdateReportInput,
  existingWeekStartDate: Date,
  existingWeekEndDate: Date,
): void {
  if (input.weekStartDate === undefined && input.weekEndDate === undefined) {
    return;
  }

  const effectiveWeekStartDate =
    input.weekStartDate ?? formatDateString(existingWeekStartDate);
  const effectiveWeekEndDate =
    input.weekEndDate ?? formatDateString(existingWeekEndDate);

  assertValidWeekDateRange(effectiveWeekStartDate, effectiveWeekEndDate);
}

function toDecimal(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value.toFixed(2));
}

function toSafeUser(user: SafeUserWithRole): SafeUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role.name,
    isActive: user.isActive,
  };
}

function mapTaskCreateData(reportId: string, tasks: ReportTaskInput[]) {
  return tasks.map((task) => ({
    reportId,
    projectId: task.projectId,
    taskTypeId: task.taskTypeId ?? null,
    taskName: task.taskName,
    priority: task.priority,
    plannedPercentage: task.plannedPercentage,
    actualPercentage: task.actualPercentage,
    status: task.status,
    plannedHours: toDecimal(task.plannedHours),
    spentHours: toDecimal(task.spentHours),
    deliverable: task.deliverable,
  }));
}

function mapAchievementCreateData(reportId: string, achievements: AchievementInput[]) {
  return achievements.map((achievement) => ({
    reportId,
    description: achievement.description,
    isKeyAchievement: achievement.isKeyAchievement,
  }));
}

function mapBlockerCreateData(reportId: string, blockers: BlockerInput[]) {
  return blockers.map((blocker) => ({
    reportId,
    description: blocker.description,
    isKeyIssue: blocker.isKeyIssue,
  }));
}

function assertCanAccessReport(report: Pick<Report, "userId">, authUser: JwtPayload): void {
  if (
    authUser.role === RoleName.TEAM_MEMBER &&
    report.userId !== authUser.userId
  ) {
    throw new AppError(403, "FORBIDDEN", "You do not have access to this report");
  }
}

function assertCanModifyReport(
  report: Pick<Report, "userId" | "status">,
  authUser: JwtPayload,
): void {
  if (authUser.role === RoleName.MANAGER) {
    throw new AppError(
      403,
      "FORBIDDEN",
      "Managers cannot modify report content",
    );
  }

  if (report.userId !== authUser.userId) {
    throw new AppError(403, "FORBIDDEN", "You do not have access to this report");
  }

  if (!EDITABLE_STATUSES.includes(report.status)) {
    throw new AppError(
      409,
      "REPORT_NOT_EDITABLE",
      "Only draft or correction-required reports can be edited",
    );
  }
}

function assertCanSubmitReport(
  report: Pick<Report, "userId" | "status">,
  authUser: JwtPayload,
): void {
  if (report.userId !== authUser.userId) {
    throw new AppError(403, "FORBIDDEN", "Only the report owner can submit this report");
  }

  if (!SUBMITTABLE_STATUSES.includes(report.status)) {
    throw new AppError(
      409,
      "REPORT_NOT_SUBMITTABLE",
      "Only draft or correction-required reports can be submitted",
    );
  }
}

function handleDuplicateReportError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new AppError(
      409,
      "DUPLICATE_REPORT",
      "A report already exists for this week",
    );
  }

  throw error;
}

type ReportWithSubmissionDetails = Prisma.ReportGetPayload<{
  include: typeof reportDetailInclude;
}>;

function buildReportSnapshot(report: ReportWithSubmissionDetails) {
  return {
    report: {
      weekStartDate: report.weekStartDate.toISOString().slice(0, 10),
      weekEndDate: report.weekEndDate.toISOString().slice(0, 10),
      status: ReportStatus.SUBMITTED,
      notes: report.notes,
      nextWeekTasks: report.nextWeekTasks,
    },
    tasks: report.reportTasks.map((task) => ({
      projectId: task.projectId,
      projectName: task.project.name,
      taskTypeId: task.taskTypeId,
      taskTypeName: task.taskType?.name ?? null,
      taskName: task.taskName,
      priority: task.priority,
      plannedPercentage: task.plannedPercentage,
      actualPercentage: task.actualPercentage,
      status: task.status,
      plannedHours: task.plannedHours.toNumber(),
      spentHours: task.spentHours.toNumber(),
      deliverable: task.deliverable,
    })),
    achievements: report.achievements.map((achievement) => ({
      description: achievement.description,
      isKeyAchievement: achievement.isKeyAchievement,
    })),
    blockers: report.blockers.map((blocker) => ({
      description: blocker.description,
      isKeyIssue: blocker.isKeyIssue,
    })),
  };
}

function validateReportForSubmission(report: ReportWithSubmissionDetails): void {
  if (report.reportTasks.length === 0) {
    throw new AppError(
      422,
      "INVALID_REPORT_CONTENT",
      "Report must include at least one task before submission",
    );
  }
}

function formatReportDetail(report: ReportWithSubmissionDetails) {
  return {
    ...report,
    user: toSafeUser(report.user),
  };
}

type ReportVersionWithCreator = Prisma.ReportVersionGetPayload<{
  include: {
    creator: {
      select: typeof safeUserSelect;
    };
  };
}>;

function formatReportVersion(version: ReportVersionWithCreator) {
  return {
    id: version.id,
    reportId: version.reportId,
    versionNumber: version.versionNumber,
    content: version.content,
    createdBy: version.createdBy,
    createdAt: version.createdAt,
    creator: toSafeUser(version.creator),
  };
}

async function assertCanAccessReportForVersions(
  reportId: string,
  authUser: JwtPayload,
  notFoundCode: "REPORT_NOT_FOUND" | "REPORT_VERSION_NOT_FOUND",
): Promise<void> {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { id: true, userId: true },
  });

  if (
    !report ||
    (authUser.role === RoleName.TEAM_MEMBER &&
      report.userId !== authUser.userId)
  ) {
    throw new AppError(
      404,
      notFoundCode,
      notFoundCode === "REPORT_NOT_FOUND"
        ? "Report not found"
        : "Report version not found",
    );
  }
}

const reportVersionInclude = {
  creator: {
    select: safeUserSelect,
  },
} as const;

export async function createReport(
  authUser: JwtPayload,
  input: CreateReportInput,
) {
  const weekStartDate = parseDateString(input.weekStartDate);

  const existingReport = await prisma.report.findUnique({
    where: {
      userId_weekStartDate: {
        userId: authUser.userId,
        weekStartDate,
      },
    },
    select: { id: true },
  });

  if (existingReport) {
    throw new AppError(
      409,
      "DUPLICATE_REPORT",
      "A report already exists for this week",
    );
  }

  try {
    const report = await prisma.$transaction(async (tx) => {
      const createdReport = await tx.report.create({
        data: {
          userId: authUser.userId,
          weekStartDate,
          weekEndDate: parseDateString(input.weekEndDate),
          status: ReportStatus.DRAFT,
          nextWeekTasks: input.nextWeekTasks,
          notes: input.notes,
        },
      });

      if (input.tasks.length > 0) {
        await tx.reportTask.createMany({
          data: mapTaskCreateData(createdReport.id, input.tasks),
        });
      }

      if (input.achievements.length > 0) {
        await tx.achievement.createMany({
          data: mapAchievementCreateData(createdReport.id, input.achievements),
        });
      }

      if (input.blockers.length > 0) {
        await tx.blocker.createMany({
          data: mapBlockerCreateData(createdReport.id, input.blockers),
        });
      }

      return tx.report.findUniqueOrThrow({
        where: { id: createdReport.id },
        include: reportDetailInclude,
      });
    });

    return formatReportDetail(report);
  } catch (error) {
    handleDuplicateReportError(error);
  }
}

export async function getReportById(reportId: string, authUser: JwtPayload) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: reportDetailInclude,
  });

  if (!report) {
    throw new AppError(404, "REPORT_NOT_FOUND", "Report not found");
  }

  assertCanAccessReport(report, authUser);

  return formatReportDetail(report);
}

export async function getReports(authUser: JwtPayload, filters: GetReportsFilters = {}) {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const limit =
    filters.limit && filters.limit > 0 ? Math.min(filters.limit, 100) : 10;
  const skip = (page - 1) * limit;

  const where: Prisma.ReportWhereInput = {};

  if (authUser.role === RoleName.TEAM_MEMBER) {
    where.userId = authUser.userId;

    if (filters.userId && filters.userId !== authUser.userId) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "You do not have access to other users' reports",
      );
    }
  } else if (filters.userId) {
    where.userId = filters.userId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.weekStartDate) {
    where.weekStartDate = parseDateString(filters.weekStartDate);
  }

  const [reports, total] = await prisma.$transaction([
    prisma.report.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ weekStartDate: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        userId: true,
        weekStartDate: true,
        weekEndDate: true,
        status: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: safeUserSelect,
        },
        _count: {
          select: {
            reportTasks: true,
            achievements: true,
            blockers: true,
          },
        },
      },
    }),
    prisma.report.count({ where }),
  ]);

  return {
    reports: reports.map((report) => ({
      ...report,
      user: toSafeUser(report.user),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateReport(
  reportId: string,
  authUser: JwtPayload,
  input: UpdateReportInput,
) {
  const existingReport = await prisma.report.findUnique({
    where: { id: reportId },
    select: {
      id: true,
      userId: true,
      status: true,
      weekStartDate: true,
      weekEndDate: true,
    },
  });

  if (!existingReport) {
    throw new AppError(404, "REPORT_NOT_FOUND", "Report not found");
  }

  assertCanModifyReport(existingReport, authUser);
  validateUpdateWeekDateRange(
    input,
    existingReport.weekStartDate,
    existingReport.weekEndDate,
  );

  if (input.weekStartDate !== undefined) {
    const weekStartDate = parseDateString(input.weekStartDate);
    const conflictingReport = await prisma.report.findUnique({
      where: {
        userId_weekStartDate: {
          userId: authUser.userId,
          weekStartDate,
        },
      },
      select: { id: true },
    });

    if (conflictingReport && conflictingReport.id !== reportId) {
      throw new AppError(
        409,
        "DUPLICATE_REPORT",
        "A report already exists for this week",
      );
    }
  }

  try {
    const report = await prisma.$transaction(async (tx) => {
      await tx.report.update({
        where: { id: reportId },
        data: {
          ...(input.weekStartDate !== undefined && {
            weekStartDate: parseDateString(input.weekStartDate),
          }),
          ...(input.weekEndDate !== undefined && {
            weekEndDate: parseDateString(input.weekEndDate),
          }),
          ...(input.nextWeekTasks !== undefined && {
            nextWeekTasks: input.nextWeekTasks,
          }),
          ...(input.notes !== undefined && {
            notes: input.notes,
          }),
        },
      });

      if (input.tasks !== undefined) {
        await tx.reportTask.deleteMany({ where: { reportId } });

        if (input.tasks.length > 0) {
          await tx.reportTask.createMany({
            data: mapTaskCreateData(reportId, input.tasks),
          });
        }
      }

      if (input.achievements !== undefined) {
        await tx.achievement.deleteMany({ where: { reportId } });

        if (input.achievements.length > 0) {
          await tx.achievement.createMany({
            data: mapAchievementCreateData(reportId, input.achievements),
          });
        }
      }

      if (input.blockers !== undefined) {
        await tx.blocker.deleteMany({ where: { reportId } });

        if (input.blockers.length > 0) {
          await tx.blocker.createMany({
            data: mapBlockerCreateData(reportId, input.blockers),
          });
        }
      }

      return tx.report.findUniqueOrThrow({
        where: { id: reportId },
        include: reportDetailInclude,
      });
    });

    return formatReportDetail(report);
  } catch (error) {
    handleDuplicateReportError(error);
  }
}

export async function submitReport(reportId: string, authUser: JwtPayload) {
  const existingReport = await prisma.report.findUnique({
    where: { id: reportId },
    include: reportDetailInclude,
  });

  if (!existingReport) {
    throw new AppError(404, "REPORT_NOT_FOUND", "Report not found");
  }

  assertCanSubmitReport(existingReport, authUser);
  validateReportForSubmission(existingReport);

  const previousStatus = existingReport.status;
  const snapshot = buildReportSnapshot(existingReport);

  const report = await prisma.$transaction(async (tx) => {
    const latestVersion = await tx.reportVersion.findFirst({
      where: { reportId },
      orderBy: { versionNumber: "desc" },
      select: { versionNumber: true },
    });

    const nextVersionNumber = (latestVersion?.versionNumber ?? 0) + 1;

    await tx.reportVersion.create({
      data: {
        reportId,
        versionNumber: nextVersionNumber,
        content: snapshot,
        createdBy: authUser.userId,
      },
    });

    await tx.report.update({
      where: { id: reportId },
      data: {
        status: ReportStatus.SUBMITTED,
      },
    });

    await tx.reportStatusHistory.create({
      data: {
        reportId,
        changedBy: authUser.userId,
        fromStatus: previousStatus,
        toStatus: ReportStatus.SUBMITTED,
      },
    });

    return tx.report.findUniqueOrThrow({
      where: { id: reportId },
      include: reportDetailInclude,
    });
  });

  return formatReportDetail(report);
}

export async function getReportVersions(
  authUser: JwtPayload,
  reportId: string,
) {
  await assertCanAccessReportForVersions(
    reportId,
    authUser,
    "REPORT_NOT_FOUND",
  );

  const versions = await prisma.reportVersion.findMany({
    where: { reportId },
    orderBy: { versionNumber: "desc" },
    include: reportVersionInclude,
  });

  return versions.map(formatReportVersion);
}

export async function getReportVersionById(
  authUser: JwtPayload,
  reportId: string,
  versionNumber: number,
) {
  await assertCanAccessReportForVersions(
    reportId,
    authUser,
    "REPORT_VERSION_NOT_FOUND",
  );

  const version = await prisma.reportVersion.findUnique({
    where: {
      reportId_versionNumber: {
        reportId,
        versionNumber,
      },
    },
    include: reportVersionInclude,
  });

  if (!version) {
    throw new AppError(
      404,
      "REPORT_VERSION_NOT_FOUND",
      "Report version not found",
    );
  }

  return formatReportVersion(version);
}
