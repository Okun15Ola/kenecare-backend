const dbObject = require("../../repository/doctors.repository");
const Response = require("../../utils/response.utils");
const {
  USERTYPE,
  STATUS,
  VERIFICATIONSTATUS,
} = require("../../utils/enum.utils");
const { getUserById } = require("../../repository/users.repository");
const {
  adminDoctorProfileRegistrationEmail,
} = require("../../utils/email.utils");
const { doctorProfileApprovalSms } = require("../../utils/sms.utils");
const {
  createDoctorWallet,
} = require("../../repository/doctor-wallet.repository");
const { hashUsersPassword } = require("../../utils/auth.utils");
const {
  mapDoctorRow,
  mapDoctorUserProfileRow,
} = require("../../utils/db-mapper.utils");
const { redisClient } = require("../../config/redis.config");
const {
  cacheKeyBulider,
  getCachedCount,
  getPaginationInfo,
} = require("../../utils/caching.utils");
const logger = require("../../middlewares/logger.middleware");
const {
  uploadFileToS3Bucket,
  deleteFileFromS3Bucket,
} = require("../../utils/aws-s3.utils");
const { generateFileName } = require("../../utils/file-upload.utils");

exports.getAllDoctors = async (limit, page) => {
  try {
    const offset = (page - 1) * limit;
    const countCacheKey = "doctors:count:approved";
    const totalRows = await getCachedCount({
      cacheKey: countCacheKey,
      countQueryFn: dbObject.getDoctorsCount,
    });

    if (!totalRows) {
      return Response.SUCCESS({ message: "No doctors found", data: [] });
    }

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const cacheKey = cacheKeyBulider("doctors:all", limit, offset);
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
exports.getDoctorByQuery = async (locationId, query, limit, page) => {
  try {
    const offset = (page - 1) * limit;
    const countCacheKey = "doctors:search:count";
    const totalRows = await getCachedCount({
      cacheKey: countCacheKey,
      countQueryFn: () => dbObject.getDoctorsQueryCount({ locationId, query }),
    });

    if (!totalRows) {
      return Response.SUCCESS({ message: "No doctors found", data: [] });
    }

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const cacheKey = cacheKeyBulider(
      `doctors:${locationId ? `:location=${locationId}` : ""}
      ${query ? `:query=${query}` : ""}`,
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
    const rawData = await dbObject.getDoctorByQuery({
      locationId,
      query,
      limit,
      offset,
    });

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
    logger.error("getDoctorByQuery: ", error);
    throw error;
  }
};

exports.getDoctorBySpecialtyId = async (specialityId, limit, page) => {
  try {
    const offset = (page - 1) * limit;
    const countCacheKey = "doctors:specialty:count";
    const totalRows = await getCachedCount({
      cacheKey: countCacheKey,
      countQueryFn: () => dbObject.getDoctorsSpecializationCount(specialityId),
    });

    if (!totalRows) {
      return Response.SUCCESS({
        message: "No doctors available for this specialty",
        data: [],
      });
    }

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });
    const cacheKey = cacheKeyBulider(
      `doctors:speciality:${specialityId}`,
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
    const rawData = await dbObject.getDoctorsBySpecializationId(
      specialityId,
      limit,
      offset,
    );

    if (!rawData?.length) {
      return Response.SUCCESS({
        message: "No doctors available for this specialty",
        data: [],
      });
    }

    const doctors = await Promise.all(rawData.map(mapDoctorRow));

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(doctors),
    });

    return Response.SUCCESS({ data: doctors, pagination: paginationInfo });
  } catch (error) {
    logger.error("getDoctorBySpecialtyId: ", error);
    throw error;
  }
};

exports.getDoctorByUser = async (id) => {
  try {
    const cacheKey = `doctor:user:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
      });
    }
    const rawData = await dbObject.getDoctorByUserId(id);

    if (!rawData) {
      logger.error(`Doctor profile not found for userId: ${id}`);
      return Response.NOT_FOUND({ message: "Doctor Profile Not Found" });
    }

    const doctor = await mapDoctorUserProfileRow(rawData);

    if (id !== doctor.userId || doctor.userType !== USERTYPE.DOCTOR) {
      logger.error(
        `Unauthorized access attempt by userId: ${id} for doctorId: ${doctor.doctorId}`,
      );
      return Response.UNAUTHORIZED({ message: "Unauthorized account access" });
    }

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(doctor),
    });

    return Response.SUCCESS({ data: doctor });
  } catch (error) {
    logger.error("getDoctorByUser: ", error);
    throw error;
  }
};

exports.getDoctorById = async (id) => {
  try {
    const cacheKey = `doctor:${id}`;
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

exports.createDoctorProfile = async ({
  userId,
  title,
  firstName,
  middleName,
  lastName,
  gender,
  professionalSummary,
  specializationId,
  qualifications,
  consultationFee,
  cityId,
  yearOfExperience,
}) => {
  try {
    const user = await getUserById(userId);
    if (!user) {
      logger.error(`User not found for ID: ${userId}`);
      return Response.NOT_FOUND({
        message: "Error Creating Doctor Profile, please try again!",
      });
    }
    const { user_type: userType } = user;

    if (userType !== USERTYPE.DOCTOR) {
      logger.error(
        `Unauthorized action by userId: ${userId}. User type: ${userType}`,
      );
      return Response.UNAUTHORIZED({
        message:
          "Unauthorized action, you must register as a doctor to create a doctor profile",
      });
    }
    const doctorExist = await dbObject.getDoctorByUserId(userId);
    if (doctorExist) {
      logger.error(
        `Doctor profile already exists for userId: ${userId}. Cannot create a new profile.`,
      );
      return Response.BAD_REQUEST({
        message: "Doctor Profile already exist for this user",
      });
    }

    const { insertId } = await dbObject.createDoctor({
      userId,
      title,
      firstName,
      middleName,
      lastName,
      gender,
      professionalSummary,
      specializationId,
      qualifications,
      consultationFee,
      cityId,
      yearOfExperience,
    });

    if (!insertId) {
      logger.error(`Failed to create doctor profile for userId: ${userId}`);
      return Response.INTERNAL_SERVER_ERROR({
        message: "Error Creating Doctor Profile, please try again!",
      });
    }

    // Send Email to admins
    await adminDoctorProfileRegistrationEmail({
      doctorName: `${firstName} ${middleName} ${lastName}`,
    });

    const hashedPin = await hashUsersPassword("1234");
    await createDoctorWallet({
      doctorId: insertId,
      pin: hashedPin,
    });

    await redisClient.clearCacheByPattern("doctors:*");

    return Response.CREATED({
      message:
        "Doctor profile created successfully. Please proceed to submitting Medical Council Registration Information.",
    });
  } catch (error) {
    logger.error("createDoctorProfile: ", error);
    throw error;
  }
};

exports.updateDoctorProfile = async ({
  userId,
  title,
  firstName,
  middleName,
  lastName,
  gender,
  professionalSummary,
  specializationId,
  qualifications,
  consultationFee,
  cityId,
  yearOfExperience,
}) => {
  try {
    const doctor = await dbObject.getDoctorByUserId(userId);

    if (!doctor) {
      logger.error(`Doctor profile not found for userId: ${userId}`);
      return Response.NOT_FOUND({ message: "Doctor Profile Not Found" });
    }

    const {
      user_type: userType,
      doctor_id: doctorId,
      is_account_active: isAccountActive,
      is_profile_approved: isProfileApproved,
    } = doctor;

    // check if the logged in user is of type 'doctor'
    if (userType !== USERTYPE.DOCTOR) {
      logger.error(
        `Unauthorized action by userId: ${userId}. User type: ${userType}`,
      );
      return Response.UNAUTHORIZED({
        message:
          "Unauthorized action, you must register as a doctor to create a doctor profile",
      });
    }

    // Check if the profile is active
    if (isAccountActive !== STATUS.ACTIVE) {
      logger.error(
        `Doctor profile is not active for userId: ${userId}. Status: ${isAccountActive}`,
      );
      return Response.UNAUTHORIZED({
        message: "Doctor Profile has been deactivated. Please Contact Admin",
      });
    }

    if (isProfileApproved !== VERIFICATIONSTATUS.VERIFIED) {
      logger.error(
        `Doctor profile is not approved for userId: ${userId}. Status: ${isProfileApproved}`,
      );
      return Response.UNAUTHORIZED({
        message:
          "Requested Doctor Profile has not been approved. Please contact admin for further information",
      });
    }

    const { affectedRows } = await dbObject.updateDoctorById({
      doctorId,
      title,
      firstName,
      middleName,
      lastName,
      gender,
      professionalSummary,
      specializationId,
      qualifications,
      consultationFee,
      cityId,
      yearOfExperience,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.error(`Failed to update doctor profile for userId: ${userId}`);
      return Response.NOT_MODIFIED({});
    }

    await redisClient.clearCacheByPattern("doctors:*");

    return Response.SUCCESS({
      message: "Doctor profile updated successfully.",
    });
  } catch (error) {
    logger.error("updateDoctorProfile: ", error);
    throw error;
  }
};

exports.updateDoctorProfilePicture = async ({ userId, file }) => {
  try {
    if (!file) {
      return Response.BAD_REQUEST({
        message: "No file provided for upload",
      });
    }

    const doctor = await dbObject.getDoctorByUserId(userId);
    if (!doctor) {
      logger.error(`Doctor profile not found for userId: ${userId}`);
      return Response.NOT_FOUND({ message: "Doctor Profile Not Found" });
    }
    const { doctor_id: doctorId, profile_pic_url: oldProfilePicUrl } = doctor;

    let newImageUrl = null;

    try {
      const { buffer, mimetype } = file;
      newImageUrl = `profile_pic_${generateFileName(file)}`;

      await uploadFileToS3Bucket({
        fileName: newImageUrl,
        buffer,
        mimetype,
      });

      logger.info(`Successfully uploaded new profile picture: ${newImageUrl}`);
    } catch (uploadError) {
      logger.error("Failed to upload profile picture to S3:", uploadError);
      return Response.BAD_REQUEST({
        message: "Failed to upload profile picture. Please try again.",
      });
    }

    const { affectedRows } = await dbObject.updateDoctorProfilePictureById({
      doctorId,
      imageUrl: newImageUrl,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.error(
        `Failed to update profile picture for doctorId: ${doctorId}`,
      );
      return Response.NOT_MODIFIED({});
    }

    if (oldProfilePicUrl) {
      try {
        await deleteFileFromS3Bucket(oldProfilePicUrl);
        logger.info(
          `Successfully deleted old profile picture: ${oldProfilePicUrl}`,
        );
      } catch (deleteError) {
        logger.warn(
          `Failed to delete old profile picture ${oldProfilePicUrl}:`,
          deleteError.message,
        );
      }
    }

    await redisClient.clearCacheByPattern("doctors:*");
    return Response.SUCCESS({
      message: "Doctor's profile picture updated successfully.",
    });
  } catch (error) {
    logger.error("updateDoctorProfilePicture: ", error);
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
