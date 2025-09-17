/* eslint-disable no-unused-vars */
const prescriptionsService = require("../../../src/services/prescriptions.services");
const prescriptionsRepo = require("../../../src/repository/prescriptions.repository");
const Response = require("../../../src/utils/response.utils");
const authUtils = require("../../../src/utils/auth.utils");
const appointmentsRepo = require("../../../src/repository/patientAppointments.repository");
const redisConfig = require("../../../src/config/redis.config");
const dbMapper = require("../../../src/utils/db-mapper.utils");
const logger = require("../../../src/middlewares/logger.middleware");

jest.mock("../../../src/repository/prescriptions.repository");
jest.mock("../../../src/utils/response.utils");
jest.mock("../../../src/utils/auth.utils");
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
    jest
      .spyOn(Response, "INTERNAL_SERVER_ERROR")
      .mockImplementation((data) => data);
    jest.spyOn(Response, "CREATED").mockImplementation((data) => data);
    jest.spyOn(Response, "NOT_MODIFIED").mockImplementation((data) => data);
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAppointmentPrescriptions", () => {
    it("should return cached prescriptions if available", async () => {
      redisConfig.redisClient.get.mockResolvedValue(JSON.stringify({ id: 1 }));
      Response.SUCCESS.mockReturnValue("success");

      const result = await prescriptionsService.getAppointmentPrescriptions(1);

      expect(redisConfig.redisClient.get).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalled();
      expect(result).toBe("success");
    });

    it("should fetch prescriptions from repo and cache them if not cached", async () => {
      redisConfig.redisClient.get.mockResolvedValue(null);
      prescriptionsRepo.getAppointmentPrescriptions.mockResolvedValue([
        { id: 2 },
      ]);
      dbMapper.mapPrescriptionRow.mockReturnValue({ id: 2, mapped: true });
      redisConfig.redisClient.set.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");

      const result = await prescriptionsService.getAppointmentPrescriptions(1);

      expect(prescriptionsRepo.getAppointmentPrescriptions).toHaveBeenCalled();
      expect(redisConfig.redisClient.set).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalled();
      expect(result).toBe("success");
    });

    it("should return SUCCESS if prescription does not exist", async () => {
      redisConfig.redisClient.get.mockResolvedValue(null);
      prescriptionsRepo.getAppointmentPrescriptions.mockResolvedValue([]);
      Response.SUCCESS.mockReturnValue("success");

      const result = await prescriptionsService.getAppointmentPrescriptions(1);

      expect(Response.SUCCESS).toHaveBeenCalled();
      expect(result).toBe("success");
    });

    it("should log and throw error on failure", async () => {
      redisConfig.redisClient.get.mockRejectedValue(new Error("fail"));
      logger.error.mockReturnValue();

      await expect(
        prescriptionsService.getAppointmentPrescriptions(1),
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

      expect(redisConfig.redisClient.get).toHaveBeenCalled();
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

      expect(Response.NOT_FOUND).toHaveBeenCalled();
      expect(result).toBe("not_found");
    });

    it("should fetch, map, cache and return prescription", async () => {
      redisConfig.redisClient.get.mockResolvedValue(null);
      prescriptionsRepo.getAppointmentPrescriptionById.mockResolvedValue(3);
      dbMapper.mapPrescriptionRow.mockReturnValue({ id: 3, mapped: true });
      redisConfig.redisClient.set.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");

      const result =
        await prescriptionsService.getAppointmentPrescriptionById(3);

      expect(dbMapper.mapPrescriptionRow).toHaveBeenCalled();
      expect(redisConfig.redisClient.set).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalled();
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
    it("should return INTERNAL_SERVER_ERROR if insertId is missing", async () => {
      authUtils.encryptText.mockReturnValue("enc");
      prescriptionsRepo.createAppointmentPrescriptions.mockResolvedValue({
        insertId: null,
      });
      logger.warn.mockReturnValue();
      Response.INTERNAL_SERVER_ERROR.mockReturnValue("error");

      const result = await prescriptionsService.createPrescription({
        appointmentId: 1,
        diagnosis: "diag",
        medicines: [],
        comment: "comm",
      });

      expect(Response.INTERNAL_SERVER_ERROR).toHaveBeenCalled();
      expect(result).toBe("error");
    });

    it("should create prescription, clear cache and return CREATED", async () => {
      authUtils.encryptText.mockReturnValue("enc");
      prescriptionsRepo.createAppointmentPrescriptions.mockResolvedValue({
        insertId: 5,
      });
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
      expect(redisConfig.redisClient.delete).toHaveBeenCalled();
      expect(Response.CREATED).toHaveBeenCalled();
      expect(result).toBe("created");
    });

    it("should log and throw error on failure", async () => {
      prescriptionsRepo.createAppointmentPrescriptions.mockRejectedValue(
        new Error("fail"),
      );
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
      authUtils.encryptText.mockReturnValue("enc");
      prescriptionsRepo.updateAppointmentPrescriptions.mockResolvedValue({
        affectedRows: 0,
      });
      Response.NOT_MODIFIED.mockReturnValue("not_modified");

      const result = await prescriptionsService.updatePrescriptions({
        appointmentId: 1,
        prescriptionId: 2,
        diagnosis: "diag",
        medicines: [],
        comment: "comm",
      });

      expect(Response.NOT_MODIFIED).toHaveBeenCalled();
      expect(result).toBe("not_modified");
    });

    it("should update prescription, delete cache and return SUCCESS", async () => {
      authUtils.encryptText.mockReturnValue("enc");
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

      expect(redisConfig.redisClient.delete).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalled();
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
