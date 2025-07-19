const medicalCouncilService = require("../../../src/services/medical-councils.services");
const medicalCouncilRepo = require("../../../src/repository/medical-councils.repository");
const { redisClient } = require("../../../src/config/redis.config");
const dbMapper = require("../../../src/utils/db-mapper.utils");
const caching = require("../../../src/utils/caching.utils");
const Response = require("../../../src/utils/response.utils");

jest.mock("../../../src/repository/medical-councils.repository");
jest.mock("../../../src/config/redis.config");
jest.mock("../../../src/utils/db-mapper.utils");
jest.mock("../../../src/utils/caching.utils");

describe("Medical Councils Service", () => {
  beforeAll(() => {
    jest.spyOn(Response, "SUCCESS").mockImplementation((data) => data);
    jest.spyOn(Response, "NOT_FOUND").mockImplementation((data) => data);
    jest.spyOn(Response, "BAD_REQUEST").mockImplementation((data) => data);
    jest
      .spyOn(Response, "INTERNAL_SERVER_ERROR")
      .mockImplementation((data) => data);
    jest.spyOn(Response, "CREATED").mockImplementation((data) => data);
    jest.spyOn(Response, "NOT_MODIFIED").mockImplementation((data) => data);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getMedicalCouncils", () => {
    it("should return medical councils from cache if available", async () => {
      const cachedData = [{ id: 1, name: "Medical Council of India" }];
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));
      caching.cacheKeyBulider.mockReturnValue("cache-key");

      const result = await medicalCouncilService.getMedicalCouncils(10, 0, {});
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalledWith("cache-key");
    });

    it("should fetch medical councils from repo and cache them if not in cache", async () => {
      const rawData = [{ id: 1, name: "Medical Council of India" }];
      const mappedData = [{ id: 1, name: "Medical Council of India" }];
      redisClient.get.mockResolvedValue(null);
      medicalCouncilRepo.getAllMedicalCouncils.mockResolvedValue(rawData);
      dbMapper.mapMedicalCouncilRow.mockImplementation((council) => council);
      caching.cacheKeyBulider.mockReturnValue("cache-key");

      const result = await medicalCouncilService.getMedicalCouncils(10, 0, {});
      expect(result.data).toEqual(mappedData);
      expect(redisClient.set).toHaveBeenCalledWith({
        key: "cache-key",
        value: JSON.stringify(mappedData),
      });
    });

    it("should return a 200 if no councils are found", async () => {
      redisClient.get.mockResolvedValue(null);
      medicalCouncilRepo.getAllMedicalCouncils.mockResolvedValue(null);

      const result = await medicalCouncilService.getMedicalCouncils(10, 0, {});
      expect(result.statusCode).toBe(200);
    });
  });

  describe("getMedicalCouncilByEmail", () => {
    it("should return a medical council by email from cache if available", async () => {
      const cachedData = { id: 1, email: "test@test.com" };
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result =
        await medicalCouncilService.getMedicalCouncilByEmail("test@test.com");
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalledWith(
        "medical-council:test@test.com",
      );
    });

    it("should return a 404 if council not found by email", async () => {
      redisClient.get.mockResolvedValue(null);
      medicalCouncilRepo.getMedicalCouncilById.mockResolvedValue(null);

      const result = await medicalCouncilService.getMedicalCouncilByEmail(
        "nonexistent@test.com",
      );
      expect(result.statusCode).toBe(404);
    });
  });

  describe("createMedicalCouncil", () => {
    it("should create a new medical council", async () => {
      medicalCouncilRepo.createNewMedicalCouncil.mockResolvedValue({});

      const result = await medicalCouncilService.createMedicalCouncil({
        name: "New Council",
        email: "new@test.com",
        mobileNumber: "1234567890",
        address: "123 Street",
        inputtedBy: 1,
      });

      expect(result.statusCode).toBe(400);
    });

    it("should throw an error if repo fails", async () => {
      medicalCouncilRepo.createNewMedicalCouncil.mockRejectedValue(
        new Error("DB Error"),
      );
      await expect(
        medicalCouncilService.createMedicalCouncil({}),
      ).rejects.toThrow("DB Error");
    });
  });

  describe("updateMedicalCouncil", () => {
    it("should update a medical council", async () => {
      medicalCouncilRepo.getMedicalCouncilById.mockResolvedValue({ id: 1 });
      medicalCouncilRepo.updateMedicalCouncilById.mockResolvedValue({});

      const result = await medicalCouncilService.updateMedicalCouncil({
        id: 1,
        name: "Updated Council",
      });
      expect(result.statusCode).toBe(304);
    });

    it("should return a 404 if council not found", async () => {
      medicalCouncilRepo.getMedicalCouncilById.mockResolvedValue(null);

      const result = await medicalCouncilService.updateMedicalCouncil({
        id: 1,
      });
      expect(result.statusCode).toBe(404);
    });
  });

  describe("deleteMedicalCouncil", () => {
    it("should delete a medical council", async () => {
      medicalCouncilRepo.getMedicalCouncilById.mockResolvedValue({ id: 1 });
      medicalCouncilRepo.deleteMedicalCouncilById.mockResolvedValue({});

      const result = await medicalCouncilService.deleteMedicalCouncil(1);
      expect(result.statusCode).toBe(304);
    });

    it("should return a 404 if council not found", async () => {
      medicalCouncilRepo.getMedicalCouncilById.mockResolvedValue(null);

      const result = await medicalCouncilService.deleteMedicalCouncil(1);
      expect(result.statusCode).toBe(404);
    });
  });
});
