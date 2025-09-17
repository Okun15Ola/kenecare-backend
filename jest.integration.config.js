module.exports = {
  globalSetup: "./test/jest.integration.setup.js",
  globalTeardown: "./test/jest.integration.teardown.js",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.integration.test.js"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.history/",
    "/coverage/",
    "/dist/",
  ],
  forceExit: true,
  detectOpenHandles: true,
};
