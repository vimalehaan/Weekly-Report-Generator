import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV ?? "development";
const port = Number(process.env.PORT ?? 3000);
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? "1h";
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";

if (Number.isNaN(port)) {
  throw new Error("PORT must be a valid number");
}

if (!jwtSecret) {
  throw new Error("JWT_SECRET environment variable is required");
}

export const env = {
  nodeEnv,
  port,
  isProduction: nodeEnv === "production",
  jwtSecret,
  jwtExpiresIn,
  frontendUrl,
} as const;
