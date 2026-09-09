import cookieParser from "cookie-parser";
import express from "express";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";
import { authRouter } from "./routes/auth.routes.js";

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

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
