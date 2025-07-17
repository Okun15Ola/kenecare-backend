const dbObject = require("../../repository/adminAppointments.repository");
const Response = require("../../utils/response.utils");
const { redisClient } = require("../../config/redis.config");
const { mapAdminAppointmentRow } = require("../../utils/db-mapper.utils");
const { cacheKeyBulider } = require("../../utils/caching.utils");
const logger = require("../../middlewares/logger.middleware");

exports.getAdminAppointments = async ({ limit, offset, paginationInfo }) => {
  try {
    const cacheKey = cacheKeyBulider("admin-appointments:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
    }
    const rawData = await dbObject.getAllAppointments(limit, offset);

    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No appointments found", data: [] });
    }

    const appointments = rawData.map(mapAdminAppointmentRow);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(appointments),
    });
    return Response.SUCCESS({ data: appointments, pagination: paginationInfo });
  } catch (error) {
    logger.error("getAdminAppointments: ", error);
    throw error;
  }
};
exports.getAdminAppointmentsByDoctorId = async (
  doctorId,
  limit,
  offset,
  paginationInfo,
) => {
  try {
    const cacheKey = cacheKeyBulider(
      `admin-appointments-by-doctor-id:${doctorId}`,
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
    const rawData = await dbObject.getAppointmentsByDoctorId(
      limit,
      offset,
      doctorId,
    );

    const appointments = rawData.map(mapAdminAppointmentRow);

    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No appointments found", data: [] });
    }

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(appointments),
    });

    return Response.SUCCESS({ data: appointments, pagination: paginationInfo });
  } catch (error) {
    logger.error("getAdminAppointmentsByDoctorId: ", error);
    throw error;
  }
};

exports.getAdminAppointmentById = async (id) => {
  try {
    const cacheKey = `admin-appointments:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await dbObject.getAppointmentById(id);

    if (!rawData) {
      logger.warn(`Admin Appointment Not Found for ID ${id}`);
      return Response.NOT_FOUND({ message: "Appointment Not Found" });
    }

    const appointment = mapAdminAppointmentRow(rawData);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(appointment),
    });
    return Response.SUCCESS({ data: appointment });
  } catch (error) {
    logger.error("getAdminAppointmentById: ", error);
    throw error;
  }
};

exports.getAdminAppointmentByUUID = async (uuid) => {
  try {
    const cacheKey = `admin-appointments-by-uuid:${uuid}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await dbObject.getAppointmentByUUID(uuid);

    if (!rawData) {
      logger.warn(`Admin Appointment Not Found for UUID ${uuid}`);
      return Response.NOT_FOUND({ message: "Appointment Not Found" });
    }

    const appointment = mapAdminAppointmentRow(rawData);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(appointment),
    });
    return Response.SUCCESS({ data: appointment });
  } catch (error) {
    logger.error("getAdminAppointmentByUUID: ", error);
    throw error;
  }
};
