const specialtyService = require("../../../src/services/specialties.services");
const specialtyRepo = require("../../../src/repository/specialities.repository");
const { redisClient } = require("../../../src/config/redis.config");
const fileUpload = require("../../../src/utils/file-upload.utils");
const dbMapper = require("../../../src/utils/db-mapper.utils");
const caching = require("../../../src/utils/caching.utils");

jest.mock("../../../src/repository/specialities.repository");
jest.mock("../../../src/config/redis.config");
jest.mock("../../../src/utils/file-upload.utils");
jest.mock("../../../src/utils/db-mapper.utils");
jest.mock("../../../src/utils/caching.utils");

describe("Specialties Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getSpecialties", () => {
    it("should return specialties from cache", async () => {
      const cachedData = [{ id: 1, name: "Cardiology" }];
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));
      caching.cacheKeyBulider.mockReturnValue("specialties:cache-key");

      const result = await specialtyService.getSpecialties(10, 0, {});
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalledWith("specialties:cache-key");
    });

    it("should return specialties from DB and set cache", async () => {
      redisClient.get.mockResolvedValue(null);
      const rawData = [{ id: 1 }];
      const mapped = [{ id: 1 }];
      caching.cacheKeyBulider.mockReturnValue("specialties:cache-key");

      specialtyRepo.getAllSpecialties.mockResolvedValue(rawData);
      dbMapper.mapSpecialityRow.mockImplementation((row) => row);
      redisClient.set.mockResolvedValue();

      const result = await specialtyService.getSpecialties(10, 0, {});
      expect(result.data).toEqual(mapped);
      expect(redisClient.set).toHaveBeenCalled();
    });

    it("should throw an error if DB fails", async () => {
      redisClient.get.mockResolvedValue(null);
      specialtyRepo.getAllSpecialties.mockRejectedValue(new Error("DB Error"));

      await expect(specialtyService.getSpecialties(10, 0, {})).rejects.toThrow(
        "DB Error",
      );
    });
  });

  describe("getSpecialtyByName", () => {
    it("should return a specialty from cache", async () => {
      const cachedData = { id: 1, name: "Cardiology" };
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await specialtyService.getSpecialtyByName("Cardiology");
      expect(result.data).toEqual(cachedData);
    });

    it("should return a 404 if not found in DB", async () => {
      redisClient.get.mockResolvedValue(null);
      specialtyRepo.getSpecialtyByName.mockResolvedValue(null);

      const result = await specialtyService.getSpecialtyByName("Unknown");
      expect(result.statusCode).toBe(404);
    });

    it("should return from DB and set cache", async () => {
      redisClient.get.mockResolvedValue(null);
      const dbData = { id: 1, name: "Cardiology" };
      const mapped = { id: 1, name: "Cardiology" };

      specialtyRepo.getSpecialtyByName.mockResolvedValue(dbData);
      dbMapper.mapSpecialityRow.mockReturnValue(mapped);
      redisClient.set.mockResolvedValue();

      const result = await specialtyService.getSpecialtyByName("Cardiology");
      expect(result.data).toEqual(mapped);
    });
  });

  describe("getSpecialtyById", () => {
    it("should return from cache", async () => {
      const cached = { id: 1, name: "Neuro" };
      redisClient.get.mockResolvedValue(JSON.stringify(cached));

      const result = await specialtyService.getSpecialtyById(1);
      expect(result.data).toEqual(cached);
    });

    it("should return from DB and set cache", async () => {
      redisClient.get.mockResolvedValue(null);
      const dbData = { id: 1 };
      const mapped = { id: 1 };

      specialtyRepo.getSpecialtiyById.mockResolvedValue(dbData);
      dbMapper.mapSpecialityRow.mockReturnValue(mapped);
      redisClient.set.mockResolvedValue();

      const result = await specialtyService.getSpecialtyById(1);
      expect(result.data).toEqual(mapped);
    });

    it("should return 404 if not found", async () => {
      redisClient.get.mockResolvedValue(null);
      specialtyRepo.getSpecialtiyById.mockResolvedValue(null);

      const result = await specialtyService.getSpecialtyById(1);
      expect(result.statusCode).toBe(404);
    });
  });

  describe("createSpecialty", () => {
    it("should create a new specialty", async () => {
      specialtyRepo.createNewSpecialty.mockResolvedValue({ insertId: 1 });

      const result = await specialtyService.createSpecialty({
        name: "Dermatology",
        description: "",
        inputtedBy: 1,
        image: "img.png",
      });

      expect(result.statusCode).toBe(201);
    });

    it("should throw if repo fails", async () => {
      specialtyRepo.createNewSpecialty.mockRejectedValue(new Error("DB Error"));
      await expect(specialtyService.createSpecialty({})).rejects.toThrow(
        "DB Error",
      );
    });
  });

  describe("updateSpecialty", () => {
    it("should update and delete old image", async () => {
      specialtyRepo.getSpecialtiyById.mockResolvedValue({
        image_url: "old.png",
      });
      fileUpload.deleteFile.mockResolvedValue();
      specialtyRepo.updateSpecialtiyById.mockResolvedValue({ affectedRows: 1 });

      const result = await specialtyService.updateSpecialty({
        id: 1,
        name: "Updated",
      });
      expect(fileUpload.deleteFile).toHaveBeenCalled();
      expect(result.statusCode).toBe(200);
    });

    it("should return 404 error object if not found", async () => {
      specialtyRepo.getSpecialtiyById.mockResolvedValue(null);
      const result = await specialtyService.updateSpecialty({ id: 1 });
      expect(result).toMatchObject({
        statusCode: 404,
        message: "Specialty Not Found",
        status: "error",
      });
    });
  });

  describe("updateSpecialtyStatus", () => {
    it("should return 400 for invalid status", async () => {
      const result = await specialtyService.updateSpecialtyStatus({
        id: 1,
        status: 3,
      });
      expect(result.statusCode).toBe(400);
    });

    it("should update status when valid", async () => {
      specialtyRepo.updateSpecialtiyStatusById.mockResolvedValue({
        affectedRows: 1,
      });

      const result = await specialtyService.updateSpecialtyStatus({
        id: 1,
        status: 1,
      });
      expect(result.statusCode).toBe(200);
    });
  });

  describe("deleteSpecialty", () => {
    it("should delete image and call repo", async () => {
      specialtyRepo.getSpecialtiyById.mockResolvedValue({
        image_url: "img.png",
      });
      // eslint-disable-next-line global-require
      jest.spyOn(require("fs"), "unlinkSync").mockReturnValue(undefined);
      specialtyRepo.deleteSpecialtieById.mockResolvedValue({ affectedRows: 1 });

      const result = await specialtyService.deleteSpecialty(1);
      expect(result.statusCode).toBe(200);
      // eslint-disable-next-line global-require
      expect(require("fs").unlinkSync).toHaveBeenCalled();
    });

    it("should throw if repo fails", async () => {
      specialtyRepo.getSpecialtiyById.mockRejectedValue(new Error("DB Error"));
      await expect(specialtyService.deleteSpecialty(1)).rejects.toThrow(
        "DB Error",
      );
    });
  });
});
