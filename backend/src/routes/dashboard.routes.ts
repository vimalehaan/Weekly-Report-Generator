import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const dashboardRouter = Router();

dashboardRouter.get("/summary", requireAuth, dashboardController.getSummary);

dashboardRouter.get(
  "/task-trends",
  requireAuth,
  dashboardController.getTaskTrends,
);

dashboardRouter.get(
  "/status-by-member",
  requireAuth,
  dashboardController.getStatusByMember,
);

dashboardRouter.get(
  "/workload-by-project",
  requireAuth,
  dashboardController.getWorkloadByProject,
);

dashboardRouter.get(
  "/time-by-task-type",
  requireAuth,
  dashboardController.getTimeByTaskType,
);

dashboardRouter.get(
  "/recent-activity",
  requireAuth,
  dashboardController.getRecentActivity,
);

export { dashboardRouter };
