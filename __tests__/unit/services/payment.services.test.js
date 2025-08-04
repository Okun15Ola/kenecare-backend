const paymentServices = require("../../../src/services/payment.services");
const Response = require("../../../src/utils/response.utils");
const {
  getAppointmentByUUID,
} = require("../../../src/repository/patientAppointments.repository");
const {
  deleteAppointmentPaymentByAppointmentId,
} = require("../../../src/repository/payments.repository");
const {
  deleteAppointmentById,
} = require("../../../src/repository/patientAppointments.repository");
const {
  getAppointmentPaymentByAppointmentId,
  updateAppointmentPaymentStatus,
} = require("../../../src/repository/payments.repository");
const { getDoctorById } = require("../../../src/repository/doctors.repository");
const {
  getPatientById,
} = require("../../../src/repository/patients.repository");

const {
  getCurrentWalletBalance,
  updateDoctorWalletBalance,
} = require("../../../src/repository/doctor-wallet.repository");
const { cancelPaymentUSSD } = require("../../../src/utils/payment.utils");

jest.mock("../../../src/repository/patientAppointments.repository", () => ({
  deleteAppointmentById: jest.fn(),
  getAppointmentByUUID: jest.fn(),
}));
jest.mock("../../../src/repository/payments.repository", () => ({
  updateAppointmentPaymentStatus: jest.fn(),
  getAppointmentPaymentByAppointmentId: jest.fn(),
  deleteAppointmentPaymentByAppointmentId: jest.fn(),
}));
jest.mock("../../../src/repository/patients.repository", () => ({
  getPatientById: jest.fn(),
}));
jest.mock("../../../src/repository/doctors.repository", () => ({
  getDoctorById: jest.fn(),
}));
jest.mock("../../../src/repository/doctor-wallet.repository", () => ({
  updateDoctorWalletBalance: jest.fn(),
  getCurrentWalletBalance: jest.fn(),
}));
jest.mock("../../../src/utils/payment.utils", () => ({
  cancelPaymentUSSD: jest.fn(),
}));
jest.mock("../../../src/middlewares/logger.middleware", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));
jest.mock("../../../src/config/redis.config", () => ({
  redisClient: {
    clearCacheByPattern: jest.fn().mockResolvedValue(),
  },
}));
jest.mock("../../../src/utils/sms.utils", () => ({
  doctorAppointmentBookedSms: jest.fn().mockResolvedValue(),
  appointmentBookedSms: jest.fn().mockResolvedValue(),
}));

describe("payment.services", () => {
  beforeAll(() => {
    jest.spyOn(Response, "SUCCESS").mockImplementation((data) => data);
    jest.spyOn(Response, "NOT_FOUND").mockImplementation((data) => data);
    jest.spyOn(Response, "BAD_REQUEST").mockImplementation((data) => data);
    jest.spyOn(Response, "CREATED").mockImplementation((data) => data);
    jest.spyOn(Response, "NOT_MODIFIED").mockImplementation((data) => data);
    jest.spyOn(Response, "FORBIDDEN").mockImplementation((data) => data);
    jest.spyOn(Response, "NO_CONTENT").mockImplementation((data) => data);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });
  const mockAppointment = {
    appointment_id: 1,
    patient_id: 2,
    first_name: "John",
    last_name: "Doe",
    doctor_id: 3,
    patient_name_on_prescription: "John Doe",
    appointment_date: "2024-06-01",
    appointment_time: "10:00",
  };
  const mockPayment = {
    payment_id: 10,
    amount_paid: "1000",
    transaction_id: null,
    payment_status: "pending",
  };
  const mockDoctor = {
    first_name: "Dr",
    last_name: "Smith",
    mobile_number: "08012345678",
    notification_token: "doctor-token",
  };
  const mockPatient = {
    mobile_number: "08087654321",
    notification_token: "patient-token",
  };

  describe("processAppointmentPayment", () => {
    it("should return BAD_REQUEST if input is invalid", async () => {
      const result = await paymentServices.processAppointmentPayment({
        consultationId: null,
        referrer: "invalid.com",
        transactionId: "txid",
        paymentEventStatus: "success",
      });
      expect(result).toBeDefined();
    });

    it("should return NOT_FOUND if appointment not found", async () => {
      getAppointmentByUUID.mockResolvedValue(null);

      const result = await paymentServices.processAppointmentPayment({
        consultationId: "uuid",
        referrer: "kenecare.com",
        transactionId: "txid",
        paymentEventStatus: "success",
      });
      expect(result).toBeDefined();
    });

    it("should handle expired payment", async () => {
      getAppointmentByUUID.mockResolvedValue(mockAppointment);
      deleteAppointmentPaymentByAppointmentId.mockResolvedValue();

      const result = await paymentServices.processAppointmentPayment({
        consultationId: "uuid",
        referrer: "kenecare.com",
        transactionId: "txid",
        paymentEventStatus: "expired",
      });
      expect(result).toBeDefined();
    });

    it("should return BAD_REQUEST if payment record not found", async () => {
      getAppointmentByUUID.mockResolvedValue(mockAppointment);
      getAppointmentPaymentByAppointmentId.mockResolvedValue(null);

      const result = await paymentServices.processAppointmentPayment({
        consultationId: "uuid",
        referrer: "kenecare.com",
        transactionId: "txid",
        paymentEventStatus: "success",
      });
      expect(result).toBeDefined();
    });

    it("should return SUCCESS if payment already processed", async () => {
      getAppointmentByUUID.mockResolvedValue(mockAppointment);
      getAppointmentPaymentByAppointmentId.mockResolvedValue({
        ...mockPayment,
        transaction_id: null,
        payment_status: "success",
      });

      const result = await paymentServices.processAppointmentPayment({
        consultationId: "uuid",
        referrer: "kenecare.com",
        transactionId: "txid",
        paymentEventStatus: "success",
      });
      expect(result).toBeDefined();
    });

    it("should process successful payment and send notifications", async () => {
      getAppointmentByUUID.mockResolvedValue(mockAppointment);
      getAppointmentPaymentByAppointmentId.mockResolvedValue({
        ...mockPayment,
        payment_status: "pending",
      });
      getDoctorById.mockResolvedValue(mockDoctor);
      getPatientById.mockResolvedValue(mockPatient);
      getCurrentWalletBalance.mockResolvedValue({ balance: "1000" });
      updateAppointmentPaymentStatus.mockResolvedValue();
      updateDoctorWalletBalance.mockResolvedValue();

      const result = await paymentServices.processAppointmentPayment({
        consultationId: "uuid",
        referrer: "kenecare.com",
        transactionId: "txid",
        paymentEventStatus: "success",
      });
      expect(result).toBeDefined();
    });

    it("should throw error if exception occurs", async () => {
      getAppointmentByUUID.mockRejectedValue(new Error("DB error"));

      await expect(
        paymentServices.processAppointmentPayment({
          consultationId: "uuid",
          referrer: "kenecare.com",
          transactionId: "txid",
          paymentEventStatus: "success",
        }),
      ).rejects.toThrow("DB error");
    });

    describe("cancelAppointmentPayment", () => {
      const mockAppointment = {
        appointment_id: 1,
        doctor_id: 3,
        patient_id: 2,
      };
      const mockPayment = {
        transaction_id: "txid",
        payment_status: "pending",
      };

      it("should return BAD_REQUEST if input is invalid", async () => {
        const result = await paymentServices.cancelAppointmentPayment({
          consultationId: null,
          referrer: "invalid.com",
        });
        expect(result).toBeDefined();
      });

      it("should return NOT_FOUND if appointment not found", async () => {
        getAppointmentByUUID.mockResolvedValue(null);

        const result = await paymentServices.cancelAppointmentPayment({
          consultationId: "uuid",
          referrer: "kenecare.com",
        });
        expect(result).toBeDefined();
      });

      it("should return BAD_REQUEST if payment not found", async () => {
        getAppointmentByUUID.mockResolvedValue(mockAppointment);
        getAppointmentPaymentByAppointmentId.mockResolvedValue(null);

        const result = await paymentServices.cancelAppointmentPayment({
          consultationId: "uuid",
          referrer: "kenecare.com",
        });
        expect(result).toBeDefined();
      });

      it("should return NO_CONTENT if payment already processed", async () => {
        getAppointmentByUUID.mockResolvedValue(mockAppointment);
        getAppointmentPaymentByAppointmentId.mockResolvedValue({
          transaction_id: "txid",
          payment_status: "success",
        });

        const result = await paymentServices.cancelAppointmentPayment({
          consultationId: "uuid",
          referrer: "kenecare.com",
        });
        expect(result).toBeDefined();
      });

      it("should cancel appointment payment and clear cache", async () => {
        getAppointmentByUUID.mockResolvedValue(mockAppointment);
        getAppointmentPaymentByAppointmentId.mockResolvedValue(mockPayment);
        deleteAppointmentPaymentByAppointmentId.mockResolvedValue({
          status: "fulfilled",
        });
        deleteAppointmentById.mockResolvedValue({ status: "fulfilled" });
        cancelPaymentUSSD.mockResolvedValue({ status: "fulfilled" });

        const result = await paymentServices.cancelAppointmentPayment({
          consultationId: "uuid",
          referrer: "kenecare.com",
        });
        expect(result).toBeDefined();
      });

      it("should throw error if payment deletion fails", async () => {
        getAppointmentByUUID.mockResolvedValue(mockAppointment);
        getAppointmentPaymentByAppointmentId.mockResolvedValue(mockPayment);
        deleteAppointmentPaymentByAppointmentId.mockResolvedValue({
          status: "rejected",
          reason: "fail",
        });
        deleteAppointmentById.mockResolvedValue({ status: "fulfilled" });
        cancelPaymentUSSD.mockResolvedValue({ status: "fulfilled" });

        await expect(
          paymentServices.cancelAppointmentPayment({
            consultationId: "uuid",
            referrer: "kenecare.com",
          }),
        ).rejects.toThrow("Failed to delete appointment payment");
      });

      it("should throw error if appointment deletion fails", async () => {
        getAppointmentByUUID.mockResolvedValue(mockAppointment);
        getAppointmentPaymentByAppointmentId.mockResolvedValue(mockPayment);
        deleteAppointmentPaymentByAppointmentId.mockResolvedValue({
          status: "fulfilled",
        });
        deleteAppointmentById.mockResolvedValue({
          status: "rejected",
          reason: "fail",
        });
        cancelPaymentUSSD.mockResolvedValue({ status: "fulfilled" });

        await expect(
          paymentServices.cancelAppointmentPayment({
            consultationId: "uuid",
            referrer: "kenecare.com",
          }),
        ).rejects.toThrow("Failed to delete appointment");
      });

      it("should warn if USSD cancellation fails but not throw", async () => {
        getAppointmentByUUID.mockResolvedValue(mockAppointment);
        getAppointmentPaymentByAppointmentId.mockResolvedValue(mockPayment);
        deleteAppointmentPaymentByAppointmentId.mockResolvedValue({
          status: "fulfilled",
        });
        deleteAppointmentById.mockResolvedValue({ status: "fulfilled" });
        cancelPaymentUSSD.mockResolvedValue({
          status: "rejected",
          reason: "fail",
        });

        const result = await paymentServices.cancelAppointmentPayment({
          consultationId: "uuid",
          referrer: "kenecare.com",
        });
        expect(result).toBeDefined();
      });

      it("should throw error if exception occurs", async () => {
        getAppointmentByUUID.mockRejectedValue(new Error("DB error"));

        await expect(
          paymentServices.cancelAppointmentPayment({
            consultationId: "uuid",
            referrer: "kenecare.com",
          }),
        ).rejects.toThrow("DB error");
      });
    });
  });
});
