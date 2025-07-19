const paymentServices = require("../../../src/services/payment.services");
const {
  getPatientById,
} = require("../../../src/repository/patients.repository");
const { getDoctorById } = require("../../../src/repository/doctors.repository");
const {
  updateDoctorWalletBalance,
  getCurrentWalletBalance,
} = require("../../../src/repository/doctor-wallet.repository");
const { cancelPaymentUSSD } = require("../../../src/utils/payment.utils");
const {
  doctorAppointmentBookedSms,
  appointmentBookedSms,
} = require("../../../src/utils/sms.utils");
const Response = require("../../../src/utils/response.utils");

jest.mock("../../../src/repository/patientAppointments.repository");
jest.mock("../../../src/repository/payments.repository");
jest.mock("../../../src/repository/patients.repository");
jest.mock("../../../src/repository/doctors.repository");
jest.mock("../../../src/repository/doctor-wallet.repository");
jest.mock("../../../src/utils/payment.utils");
jest.mock("../../../src/middlewares/logger.middleware");
jest.mock("../../../src/utils/sms.utils");

const {
  getAppointmentByUUID,
  deleteAppointmentById,
} = require("../../../src/repository/patientAppointments.repository");
const {
  getAppointmentPaymentByAppointmentId,
  updateAppointmentPaymentStatus,
  deleteAppointmentPaymentByAppointmentId,
} = require("../../../src/repository/payments.repository");

describe("payment.services", () => {
  beforeAll(() => {
    jest.spyOn(Response, "SUCCESS").mockImplementation((data) => data);
    jest.spyOn(Response, "NOT_FOUND").mockImplementation((data) => data);
    jest.spyOn(Response, "BAD_REQUEST").mockImplementation((data) => data);
    jest.spyOn(Response, "CREATED").mockImplementation((data) => data);
    jest.spyOn(Response, "NO_CONTENT").mockImplementation((data) => data);
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("processAppointmentPayment", () => {
    const validParams = {
      consultationId: "valid-uuid",
      referrer: "kenecare.com",
      transactionId: "txn-123",
      paymentEventStatus: "success",
    };

    it("should return BAD_REQUEST if input is invalid", async () => {
      const result = await paymentServices.processAppointmentPayment({
        consultationId: null,
        referrer: "invalid.com",
        transactionId: "txn-123",
        paymentEventStatus: "success",
      });
      expect(result.statusCode).toBe(400);
    });

    it("should return NOT_FOUND if appointment does not exist", async () => {
      getAppointmentByUUID.mockResolvedValue(null);
      const result =
        await paymentServices.processAppointmentPayment(validParams);
      expect(result.statusCode).toBe(404);
    });

    it("should handle expired payment", async () => {
      getAppointmentByUUID.mockResolvedValue({ appointment_id: 1 });
      getAppointmentPaymentByAppointmentId.mockResolvedValue({
        payment_status: "expired",
      });
      deleteAppointmentPaymentByAppointmentId.mockResolvedValue({});
      deleteAppointmentById.mockResolvedValue({});
      const result = await paymentServices.processAppointmentPayment({
        ...validParams,
        paymentEventStatus: "expired",
      });
      expect(result.statusCode).toBe(200);
    });

    it("should return BAD_REQUEST if payment record not found", async () => {
      getAppointmentByUUID.mockResolvedValue({ appointment_id: 1 });
      getAppointmentPaymentByAppointmentId.mockResolvedValue(null);
      const result =
        await paymentServices.processAppointmentPayment(validParams);
      expect(result.statusCode).toBe(400);
    });

    it("should return SUCCESS if payment already processed", async () => {
      getAppointmentByUUID.mockResolvedValue({ appointment_id: 1 });
      getAppointmentPaymentByAppointmentId.mockResolvedValue({
        transaction_id: null,
        payment_status: "success",
      });
      const result =
        await paymentServices.processAppointmentPayment(validParams);
      expect(result.statusCode).toBe(200);
    });

    it("should process successful payment and send notifications", async () => {
      getAppointmentByUUID.mockResolvedValue({
        appointment_id: 1,
        patient_id: 2,
        first_name: "John",
        last_name: "Doe",
        doctor_id: 3,
        patient_name_on_prescription: "Jane",
        appointment_date: "2024-06-01",
        appointment_time: "10:00",
      });
      getAppointmentPaymentByAppointmentId.mockResolvedValue({
        payment_id: 10,
        amount_paid: "1000",
        transaction_id: "txn-123",
        payment_status: "pending",
      });
      getCurrentWalletBalance.mockResolvedValue({ balance: "5000" });
      updateAppointmentPaymentStatus.mockResolvedValue({});
      updateDoctorWalletBalance.mockResolvedValue({});
      getDoctorById.mockResolvedValue({
        first_name: "Dr",
        last_name: "Smith",
        mobile_number: "08012345678",
        notification_token: "doctor-token",
      });
      getPatientById.mockResolvedValue({
        mobile_number: "08087654321",
        notification_token: "patient-token",
      });
      doctorAppointmentBookedSms.mockResolvedValue({});
      appointmentBookedSms.mockResolvedValue({});

      const result =
        await paymentServices.processAppointmentPayment(validParams);
      expect(result.statusCode).toBe(200);
      expect(updateAppointmentPaymentStatus).toHaveBeenCalled();
      expect(updateDoctorWalletBalance).toHaveBeenCalled();
      expect(doctorAppointmentBookedSms).toHaveBeenCalled();
      expect(appointmentBookedSms).toHaveBeenCalled();
    });

    it("should throw error if something fails", async () => {
      getAppointmentByUUID.mockImplementation(() => {
        throw new Error("fail");
      });
      await expect(
        paymentServices.processAppointmentPayment(validParams),
      ).rejects.toThrow("fail");
    });
  });

  describe("cancelAppointmentPayment", () => {
    const validParams = {
      consultationId: "valid-uuid",
      referrer: "kenecare.com",
    };

    it("should return BAD_REQUEST if input is invalid", async () => {
      const result = await paymentServices.cancelAppointmentPayment({
        consultationId: null,
        referrer: "invalid.com",
      });
      expect(result.statusCode).toBe(400);
    });

    it("should return NOT_FOUND if appointment does not exist", async () => {
      getAppointmentByUUID.mockResolvedValue(null);
      const result =
        await paymentServices.cancelAppointmentPayment(validParams);
      expect(result.statusCode).toBe(404);
    });

    it("should return BAD_REQUEST if payment not found", async () => {
      getAppointmentByUUID.mockResolvedValue({ appointment_id: 1 });
      getAppointmentPaymentByAppointmentId.mockResolvedValue(null);
      const result =
        await paymentServices.cancelAppointmentPayment(validParams);
      expect(result.statusCode).toBe(400);
    });

    it("should return NO_CONTENT if payment already processed", async () => {
      getAppointmentByUUID.mockResolvedValue({ appointment_id: 1 });
      getAppointmentPaymentByAppointmentId.mockResolvedValue({
        transaction_id: "txn-123",
        payment_status: "success",
      });
      const result =
        await paymentServices.cancelAppointmentPayment(validParams);
      expect(result.statusCode).toBe(204);
    });

    it("should cancel payment and delete appointment/payment", async () => {
      getAppointmentByUUID.mockResolvedValue({ appointment_id: 1 });
      getAppointmentPaymentByAppointmentId.mockResolvedValue({
        transaction_id: "txn-123",
        payment_status: "pending",
      });
      deleteAppointmentPaymentByAppointmentId.mockResolvedValue({
        status: "fulfilled",
      });
      deleteAppointmentById.mockResolvedValue({ status: "fulfilled" });
      cancelPaymentUSSD.mockResolvedValue({ status: "fulfilled" });

      const result =
        await paymentServices.cancelAppointmentPayment(validParams);
      expect(result.statusCode).toBe(200);
      expect(deleteAppointmentPaymentByAppointmentId).toHaveBeenCalled();
      expect(deleteAppointmentById).toHaveBeenCalled();
      expect(cancelPaymentUSSD).toHaveBeenCalled();
    });

    it("should throw error if payment deletion fails", async () => {
      getAppointmentByUUID.mockResolvedValue({ appointment_id: 1 });
      getAppointmentPaymentByAppointmentId.mockResolvedValue({
        transaction_id: "txn-123",
        payment_status: "pending",
      });
      deleteAppointmentPaymentByAppointmentId.mockResolvedValue({
        status: "rejected",
        reason: "fail",
      });
      deleteAppointmentById.mockResolvedValue({ status: "fulfilled" });
      cancelPaymentUSSD.mockResolvedValue({ status: "fulfilled" });

      await expect(
        paymentServices.cancelAppointmentPayment(validParams),
      ).rejects.toThrow("Failed to delete appointment payment");
    });

    it("should throw error if appointment deletion fails", async () => {
      getAppointmentByUUID.mockResolvedValue({ appointment_id: 1 });
      getAppointmentPaymentByAppointmentId.mockResolvedValue({
        transaction_id: "txn-123",
        payment_status: "pending",
      });
      deleteAppointmentPaymentByAppointmentId.mockResolvedValue({
        status: "fulfilled",
      });
      deleteAppointmentById.mockResolvedValue({
        status: "rejected",
        reason: "fail",
      });
      cancelPaymentUSSD.mockResolvedValue({ status: "fulfilled" });

      await expect(
        paymentServices.cancelAppointmentPayment(validParams),
      ).rejects.toThrow("Failed to delete appointment");
    });

    it("should not throw error if USSD cancellation fails", async () => {
      getAppointmentByUUID.mockResolvedValue({ appointment_id: 1 });
      getAppointmentPaymentByAppointmentId.mockResolvedValue({
        transaction_id: "txn-123",
        payment_status: "pending",
      });
      deleteAppointmentPaymentByAppointmentId.mockResolvedValue({
        status: "fulfilled",
      });
      deleteAppointmentById.mockResolvedValue({ status: "fulfilled" });
      cancelPaymentUSSD.mockResolvedValue({
        status: "rejected",
        reason: "fail",
      });

      const result =
        await paymentServices.cancelAppointmentPayment(validParams);
      expect(result.statusCode).toBe(200);
    });

    it("should throw error if something fails", async () => {
      getAppointmentByUUID.mockImplementation(() => {
        throw new Error("fail");
      });
      await expect(
        paymentServices.cancelAppointmentPayment(validParams),
      ).rejects.toThrow("fail");
    });
  });
});
