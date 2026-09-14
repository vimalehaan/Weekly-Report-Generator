/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.test.json",
      },
    ],
  },
  setupFiles: ["<rootDir>/tests/setup/env.ts"],
  globalSetup: "<rootDir>/tests/setup/globalSetup.ts",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  testTimeout: 30000,
};

export default config;
