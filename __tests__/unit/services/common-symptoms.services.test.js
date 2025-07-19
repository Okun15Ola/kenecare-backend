const commonSymptomsService = require("../../../src/services/common-symptoms.services");
const repo = require("../../../src/repository/common-symptoms.repository");
const Response = require("../../../src/utils/response.utils");
const { redisClient } = require("../../../src/config/redis.config");
const { uploadFileToS3Bucket } = require("../../../src/utils/aws-s3.utils");
const { generateFileName } = require("../../../src/utils/file-upload.utils");
const { mapCommonSymptomsRow } = require("../../../src/utils/db-mapper.utils");
const { cacheKeyBulider } = require("../../../src/utils/caching.utils");
const logger = require("../../../src/middlewares/logger.middleware");

jest.mock("../../../src/repository/common-symptoms.repository");
jest.mock("../../../src/utils/response.utils");
jest.mock("../../../src/config/redis.config");
jest.mock("../../../src/utils/aws-s3.utils");
jest.mock("../../../src/utils/file-upload.utils");
jest.mock("../../../src/utils/db-mapper.utils");
jest.mock("../../../src/utils/caching.utils");
jest.mock("../../../src/middlewares/logger.middleware");

describe("commonSymptomsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCommonSymptoms", () => {
    it("should return cached data if available", async () => {
      const cacheKey = "key";
      cacheKeyBulider.mockReturnValue(cacheKey);
      redisClient.get.mockResolvedValue(JSON.stringify([{ id: 1 }]));
      Response.SUCCESS.mockReturnValue("success");

      const result = await commonSymptomsService.getCommonSymptoms(10, 0, {});

      expect(redisClient.get).toHaveBeenCalledWith(cacheKey);
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        data: [{ id: 1 }],
        pagination: {},
      });
      expect(result).toBe("success");
    });

    it("should return empty array if no data found", async () => {
      cacheKeyBulider.mockReturnValue("key");
      redisClient.get.mockResolvedValue(null);
      repo.getAllCommonSymptoms.mockResolvedValue([]);
      Response.SUCCESS.mockReturnValue("success");

      const result = await commonSymptomsService.getCommonSymptoms(10, 0, {});

      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "No common symptoms found",
        data: [],
      });
      expect(result).toBe("success");
    });

    it("should fetch, map, cache and return data", async () => {
      cacheKeyBulider.mockReturnValue("key");
      redisClient.get.mockResolvedValue(null);
      repo.getAllCommonSymptoms.mockResolvedValue([{ id: 1 }]);
      mapCommonSymptomsRow.mockResolvedValue({ id: 1, name: "test" });
      redisClient.set.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");

      const result = await commonSymptomsService.getCommonSymptoms(10, 0, {});

      expect(mapCommonSymptomsRow).toHaveBeenCalled();
      expect(redisClient.set).toHaveBeenCalledWith({
        key: "key",
        value: JSON.stringify([{ id: 1, name: "test" }]),
      });
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        data: [{ id: 1, name: "test" }],
        pagination: {},
      });
      expect(result).toBe("success");
    });

    it("should log and throw error", async () => {
      cacheKeyBulider.mockImplementation(() => {
        throw new Error("fail");
      });
      logger.error.mockReturnValue();

      await expect(
        commonSymptomsService.getCommonSymptoms(10, 0, {}),
      ).rejects.toThrow("fail");
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("getCommonSymptom", () => {
    it("should return cached data if available", async () => {
      redisClient.get.mockResolvedValue(JSON.stringify({ id: 1 }));
      Response.SUCCESS.mockReturnValue("success");

      const result = await commonSymptomsService.getCommonSymptom(1);

      expect(Response.SUCCESS).toHaveBeenCalledWith({ data: { id: 1 } });
      expect(result).toBe("success");
    });

    it("should return NOT_FOUND if not found", async () => {
      redisClient.get.mockResolvedValue(null);
      repo.getCommonSymptomById.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");

      const result = await commonSymptomsService.getCommonSymptom(1);

      expect(logger.warn).toHaveBeenCalled();
      expect(Response.NOT_FOUND).toHaveBeenCalledWith({
        message: "Common Symptom Not Found",
      });
      expect(result).toBe("not_found");
    });

    it("should fetch, map, cache and return data", async () => {
      redisClient.get.mockResolvedValue(null);
      repo.getCommonSymptomById.mockResolvedValue({ id: 1 });
      mapCommonSymptomsRow.mockResolvedValue({ id: 1, name: "test" });
      redisClient.set.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");

      const result = await commonSymptomsService.getCommonSymptom(1);

      expect(mapCommonSymptomsRow).toHaveBeenCalledWith({ id: 1 });
      expect(redisClient.set).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        data: { id: 1, name: "test" },
      });
      expect(result).toBe("success");
    });

    it("should log and throw error", async () => {
      redisClient.get.mockImplementation(() => {
        throw new Error("fail");
      });
      logger.error.mockReturnValue();

      await expect(commonSymptomsService.getCommonSymptom(1)).rejects.toThrow(
        "fail",
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("createCommonSymptom", () => {
    it("should return BAD_REQUEST if file is missing", async () => {
      Response.BAD_REQUEST.mockReturnValue("bad_request");

      const result = await commonSymptomsService.createCommonSymptom({});

      expect(logger.warn).toHaveBeenCalled();
      expect(Response.BAD_REQUEST).toHaveBeenCalledWith({
        message: "Please upload symptom image",
      });
      expect(result).toBe("bad_request");
    });

    it("should handle file upload failure", async () => {
      generateFileName.mockReturnValue("file.jpg");
      repo.createNewCommonSymptom.mockResolvedValue({});
      Response.INTERNAL_SERVER_ERROR.mockReturnValue("upload_error");

      const file = { buffer: Buffer.from(""), mimetype: "image/jpeg" };
      Promise.allSettled = jest.fn().mockResolvedValue([
        { status: "rejected", reason: new Error("upload fail") },
        { status: "fulfilled", value: {} },
      ]);

      const result = await commonSymptomsService.createCommonSymptom({ file });

      expect(logger.error).toHaveBeenCalledWith(
        "File upload failed: ",
        expect.any(Error),
      );
      expect(Response.INTERNAL_SERVER_ERROR).toHaveBeenCalledWith({
        message: "File upload failed. Please try again.",
      });
      expect(result).toBe("upload_error");
    });

    it("should handle symptom creation failure", async () => {
      generateFileName.mockReturnValue("file.jpg");
      uploadFileToS3Bucket.mockResolvedValue({});
      Response.INTERNAL_SERVER_ERROR.mockReturnValue("create_error");

      const file = { buffer: Buffer.from(""), mimetype: "image/jpeg" };
      Promise.allSettled = jest.fn().mockResolvedValue([
        { status: "fulfilled", value: {} },
        { status: "rejected", reason: new Error("create fail") },
      ]);

      const result = await commonSymptomsService.createCommonSymptom({ file });

      expect(logger.error).toHaveBeenCalledWith(
        "Common Symptom creation failed: ",
        expect.any(Error),
      );
      expect(Response.INTERNAL_SERVER_ERROR).toHaveBeenCalledWith({
        message: "Common symptom creation failed. Please try again.",
      });
      expect(result).toBe("create_error");
    });

    it("should clear cache and return CREATED on success", async () => {
      generateFileName.mockReturnValue("file.jpg");
      Promise.allSettled = jest.fn().mockResolvedValue([
        { status: "fulfilled", value: {} },
        { status: "fulfilled", value: {} },
      ]);
      cacheKeyBulider.mockReturnValue("pattern");
      redisClient.clearCacheByPattern.mockResolvedValue();
      Response.CREATED.mockReturnValue("created");

      const file = { buffer: Buffer.from(""), mimetype: "image/jpeg" };
      const result = await commonSymptomsService.createCommonSymptom({ file });

      expect(redisClient.clearCacheByPattern).toHaveBeenCalledWith("pattern");
      expect(Response.CREATED).toHaveBeenCalledWith({
        message: "Common symptom created successfully",
      });
      expect(result).toBe("created");
    });

    it("should log and throw error", async () => {
      generateFileName.mockImplementation(() => {
        throw new Error("fail");
      });
      logger.error.mockReturnValue();

      await expect(
        commonSymptomsService.createCommonSymptom({ file: {} }),
      ).rejects.toThrow("fail");
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("updateCommonSymptom", () => {
    it("should return NOT_FOUND if symptom not found", async () => {
      repo.getCommonSymptomById.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");

      const result = await commonSymptomsService.updateCommonSymptom({ id: 1 });

      expect(logger.warn).toHaveBeenCalled();
      expect(Response.NOT_FOUND).toHaveBeenCalledWith({
        message: "Common Symptom not found",
      });
      expect(result).toBe("not_found");
    });

    it("should upload file if provided and update symptom", async () => {
      repo.getCommonSymptomById.mockResolvedValue({ image_url: null });
      generateFileName.mockReturnValue("file.jpg");
      uploadFileToS3Bucket.mockResolvedValue();
      repo.updateCommonSymptomById.mockResolvedValue({ affectedRows: 1 });
      redisClient.delete.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");

      const file = { buffer: Buffer.from(""), mimetype: "image/jpeg" };
      const result = await commonSymptomsService.updateCommonSymptom({
        id: 1,
        file,
      });

      expect(uploadFileToS3Bucket).toHaveBeenCalled();
      expect(repo.updateCommonSymptomById).toHaveBeenCalled();
      expect(redisClient.delete).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "Common Symptom Updated Succcessfully",
      });
      expect(result).toBe("success");
    });

    it("should return NOT_MODIFIED if update fails", async () => {
      repo.getCommonSymptomById.mockResolvedValue({ image_url: "img.jpg" });
      repo.updateCommonSymptomById.mockResolvedValue({ affectedRows: 0 });
      Response.NOT_MODIFIED.mockReturnValue("not_modified");

      const result = await commonSymptomsService.updateCommonSymptom({ id: 1 });

      expect(logger.warn).toHaveBeenCalled();
      expect(Response.NOT_MODIFIED).toHaveBeenCalledWith({});
      expect(result).toBe("not_modified");
    });

    it("should log and throw error", async () => {
      repo.getCommonSymptomById.mockImplementation(() => {
        throw new Error("fail");
      });
      logger.error.mockReturnValue();

      await expect(
        commonSymptomsService.updateCommonSymptom({ id: 1 }),
      ).rejects.toThrow("fail");
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("updateCommonSymptomStatus", () => {
    it("should return NOT_FOUND if symptom not found", async () => {
      repo.getCommonSymptomById.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");

      const result = await commonSymptomsService.updateCommonSymptomStatus({
        id: 1,
        status: "active",
      });

      expect(logger.warn).toHaveBeenCalled();
      expect(Response.NOT_FOUND).toHaveBeenCalledWith({
        message: "Common Symptom not found",
      });
      expect(result).toBe("not_found");
    });

    it("should return SUCCESS if found", async () => {
      repo.getCommonSymptomById.mockResolvedValue({ id: 1 });
      Response.SUCCESS.mockReturnValue("success");

      const result = await commonSymptomsService.updateCommonSymptomStatus({
        id: 1,
        status: "active",
      });

      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "Common Symptom Status Updated Successfully",
      });
      expect(result).toBe("success");
    });

    it("should log and throw error", async () => {
      repo.getCommonSymptomById.mockImplementation(() => {
        throw new Error("fail");
      });
      logger.error.mockReturnValue();

      await expect(
        commonSymptomsService.updateCommonSymptomStatus({
          id: 1,
          status: "active",
        }),
      ).rejects.toThrow("fail");
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("deleteCommonSymptom", () => {
    it("should return NOT_FOUND if symptom not found", async () => {
      repo.getCommonSymptomById.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");

      const result = await commonSymptomsService.deleteCommonSymptom(1);

      expect(logger.warn).toHaveBeenCalled();
      expect(Response.NOT_FOUND).toHaveBeenCalledWith({
        message: "Common Symptom not found",
      });
      expect(result).toBe("not_found");
    });

    it("should return NOT_MODIFIED if delete fails", async () => {
      repo.getCommonSymptomById.mockResolvedValue({ id: 1 });
      repo.deleteCommonSymptomById.mockResolvedValue({ affectedRows: 0 });
      Response.NOT_MODIFIED.mockReturnValue("not_modified");

      const result = await commonSymptomsService.deleteCommonSymptom(1);

      expect(logger.warn).toHaveBeenCalled();
      expect(Response.NOT_MODIFIED).toHaveBeenCalledWith({});
      expect(result).toBe("not_modified");
    });

    it("should delete cache and return SUCCESS", async () => {
      repo.getCommonSymptomById.mockResolvedValue({ id: 1 });
      repo.deleteCommonSymptomById.mockResolvedValue({ affectedRows: 1 });
      redisClient.delete.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");

      const result = await commonSymptomsService.deleteCommonSymptom(1);

      expect(redisClient.delete).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "Common Symptom Deleted Successfully",
      });
      expect(result).toBe("success");
    });

    it("should log and throw error", async () => {
      repo.getCommonSymptomById.mockImplementation(() => {
        throw new Error("fail");
      });
      logger.error.mockReturnValue();

      await expect(
        commonSymptomsService.deleteCommonSymptom(1),
      ).rejects.toThrow("fail");
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
