import { Router } from "express";
import * as projectController from "../controllers/project.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../validators/project.validator.js";

const projectRouter = Router();

projectRouter.post(
  "/",
  requireAuth,
  validateBody(createProjectSchema),
  projectController.createProject,
);

projectRouter.get("/", requireAuth, projectController.getProjects);

projectRouter.get("/:id", requireAuth, projectController.getProjectById);

projectRouter.patch(
  "/:id",
  requireAuth,
  validateBody(updateProjectSchema),
  projectController.updateProject,
);

projectRouter.delete("/:id", requireAuth, projectController.deleteProject);

export { projectRouter };
