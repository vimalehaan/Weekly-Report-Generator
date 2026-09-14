import { z } from "zod";

export const requestCorrectionSchema = z.object({
  comment: z.string().trim().min(1, "Comment is required"),
});

export const approveReportSchema = z.object({
  comment: z.string().trim().optional(),
});

export const addCommentSchema = z.object({
  comment: z.string().trim().min(1, "Comment is required"),
});

export type RequestCorrectionInput = z.infer<typeof requestCorrectionSchema>;
export type ApproveReportInput = z.infer<typeof approveReportSchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;
