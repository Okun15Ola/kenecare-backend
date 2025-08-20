const moment = require("moment");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const logger = require("../../middlewares/logger.middleware");
const repo = require("../../repository/patientAppointments.repository");
const {
  getPatientByUserId,
  updatePatientFirstAppointmentStatus,
} = require("../../repository/patients.repository");
const {
  countPatientFollowUp,
} = require("../../repository/follow-up.repository");
const {
  getDoctorAppointByDateAndTime,
} = require("../../repository/doctorAppointments.repository");
const Response = require("../../utils/response.utils");
const { getDoctorById } = require("../../repository/doctors.repository");
const {
  createAppointmentPayment,
  createFirstAppointmentPayment,
} = require("../../repository/payments.repository");
const { getPaymentUSSD } = require("../../utils/payment.utils");
const {
  getAppointmentFollowUps,
} = require("../../repository/follow-up.repository");
const {
  doctorAppointmentBookedSms,
  appointmentBookedSms,
} = require("../../utils/sms.utils");
const { redisClient } = require("../../config/redis.config");
const {
  mapPatientAppointment,
  mapFollowUpsRow,
} = require("../../utils/db-mapper.utils");
const {
  cacheKeyBulider,
  getCachedCount,
  getPaginationInfo,
} = require("../../utils/caching.utils");
const { decryptText, encryptText } = require("../../utils/auth.utils");
const { checkDoctorAvailability } = require("../../utils/time.utils");

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

  if (doctorAvailability.status === "rejected" || !doctorAvailability.value) {
    return {
      error: Response.BAD_REQUEST({
        message:
          "Doctor is not available at the specified time. Please choose another time",
      }),
    };
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
      error: Response.BAD_REQUEST({
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

function failResponse(message, code = 500) {
  return Response[code === 400 ? "BAD_REQUEST" : "INTERNAL_SERVER_ERROR"]({
    message,
  });
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

exports.getPatientAppointmentMetrics = async (userId) => {
  try {
    const { patient_id: patientId } = await getPatientByUserId(userId);

    if (!patientId) {
      logger.warn(`Patient Profile Not Found for user ${userId}`);
      return Response.NOT_FOUND({
        message:
          "Patient profile not found please, create profile before proceeding",
      });
    }

    const cacheKey = `patient:${patientId}:appointment-metrics`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const data = await repo.getPatientAppointmentsDashboardCount({ patientId });

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(data),
    });

    return Response.SUCCESS({ data });
  } catch (error) {
    logger.error("getPatientAppointmentCounts: ", error);
    throw error;
  }
};

exports.getPatientFollowUpMetrics = async (userId) => {
  try {
    const { patient_id: patientId } = await getPatientByUserId(userId);

    if (!patientId) {
      logger.warn(`Patient Profile Not Found for user ${userId}`);
      return Response.NOT_FOUND({
        message:
          "Patient profile not found please, create profile before proceeding",
      });
    }

    const cacheKey = `patient:${patientId}:follow-up-metrics`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const data = await countPatientFollowUp(patientId);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(data),
    });

    return Response.SUCCESS({ data });
  } catch (error) {
    logger.error("getPatientFollowUpMetrics: ", error);
    throw error;
  }
};

exports.getPatientAppointments = async (userId, limit, page) => {
  try {
    const { patient_id: patientId } = await getPatientByUserId(userId);

    if (!patientId) {
      logger.warn(`Patient Profile Not Found for user ${userId}`);
      return Response.NOT_FOUND({
        message:
          "Patient profile not found please, create profile before proceeding",
      });
    }

    const offset = (page - 1) * limit;
    const countCacheKey = `patient:${patientId}:appointments:count`;
    const totalRows = await getCachedCount({
      cacheKey: countCacheKey,
      countQueryFn: () => repo.countPatientAppointments({ patientId }),
    });

    if (!totalRows) {
      return Response.SUCCESS({
        message: "No patient appointments found",
        data: [],
      });
    }

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });
    const cacheKey = cacheKeyBulider(
      `patient:${patientId}:appointments:all`,
      limit,
      offset,
    );
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
    }
    const rawData = await repo.getAllPatientAppointments({
      patientId,
      offset,
      limit,
    });

    if (!rawData?.length) {
      return Response.SUCCESS({
        message: "No patient appointments found",
        data: [],
      });
    }

    const appointments = rawData.map(mapPatientAppointment);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(appointments),
      expiry: 60,
    });

    return Response.SUCCESS({ data: appointments, pagination: paginationInfo });
  } catch (error) {
    logger.error("getPatientAppointments: ", error);
    throw error;
  }
};

exports.getPatientAppointment = async ({ userId, id }) => {
  try {
    const patient = await getPatientByUserId(userId);

    if (!patient) {
      logger.warn(`Patient Profile Not Found for user ${userId}`);
      return Response.NOT_FOUND({
        message:
          "Patient profile not found please, create profile before proceeding",
      });
    }
    const { patient_id: patientId } = patient;
    const cacheKey = `patient:${patientId}:appointments:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const rawData = await repo.getPatientAppointmentById({
      patientId,
      appointmentId: id,
    });

    //  Check if the requesting user is the owner of the appointment
    if (!rawData) {
      logger.warn(`Appointment Not Found for ID ${id}`);
      return Response.NOT_FOUND({ message: "Appointment Not Found" });
    }
    const appointment = mapPatientAppointment(rawData);

    const rawFollowUps = await getAppointmentFollowUps(
      appointment.appointmentId,
    );
    const followUps = rawFollowUps.map(mapFollowUpsRow) || null;

    const appointmentWithFollowUp = {
      ...appointment,
      followUps,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(appointmentWithFollowUp),
      expiry: 60,
    });

    return Response.SUCCESS({ data: appointmentWithFollowUp });
  } catch (error) {
    logger.error("getPatientAppointment: ", error);
    throw error;
  }
};

/**
  @param {Object} params - The parameters for retrieving the appointment.
 * @param {string} params.userId - The ID of the user requesting the appointment.
 * @param {string} params.uuId - The UUID of the appointment to retrieve.
 * @returns {Promise<Object>} - A promise that resolves to the response object containing the appointment details or an error message.
 */
exports.getPatientAppointmentByUUID = async ({ userId, uuId }) => {
  try {
    const patient = await getPatientByUserId(userId);

    if (!patient) {
      logger.warn(`Patient Profile Not Found for user ${userId}`);
      return Response.NOT_FOUND({
        message:
          "Patient profile not found please, create profile before proceeding",
      });
    }

    const { patient_id: patientId } = patient;
    const cacheKey = `patient:${patientId}:appointments:uuid:${uuId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const rawData = await repo.getPatientAppointmentByUUID({
      patientId,
      uuId,
    });

    if (!rawData) {
      logger.warn(`Appointment Not Found for UUID ${uuId}`);
      return Response.NOT_FOUND({ message: "Appointment Not Found" });
    }

    const appointment = mapPatientAppointment(rawData);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(appointment),
      expiry: 60,
    });
    return Response.SUCCESS({ data: appointment });
  } catch (error) {
    logger.error("getPatientAppointmentByUUID: ", error);
    throw error;
  }
};
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
// TODO @Mevizcode I made some refactors here, please review
/**
 * Creates a new patient appointment.
 * @param {Object} params - The parameters for creating the appointment.
 * @param {string} params.userId - The ID of the user creating the appointment.
 * @param {string} params.doctorId - The ID of the doctor for the appointment.
 * @param {string} params.patientName - The name of the patient.
 * @param {string} params.patientNumber - The phone number of the patient.
 * @param {string} params.appointmentType - The type of appointment (e.g., "consultation").
 * @param {string} params.appointmentDate - The date of the appointment.
 * @param {string} params.appointmentTime - The time of the appointment.
 * @param {string} params.symptoms - The symptoms the patient is experiencing.
 * @param {string} params.specialtyId - The ID of the specialty for the appointment.
 * @returns {Promise<Object>} - A promise that resolves to the response object containing the appointment details or an error message.
 */
exports.createPatientAppointment = async ({
  userId,
  doctorId,
  patientName,
  patientNumber,
  appointmentType,
  appointmentDate,
  appointmentTime,
  symptoms,
  specialtyId,
}) => {
  console.time("createAppointmentTimer");
  try {
    // Step 1: Validate entities
    const {
      patient,
      doctor,
      error: validationError,
    } = await validateEntities({
      userId,
      doctorId,
      appointmentDate,
      appointmentTime,
    });
    if (validationError) return validationError;

    // Step 2: Prevent duplicate request
    const { error: idempotencyError } = await checkIdempotency({
      userId,
      doctorId,
      appointmentDate,
      appointmentTime,
      patientName,
    });
    if (idempotencyError) return idempotencyError;

    // Step 3: Extract patient details
    const { booked_first_appointment: hasBookedFirstAppointment } = patient;

    const appointmentResult = await createAppointment(
      {
        patientName,
        patientNumber,
        doctorId,
        symptoms,
        appointmentType,
        specialtyId,
        appointmentDate,
        appointmentTime,
      },
      { patient, doctor },
    );

    // Step 6: Handle first free appointment
    if (!hasBookedFirstAppointment) {
      return await processFirstAppointment(appointmentResult, {
        patient,
        doctor,
      });
    }
    // Step 7: Process regular appointment
    const response = await processRegularAppointment(appointmentResult);
    console.timeEnd("createAppointmentTimer");
    return response;
  } catch (error) {
    console.error(error);
    logger.error("createPatientAppointment", error);
    return failResponse("Unexpected error, please try again");
  }
};
