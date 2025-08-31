/* eslint-disable camelcase */
const moment = require("moment");
const {
  deleteAppointmentById,
  getAppointmentByUUID,
} = require("../repository/patientAppointments.repository");
const Response = require("../utils/response.utils");
const {
  updateAppointmentPaymentStatus,
  getAppointmentPaymentByAppointmentId,
  deleteAppointmentPaymentByAppointmentId,
  getPaymentStatusByAppointmentId,
} = require("../repository/payments.repository");
const { getPatientById } = require("../repository/patients.repository");
const { getDoctorById } = require("../repository/doctors.repository");
const {
  updateDoctorWalletBalance,
  getCurrentWalletBalance,
} = require("../repository/doctor-wallet.repository");
const { cancelPaymentUSSD } = require("../utils/payment.utils");
const {
  updateWithdrawalRequest,
  getWithdrawalRequestByTransactionId,
} = require("../repository/withdrawal-requests.repository");
const logger = require("../middlewares/logger.middleware");
const { redisClient } = require("../config/redis.config");
const {
  doctorAppointmentBookedSms,
  appointmentBookedSms,
} = require("../utils/sms.utils");
const { decryptText } = require("../utils/auth.utils");
// const { sendPushNotification } = require("../utils/notification.utils");

const CONFIG = {
  KENECARE_FEE_PERCENTAGE: 0.15,
  VALID_REFERRER: "kenecare.com",
  PAYMENT_STATUS: {
    SUCCESS: "success",
    EXPIRED: "expired",
    COMPLETED: "completed",
    FAILED: "failed",
  },
};

const ERROR_MESSAGES = {
  INVALID_REQUEST: "Error Processing Request",
  APPOINTMENT_NOT_FOUND: "Appointment Not Found",
  PAYMENT_PROCESSING_ERROR: "Error processing payment. Please try again",
};

/**
 * Validates input parameters
 */
const validateInput = ({ consultationId, referrer }) => {
  if (!consultationId || referrer !== CONFIG.VALID_REFERRER) {
    logger.warn(
      `Invalid consultationId: ${consultationId} or referrer: ${referrer}`,
    );
    return false;
  }
  return true;
};

/**
 * Handles expired payment cleanup
 */
const handleExpiredPayment = async (appointmentId) => {
  try {
    await Promise.all([
      deleteAppointmentPaymentByAppointmentId({ appointmentId }),
      deleteAppointmentById({ appointmentId }),
    ]);

    return Response.SUCCESS({});
  } catch (error) {
    logger.error(
      `Failed to cleanup expired payment for appointmentId: ${appointmentId}`,
      error,
    );
    return Response.INTERNAL_SERVER_ERROR({
      message: ERROR_MESSAGES.PAYMENT_PROCESSING_ERROR,
    });
  }
};

/**
 * Validates payment record and prevents duplicate processing
 */
const validatePaymentRecord = (appointmentPaymentRecord, appointmentId) => {
  if (!appointmentPaymentRecord) {
    logger.warn(
      `Appointment payment record not found for appointmentId: ${appointmentId}`,
    );
    return {
      isValid: false,
      response: Response.BAD_REQUEST({
        message: ERROR_MESSAGES.PAYMENT_PROCESSING_ERROR,
      }),
    };
  }

  const { transaction_id: transactionID, payment_status: paymentStatus } =
    appointmentPaymentRecord;

  // Check if payment already processed
  if (
    transactionID === null &&
    paymentStatus === CONFIG.PAYMENT_STATUS.SUCCESS
  ) {
    return {
      isValid: false,
      response: Response.SUCCESS({}),
    };
  }

  return { isValid: true };
};

/**
 * Calculates fees and updates payment/wallet
 */
const processSuccessfulPayment = async ({
  paymentId,
  paymentEventStatus,
  transactionId,
  doctorId,
  amountPaid,
}) => {
  const kenecareFee = parseFloat(amountPaid) * CONFIG.KENECARE_FEE_PERCENTAGE;
  const finalDoctorFee = parseFloat(amountPaid) - kenecareFee;
  const { balance: currentBalance } = await getCurrentWalletBalance(doctorId);
  const newAccountBalance = parseFloat(currentBalance) + finalDoctorFee;
  // Update payment status and wallet balance concurrently
  await Promise.all([
    updateAppointmentPaymentStatus({
      paymentId,
      paymentStatus: paymentEventStatus,
      transactionId,
    }),
    updateDoctorWalletBalance({
      doctorId,
      amount: newAccountBalance,
    }),
  ]);
};

/**
 * Fetches doctor and patient data concurrently
 */
const fetchUserData = async (doctorId, patientId) => {
  const [doctor, patient] = await Promise.all([
    getDoctorById(doctorId),
    getPatientById(patientId),
  ]);

  return { doctor, patient };
};

/**
 * Creates notification objects
 */
const createNotifications = (
  patientNotificationToken,
  doctorNotificationToken,
  doctorFirstName,
  userFirstName,
  appointmentId,
) => {
  return {
    patientNotification: {
      token: patientNotificationToken,
      title: "New Medical Appointment",
      body: `New Medical Appointment With Dr. ${doctorFirstName}`,
      payload: { appointmentId },
    },
    doctorNotification: {
      token: doctorNotificationToken,
      title: "New Medical Appointment",
      body: `New Medical Appointment With ${userFirstName}`,
      payload: { appointmentId },
    },
  };
};

/**
 * Sends notifications to both doctor and patient
 */
const sendNotifications = async ({
  doctorMobileNumber,
  doctorLastName,
  patientNameOnPrescription,
  appointmentDate,
  appointmentTime,
  // doctorNotification,
  mobileNumber,
  userFirstName,
  userLastName,
  doctorFirstName,
  // patientNotification,
}) => {
  const appointmentDateFormatted = moment(appointmentDate).format("YYYY-MM-DD");

  // Send notifications concurrently
  await Promise.all([
    doctorAppointmentBookedSms({
      mobileNumber: doctorMobileNumber,
      doctorName: doctorLastName,
      patientNameOnPrescription,
      appointmentDate: appointmentDateFormatted,
      appointmentTime,
    }),
    // sendPushNotification(doctorNotification),
    appointmentBookedSms({
      mobileNumber,
      patientName: `${userFirstName} ${userLastName}`,
      doctorName: `${doctorFirstName} ${doctorLastName}`,
      patientNameOnPrescription,
      appointmentDate: appointmentDateFormatted,
      appointmentTime,
    }),
    // sendPushNotification(patientNotification),
  ]);
};

/**
 * Main appointment payment processing function
 */
exports.processAppointmentPayment = async ({
  consultationId,
  referrer,
  transactionId,
  paymentEventStatus,
}) => {
  try {
    if (!validateInput({ consultationId, referrer })) {
      return Response.BAD_REQUEST({ message: ERROR_MESSAGES.INVALID_REQUEST });
    }

    const appointment = await getAppointmentByUUID(consultationId);
    if (!appointment) {
      logger.warn(`Appointment not found for UUID: ${consultationId}`);
      return Response.NOT_FOUND({
        message: ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
      });
    }

    const {
      appointment_id: appointmentId,
      patient_id: patientId,
      first_name: userFirstName,
      last_name: userLastName,
      doctor_id: doctorId,
      patient_name_on_prescription: patientNameOnPrescription,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
    } = appointment;

    // Handle expired payment
    if (paymentEventStatus === CONFIG.PAYMENT_STATUS.EXPIRED) {
      return await handleExpiredPayment(appointmentId);
    }

    const patientFirstName = decryptText(userFirstName);
    const patientLastName = decryptText(userLastName);
    const patientName = decryptText(patientNameOnPrescription);

    // Validate payment record
    const appointmentPaymentRecord =
      await getAppointmentPaymentByAppointmentId(appointmentId);
    const validation = validatePaymentRecord(
      appointmentPaymentRecord,
      appointmentId,
    );
    if (!validation.isValid) {
      return validation.response;
    }

    // Process successful payment
    if (paymentEventStatus === CONFIG.PAYMENT_STATUS.SUCCESS) {
      const { payment_id: paymentId, amount_paid: amountPaid } =
        appointmentPaymentRecord;

      // Update payment and wallet
      await processSuccessfulPayment({
        paymentId,
        paymentEventStatus,
        transactionId,
        doctorId,
        amountPaid,
      });

      // Fetch user data
      const { doctor, patient } = await fetchUserData(doctorId, patientId);

      // Extract user information
      const {
        mobile_number: mobileNumber,
        notification_token: patientNotificationToken,
      } = patient;
      const {
        first_name: doctorFirstName,
        last_name: doctorLastName,
        mobile_number: doctorMobileNumber,
        notification_token: doctorNotificationToken,
      } = doctor;

      // Create notifications
      const { patientNotification, doctorNotification } = createNotifications(
        patientNotificationToken,
        doctorNotificationToken,
        doctorFirstName,
        userFirstName,
        appointmentId,
      );

      // Send notifications
      await sendNotifications({
        doctorMobileNumber,
        doctorLastName,
        patientNameOnPrescription: patientName,
        appointmentDate,
        appointmentTime,
        doctorNotification,
        mobileNumber,
        userFirstName: patientFirstName,
        userLastName: patientLastName,
        doctorFirstName,
        patientNotification,
      });
    }

    await Promise.all([
      redisClient.clearCacheByPattern(`doctor:${doctorId}:appointments:*`),
      redisClient.clearCacheByPattern(`patient:${patientId}:appointments:*`),
      redisClient.clearCacheByPattern("admin:appointments:*"),
    ]);

    return Response.SUCCESS({
      message: "Appointment Payment Processed Successfully",
    });
  } catch (error) {
    logger.error("processAppointmentPayment :", error);
    throw error;
  }
};

exports.cancelAppointmentPayment = async ({ consultationId, referrer }) => {
  try {
    if (!validateInput({ consultationId, referrer })) {
      logger.warn(
        `Invalid consultationId: ${consultationId} or referrer: ${referrer}`,
      );
      return Response.BAD_REQUEST({ message: ERROR_MESSAGES.INVALID_REQUEST });
    }

    //  Check if the user canelling the payment is the authorized user that booked the appointment

    // Get appointment by UUID
    const rawData = await getAppointmentByUUID(consultationId);

    // Check if the appointment exists
    if (!rawData) {
      logger.warn(`Appointment not found for UUID: ${consultationId}`);
      return Response.NOT_FOUND({
        message: "Medical Appointment Not Found.",
      });
    }

    const {
      appointment_id: appointmentId,
      doctor_id: doctorId,
      patient_id: patientId,
    } = rawData;

    const payment = await getAppointmentPaymentByAppointmentId(appointmentId);

    if (!payment) {
      logger.warn(`Payment not found for appointmentId: ${appointmentId}`);
      await deleteAppointmentById({ appointmentId });
      return Response.BAD_REQUEST({
        message: "Error processing payment. Please try again",
      });
    }

    const { transaction_id: transactionID, payment_status: paymentStatus } =
      payment;

    if (transactionID !== null && paymentStatus === "success") {
      return Response.NO_CONTENT({});
    }

    // Delete the apppointment and appointment payment from the database if payment was not successful
    const results = await Promise.allSettled([
      deleteAppointmentPaymentByAppointmentId({ appointmentId }),
      deleteAppointmentById({ appointmentId }),
      cancelPaymentUSSD(transactionID),
    ]);

    const [paymentDeletion, appointmentDeletion, ussdCancellation] = results;

    if (paymentDeletion.status === "rejected") {
      logger.error(
        `Failed to delete appointment payment for appointmentId: ${appointmentId}`,
        paymentDeletion.reason,
      );
      throw new Error("Failed to delete appointment payment");
    }

    if (appointmentDeletion.status === "rejected") {
      logger.error(
        `Failed to delete appointment for appointmentId: ${appointmentId}`,
        appointmentDeletion.reason,
      );
      throw new Error("Failed to delete appointment");
    }

    if (ussdCancellation && ussdCancellation.status === "rejected") {
      logger.warn(
        `Failed to cancel USSD payment for transactionID: ${transactionID}`,
        ussdCancellation.reason,
      );
    }

    await Promise.all([
      redisClient.clearCacheByPattern(`doctor:${doctorId}:appointments:*`),
      redisClient.clearCacheByPattern(`patient:${patientId}:appointments:*`),
      redisClient.clearCacheByPattern("admin:appointments:*"),
    ]);

    return Response.SUCCESS({
      message: "Medical Appointment Cancelled Successfully.",
    });
  } catch (error) {
    logger.error("cancelAppointmentPayment: ", error);
    throw error;
  }
};

exports.getPaymentStatusByConsultationId = async (consultationId) => {
  try {
    const payment = await getPaymentStatusByAppointmentId(consultationId);

    if (!payment) {
      logger.warn(`Payment not found for consultation UUID: ${consultationId}`);
      return Response.NOT_FOUND({
        message: "Payment record not found.",
      });
    }

    // initiated, success, failed
    const {
      payment_status,
      amount_paid: amountPaid,
      updated_at: lastUpdated,
    } = payment;
    const status = payment_status ? payment_status.trim().toLowerCase() : "";

    const paymentData = {
      status,
      lastUpdated,
    };

    if (status === "success") {
      paymentData.amountPaid = amountPaid;
    }
    return Response.SUCCESS({
      data: paymentData,
    });
  } catch (error) {
    logger.error("getPaymentStatusByConsultationId: ", error);
    throw error;
  }
};

exports.processDoctorWithdrawalService = async ({
  transactionId,
  transactionReference,
  paymentEventStatus,
}) => {
  try {
    const withdrawalRequest =
      await getWithdrawalRequestByTransactionId(transactionId);
    if (!withdrawalRequest) {
      logger.error(
        `Withdrawal request not found for transaction ID: ${transactionId}`,
      );
      return Response.NOT_FOUND({ message: "Request Not Found" });
    }

    const {
      status,
      doctor_id: doctorId,
      request_id: requestId,
    } = withdrawalRequest;

    if (
      status === CONFIG.PAYMENT_STATUS.COMPLETED ||
      status === CONFIG.PAYMENT_STATUS.FAILED
    ) {
      return Response.CONFLICT({
        message: `Status already ${status}`,
      });
    }

    if (paymentEventStatus === CONFIG.PAYMENT_STATUS.COMPLETED) {
      await updateWithdrawalRequest({
        transactionId,
        status: paymentEventStatus,
        transactionReference,
      });
    } else if (paymentEventStatus === CONFIG.PAYMENT_STATUS.FAILED) {
      const { balance: currentBalance } = await getCurrentWalletBalance(
        withdrawalRequest.doctorId,
      );
      const amountToRefund = parseFloat(withdrawalRequest.amount);
      const newBalance = currentBalance + amountToRefund;

      await Promise.all([
        updateWithdrawalRequest({
          transactionId,
          status: paymentEventStatus,
          transactionReference,
        }),
        updateDoctorWalletBalance({
          doctorId,
          amount: newBalance,
        }),
      ]);

      logger.warn(
        `Withdrawal request ${requestId} failed. Amount of ${amountToRefund} refunded to doctor's wallet.`,
      );
    }
    const { affectedRows } = await updateWithdrawalRequest({
      transactionId,
      status: paymentEventStatus,
      transactionReference,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.error("Fail to update payment status");
    }
    return Response.SUCCESS({ message: "Withdrawal Successful" });
  } catch (error) {
    logger.error("processDoctorWithdrawalService: ", error);
    throw error;
  }
};
