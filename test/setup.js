// Global test setup file
// This file contains all common mocks used across test files

// Mock the Stream SDK
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

afterAll(() => {
  // Restore console.error after all tests
  if (console.error.mockRestore) {
    console.error.mockRestore();
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
