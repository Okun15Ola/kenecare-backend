jest.mock("../../../src/repository/users.repository");
jest.mock("../../../src/repository/patients.repository");
jest.mock("../../../src/repository/doctors.repository");
jest.mock("../../../src/config/redis.config");
jest.mock("../../../src/utils/auth.utils");
jest.mock("../../../src/utils/sms.utils");
jest.mock("../../../src/utils/stream.utils");
jest.mock("../../../src/utils/aws-s3.utils");
jest.mock("../../../src/utils/caching.utils");

const userService = require("../../../src/services/users.service");
const userRepo = require("../../../src/repository/users.repository");
const patientRepo = require("../../../src/repository/patients.repository");
// const doctorRepo = require("../../../src/repository/doctors.repository");
const { redisClient } = require("../../../src/config/redis.config");
const authUtils = require("../../../src/utils/auth.utils");
const smsUtils = require("../../../src/utils/sms.utils");
const streamUtils = require("../../../src/utils/stream.utils");
const awsS3 = require("../../../src/utils/aws-s3.utils");
const caching = require("../../../src/utils/caching.utils");
// const Response = require("../../../src/utils/response.utils");

describe("User Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUsers", () => {
    it("should return users from cache if available", async () => {
      const cachedData = [{ id: 1, name: "John Doe" }];
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));
      caching.cacheKeyBulider.mockReturnValue("cache-key");

      const result = await userService.getUsers(10, 0, {});
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalledWith("cache-key");
    });

    it("should throw an error if repo fails", async () => {
      redisClient.get.mockResolvedValue(null);
      userRepo.getAllUsers.mockRejectedValue(new Error("DB Error"));
      await expect(userService.getUsers(10, 0, {})).rejects.toThrow("DB Error");
    });
  });

  describe("registerNewUser", () => {
    it("should register a new user", async () => {
      authUtils.generateVerificationToken.mockReturnValue("token");
      authUtils.hashUsersPassword.mockResolvedValue("hashed_password");
      userRepo.createNewUser.mockResolvedValue({});
      smsUtils.sendAuthTokenSMS.mockResolvedValue({});

      const result = await userService.registerNewUser({
        mobileNumber: "123",
        password: "pass",
        userType: "patient",
      });
      expect(result.statusCode).toBe(201);
    });

    it("should handle repo failure gracefully", async () => {
      authUtils.generateVerificationToken.mockReturnValue("token");
      authUtils.hashUsersPassword.mockResolvedValue("hashed_password");
      userRepo.createNewUser.mockRejectedValue(new Error("DB Error"));

      await expect(
        userService.registerNewUser({
          mobileNumber: "123",
          password: "pass",
          userType: "patient",
        }),
      ).rejects.toThrow("DB Error");
    });
  });

  describe("loginUser", () => {
    it("should login a verified and active user", async () => {
      const user = {
        accountVerified: 1,
        accountActive: 1,
        is2faEnabled: 0,
        userId: 1,
        userType: "patient",
      };
      patientRepo.getPatientByUserId.mockResolvedValue({
        profile_pic_url: "url",
      });
      awsS3.getFileUrlFromS3Bucket.mockResolvedValue("image_url");
      streamUtils.createOrUpdateStreamUser.mockResolvedValue({});
      authUtils.generateUsersJwtAccessToken.mockReturnValue("access_token");
      streamUtils.generateStreamUserToken.mockResolvedValue("stream_token");

      const result = await userService.loginUser(user);
      expect(result.statusCode).toBe(200);
      expect(result.data.token).toBe("access_token");
    });

    it("should return 401 for unverified user", async () => {
      const user = { accountVerified: 0 };
      const result = await userService.loginUser(user);
      expect(result.statusCode).toBe(401);
    });
  });
});
