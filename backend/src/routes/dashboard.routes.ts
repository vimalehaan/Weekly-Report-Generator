import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateQuery } from "../middleware/validate.middleware.js";
import { dashboardQuerySchema } from "../validators/dashboard.validator.js";

const dashboardRouter = Router();

const dashboardQuery = validateQuery(dashboardQuerySchema);

dashboardRouter.get(
  "/summary",
  requireAuth,
  dashboardQuery,
  dashboardController.getSummary,
);

dashboardRouter.get(
  "/task-trends",
  requireAuth,
  dashboardQuery,
  dashboardController.getTaskTrends,
);

dashboardRouter.get(
  "/status-by-member",
  requireAuth,
  dashboardQuery,
  dashboardController.getStatusByMember,
);

dashboardRouter.get(
  "/workload-by-project",
  requireAuth,
  dashboardQuery,
  dashboardController.getWorkloadByProject,
);

dashboardRouter.get(
  "/time-by-task-type",
  requireAuth,
  dashboardQuery,
  dashboardController.getTimeByTaskType,
);

dashboardRouter.get(
  "/recent-activity",
  requireAuth,
  dashboardQuery,
  dashboardController.getRecentActivity,
);

export { dashboardRouter };
