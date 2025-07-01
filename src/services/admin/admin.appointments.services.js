const dbObject = require("../../repository/adminAppointments.repository");
const Response = require("../../utils/response.utils");
const redisClient = require("../../config/redis.config");
const { mapAdminAppointmentRow } = require("../../utils/db-mapper.utils");

exports.getAdminAppointments = async ({ limit, offset, paginationInfo }) => {
  try {
    const cacheKey = "admin-appointments:all";
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
    }
    const rawData = await dbObject.getAllAppointments({ limit, offset });

    const appointments = rawData.map(mapAdminAppointmentRow);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(appointments),
    });
    return Response.SUCCESS({ data: appointments, pagination: paginationInfo });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.getAdminAppointmentsByDoctorId = async (doctorId) => {
  try {
    const cacheKey = `admin-appointments-by-doctor-id:${doctorId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await dbObject.getAppointmentsByDoctorId(doctorId);

    const appointments = rawData.map(mapAdminAppointmentRow);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(appointments),
    });

    return Response.SUCCESS({ data: appointments });
  } catch (error) {
    console.error(error);
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
      return Response.NOT_FOUND({ message: "Appointment Not Found" });
    }

    const appointment = mapAdminAppointmentRow(rawData);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(appointment),
    });
    return Response.SUCCESS({ data: appointment });
  } catch (error) {
    console.error(error);
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

    const appointment = mapAdminAppointmentRow(rawData);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(appointment),
    });
    return Response.SUCCESS({ data: appointment });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
