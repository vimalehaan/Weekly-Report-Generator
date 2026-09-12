import { z } from "zod";
import { isMondayWeekStart } from "../utils/report-week.js";

const dateStringSchema = z
  .string()
  .date("Must be a valid date string (YYYY-MM-DD)");

export const dashboardQuerySchema = z
  .object({
    weekStartDate: dateStringSchema.optional(),
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

export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;
