const dbObject = require("../../repository/doctors.repository");
const Response = require("../../utils/response.utils");
const { USERTYPE } = require("../../utils/enum.utils");
const { getUserById } = require("../../repository/users.repository");
const {
  doctorCouncilRegistrationEmail,
  adminDoctorCouncilRegistrationEmail,
} = require("../../utils/email.utils");
const logger = require("../../middlewares/logger.middleware");

exports.getDoctorCouncilRegistration = async (id) => {
  try {
    const rawData = await dbObject.getDoctorByUserId(id);
    if (!rawData) {
      logger.error(`Doctor profile not found for userId: ${id}`);
      return Response.NOT_FOUND({ message: "Doctor Profile Not Found" });
    }

    const {
      doctor_id: doctorId,
      user_type: userType,
      user_id: userId,
    } = rawData;

    if (id !== userId || userType !== USERTYPE.DOCTOR) {
      logger.error(
        `Unauthorized access attempt by userId: ${id} for doctorId: ${doctorId}`,
      );
      return Response.UNAUTHORIZED({ message: "Unauthorized account access" });
    }

    const data = await dbObject.getDoctorMedicalCouncilRegistration({
      doctorId,
    });

    return Response.SUCCESS({ data });
  } catch (error) {
    logger.error("getDoctorCouncilRegistration: ", error);
    throw error;
  }
};

exports.createDoctorCouncilRegistration = async ({
  userId,
  councilId,
  regNumber,
  regYear,
  certIssuedDate,
  certExpiryDate,
  file,
}) => {
  try {
    if (!file) {
      logger.error("No file provided for council registration.");
      return Response.BAD_REQUEST({
        message: "Please upload medical council registration document.",
      });
    }
    const { user_type: userType } = await getUserById(userId);

    if (userType !== USERTYPE.DOCTOR) {
      logger.error(
        `Unauthorized action by userId: ${userId}. User type: ${userType}`,
      );
      return Response.UNAUTHORIZED({
        message: "Unauthorized Action.",
      });
    }
    const {
      doctor_id: doctorId,
      first_name: doctorFirstName,
      last_name: doctorLastName,
      email: doctorEmail,
    } = await dbObject.getDoctorByUserId(userId);
    if (!doctorId) {
      logger.error(
        `Doctor profile not found for userId: ${userId} while creating council registration`,
      );
      return Response.BAD_REQUEST({
        message: "Doctor Profile does not exist please create a profile. ",
      });
    }

    const councilRegistrationExist =
      await dbObject.getCouncilRegistrationByDoctorId(doctorId);

    if (councilRegistrationExist) {
      const {
        registration_status: registrationStatus,
        reject_reason: rejectReason,
      } = councilRegistrationExist;

      if (registrationStatus === "pending") {
        logger.warn(
          `Doctor with ID ${doctorId} has a pending council registration.`,
        );
        return Response.BAD_REQUEST({
          message:
            "Medical Council Registration PENDING. Approval takes up to 48 hours, if you're experiencing any delays please contact the admin for further instructions.",
        });
      }
      if (registrationStatus === "rejected") {
        logger.warn(
          `Doctor with ID ${doctorId} has a rejected council registration.`,
        );
        return Response.BAD_REQUEST({
          message: `Medical Council Registration was rejected by admin. Reason: ${rejectReason}`,
        });
      }

      if (registrationStatus === "approved") {
        logger.warn(
          `Doctor with ID ${doctorId} has an approved council registration.`,
        );
        return Response.BAD_REQUEST({
          message:
            "Medical Council Registration Already approved, cannot create new one. Please update/delete if  you wish to make changes to registration information.",
        });
      }
    }

    const { insertId } = await dbObject.createDoctorMedicalCouncilRegistration({
      doctorId,
      councilId,
      regNumber,
      regYear,
      certIssuedDate,
      certExpiryDate,
      filename: file.filename,
    });

    if (!insertId) {
      logger.error(
        `Failed to create council registration for doctorId: ${doctorId}`,
      );
      return Response.INTERNAL_SERVER_ERROR({
        message: "Failed to create Medical Council Registration.",
      });
    }

    // send an email with further instructions

    await Promise.all([
      adminDoctorCouncilRegistrationEmail({
        doctorName: `${doctorFirstName} ${doctorLastName}`,
      }),
      doctorCouncilRegistrationEmail({
        doctorEmail,
        doctorName: `${doctorFirstName} ${doctorLastName}`,
      }),
    ]);

    return Response.CREATED({
      message:
        "Medical Council Registration Successfully Submitted. Your information is awaiting approval. You will be notified by email when once your documents are approved.",
    });
  } catch (error) {
    logger.error("createDoctorCouncilRegistration: ", error);
    throw error;
  }
};
exports.updateDoctorCouncilRegistration = async ({
  userId,
  councilId,
  regNumber,
  regYear,
  certIssuedDate,
  certExpiryDate,
  file,
}) => {
  try {
    if (!file) {
      logger.error("No file provided for council registration.");
      return Response.BAD_REQUEST({
        message: "Please upload medical council registration document.",
      });
    }
    const { user_type: userType } = await getUserById(userId);

    if (userType !== USERTYPE.DOCTOR) {
      logger.error(
        `Unauthorized action by userId: ${userId}. User type: ${userType}`,
      );
      return Response.UNAUTHORIZED({
        message: "Unauthorized Action.",
      });
    }
    const {
      doctor_id: doctorId,
      first_name: doctorFirstName,
      last_name: doctorLastName,
      email: doctorEmail,
    } = await dbObject.getDoctorByUserId(userId);
    if (!doctorId) {
      logger.error(
        `Doctor profile not found for userId: ${userId} while updating council registration`,
      );
      return Response.BAD_REQUEST({
        message: "Doctor Profile does not exist please create a profile. ",
      });
    }

    const councilRegistrationExist =
      await dbObject.getCouncilRegistrationByDoctorId(doctorId);

    if (councilRegistrationExist) {
      const {
        registration_status: registrationStatus,
        reject_reason: rejectReason,
      } = councilRegistrationExist;

      if (registrationStatus === "pending") {
        logger.warn(
          `Doctor with ID ${doctorId} has a pending council registration.`,
        );
        return Response.BAD_REQUEST({
          message:
            "Medical Council Registration PENDING. Approval takes up to 48 hours, if you're experiencing any delays please contact the admin for further instructions.",
        });
      }
      if (registrationStatus === "rejected") {
        logger.warn(
          `Doctor with ID ${doctorId} has a rejected council registration.`,
        );
        return Response.BAD_REQUEST({
          message: `Medical Council Registration was rejected by admin. Reason: ${rejectReason}`,
        });
      }

      if (registrationStatus === "approved") {
        logger.warn(
          `Doctor with ID ${doctorId} has an approved council registration.`,
        );
        return Response.BAD_REQUEST({
          message:
            "Medical Council Registration Already approved, cannot create new one. Please update/delete if  you wish to make changes to registration information.",
        });
      }
    }

    const { insertId } = await dbObject.createDoctorMedicalCouncilRegistration({
      doctorId,
      councilId,
      regNumber,
      regYear,
      certIssuedDate,
      certExpiryDate,
      filename: file.filename,
    });

    if (!insertId) {
      logger.error(
        `Failed to create council registration for doctorId: ${doctorId}`,
      );
      return Response.INTERNAL_SERVER_ERROR({
        message: "Failed to create Medical Council Registration.",
      });
    }

    // send an email with further instructions

    await Promise.all([
      adminDoctorCouncilRegistrationEmail({
        doctorName: `${doctorFirstName} ${doctorLastName}`,
      }),
      doctorCouncilRegistrationEmail({
        doctorEmail,
        doctorName: `${doctorFirstName} ${doctorLastName}`,
      }),
    ]);

    return Response.CREATED({
      message:
        "Medical Council Registration Successfully Submitted. Your information is awaiting approval. You will be notified by email when once your documents are approved.",
    });
  } catch (error) {
    logger.error("updateDoctorCouncilRegistration: ", error);
    throw error;
  }
};
