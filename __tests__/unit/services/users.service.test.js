/* eslint-disable no-unused-vars */
const usersService = require("../../../src/services/users.service");
const Response = require("../../../src/utils/response.utils");
const { redisClient } = require("../../../src/config/redis.config");
const { verifyTokenExpiry } = require("../../../src/utils/time.utils");
const {
  getAllUsers,
  getUserById,
  createNewUser,
  updateUserVerificationStatusByToken,
  updateUserAccountStatusById,
  updateUserOnlineStatus,
  updateUserVerificationTokenById,
  updateUserPasswordById,
} = require("../../../src/repository/users.repository");
const {
  generateAndSendVerificationOTP,
} = require("../../../src/utils/auth.utils");
// const {
//   sendAuthTokenSMS,
//   sendVerificationTokenSMS,
//   sendPasswordResetSMS,
// } = require("../../../src/utils/sms.utils");
const {
  USERTYPE,
  VERIFICATIONSTATUS,
  STATUS,
} = require("../../../src/utils/enum.utils");

jest.mock("../../../src/utils/response.utils", () => ({
  SUCCESS: jest.fn(),
  NOT_FOUND: jest.fn(),
  CREATED: jest.fn(),
  BAD_REQUEST: jest.fn(),
  INTERNAL_SERVER_ERROR: jest.fn(),
  NOT_MODIFIED: jest.fn(),
}));

jest.mock("../../../src/repository/users.repository", () => ({
  getAllUsers: jest.fn(),
  getUserById: jest.fn(),
  getUserByMobileNumber: jest.fn(),
  getUserByEmail: jest.fn(),
  getUserByVerificationToken: jest.fn(),
  createNewUser: jest.fn(),
  updateUserVerificationStatusByToken: jest.fn(),
  updateUserAccountStatusById: jest.fn(),
  updateUserOnlineStatus: jest.fn(),
  updateUserVerificationTokenById: jest.fn(),
  updateUserPasswordById: jest.fn(),
  updateUserNotificationToken: jest.fn(),
}));

jest.mock("../../../src/utils/auth.utils", () => ({
  generateVerificationToken: jest.fn(() => "token123"),
  generateUsersJwtAccessToken: jest.fn(() => "jwt-token"),
  generateAndSendVerificationOTP: jest.fn(),
  hashUsersPassword: jest.fn(() => Promise.resolve("hashed-password")),
  blacklistAllUserTokens: jest.fn(() => Promise.resolve()),
  blacklistToken: jest.fn(() => Promise.resolve()),
  refineMobileNumber: jest.fn((n) => n),
}));

jest.mock("../../../src/utils/db-mapper.utils", () => ({
  mapUserRow: jest.fn((row) => ({ ...row, mapped: true })),
}));

jest.mock("../../../src/config/redis.config", () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clearCacheByPattern: jest.fn(),
  },
}));

jest.mock("../../../src/utils/caching.utils", () => ({
  cacheKeyBulider: jest.fn((...args) => args.join(":")),
  getCachedCount: jest.fn((_) => Promise.resolve(1)),
  getPaginationInfo: jest.fn((_) => ({})),
}));

jest.mock("../../../src/utils/sms.utils", () => ({
  sendAuthTokenSMS: jest.fn(() => Promise.resolve()),
  sendVerificationTokenSMS: jest.fn(() => Promise.resolve()),
  sendPasswordResetSMS: jest.fn(() => Promise.resolve()),
}));

jest.mock("../../../src/middlewares/logger.middleware", () => ({
  error: jest.fn(),
  warn: jest.fn(),
}));

jest.mock("../../../src/utils/stream.utils", () => ({
  generateStreamUserToken: jest.fn(() => Promise.resolve("stream-token")),
}));

jest.mock("../../../src/utils/helpers.utils", () => ({
  createStreamUserProfile: jest.fn(() => Promise.resolve()),
  refineMobileNumber: jest.fn((n) => n),
}));

jest.mock("../../../src/utils/time.utils", () => ({
  generateTokenExpiryTime: jest.fn(() => Date.now() + 1000 * 60 * 15),
  verifyTokenExpiry: jest.fn(() => false),
}));

// ✅ Mock enum utils
jest.mock("../../../src/utils/enum.utils", () => ({
  USERTYPE: {
    PATIENT: 1,
    DOCTOR: 2,
  },
  VERIFICATIONSTATUS: {
    VERIFIED: "VERIFIED",
    NOT_VERIFIED: "NOT_VERIFIED",
  },
  STATUS: {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
  },
}));

describe("users.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Response.SUCCESS.mockImplementation((data = {}) => ({
      status: "success",
      statusCode: 200,
      message: data.message || "Success",
      data: data.data || null,
    }));

    Response.NOT_FOUND.mockImplementation((data = {}) => ({
      status: "error",
      statusCode: 404,
      message: data.message || "Not found",
    }));

    Response.CREATED.mockImplementation((data = {}) => ({
      status: "success",
      statusCode: 201,
      message: data.message || "Created",
      data: data.data || null,
    }));

    Response.BAD_REQUEST.mockImplementation((data = {}) => ({
      status: "error",
      statusCode: 400,
      message: data.message || "Bad request",
    }));

    Response.INTERNAL_SERVER_ERROR.mockImplementation((data = {}) => ({
      status: "error",
      statusCode: 500,
      message: data.message || "Internal server error",
    }));

    Response.NOT_MODIFIED.mockImplementation((data = {}) => ({
      status: "error",
      statusCode: 304,
      message: data.message || "Not modified",
    }));
  });

  describe("getUsers", () => {
    it("returns cached users if present", async () => {
      const users = [{ id: 1 }];
      redisClient.get.mockResolvedValue(JSON.stringify(users));

      const result = await usersService.getUsers(10, 0, { total: 1 });

      expect(result.data).toEqual(users);
    });

    it("returns users from repo if not cached", async () => {
      redisClient.get.mockResolvedValue(null);
      getAllUsers.mockResolvedValue([{ id: 1 }]);

      const result = await usersService.getUsers(10, 0, { total: 1 });

      expect(result.data[0].mapped).toBe(true);
    });

    it("returns empty array if no users found", async () => {
      redisClient.get.mockResolvedValue(null);
      getAllUsers.mockResolvedValue([]);

      const result = await usersService.getUsers(10, 0, { total: 0 });

      expect(result.data).toEqual([]);
    });
  });

  describe("getUserById", () => {
    it("returns cached user if present", async () => {
      redisClient.get.mockResolvedValue(JSON.stringify({ id: 1 }));

      const result = await usersService.getUserById(1);

      expect(result.id).toBe(1);
    });

    it("returns user from repo if not cached", async () => {
      redisClient.get.mockResolvedValue(null);
      getUserById.mockResolvedValue({ id: 2 });

      const result = await usersService.getUserById(2);

      expect(result.mapped).toBe(true);
    });

    it("returns null if user not found", async () => {
      redisClient.get.mockResolvedValue(null);
      getUserById.mockResolvedValue(null);

      const result = await usersService.getUserById(3);

      expect(result).toBe(null);
    });
  });

  describe("registerNewUser", () => {
    it("creates a new user and sends SMS", async () => {
      createNewUser.mockResolvedValue({ insertId: 1 });

      const result = await usersService.registerNewUser({
        mobileNumber: "1234567890",
        password: "pass",
        userType: "patient",
      });

      expect(result.statusCode).toBe(201);
    });

    it("returns error if user creation fails", async () => {
      createNewUser.mockResolvedValue({ insertId: null });

      const result = await usersService.registerNewUser({
        mobileNumber: "1234567890",
        password: "pass",
        userType: "patient",
      });

      expect(result.statusCode).toBe(500);
    });
  });

  describe("verifyRegistrationOTP", () => {
    it("returns success if already verified", async () => {
      const result = await usersService.verifyRegistrationOTP({
        token: "token",
        user: { accountVerified: VERIFICATIONSTATUS.VERIFIED },
      });

      expect(result.statusCode).toBe(200);
    });

    it("returns error if token expired", async () => {
      verifyTokenExpiry.mockReturnValueOnce(true);

      const result = await usersService.verifyRegistrationOTP({
        token: "token",
        user: {
          accountVerified: VERIFICATIONSTATUS.NOT_VERIFIED,
          verificationTokenExpiry: Date.now(),
        },
      });

      expect(result.statusCode).toBe(400);
    });

    it("returns error if no rows updated", async () => {
      verifyTokenExpiry.mockReturnValueOnce(false);
      updateUserVerificationStatusByToken.mockResolvedValue({
        affectedRows: 0,
      });

      const result = await usersService.verifyRegistrationOTP({
        token: "token",
        user: {
          accountVerified: VERIFICATIONSTATUS.NOT_VERIFIED,
          verificationTokenExpiry: Date.now(),
          userId: 1,
          userType: USERTYPE.PATIENT,
          accountActive: true,
        },
      });

      expect(result.statusCode).toBe(500);
    });

    it("returns success if verified", async () => {
      verifyTokenExpiry.mockReturnValueOnce(false);
      updateUserVerificationStatusByToken.mockResolvedValue({
        affectedRows: 1,
      });

      const result = await usersService.verifyRegistrationOTP({
        token: "token",
        user: {
          accountVerified: VERIFICATIONSTATUS.NOT_VERIFIED,
          verificationTokenExpiry: Date.now(),
          userId: 1,
          userType: USERTYPE.PATIENT,
          accountActive: true,
        },
      });

      expect(result.statusCode).toBe(200);
    });
  });

  describe("loginUser", () => {
    it("returns OTP response if 2FA enabled", async () => {
      generateAndSendVerificationOTP.mockResolvedValueOnce({
        statusCode: 200,
        message: "OTP sent successfully",
        data: { otpSent: true },
      });

      const result = await usersService.loginUser({
        is2faEnabled: STATUS.ACTIVE,
        userId: 1,
        userType: USERTYPE.PATIENT,
        accountVerified: true,
        accountActive: true,
        mobileNumber: "1234567890",
      });

      expect(generateAndSendVerificationOTP).toHaveBeenCalledWith({
        userId: 1,
        mobileNumber: "1234567890",
      });
      expect(result.statusCode).toBe(200);
      expect(result.message).toMatch(/OTP sent/i);
    });

    it("returns success if login successful", async () => {
      updateUserAccountStatusById.mockResolvedValue({ affectedRows: 1 });

      const result = await usersService.loginUser({
        is2faEnabled: STATUS.INACTIVE,
        userId: 1,
        userType: USERTYPE.PATIENT,
        accountVerified: true,
        accountActive: true,
        mobileNumber: "1234567890",
      });

      expect(result.statusCode).toBe(200);
    });

    it("returns NOT_MODIFIED if update fails", async () => {
      updateUserAccountStatusById.mockResolvedValue({ affectedRows: 0 });

      const result = await usersService.loginUser({
        is2faEnabled: STATUS.INACTIVE,
        userId: 1,
        userType: USERTYPE.PATIENT,
        accountVerified: true,
        accountActive: true,
        mobileNumber: "1234567890",
      });

      expect(result.statusCode).toBe(304);
    });
  });

  describe("logoutUser", () => {
    it("returns success if logout successful", async () => {
      updateUserOnlineStatus.mockResolvedValue({ affectedRows: 1 });

      const result = await usersService.logoutUser({
        userId: 1,
        token: "jwt",
        tokenExpiry: Date.now(),
      });

      expect(result.statusCode).toBe(200);
    });

    it("returns error if update fails", async () => {
      updateUserOnlineStatus.mockResolvedValue({ affectedRows: 0 });

      const result = await usersService.logoutUser({
        userId: 1,
        token: "jwt",
        tokenExpiry: Date.now(),
      });

      expect(result.statusCode).toBe(500);
    });
  });

  describe("updateUserPassword", () => {
    it("returns success if password updated", async () => {
      updateUserPasswordById.mockResolvedValue({ affectedRows: 1 });
      updateUserVerificationTokenById.mockResolvedValue({});

      const result = await usersService.updateUserPassword({
        newPassword: "new",
        userId: 1,
        mobileNumber: "1234567890",
      });

      expect(result.statusCode).toBe(200);
    });

    it("returns NOT_MODIFIED if update fails", async () => {
      updateUserPasswordById.mockResolvedValue({ affectedRows: 0 });

      const result = await usersService.updateUserPassword({
        newPassword: "new",
        userId: 1,
        mobileNumber: "1234567890",
      });

      expect(result.statusCode).toBe(304);
    });
  });
});
