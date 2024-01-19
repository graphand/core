module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  globalSetup: "./__jest__/globalSetup.ts",
  globalTeardown: "./__jest__/globalTeardown.ts",
  clearMocks: true,
  modulePathIgnorePatterns: ["dist", ".idea", "node_modules", "__jest__"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
