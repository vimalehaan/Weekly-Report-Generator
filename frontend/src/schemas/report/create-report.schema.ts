import { z } from "zod";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/types/report";

const dateStringSchema = z
  .string()
  .min(1, "Date is required")
  .date("Must be a valid date (YYYY-MM-DD)");

const uuidSchema = z.string().uuid("Select a valid project");

const percentageSchema = z
  .number({ message: "Must be a number" })
  .int("Must be a whole number")
  .min(0, "Must be at least 0")
  .max(100, "Must be at most 100");

const hoursSchema = z
  .number({ message: "Must be a number" })
  .min(0, "Must be greater than or equal to 0");

export const reportTaskFormSchema = z.object({
  projectId: z
    .string()
    .min(1, "Select a project")
    .pipe(uuidSchema),
  taskTypeId: z.union([z.string().uuid(), z.literal("")]),
  taskName: z.string().trim().min(1, "Task name is required"),
  priority: z.enum(TASK_PRIORITIES),
  plannedPercentage: percentageSchema,
  actualPercentage: percentageSchema,
  status: z.enum(TASK_STATUSES),
  plannedHours: hoursSchema,
  spentHours: hoursSchema,
  deliverable: z.string().trim().optional(),
});

export const achievementFormSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Achievement description is required"),
  isKeyAchievement: z.boolean(),
});

export const blockerFormSchema = z.object({
  description: z.string().trim().min(1, "Blocker description is required"),
  isKeyIssue: z.boolean(),
});

const reportFieldsSchema = z.object({
  weekStartDate: dateStringSchema,
  tasks: z.array(reportTaskFormSchema),
  nextWeekTasks: z.array(
    z.object({
      description: z
        .string()
        .trim()
        .min(1, "Next week task description is required"),
    }),
  ),
  achievements: z.array(achievementFormSchema),
  blockers: z.array(blockerFormSchema),
  notes: z.string().trim().optional(),
});

export const createReportFormSchema = reportFieldsSchema;

export type CreateReportFormValues = z.infer<typeof createReportFormSchema>;

export type ReportTaskFormValues = z.infer<typeof reportTaskFormSchema>;

export function createEmptyTaskRow(): ReportTaskFormValues {
  return {
    projectId: "",
    taskTypeId: "",
    taskName: "",
    priority: "MEDIUM",
    plannedPercentage: 0,
    actualPercentage: 0,
    status: "NOT_STARTED",
    plannedHours: 0,
    spentHours: 0,
    deliverable: "",
  };
}
