const followUpsService = require("../../../../src/services/doctors/follow-ups.services");
const doctorAppointmentsRepo = require("../../../../src/repository/doctorAppointments.repository");
const doctorsRepo = require("../../../../src/repository/doctors.repository");
const followUpRepo = require("../../../../src/repository/follow-up.repository");
const patientsRepo = require("../../../../src/repository/patients.repository");
const Response = require("../../../../src/utils/response.utils");
const smsUtils = require("../../../../src/utils/sms.utils");
const { redisClient } = require("../../../../src/config/redis.config");
const dbMapper = require("../../../../src/utils/db-mapper.utils");
const logger = require("../../../../src/middlewares/logger.middleware");

jest.mock("../../../../src/repository/doctorAppointments.repository");
jest.mock("../../../../src/repository/doctors.repository");
jest.mock("../../../../src/repository/follow-up.repository");
jest.mock("../../../../src/repository/patients.repository");
jest.mock("../../../../src/utils/response.utils");
jest.mock("../../../../src/utils/sms.utils");
jest.mock("../../../../src/config/redis.config", () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clearCacheByPattern: jest.fn(),
  },
}));
jest.mock("../../../../src/utils/db-mapper.utils");
jest.mock("../../../../src/middlewares/logger.middleware");

describe("follow-ups.services", () => {
  beforeAll(() => {
    jest.spyOn(Response, "SUCCESS").mockImplementation((data) => data);
    jest.spyOn(Response, "NOT_FOUND").mockImplementation((data) => data);
    jest.spyOn(Response, "BAD_REQUEST").mockImplementation((data) => data);
    jest.spyOn(Response, "CREATED").mockImplementation((data) => data);
    jest.spyOn(Response, "NOT_MODIFIED").mockImplementation((data) => data);
    jest.spyOn(Response, "UNAUTHORIZED").mockImplementation((data) => data);
    jest
      .spyOn(Response, "INTERNAL_SERVER_ERROR")
      .mockImplementation((data) => data);
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createFollowUp", () => {
    const params = {
      appointmentId: 1,
      followUpDate: "2024-06-01",
      followUpTime: "10:00",
      followUpReason: "Routine check",
      followUpType: "Physical",
      userId: 2,
    };

    it("should return UNAUTHORIZED if doctor not found", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue(null);
      Response.UNAUTHORIZED.mockReturnValue("unauthorized");
      const result = await followUpsService.createFollowUp(params);
      expect(result).toBe("unauthorized");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should return BAD_REQUEST if appointment already booked", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({
        doctor_id: 1,
        first_name: "John",
        title: "Dr.",
        last_name: "Doe",
      });
      doctorAppointmentsRepo.getDoctorAppointByDateAndTime.mockResolvedValue(
        true,
      );
      Response.BAD_REQUEST.mockReturnValue("bad_request");
      const result = await followUpsService.createFollowUp(params);
      expect(result).toBe("bad_request");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should return BAD_REQUEST if follow-up slot already booked", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({
        doctor_id: 1,
        first_name: "John",
        title: "Dr.",
        last_name: "Doe",
      });
      doctorAppointmentsRepo.getDoctorAppointByDateAndTime.mockResolvedValue(
        null,
      );
      followUpRepo.getDoctorsFollowByDateAndTime.mockResolvedValue(true);
      Response.BAD_REQUEST.mockReturnValue("bad_request");
      const result = await followUpsService.createFollowUp(params);
      expect(result).toBe("bad_request");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should return INTERNAL_SERVER_ERROR if insertId is not returned", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({
        doctor_id: 1,
        first_name: "John",
        title: "Dr.",
        last_name: "Doe",
      });
      doctorAppointmentsRepo.getDoctorAppointByDateAndTime.mockResolvedValue(
        null,
      );
      followUpRepo.getDoctorsFollowByDateAndTime.mockResolvedValue(null);
      doctorAppointmentsRepo.getDoctorAppointmentById.mockResolvedValue({
        patient_id: 3,
        patient_name_on_prescription: "Jane Doe",
      });
      patientsRepo.getPatientById.mockResolvedValue({
        mobile_number: "1234567890",
      });
      followUpRepo.createNewFollowUp.mockResolvedValue({ insertId: null });
      Response.INTERNAL_SERVER_ERROR.mockReturnValue("internal_error");
      const result = await followUpsService.createFollowUp(params);
      expect(result).toBe("internal_error");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should return CREATED on success", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({
        doctor_id: 1,
        first_name: "John",
        title: "Dr.",
        last_name: "Doe",
      });
      doctorAppointmentsRepo.getDoctorAppointByDateAndTime.mockResolvedValue(
        null,
      );
      followUpRepo.getDoctorsFollowByDateAndTime.mockResolvedValue(null);
      doctorAppointmentsRepo.getDoctorAppointmentById.mockResolvedValue({
        patient_id: 3,
        patient_name_on_prescription: "Jane Doe",
      });
      patientsRepo.getPatientById.mockResolvedValue({
        mobile_number: "1234567890",
      });
      followUpRepo.createNewFollowUp.mockResolvedValue({ insertId: 10 });
      Response.CREATED.mockReturnValue("created");
      const result = await followUpsService.createFollowUp(params);
      expect(result).toBe("created");
      expect(smsUtils.newFollowAppointmentSms).toHaveBeenCalled();
      expect(redisClient.clearCacheByPattern).toHaveBeenCalled();
    });
  });

  describe("updateAppointmentFollowUpService", () => {
    const params = {
      followUpId: 1,
      appointmentId: 2,
      followUpDate: "2024-06-01",
      followUpTime: "10:00",
      followUpReason: "Routine check",
      followUpType: "Physical",
      userId: 3,
    };

    it("should return UNAUTHORIZED if doctor not found", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue(null);
      Response.UNAUTHORIZED.mockReturnValue("unauthorized");
      const result =
        await followUpsService.updateAppointmentFollowUpService(params);
      expect(result).toBe("unauthorized");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should return UNAUTHORIZED if appointment does not belong to doctor", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      doctorAppointmentsRepo.getDoctorAppointmentById.mockResolvedValue(null);
      Response.UNAUTHORIZED.mockReturnValue("unauthorized");
      const result =
        await followUpsService.updateAppointmentFollowUpService(params);
      expect(result).toBe("unauthorized");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should return BAD_REQUEST if appointment slot booked", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      doctorAppointmentsRepo.getDoctorAppointmentById.mockResolvedValue(true);
      doctorAppointmentsRepo.getDoctorAppointByDateAndTime.mockResolvedValue(
        true,
      );
      Response.BAD_REQUEST.mockReturnValue("bad_request");
      const result =
        await followUpsService.updateAppointmentFollowUpService(params);
      expect(result).toBe("bad_request");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should return BAD_REQUEST if follow-up slot booked", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      doctorAppointmentsRepo.getDoctorAppointmentById.mockResolvedValue(true);
      doctorAppointmentsRepo.getDoctorAppointByDateAndTime.mockResolvedValue(
        null,
      );
      followUpRepo.getDoctorsFollowByDateAndTime.mockResolvedValue(true);
      Response.BAD_REQUEST.mockReturnValue("bad_request");
      const result =
        await followUpsService.updateAppointmentFollowUpService(params);
      expect(result).toBe("bad_request");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should return NOT_MODIFIED if affectedRows < 1", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      doctorAppointmentsRepo.getDoctorAppointmentById.mockResolvedValue(true);
      doctorAppointmentsRepo.getDoctorAppointByDateAndTime.mockResolvedValue(
        null,
      );
      followUpRepo.getDoctorsFollowByDateAndTime.mockResolvedValue(null);
      followUpRepo.updateAppointmentFollowUp.mockResolvedValue({
        affectedRows: 0,
      });
      Response.NOT_MODIFIED.mockReturnValue("not_modified");
      const result =
        await followUpsService.updateAppointmentFollowUpService(params);
      expect(result).toBe("not_modified");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should return SUCCESS on success", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      doctorAppointmentsRepo.getDoctorAppointmentById.mockResolvedValue(true);
      doctorAppointmentsRepo.getDoctorAppointByDateAndTime.mockResolvedValue(
        null,
      );
      followUpRepo.getDoctorsFollowByDateAndTime.mockResolvedValue(null);
      followUpRepo.updateAppointmentFollowUp.mockResolvedValue({
        affectedRows: 1,
      });
      Response.SUCCESS.mockReturnValue("success");
      const result =
        await followUpsService.updateAppointmentFollowUpService(params);
      expect(result).toBe("success");
      expect(redisClient.clearCacheByPattern).toHaveBeenCalled();
    });
  });

  describe("getAllAppointmentFollowupService", () => {
    const params = { userId: 1, appointmentId: 2 };

    it("should return cached data if available", async () => {
      redisClient.get.mockResolvedValue(JSON.stringify([{ id: 1 }]));
      Response.SUCCESS.mockReturnValue("success");
      const result =
        await followUpsService.getAllAppointmentFollowupService(params);
      expect(result).toBe("success");
    });

    it("should return UNAUTHORIZED if doctor not found", async () => {
      redisClient.get.mockResolvedValue(null);
      doctorsRepo.getDoctorByUserId.mockResolvedValue(null);
      Response.UNAUTHORIZED.mockReturnValue("unauthorized");
      const result =
        await followUpsService.getAllAppointmentFollowupService(params);
      expect(result).toBe("unauthorized");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should return UNAUTHORIZED if appointment does not belong to doctor", async () => {
      redisClient.get.mockResolvedValue(null);
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      doctorAppointmentsRepo.getDoctorAppointmentById.mockResolvedValue(null);
      Response.UNAUTHORIZED.mockReturnValue("unauthorized");
      const result =
        await followUpsService.getAllAppointmentFollowupService(params);
      expect(result).toBe("unauthorized");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should return SUCCESS with empty array if no follow-ups found", async () => {
      redisClient.get.mockResolvedValue(null);
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      doctorAppointmentsRepo.getDoctorAppointmentById.mockResolvedValue(true);
      followUpRepo.getAppointmentFollowUps.mockResolvedValue([]);
      Response.SUCCESS.mockReturnValue("success");
      const result =
        await followUpsService.getAllAppointmentFollowupService(params);
      expect(result).toBe("success");
    });

    it("should return SUCCESS with mapped follow-ups", async () => {
      redisClient.get.mockResolvedValue(null);
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      doctorAppointmentsRepo.getDoctorAppointmentById.mockResolvedValue(true);
      followUpRepo.getAppointmentFollowUps.mockResolvedValue([{ id: 1 }]);
      dbMapper.mapFollowUpRow.mockReturnValue({ id: 1, mapped: true });
      Response.SUCCESS.mockReturnValue("success");
      const result =
        await followUpsService.getAllAppointmentFollowupService(params);
      expect(result).toBe("success");
      expect(redisClient.set).toHaveBeenCalled();
    });
  });

  describe("getFollowUpByIdService", () => {
    const params = { userId: 1, id: 2 };

    it("should return cached data if available", async () => {
      redisClient.get.mockResolvedValue(JSON.stringify({ id: 2 }));
      Response.SUCCESS.mockReturnValue("success");
      const result = await followUpsService.getFollowUpByIdService(params);
      expect(result).toBe("success");
    });

    it("should return UNAUTHORIZED if doctor not found", async () => {
      redisClient.get.mockResolvedValue(null);
      doctorsRepo.getDoctorByUserId.mockResolvedValue({});
      Response.UNAUTHORIZED.mockReturnValue("unauthorized");
      const result = await followUpsService.getFollowUpByIdService(params);
      expect(result).toBe("unauthorized");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should return NOT_FOUND if follow-up not found", async () => {
      redisClient.get.mockResolvedValue(null);
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      followUpRepo.getDoctorFollowUpById.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result = await followUpsService.getFollowUpByIdService(params);
      expect(result).toBe("not_found");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should return SUCCESS with mapped follow-up", async () => {
      redisClient.get.mockResolvedValue(null);
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      followUpRepo.getDoctorFollowUpById.mockResolvedValue({ id: 2 });
      dbMapper.mapFollowUpRow.mockReturnValue({ id: 2, mapped: true });
      Response.SUCCESS.mockReturnValue("success");
      const result = await followUpsService.getFollowUpByIdService(params);
      expect(result).toBe("success");
    });
  });

  describe("deleteAppointmentFollowUpService", () => {
    const params = { followUpId: 1, userId: 2 };

    it("should return NOT_FOUND if follow-up not found", async () => {
      followUpRepo.getFollowUpById.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result =
        await followUpsService.deleteAppointmentFollowUpService(params);
      expect(result).toBe("not_found");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should return UNAUTHORIZED if doctor not found", async () => {
      followUpRepo.getFollowUpById.mockResolvedValue({ appointment_id: 2 });
      doctorsRepo.getDoctorByUserId.mockResolvedValue(null);
      Response.UNAUTHORIZED.mockReturnValue("unauthorized");
      const result =
        await followUpsService.deleteAppointmentFollowUpService(params);
      expect(result).toBe("unauthorized");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should return UNAUTHORIZED if appointment does not belong to doctor", async () => {
      followUpRepo.getFollowUpById.mockResolvedValue({ appointment_id: 2 });
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      doctorAppointmentsRepo.getDoctorAppointmentById.mockResolvedValue(null);
      Response.UNAUTHORIZED.mockReturnValue("unauthorized");
      const result =
        await followUpsService.deleteAppointmentFollowUpService(params);
      expect(result).toBe("unauthorized");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should return NOT_MODIFIED if affectedRows < 1", async () => {
      followUpRepo.getFollowUpById.mockResolvedValue({ appointment_id: 2 });
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      doctorAppointmentsRepo.getDoctorAppointmentById.mockResolvedValue(true);
      followUpRepo.deleteAppointmentFollowUp.mockResolvedValue({
        affectedRows: 0,
      });
      Response.NOT_MODIFIED.mockReturnValue("not_modified");
      const result =
        await followUpsService.deleteAppointmentFollowUpService(params);
      expect(result).toBe("not_modified");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should return SUCCESS on success", async () => {
      followUpRepo.getFollowUpById.mockResolvedValue({ appointment_id: 2 });
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      doctorAppointmentsRepo.getDoctorAppointmentById.mockResolvedValue(true);
      followUpRepo.deleteAppointmentFollowUp.mockResolvedValue({
        affectedRows: 1,
      });
      Response.SUCCESS.mockReturnValue("success");
      const result =
        await followUpsService.deleteAppointmentFollowUpService(params);
      expect(result).toBe("success");
      expect(redisClient.clearCacheByPattern).toHaveBeenCalled();
    });
  });
});
