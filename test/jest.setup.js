process.env.NODE_ENV = "test";

// Optional: Set up AWS config mocks if needed
process.env.AWS_ACCESS_KEY_ID = "test-access-key";
process.env.AWS_SECRET_ACCESS_KEY = "test-secret-key";
process.env.AWS_REGION = "us-east-1";
process.env.AWS_BUCKET_NAME = "test-bucket";

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
  const RedisMock = jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    quit: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    on: jest.fn(),
    status: "ready",
    keys: jest.fn().mockResolvedValue([]),
    unlink: jest.fn().mockResolvedValue(1),
  }));

  RedisMock.Cluster = jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    quit: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    on: jest.fn(),
    status: "ready",
    keys: jest.fn().mockResolvedValue([]),
    unlink: jest.fn().mockResolvedValue(1),
  }));

  return RedisMock;
});

jest.mock("@sendgrid/mail", () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([{ statusCode: 202 }]),
}));

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  PutObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
}));

jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest.fn(),
}));

jest.mock("../src/middlewares/logger.middleware", () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

// Suppress noisy console errors
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

// Mocks all console methods globally
global.console = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn(),
};

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
