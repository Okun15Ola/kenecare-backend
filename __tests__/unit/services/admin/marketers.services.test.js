const marketersService = require("../../../../src/services/admin/marketers.services");
const marketersRepo = require("../../../../src/repository/marketers.repository");
const redisClient = require("../../../../src/config/redis.config");
const awsS3 = require("../../../../src/utils/aws-s3.utils");
const fileUpload = require("../../../../src/utils/file-upload.utils");
const authUtils = require("../../../../src/utils/auth.utils");
const smsUtils = require("../../../../src/utils/sms.utils");
const emailUtils = require("../../../../src/utils/email.utils");
// const dbMapper = require("../../../../src/utils/db-mapper.utils");
const caching = require("../../../../src/utils/caching.utils");
// const Response = require("../../../../src/utils/response.utils");

jest.mock("../../../../src/repository/marketers.repository");
jest.mock("../../../../src/config/redis.config");
jest.mock("../../../../src/utils/aws-s3.utils");
jest.mock("../../../../src/utils/file-upload.utils");
jest.mock("../../../../src/utils/auth.utils");
jest.mock("../../../../src/utils/sms.utils");
jest.mock("../../../../src/utils/email.utils");
jest.mock("../../../../src/utils/db-mapper.utils");
jest.mock("../../../../src/utils/caching.utils");

describe("Marketers Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllMarketersService", () => {
    it("should return marketers from cache if available", async () => {
      const cachedData = [{ id: 1, firstName: "John" }];
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));
      caching.cacheKeyBulider.mockReturnValue("cache-key");

      const result = await marketersService.getAllMarketersService(10, 0, {});
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalledWith("cache-key");
    });

    it("should return a 404 if no marketers are found", async () => {
      redisClient.get.mockResolvedValue(null);
      marketersRepo.getAllMarketers.mockResolvedValue(null);

      const result = await marketersService.getAllMarketersService(10, 0, {});
      expect(result.statusCode).toBe(404);
    });
  });

  describe("createMarketerService", () => {
    it("should create a new marketer", async () => {
      const file = { buffer: "buffer", mimetype: "application/pdf" };
      authUtils.generateVerificationToken.mockReturnValue("token");
      authUtils.generateMarketerVerificaitonJwt.mockReturnValue("jwt_token");
      fileUpload.generateFileName.mockReturnValue("file-name");
      awsS3.uploadFileToS3Bucket.mockResolvedValue({});
      marketersRepo.createNewMarketer.mockResolvedValue({});
      smsUtils.sendMarketerVerificationTokenSMS.mockResolvedValue({});
      emailUtils.marketerEmailVerificationToken.mockResolvedValue({});

      const result = await marketersService.createMarketerService({
        firstName: "John",
        lastName: "Doe",
        idDocumentFile: file,
      });
      expect(result.statusCode).toBe(201);
    });

    it("should return a 400 if no ID document is provided", async () => {
      const result = await marketersService.createMarketerService({
        idDocumentFile: null,
      });
      expect(result.statusCode).toBe(400);
    });
  });

  describe("deleteMarketerByIdService", () => {
    it("should delete a marketer", async () => {
      marketersRepo.getMarketerById.mockResolvedValue({
        id_document_uuid: "uuid",
      });
      awsS3.deleteFileFromS3Bucket.mockResolvedValue({});
      marketersRepo.deleteMarketerById.mockResolvedValue({});

      const result = await marketersService.deleteMarketerByIdService(1);
      expect(result.statusCode).toBe(200);
    });

    it("should return a 404 if marketer not found", async () => {
      marketersRepo.getMarketerById.mockResolvedValue(null);

      const result = await marketersService.deleteMarketerByIdService(1);
      expect(result.statusCode).toBe(404);
    });
  });
});
