const followUpsService = require("../../../../src/services/doctors/follow-ups.services");
const followUpRepo = require("../../../../src/repository/follow-up.repository");
const doctorAppointmentsRepo = require("../../../../src/repository/doctorAppointments.repository");
const doctorsRepo = require("../../../../src/repository/doctors.repository");
const patientsRepo = require("../../../../src/repository/patients.repository");
const redisClient = require("../../../../src/config/redis.config");
const smsUtils = require("../../../../src/utils/sms.utils");
// const dbMapper = require("../../../../src/utils/db-mapper.utils");
// const Response = require("../../../../src/utils/response.utils");

jest.mock("../../../../src/repository/follow-up.repository");
jest.mock("../../../../src/repository/doctorAppointments.repository");
jest.mock("../../../../src/repository/doctors.repository");
jest.mock("../../../../src/repository/patients.repository");
jest.mock("../../../../src/config/redis.config");
jest.mock("../../../../src/utils/sms.utils");
jest.mock("../../../../src/utils/db-mapper.utils");

describe("Follow Ups Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createFollowUp", () => {
    it("should create a new follow-up", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      doctorAppointmentsRepo.getDoctorAppointByDateAndTime.mockResolvedValue(
        null,
      );
      followUpRepo.getDoctorsFollowByDateAndTime.mockResolvedValue(null);
      doctorAppointmentsRepo.getDoctorAppointmentById.mockResolvedValue({
        patient_id: 1,
      });
      patientsRepo.getPatientById.mockResolvedValue({ mobile_number: "123" });
      followUpRepo.createNewFollowUp.mockResolvedValue({});
      smsUtils.newFollowAppointmentSms.mockResolvedValue({});

      const result = await followUpsService.createFollowUp({ userId: 1 });
      expect(result.statusCode).toBe(201);
    });

    it("should return a 401 if user is not a doctor", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue(null);
      const result = await followUpsService.createFollowUp({ userId: 1 });
      expect(result.statusCode).toBe(401);
    });
  });

  describe("getAllAppointmentFollowupService", () => {
    it("should return follow-ups from cache if available", async () => {
      const cachedData = [{ id: 1, reason: "Checkup" }];
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await followUpsService.getAllAppointmentFollowupService({
        userId: 1,
      });
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalledWith(
        "doctor-appointment-follow-up:1",
      );
    });

    it("should return a 401 if user is not a doctor", async () => {
      redisClient.get.mockResolvedValue(null);
      doctorsRepo.getDoctorByUserId.mockResolvedValue(null);
      const result = await followUpsService.getAllAppointmentFollowupService({
        userId: 1,
      });
      expect(result.statusCode).toBe(401);
    });
  });

  describe("deleteAppointmentFollowUpService", () => {
    it("should delete a follow-up", async () => {
      followUpRepo.getFollowUpById.mockResolvedValue({ appointment_id: 1 });
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      doctorAppointmentsRepo.getDoctorAppointmentById.mockResolvedValue({
        id: 1,
      });
      followUpRepo.deleteAppointmentFollowUp.mockResolvedValue({});

      const result = await followUpsService.deleteAppointmentFollowUpService({
        followUpId: 1,
        userId: 1,
      });
      expect(result.statusCode).toBe(200);
    });

    it("should return a 404 if follow-up not found", async () => {
      followUpRepo.getFollowUpById.mockResolvedValue(null);
      const result = await followUpsService.deleteAppointmentFollowUpService({
        followUpId: 1,
        userId: 1,
      });
      expect(result.statusCode).toBe(404);
    });
  });
});
