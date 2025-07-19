const prescriptionsService = require("../../../src/services/prescriptions.services");
const prescriptionsRepo = require("../../../src/repository/prescriptions.repository");
const Response = require("../../../src/utils/response.utils");
const authUtils = require("../../../src/utils/auth.utils");
const smsUtils = require("../../../src/utils/sms.utils");
const appointmentsRepo = require("../../../src/repository/patientAppointments.repository");
const patientsRepo = require("../../../src/repository/patients.repository");
const redisConfig = require("../../../src/config/redis.config");
const cachingUtils = require("../../../src/utils/caching.utils");
const dbMapper = require("../../../src/utils/db-mapper.utils");
const logger = require("../../../src/middlewares/logger.middleware");

jest.mock("../../../src/repository/prescriptions.repository");
jest.mock("../../../src/utils/response.utils");
jest.mock("../../../src/utils/auth.utils");
jest.mock("../../../src/utils/sms.utils");
jest.mock("../../../src/repository/patientAppointments.repository");
jest.mock("../../../src/repository/patients.repository");
jest.mock("../../../src/config/redis.config");
jest.mock("../../../src/utils/caching.utils");
jest.mock("../../../src/utils/db-mapper.utils");
jest.mock("../../../src/middlewares/logger.middleware");

describe("prescriptions.services", () => {
  beforeAll(() => {
    jest.spyOn(Response, "SUCCESS").mockImplementation((data) => data);
    jest.spyOn(Response, "NOT_FOUND").mockImplementation((data) => data);
    jest.spyOn(Response, "BAD_REQUEST").mockImplementation((data) => data);
    jest.spyOn(Response, "CREATED").mockImplementation((data) => data);
    jest.spyOn(Response, "NOT_MODIFIED").mockImplementation((data) => data);
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAppointmentPrescriptions", () => {
    it("should return cached prescriptions if available", async () => {
      const cacheKey = "appointment-prescriptions:all:10:0";
      cachingUtils.cacheKeyBulider.mockReturnValue(cacheKey);
      redisConfig.redisClient.get.mockResolvedValue(
        JSON.stringify([{ id: 1 }]),
      );
      Response.SUCCESS.mockReturnValue("success");

      const result = await prescriptionsService.getAppointmentPrescriptions(
        1,
        10,
        0,
        {},
      );

      expect(redisConfig.redisClient.get).toHaveBeenCalledWith(cacheKey);
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        data: [{ id: 1 }],
        pagination: {},
      });
      expect(result).toBe("success");
    });

    it("should fetch prescriptions from repo and cache them if not cached", async () => {
      cachingUtils.cacheKeyBulider.mockReturnValue("key");
      redisConfig.redisClient.get.mockResolvedValue(null);
      prescriptionsRepo.getAppointmentPrescriptions.mockResolvedValue([
        { id: 2 },
      ]);
      dbMapper.mapPrescriptionRow.mockReturnValue({ id: 2, mapped: true });
      redisConfig.redisClient.set.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");

      const result = await prescriptionsService.getAppointmentPrescriptions(
        1,
        10,
        0,
        {},
      );

      expect(prescriptionsRepo.getAppointmentPrescriptions).toHaveBeenCalled();
      expect(redisConfig.redisClient.set).toHaveBeenCalledWith({
        key: "key",
        value: JSON.stringify([{ id: 2, mapped: true }]),
      });
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        data: [{ id: 2, mapped: true }],
        pagination: {},
      });
      expect(result).toBe("success");
    });

    it("should return empty array if no prescriptions found", async () => {
      cachingUtils.cacheKeyBulider.mockReturnValue("key");
      redisConfig.redisClient.get.mockResolvedValue(null);
      prescriptionsRepo.getAppointmentPrescriptions.mockResolvedValue([]);
      Response.SUCCESS.mockReturnValue("empty");

      const result = await prescriptionsService.getAppointmentPrescriptions(
        1,
        10,
        0,
        {},
      );

      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "No prescriptions found",
        data: [],
      });
      expect(result).toBe("empty");
    });

    it("should log and throw error on failure", async () => {
      redisConfig.redisClient.get.mockRejectedValue(new Error("fail"));
      logger.error.mockReturnValue();

      await expect(
        prescriptionsService.getAppointmentPrescriptions(1, 10, 0, {}),
      ).rejects.toThrow("fail");
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("getAppointmentPrescriptionById", () => {
    it("should return cached prescription if available", async () => {
      redisConfig.redisClient.get.mockResolvedValue(JSON.stringify({ id: 1 }));
      Response.SUCCESS.mockReturnValue("success");

      const result =
        await prescriptionsService.getAppointmentPrescriptionById(1);

      expect(redisConfig.redisClient.get).toHaveBeenCalledWith(
        "appointment-prescriptions:1",
      );
      expect(Response.SUCCESS).toHaveBeenCalledWith({ data: { id: 1 } });
      expect(result).toBe("success");
    });

    it("should return NOT_FOUND if prescription does not exist", async () => {
      redisConfig.redisClient.get.mockResolvedValue(null);
      prescriptionsRepo.getAppointmentPrescriptionById.mockResolvedValue(null);
      logger.warn.mockReturnValue();
      Response.NOT_FOUND.mockReturnValue("not_found");

      const result =
        await prescriptionsService.getAppointmentPrescriptionById(2);

      expect(Response.NOT_FOUND).toHaveBeenCalledWith({
        message: "Prescription not found. Try again",
      });
      expect(result).toBe("not_found");
    });

    it("should fetch, map, cache and return prescription", async () => {
      redisConfig.redisClient.get.mockResolvedValue(null);
      prescriptionsRepo.getAppointmentPrescriptionById.mockResolvedValue({
        id: 3,
        access_jwt: "token",
      });
      dbMapper.mapPrescriptionRow.mockReturnValue({ id: 3, mapped: true });
      redisConfig.redisClient.set.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");

      const result =
        await prescriptionsService.getAppointmentPrescriptionById(3);

      expect(dbMapper.mapPrescriptionRow).toHaveBeenCalledWith(
        { id: 3, access_jwt: "token" },
        "token",
        true,
        true,
        true,
      );
      expect(redisConfig.redisClient.set).toHaveBeenCalledWith({
        key: "appointment-prescriptions:3",
        value: JSON.stringify({ id: 3, mapped: true }),
      });
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        data: { id: 3, mapped: true },
      });
      expect(result).toBe("success");
    });

    it("should log and throw error on failure", async () => {
      redisConfig.redisClient.get.mockRejectedValue(new Error("fail"));
      logger.error.mockReturnValue();

      await expect(
        prescriptionsService.getAppointmentPrescriptionById(1),
      ).rejects.toThrow("fail");
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("createPrescription", () => {
    it("should return NOT_FOUND if appointment does not exist", async () => {
      appointmentsRepo.getAppointmentByID.mockResolvedValue(null);
      logger.warn.mockReturnValue();
      Response.NOT_FOUND.mockReturnValue("not_found");

      const result = await prescriptionsService.createPrescription({
        appointmentId: 1,
        diagnosis: "diag",
        medicines: [],
        comment: "comm",
      });

      expect(Response.NOT_FOUND).toHaveBeenCalledWith({
        message: "Appointment Not Found! Please Try again",
      });
      expect(result).toBe("not_found");
    });

    it("should return BAD_REQUEST if insertId is missing", async () => {
      appointmentsRepo.getAppointmentByID.mockResolvedValue({
        patient_id: 2,
        doctor_last_name: "Smith",
      });
      patientsRepo.getPatientById.mockResolvedValue({
        mobile_number: "1234567890",
      });
      authUtils.generateVerificationToken.mockReturnValue("token");
      authUtils.hashUsersPassword.mockResolvedValue("hashed");
      authUtils.encryptText.mockReturnValue("enc");
      prescriptionsRepo.createAppointmentPrescriptions.mockResolvedValue({
        insertId: null,
      });
      logger.warn.mockReturnValue();
      Response.BAD_REQUEST.mockReturnValue("bad");

      const result = await prescriptionsService.createPrescription({
        appointmentId: 1,
        diagnosis: "diag",
        medicines: [],
        comment: "comm",
      });

      expect(Response.BAD_REQUEST).toHaveBeenCalledWith({
        message: "Failed to create prescription. Try again",
      });
      expect(result).toBe("bad");
    });

    it("should create prescription, send token, clear cache and return CREATED", async () => {
      appointmentsRepo.getAppointmentByID.mockResolvedValue({
        patient_id: 2,
        doctor_last_name: "Smith",
      });
      patientsRepo.getPatientById.mockResolvedValue({
        mobile_number: "1234567890",
      });
      authUtils.generateVerificationToken.mockReturnValue("token");
      authUtils.hashUsersPassword.mockResolvedValue("hashed");
      authUtils.encryptText.mockReturnValue("enc");
      prescriptionsRepo.createAppointmentPrescriptions.mockResolvedValue({
        insertId: 5,
      });
      smsUtils.sendPrescriptionToken.mockResolvedValue();
      redisConfig.redisClient.clearCacheByPattern.mockResolvedValue();
      Response.CREATED.mockReturnValue("created");

      const result = await prescriptionsService.createPrescription({
        appointmentId: 1,
        diagnosis: "diag",
        medicines: [],
        comment: "comm",
      });

      expect(
        prescriptionsRepo.createAppointmentPrescriptions,
      ).toHaveBeenCalled();
      expect(smsUtils.sendPrescriptionToken).toHaveBeenCalledWith({
        mobileNumber: "1234567890",
        doctorName: "Smith",
      });
      expect(redisConfig.redisClient.clearCacheByPattern).toHaveBeenCalledWith(
        "appointment-prescriptions:*",
      );
      expect(Response.CREATED).toHaveBeenCalledWith({
        message: "Prescription Created Successfully",
      });
      expect(result).toBe("created");
    });

    it("should log and throw error on failure", async () => {
      appointmentsRepo.getAppointmentByID.mockRejectedValue(new Error("fail"));
      logger.error.mockReturnValue();

      await expect(
        prescriptionsService.createPrescription({
          appointmentId: 1,
          diagnosis: "diag",
          medicines: [],
          comment: "comm",
        }),
      ).rejects.toThrow("fail");
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("updatePrescriptions", () => {
    it("should return NOT_MODIFIED if affectedRows is missing or < 1", async () => {
      prescriptionsRepo.updateAppointmentPrescriptions.mockResolvedValue({
        affectedRows: 0,
      });
      logger.warn.mockReturnValue();
      Response.NOT_MODIFIED.mockReturnValue("not_modified");

      const result = await prescriptionsService.updatePrescriptions({
        appointmentId: 1,
        prescriptionId: 2,
        diagnosis: "diag",
        medicines: [],
        comment: "comm",
      });

      expect(Response.NOT_MODIFIED).toHaveBeenCalledWith({});
      expect(result).toBe("not_modified");
    });

    it("should update prescription, delete cache and return SUCCESS", async () => {
      prescriptionsRepo.updateAppointmentPrescriptions.mockResolvedValue({
        affectedRows: 1,
      });
      redisConfig.redisClient.delete.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");

      const result = await prescriptionsService.updatePrescriptions({
        appointmentId: 1,
        prescriptionId: 2,
        diagnosis: "diag",
        medicines: [],
        comment: "comm",
      });

      expect(redisConfig.redisClient.delete).toHaveBeenCalledWith(
        "appointment-prescriptions:2",
      );
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "Prescription Updated Successfully",
      });
      expect(result).toBe("success");
    });

    it("should log and throw error on failure", async () => {
      prescriptionsRepo.updateAppointmentPrescriptions.mockRejectedValue(
        new Error("fail"),
      );
      logger.error.mockReturnValue();

      await expect(
        prescriptionsService.updatePrescriptions({
          appointmentId: 1,
          prescriptionId: 2,
          diagnosis: "diag",
          medicines: [],
          comment: "comm",
        }),
      ).rejects.toThrow("fail");
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
