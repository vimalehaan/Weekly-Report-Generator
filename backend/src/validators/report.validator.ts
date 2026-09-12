import { ReportStatus, TaskPriority, TaskStatus } from "@prisma/client";
import { z } from "zod";
import {
  isMondayWeekStart,
  isSundayWeekEnd,
  isValidReportingWeekWindow,
} from "../utils/report-week.js";

const dateStringSchema = z
  .string()
  .date("Must be a valid date string (YYYY-MM-DD)");

const uuidSchema = z.string().uuid("Must be a valid UUID");

const percentageSchema = z
  .number()
  .int("Must be a whole number")
  .min(0, "Must be at least 0")
  .max(100, "Must be at most 100");

const hoursSchema = z
  .number()
  .min(0, "Must be greater than or equal to 0");

export const reportTaskInputSchema = z.object({
  projectId: uuidSchema,
  taskTypeId: uuidSchema.nullish(),
  taskName: z.string().trim().min(1, "Task name is required"),
  priority: z.nativeEnum(TaskPriority),
  plannedPercentage: percentageSchema,
  actualPercentage: percentageSchema,
  status: z.nativeEnum(TaskStatus),
  plannedHours: hoursSchema,
  spentHours: hoursSchema,
  deliverable: z.string().trim().optional(),
});

export const achievementInputSchema = z.object({
  description: z.string().trim().min(1, "Achievement description is required"),
  isKeyAchievement: z.boolean(),
});

export const blockerInputSchema = z.object({
  description: z.string().trim().min(1, "Blocker description is required"),
  isKeyIssue: z.boolean(),
});

const reportFieldsSchema = z.object({
  weekStartDate: dateStringSchema,
  weekEndDate: dateStringSchema,
  tasks: z.array(reportTaskInputSchema),
  nextWeekTasks: z.array(z.string()),
  achievements: z.array(achievementInputSchema),
  blockers: z.array(blockerInputSchema),
  notes: z.string().trim().optional(),
});

const reportingWeekRefinementMessage =
  "Reporting week must start on a Monday and end on the following Sunday";

export const createReportSchema = reportFieldsSchema
  .refine(
    (data) => isMondayWeekStart(data.weekStartDate),
    {
      message: "weekStartDate must be a Monday",
      path: ["weekStartDate"],
    },
  )
  .refine(
    (data) => isSundayWeekEnd(data.weekEndDate),
    {
      message: "weekEndDate must be a Sunday",
      path: ["weekEndDate"],
    },
  )
  .refine(
    (data) =>
      isValidReportingWeekWindow(data.weekStartDate, data.weekEndDate),
    {
      message: reportingWeekRefinementMessage,
      path: ["weekEndDate"],
    },
  );

export const updateReportSchema = reportFieldsSchema.partial().superRefine(
  (data, ctx) => {
    if (data.weekStartDate !== undefined && !isMondayWeekStart(data.weekStartDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "weekStartDate must be a Monday",
        path: ["weekStartDate"],
      });
    }

    if (data.weekEndDate !== undefined && !isSundayWeekEnd(data.weekEndDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "weekEndDate must be a Sunday",
        path: ["weekEndDate"],
      });
    }

    if (
      data.weekStartDate !== undefined &&
      data.weekEndDate !== undefined &&
      !isValidReportingWeekWindow(data.weekStartDate, data.weekEndDate)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: reportingWeekRefinementMessage,
        path: ["weekEndDate"],
      });
    }
  },
);

const queryPositiveIntegerSchema = z
  .string()
  .transform((value) => Number(value))
  .pipe(z.number().int("Must be a positive integer").min(1));

const queryLimitSchema = z
  .string()
  .transform((value) => Number(value))
  .pipe(
    z
      .number()
      .int("Must be a positive integer")
      .min(1, "Must be at least 1")
      .max(100, "Must be at most 100"),
  );

export const reportListQuerySchema = z
  .object({
    page: queryPositiveIntegerSchema.optional(),
    limit: queryLimitSchema.optional(),
    status: z.nativeEnum(ReportStatus).optional(),
    weekStartDate: dateStringSchema.optional(),
    userId: uuidSchema.optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (
      data.weekStartDate !== undefined &&
      !isMondayWeekStart(data.weekStartDate)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "weekStartDate must be a Monday",
        path: ["weekStartDate"],
      });
    }
  });

export type ReportTaskInput = z.infer<typeof reportTaskInputSchema>;
export type AchievementInput = z.infer<typeof achievementInputSchema>;
export type BlockerInput = z.infer<typeof blockerInputSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
export type ReportListQueryInput = z.infer<typeof reportListQuerySchema>;
