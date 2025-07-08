const prescriptionService = require("../../../src/services/prescriptions.services");
const prescriptionRepo = require("../../../src/repository/prescriptions.repository");
const patientAppointmentsRepo = require("../../../src/repository/patientAppointments.repository");
const patientsRepo = require("../../../src/repository/patients.repository");
const { redisClient } = require("../../../src/config/redis.config");
const authUtils = require("../../../src/utils/auth.utils");
const smsUtils = require("../../../src/utils/sms.utils");
const caching = require("../../../src/utils/caching.utils");
// const Response = require("../../../src/utils/response.utils");

jest.mock("../../../src/repository/prescriptions.repository");
jest.mock("../../../src/repository/patientAppointments.repository");
jest.mock("../../../src/repository/patients.repository");
jest.mock("../../../src/config/redis.config");
jest.mock("../../../src/utils/auth.utils");
jest.mock("../../../src/utils/sms.utils");
jest.mock("../../../src/utils/caching.utils");

describe("Prescription Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAppointmentPrescriptions", () => {
    it("should return prescriptions from cache if available", async () => {
      const cachedData = [{ id: 1, diagnosis: "Fever" }];
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));
      caching.cacheKeyBulider.mockReturnValue("cache-key");

      const result = await prescriptionService.getAppointmentPrescriptions(
        1,
        10,
        0,
        {},
      );
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalledWith("cache-key");
    });

    it("should throw an error if repo fails", async () => {
      redisClient.get.mockResolvedValue(null);
      prescriptionRepo.getAppointmentPrescriptions.mockRejectedValue(
        new Error("DB Error"),
      );
      await expect(
        prescriptionService.getAppointmentPrescriptions(1, 10, 0, {}),
      ).rejects.toThrow("DB Error");
    });
  });

  describe("getAppointmentPrescriptionById", () => {
    it("should return a prescription by id from cache if available", async () => {
      const cachedData = { id: 1, diagnosis: "Fever" };
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result =
        await prescriptionService.getAppointmentPrescriptionById(1);
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalledWith(
        "appointment-prescriptions:1",
      );
    });

    it("should return a 404 if prescription not found", async () => {
      redisClient.get.mockResolvedValue(null);
      prescriptionRepo.getAppointmentPrescriptionById.mockResolvedValue(null);

      const result =
        await prescriptionService.getAppointmentPrescriptionById(1);
      expect(result.statusCode).toBe(404);
    });
  });

  describe("createPrescription", () => {
    it("should create a new prescription", async () => {
      patientAppointmentsRepo.getAppointmentByID.mockResolvedValue({
        patient_id: 1,
        doctor_last_name: "Smith",
      });
      patientsRepo.getPatientById.mockResolvedValue({
        mobile_number: "1234567890",
      });
      authUtils.generateVerificationToken.mockReturnValue("token");
      authUtils.hashUsersPassword.mockResolvedValue("hashed_token");
      authUtils.encryptText.mockReturnValue("encrypted_text");
      prescriptionRepo.createAppointmentPrescriptions.mockResolvedValue({});
      smsUtils.sendPrescriptionToken.mockResolvedValue({});

      const result = await prescriptionService.createPrescription({
        appointmentId: 1,
        diagnosis: "Fever",
        medicines: [],
        comment: "Rest well",
      });

      expect(result.statusCode).toBe(201);
    });

    it("should return a 404 if appointment not found", async () => {
      patientAppointmentsRepo.getAppointmentByID.mockResolvedValue(null);

      const result = await prescriptionService.createPrescription({
        appointmentId: 1,
      });
      expect(result.statusCode).toBe(404);
    });
  });

  describe("updatePrescriptions", () => {
    it("should update a prescription", async () => {
      prescriptionRepo.updateAppointmentPrescriptions.mockResolvedValue({});

      const result = await prescriptionService.updatePrescriptions({
        appointmentId: 1,
        prescriptionId: 1,
      });
      expect(result.statusCode).toBe(201); // Note: The service returns 201 for updates
    });

    it("should throw an error if repo fails", async () => {
      prescriptionRepo.updateAppointmentPrescriptions.mockRejectedValue(
        new Error("DB Error"),
      );
      await expect(prescriptionService.updatePrescriptions({})).rejects.toThrow(
        "DB Error",
      );
    });
  });
});
