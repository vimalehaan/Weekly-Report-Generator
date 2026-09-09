import { Router } from "express";
import * as taskTypeController from "../controllers/task-type.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const taskTypeRouter = Router();

taskTypeRouter.post("/", requireAuth, taskTypeController.createTaskType);

taskTypeRouter.get("/", requireAuth, taskTypeController.getTaskTypes);

taskTypeRouter.get("/:id", requireAuth, taskTypeController.getTaskTypeById);

taskTypeRouter.patch("/:id", requireAuth, taskTypeController.updateTaskType);

taskTypeRouter.delete("/:id", requireAuth, taskTypeController.deleteTaskType);

export { taskTypeRouter };
