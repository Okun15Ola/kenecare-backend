const patientAppointmentsService = require("../../../../src/services/patients/patients.appointments.services");

const patientAppointmentsRepo = require("../../../../src/repository/patientAppointments.repository");
const patientsRepo = require("../../../../src/repository/patients.repository");
const doctorsRepo = require("../../../../src/repository/doctors.repository");
const paymentsRepo = require("../../../../src/repository/payments.repository");
const doctorAppointmentsRepo = require("../../../../src/repository/doctorAppointments.repository");

const redisClient = require("../../../../src/config/redis.config");
const paymentUtils = require("../../../../src/utils/payment.utils");
const caching = require("../../../../src/utils/caching.utils");

jest.mock("../../../../src/repository/patientAppointments.repository");
jest.mock("../../../../src/repository/patients.repository");
jest.mock("../../../../src/repository/doctors.repository");
jest.mock("../../../../src/repository/payments.repository");
jest.mock("../../../../src/repository/doctorAppointments.repository");

jest.mock("../../../../src/config/redis.config");
jest.mock("../../../../src/utils/payment.utils");
jest.mock("../../../../src/utils/sms.utils");
jest.mock("../../../../src/utils/db-mapper.utils");
jest.mock("../../../../src/utils/caching.utils");

describe("Patient Appointments Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getPatientAppointments", () => {
    it("should return appointments from cache if available", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: 1 });
      const cachedData = [{ id: 1, doctorName: "Dr. Smith" }];
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));
      caching.cacheKeyBulider.mockReturnValue("cache-key");

      const result = await patientAppointmentsService.getPatientAppointments(
        1,
        10,
        0,
        {},
      );
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalledWith("cache-key");
    });

    it("should return a 404 if patient not found", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue(null);
      const result = await patientAppointmentsService.getPatientAppointments(
        1,
        10,
        0,
        {},
      );
      expect(result.statusCode).toBe(404);
    });
  });

  describe("createPatientAppointment", () => {
    it("should create a new appointment", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({
        patient_id: 1,
        booked_first_appointment: true,
      });
      doctorsRepo.getDoctorById.mockResolvedValue({ consultation_fee: 100 });
      doctorAppointmentsRepo.getDoctorAppointByDateAndTime.mockResolvedValue(
        null,
      );
      patientAppointmentsRepo.createNewPatientAppointment.mockResolvedValue({
        insertId: 1,
      });
      paymentUtils.getPaymentUSSD.mockResolvedValue({ ussdCode: "*123#" });
      paymentsRepo.createAppointmentPayment.mockResolvedValue({});

      const result = await patientAppointmentsService.createPatientAppointment({
        userId: 1,
        doctorId: 1,
      });
      expect(result.statusCode).toBe(201);
    });

    it("should return a 400 if patient profile does not exist", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue(null);
      const result = await patientAppointmentsService.createPatientAppointment({
        userId: 1,
      });
      expect(result.statusCode).toBe(400);
    });
  });
});
