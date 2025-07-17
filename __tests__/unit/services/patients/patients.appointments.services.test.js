const patientsAppointmentsService = require("../../../../src/services/patients/patients.appointments.services");
const repo = require("../../../../src/repository/patientAppointments.repository");
const patientsRepo = require("../../../../src/repository/patients.repository");
const doctorAppointmentsRepo = require("../../../../src/repository/doctorAppointments.repository");
const doctorsRepo = require("../../../../src/repository/doctors.repository");
const paymentsRepo = require("../../../../src/repository/payments.repository");
const followUpRepo = require("../../../../src/repository/follow-up.repository");
const Response = require("../../../../src/utils/response.utils");
const smsUtils = require("../../../../src/utils/sms.utils");
const paymentUtils = require("../../../../src/utils/payment.utils");
const dbMapper = require("../../../../src/utils/db-mapper.utils");
const cachingUtils = require("../../../../src/utils/caching.utils");
const logger = require("../../../../src/middlewares/logger.middleware");
const { redisClient } = require("../../../../src/config/redis.config");

jest.mock("../../../../src/repository/patientAppointments.repository");
jest.mock("../../../../src/repository/patients.repository");
jest.mock("../../../../src/repository/doctorAppointments.repository");
jest.mock("../../../../src/repository/doctors.repository");
jest.mock("../../../../src/repository/payments.repository");
jest.mock("../../../../src/repository/follow-up.repository");
jest.mock("../../../../src/utils/response.utils");
jest.mock("../../../../src/utils/sms.utils");
jest.mock("../../../../src/utils/payment.utils");
jest.mock("../../../../src/utils/db-mapper.utils");
jest.mock("../../../../src/utils/caching.utils");
jest.mock("../../../../src/middlewares/logger.middleware");
jest.mock("../../../../src/config/redis.config", () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

describe("patients.appointments.services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPatientAppointments", () => {
    it("should return NOT_FOUND if patient does not exist", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result = await patientsAppointmentsService.getPatientAppointments(
        "user1",
        10,
        0,
        {},
      );
      expect(result).toBe("not_found");
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should return cached data if present", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: 1 });
      cachingUtils.cacheKeyBulider.mockReturnValue("cache-key");
      redisClient.get.mockResolvedValue(JSON.stringify([{ id: 1 }]));
      Response.SUCCESS.mockReturnValue("success");
      const result = await patientsAppointmentsService.getPatientAppointments(
        "user1",
        10,
        0,
        {},
      );
      expect(result).toBe("success");
      expect(redisClient.get).toHaveBeenCalledWith("cache-key");
    });

    it("should return NOT_FOUND if no appointments found", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: 1 });
      cachingUtils.cacheKeyBulider.mockReturnValue("cache-key");
      redisClient.get.mockResolvedValue(null);
      repo.getAllPatientAppointments.mockResolvedValue([]);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result = await patientsAppointmentsService.getPatientAppointments(
        "user1",
        10,
        0,
        {},
      );
      expect(result).toBe("not_found");
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should return appointments and cache them", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: 1 });
      cachingUtils.cacheKeyBulider.mockReturnValue("cache-key");
      redisClient.get.mockResolvedValue(null);
      repo.getAllPatientAppointments.mockResolvedValue([{ id: 1 }]);
      dbMapper.mapPatientAppointment.mockReturnValue({ id: 1, mapped: true });
      Response.SUCCESS.mockReturnValue("success");
      const result = await patientsAppointmentsService.getPatientAppointments(
        "user1",
        10,
        0,
        {},
      );
      expect(result).toBe("success");
      expect(redisClient.set).toHaveBeenCalled();
    });
  });

  describe("getPatientAppointment", () => {
    it("should return NOT_FOUND if patient does not exist", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result = await patientsAppointmentsService.getPatientAppointment({
        userId: "user1",
        id: 1,
      });
      expect(result).toBe("not_found");
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should return cached appointment if present", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: 1 });
      redisClient.get.mockResolvedValue(JSON.stringify({ id: 1 }));
      Response.SUCCESS.mockReturnValue("success");
      const result = await patientsAppointmentsService.getPatientAppointment({
        userId: "user1",
        id: 1,
      });
      expect(result).toBe("success");
      expect(redisClient.get).toHaveBeenCalled();
    });

    it("should return NOT_FOUND if appointment not found", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: 1 });
      redisClient.get.mockResolvedValue(null);
      repo.getPatientAppointmentById.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result = await patientsAppointmentsService.getPatientAppointment({
        userId: "user1",
        id: 1,
      });
      expect(result).toBe("not_found");
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should return appointment with followUps and cache it", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: 1 });
      redisClient.get.mockResolvedValue(null);
      repo.getPatientAppointmentById.mockResolvedValue({ id: 1 });
      dbMapper.mapPatientAppointment.mockReturnValue({ appointmentId: 1 });
      followUpRepo.getAppointmentFollowUps.mockResolvedValue([{ follow: 1 }]);
      dbMapper.mapFollowUpsRow.mockReturnValue({ mapped: true });
      Response.SUCCESS.mockReturnValue("success");
      const result = await patientsAppointmentsService.getPatientAppointment({
        userId: "user1",
        id: 1,
      });
      expect(result).toBe("success");
      expect(redisClient.set).toHaveBeenCalled();
    });
  });

  describe("getPatientAppointmentByUUID", () => {
    it("should return NOT_FOUND if patient does not exist", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result =
        await patientsAppointmentsService.getPatientAppointmentByUUID({
          userId: "user1",
          uuId: "uuid",
        });
      expect(result).toBe("not_found");
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should return cached appointment if present", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: 1 });
      redisClient.get.mockResolvedValue(JSON.stringify({ id: 1 }));
      Response.SUCCESS.mockReturnValue("success");
      const result =
        await patientsAppointmentsService.getPatientAppointmentByUUID({
          userId: "user1",
          uuId: "uuid",
        });
      expect(result).toBe("success");
      expect(redisClient.get).toHaveBeenCalled();
    });

    it("should return NOT_FOUND if appointment not found", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: 1 });
      redisClient.get.mockResolvedValue(null);
      repo.getPatientAppointmentByUUID.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result =
        await patientsAppointmentsService.getPatientAppointmentByUUID({
          userId: "user1",
          uuId: "uuid",
        });
      expect(result).toBe("not_found");
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should return appointment and cache it", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: 1 });
      redisClient.get.mockResolvedValue(null);
      repo.getPatientAppointmentByUUID.mockResolvedValue({ id: 1 });
      dbMapper.mapPatientAppointment.mockReturnValue({ id: 1, mapped: true });
      Response.SUCCESS.mockReturnValue("success");
      const result =
        await patientsAppointmentsService.getPatientAppointmentByUUID({
          userId: "user1",
          uuId: "uuid",
        });
      expect(result).toBe("success");
      expect(redisClient.set).toHaveBeenCalled();
    });
  });

  describe("createPatientAppointment", () => {
    it("should return BAD_REQUEST if patient does not exist", async () => {
      patientsRepo.getPatientByUserId.mockRejectedValue(new Error("not found"));
      doctorsRepo.getDoctorById.mockResolvedValue({}); // dummy
      doctorAppointmentsRepo.getDoctorAppointByDateAndTime.mockResolvedValue(
        null,
      );
      Response.BAD_REQUEST.mockReturnValue("bad_request");
      const result = await patientsAppointmentsService.createPatientAppointment(
        {
          userId: "user1",
          doctorId: 1,
          patientName: "John",
          patientNumber: "123",
          appointmentType: "type",
          appointmentDate: "2024-01-01",
          appointmentTime: "10:00",
          symptoms: "cough",
          specialtyId: 1,
        },
      );
      expect(result).toBe("bad_request");
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should return BAD_REQUEST if doctor does not exist", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({});
      doctorsRepo.getDoctorById.mockRejectedValue(new Error("not found"));
      doctorAppointmentsRepo.getDoctorAppointByDateAndTime.mockResolvedValue(
        null,
      );
      Response.BAD_REQUEST.mockReturnValue("bad_request");
      const result = await patientsAppointmentsService.createPatientAppointment(
        {
          userId: "user1",
          doctorId: 1,
          patientName: "John",
          patientNumber: "123",
          appointmentType: "type",
          appointmentDate: "2024-01-01",
          appointmentTime: "10:00",
          symptoms: "cough",
          specialtyId: 1,
        },
      );
      expect(result).toBe("bad_request");
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should return BAD_REQUEST if appointment time is already booked", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({});
      doctorsRepo.getDoctorById.mockResolvedValue({});
      doctorAppointmentsRepo.getDoctorAppointByDateAndTime.mockResolvedValue(
        {},
      );
      Response.BAD_REQUEST.mockReturnValue("bad_request");
      const result = await patientsAppointmentsService.createPatientAppointment(
        {
          userId: "user1",
          doctorId: 1,
          patientName: "John",
          patientNumber: "123",
          appointmentType: "type",
          appointmentDate: "2024-01-01",
          appointmentTime: "10:00",
          symptoms: "cough",
          specialtyId: 1,
        },
      );
      expect(result).toBe("bad_request");
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should return INTERNAL_SERVER_ERROR if appointment creation fails", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({
        patient_id: 1,
        first_name: "John",
        last_name: "Doe",
        booked_first_appointment: false,
        mobile_number: "123",
      });
      doctorsRepo.getDoctorById.mockResolvedValue({
        consultation_fee: 100,
        first_name: "Doc",
        last_name: "Tor",
        mobile_number: "456",
      });
      doctorAppointmentsRepo.getDoctorAppointByDateAndTime.mockResolvedValue(
        null,
      );
      repo.createNewPatientAppointment.mockResolvedValue({ insertId: null });
      Response.INTERNAL_SERVER_ERROR.mockReturnValue("internal_server_error");
      const result = await patientsAppointmentsService.createPatientAppointment(
        {
          userId: "user1",
          doctorId: 1,
          patientName: "John",
          patientNumber: "123",
          appointmentType: "type",
          appointmentDate: "2024-01-01",
          appointmentTime: "10:00",
          symptoms: "cough",
          specialtyId: 1,
        },
      );
      expect(result).toBe("internal_server_error");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should handle first free appointment booking", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({
        patient_id: 1,
        first_name: "John",
        last_name: "Doe",
        booked_first_appointment: false,
        mobile_number: "123",
      });
      doctorsRepo.getDoctorById.mockResolvedValue({
        consultation_fee: 100,
        first_name: "Doc",
        last_name: "Tor",
        mobile_number: "456",
      });
      doctorAppointmentsRepo.getDoctorAppointByDateAndTime.mockResolvedValue(
        null,
      );
      repo.createNewPatientAppointment.mockResolvedValue({ insertId: 2 });
      paymentsRepo.createFirstAppointmentPayment.mockResolvedValue({});
      patientsRepo.updatePatientFirstAppointmentStatus.mockResolvedValue({});
      smsUtils.appointmentBookedSms.mockResolvedValue({});
      smsUtils.doctorAppointmentBookedSms = jest.fn().mockResolvedValue({});
      Response.CREATED.mockReturnValue("created");
      const result = await patientsAppointmentsService.createPatientAppointment(
        {
          userId: "user1",
          doctorId: 1,
          patientName: "John",
          patientNumber: "123",
          appointmentType: "type",
          appointmentDate: "2024-01-01",
          appointmentTime: "10:00",
          symptoms: "cough",
          specialtyId: 1,
        },
      );
      expect(result).toBe("created");
    });

    it("should handle paid appointment booking", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({
        patient_id: 1,
        first_name: "John",
        last_name: "Doe",
        booked_first_appointment: true,
        mobile_number: "123",
      });
      doctorsRepo.getDoctorById.mockResolvedValue({
        consultation_fee: 100,
        first_name: "Doc",
        last_name: "Tor",
        mobile_number: "456",
      });
      doctorAppointmentsRepo.getDoctorAppointByDateAndTime.mockResolvedValue(
        null,
      );
      repo.createNewPatientAppointment.mockResolvedValue({ insertId: 2 });
      paymentUtils.getPaymentUSSD.mockResolvedValue({
        ussdCode: "ussd",
        paymentCodeId: "payid",
        idempotencyKey: "idem",
        expiresAt: "2024-01-01T00:00:00Z",
        cancelUrl: "cancel",
      });
      paymentsRepo.createAppointmentPayment.mockResolvedValue({ insertId: 3 });
      Response.CREATED.mockReturnValue("created");
      const result = await patientsAppointmentsService.createPatientAppointment(
        {
          userId: "user1",
          doctorId: 1,
          patientName: "John",
          patientNumber: "123",
          appointmentType: "type",
          appointmentDate: "2024-01-01",
          appointmentTime: "10:00",
          symptoms: "cough",
          specialtyId: 1,
        },
      );
      expect(result).toBe("created");
    });
  });
});
