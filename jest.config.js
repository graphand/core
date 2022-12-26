module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  globalSetup: "./src/jest.globalSetup.ts",
  globalTeardown: "./src/jest.globalTeardown.ts",
  clearMocks: true,
  modulePathIgnorePatterns: ["dist"],
};
