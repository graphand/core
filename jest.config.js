module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  clearMocks: true,
  modulePathIgnorePatterns: ["dist", ".idea", "node_modules", "__jest__"],
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
