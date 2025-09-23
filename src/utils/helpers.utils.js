const { body } = require("express-validator");
const moment = require("moment");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const repo = require("../repository/patientAppointments.repository");
const {
  updatePatientFirstAppointmentStatus,
} = require("../repository/patients.repository");
const {
  getDoctorAppointByDateAndTime,
} = require("../repository/doctorAppointments.repository");
const Response = require("./response.utils");
const { getDoctorById } = require("../repository/doctors.repository");
const {
  createAppointmentPayment,
  createFirstAppointmentPayment,
} = require("../repository/payments.repository");
const { getPaymentUSSD } = require("./payment.utils");
const {
  doctorAppointmentBookedSms,
  appointmentBookedSms,
} = require("./sms.utils");
const { decryptText, encryptText } = require("./auth.utils");
const { checkDoctorAvailability } = require("./time.utils");
const { USERTYPE } = require("./enum.utils");
const { createOrUpdateStreamUser } = require("./stream.utils");
const { getPatientByUserId } = require("../repository/patients.repository");
const { getFileUrlFromS3Bucket } = require("./aws-s3.utils");
const { getDoctorByUserId } = require("../repository/doctors.repository");
const { redisClient } = require("../config/redis.config");
const logger = require("../middlewares/logger.middleware");
/**
 * Creates or updates a Stream user profile for a given user type and user ID.
 * Fetches user details (patient or doctor), retrieves the profile image URL from S3 if available,
 * and then creates or updates the user profile in the Stream service.
 *
 * @async
 * @function createStreamUserProfile
 * @param {string} userType - The type of user (e.g., USERTYPE.PATIENT or USERTYPE.DOCTOR).
 * @param {number} userId - The unique identifier of the user.
 * @returns {Promise<user>} Resolves when the operation is complete.
 */
const createStreamUserProfile = async (userType, userId) => {
  if (![USERTYPE.PATIENT, USERTYPE.DOCTOR].includes(userType)) return;
  try {
    const fetchUserDetails =
      userType === USERTYPE.PATIENT ? getPatientByUserId : getDoctorByUserId;
    const userDetails = await fetchUserDetails(userId);
    if (!userDetails) return;
    const {
      first_name: firstName,
      last_name: lastName,
      profile_pic_url: profilePicUrl,
      mobile_number: mobileNumber,
    } = userDetails;
    const imageUrl = profilePicUrl
      ? await getFileUrlFromS3Bucket(profilePicUrl)
      : null;
    const response = await createOrUpdateStreamUser({
      userId: String(userId),
      mobileNumber,
      userType,
      username: `${firstName ?? ""} ${lastName ?? ""}`.trim(),
      image: imageUrl,
    });
    // eslint-disable-next-line consistent-return
    return response;
  } catch (err) {
    console.log(err);
    logger.error("createStreamUserProfile:", err);
    throw err;
  }
};

/**
 * Validator for boolean fields that accepts true/false, 0/1, '0'/'1'
 * but normalizes to 0/1 format for MySQL storage
 *
 * @param {string} fieldName - Name of the field to validate
 * @param {string} [message] - Custom error message
 * @returns {Object} Express validator chain
 */
const binaryBooleanValidator = (
  fieldName,
  message = "Field must be a boolean value (true/false or 0/1)",
) => {
  return body(fieldName)
    .optional()
    .custom((value) => {
      // Accept true/false, 0/1, '0'/'1' as valid values
      return (
        value === true ||
        value === false ||
        value === 0 ||
        value === 1 ||
        value === "0" ||
        value === "1"
      );
    })
    .withMessage(message)
    .customSanitizer((value) => {
      // Normalize to 0/1 for database
      if (value === true || value === 1 || value === "1") {
        return 1;
      }
      return 0;
    });
};

const fetchLoggedInDoctor = async (userId) => {
  if (!userId) {
    logger.error("fetchLoggedInDoctor: userId is required");
    return null;
  }
  try {
    const cacheKey = `doctor:${userId}:user`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const doctor = await getDoctorByUserId(userId);
    if (!doctor.doctor_id) {
      logger.warn(`No doctor found for userId: ${userId}`);
      return null;
    }

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(doctor),
      expiry: 3600,
    });
    return doctor;
  } catch (error) {
    logger.error("fetchLoggedInDoctor error:", error);
    return null;
  }
};

async function validateEntities({
  userId,
  doctorId,
  appointmentDate,
  appointmentTime,
}) {
  const proposedAppointmentStartDateTime = `${appointmentDate} ${appointmentTime}`;
  const [patient, doctor, timeBooked, doctorAvailability] =
    await Promise.allSettled([
      getPatientByUserId(userId),
      getDoctorById(doctorId),
      getDoctorAppointByDateAndTime({
        doctorId,
        date: appointmentDate,
        time: appointmentTime,
      }),
      checkDoctorAvailability(doctorId, proposedAppointmentStartDateTime),
    ]);

  if (patient.status === "rejected") {
    return {
      error: Response.BAD_REQUEST({
        message:
          "Please create a patient profile before booking an appointment",
      }),
    };
  }

  if (!patient.value) {
    return {
      error: Response.BAD_REQUEST({
        message: "Patient profile not found. Please create one before booking",
      }),
    };
  }

  if (doctor.status === "rejected") {
    return {
      error: Response.BAD_REQUEST({
        message: "Specified Doctor does not exist. Please try again",
      }),
    };
  }

  if (timeBooked.status === "fulfilled" && timeBooked.value) {
    return {
      error: Response.BAD_REQUEST({
        message:
          "An appointment has already been booked for the specified time. Please choose another time",
      }),
    };
  }

  if (doctorAvailability.status === "rejected") {
    return {
      error: Response.INTERNAL_SERVER_ERROR({
        message:
          "Could not verify doctor availability. Please try again later.",
      }),
    };
  }

  const availability = doctorAvailability.value;
  if (!availability.isAvailable) {
    // Use the specific message from the availability check!
    return { error: Response.BAD_REQUEST({ message: availability.message }) };
  }

  return { patient: patient.value, doctor: doctor.value };
}

async function checkIdempotency({
  userId,
  doctorId,
  appointmentDate,
  appointmentTime,
  patientName,
}) {
  const requestHash = crypto
    .createHash("sha256")
    .update(
      `${userId}:${doctorId}:${appointmentDate}:${appointmentTime}:${patientName}`,
    )
    .digest("hex");

  const cacheKey = `appointment:idempotency:${requestHash}`;
  const existing = await redisClient.get(cacheKey);

  if (existing) {
    return {
      idempotencyError: Response.BAD_REQUEST({
        message:
          "It appears you've already submitted this appointment request. Please check your appointments",
      }),
    };
  }

  await redisClient.set({
    key: cacheKey,
    value: Date.now().toString(),
    expiry: 600, // 10 mins
  });

  return { requestHash };
}

async function clearAppointmentCaches(patientId, doctorId) {
  await Promise.all([
    redisClient.clearCacheByPattern(`patient:${patientId}:appointments:*`),
    redisClient.clearCacheByPattern(`doctor:${doctorId}:appointments:*`),
  ]);
}

async function rollbackAppointment(appointmentId, patientId, doctorId) {
  await repo.deleteAppointmentById({ appointmentId });
  await clearAppointmentCaches(patientId, doctorId);
}

async function sendAppointmentNotifications(appointment, { patient, doctor }) {
  if (!appointment || !patient || !doctor) {
    throw new Error("Missing appointment, patient, or doctor information");
  }
  const patientFirstName = decryptText(patient.first_name);
  const patientLastName = decryptText(patient.last_name);

  const [appointmentSms, doctorAppointmentSms] = await Promise.allSettled([
    appointmentBookedSms({
      mobileNumber: patient.mobile_number,
      patientName: `${patientFirstName} ${patientLastName}`,
      doctorName: `${doctor.first_name} ${doctor.last_name}`,
      patientNameOnPrescription: appointment.patientName,
      appointmentDate: moment(appointment.appointmentDate).format("YYYY-MM-DD"),
      appointmentTime: appointment.appointmentTime,
    }),
    doctorAppointmentBookedSms({
      mobileNumber: doctor.mobile_number,
      doctorName: doctor.last_name,
      patientNameOnPrescription: appointment.patientName,
      appointmentDate: moment(appointment.appointmentDate).format("YYYY-MM-DD"),
      appointmentTime: appointment.appointmentTime,
    }),
  ]);

  if (
    appointmentSms.status === "rejected" ||
    doctorAppointmentSms.status === "rejected"
  ) {
    throw new Error("Failed to send notifications");
  }
}

async function processFirstAppointment(appointment, { patient, doctor }) {
  const tasks = [
    createFirstAppointmentPayment({
      appointmentId: appointment.id,
      amountPaid: appointment.consultationFee,
      orderId: appointment.orderId,
      paymentMethod: "FIRST_FREE_APPOINTMENT",
      transactionId: "FIRST_FREE_APPOINTMENT",
      paymentToken: "FIRST_FREE_APPOINTMENT",
      notificationToken: "FIRST_FREE_APPOINTMENT",
      status: "success",
    }),
    updatePatientFirstAppointmentStatus(appointment.patientId),
    sendAppointmentNotifications(appointment, { patient, doctor }),
  ];

  const results = await Promise.allSettled(tasks);
  const hasFailure = results.some((result) => result.status === "rejected");

  if (hasFailure) {
    await rollbackAppointment(
      appointment.id,
      appointment.patientId,
      appointment.doctorId,
    );
    const error = results.find((r) => r.status === "rejected")?.reason;
    logger.error(
      `Error processing first appointment booking for appointment ID ${appointment.id}:`,
      error,
    );
    return Response.INTERNAL_SERVER_ERROR({
      message: "An Error Occurred on our side, please try again",
    });
  }

  await clearAppointmentCaches(appointment.patientId, appointment.doctorId);

  return Response.CREATED({
    message:
      "First Free Medical Appointment Booked Successfully. Thank you for choosing Kenecare",
    data: {
      paymentUrl: null,
      firstAppointment: true,
    },
  });
}
// Regular appointment processing - single responsibility
async function processRegularAppointment(appointment) {
  try {
    const paymentResponse = await getPaymentUSSD({
      orderId: appointment.orderId,
      amount: appointment.consultationFee,
    });

    if (!paymentResponse) {
      await rollbackAppointment(
        appointment.id,
        appointment.patientId,
        appointment.doctorId,
      );
      return Response.INTERNAL_SERVER_ERROR({
        message: "An Error Occurred on our side, please try again",
      });
    }

    const { ussdCode, paymentCodeId, idempotencyKey, expiresAt, cancelUrl } =
      paymentResponse;

    const paymentRecord = await createAppointmentPayment({
      appointmentId: appointment.id,
      amountPaid: appointment.consultationFee,
      orderId: appointment.orderId,
      paymentMethod: "",
      paymentToken: ussdCode,
      notificationToken: idempotencyKey,
      transactionId: paymentCodeId,
    });

    if (!paymentRecord.insertId) {
      await rollbackAppointment(
        appointment.id,
        appointment.patientId,
        appointment.doctorId,
      );
      return Response.INTERNAL_SERVER_ERROR({
        message: "An Error Occurred on our side, please try again",
      });
    }

    await clearAppointmentCaches(appointment.patientId, appointment.doctorId);

    return Response.CREATED({
      message: "Appointment Booked Successfully. Proceed to payment.",
      data: {
        paymentUrl: ussdCode,
        cancelUrl,
        paymentUrlExpiresAt: expiresAt,
      },
    });
  } catch (error) {
    logger.error(
      `Error getting payment URL for appointment ID ${appointment.id}:`,
      error,
    );
    await rollbackAppointment(
      appointment.id,
      appointment.patientId,
      appointment.doctorId,
    );
    throw error;
  }
}

async function createAppointment(appointmentData, { patient, doctor }) {
  const {
    patientName,
    symptoms,
    doctorId,
    appointmentType,
    specialtyId,
    appointmentDate,
    appointmentTime,
  } = appointmentData;

  const generatedOrderId = uuidv4();
  const encryptedPatientName = encryptText(patientName);
  const encryptedSymptoms = encryptText(symptoms);

  const appointmentResult = await repo.createNewPatientAppointment({
    uuid: generatedOrderId,
    patientId: patient.patient_id,
    doctorId,
    patientName: encryptedPatientName,
    patientNumber: appointmentData.patientNumber,
    symptoms: encryptedSymptoms,
    appointmentType,
    consultationFee: doctor.consultation_fee,
    specialtyId,
    appointmentDate,
    appointmentTime,
  });

  if (!appointmentResult.insertId) {
    logger.error("Failed to create new patient appointment");
    throw new Error("Failed to create appointment");
  }

  return {
    id: appointmentResult.insertId,
    orderId: generatedOrderId,
    patientId: patient.patient_id,
    doctorId,
    consultationFee: doctor.consultation_fee,
    patientName,
    appointmentDate,
    appointmentTime,
  };
}

module.exports = {
  createStreamUserProfile,
  binaryBooleanValidator,
  fetchLoggedInDoctor,
  createAppointment,
  processFirstAppointment,
  processRegularAppointment,
  checkIdempotency,
  validateEntities,
};
