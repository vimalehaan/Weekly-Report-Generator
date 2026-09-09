import { Router } from "express";
import * as taskTypeController from "../controllers/task-type.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  validateBody,
  validateQuery,
} from "../middleware/validate.middleware.js";
import {
  createTaskTypeSchema,
  getTaskTypesQuerySchema,
  updateTaskTypeSchema,
} from "../validators/task-type.validator.js";

const taskTypeRouter = Router();

taskTypeRouter.post(
  "/",
  requireAuth,
  validateBody(createTaskTypeSchema),
  taskTypeController.createTaskType,
);

taskTypeRouter.get(
  "/",
  requireAuth,
  validateQuery(getTaskTypesQuerySchema),
  taskTypeController.getTaskTypes,
);

taskTypeRouter.get("/:id", requireAuth, taskTypeController.getTaskTypeById);

taskTypeRouter.patch(
  "/:id",
  requireAuth,
  validateBody(updateTaskTypeSchema),
  taskTypeController.updateTaskType,
);

taskTypeRouter.delete("/:id", requireAuth, taskTypeController.deleteTaskType);

export { taskTypeRouter };
