import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const userRouter = Router();

userRouter.get("/", requireAuth, userController.getUsers);

userRouter.get("/:id", requireAuth, userController.getUserById);

userRouter.patch("/:id", requireAuth, userController.updateUser);

export { userRouter };
