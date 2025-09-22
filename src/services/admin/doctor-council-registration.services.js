const moment = require("moment");
const dbObject = require("../../repository/admin-doctors.repository");
const councilRegRepo = require("../../repository/medical-councils.repository");
const Response = require("../../utils/response.utils");
const {
  doctorCouncilRegistrationApprovedEmail,
  doctorCouncilRegistrationRejectedEmail,
} = require("../../utils/email.utils");
const { redisClient } = require("../../config/redis.config");
const { mapCouncilRegistrationRow } = require("../../utils/db-mapper.utils");
const { getPaginationInfo } = require("../../utils/caching.utils");
const logger = require("../../middlewares/logger.middleware");

exports.getAllCouncilRegistrations = async (limit, page) => {
  try {
    const offset = (page - 1) * limit;
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

    const { totalRows } = rawData[0];

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

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
    const rawData = await dbObject.getCouncilRegistrationById(id);

    if (!rawData) {
      logger.warn(`Medical Council Registration Not Found for ID ${id}`);
      return Response.NOT_FOUND({
        message: "Medical Council Registration Not Found",
      });
    }
    const registration = await mapCouncilRegistrationRow(rawData);

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
        message: "Medical Council Registration Not Found for this Doctor",
      });
    }

    const {
      registration_status: registrationStats,
      doctor_id: doctorId,
      first_name: firstName,
      last_name: lastName,
      certificate_expiry_date: certificateExpiryDate,
    } = rawData;

    if (moment(certificateExpiryDate).isBefore(moment())) {
      councilRegRepo.updateDoctorCouncilRegistrationExpiredStatus(regId);
      return Response.BAD_REQUEST({
        message: `Doctor's certificate has expired on ${moment(certificateExpiryDate).format("YYYY-MM-DD HH:mm:ss")}`,
      });
    }

    if (registrationStats === "approved") {
      return Response.NOT_MODIFIED({});
    }

    // Use Promise.allSettled to ensure both database operations complete
    const [doctorResult, approvalResult] = await Promise.allSettled([
      dbObject.getDoctorById(doctorId),
      dbObject.approveDoctorMedicalCouncilRegistrationById({
        registrationId: regId,
        approvedBy: userId,
      }),
    ]);

    // Check if the getDoctorById promise succeeded
    if (doctorResult.status !== "fulfilled" || !doctorResult.value) {
      logger.error("Failed to get doctor details: ", doctorResult.reason);
      return Response.INTERNAL_SERVER_ERROR({
        message: "An unexpected error occurred",
      });
    }

    // Check if the approval promise succeeded
    if (approvalResult.status !== "fulfilled") {
      logger.error("Failed to approve registration: ", approvalResult.reason);
      return Response.INTERNAL_SERVER_ERROR({
        message:
          "An unexpected error occurred while approving the registration.",
      });
    }

    const { email: doctorEmail } = doctorResult.value;

    //  send email notification to doctor upon approval
    await doctorCouncilRegistrationApprovedEmail({
      doctorEmail,
      doctorName: `${firstName} ${lastName}`,
    });

    await Promise.all([
      redisClient.clearCacheByPattern(
        `doctor:${doctorId}:council-registration:*`,
      ),
      redisClient.clearCacheByPattern(`doctors:${doctorId}:*`),
    ]);

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
        message: "Medical Council Registration Not Found for this Doctor",
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
      return Response.NOT_MODIFIED({});
    }

    const [doctorResult, rejectionResult] = await Promise.allSettled([
      dbObject.getDoctorById(doctorId),
      dbObject.rejectDoctorMedicalCouncilRegistrationById({
        registrationId: regId,
        rejectionReason,
        approvedBy: userId,
      }),
    ]);

    if (rejectionResult.status !== "fulfilled") {
      logger.error("Failed to reject registration: ", rejectionResult.reason);
      return Response.INTERNAL_SERVER_ERROR({
        message:
          "An unexpected error occurred while rejecting the registration.",
      });
    }

    if (doctorResult.status !== "fulfilled" || !doctorResult.value) {
      logger.error("Failed to get doctor details: ", doctorResult.reason);
      return Response.INTERNAL_SERVER_ERROR({
        message: "An unexpected error occurred.",
      });
    }

    const { email: doctorEmail } = doctorResult.value;

    //  send email notification to doctor upon approval
    await doctorCouncilRegistrationRejectedEmail({
      doctorEmail,
      doctorName: `${firstName} ${lastName}`,
    });
    await Promise.all([
      redisClient.clearCacheByPattern(
        `doctor:${doctorId}:council-registration:*`,
      ),
      redisClient.clearCacheByPattern(`doctors:${doctorId}:*`),
    ]);
    return Response.SUCCESS({
      message: "Doctor's Medical Council Registration Rejected Successfully",
    });
  } catch (error) {
    logger.error("rejectCouncilRegistration: ", error);
    throw error;
  }
};
