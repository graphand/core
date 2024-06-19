module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  clearMocks: true,
  testTimeout: 500,
  setupFilesAfterEnv: [
    "<rootDir>/src/modules/register-models.ts",
    "<rootDir>/src/modules/validators.ts",
  ],
  coveragePathIgnorePatterns: ["node_modules", "<rootDir>/src/index.ts"],
  modulePathIgnorePatterns: ["dist", ".idea", "node_modules"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        isolatedModules: true,
      },
    ],
  },
};
