const patientsAppointmentsService = require("../../../../src/services/patients/patients.appointments.services");
const repo = require("../../../../src/repository/patientAppointments.repository");
const patientsRepo = require("../../../../src/repository/patients.repository");
const followUpRepo = require("../../../../src/repository/follow-up.repository");
const Response = require("../../../../src/utils/response.utils");
const { redisClient } = require("../../../../src/config/redis.config");
const helper = require("../../../../src/utils/helpers.utils");

jest.mock("../../../../src/repository/patientAppointments.repository");
jest.mock("../../../../src/repository/follow-up.repository");
jest.mock("../../../../src/repository/patients.repository");
jest.mock("../../../../src/repository/doctors.repository");
jest.mock("../../../../src/repository/doctorAppointments.repository");
jest.mock("../../../../src/utils/response.utils");
jest.mock("../../../../src/config/redis.config");
jest.mock("../../../../src/utils/auth.utils");
jest.mock("../../../../src/utils/time.utils");
jest.mock("../../../../src/utils/payment.utils");
jest.mock("../../../../src/utils/caching.utils");
jest.mock("../../../../src/utils/db-mapper.utils");
jest.mock("../../../../src/utils/helpers.utils");

describe("patients.appointments.services", () => {
  beforeAll(() => {
    jest.spyOn(Response, "SUCCESS").mockImplementation((data) => data);
    jest.spyOn(Response, "NOT_FOUND").mockImplementation((data) => data);
    jest.spyOn(Response, "BAD_REQUEST").mockImplementation((data) => data);
    jest.spyOn(Response, "CREATED").mockImplementation((data) => data);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getPatientAppointmentMetrics", () => {
    it("should return NOT_FOUND if patient profile does not exist", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({});
      Response.NOT_FOUND.mockReturnValue({ status: 404 });

      const result =
        await patientsAppointmentsService.getPatientAppointmentMetrics("user1");
      expect(result.status).toBe(404);
      expect(Response.NOT_FOUND).toHaveBeenCalled();
    });

    it("should return cached metrics if available", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: "p1" });
      redisClient.get.mockResolvedValue(JSON.stringify({ count: 5 }));
      Response.SUCCESS.mockReturnValue({ status: 200, data: { count: 5 } });

      const result =
        await patientsAppointmentsService.getPatientAppointmentMetrics("user1");
      expect(result.data.count).toBe(5);
      expect(redisClient.get).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalled();
    });

    it("should fetch metrics and cache if not cached", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: "p1" });
      redisClient.get.mockResolvedValue(null);
      repo.getPatientAppointmentsDashboardCount.mockResolvedValue({
        count: 10,
      });
      Response.SUCCESS.mockReturnValue({ status: 200, data: { count: 10 } });

      const result =
        await patientsAppointmentsService.getPatientAppointmentMetrics("user1");
      expect(result.data.count).toBe(10);
      expect(redisClient.set).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalled();
    });
  });

  describe("getPatientFollowUpMetrics", () => {
    it("should return NOT_FOUND if patient profile does not exist", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({});
      Response.NOT_FOUND.mockReturnValue({ status: 404 });

      const result =
        await patientsAppointmentsService.getPatientFollowUpMetrics("user1");
      expect(result.status).toBe(404);
      expect(Response.NOT_FOUND).toHaveBeenCalled();
    });

    it("should return cached follow-up metrics if available", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: "p1" });
      redisClient.get.mockResolvedValue(JSON.stringify({ followUps: 2 }));
      Response.SUCCESS.mockReturnValue({ status: 200, data: { followUps: 2 } });

      const result =
        await patientsAppointmentsService.getPatientFollowUpMetrics("user1");
      expect(result.data.followUps).toBe(2);
      expect(redisClient.get).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalled();
    });

    it("should fetch follow-up metrics and cache if not cached", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: "p1" });
      redisClient.get.mockResolvedValue(null);
      followUpRepo.countPatientFollowUp.mockResolvedValue({ followUps: 3 });
      Response.SUCCESS.mockReturnValue({ status: 200, data: { followUps: 3 } });

      const result =
        await patientsAppointmentsService.getPatientFollowUpMetrics("user1");
      expect(result.data.followUps).toBe(3);
      expect(redisClient.set).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalled();
    });
  });

  describe("getPatientAppointments", () => {
    it("should return NOT_FOUND if patient profile does not exist", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({});
      Response.NOT_FOUND.mockReturnValue({ status: 404 });

      const result = await patientsAppointmentsService.getPatientAppointments(
        "user1",
        10,
        1,
      );
      expect(result.status).toBe(404);
      expect(Response.NOT_FOUND).toHaveBeenCalled();
    });

    it("should return SUCCESS with empty data if no appointments found", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: "p1" });
      repo.countPatientAppointments.mockResolvedValue(0);
      Response.SUCCESS.mockReturnValue({ status: 200, data: [] });

      const result = await patientsAppointmentsService.getPatientAppointments(
        "user1",
        10,
        1,
      );
      expect(result.data).toEqual([]);
      expect(Response.SUCCESS).toHaveBeenCalled();
    });

    it("should return cached appointments if available", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: "p1" });
      repo.countPatientAppointments.mockResolvedValue(2);
      redisClient.get.mockImplementation(async () =>
        JSON.stringify([{ id: 1 }, { id: 2 }]),
      );
      Response.SUCCESS.mockReturnValue({
        status: 200,
        data: [{ id: 1 }, { id: 2 }],
        pagination: {},
      });

      const result = await patientsAppointmentsService.getPatientAppointments(
        "user1",
        10,
        1,
      );
      expect(result.data.length).toBe(2);
      expect(Response.SUCCESS).toHaveBeenCalled();
    });
  });

  describe("getPatientAppointment", () => {
    it("should return NOT_FOUND if patient profile does not exist", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue({ status: 404 });

      const result = await patientsAppointmentsService.getPatientAppointment({
        userId: "user1",
        id: 1,
      });
      expect(result.status).toBe(404);
      expect(Response.NOT_FOUND).toHaveBeenCalled();
    });

    it("should return cached appointment if available", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: "p1" });
      redisClient.get.mockResolvedValue(JSON.stringify({ appointmentId: 1 }));
      Response.SUCCESS.mockReturnValue({
        status: 200,
        data: { appointmentId: 1 },
      });

      const result = await patientsAppointmentsService.getPatientAppointment({
        userId: "user1",
        id: 1,
      });
      expect(result.data.appointmentId).toBe(1);
      expect(redisClient.get).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalled();
    });

    it("should return NOT_FOUND if appointment not found", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: "p1" });
      redisClient.get.mockResolvedValue(null);
      repo.getPatientAppointmentById.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue({ status: 404 });

      const result = await patientsAppointmentsService.getPatientAppointment({
        userId: "user1",
        id: 1,
      });
      expect(result.status).toBe(404);
      expect(Response.NOT_FOUND).toHaveBeenCalled();
    });
  });

  describe("getPatientAppointmentByUUID", () => {
    it("should return NOT_FOUND if patient profile does not exist", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue({ status: 404 });

      const result =
        await patientsAppointmentsService.getPatientAppointmentByUUID({
          userId: "user1",
          uuId: "uuid1",
        });
      expect(result.status).toBe(404);
      expect(Response.NOT_FOUND).toHaveBeenCalled();
    });

    it("should return cached appointment if available", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: "p1" });
      redisClient.get.mockResolvedValue(JSON.stringify({ uuid: "uuid1" }));
      Response.SUCCESS.mockReturnValue({
        status: 200,
        data: { uuid: "uuid1" },
      });

      const result =
        await patientsAppointmentsService.getPatientAppointmentByUUID({
          userId: "user1",
          uuId: "uuid1",
        });
      expect(result.data.uuid).toBe("uuid1");
      expect(redisClient.get).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalled();
    });

    it("should return NOT_FOUND if appointment not found", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: "p1" });
      redisClient.get.mockResolvedValue(null);
      repo.getPatientAppointmentByUUID.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue({ status: 404 });

      const result =
        await patientsAppointmentsService.getPatientAppointmentByUUID({
          userId: "user1",
          uuId: "uuid1",
        });
      expect(result.status).toBe(404);
      expect(Response.NOT_FOUND).toHaveBeenCalled();
    });

    it("should return NOT_FOUND if appointment not found by UUID", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: "p1" });
      redisClient.get.mockResolvedValue(null);
      repo.getPatientAppointmentByUUID.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue({ status: 404 });

      const result =
        await patientsAppointmentsService.getPatientAppointmentByUUID({
          userId: "user1",
          uuId: "uuid1",
        });
      expect(result.status).toBe(404);
      expect(Response.NOT_FOUND).toHaveBeenCalled();
    });

    it("should cache and return appointment found by UUID", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: "p1" });
      redisClient.get.mockResolvedValue(null);
      repo.getPatientAppointmentByUUID.mockResolvedValue({ uuid: "uuid2" });
      Response.SUCCESS.mockReturnValue({
        status: 200,
        data: { uuid: "uuid2" },
      });

      const result =
        await patientsAppointmentsService.getPatientAppointmentByUUID({
          userId: "user1",
          uuId: "uuid2",
        });
      expect(result.data.uuid).toBe("uuid2");
      expect(redisClient.set).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalled();
    });
  });

  describe("createPatientAppointment", () => {
    it("should create a first-time appointment", async () => {
      helper.validateEntities.mockResolvedValue({
        patient: { booked_first_appointment: false, patient_id: "p1" },
        doctor: { doctor_id: "d1", consultation_fee: 100 },
      });
      helper.checkIdempotency.mockResolvedValue({ error: null });

      helper.createAppointment.mockResolvedValue({
        id: 1,
        patientId: "p1",
        doctorId: "d1",
        consultationFee: 100,
      });

      helper.processFirstAppointment.mockResolvedValue({
        message: "First appointment booked",
      });

      const result = await patientsAppointmentsService.createPatientAppointment(
        {
          userId: "u1",
          doctorId: "d1",
          patientName: "John",
          patientNumber: "123",
          appointmentType: "consultation",
          appointmentDate: "2025-08-22",
          appointmentTime: "10:00",
          symptoms: "cough",
          specialtyId: "s1",
        },
      );
      expect(helper.validateEntities).toHaveBeenCalled();
      expect(helper.checkIdempotency).toHaveBeenCalled();
      expect(helper.createAppointment).toHaveBeenCalled();
      expect(helper.processFirstAppointment).toHaveBeenCalled();
      expect(result).toEqual({ message: "First appointment booked" });
    });

    it("should create a regular appointment", async () => {
      helper.validateEntities.mockResolvedValue({
        patient: { booked_first_appointment: true, patient_id: "p1" },
        doctor: { doctor_id: "d1", consultation_fee: 100 },
      });
      helper.checkIdempotency.mockResolvedValue({ error: null });
      helper.createAppointment.mockResolvedValue({
        id: 2,
        patientId: "p1",
        doctorId: "d1",
        consultationFee: 100,
      });
      helper.processRegularAppointment.mockResolvedValue({
        message: "Regular appointment booked",
      });

      const result = await patientsAppointmentsService.createPatientAppointment(
        {
          userId: "u1",
          doctorId: "d1",
          patientName: "Jane",
          patientNumber: "456",
          appointmentType: "consultation",
          appointmentDate: "2025-08-23",
          appointmentTime: "11:00",
          symptoms: "fever",
          specialtyId: "s2",
        },
      );

      expect(helper.validateEntities).toHaveBeenCalled();
      expect(helper.checkIdempotency).toHaveBeenCalled();
      expect(helper.createAppointment).toHaveBeenCalled();
      expect(helper.processRegularAppointment).toHaveBeenCalled();
      expect(result).toEqual({ message: "Regular appointment booked" });
    });

    it("should return validation error", async () => {
      helper.validateEntities.mockResolvedValue({
        error: { message: "Validation failed" },
      });

      const result = await patientsAppointmentsService.createPatientAppointment(
        {
          userId: "u1",
          doctorId: "d1",
        },
      );

      expect(helper.validateEntities).toHaveBeenCalled();
      expect(result).toEqual({ message: "Validation failed" });
    });

    it("should return idempotency error", async () => {
      helper.validateEntities.mockResolvedValue({
        patient: { booked_first_appointment: true, patient_id: "p1" },
        doctor: { doctor_id: "d1", consultation_fee: 100 },
      });
      helper.checkIdempotency.mockResolvedValue({
        error: { message: "Duplicate request" },
      });

      const result = await patientsAppointmentsService.createPatientAppointment(
        {
          userId: "u1",
          doctorId: "d1",
          patientName: "Jane",
        },
      );

      expect(helper.validateEntities).toHaveBeenCalled();
      expect(helper.checkIdempotency).toHaveBeenCalled();
      expect(result).toEqual({ message: "Duplicate request" });
    });
  });
});
