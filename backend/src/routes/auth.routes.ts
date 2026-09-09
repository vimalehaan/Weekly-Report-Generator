import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  loginSchema,
  registerSchema,
} from "../validators/auth.validator.js";

const authRouter = Router();

authRouter.post(
  "/register",
  validateBody(registerSchema),
  authController.register,
);

authRouter.post("/login", validateBody(loginSchema), authController.login);

authRouter.post("/logout", authController.logout);

authRouter.get("/me", requireAuth, authController.me);

export { authRouter };
