import { Router } from "express";
import * as projectController from "../controllers/project.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const projectRouter = Router();

projectRouter.post("/", requireAuth, projectController.createProject);

projectRouter.get("/", requireAuth, projectController.getProjects);

projectRouter.get("/:id", requireAuth, projectController.getProjectById);

projectRouter.patch("/:id", requireAuth, projectController.updateProject);

projectRouter.delete("/:id", requireAuth, projectController.deleteProject);

export { projectRouter };
