const dbObject = require("../../repository/adminAppointments.repository");
const Response = require("../../utils/response.utils");
const { redisClient } = require("../../config/redis.config");
const { mapAdminAppointmentRow } = require("../../utils/db-mapper.utils");
const logger = require("../../middlewares/logger.middleware");
const {
  cacheKeyBulider,
  getPaginationInfo,
} = require("../../utils/caching.utils");

exports.getAdminAppointments = async ({ limit, page }) => {
  try {
    const offset = (page - 1) * limit;
    const cacheKey = cacheKeyBulider("admin:appointments:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({ data, pagination });
    }

    const rawData = await dbObject.getAllAppointments(limit, offset);

    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No appointments found", data: [] });
    }

    const { totalRows } = rawData[0];

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const appointments = rawData.map(mapAdminAppointmentRow);

    const valueToCache = {
      data: appointments,
      pagination: paginationInfo,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(valueToCache),
    });
    return Response.SUCCESS({ data: appointments, pagination: paginationInfo });
  } catch (error) {
    logger.error("getAdminAppointments: ", error);
    throw error;
  }
};

exports.getAdminAppointmentsByDoctorId = async (doctorId, limit, page) => {
  try {
    const offset = (page - 1) * limit;
    const cacheKey = cacheKeyBulider(
      `admin:appointments:doctor:${doctorId}`,
      limit,
      offset,
    );

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({ data, pagination });
    }

    const rawData = await dbObject.getAppointmentsByDoctorId(
      limit,
      offset,
      doctorId,
    );

    if (!rawData?.length) {
      return Response.SUCCESS({
        message: "No appointments found for this doctor",
        data: [],
      });
    }

    const appointments = rawData.map(mapAdminAppointmentRow);

    const { totalRows } = rawData[0];

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const valueToCache = {
      data: appointments,
      pagination: paginationInfo,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(valueToCache),
    });

    return Response.SUCCESS({ data: appointments, pagination: paginationInfo });
  } catch (error) {
    logger.error("getAdminAppointmentsByDoctorId: ", error);
    throw error;
  }
};

exports.getAdminAppointmentById = async (id) => {
  try {
    const cacheKey = `admin:appointments:${id}`;
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
    const cacheKey = `admin:appointments:uuid:${uuid}`;
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
