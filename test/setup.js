// Global test setup file
// This file contains all common mocks used across test files

// Mock the Stream SDK
// Import MySQL connection pool for use in afterAll
const { connectionPool } = require("../src/repository/db.connection");

jest.mock("@stream-io/node-sdk", () => ({
  StreamClient: jest.fn().mockImplementation(() => ({
    // Add any Stream client methods you might need for testing
    connectUser: jest.fn(),
    disconnectUser: jest.fn(),
    createToken: jest.fn(),
  })),
}));

// Mock ioredis
jest.mock("ioredis", () => {
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    quit: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    on: jest.fn(),
    status: "ready",
  }));
});

// Global test configuration
beforeAll(() => {
  // Suppress console errors during tests to reduce noise
  jest.spyOn(console, "error").mockImplementation(() => {});
});

// Close MySQL connection pool after all tests
afterAll(async () => {
  // Restore mocked console.error
  if (console.error.mockRestore) {
    console.error.mockRestore();
    try {
      if (connectionPool && typeof connectionPool.end === "function") {
        await new Promise((resolve, reject) => {
          connectionPool.end((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    } catch (err) {
      console.warn("Failed to close MySQL pool:", err.message);
    }
  }
});

// You can add other global mocks here as needed
// For example, if you use other external services:
/*
jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(),
  })),
}));
*/
