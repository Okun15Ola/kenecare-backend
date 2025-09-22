const logger = require("../../middlewares/logger.middleware");
const repo = require("../../repository/patientAppointments.repository");
const { getPatientByUserId } = require("../../repository/patients.repository");
const {
  countPatientFollowUp,
} = require("../../repository/follow-up.repository");
const Response = require("../../utils/response.utils");
const {
  getAppointmentFollowUps,
} = require("../../repository/follow-up.repository");
const { redisClient } = require("../../config/redis.config");
const {
  mapPatientAppointment,
  mapFollowUpsRow,
} = require("../../utils/db-mapper.utils");
const {
  // cacheKeyBulider,
  getPaginationInfo,
} = require("../../utils/caching.utils");
const {
  checkIdempotency,
  validateEntities,
  processFirstAppointment,
  processRegularAppointment,
  createAppointment,
} = require("../../utils/helpers.utils");

function failResponse(message, code = 500) {
  return Response[code === 400 ? "BAD_REQUEST" : "INTERNAL_SERVER_ERROR"]({
    message,
  });
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

    // const cacheKey = cacheKeyBulider(
    //   `patient:${patientId}:appointments:all`,
    //   limit,
    //   offset,
    // );
    // const cachedData = await redisClient.get(cacheKey);
    // if (cachedData) {
    //   const { data, pagination } = JSON.parse(cachedData);
    //   return Response.SUCCESS({ data, pagination });
    // }
    const rawData = await repo.getAllPatientAppointments({
      patientId,
      offset,
      limit,
    });

    if (!rawData?.length) {
      return Response.SUCCESS({
        message: "No Appointments Found for this Patient",
        data: [],
      });
    }

    const appointments = rawData.map(mapPatientAppointment);

    const { totalRows } = rawData[0];

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    // const valueToCache = {
    //   data: appointments,
    //   pagination: paginationInfo,
    // };

    // await redisClient.set({
    //   key: cacheKey,
    //   value: JSON.stringify(valueToCache),
    //   expiry: 60,
    // });

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
    // const cacheKey = `patient:${patientId}:appointments:${id}`;
    // const cachedData = await redisClient.get(cacheKey);
    // if (cachedData) {
    //   return Response.SUCCESS({ data: JSON.parse(cachedData) });
    // }

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

    // await redisClient.set({
    //   key: cacheKey,
    //   value: JSON.stringify(appointmentWithFollowUp),
    //   expiry: 60,
    // });

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
  try {
    // Step 1: Validate entities
    const { patient, doctor, error } = await validateEntities({
      userId,
      doctorId,
      appointmentDate,
      appointmentTime,
    });
    if (error) return error;

    // Step 2: Prevent duplicate request
    const { idempotencyError } = await checkIdempotency({
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

    return response;
  } catch (error) {
    console.error(error);
    logger.error("createPatientAppointment", error);
    return failResponse("Unexpected error, please try again");
  }
};
