const dbObject = require("../../repository/admin-doctors.repository");
const Response = require("../../utils/response.utils");
const {
  doctorCouncilRegistrationApprovedEmail,
  doctorCouncilRegistrationRejectedEmail,
} = require("../../utils/email.utils");
const { redisClient } = require("../../config/redis.config");
const { mapCouncilRegistrationRow } = require("../../utils/db-mapper.utils");
const {
  cacheKeyBulider,
  getCachedCount,
  getPaginationInfo,
} = require("../../utils/caching.utils");
const logger = require("../../middlewares/logger.middleware");

exports.getAllCouncilRegistrations = async (limit, page) => {
  try {
    const offset = (page - 1) * limit;
    const countCacheKey = "admin:doctors-council:count";
    const totalRows = await getCachedCount({
      cacheKey: countCacheKey,
      countQueryFn: dbObject.getAllMedicalCouncilRegistrationCount,
    });

    if (!totalRows) {
      return Response.SUCCESS({
        message: "No medical council registrations found",
        data: [],
      });
    }

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });
    const cacheKey = cacheKeyBulider(
      "admin:doctors-council:all",
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
    const rawData = await dbObject.getAllMedicalCouncilRegistration(
      limit,
      offset,
    );
    if (!rawData?.length) {
      return Response.SUCCESS({
        message: "No medical council registrations found",
        data: [],
      });
    }
    const registrations = await Promise.all(
      rawData.map(mapCouncilRegistrationRow),
    );
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(registrations),
    });
    return Response.SUCCESS({
      data: registrations,
      pagination: paginationInfo,
    });
  } catch (error) {
    logger.error("getAllCouncilRegistrations: ", error);
    throw error;
  }
};

exports.getCouncilRegistration = async (id) => {
  try {
    const cacheKey = `admin:doctors-council-registrations:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await dbObject.getCouncilRegistrationById(id);

    if (!rawData) {
      logger.warn(`Medical Council Registration Not Found for ID ${id}`);
      return Response.NOT_FOUND({
        message: "Medical Council Registration Not Found",
      });
    }
    const registration = await mapCouncilRegistrationRow(rawData);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(registration),
    });
    return Response.SUCCESS({ data: registration });
  } catch (error) {
    logger.error("getCouncilRegistration: ", error);
    throw error;
  }
};

exports.approveCouncilRegistration = async ({ regId, userId }) => {
  try {
    const rawData = await dbObject.getCouncilRegistrationById(regId);
    if (!rawData) {
      logger.warn(`Medical Council Registration Not Found for ID ${regId}`);
      return Response.NOT_FOUND({
        message: "Medical Council Registration Not Found",
      });
    }

    const {
      registration_status: registrationStats,
      doctor_id: doctorId,
      first_name: firstName,
      last_name: lastName,
    } = rawData;

    if (registrationStats === "approved") {
      logger.warn("Medical Council Registration Already Approved");
      return Response.NOT_MODIFIED();
    }

    const [doctor] = await Promise.allSettled([
      dbObject.getDoctorById(doctorId),
      dbObject.approveDoctorMedicalCouncilRegistrationById({
        registrationId: regId,
        approvedBy: userId,
      }),
    ]).catch((error) => {
      logger.error("approveCouncilRegistration: ", error);
      throw error;
    });

    const { email: doctorEmail } = doctor.value;

    //  send email notification to doctor upon approval
    await doctorCouncilRegistrationApprovedEmail({
      doctorEmail,
      doctorName: `${firstName} ${lastName}`,
    });
    return Response.SUCCESS({
      message: "Doctor's Medical Council Registration Approved Successfully",
    });
  } catch (error) {
    logger.error("approveCouncilRegistration: ", error);
    throw error;
  }
};

exports.rejectCouncilRegistration = async ({
  regId,
  rejectionReason,
  userId,
}) => {
  try {
    const rawData = await dbObject.getCouncilRegistrationById(regId);
    if (!rawData) {
      logger.warn(`Medical Council Registration Not Found for ID ${regId}`);
      return Response.NOT_FOUND({
        message: "Medical Council Registration Not Found",
      });
    }

    const {
      registration_status: registrationStatus,
      doctor_id: doctorId,
      first_name: firstName,
      last_name: lastName,
    } = rawData;

    if (registrationStatus === "rejected") {
      logger.warn("Medical Council Registration Already Rejected");
      return Response.NOT_MODIFIED();
    }

    const [doctor] = await Promise.allSettled([
      dbObject.getDoctorById(doctorId),
      dbObject.rejectDoctorMedicalCouncilRegistrationById({
        registrationId: regId,
        rejectionReason,
        approvedBy: userId,
      }),
    ]).catch((error) => {
      logger.error("rejectCouncilRegistration: ", error);
      throw error;
    });

    const { email: doctorEmail } = doctor.value;

    //  send email notification to doctor upon approval
    await doctorCouncilRegistrationRejectedEmail({
      doctorEmail,
      doctorName: `${firstName} ${lastName}`,
    });
    return Response.SUCCESS({
      message: "Doctor's Medical Council Registration Rejected Successfully",
    });
  } catch (error) {
    logger.error("rejectCouncilRegistration: ", error);
    throw error;
  }
};
