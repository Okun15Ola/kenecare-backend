const doctorAppointmentsService = require("../../../../src/services/doctors/doctor.appointments.services");
const doctorAppointmentsRepo = require("../../../../src/repository/doctorAppointments.repository");
const doctorsRepo = require("../../../../src/repository/doctors.repository");
const patientsRepo = require("../../../../src/repository/patients.repository");
const redisClient = require("../../../../src/config/redis.config");
const smsUtils = require("../../../../src/utils/sms.utils");
const streamUtils = require("../../../../src/utils/stream.utils");
const caching = require("../../../../src/utils/caching.utils");

jest.mock("../../../../src/repository/doctorAppointments.repository");
jest.mock("../../../../src/repository/doctors.repository");
jest.mock("../../../../src/repository/users.repository");
jest.mock("../../../../src/repository/patients.repository");
jest.mock("../../../../src/repository/follow-up.repository");
jest.mock("../../../../src/config/redis.config");
jest.mock("../../../../src/utils/sms.utils");
jest.mock("../../../../src/utils/stream.utils");
jest.mock("../../../../src/utils/db-mapper.utils");
jest.mock("../../../../src/utils/caching.utils");

describe("Doctor Appointments Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getDoctorAppointments", () => {
    it("should return appointments from cache if available", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      const cachedData = [{ id: 1, patientName: "John Doe" }];
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));
      caching.cacheKeyBulider.mockReturnValue("cache-key");

      const result = await doctorAppointmentsService.getDoctorAppointments({
        userId: 1,
        limit: 10,
        offset: 0,
        paginationInfo: {},
      });
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalledWith("cache-key");
    });

    it("should return a 404 if doctor not found", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue(null);
      const result = await doctorAppointmentsService.getDoctorAppointments({
        userId: 1,
      });
      expect(result.statusCode).toBe(404);
    });
  });

  describe("approveDoctorAppointment", () => {
    it("should approve an appointment", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      doctorAppointmentsRepo.getDoctorAppointmentById.mockResolvedValue({
        patient_id: 1,
        appointment_status: "pending",
      });
      patientsRepo.getPatientById.mockResolvedValue({ mobile_number: "123" });
      smsUtils.appointmentApprovalSms.mockResolvedValue({});

      const result = await doctorAppointmentsService.approveDoctorAppointment({
        userId: 1,
        appointmentId: 1,
      });
      expect(result.statusCode).toBe(200);
    });

    it("should return a success message if appointment is already approved", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      doctorAppointmentsRepo.getDoctorAppointmentById.mockResolvedValue({
        appointment_status: "approved",
      });

      const result = await doctorAppointmentsService.approveDoctorAppointment({
        userId: 1,
        appointmentId: 1,
      });
      expect(result.message).toBe("Appointment has already been approved");
    });
  });

  describe("startDoctorAppointment", () => {
    it("should start an appointment", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      doctorAppointmentsRepo.getDoctorAppointmentById.mockResolvedValue({
        appointment_uuid: "uuid",
        patient_id: 1,
      });
      patientsRepo.getPatientById.mockResolvedValue({ user_id: 2 });
      streamUtils.createStreamCall.mockResolvedValue({});

      const result = await doctorAppointmentsService.startDoctorAppointment({
        userId: 1,
        appointmentId: 1,
      });
      expect(result.statusCode).toBe(200);
    });

    it("should return a 400 if doctor not found", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue(null);
      const result = await doctorAppointmentsService.startDoctorAppointment({
        userId: 1,
        appointmentId: 1,
      });
      expect(result.statusCode).toBe(400);
    });
  });
});
