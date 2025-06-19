const {
  getAppointmentPrescriptions,
  getAppointmentPrescriptionById,
} = require("../../repository/prescriptions.repository");
const Response = require("../../utils/response.utils");
const redisClient = require("../../config/redis.config");
const {
  mapAppointmentPrescriptionRow,
} = require("../../utils/db-mapper.utils");

exports.getAppointmentPrescriptions = async (id) => {
  try {
    const cacheKey = "patient-prescriptions:all";
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await getAppointmentPrescriptions(id);

    const prescriptions = rawData.map(mapAppointmentPrescriptionRow);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(prescriptions),
    });

    return Response.SUCCESS({ data: prescriptions });
  } catch (error) {
    console.error(error);
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
    console.error(error);
    throw error;
  }
};
