const moment = require("moment");
const repo = require("../../repository/patients.repository");
const Response = require("../../utils/response.utils");
const { USERTYPE } = require("../../utils/enum.utils");
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
const {
  cacheKeyBulider,
  getPaginationInfo,
} = require("../../utils/caching.utils");
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
const { encryptText } = require("../../utils/auth.utils");

exports.getAllPatients = async (limit, page) => {
  try {
    const offset = (page - 1) * limit;
    const cacheKey = cacheKeyBulider("patients:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({
        data,
        pagination,
      });
    }
    const rawData = await repo.getAllPatients(limit, offset);

    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No patients found", data: [] });
    }

    const { totalRows } = rawData[0];

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const patients = await Promise.all(rawData.map(mapPatientRow));

    const valueToCache = {
      data: patients,
      pagination: paginationInfo,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(valueToCache),
    });
    return Response.SUCCESS({ data: patients, pagination: paginationInfo });
  } catch (error) {
    logger.error("getAllPatients: ", error);
    throw error;
  }
};

exports.getDoctorsPatientsHasMet = async (userId) => {
  try {
    const { patient_id: patientId } = await repo.getPatientByUserId(userId);
    if (!patientId) {
      logger.warn(`Patient not found for user ID: ${userId}`);
      return Response.NOT_FOUND({
        message: "Patient Profile Found.",
      });
    }
    const cacheKey = cacheKeyBulider(`patient:${patientId}:doctors:has-met`);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
      });
    }

    const rawData = await repo.getDoctorsPatientHasBooked(patientId);

    if (!rawData?.length) {
      return Response.SUCCESS({
        message: "Patient hasn't seen any doctors yet.",
        data: [],
      });
    }

    const doctors = rawData.map((doctor) => ({
      doctorId: doctor.doctor_id,
      doctor: `Dr. ${doctor.first_name} ${doctor.last_name}`,
    }));
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(doctors),
    });
    return Response.SUCCESS({ data: doctors });
  } catch (error) {
    logger.error("getDoctorsPatientsHasMet: ", error);
    throw error;
  }
};

exports.getPatientById = async (id) => {
  try {
    // const cacheKey = `patient:${id}`;
    // const cachedData = await redisClient.get(cacheKey);
    // if (cachedData) {
    //   return Response.SUCCESS({ data: JSON.parse(cachedData) });
    // }
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

    // await redisClient.set({
    //   key: cacheKey,
    //   value: JSON.stringify(patientWithMedicalRecord),
    // });

    return Response.SUCCESS({ data: patientWithMedicalRecord });
  } catch (error) {
    logger.error("getPatientById: ", error);
    throw error;
  }
};

exports.getPatientsTestimonial = async (limit, page) => {
  try {
    const offset = (page - 1) * limit;

    const cacheKey = cacheKeyBulider("patient:testimonials:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({
        data,
        pagination,
      });
    }
    const rawData = await getAllTestimonials(limit, offset);
    if (!rawData?.length) {
      return Response.SUCCESS({
        message: "No patient testimonials found",
        data: [],
      });
    }

    const { totalRows } = rawData[0];

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

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

    // const cacheKey = `patient:${patient.patientId}:user:${id}`;
    // const cachedData = await redisClient.get(cacheKey);
    // if (cachedData) {
    //   return Response.SUCCESS({ data: JSON.parse(cachedData) });
    // }

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

    // await redisClient.set({
    //   key: cacheKey,
    //   value: JSON.stringify(patientWithMedicalRecord),
    // });
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
    const { referral_code: referralCode, mobile_number: userMobileNumber } =
      user;

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

    // encrypt Patient Data
    const encryptedFirstName = encryptText(firstName);
    const encryptedLastName = encryptText(lastName);
    const encryptedMiddleName = encryptText(middleName);

    const { affectedRows } = await repo.createPatient({
      userId,
      firstName: encryptedFirstName,
      middleName: encryptedMiddleName,
      lastName: encryptedLastName,
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

    // Only proceed with caching and SMS if patient profile was successfully created
    if (!affectedRows || affectedRows > 0) {
      // Re-fetch patient to ensure it's not null before caching
      const newPatient = await repo.getPatientByUserId(userId);
      if (newPatient) {
        await redisClient.delete(`patient:${newPatient.patient_id}:*`);
        await redisClient.clearCacheByPattern(
          `patients:${newPatient.patient_id}:*`,
        );
        await redisClient.clearCacheByPattern(
          `patient:${newPatient.patient_id}:user:${userId}`,
        );
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
    }

    return Response.CREATED({
      message: "Patient profile created successfully.",
    });
  } catch (error) {
    logger.error("createPatientProfile: ", error);
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
    const { patient_id: patientId } = await repo.getPatientByUserId(userId);

    if (!patientId) {
      logger.warn(`Patient Not Found: ${patientId}`);
      return Response.NOT_FOUND({
        message: "Patient Not Found.",
      });
    }

    const formattedDate = moment(dateOfBirth).format("YYYY-MM-DD");

    // encrypt Patient Data
    const encryptedFirstName = encryptText(firstName);
    const encryptedLastName = encryptText(lastName);
    const encryptedMiddleName = encryptText(middleName);

    const { affectedRows } = await repo.updatePatientById({
      patientId,
      firstName: encryptedFirstName,
      middleName: encryptedMiddleName,
      lastName: encryptedLastName,
      gender,
      dateOfBirth: formattedDate,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.error(
        `Failed to update patient profile for Patient ID: ${patientId}. Affected Rows: ${affectedRows}`,
      );
      return Response.NOT_MODIFIED({});
    }

    await redisClient.delete(`patient:${patientId}:*`);
    await redisClient.clearCacheByPattern(`patients:${patientId}:*`);
    await redisClient.clearCacheByPattern(
      `patient:${patientId}:user:${userId}`,
    );

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
    const { profile_pic_url: oldProfilePicUrl, patient_id: patientId } =
      await repo.getPatientByUserId(userId);

    if (!patientId) {
      logger.warn(`Patient Not Found: ${patientId}`);
      return Response.NOT_FOUND({
        message: "Patient Not Found.",
      });
    }

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

    await redisClient.delete(`patient_public_profile_pic:${patientId}`);
    await redisClient.delete(`patient_private_profile_pic:${patientId}`);
    await redisClient.delete(`patient_pic:${patientId}`);
    await redisClient.delete(`patient:${patientId}:*`);
    await redisClient.clearCacheByPattern(`patients:${patientId}:*`);
    await redisClient.clearCacheByPattern(
      `patient:${patientId}:user:${userId}`,
    );

    return Response.SUCCESS({
      message: "Patient's profile picture updated successfully.",
    });
  } catch (error) {
    logger.error("updatePatientProfilePicture: ", error);
    throw error;
  }
};
exports.deletePatientProfileService = async (userId) => {
  try {
    const { patient_id: patientId } = await repo.getPatientByUserId(userId);

    if (!patientId) {
      logger.warn(`Patient Not Found: ${patientId}`);
      return Response.NOT_FOUND({
        message: "Patient Not Found.",
      });
    }

    const { affectedRows } = await repo.deletePatientProfile(userId, patientId);

    if (!affectedRows || affectedRows < 1) {
      logger.error(
        `Failed to delete patient profile for Patient ID: ${patientId}. Affected Rows: ${affectedRows}`,
      );
      return Response.NOT_MODIFIED({});
    }

    await redisClient.delete(`app:user:${userId}`);
    await redisClient.delete(`patient:${patientId}:*`);
    await redisClient.clearCacheByPattern(`patients:${patientId}:*`);
    await redisClient.clearCacheByPattern(
      `patient:${patientId}:user:${userId}`,
    );

    return Response.SUCCESS({
      message: "Patient Account Deleted Successfully.",
    });
  } catch (error) {
    logger.error("deletePatientProfile: ", error);
    throw error;
  }
};
