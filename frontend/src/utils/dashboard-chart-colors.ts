import type { ReportStatus } from "@/types/report";

export const REPORT_STATUS_CHART_COLORS: Record<ReportStatus, string> = {
  DRAFT: "hsl(215 16% 65%)",
  SUBMITTED: "hsl(221 83% 53%)",
  NEEDS_CORRECTION: "hsl(38 92% 50%)",
  APPROVED: "hsl(142 71% 45%)",
};

export const TASK_TYPE_CHART_COLORS = [
  "hsl(221 83% 53%)",
  "hsl(142 71% 45%)",
  "hsl(38 92% 50%)",
  "hsl(280 65% 60%)",
  "hsl(0 72% 51%)",
  "hsl(199 89% 48%)",
  "hsl(24 95% 53%)",
  "hsl(173 58% 39%)",
] as const;
