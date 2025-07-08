const moment = require("moment");
const path = require("path");
const repo = require("../../repository/patients.repository");
const Response = require("../../utils/response.utils");
const {
  USERTYPE,
  STATUS,
  VERIFICATIONSTATUS,
} = require("../../utils/enum.utils");
const { getUserById } = require("../../repository/users.repository");
const { deleteFile } = require("../../utils/file-upload.utils");
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
      return Response.NOT_FOUND({ message: "Patient Not Found" });
    }

    const patients = rawData.map(mapPatientRow);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(patients),
    });
    return Response.SUCCESS({ data: patients, pagination: paginationInfo });
  } catch (error) {
    console.error(error);
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
      return Response.NOT_FOUND({
        errorCode: "PROFILE_NOT_FOUND",
        message:
          "Patient Profile Not Found. Please Create a profile to continue",
      });
    }
    const patient = mapPatientRow(rawData);

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
    console.error(error);
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
      return Response.NOT_FOUND({
        message: "Patient Testimonials Not Found",
      });
    }

    const patients = rawData.map(mapPatientRow);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(patients),
    });

    return Response.SUCCESS({ data: patients, pagination: paginationInfo });
  } catch (error) {
    console.error(error);
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

    // Get profile from database
    const rawData = await repo.getPatientByUserId(id);
    if (!rawData) {
      return Response.NOT_FOUND({
        errorCode: "PROFILE_NOT_FOUND",
        message:
          "Patient Profile Not Found. Please Create a profile to continue",
      });
    }

    const patient = mapPatientRow(rawData);

    if (id !== patient.userId || patient.userType !== USERTYPE.PATIENT) {
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
    console.error(error);
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
      return Response.FORBIDDEN({
        message: "Unauthorized Action. Please Try again",
      });
    }
    const patient = await repo.getPatientByUserId(userId);

    if (patient) {
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

    if (affectedRows <= 0) {
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
    console.error(error);
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
      return Response.BAD_REQUEST({
        message: "Patient Profile Does not exist for the logged in user",
      });
    }

    const medicalInfoExist =
      await repo.getPatientMedicalInfoByPatientId(patientId);
    if (medicalInfoExist) {
      return Response.BAD_REQUEST({
        message:
          "Medical Information Already Exist for the current user. Please update",
      });
    }
    await repo.createPatientMedicalInfo({
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

    return Response.CREATED({
      message: "Patient Medical Info Created Successfully.",
    });
  } catch (error) {
    console.error(error);
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
      return Response.UNAUTHORIZED({
        message:
          "Unauthorized action, you must register as a pateint to update a pateient profile",
      });
    }

    const formattedDate = moment(dateOfBirth).format("YYYY-MM-DD");

    await repo.updatePatientById({
      patientId,
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth: formattedDate,
    });

    return Response.SUCCESS({
      message: "Patient profile updated successfully.",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.updatePatientProfilePicture = async ({ userId, imageUrl }) => {
  try {
    const { profile_pic_url: profilePicUrl } =
      await repo.getPatientByUserId(userId);

    if (profilePicUrl) {
      // delete old profile pic from file system
      const file = path.join(
        __dirname,
        "../public/upload/profile_pics/",
        profilePicUrl,
      );
      await deleteFile(file);
    }

    await repo.updatePatientProfilePictureByUserId({
      userId,
      imageUrl,
    });

    return Response.SUCCESS({
      message: "Patient's profile picture updated successfully.",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
