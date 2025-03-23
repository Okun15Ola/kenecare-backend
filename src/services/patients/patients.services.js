const moment = require("moment");
const path = require("path");
const dbObject = require("../../db/db.patients");
const Response = require("../../utils/response.utils");
const {
  USERTYPE,
  STATUS,
  VERIFICATIONSTATUS,
} = require("../../utils/enum.utils");
const { getUserById } = require("../../db/db.users");
const { appBaseURL } = require("../../config/default.config");
const { deleteFile } = require("../../utils/file-upload.utils");
const {
  getMarketerByReferralCode,
  getMarketersTotalRegisteredUsers,
} = require("../../db/db.marketers");
const { sendMarketerUserRegisteredSMS } = require("../../utils/sms.utils");
const redisClient = require("../../config/redis.config");

exports.getAllPatients = async () => {
  try {
    const cacheKey = "patients:all";
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await dbObject.getAllPatients();

    const patients = rawData.map(
      ({
        patient_id: patientId,
        title,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        gender,
        profile_pic_url: profilePic,
        dob,
        mobile_number: mobileNumber,
        email,
        user_type: userType,
        is_account_active: isAccountActive,
        is_online: isOnline,
      }) => ({
        patientId,
        title,
        firstName,
        middleName,
        lastName,
        gender,
        profilePic: profilePic
          ? `${appBaseURL}/user-profile/${profilePic}`
          : null,
        dob: moment(dob).format("YYYY-MM-DD"),
        mobileNumber,
        email,
        userType,
        isAccountActive,
        isOnline,
      }),
    );
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(patients),
    });
    return Response.SUCCESS({ data: patients });
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
    const rawData = await dbObject.getPatientById(id);
    if (!rawData) {
      return Response.NOT_FOUND({
        errorCode: "PROFILE_NOT_FOUND",
        message:
          "Patient Profile Not Found. Please Create a profile to continue",
      });
    }
    const {
      patient_id: patientId,
      title,
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      gender,
      profile_pic_url: profilePic,
      dob,
      mobile_number: mobileNumber,
      email,
      user_type: userType,
      is_account_active: isAccountActive,
      is_online: isOnline,
    } = rawData;

    //  Get medical Record details
    const medicalRecord =
      await dbObject.getPatientMedicalInfoByPatientId(patientId);

    let medicalInfo = null;
    if (medicalRecord) {
      const {
        height,
        weight,
        allergies,
        is_patient_disabled: isDisabled,
        disability_description: disabilityDesc,
        tobacco_use: tobaccoIntake,
        tobacco_use_frequency: tobaccoIntakeFreq,
        alcohol_use: alcoholIntake,
        alcohol_use_frequency: alcoholIntakeFreq,
        caffine_use: caffineIntake,
        caffine_use_frequency: caffineIntakeFreq,
      } = medicalRecord;
      medicalInfo = {
        height,
        weight,
        allergies,
        isDisabled: isDisabled !== 0,
        disabilityDesc,
        tobaccoIntake: tobaccoIntake !== null,
        tobaccoIntakeFreq,
        alcoholIntake: alcoholIntake !== 0,
        alcoholIntakeFreq,
        caffineIntake: caffineIntake !== null,
        caffineIntakeFreq,
      };
    }

    const patient = {
      patientId,
      title,
      firstName,
      middleName,
      lastName,
      gender,
      profilePic: profilePic
        ? `${appBaseURL}/user-profile/${profilePic}`
        : null,
      dob: moment(dob).format("YYYY-MM-DD"),
      mobileNumber,
      email,
      userType,
      medicalInfo: medicalInfo || null,
      isAccountActive,
      isOnline,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(patient),
    });

    return Response.SUCCESS({ data: patient });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getPatientsTestimonial = async (userId) => {
  try {
    const cacheKey = "patient-testimonials:all";
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const patient = await dbObject.getPatientByUserId(userId);
    if (!patient) {
      return Response.NOT_FOUND({
        message: "Patient Not Found.",
      });
    }
    const rawData = await dbObject.getAllPatients();

    return Response.SUCCESS({ data: rawData });
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
    const rawData = await dbObject.getPatientByUserId(id);
    if (!rawData) {
      return Response.NOT_FOUND({
        errorCode: "PROFILE_NOT_FOUND",
        message:
          "Patient Profile Not Found. Please Create a profile to continue",
      });
    }

    // destruct properties from database object
    const {
      patient_id: patientId,
      title,
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      gender,
      profile_pic_url: profilePic,
      dob,
      mobile_number: mobileNumber,
      email,
      user_id: userId,
      user_type: userType,
      is_account_active: isAccountActive,
      is_online: isOnline,
    } = rawData;

    //  Check if the profile requested belongs to the requesting user
    if (id !== userId || userType !== USERTYPE.PATIENT) {
      return Response.FORBIDDEN({ message: "Unauthorized account access." });
    }

    //  Get medical Record details
    const medicalRecord =
      await dbObject.getPatientMedicalInfoByPatientId(patientId);

    let medicalInfo = null;
    if (medicalRecord) {
      const {
        height,
        weight,
        allergies,
        is_patient_disabled: isDisabled,
        disability_description: disabilityDesc,
        tobacco_use: tobaccoIntake,
        tobacco_use_frequency: tobaccoIntakeFreq,
        alcohol_use: alcoholIntake,
        alcohol_use_frequency: alcoholIntakeFreq,
        caffine_use: caffineIntake,
        caffine_use_frequency: caffineIntakeFreq,
      } = medicalRecord;
      medicalInfo = {
        height,
        weight,
        allergies,
        isDisabled: isDisabled !== 0,
        disabilityDesc,
        tobaccoIntake: tobaccoIntake !== null,
        tobaccoIntakeFreq,
        alcoholIntake: alcoholIntake !== 0,
        alcoholIntakeFreq,
        caffineIntake: caffineIntake !== null,
        caffineIntakeFreq,
      };
    }

    const patient = {
      userId,
      patientId,
      title,
      firstName,
      middleName,
      lastName,
      gender,
      profilePic: profilePic
        ? `${appBaseURL}/user-profile/${profilePic}`
        : null,
      dob: moment(dob).format("YYYY-MM-DD"),
      mobileNumber,
      email,
      userType,
      medicalInfo: medicalInfo || null,
      isAccountActive,
      isOnline,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(patient),
    });
    return Response.SUCCESS({ data: patient });
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
    const patient = await dbObject.getPatientByUserId(userId);

    if (patient) {
      return Response.BAD_REQUEST({
        message: "Patient Profile already exist for logged in user.",
      });
    }

    const formattedDate = dateOfBirth
      ? moment(dateOfBirth).format("YYYY-MM-DD")
      : null;

    const { affectedRows } = await dbObject.createPatient({
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
    const { patient_id: patientId } = await dbObject.getPatientByUserId(userId);
    if (!patientId) {
      return Response.BAD_REQUEST({
        message: "Patient Profile Does not exist for the logged in user",
      });
    }

    const medicalInfoExist =
      await dbObject.getPatientMedicalInfoByPatientId(patientId);
    if (medicalInfoExist) {
      return Response.BAD_REQUEST({
        message:
          "Medical Information Already Exist for the current user. Please update",
      });
    }
    await dbObject.createPatientMedicalInfo({
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
    const { patient_id: patientId } = await dbObject.getPatientByUserId(userId);

    if (userType !== USERTYPE.PATIENT) {
      return Response.UNAUTHORIZED({
        message:
          "Unauthorized action, you must register as a pateint to update a pateient profile",
      });
    }

    const formattedDate = moment(dateOfBirth).format("YYYY-MM-DD");

    await dbObject.updatePatientById({
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
      await dbObject.getPatientByUserId(userId);

    if (profilePicUrl) {
      // delete old profile pic from file system
      const file = path.join(
        __dirname,
        "../public/upload/profile_pics/",
        profilePicUrl,
      );
      await deleteFile(file);
    }

    await dbObject.updatePatientProfilePictureByUserId({
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
