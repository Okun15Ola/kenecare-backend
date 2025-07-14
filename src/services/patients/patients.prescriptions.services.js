const {
  getAppointmentPrescriptions,
  getAppointmentPrescriptionById,
} = require("../../repository/prescriptions.repository");
const Response = require("../../utils/response.utils");
const { redisClient } = require("../../config/redis.config");
const {
  mapAppointmentPrescriptionRow,
} = require("../../utils/db-mapper.utils");
const { cacheKeyBulider } = require("../../utils/caching.utils");
const logger = require("../../middlewares/logger.middleware");

exports.getAppointmentPrescriptions = async (
  id,
  limit,
  offset,
  paginationInfo,
) => {
  try {
    const cacheKey = cacheKeyBulider(
      "patient-prescriptions:all",
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
    const rawData = await getAppointmentPrescriptions(limit, offset, id);

    if (!rawData?.length) {
      logger.warn(`Prescription Not Found ${id}`);
      return Response.NOT_FOUND({
        message: "Presciption Not Found",
      });
    }

    const prescriptions = rawData.map(mapAppointmentPrescriptionRow);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(prescriptions),
    });

    return Response.SUCCESS({
      data: prescriptions,
      pagination: paginationInfo,
    });
  } catch (error) {
    logger.error("getAppointmentPrescriptions: ", error);
    throw error;
  }
};

exports.getAppointmentPrescriptionById = async (presId) => {
  try {
    const cacheKey = `patient-prescriptions:${presId}`;
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
    const prescription = mapAppointmentPrescriptionRow(rawData);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(prescription),
    });

    return Response.SUCCESS({ data: prescription });
  } catch (error) {
    logger.error("getAppointmentPrescriptionById: ", error);
    throw error;
  }
};
