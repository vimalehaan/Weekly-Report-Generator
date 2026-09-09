import {
  Prisma,
  ReportStatus,
  ReviewAction,
  RoleName,
  type Report,
  type ReportVersion,
} from "@prisma/client";
import { prisma } from "../config/database.js";
import type { JwtPayload } from "../types/auth.js";
import type { SafeUser } from "../types/user.js";
import { AppError } from "../utils/app-error.js";

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

type ReportWithDetails = Prisma.ReportGetPayload<{
  include: typeof reportDetailInclude;
}>;

type TransactionClient = Prisma.TransactionClient;

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

function formatReportDetail(report: ReportWithDetails) {
  return {
    ...report,
    user: toSafeUser(report.user),
  };
}

function assertManager(authUser: JwtPayload): void {
  if (authUser.role !== RoleName.MANAGER) {
    throw new AppError(403, "FORBIDDEN", "Insufficient permissions");
  }
}

function assertCanViewStatusHistory(
  report: Pick<Report, "userId">,
  authUser: JwtPayload,
): void {
  if (authUser.role === RoleName.MANAGER) {
    return;
  }

  if (
    authUser.role === RoleName.TEAM_MEMBER &&
    report.userId === authUser.userId
  ) {
    return;
  }

  throw new AppError(403, "FORBIDDEN", "You do not have access to this report");
}

function assertSubmittedStatus(report: Pick<Report, "status">): void {
  if (report.status !== ReportStatus.SUBMITTED) {
    throw new AppError(
      409,
      "INVALID_REVIEW_STATE",
      "Review actions are only allowed on submitted reports",
    );
  }
}

function validateRequiredComment(comment: string | undefined): string {
  const trimmedComment = comment?.trim();

  if (!trimmedComment) {
    throw new AppError(
      422,
      "REVIEW_COMMENT_REQUIRED",
      "A review comment is required",
    );
  }

  return trimmedComment;
}

function normalizeOptionalComment(comment: string | undefined): string | undefined {
  const trimmedComment = comment?.trim();
  return trimmedComment && trimmedComment.length > 0 ? trimmedComment : undefined;
}

async function getReportOrThrow(reportId: string) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: {
      id: true,
      userId: true,
      status: true,
    },
  });

  if (!report) {
    throw new AppError(404, "REPORT_NOT_FOUND", "Report not found");
  }

  return report;
}

async function getLatestReportVersion(
  reportId: string,
  client: TransactionClient | typeof prisma = prisma,
): Promise<ReportVersion> {
  const version = await client.reportVersion.findFirst({
    where: { reportId },
    orderBy: { versionNumber: "desc" },
  });

  if (!version) {
    throw new AppError(
      409,
      "REPORT_VERSION_NOT_FOUND",
      "No submitted version exists for this report",
    );
  }

  return version;
}

async function getReportDetail(reportId: string) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: reportDetailInclude,
  });

  if (!report) {
    throw new AppError(404, "REPORT_NOT_FOUND", "Report not found");
  }

  return formatReportDetail(report);
}

export async function requestCorrection(
  reportId: string,
  authUser: JwtPayload,
  comment: string,
) {
  assertManager(authUser);

  const report = await getReportOrThrow(reportId);
  assertSubmittedStatus(report);

  const reviewComment = validateRequiredComment(comment);

  await prisma.$transaction(async (tx) => {
    const latestVersion = await getLatestReportVersion(reportId, tx);

    await tx.reportReview.create({
      data: {
        reportVersionId: latestVersion.id,
        reviewerId: authUser.userId,
        action: ReviewAction.REQUEST_CORRECTION,
        comment: reviewComment,
      },
    });

    await tx.report.update({
      where: { id: reportId },
      data: {
        status: ReportStatus.NEEDS_CORRECTION,
      },
    });

    await tx.reportStatusHistory.create({
      data: {
        reportId,
        changedBy: authUser.userId,
        fromStatus: ReportStatus.SUBMITTED,
        toStatus: ReportStatus.NEEDS_CORRECTION,
        comment: reviewComment,
      },
    });
  });

  return getReportDetail(reportId);
}

export async function approveReport(
  reportId: string,
  authUser: JwtPayload,
  comment?: string,
) {
  assertManager(authUser);

  const report = await getReportOrThrow(reportId);
  assertSubmittedStatus(report);

  const reviewComment = normalizeOptionalComment(comment);

  await prisma.$transaction(async (tx) => {
    const latestVersion = await getLatestReportVersion(reportId, tx);

    await tx.reportReview.create({
      data: {
        reportVersionId: latestVersion.id,
        reviewerId: authUser.userId,
        action: ReviewAction.APPROVE,
        comment: reviewComment,
      },
    });

    await tx.report.update({
      where: { id: reportId },
      data: {
        status: ReportStatus.APPROVED,
      },
    });

    await tx.reportStatusHistory.create({
      data: {
        reportId,
        changedBy: authUser.userId,
        fromStatus: ReportStatus.SUBMITTED,
        toStatus: ReportStatus.APPROVED,
        comment: reviewComment,
      },
    });
  });

  return getReportDetail(reportId);
}

export async function addComment(
  reportId: string,
  authUser: JwtPayload,
  comment: string,
) {
  assertManager(authUser);

  await getReportOrThrow(reportId);

  const reviewComment = validateRequiredComment(comment);

  const review = await prisma.$transaction(async (tx) => {
    const latestVersion = await getLatestReportVersion(reportId, tx);

    return tx.reportReview.create({
      data: {
        reportVersionId: latestVersion.id,
        reviewerId: authUser.userId,
        action: ReviewAction.COMMENT,
        comment: reviewComment,
      },
      include: {
        reviewer: {
          select: safeUserSelect,
        },
        reportVersion: {
          select: {
            id: true,
            versionNumber: true,
            createdAt: true,
          },
        },
      },
    });
  });

  return {
    id: review.id,
    action: review.action,
    comment: review.comment,
    createdAt: review.createdAt,
    reviewer: toSafeUser(review.reviewer),
    reportVersion: review.reportVersion,
  };
}

export async function getReviews(reportId: string, authUser: JwtPayload) {
  assertManager(authUser);

  const report = await getReportOrThrow(reportId);

  const reviews = await prisma.reportReview.findMany({
    where: {
      reportVersion: {
        reportId: report.id,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      reviewer: {
        select: safeUserSelect,
      },
      reportVersion: {
        select: {
          id: true,
          versionNumber: true,
          createdAt: true,
        },
      },
    },
  });

  return reviews.map((review) => ({
    id: review.id,
    action: review.action,
    comment: review.comment,
    createdAt: review.createdAt,
    reviewer: toSafeUser(review.reviewer),
    reportVersion: review.reportVersion,
  }));
}

export async function getStatusHistory(reportId: string, authUser: JwtPayload) {
  const report = await getReportOrThrow(reportId);
  assertCanViewStatusHistory(report, authUser);

  const statusHistory = await prisma.reportStatusHistory.findMany({
    where: { reportId },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      changer: {
        select: safeUserSelect,
      },
    },
  });

  return statusHistory.map((entry) => ({
    id: entry.id,
    fromStatus: entry.fromStatus,
    toStatus: entry.toStatus,
    comment: entry.comment,
    createdAt: entry.createdAt,
    changedBy: toSafeUser(entry.changer),
  }));
}
