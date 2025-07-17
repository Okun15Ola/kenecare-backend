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
    it("should return cached data if present", async () => {
      const fakeCacheKey = "cache-key";
      const fakeData = [{ id: 1 }];
      cacheKeyBulider.mockReturnValue(fakeCacheKey);
      redisClient.get.mockResolvedValue(JSON.stringify(fakeData));
      Response.SUCCESS.mockReturnValue("success");

      const result = await commonSymptomsService.getCommonSymptoms(10, 0, {});

      expect(redisClient.get).toHaveBeenCalledWith(fakeCacheKey);
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        data: fakeData,
        pagination: {},
      });
      expect(result).toBe("success");
    });

    it("should return NOT_FOUND if no data in db", async () => {
      cacheKeyBulider.mockReturnValue("cache-key");
      redisClient.get.mockResolvedValue(null);
      repo.getAllCommonSymptoms.mockResolvedValue([]);
      Response.NOT_FOUND.mockReturnValue("not_found");

      const result = await commonSymptomsService.getCommonSymptoms(10, 0, {});

      expect(logger.warn).toHaveBeenCalledWith("Common Symptoms Not Found");
      expect(Response.NOT_FOUND).toHaveBeenCalledWith({
        message: "Common Symptom Not Found",
      });
      expect(result).toBe("not_found");
    });

    it("should fetch, map, cache and return data", async () => {
      const rawData = [{ id: 1 }];
      const mappedData = [{ id: 1, mapped: true }];
      cacheKeyBulider.mockReturnValue("cache-key");
      redisClient.get.mockResolvedValue(null);
      repo.getAllCommonSymptoms.mockResolvedValue(rawData);
      mapCommonSymptomsRow.mockResolvedValue(mappedData[0]);
      redisClient.set.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");

      const result = await commonSymptomsService.getCommonSymptoms(10, 0, {});

      expect(repo.getAllCommonSymptoms).toHaveBeenCalled();
      expect(mapCommonSymptomsRow).toHaveBeenCalledWith(rawData[0]);
      expect(redisClient.set).toHaveBeenCalledWith({
        key: "cache-key",
        value: JSON.stringify(mappedData),
      });
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        data: mappedData,
        pagination: {},
      });
      expect(result).toBe("success");
    });

    it("should log and throw on error", async () => {
      const error = new Error("fail");
      cacheKeyBulider.mockImplementation(() => {
        throw error;
      });
      await expect(
        commonSymptomsService.getCommonSymptoms(10, 0, {}),
      ).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("getCommonSymptom", () => {
    it("should return cached data if present", async () => {
      redisClient.get.mockResolvedValue(JSON.stringify({ id: 1 }));
      Response.SUCCESS.mockReturnValue("success");
      const result = await commonSymptomsService.getCommonSymptom(1);
      expect(redisClient.get).toHaveBeenCalledWith("common-symptoms:1");
      expect(Response.SUCCESS).toHaveBeenCalledWith({ data: { id: 1 } });
      expect(result).toBe("success");
    });

    it("should return NOT_FOUND if not in db", async () => {
      redisClient.get.mockResolvedValue(null);
      repo.getCommonSymptomById.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result = await commonSymptomsService.getCommonSymptom(1);
      expect(logger.warn).toHaveBeenCalledWith(
        "Common Symptom Not Found for ID 1",
      );
      expect(Response.NOT_FOUND).toHaveBeenCalledWith({
        message: "Common Symptom Not Found",
      });
      expect(result).toBe("not_found");
    });

    it("should fetch, map, cache and return data", async () => {
      const rawData = { id: 1 };
      const mapped = { id: 1, mapped: true };
      redisClient.get.mockResolvedValue(null);
      repo.getCommonSymptomById.mockResolvedValue(rawData);
      mapCommonSymptomsRow.mockResolvedValue(mapped);
      redisClient.set.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");
      const result = await commonSymptomsService.getCommonSymptom(1);
      expect(mapCommonSymptomsRow).toHaveBeenCalledWith(rawData);
      expect(redisClient.set).toHaveBeenCalledWith({
        key: "common-symptoms:1",
        value: JSON.stringify(mapped),
      });
      expect(Response.SUCCESS).toHaveBeenCalledWith({ data: mapped });
      expect(result).toBe("success");
    });

    it("should log and throw on error", async () => {
      const error = new Error("fail");
      redisClient.get.mockRejectedValue(error);
      await expect(commonSymptomsService.getCommonSymptom(1)).rejects.toThrow(
        error,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("createCommonSymptom", () => {
    it("should return BAD_REQUEST if file is missing", async () => {
      Response.BAD_REQUEST.mockReturnValue("bad_request");
      const result = await commonSymptomsService.createCommonSymptom({
        file: null,
      });
      expect(logger.warn).toHaveBeenCalledWith("Symptom image is required");
      expect(Response.BAD_REQUEST).toHaveBeenCalledWith({
        message: "Please upload symptom image",
      });
      expect(result).toBe("bad_request");
    });

    it("should handle file upload failure", async () => {
      generateFileName.mockReturnValue("file.png");
      uploadFileToS3Bucket.mockRejectedValue(new Error("upload fail"));
      repo.createNewCommonSymptom.mockResolvedValue({});
      Response.INTERNAL_SERVER_ERROR.mockReturnValue("upload_error");
      Promise.allSettled = jest.fn().mockResolvedValue([
        { status: "rejected", reason: new Error("upload fail") },
        { status: "fulfilled", value: {} },
      ]);
      const result = await commonSymptomsService.createCommonSymptom({
        name: "n",
        description: "d",
        specialtyId: 1,
        file: { buffer: Buffer.from(""), mimetype: "image/png" },
        consultationFee: 10,
        tags: [],
        inputtedBy: 1,
      });
      expect(logger.error).toHaveBeenCalledWith(
        "File upload failed: ",
        expect.any(Error),
      );
      expect(Response.INTERNAL_SERVER_ERROR).toHaveBeenCalledWith({
        message: "File upload failed. Please try again.",
      });
      expect(result).toBe("upload_error");
    });

    it("should handle db creation failure", async () => {
      generateFileName.mockReturnValue("file.png");
      uploadFileToS3Bucket.mockResolvedValue({});
      repo.createNewCommonSymptom.mockRejectedValue(new Error("db fail"));
      Response.INTERNAL_SERVER_ERROR.mockReturnValue("db_error");
      Promise.allSettled = jest.fn().mockResolvedValue([
        { status: "fulfilled", value: {} },
        { status: "rejected", reason: new Error("db fail") },
      ]);
      const result = await commonSymptomsService.createCommonSymptom({
        name: "n",
        description: "d",
        specialtyId: 1,
        file: { buffer: Buffer.from(""), mimetype: "image/png" },
        consultationFee: 10,
        tags: [],
        inputtedBy: 1,
      });
      expect(logger.error).toHaveBeenCalledWith(
        "Common Symptom creation failed: ",
        expect.any(Error),
      );
      expect(Response.INTERNAL_SERVER_ERROR).toHaveBeenCalledWith({
        message: "Common Symptom creation failed. Please try again.",
      });
      expect(result).toBe("db_error");
    });

    it("should clear cache and return CREATED on success", async () => {
      generateFileName.mockReturnValue("file.png");
      Promise.allSettled = jest.fn().mockResolvedValue([
        { status: "fulfilled", value: {} },
        { status: "fulfilled", value: {} },
      ]);
      cacheKeyBulider.mockReturnValue("common-symptoms:*");
      redisClient.clearCacheByPattern.mockResolvedValue();
      Response.CREATED.mockReturnValue("created");
      const result = await commonSymptomsService.createCommonSymptom({
        name: "n",
        description: "d",
        specialtyId: 1,
        file: { buffer: Buffer.from(""), mimetype: "image/png" },
        consultationFee: 10,
        tags: [],
        inputtedBy: 1,
      });
      expect(redisClient.clearCacheByPattern).toHaveBeenCalledWith(
        "common-symptoms:*",
      );
      expect(Response.CREATED).toHaveBeenCalledWith({
        message: "Common Symptom Created Successfully",
      });
      expect(result).toBe("created");
    });

    it("should log and throw on error", async () => {
      const error = new Error("fail");
      generateFileName.mockImplementation(() => {
        throw error;
      });
      await expect(
        commonSymptomsService.createCommonSymptom({
          file: { buffer: Buffer.from(""), mimetype: "image/png" },
        }),
      ).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("updateCommonSymptom", () => {
    it("should return NOT_FOUND if symptom does not exist", async () => {
      repo.getCommonSymptomById.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result = await commonSymptomsService.updateCommonSymptom({ id: 1 });
      expect(logger.warn).toHaveBeenCalledWith(
        "Common Symptom Not Found for ID 1",
      );
      expect(Response.NOT_FOUND).toHaveBeenCalledWith({
        message: "Common Symptom not found",
      });
      expect(result).toBe("not_found");
    });

    it("should upload file if provided and update db", async () => {
      repo.getCommonSymptomById.mockResolvedValue({ image_url: null });
      generateFileName.mockReturnValue("file.png");
      uploadFileToS3Bucket.mockResolvedValue();
      repo.updateCommonSymptomById.mockResolvedValue({ affectedRows: 1 });
      redisClient.delete.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");
      const result = await commonSymptomsService.updateCommonSymptom({
        id: 1,
        name: "n",
        description: "d",
        specialtyId: 1,
        file: { buffer: Buffer.from(""), mimetype: "image/png" },
        consultationFee: 10,
        tags: [],
      });
      expect(uploadFileToS3Bucket).toHaveBeenCalled();
      expect(repo.updateCommonSymptomById).toHaveBeenCalled();
      expect(redisClient.delete).toHaveBeenCalledWith("common-symptoms:1");
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "Common Symptom Updated Succcessfully",
      });
      expect(result).toBe("success");
    });

    it("should not upload file if not provided", async () => {
      repo.getCommonSymptomById.mockResolvedValue({
        image_url: "existing.png",
      });
      repo.updateCommonSymptomById.mockResolvedValue({ affectedRows: 1 });
      redisClient.delete.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");
      const result = await commonSymptomsService.updateCommonSymptom({
        id: 1,
        name: "n",
        description: "d",
        specialtyId: 1,
        file: null,
        consultationFee: 10,
        tags: [],
      });
      expect(uploadFileToS3Bucket).not.toHaveBeenCalled();
      expect(repo.updateCommonSymptomById).toHaveBeenCalled();
      expect(redisClient.delete).toHaveBeenCalledWith("common-symptoms:1");
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "Common Symptom Updated Succcessfully",
      });
      expect(result).toBe("success");
    });

    it("should return NOT_MODIFIED if update fails", async () => {
      repo.getCommonSymptomById.mockResolvedValue({ image_url: null });
      generateFileName.mockReturnValue("file.png");
      uploadFileToS3Bucket.mockResolvedValue();
      repo.updateCommonSymptomById.mockResolvedValue({ affectedRows: 0 });
      Response.NOT_MODIFIED.mockReturnValue("not_modified");
      const result = await commonSymptomsService.updateCommonSymptom({
        id: 1,
        name: "n",
        description: "d",
        specialtyId: 1,
        file: { buffer: Buffer.from(""), mimetype: "image/png" },
        consultationFee: 10,
        tags: [],
      });
      expect(logger.warn).toHaveBeenCalledWith(
        "Failed to update Common Symptom for ID 1",
      );
      expect(Response.NOT_MODIFIED).toHaveBeenCalledWith({});
      expect(result).toBe("not_modified");
    });

    it("should log and throw on error", async () => {
      const error = new Error("fail");
      repo.getCommonSymptomById.mockRejectedValue(error);
      await expect(
        commonSymptomsService.updateCommonSymptom({ id: 1 }),
      ).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("updateCommonSymptomStatus", () => {
    it("should return NOT_FOUND if symptom does not exist", async () => {
      repo.getCommonSymptomById.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result = await commonSymptomsService.updateCommonSymptomStatus({
        id: 1,
        status: "active",
      });
      expect(logger.warn).toHaveBeenCalledWith(
        "Common Symptom Not Found for ID 1",
      );
      expect(Response.NOT_FOUND).toHaveBeenCalledWith({
        message: "Common Symptom not found",
      });
      expect(result).toBe("not_found");
    });

    it("should return SUCCESS if symptom exists", async () => {
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

    it("should log and throw on error", async () => {
      const error = new Error("fail");
      repo.getCommonSymptomById.mockRejectedValue(error);
      await expect(
        commonSymptomsService.updateCommonSymptomStatus({
          id: 1,
          status: "active",
        }),
      ).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("deleteCommonSymptom", () => {
    it("should return NOT_FOUND if symptom does not exist", async () => {
      repo.getCommonSymptomById.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result = await commonSymptomsService.deleteCommonSymptom(1);
      expect(logger.warn).toHaveBeenCalledWith(
        "Common Symptom Not Found for ID 1",
      );
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
      expect(logger.warn).toHaveBeenCalledWith(
        "Failed to delete Common Symptom for ID 1",
      );
      expect(Response.NOT_MODIFIED).toHaveBeenCalledWith({});
      expect(result).toBe("not_modified");
    });

    it("should delete cache and return SUCCESS on success", async () => {
      repo.getCommonSymptomById.mockResolvedValue({ id: 1 });
      repo.deleteCommonSymptomById.mockResolvedValue({ affectedRows: 1 });
      redisClient.delete.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");
      const result = await commonSymptomsService.deleteCommonSymptom(1);
      expect(redisClient.delete).toHaveBeenCalledWith("common-symptoms:1");
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "Common Symptom Deleted Successfully",
      });
      expect(result).toBe("success");
    });

    it("should log and throw on error", async () => {
      const error = new Error("fail");
      repo.getCommonSymptomById.mockRejectedValue(error);
      await expect(
        commonSymptomsService.deleteCommonSymptom(1),
      ).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
