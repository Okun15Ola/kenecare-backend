const moment = require("moment");
const repo = require("../../repository/patients.repository");
const Response = require("../../utils/response.utils");
const {
  USERTYPE,
  STATUS,
  VERIFICATIONSTATUS,
} = require("../../utils/enum.utils");
const { getUserById } = require("../../repository/users.repository");
const {
  getMarketerByReferralCode,
  getMarketersTotalRegisteredUsers,
} = require("../../repository/marketers.repository");
const {
  getAllTestimonials,
} = require("../../repository/testimonials.repository");
const { sendMarketerUserRegisteredSMS } = require("../../utils/sms.utils");
const { redisClient } = require("../../config/redis.config");
const { cacheKeyBulider } = require("../../utils/caching.utils");
const {
  mapPatientRow,
  mapMedicalRecordRow,
} = require("../../utils/db-mapper.utils");
const logger = require("../../middlewares/logger.middleware");
const {
  uploadFileToS3Bucket,
  deleteFileFromS3Bucket,
} = require("../../utils/aws-s3.utils");
const { generateFileName } = require("../../utils/file-upload.utils");

exports.getAllPatients = async (limit, offset, paginationInfo) => {
  try {
    const cacheKey = cacheKeyBulider("patients:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
    }
    const rawData = await repo.getAllPatients(limit, offset);

    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No patients found", data: [] });
    }

    const patients = await Promise.all(rawData.map(mapPatientRow));
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(patients),
    });
    return Response.SUCCESS({ data: patients, pagination: paginationInfo });
  } catch (error) {
    logger.error("getAllPatients: ", error);
    throw error;
  }
};
exports.getPatientById = async (id) => {
  try {
    const cacheKey = `patients:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await repo.getPatientById(id);
    if (!rawData) {
      logger.warn(`Patient Profile Not Found for ID: ${id}`);
      return Response.NOT_FOUND({
        errorCode: "PROFILE_NOT_FOUND",
        message:
          "Patient Profile Not Found. Please Create a profile to continue",
      });
    }
    const patient = await mapPatientRow(rawData);

    const medicalRecord = await repo.getPatientMedicalInfoByPatientId(
      patient.patientId,
    );

    const medicalInfo = medicalRecord
      ? mapMedicalRecordRow(medicalRecord)
      : null;

    const patientWithMedicalRecord = {
      ...patient,
      medicalInfo: medicalInfo || null,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(patientWithMedicalRecord),
    });

    return Response.SUCCESS({ data: patientWithMedicalRecord });
  } catch (error) {
    logger.error("getPatientById: ", error);
    throw error;
  }
};

exports.getPatientsTestimonial = async (limit, offset, paginationInfo) => {
  try {
    const cacheKey = cacheKeyBulider("patient-testimonials:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
    }
    const rawData = await getAllTestimonials(limit, offset);
    if (!rawData?.length) {
      return Response.SUCCESS({
        message: "No patient testimonials found",
        data: [],
      });
    }

    const patients = await Promise.all(rawData.map(mapPatientRow));

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(patients),
    });

    return Response.SUCCESS({ data: patients, pagination: paginationInfo });
  } catch (error) {
    logger.error("getPatientsTestimonial: ", error);
    throw error;
  }
};

exports.getPatientByUser = async (id) => {
  try {
    const cacheKey = `patients-user:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const rawData = await repo.getPatientByUserId(id);
    if (!rawData) {
      logger.warn(`Patient Profile Not Found for User ID: ${id}`);
      return Response.NOT_FOUND({
        errorCode: "PROFILE_NOT_FOUND",
        message:
          "Patient Profile Not Found. Please Create a profile to continue",
      });
    }

    const patient = await mapPatientRow(rawData);

    if (id !== patient.userId || patient.userType !== USERTYPE.PATIENT) {
      logger.warn(
        `Unauthorized access attempt for user ID: ${id} on patient profile ID: ${patient.patientId}`,
      );
      return Response.FORBIDDEN({ message: "Unauthorized account access." });
    }

    const medicalRecord = await repo.getPatientMedicalInfoByPatientId(
      patient.patientId,
    );

    const medicalInfo = medicalRecord
      ? mapMedicalRecordRow(medicalRecord)
      : null;

    const patientWithMedicalRecord = {
      ...patient,
      medicalInfo: medicalInfo || null,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(patientWithMedicalRecord),
    });
    return Response.SUCCESS({ data: patientWithMedicalRecord });
  } catch (error) {
    logger.error("getPatientByUser: ", error);
    throw error;
  }
};
exports.createPatientProfile = async ({
  userId,
  firstName,
  middleName,
  lastName,
  gender,
  dateOfBirth,
}) => {
  try {
    const user = await getUserById(userId);

    if (!user) {
      logger.warn(`User Not Found for ID: ${userId}`);
      return Response.NOT_FOUND({
        message: "Error Creating Patient Profile, please try again!",
      });
    }
    const {
      user_type: userType,
      referral_code: referralCode,
      mobile_number: userMobileNumber,
      is_verified: isVerified,
      is_account_active: isAccountActive,
    } = user;

    if (
      userType !== USERTYPE.PATIENT ||
      isVerified !== VERIFICATIONSTATUS.VERIFIED ||
      isAccountActive !== STATUS.ACTIVE
    ) {
      logger.warn(
        `Unauthorized action for user ID: ${userId}. User Type: ${userType}, Verification Status: ${isVerified}, Account Status: ${isAccountActive}`,
      );
      return Response.FORBIDDEN({
        message: "Unauthorized Action. Please Try again",
      });
    }
    const patient = await repo.getPatientByUserId(userId);

    if (patient) {
      logger.warn(
        `Patient Profile already exists for user ID: ${userId}. Patient ID: ${patient.patientId}`,
      );
      return Response.BAD_REQUEST({
        message: "Patient Profile already exist for logged in user.",
      });
    }

    const formattedDate = dateOfBirth
      ? moment(dateOfBirth).format("YYYY-MM-DD")
      : null;

    const { affectedRows } = await repo.createPatient({
      userId,
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth: formattedDate,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.error(
        `Failed to create patient profile for user ID: ${userId}. Affected Rows: ${affectedRows}`,
      );
      return Response.INTERNAL_SERVER_ERROR({
        message: "Error Creating Patient Profile. Please Try again",
      });
    }
    if (referralCode) {
      const [{ value: marketer }, { value: registeredUsersCount }] =
        await Promise.allSettled([
          getMarketerByReferralCode(referralCode),
          getMarketersTotalRegisteredUsers(referralCode),
        ]);

      if (marketer) {
        const {
          phone_number: marketerPhoneNumber,
          first_name: marketerFirstName,
        } = marketer;

        const { total_registered: totalRegistered } = registeredUsersCount;

        sendMarketerUserRegisteredSMS({
          marketerName: marketerFirstName,
          mobileNumber: marketerPhoneNumber,
          userPhoneNumber: userMobileNumber,
          totalRegistered,
        });
      }
    }

    return Response.CREATED({
      message: "Patient profile created successfully.",
    });
  } catch (error) {
    logger.error("createPatientProfile: ", error);
    throw error;
  }
};
exports.createPatientMedicalInfo = async ({
  userId,
  height,
  weight,
  allergies,
  isDisabled,
  disabilityDesc,
  tobaccoIntake,
  tobaccoIntakeFreq,
  alcoholIntake,
  alcoholIntakeFreq,
  caffineIntake,
  caffineIntakeFreq,
}) => {
  try {
    const { patient_id: patientId } = await repo.getPatientByUserId(userId);
    if (!patientId) {
      logger.warn(
        `Patient Profile Does not exist for User ID: ${userId}. Patient ID: ${patientId}`,
      );
      return Response.BAD_REQUEST({
        message: "Patient Profile Does not exist for the logged in user",
      });
    }

    const medicalInfoExist =
      await repo.getPatientMedicalInfoByPatientId(patientId);
    if (medicalInfoExist) {
      logger.warn(
        `Medical Information already exists for Patient ID: ${patientId}. User ID: ${userId}`,
      );
      return Response.BAD_REQUEST({
        message:
          "Medical Information Already Exist for the current user. Please update",
      });
    }

    const { insertId } = await repo.createPatientMedicalInfo({
      patientId,
      height,
      weight,
      allergies,
      isDisabled,
      disabilityDesc,
      tobaccoIntake,
      tobaccoIntakeFreq,
      alcoholIntake,
      alcoholIntakeFreq,
      caffineIntake,
      caffineIntakeFreq,
    });

    if (!insertId) {
      logger.error(
        `Failed to create Patient Medical Info for Patient ID: ${patientId}. Insert ID: ${insertId}`,
      );
      return Response.BAD_REQUEST({
        message: "Failed to create Patient Medical Info. Try again",
      });
    }

    return Response.CREATED({
      message: "Patient Medical Info Created Successfully.",
    });
  } catch (error) {
    logger.error("createPatientMedicalInfo: ", error);
    throw error;
  }
};

exports.updatePatientProfile = async ({
  userId,
  firstName,
  middleName,
  lastName,
  gender,
  dateOfBirth,
}) => {
  try {
    const { user_type: userType } = await getUserById(userId);
    const { patient_id: patientId } = await repo.getPatientByUserId(userId);

    if (userType !== USERTYPE.PATIENT) {
      logger.warn(
        `Unauthorized action for user ID: ${userId}. User Type: ${userType}`,
      );
      return Response.UNAUTHORIZED({
        message:
          "Unauthorized action, you must register as a pateint to update a pateient profile",
      });
    }

    const formattedDate = moment(dateOfBirth).format("YYYY-MM-DD");

    const { affectedRows } = await repo.updatePatientById({
      patientId,
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth: formattedDate,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.error(
        `Failed to update patient profile for Patient ID: ${patientId}. Affected Rows: ${affectedRows}`,
      );
      return Response.NOT_MODIFIED({});
    }

    return Response.SUCCESS({
      message: "Patient profile updated successfully.",
    });
  } catch (error) {
    logger.error("updatePatientProfile: ", error);
    throw error;
  }
};
exports.updatePatientProfilePicture = async ({ userId, file }) => {
  try {
    if (!file) {
      return Response.BAD_REQUEST({
        message: "No file provided for upload",
      });
    }
    const { profile_pic_url: oldProfilePicUrl } =
      await repo.getPatientByUserId(userId);

    let imageUrl = null;

    try {
      const { buffer, mimetype } = file;
      imageUrl = `profile_pic_${generateFileName(file)}`;

      await uploadFileToS3Bucket({
        fileName: imageUrl,
        buffer,
        mimetype,
      });
    } catch (uploadError) {
      logger.error("Failed to upload profile picture to S3:", uploadError);
      return Response.BAD_REQUEST({
        message: "Failed to upload profile picture. Please try again.",
      });
    }

    const { affectedRows } = await repo.updatePatientProfilePictureByUserId({
      userId,
      imageUrl,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.error("Failed to update patient profile picture");
      return Response.NOT_MODIFIED({});
    }

    if (oldProfilePicUrl) {
      try {
        await deleteFileFromS3Bucket(oldProfilePicUrl);
      } catch (deleteError) {
        logger.warn(
          `Failed to delete old profile picture ${oldProfilePicUrl}:`,
          deleteError.message,
        );
      }
    }

    return Response.SUCCESS({
      message: "Patient's profile picture updated successfully.",
    });
  } catch (error) {
    logger.error("updatePatientProfilePicture: ", error);
    throw error;
  }
};
