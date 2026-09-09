import type { Express } from "express";
import { env } from "./config/env.js";

export function startServer(app: Express) {
  const server = app.listen(env.port, () => {
    console.log(`Backend server listening on port ${env.port}`);
  });

  return server;
}
