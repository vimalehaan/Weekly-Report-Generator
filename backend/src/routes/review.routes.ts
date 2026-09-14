import { Router } from "express";
import * as reviewController from "../controllers/review.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  addCommentSchema,
  approveReportSchema,
  requestCorrectionSchema,
} from "../validators/review.validator.js";

const reviewRouter = Router();

reviewRouter.post(
  "/:id/request-correction",
  requireAuth,
  validateBody(requestCorrectionSchema),
  reviewController.requestCorrection,
);

reviewRouter.post(
  "/:id/approve",
  requireAuth,
  validateBody(approveReportSchema),
  reviewController.approve,
);

reviewRouter.post(
  "/:id/comments",
  requireAuth,
  validateBody(addCommentSchema),
  reviewController.addComment,
);

reviewRouter.get("/:id/reviews", requireAuth, reviewController.getReviews);

reviewRouter.get(
  "/:id/status-history",
  requireAuth,
  reviewController.getStatusHistory,
);

export { reviewRouter };
