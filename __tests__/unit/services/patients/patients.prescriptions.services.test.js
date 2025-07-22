/* eslint-disable no-unused-vars */
const patientPrescriptionsService = require("../../../../src/services/patients/patients.prescriptions.services");
const prescriptionsRepo = require("../../../../src/repository/prescriptions.repository");
const { redisClient } = require("../../../../src/config/redis.config");
const caching = require("../../../../src/utils/caching.utils");
const Response = require("../../../../src/utils/response.utils");

jest.mock("../../../../src/repository/prescriptions.repository");
jest.mock("../../../../src/config/redis.config");
jest.mock("../../../../src/utils/db-mapper.utils");
jest.mock("../../../../src/utils/caching.utils");

jest.mock("../../../../src/utils/caching.utils", () => ({
  getCachedCount: jest.fn((_) => Promise.resolve(1)),
  getPaginationInfo: jest.fn((_) => ({})),
  cacheKeyBulider: jest.fn((key) => key),
}));

describe("Patient Prescriptions Service", () => {
  beforeAll(() => {
    jest.spyOn(Response, "SUCCESS").mockImplementation((data) => data);
    jest.spyOn(Response, "NOT_FOUND").mockImplementation((data) => data);
    jest.spyOn(Response, "BAD_REQUEST").mockImplementation((data) => data);
    jest.spyOn(Response, "CREATED").mockImplementation((data) => data);
    jest.spyOn(Response, "NOT_MODIFIED").mockImplementation((data) => data);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAppointmentPrescriptions", () => {
    it("should return prescriptions from cache if available", async () => {
      const cachedData = [{ id: 1, diagnosis: "Fever" }];
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));
      caching.cacheKeyBulider.mockReturnValue("cache-key");

      const result =
        await patientPrescriptionsService.getAppointmentPrescriptions(1);
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalled();
    });

    it("should throw an error if repo fails", async () => {
      redisClient.get.mockResolvedValue(null);
      prescriptionsRepo.getAppointmentPrescriptions.mockRejectedValue(
        new Error("DB Error"),
      );
      await expect(
        patientPrescriptionsService.getAppointmentPrescriptions(1, 10, 0, {}),
      ).rejects.toThrow("DB Error");
    });
  });

  describe("getAppointmentPrescriptionById", () => {
    it("should return a prescription by id from cache if available", async () => {
      const cachedData = { id: 1, diagnosis: "Fever" };
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result =
        await patientPrescriptionsService.getAppointmentPrescriptionById(1);
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalledWith("patient:prescriptions:1");
    });

    it("should return a 404 if prescription not found", async () => {
      redisClient.get.mockResolvedValue(null);
      prescriptionsRepo.getAppointmentPrescriptionById.mockResolvedValue(null);

      const result =
        await patientPrescriptionsService.getAppointmentPrescriptionById(1);
      expect(result.statusCode).toBe(404);
    });
  });
});
