import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV ?? "development";
const port = Number(process.env.PORT ?? 3000);

if (Number.isNaN(port)) {
  throw new Error("PORT must be a valid number");
}

export const env = {
  nodeEnv,
  port,
  isProduction: nodeEnv === "production",
} as const;
