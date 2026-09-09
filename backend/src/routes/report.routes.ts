import { Router } from "express";
import * as reportController from "../controllers/report.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  createReportSchema,
  updateReportSchema,
} from "../validators/report.validator.js";

const reportRouter = Router();

reportRouter.post(
  "/",
  requireAuth,
  validateBody(createReportSchema),
  reportController.create,
);

reportRouter.get("/", requireAuth, reportController.getAll);

reportRouter.post(
  "/:id/submit",
  requireAuth,
  reportController.submit,
);

reportRouter.get("/:id", requireAuth, reportController.getById);

reportRouter.patch(
  "/:id",
  requireAuth,
  validateBody(updateReportSchema),
  reportController.update,
);

export { reportRouter };
