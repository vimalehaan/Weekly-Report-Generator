import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

const databaseUrl =
  process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? "";

if (!databaseUrl.includes("_test")) {
  throw new Error(
    'Integration tests require TEST_DATABASE_URL or DATABASE_URL pointing to a dedicated test database (name must contain "_test").',
  );
}

process.env.DATABASE_URL = databaseUrl;
process.env.NODE_ENV = "test";
process.env.JWT_SECRET ??= "test-jwt-secret-for-integration-tests";
process.env.JWT_EXPIRES_IN ??= "1h";
