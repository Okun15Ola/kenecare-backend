/* eslint-disable no-unused-vars */
const adminAppointmentsService = require("../../../../src/services/admin/admin.appointments.services");
const adminAppointmentsRepo = require("../../../../src/repository/adminAppointments.repository");
const { redisClient } = require("../../../../src/config/redis.config");
// const dbMapper = require("../../../../src/utils/db-mapper.utils");
const caching = require("../../../../src/utils/caching.utils");

jest.mock("../../../../src/repository/adminAppointments.repository");
jest.mock("../../../../src/config/redis.config");
jest.mock("../../../../src/utils/db-mapper.utils");
jest.mock("../../../../src/utils/caching.utils");

jest.mock("../../../../src/utils/caching.utils", () => ({
  getCachedCount: jest.fn((_) => Promise.resolve(1)),
  getPaginationInfo: jest.fn((_) => ({})),
  cacheKeyBulider: jest.fn((key) => key),
}));

describe("Admin Appointments Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAdminAppointments", () => {
    it("should return appointments from cache if available", async () => {
      const cachedData = [{ id: 1, patientName: "John Doe" }];
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));
      caching.cacheKeyBulider.mockReturnValue("cache-key");

      const result = await adminAppointmentsService.getAdminAppointments({
        limit: 10,
        offset: 0,
        paginationInfo: {},
      });
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalledWith("cache-key");
    });

    it("should throw an error if repo fails", async () => {
      redisClient.get.mockResolvedValue(null);
      adminAppointmentsRepo.getAllAppointments.mockRejectedValue(
        new Error("DB Error"),
      );
      await expect(
        adminAppointmentsService.getAdminAppointments({}),
      ).rejects.toThrow("DB Error");
    });
  });

  describe("getAdminAppointmentById", () => {
    it("should return an appointment by id from cache if available", async () => {
      const cachedData = { id: 1, patientName: "John Doe" };
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await adminAppointmentsService.getAdminAppointmentById(1);
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalledWith("admin-appointments:1");
    });

    it("should return a 404 if appointment not found", async () => {
      redisClient.get.mockResolvedValue(null);
      adminAppointmentsRepo.getAppointmentById.mockResolvedValue(null);

      const result = await adminAppointmentsService.getAdminAppointmentById(1);
      expect(result.statusCode).toBe(404);
    });
  });
});
