module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/test/jest.setup.js"],
  testMatch: ["**/__tests__/**/*.js", "**/*.test.js", "**/*.spec.js"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/__mocks__/",
    "/.history/",
    "/coverage/",
  ],
  forceExit: true,
  detectOpenHandles: true,
  // Optional: Coverage settings
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/*.test.js",
    "!src/**/*.spec.js",
    "!src/**/index.js",
    "!src/config/**",
  ],
  moduleNameMapper: {
    "^@controllers/(.*)$": "<rootDir>/src/controllers/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  // verbose: true,
  clearMocks: true,
  restoreMocks: true,
};
