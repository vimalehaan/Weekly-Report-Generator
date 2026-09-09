import express from "express";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({
      data: {
        status: "ok",
      },
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
