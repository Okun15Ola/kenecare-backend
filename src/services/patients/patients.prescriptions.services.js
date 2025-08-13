const {
  getAppointmentPrescriptions,
  getAppointmentPrescriptionById,
} = require("../../repository/prescriptions.repository");
const Response = require("../../utils/response.utils");
const { redisClient } = require("../../config/redis.config");
const { mapPrescriptionRow } = require("../../utils/db-mapper.utils");
const logger = require("../../middlewares/logger.middleware");

exports.getAppointmentPrescriptions = async (id) => {
  try {
    const cacheKey = `appointment:${id}:prescriptions`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
      });
    }
    const rawData = await getAppointmentPrescriptions(id);

    if (!rawData) {
      return Response.NOT_FOUND({
        message: "No prescriptions found",
      });
    }

    const prescription = mapPrescriptionRow(rawData, true, true, true);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(prescription),
    });

    return Response.SUCCESS({
      data: prescription,
    });
  } catch (error) {
    logger.error("getAppointmentPrescriptions: ", error);
    throw error;
  }
};

exports.getAppointmentPrescriptionById = async (presId) => {
  try {
    const cacheKey = `prescriptions:${presId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await getAppointmentPrescriptionById(presId);

    if (!rawData) {
      logger.warn(`Prescription Not Found for ID ${presId} `);
      return Response.NOT_FOUND({
        message: "Prescription Not Found. Try again",
      });
    }

    const prescription = mapPrescriptionRow(rawData, true, true, true);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(prescription),
      expiry: 60,
    });

    return Response.SUCCESS({ data: prescription });
  } catch (error) {
    logger.error("getAppointmentPrescriptionById: ", error);
    throw error;
  }
};
