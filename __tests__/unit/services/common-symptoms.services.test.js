const commonSymptomsService = require("../../../src/services/common-symptoms.services");
const commonSymptomsRepo = require("../../../src/repository/common-symptoms.repository");
const { redisClient } = require("../../../src/config/redis.config");
const awsS3 = require("../../../src/utils/aws-s3.utils");
const fileUpload = require("../../../src/utils/file-upload.utils");
const dbMapper = require("../../../src/utils/db-mapper.utils");
const caching = require("../../../src/utils/caching.utils");

jest.mock("../../../src/repository/common-symptoms.repository");
jest.mock("../../../src/config/redis.config");
jest.mock("../../../src/utils/aws-s3.utils");
jest.mock("../../../src/utils/file-upload.utils");
jest.mock("../../../src/utils/db-mapper.utils");
jest.mock("../../../src/utils/caching.utils");

describe("Common Symptoms Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getCommonSymptoms", () => {
    it("should return common symptoms from cache if available", async () => {
      const cachedData = [{ id: 1, name: "Fever" }];
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));
      caching.cacheKeyBulider.mockReturnValue("cache-key");

      const result = await commonSymptomsService.getCommonSymptoms(10, 0, {});
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalledWith("cache-key");
    });

    it("should fetch common symptoms from repo and cache them if not in cache", async () => {
      const rawData = [{ id: 1, name: "Fever" }];
      const mappedData = [{ id: 1, name: "Fever" }];
      redisClient.get.mockResolvedValue(null);
      commonSymptomsRepo.getAllCommonSymptoms.mockResolvedValue(rawData);
      dbMapper.mapCommonSymptomsRow.mockResolvedValue(mappedData);
      caching.cacheKeyBulider.mockReturnValue("cache-key");

      const result = await commonSymptomsService.getCommonSymptoms(10, 0, {});
      expect(result.data).toEqual(mappedData);
      expect(redisClient.set).toHaveBeenCalledWith({
        key: "cache-key",
        value: JSON.stringify(mappedData),
      });
    });

    it("should throw an error if repo fails", async () => {
      redisClient.get.mockResolvedValue(null);
      commonSymptomsRepo.getAllCommonSymptoms.mockRejectedValue(
        new Error("DB Error"),
      );
      await expect(
        commonSymptomsService.getCommonSymptoms(10, 0, {}),
      ).rejects.toThrow("DB Error");
    });
  });

  describe("getCommonSymptom", () => {
    it("should return a common symptom from cache if available", async () => {
      const cachedData = { id: 1, name: "Fever" };
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await commonSymptomsService.getCommonSymptom(1);
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalledWith("common-symptoms:1");
    });

    it("should return a 404 if symptom not found", async () => {
      redisClient.get.mockResolvedValue(null);
      commonSymptomsRepo.getCommonSymptomById.mockResolvedValue(null);

      const result = await commonSymptomsService.getCommonSymptom(1);
      expect(result.statusCode).toBe(404);
    });
  });

  describe("createCommonSymptom", () => {
    it("should create a common symptom and upload file", async () => {
      const file = { buffer: "buffer", mimetype: "image/png" };
      fileUpload.generateFileName.mockReturnValue("file-name");
      awsS3.uploadFileToS3Bucket.mockResolvedValue({});
      commonSymptomsRepo.createNewCommonSymptom.mockResolvedValue({});

      const result = await commonSymptomsService.createCommonSymptom({
        name: "Fever",
        description: "High temperature",
        specialtyId: 1,
        file,
        consultationFee: 100,
        tags: "tag1,tag2",
        inputtedBy: 1,
      });

      expect(result.statusCode).toBe(201);
      expect(awsS3.uploadFileToS3Bucket).toHaveBeenCalled();
      expect(commonSymptomsRepo.createNewCommonSymptom).toHaveBeenCalled();
    });

    it("should return a 400 if no file is provided", async () => {
      const result = await commonSymptomsService.createCommonSymptom({
        name: "Fever",
        description: "High temperature",
        specialtyId: 1,
        file: null,
        consultationFee: 100,
        tags: "tag1,tag2",
        inputtedBy: 1,
      });

      expect(result.statusCode).toBe(400);
    });
  });

  describe("updateCommonSymptom", () => {
    it("should update a common symptom", async () => {
      const file = { buffer: "buffer", mimetype: "image/png" };
      commonSymptomsRepo.getCommonSymptomById.mockResolvedValue({
        id: 1,
        image_url: "old-image.png",
      });
      awsS3.uploadFileToS3Bucket.mockResolvedValue({});
      commonSymptomsRepo.updateCommonSymptomById.mockResolvedValue({});

      const result = await commonSymptomsService.updateCommonSymptom({
        id: 1,
        name: "Fever",
        description: "High temperature",
        specialtyId: 1,
        file,
        consultationFee: 100,
        tags: "tag1,tag2",
      });

      expect(result.statusCode).toBe(304);
      expect(commonSymptomsRepo.updateCommonSymptomById).toHaveBeenCalled();
    });

    it("should return a 404 if symptom not found", async () => {
      commonSymptomsRepo.getCommonSymptomById.mockResolvedValue(null);

      const result = await commonSymptomsService.updateCommonSymptom({ id: 1 });
      expect(result.statusCode).toBe(404);
    });
  });

  describe("deleteCommonSymptom", () => {
    it("should delete a common symptom", async () => {
      commonSymptomsRepo.getCommonSymptomById.mockResolvedValue({ id: 1 });
      commonSymptomsRepo.deleteCommonSymptomById.mockResolvedValue({});

      const result = await commonSymptomsService.deleteCommonSymptom(1);
      expect(result.statusCode).toBe(304);
      expect(commonSymptomsRepo.deleteCommonSymptomById).toHaveBeenCalledWith(
        1,
      );
    });

    it("should return a 404 if symptom not found", async () => {
      commonSymptomsRepo.getCommonSymptomById.mockResolvedValue(null);

      const result = await commonSymptomsService.deleteCommonSymptom(1);
      expect(result.statusCode).toBe(404);
    });
  });
});
