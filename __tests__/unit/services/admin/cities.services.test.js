/* eslint-disable no-unused-vars */
const citiesService = require("../../../../src/services/admin/cities.services");
const citiesRepo = require("../../../../src/repository/cities.repository");

jest.mock("../../../../src/repository/cities.repository");
jest.mock("../../../../src/config/redis.config");
jest.mock("../../../../src/utils/db-mapper.utils");
jest.mock("../../../../src/utils/caching.utils");

describe("Cities Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getCities", () => {
    it("should return a 200 if no cities are found", async () => {
      citiesRepo.countCity.mockResolvedValue({ totalRows: 0 });

      citiesRepo.getAllCities.mockResolvedValue([[]]);

      const result = await citiesService.getCities(10, 1, {});
      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual([]);
    });
  });

  describe("getCity", () => {
    it("should return a 404 if city not found", async () => {
      citiesRepo.getCityById.mockResolvedValue([null]);

      const result = await citiesService.getCity(1);
      expect(result.statusCode).toBe(404);
    });
  });

  describe("createCity", () => {
    it("should create a new city", async () => {
      citiesRepo.createNewCity.mockResolvedValue({ insertId: 1 });

      const result = await citiesService.createCity({ name: "Abuja" });
      expect(result.statusCode).toBe(201);
    });

    it("should throw an error if repo fails", async () => {
      citiesRepo.createNewCity.mockRejectedValue(new Error("DB Error"));
      await expect(citiesService.createCity({})).rejects.toThrow("DB Error");
    });
  });

  describe("updateCity", () => {
    it("should update a city", async () => {
      citiesRepo.getCityById.mockResolvedValue([{}]);
      citiesRepo.updateCityById.mockResolvedValue({ affectedRows: 1 });

      const result = await citiesService.updateCity({ id: 1 });
      expect(result.statusCode).toBe(200);
    });

    it("should return a 404 if city not found", async () => {
      citiesRepo.getCityById.mockResolvedValue(null);

      const result = await citiesService.updateCity({ id: 1 });
      expect(result.statusCode).toBe(404);
    });
  });

  describe("deleteCity", () => {
    it("should delete a city", async () => {
      citiesRepo.getCityById.mockResolvedValue([{}]);
      citiesRepo.deleteCityById.mockResolvedValue({ affectedRows: 1 });

      const result = await citiesService.deleteCity(1);
      expect(result.statusCode).toBe(200);
    });

    it("should return a 404 if city not found", async () => {
      citiesRepo.getCityById.mockResolvedValue(null);

      const result = await citiesService.deleteCity(1);
      expect(result.statusCode).toBe(404);
    });
  });
});
