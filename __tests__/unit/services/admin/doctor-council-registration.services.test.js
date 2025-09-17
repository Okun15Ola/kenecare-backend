/* eslint-disable no-unused-vars */
const doctorCouncilRegistrationService = require("../../../../src/services/admin/doctor-council-registration.services");
const doctorsRepo = require("../../../../src/repository/admin-doctors.repository");
const { redisClient } = require("../../../../src/config/redis.config");
const emailUtils = require("../../../../src/utils/email.utils");
const cachingUtils = require("../../../../src/utils/caching.utils");
const Response = require("../../../../src/utils/response.utils");

jest.mock("../../../../src/utils/caching.utils");
jest.mock("../../../../src/repository/admin-doctors.repository");
jest.mock("../../../../src/config/redis.config");
jest.mock("../../../../src/utils/email.utils");
jest.mock("../../../../src/utils/db-mapper.utils");

jest.mock("../../../../src/utils/caching.utils", () => ({
  getCachedCount: jest.fn((_) => Promise.resolve(1)),
  getPaginationInfo: jest.fn((_) => ({})),
  cacheKeyBulider: jest.fn((key) => key),
}));

describe("Doctor Council Registration Service", () => {
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllCouncilRegistrations", () => {
    it("should return registrations from cache if available", async () => {
      const cachedData = [{ id: 1, doctorName: "Dr. Smith" }];
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result =
        await doctorCouncilRegistrationService.getAllCouncilRegistrations();
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalled();
    });

    it("should return a 200 if no registrations are found", async () => {
      redisClient.get.mockResolvedValue(null);
      doctorsRepo.getAllMedicalCouncilRegistration.mockResolvedValue([]);

      const result =
        await doctorCouncilRegistrationService.getAllCouncilRegistrations();
      expect(result.statusCode).toBe(200);
    });
  });

  describe("getCouncilRegistration", () => {
    it("should return a registration by id from cache if available", async () => {
      const cachedData = { id: 1, doctorName: "Dr. Smith" };
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result =
        await doctorCouncilRegistrationService.getCouncilRegistration(1);
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalled();
    });

    it("should return a 404 if registration not found", async () => {
      redisClient.get.mockResolvedValue(null);
      doctorsRepo.getCouncilRegistrationById.mockResolvedValue(null);

      const result =
        await doctorCouncilRegistrationService.getCouncilRegistration(1);
      expect(result.statusCode).toBe(404);
    });
  });

  describe("approveCouncilRegistration", () => {
    it("should approve a registration", async () => {
      doctorsRepo.getCouncilRegistrationById.mockResolvedValue({
        registration_status: "pending",
        doctor_id: 1,
      });
      doctorsRepo.getDoctorById.mockResolvedValue({ email: "test@test.com" });
      emailUtils.doctorCouncilRegistrationApprovedEmail.mockResolvedValue({});

      const result =
        await doctorCouncilRegistrationService.approveCouncilRegistration({
          regId: 1,
          userId: 1,
        });
      expect(result.statusCode).toBe(200);
    });

    it("should return a 304 if registration is already approved", async () => {
      doctorsRepo.getCouncilRegistrationById.mockResolvedValue({
        registration_status: "approved",
      });

      const result =
        await doctorCouncilRegistrationService.approveCouncilRegistration({
          regId: 1,
        });
      expect(result.statusCode).toBe(304);
    });
  });

  describe("rejectCouncilRegistration", () => {
    it("should reject a registration", async () => {
      doctorsRepo.getCouncilRegistrationById.mockResolvedValue({
        registration_status: "pending",
        doctor_id: 1,
      });
      doctorsRepo.getDoctorById.mockResolvedValue({ email: "test@test.com" });
      emailUtils.doctorCouncilRegistrationRejectedEmail.mockResolvedValue({});

      const result =
        await doctorCouncilRegistrationService.rejectCouncilRegistration({
          regId: 1,
          userId: 1,
        });
      expect(result.statusCode).toBe(200);
    });

    it("should return a 304 if registration is already rejected", async () => {
      doctorsRepo.getCouncilRegistrationById.mockResolvedValue({
        registration_status: "rejected",
      });

      const result =
        await doctorCouncilRegistrationService.rejectCouncilRegistration({
          regId: 1,
        });
      expect(result.statusCode).toBe(304);
    });
  });
});
