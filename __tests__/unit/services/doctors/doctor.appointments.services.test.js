/* eslint-disable no-unused-vars */
const doctorAppointmentsService = require("../../../../src/services/doctors/doctor.appointments.services");
const dbObject = require("../../../../src/repository/doctorAppointments.repository");
const doctorsRepo = require("../../../../src/repository/doctors.repository");
const usersRepo = require("../../../../src/repository/users.repository");
const patientsRepo = require("../../../../src/repository/patients.repository");
const followUpRepo = require("../../../../src/repository/follow-up.repository");
const Response = require("../../../../src/utils/response.utils");
const smsUtils = require("../../../../src/utils/sms.utils");
const logger = require("../../../../src/middlewares/logger.middleware");
const streamUtils = require("../../../../src/utils/stream.utils");
const redisConfig = require("../../../../src/config/redis.config");
const enumUtils = require("../../../../src/utils/enum.utils");
const dbMapper = require("../../../../src/utils/db-mapper.utils");
const cachingUtils = require("../../../../src/utils/caching.utils");

jest.mock("../../../../src/utils/caching.utils");

jest.mock("../../../../src/repository/doctorAppointments.repository");
jest.mock("../../../../src/repository/doctors.repository");
jest.mock("../../../../src/repository/users.repository");
jest.mock("../../../../src/repository/patients.repository");
jest.mock("../../../../src/repository/follow-up.repository");
jest.mock("../../../../src/utils/response.utils");
jest.mock("../../../../src/utils/sms.utils");
jest.mock("../../../../src/middlewares/logger.middleware");
jest.mock("../../../../src/utils/stream.utils");
jest.mock("../../../../src/config/redis.config");
jest.mock("../../../../src/utils/db-mapper.utils");

jest.mock("../../../../src/utils/caching.utils", () => ({
  getCachedCount: jest.fn((_) => Promise.resolve(1)),
  getPaginationInfo: jest.fn((_) => ({})),
  cacheKeyBulider: jest.fn(
    (key, limit, offset) =>
      `${key}${limit ? `:limit=${limit}` : ""}${offset ? `:offset=${offset}` : ""}`,
  ),
}));

describe("doctor.appointments.services", () => {
  beforeAll(() => {
    jest.spyOn(Response, "SUCCESS").mockImplementation((data) => data);
    jest.spyOn(Response, "NOT_FOUND").mockImplementation((data) => data);
    jest.spyOn(Response, "BAD_REQUEST").mockImplementation((data) => data);
    jest.spyOn(Response, "CREATED").mockImplementation((data) => data);
    jest.spyOn(Response, "UNAUTHORIZED").mockImplementation((data) => data);
    jest.spyOn(Response, "NOT_MODIFIED").mockImplementation((data) => data);
  });
  beforeEach(() => {
    jest.clearAllMocks();
    redisConfig.redisClient.get = jest.fn();
    redisConfig.redisClient.set = jest.fn();
  });

  describe("getDoctorAppointments", () => {
    it("should return NOT_FOUND if doctor not found", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result = await doctorAppointmentsService.getDoctorAppointments({
        userId: 1,
      });
      expect(result).toBe("not_found");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should return cached data if present", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({
        doctor_id: 1,
        title: "Dr",
      });
      redisConfig.redisClient.get.mockResolvedValue(
        JSON.stringify([{ id: 1 }]),
      );
      Response.SUCCESS.mockReturnValue("success");
      const result = await doctorAppointmentsService.getDoctorAppointments({
        userId: 1,
        limit: 10,
        offset: 0,
        paginationInfo: {},
      });
      expect(result).toBe("success");
      expect(redisConfig.redisClient.get).toHaveBeenCalled();
    });

    it("should return appointments if found", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({
        doctor_id: 1,
        title: "Dr",
      });
      redisConfig.redisClient.get.mockResolvedValue(null);
      dbObject.getAppointmentsByDoctorId.mockResolvedValue([{ id: 1 }]);
      dbMapper.mapDoctorAppointmentRow.mockReturnValue({ id: 1, mapped: true });
      Response.SUCCESS.mockReturnValue("success");
      redisConfig.redisClient.set.mockResolvedValue();
      const result = await doctorAppointmentsService.getDoctorAppointments({
        userId: 1,
        limit: 10,
        offset: 0,
        paginationInfo: {},
      });
      expect(result).toBe("success");
      expect(dbObject.getAppointmentsByDoctorId).toHaveBeenCalled();
      expect(redisConfig.redisClient.set).toHaveBeenCalled();
    });

    it("should return empty array if no appointments", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({
        doctor_id: 1,
        title: "Dr",
      });
      redisConfig.redisClient.get.mockResolvedValue(null);
      dbObject.getAppointmentsByDoctorId.mockResolvedValue([]);
      Response.SUCCESS.mockReturnValue("success");
      const result = await doctorAppointmentsService.getDoctorAppointments({
        userId: 1,
        limit: 10,
        offset: 0,
        paginationInfo: {},
      });
      expect(result).toBe("success");
    });
  });

  describe("getDoctorAppointment", () => {
    it("should return NOT_FOUND if doctor not found", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result = await doctorAppointmentsService.getDoctorAppointment({
        userId: 1,
        id: 2,
      });
      expect(result).toBe("not_found");
    });

    it("should return UNAUTHORIZED if user is not doctor", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ user_type: "PATIENT" });
      Response.UNAUTHORIZED.mockReturnValue("unauthorized");
      const result = await doctorAppointmentsService.getDoctorAppointment({
        userId: 1,
        id: 2,
      });
      expect(result).toBe("unauthorized");
    });

    it("should return cached data if present", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({
        user_type: enumUtils.USERTYPE.DOCTOR,
        doctor_id: 1,
        title: "Dr",
      });
      redisConfig.redisClient.get.mockResolvedValue(JSON.stringify({ id: 2 }));
      Response.SUCCESS.mockReturnValue("success");
      const result = await doctorAppointmentsService.getDoctorAppointment({
        userId: 1,
        id: 2,
      });
      expect(result).toBe("success");
    });

    it("should return NOT_FOUND if appointment not found", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({
        user_type: enumUtils.USERTYPE.DOCTOR,
        doctor_id: 1,
        title: "Dr",
      });
      redisConfig.redisClient.get.mockResolvedValue(null);
      dbObject.getDoctorAppointmentById.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result = await doctorAppointmentsService.getDoctorAppointment({
        userId: 1,
        id: 2,
      });
      expect(result).toBe("not_found");
    });

    it("should return appointment with followUps", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({
        user_type: enumUtils.USERTYPE.DOCTOR,
        doctor_id: 1,
        title: "Dr",
      });
      redisConfig.redisClient.get.mockResolvedValue(null);
      dbObject.getDoctorAppointmentById.mockResolvedValue({ appointmentId: 2 });
      dbMapper.mapDoctorAppointmentRow.mockReturnValue({ appointmentId: 2 });
      followUpRepo.getAppointmentFollowUps.mockResolvedValue([{ id: 3 }]);
      dbMapper.mapFollowUpsRow.mockReturnValue({ id: 3, mapped: true });
      Response.SUCCESS.mockReturnValue("success");
      redisConfig.redisClient.set.mockResolvedValue();
      const result = await doctorAppointmentsService.getDoctorAppointment({
        userId: 1,
        id: 2,
      });
      expect(result).toBe("success");
      expect(redisConfig.redisClient.set).toHaveBeenCalled();
    });
  });

  describe("approveDoctorAppointment", () => {
    it("should return NOT_FOUND if doctor not found", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result = await doctorAppointmentsService.approveDoctorAppointment({
        userId: 1,
        appointmentId: 2,
      });
      expect(result).toBe("not_found");
    });

    it("should return NOT_FOUND if appointment not found", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      dbObject.getDoctorAppointmentById.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result = await doctorAppointmentsService.approveDoctorAppointment({
        userId: 1,
        appointmentId: 2,
      });
      expect(result).toBe("not_found");
    });

    it("should return SUCCESS if appointment already approved", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      dbObject.getDoctorAppointmentById.mockResolvedValue({
        appointment_status: "approved",
      });
      Response.SUCCESS.mockReturnValue("success");
      const result = await doctorAppointmentsService.approveDoctorAppointment({
        userId: 1,
        appointmentId: 2,
      });
      expect(result).toBe("success");
    });

    it("should approve appointment and send sms", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({
        doctor_id: 1,
        first_name: "Doc",
        last_name: "Tor",
      });
      dbObject.getDoctorAppointmentById.mockResolvedValue({
        appointment_status: "pending",
        patient_id: 2,
        first_name: "Pat",
        last_name: "Ient",
        patient_name_on_prescription: "Pat Ient",
        appointment_date: "2024-01-01",
        appointment_time: "10:00",
      });
      dbObject.approveDoctorAppointmentById.mockResolvedValue({});
      patientsRepo.getPatientById.mockResolvedValue({ mobile_number: "123" });
      smsUtils.appointmentApprovalSms.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");
      const result = await doctorAppointmentsService.approveDoctorAppointment({
        userId: 1,
        appointmentId: 2,
      });
      expect(result).toBe("success");
      expect(smsUtils.appointmentApprovalSms).toHaveBeenCalled();
    });
  });

  describe("startDoctorAppointment", () => {
    it("should return BAD_REQUEST if doctor not found", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue(null);
      Response.BAD_REQUEST.mockReturnValue("bad_request");
      const result = await doctorAppointmentsService.startDoctorAppointment({
        userId: 1,
        appointmentId: 2,
      });
      expect(result).toBe("bad_request");
    });

    it("should return BAD_REQUEST if appointment not found", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      dbObject.getDoctorAppointmentById.mockResolvedValue(null);
      Response.BAD_REQUEST.mockReturnValue("bad_request");
      const result = await doctorAppointmentsService.startDoctorAppointment({
        userId: 1,
        appointmentId: 2,
      });
      expect(result).toBe("bad_request");
    });

    it("should return BAD_REQUEST if patient not found", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      dbObject.getDoctorAppointmentById.mockResolvedValue({
        appointment_uuid: "uuid",
        patient_id: 2,
      });
      patientsRepo.getPatientById.mockResolvedValue(null);
      Response.BAD_REQUEST.mockReturnValue("bad_request");
      const result = await doctorAppointmentsService.startDoctorAppointment({
        userId: 1,
        appointmentId: 2,
      });
      expect(result).toBe("bad_request");
    });

    it("should start appointment and create stream call", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      dbObject.getDoctorAppointmentById.mockResolvedValue({
        appointment_uuid: "uuid",
        patient_id: 2,
      });
      patientsRepo.getPatientById.mockResolvedValue({ user_id: 3 });
      streamUtils.createStreamCall.mockResolvedValue();
      dbObject.updateDoctorAppointmentStartTime.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");
      const result = await doctorAppointmentsService.startDoctorAppointment({
        userId: 1,
        appointmentId: 2,
      });
      expect(result).toBe("success");
      expect(streamUtils.createStreamCall).toHaveBeenCalled();
    });
  });

  describe("endDoctorAppointment", () => {
    it("should return UNAUTHORIZED if doctor not found", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue(null);
      Response.UNAUTHORIZED.mockReturnValue("unauthorized");
      const result = await doctorAppointmentsService.endDoctorAppointment({
        userId: 1,
        appointmentId: 2,
      });
      expect(result).toBe("unauthorized");
    });

    it("should return NOT_FOUND if appointment not found", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      dbObject.getDoctorAppointmentById.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result = await doctorAppointmentsService.endDoctorAppointment({
        userId: 1,
        appointmentId: 2,
      });
      expect(result).toBe("not_found");
    });

    it("should return NOT_MODIFIED if already completed", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      dbObject.getDoctorAppointmentById.mockResolvedValue({
        appointment_status: "completed",
      });
      Response.NOT_MODIFIED.mockReturnValue("not_modified");
      const result = await doctorAppointmentsService.endDoctorAppointment({
        userId: 1,
        appointmentId: 2,
      });
      expect(result).toBe("not_modified");
    });

    it("should end appointment and send sms", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({
        doctor_id: 1,
        first_name: "Doc",
        last_name: "Tor",
      });
      dbObject.getDoctorAppointmentById.mockResolvedValue({
        appointment_status: "started",
        patient_id: 2,
        first_name: "Pat",
        last_name: "Ient",
      });
      patientsRepo.getPatientById.mockResolvedValue({ mobile_number: "123" });
      dbObject.updateDoctorAppointmentEndTime.mockResolvedValue();
      smsUtils.appointmentEndedSms.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");
      const result = await doctorAppointmentsService.endDoctorAppointment({
        userId: 1,
        appointmentId: 2,
      });
      expect(result).toBe("success");
      expect(smsUtils.appointmentEndedSms).toHaveBeenCalled();
    });
  });

  describe("cancelDoctorAppointment", () => {
    it("should return NOT_FOUND if user not found", async () => {
      usersRepo.getUserById.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result = await doctorAppointmentsService.cancelDoctorAppointment({
        userId: 1,
        appointmentId: 2,
      });
      expect(result).toBe("not_found");
    });

    it("should return UNAUTHORIZED if user is not doctor", async () => {
      usersRepo.getUserById.mockResolvedValue({ user_type: "PATIENT" });
      Response.UNAUTHORIZED.mockReturnValue("unauthorized");
      const result = await doctorAppointmentsService.cancelDoctorAppointment({
        userId: 1,
        appointmentId: 2,
      });
      expect(result).toBe("unauthorized");
    });

    it("should return NOT_FOUND if doctor not found", async () => {
      usersRepo.getUserById.mockResolvedValue({
        user_type: enumUtils.USERTYPE.DOCTOR,
      });
      doctorsRepo.getDoctorByUserId.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result = await doctorAppointmentsService.cancelDoctorAppointment({
        userId: 1,
        appointmentId: 2,
      });
      expect(result).toBe("not_found");
    });

    it("should return UNAUTHORIZED if profile not approved", async () => {
      usersRepo.getUserById.mockResolvedValue({
        user_type: enumUtils.USERTYPE.DOCTOR,
      });
      doctorsRepo.getDoctorByUserId.mockResolvedValue({
        is_profile_approved: "PENDING",
      });
      Response.UNAUTHORIZED.mockReturnValue("unauthorized");
      const result = await doctorAppointmentsService.cancelDoctorAppointment({
        userId: 1,
        appointmentId: 2,
      });
      expect(result).toBe("unauthorized");
    });

    it("should return NOT_FOUND if appointment not found", async () => {
      usersRepo.getUserById.mockResolvedValue({
        user_type: enumUtils.USERTYPE.DOCTOR,
      });
      doctorsRepo.getDoctorByUserId.mockResolvedValue({
        is_profile_approved: enumUtils.VERIFICATIONSTATUS.VERIFIED,
        doctor_id: 1,
      });
      dbObject.getDoctorAppointmentById.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result = await doctorAppointmentsService.cancelDoctorAppointment({
        userId: 1,
        appointmentId: 2,
      });
      expect(result).toBe("not_found");
    });

    it("should return NOT_MODIFIED if already canceled", async () => {
      usersRepo.getUserById.mockResolvedValue({
        user_type: enumUtils.USERTYPE.DOCTOR,
      });
      doctorsRepo.getDoctorByUserId.mockResolvedValue({
        is_profile_approved: enumUtils.VERIFICATIONSTATUS.VERIFIED,
        doctor_id: 1,
      });
      dbObject.getDoctorAppointmentById.mockResolvedValue({
        appointment_status: "canceled",
      });
      Response.NOT_MODIFIED.mockReturnValue("not_modified");
      const result = await doctorAppointmentsService.cancelDoctorAppointment({
        userId: 1,
        appointmentId: 2,
      });
      expect(result).toBe("not_modified");
    });

    it("should return BAD_REQUEST if cancel fails", async () => {
      usersRepo.getUserById.mockResolvedValue({
        user_type: enumUtils.USERTYPE.DOCTOR,
      });
      doctorsRepo.getDoctorByUserId.mockResolvedValue({
        is_profile_approved: enumUtils.VERIFICATIONSTATUS.VERIFIED,
        doctor_id: 1,
      });
      dbObject.getDoctorAppointmentById.mockResolvedValue({
        appointment_status: "pending",
      });
      dbObject.cancelDoctorAppointmentById.mockResolvedValue({
        affectedRows: 0,
      });
      Response.BAD_REQUEST.mockReturnValue("bad_request");
      const result = await doctorAppointmentsService.cancelDoctorAppointment({
        userId: 1,
        appointmentId: 2,
      });
      expect(result).toBe("bad_request");
    });

    it("should cancel appointment and return SUCCESS", async () => {
      usersRepo.getUserById.mockResolvedValue({
        user_type: enumUtils.USERTYPE.DOCTOR,
      });
      doctorsRepo.getDoctorByUserId.mockResolvedValue({
        is_profile_approved: enumUtils.VERIFICATIONSTATUS.VERIFIED,
        doctor_id: 1,
      });
      dbObject.getDoctorAppointmentById.mockResolvedValue({
        appointment_status: "pending",
      });
      dbObject.cancelDoctorAppointmentById.mockResolvedValue({
        affectedRows: 1,
      });
      Response.SUCCESS.mockReturnValue("success");
      const result = await doctorAppointmentsService.cancelDoctorAppointment({
        userId: 1,
        appointmentId: 2,
      });
      expect(result).toBe("success");
    });
  });

  describe("postponeDoctorAppointment", () => {
    it("should return NOT_FOUND if user not found", async () => {
      usersRepo.getUserById.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result = await doctorAppointmentsService.postponeDoctorAppointment({
        userId: 1,
        appointmentId: 2,
      });
      expect(result).toBe("not_found");
    });

    it("should return UNAUTHORIZED if user is not doctor", async () => {
      usersRepo.getUserById.mockResolvedValue({ user_type: "PATIENT" });
      Response.UNAUTHORIZED.mockReturnValue("unauthorized");
      const result = await doctorAppointmentsService.postponeDoctorAppointment({
        userId: 1,
        appointmentId: 2,
      });
      expect(result).toBe("unauthorized");
    });

    it("should return UNAUTHORIZED if doctor not found", async () => {
      usersRepo.getUserById.mockResolvedValue({
        user_type: enumUtils.USERTYPE.DOCTOR,
      });
      doctorsRepo.getDoctorByUserId.mockResolvedValue(null);
      Response.UNAUTHORIZED.mockReturnValue("unauthorized");
      const result = await doctorAppointmentsService.postponeDoctorAppointment({
        userId: 1,
        appointmentId: 2,
      });
      expect(result).toBe("unauthorized");
    });

    it("should return NOT_FOUND if appointment not found", async () => {
      usersRepo.getUserById.mockResolvedValue({
        user_type: enumUtils.USERTYPE.DOCTOR,
      });
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      dbObject.getDoctorAppointmentById.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result = await doctorAppointmentsService.postponeDoctorAppointment({
        userId: 1,
        appointmentId: 2,
      });
      expect(result).toBe("not_found");
    });

    it("should return NOT_MODIFIED if already postponed", async () => {
      usersRepo.getUserById.mockResolvedValue({
        user_type: enumUtils.USERTYPE.DOCTOR,
      });
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      dbObject.getDoctorAppointmentById.mockResolvedValue({
        appointment_status: "postponed",
      });
      Response.NOT_MODIFIED.mockReturnValue("not_modified");
      const result = await doctorAppointmentsService.postponeDoctorAppointment({
        userId: 1,
        appointmentId: 2,
      });
      expect(result).toBe("not_modified");
    });

    it("should return BAD_REQUEST if time slot booked", async () => {
      usersRepo.getUserById.mockResolvedValue({
        user_type: enumUtils.USERTYPE.DOCTOR,
      });
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      dbObject.getDoctorAppointmentById.mockResolvedValue({
        appointment_status: "pending",
        patient_id: 2,
      });
      dbObject.getDoctorAppointByDateAndTime.mockResolvedValue(true);
      Response.BAD_REQUEST.mockReturnValue("bad_request");
      const result = await doctorAppointmentsService.postponeDoctorAppointment({
        userId: 1,
        appointmentId: 2,
        postponedDate: "2024-01-01",
        postponedTime: "10:00",
      });
      expect(result).toBe("bad_request");
    });

    it("should return BAD_REQUEST if postpone fails", async () => {
      usersRepo.getUserById.mockResolvedValue({
        user_type: enumUtils.USERTYPE.DOCTOR,
      });
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      dbObject.getDoctorAppointmentById.mockResolvedValue({
        appointment_status: "pending",
        patient_id: 2,
      });
      dbObject.getDoctorAppointByDateAndTime.mockResolvedValue(false);
      patientsRepo.getPatientById.mockResolvedValue({ mobile_number: "123" });
      dbObject.postponeDoctorAppointmentById.mockResolvedValue({
        affectedRows: 0,
      });
      Response.BAD_REQUEST.mockReturnValue("bad_request");
      const result = await doctorAppointmentsService.postponeDoctorAppointment({
        userId: 1,
        appointmentId: 2,
        postponedDate: "2024-01-01",
        postponedTime: "10:00",
      });
      expect(result).toBe("bad_request");
    });

    it("should postpone appointment and send sms", async () => {
      usersRepo.getUserById.mockResolvedValue({
        user_type: enumUtils.USERTYPE.DOCTOR,
      });
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      dbObject.getDoctorAppointmentById.mockResolvedValue({
        appointment_status: "pending",
        patient_id: 2,
        patient_name_on_prescription: "Pat Ient",
        first_name: "Pat",
        last_name: "Ient",
        doctor_first_name: "Doc",
        doctor_last_name: "Tor",
      });
      dbObject.getDoctorAppointByDateAndTime.mockResolvedValue(false);
      patientsRepo.getPatientById.mockResolvedValue({ mobile_number: "123" });
      dbObject.postponeDoctorAppointmentById.mockResolvedValue({
        affectedRows: 1,
      });
      smsUtils.appointmentPostponedSms.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");
      const result = await doctorAppointmentsService.postponeDoctorAppointment({
        userId: 1,
        appointmentId: 2,
        postponedDate: "2024-01-01",
        postponedTime: "10:00",
      });
      expect(result).toBe("success");
      expect(smsUtils.appointmentPostponedSms).toHaveBeenCalled();
    });
  });
});
