const specializationsService = require("../../../../src/services/admin/specializations.services");
const specializationsRepo = require("../../../../src/repository/specializations.repository");
const redisClient = require("../../../../src/config/redis.config");
// const dbMapper = require('../../../../src/utils/db-mapper.utils');
const caching = require("../../../../src/utils/caching.utils");
// const Response = require('../../../../src/utils/response.utils');

jest.mock("../../../../src/repository/specializations.repository");
jest.mock("../../../../src/config/redis.config");
jest.mock("../../../../src/utils/db-mapper.utils");
jest.mock("../../../../src/utils/caching.utils");

describe("Specializations Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getSpecializations", () => {
    it("should return specializations from cache if available", async () => {
      const cachedData = [{ id: 1, name: "Cardiology" }];
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));
      caching.cacheKeyBulider.mockReturnValue("cache-key");

      const result = await specializationsService.getSpecializations(10, 0, {});
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalledWith("cache-key");
    });

    it("should return a 404 if no specializations are found", async () => {
      redisClient.get.mockResolvedValue(null);
      specializationsRepo.getAllSpecialization.mockResolvedValue(null);

      const result = await specializationsService.getSpecializations(10, 0, {});
      expect(result.statusCode).toBe(404);
    });
  });

  describe("getSpecializationByName", () => {
    it("should return a specialization by name from cache if available", async () => {
      const cachedData = { id: 1, name: "Cardiology" };
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result =
        await specializationsService.getSpecializationByName("Cardiology");
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalledWith(
        "specializations:Cardiology",
      );
    });

    it("should return a 404 if specialization not found", async () => {
      redisClient.get.mockResolvedValue(null);
      specializationsRepo.getSpecializationByName.mockResolvedValue(null);

      const result =
        await specializationsService.getSpecializationByName("Non-existent");
      expect(result.statusCode).toBe(404);
    });
  });

  describe("createSpecialization", () => {
    it("should create a new specialization", async () => {
      specializationsRepo.getSpecializationByName.mockResolvedValue(null);
      specializationsRepo.createNewSpecialization.mockResolvedValue({});

      const result = await specializationsService.createSpecialization({
        name: "Dermatology",
      });
      expect(result.statusCode).toBe(201);
    });

    it("should return a 400 if specialization already exists", async () => {
      specializationsRepo.getSpecializationByName.mockResolvedValue({
        id: 1,
        name: "Dermatology",
      });

      const result = await specializationsService.createSpecialization({
        name: "Dermatology",
      });
      expect(result.statusCode).toBe(400);
    });
  });

  describe("updateSpecialization", () => {
    it("should update a specialization", async () => {
      specializationsRepo.getSpecializationById.mockResolvedValue({ id: 1 });
      specializationsRepo.updateSpecializationById.mockResolvedValue({});

      const result = await specializationsService.updateSpecialization({
        specializationId: 1,
        specialization: {},
      });
      expect(result.statusCode).toBe(200);
    });

    it("should return a 404 if specialization not found", async () => {
      specializationsRepo.getSpecializationById.mockResolvedValue(null);

      const result = await specializationsService.updateSpecialization({
        specializationId: 1,
      });
      expect(result.statusCode).toBe(404);
    });
  });

  describe("deleteSpecialization", () => {
    it("should delete a specialization", async () => {
      specializationsRepo.getSpecializationById.mockResolvedValue({ id: 1 });
      specializationsRepo.deleteSpecializationById.mockResolvedValue({});

      const result = await specializationsService.deleteSpecialization(1);
      expect(result.statusCode).toBe(200);
    });

    it("should return a 404 if specialization not found", async () => {
      specializationsRepo.getSpecializationById.mockResolvedValue(null);

      const result = await specializationsService.deleteSpecialization(1);
      expect(result.statusCode).toBe(404);
    });
  });
});
