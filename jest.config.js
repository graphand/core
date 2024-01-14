module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  globalSetup: "./src/__jest__/globalSetup.ts",
  globalTeardown: "./src/__jest__/globalTeardown.ts",
  clearMocks: true,
  modulePathIgnorePatterns: ["dist", ".idea", "node_modules", "src/__jest__"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
