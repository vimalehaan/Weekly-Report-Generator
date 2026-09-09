import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  validateBody,
  validateQuery,
} from "../middleware/validate.middleware.js";
import {
  getUsersQuerySchema,
  updateUserSchema,
} from "../validators/user.validator.js";

const userRouter = Router();

userRouter.get(
  "/",
  requireAuth,
  validateQuery(getUsersQuerySchema),
  userController.getUsers,
);

userRouter.get("/:id", requireAuth, userController.getUserById);

userRouter.patch(
  "/:id",
  requireAuth,
  validateBody(updateUserSchema),
  userController.updateUser,
);

export { userRouter };
