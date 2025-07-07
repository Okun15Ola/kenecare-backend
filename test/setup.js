// Force Jest to use local mock for DB connection
jest.mock("../__tests__/__mocks__/src/repository/db.connection.js");

// Mock express-mysql-session to prevent real DB session creation
jest.mock("express-mysql-session", () => {
  return jest.fn(() => {
    return class MySQLStoreMock {
      constructor() {
        this.store = {}; // example internal state
      }

      get(sid, callback) {
        callback(null, this.store[sid] || null);
      }

      set(sid, session, callback) {
        this.store[sid] = session;
        callback(null);
      }

      destroy(sid, callback) {
        delete this.store[sid];
        callback(null);
      }
    };
  });
});

// Mock Stream SDK
jest.mock("@stream-io/node-sdk", () => ({
  StreamClient: jest.fn().mockImplementation(() => ({
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

jest.mock("@sendgrid/mail", () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([{ statusCode: 202 }]),
}));

// Suppress noisy console errors
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

// Close connection pool after tests
const { connectionPool } = require("../src/repository/db.connection");

afterAll(async () => {
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
