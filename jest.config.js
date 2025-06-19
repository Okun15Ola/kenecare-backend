module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
  testMatch: ["**/__tests__/**/*.js"],
  // Optional: Add these for better test experience
  testPathIgnorePatterns: [
    "/node_modules/",
    "/__mock__/", // ignore all mocks as test suites
  ],
  forceExit: true,
  detectOpenHandles: true,
  // Optional: Coverage settings
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/*.test.js",
    "!src/**/*.spec.js",
  ],
  moduleNameMapper: {
    "^@controllers/(.*)$": "<rootDir>/src/controllers/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
  },
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
};
