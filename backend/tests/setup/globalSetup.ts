import { execSync } from "node:child_process";
import path from "node:path";
import dotenv from "dotenv";

export default async function globalSetup(): Promise<void> {
  const backendRoot = process.cwd();

  dotenv.config({ path: path.resolve(backendRoot, ".env.test") });

  const databaseUrl =
    process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? "";

  if (!databaseUrl.includes("_test")) {
    throw new Error(
      'Integration tests require a dedicated test database (URL must contain "_test"). Copy .env.test.example to .env.test.',
    );
  }

  process.env.DATABASE_URL = databaseUrl;

  execSync("npx prisma migrate deploy", {
    cwd: backendRoot,
    stdio: "inherit",
    env: process.env,
  });
}
