const dbObject = require("../../repository/admin-doctors.repository");
const Response = require("../../utils/response.utils");
const { doctorProfileApprovalSms } = require("../../utils/sms.utils");
const { mapDoctorRow } = require("../../utils/db-mapper.utils");
const { redisClient } = require("../../config/redis.config");
const {
  cacheKeyBulider,
  getCachedCount,
  getPaginationInfo,
} = require("../../utils/caching.utils");
const logger = require("../../middlewares/logger.middleware");

exports.getAllDoctors = async (limit, page) => {
  try {
    const offset = (page - 1) * limit;
    const countCacheKey = "admin:doctors:count";
    const totalRows = await getCachedCount({
      cacheKey: countCacheKey,
      countQueryFn: dbObject.countDoctors,
    });

    if (!totalRows) {
      return Response.SUCCESS({ message: "No doctors found", data: [] });
    }

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });
    const cacheKey = cacheKeyBulider("admin:doctors:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
    }

    const rawData = await dbObject.getAllDoctors(limit, offset);

    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No doctors found", data: [] });
    }

    const doctors = await Promise.all(rawData.map(mapDoctorRow));

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(doctors),
    });

    return Response.SUCCESS({ data: doctors, pagination: paginationInfo });
  } catch (error) {
    logger.error("getAllDoctors: ", error);
    throw error;
  }
};

exports.getDoctorById = async (id) => {
  try {
    const cacheKey = `admin:doctor:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
      });
    }
    const data = await dbObject.getDoctorById(id);

    if (!data) {
      logger.error(`Doctor not found for ID: ${id}`);
      return Response.NOT_FOUND({ message: "Doctor Not Found" });
    }

    const doctor = await mapDoctorRow(data);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(doctor),
    });

    return Response.SUCCESS({ data: doctor });
  } catch (error) {
    logger.error("getDoctorById: ", error);
    throw error;
  }
};

exports.approveDoctorProfile = async ({ doctorId, approvedBy }) => {
  try {
    const doctor = await dbObject.getDoctorById(doctorId);
    if (!doctor) {
      logger.error(`Doctor not found for ID: ${doctorId}`);
      return Response.NOT_FOUND({ message: "Doctor Not Found" });
    }

    const {
      is_profile_approved: isProfileApproved,
      mobile_number: mobileNumber,
      first_name: firstName,
      last_name: lastName,
    } = doctor;

    if (isProfileApproved) {
      logger.warn(`Doctor profile with ID ${doctorId} is already approved.`);
      return Response.NOT_MODIFIED();
    }

    await Promise.allSettled([
      dbObject.approveDoctorProfileByDoctorId({ doctorId, approvedBy }),
      doctorProfileApprovalSms({
        mobileNumber,
        doctorName: `${firstName} ${lastName}`,
      }),
    ]);

    return Response.SUCCESS({
      message: "Doctor profile approved successfully.",
    });
  } catch (error) {
    logger.error("approveDoctorProfile: ", error);
    throw error;
  }
};
