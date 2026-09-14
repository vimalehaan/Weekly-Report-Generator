import { Router } from "express";
import * as reportController from "../controllers/report.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  validateBody,
  validateQuery,
} from "../middleware/validate.middleware.js";
import {
  createReportSchema,
  reportListQuerySchema,
  updateReportSchema,
} from "../validators/report.validator.js";

const reportRouter = Router();

reportRouter.post(
  "/",
  requireAuth,
  validateBody(createReportSchema),
  reportController.create,
);

reportRouter.get(
  "/",
  requireAuth,
  validateQuery(reportListQuerySchema),
  reportController.getAll,
);

reportRouter.post(
  "/:id/submit",
  requireAuth,
  reportController.submit,
);

reportRouter.get(
  "/:id/versions/:versionNumber",
  requireAuth,
  reportController.getVersionById,
);

reportRouter.get(
  "/:id/versions",
  requireAuth,
  reportController.getVersions,
);

reportRouter.get("/:id", requireAuth, reportController.getById);

reportRouter.patch(
  "/:id",
  requireAuth,
  validateBody(updateReportSchema),
  reportController.update,
);

export { reportRouter };
