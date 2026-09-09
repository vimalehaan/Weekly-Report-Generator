import cookieParser from "cookie-parser";
import express from "express";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";
import { authRouter } from "./routes/auth.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { reportRouter } from "./routes/report.routes.js";
import { reviewRouter } from "./routes/review.routes.js";
import { projectRouter } from "./routes/project.routes.js";
import { taskTypeRouter } from "./routes/task-type.routes.js";
import { userRouter } from "./routes/user.routes.js";

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    res.status(200).json({
      data: {
        status: "ok",
      },
    });
  });

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/dashboard", dashboardRouter);
  app.use("/api/v1/reports", reportRouter);
  app.use("/api/v1/reports", reviewRouter);
  app.use("/api/v1/projects", projectRouter);
  app.use("/api/v1/task-types", taskTypeRouter);
  app.use("/api/v1/users", userRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
