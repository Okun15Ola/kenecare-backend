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
  let appointmentId = null;
  try {
    // Parallel validation - Get patient, doctor, and check availability
    const [patient, doctor, timeBooked] = await Promise.allSettled([
      getPatientByUserId(userId),
      getDoctorById(doctorId),
      getDoctorAppointByDateAndTime({
        doctorId,
        date: appointmentDate,
        time: appointmentTime,
      }),
    ]);

    //  validate patient
    if (patient.status === "rejected") {
      logger.warn("Patient Profile Not Found for user");
      return Response.BAD_REQUEST({
        message:
          "Please create a patient profile before booking an appointment",
      });
    }

    const {
      patient_id: patientId,
      first_name: userFirstName,
      last_name: userLastName,
      booked_first_appointment: hasBookedFirstAppointment,
      mobile_number: mobileNumber,
    } = patient.value;

    // encrypt patient data
    const patientFirstName = decryptText(userFirstName);
    const patientLastName = decryptText(userLastName);
    const encryptedPatientName = encryptText(patientName);
    const encryptedSymptoms = encryptText(symptoms);

    // validate doctor
    if (doctor.status === "rejected") {
      logger.warn("Doctor Not Found for ID");
      return Response.BAD_REQUEST({
        message: "Specified Doctor does not exist. Please try again",
      });
    }

    const {
      consultation_fee: consultationFee,
      first_name: doctorFirstName,
      last_name: doctorLastName,
      mobile_number: doctorMobileNumber,
    } = doctor.value;

    if (timeBooked.status === "fulfilled" && timeBooked.value) {
      logger.warn(
        `Appointment already booked for Doctor ${doctorId} on ${appointmentDate} at ${appointmentTime}`,
      );
      return Response.BAD_REQUEST({
        message:
          "An appointment has already been booked for the specified time. Please choose a new appointment time",
      });
    }

    const proposedAppointmentStartDateTime = `${appointmentDate} ${appointmentTime}`;
    const isDoctorAvailable = await checkDoctorAvailability(
      doctorId,
      proposedAppointmentStartDateTime,
    );

    if (!isDoctorAvailable) {
      logger.warn(
        `Doctor ${doctorId} is unavailable at ${proposedAppointmentStartDateTime} due to existing commitments or off-hours.`,
      );
      return Response.CONFLICT({
        message:
          "Doctor is not available at the requested time. Please choose another time slot.",
      });
    }

    // create a hash of the request
    const requestHash = crypto
      .createHash("sha256")
      .update(
        `${userId}:${doctorId}:${appointmentDate}:${appointmentTime}:${patientName}`,
      )
      .digest("hex");

    // check if we've seen this request recently
    const idempotencyCacheKey = `appointment:idempotency:${requestHash}`;
    const existingRequest = await redisClient.get(idempotencyCacheKey);

    if (existingRequest) {
      logger.warn(`Duplicate appointment request detected: ${requestHash}`);
      return Response.BAD_REQUEST({
        message:
          "It appears you've already submitted this appointment request. Please check your appointments.",
      });
    }

    await redisClient.set({
      key: idempotencyCacheKey,
      value: Date.now().toString(),
      expiry: 600, // 10 mins
    });

    const generatedOrderId = uuidv4();

    const appointmentResult = await repo.createNewPatientAppointment({
      uuid: generatedOrderId,
      patientId,
      doctorId,
      patientName: encryptedPatientName,
      patientNumber,
      symptoms: encryptedSymptoms,
      appointmentType,
      consultationFee,
      specialtyId,
      appointmentDate,
      appointmentTime,
    });

    appointmentId = appointmentResult.insertId;

    if (!appointmentId) {
      logger.error("Failed to create new patient appointment");
      return Response.INTERNAL_SERVER_ERROR({
        message: "An error occurred, please try again",
      });
    }

    if (!hasBookedFirstAppointment) {
      const [
        appointmentResult,
        updateAppointmentResult,
        appointmentSms,
        doctorAppointmentSms,
      ] = await Promise.allSettled([
        createFirstAppointmentPayment({
          appointmentId,
          amountPaid: consultationFee,
          orderId: generatedOrderId,
          paymentMethod: "FIRST_FREE_APPOINTMENT",
          transactionId: "FIRST_FREE_APPOINTMENT",
          paymentToken: "FIRST_FREE_APPOINTMENT",
          notificationToken: "FIRST_FREE_APPOINTMENT",
          status: "success",
        }),
        updatePatientFirstAppointmentStatus(patientId),
        appointmentBookedSms({
          mobileNumber,
          patientName: `${patientFirstName} ${patientLastName}`,
          doctorName: `${doctorFirstName} ${doctorLastName}`,
          patientNameOnPrescription: patientName,
          appointmentDate: moment(appointmentDate).format("YYYY-MM-DD"),
          appointmentTime,
        }),
        doctorAppointmentBookedSms({
          mobileNumber: doctorMobileNumber,
          doctorName: `${doctorLastName}`,
          patientNameOnPrescription: patientName,
          appointmentDate: moment(appointmentDate).format("YYYY-MM-DD"),
          appointmentTime,
        }),
      ]);

      if (
        appointmentResult.status === "rejected" ||
        updateAppointmentResult.status === "rejected" ||
        appointmentSms.status === "rejected" ||
        doctorAppointmentSms.status === "rejected"
      ) {
        logger.error(
          `Error processing first appointment booking for appointment ID ${appointmentId}: `,
          appointmentResult.reason ||
            updateAppointmentResult.reason ||
            appointmentSms.reason ||
            doctorAppointmentSms.reason,
        );
        await repo.deleteAppointmentById({ appointmentId });
        await redisClient.del(idempotencyCacheKey);
        await redisClient.clearCacheByPattern(
          `patient:${patientId}:appointments:*`,
        );
        await redisClient.clearCacheByPattern(
          `doctor:${doctorId}:appointments:*`,
        );
        return Response.INTERNAL_SERVER_ERROR({
          message:
            "An error occurred on our side during first appointment processing. Please try again.",
        });
      }
      await redisClient.clearCacheByPattern(
        `patient:${patientId}:appointments:*`,
      );
      await redisClient.clearCacheByPattern(
        `doctor:${doctorId}:appointments:*`,
      );
      return Response.CREATED({
        message:
          "First Free Medical Appointment Booked Successfully. Thank you for choosing Kenecare",
        data: {
          paymentUrl: null,
          firstAppointment: true,
        },
      });
    }
    // Get and send payment url to process payment
    const paymentResponse = await getPaymentUSSD({
      orderId: generatedOrderId,
      amount: consultationFee,
    }).catch((error) => {
      logger.error(
        `Error getting payment URL for appointment ID ${appointmentId}: `,
        error,
      );
      throw error;
    });

    if (!paymentResponse) {
      logger.error(
        `Failed to get payment URL for appointment ID ${appointmentId}`,
      );
      await repo.deleteAppointmentById({ appointmentId });
      await redisClient.del(idempotencyCacheKey);
      await redisClient.clearCacheByPattern(
        `patient:${patientId}:appointments:*`,
      );
      await redisClient.clearCacheByPattern(
        `doctor:${doctorId}:appointments:*`,
      );
      return Response.INTERNAL_SERVER_ERROR({
        message: "An error occurred when preparing payment. Please try again.",
      });
    }

    const { ussdCode, paymentCodeId, idempotencyKey, expiresAt, cancelUrl } =
      paymentResponse;

    // create new appointment payments record
    const appointmentPaymentRecord = await createAppointmentPayment({
      appointmentId,
      amountPaid: consultationFee,
      orderId: generatedOrderId,
      paymentMethod: "MOBILE_MONEY",
      paymentToken: ussdCode,
      notificationToken: idempotencyKey,
      transactionId: paymentCodeId,
    });

    if (!appointmentPaymentRecord || !appointmentPaymentRecord.insertId) {
      logger.error(
        `Failed to create appointment payment record for appointment ID ${appointmentId}`,
      );
      await repo.deleteAppointmentById({ appointmentId });
      await redisClient.del(idempotencyCacheKey);
      await redisClient.clearCacheByPattern(
        `patient:${patientId}:appointments:*`,
      );
      return Response.INTERNAL_SERVER_ERROR({
        message:
          "An error occurred while saving payment details. Please try again.",
      });
    }

    await redisClient.clearCacheByPattern(
      `patient:${patientId}:appointments:*`,
    );
    await redisClient.clearCacheByPattern(`doctor:${doctorId}:appointments:*`);
    return Response.CREATED({
      message: "Appointment Booked Successfully. Proceed to payment.",
      data: {
        paymentUrl: ussdCode,
        cancelUrl,
        paymentUrlExpiresAt: expiresAt,
      },
    });
  } catch (error) {
    logger.error("Error in createPatientAppointment:", error);
    throw error;
  }
};
