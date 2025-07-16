const paymentService = require("../../../src/services/payment.services");
const patientAppointmentsRepo = require("../../../src/repository/patientAppointments.repository");
const paymentsRepo = require("../../../src/repository/payments.repository");
const patientsRepo = require("../../../src/repository/patients.repository");
const doctorsRepo = require("../../../src/repository/doctors.repository");
const doctorWalletRepo = require("../../../src/repository/doctor-wallet.repository");

jest.mock("../../../src/repository/patientAppointments.repository");
jest.mock("../../../src/repository/payments.repository");
jest.mock("../../../src/repository/patients.repository");
jest.mock("../../../src/repository/doctors.repository");
jest.mock("../../../src/repository/doctor-wallet.repository");
jest.mock("../../../src/utils/sms.utils");
jest.mock("../../../src/utils/notification.utils");
jest.mock("../../../src/utils/payment.utils");

describe("Payment Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("processAppointmentPayment", () => {
    it("should process a successful payment", async () => {
      patientAppointmentsRepo.getAppointmentByUUID.mockResolvedValue({
        appointment_id: 1,
        patient_id: 1,
        doctor_id: 1,
      });
      paymentsRepo.getAppointmentPaymentByAppointmentId.mockResolvedValue({
        payment_id: 1,
        amount_paid: 100,
        payment_status: "pending",
      });
      doctorWalletRepo.getCurrentWalletBalance.mockResolvedValue({
        balance: 500,
      });
      doctorsRepo.getDoctorById.mockResolvedValue({
        mobile_number: "123",
        notification_token: "token",
      });
      patientsRepo.getPatientById.mockResolvedValue({
        mobile_number: "456",
        notification_token: "token2",
      });

      const result = await paymentService.processAppointmentPayment({
        consultationId: "uuid",
        referrer: "kenecare.com",
        transactionId: "txn123",
        paymentEventStatus: "success",
      });

      expect(result.statusCode).toBe(200);
      expect(paymentsRepo.updateAppointmentPaymentStatus).toHaveBeenCalled();
      expect(doctorWalletRepo.updateDoctorWalletBalance).toHaveBeenCalled();
    });

    it("should return a 400 for an invalid referrer", async () => {
      const result = await paymentService.processAppointmentPayment({
        referrer: "invalid",
      });
      expect(result.statusCode).toBe(400);
    });
  });

  describe("cancelAppointmentPayment", () => {
    it("should cancel a payment", async () => {
      patientAppointmentsRepo.getAppointmentByUUID.mockResolvedValue({
        appointment_id: 1,
      });
      paymentsRepo.getAppointmentPaymentByAppointmentId.mockResolvedValue({
        transaction_id: null,
        payment_status: "pending",
      });
      paymentsRepo.deleteAppointmentPaymentByAppointmentId.mockResolvedValue({
        affectedRows: 1,
      });
      patientAppointmentsRepo.deleteAppointmentById.mockResolvedValue({
        affectedRows: 1,
      });

      const result = await paymentService.cancelAppointmentPayment({
        consultationId: "uuid",
        referrer: "kenecare.com",
      });

      expect(result.statusCode).toBe(200);
      expect(patientAppointmentsRepo.deleteAppointmentById).toHaveBeenCalled();
      expect(
        paymentsRepo.deleteAppointmentPaymentByAppointmentId,
      ).toHaveBeenCalled();
    });

    it("should return a 204 if payment is already successful", async () => {
      patientAppointmentsRepo.getAppointmentByUUID.mockResolvedValue({
        appointment_id: 1,
      });
      paymentsRepo.getAppointmentPaymentByAppointmentId.mockResolvedValue({
        transaction_id: "txn123",
        payment_status: "success",
      });

      const result = await paymentService.cancelAppointmentPayment({
        consultationId: "uuid",
        referrer: "kenecare.com",
      });
      expect(result.statusCode).toBe(204);
    });
  });
});
