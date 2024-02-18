const dbObject = require("../db/db.patients");
const Response = require("../utils/response.utils");
const { USERTYPE, STATUS, VERIFICATIONSTATUS } = require("../utils/enum.utils");
const { getUserById } = require("../db/db.users");
const moment = require("moment");
const path = require("path");
const fs = require("fs");
const { appBaseURL } = require("../config/default.config");
const { deleteFile } = require("../utils/file-upload.utils");

exports.getAllPatients = async () => {
  try {
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
      }) => {
        return {
          patientId,
          title,
          firstName,
          middleName,
          lastName,
          gender,
          profilePic: profilePic
            ? `${appBaseURL}/user-profile/${profilePic}`
            : null,
          dob: moment(dob).format("MMM-DD"),
          mobileNumber,
          email,
          userType,
          isAccountActive,
          isOnline,
        };
      }
    );
    return Response.SUCCESS({ data: patients });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.getPatientById = async (id) => {
  try {
    const rawData = await dbObject.getPatientById(id);
    if (!rawData) {
      return Response.NOT_FOUND({ message: "Patient Not Found" });
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

    //TODO Get medical Record details
    const medicalRecord = await dbObject.getPatientMedicalInfoByPatientId(
      patientId
    );
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
    } = medicalRecord || null;

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
      dob: moment(dob).format("MMM-DD"),
      mobileNumber,
      email,
      userType,
      medicalInfo: {
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
      },
      isAccountActive,
      isOnline,
    };

    return Response.SUCCESS({ data: patient });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getPatientsTestimonial = async (userId) => {
  try {
    const patient = await dbObject.getPatientByUserId(userId);
    if (!patient) {
      return Response.NOT_FOUND({
        message:
          "Patient Profile Not Found please create one before proceeding",
      });
    }
    const rawData = await dbObject.getAllPatients();
    console.log(rawData);
    return Response.SUCCESS({ data: null });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getPatientByUser = async (id) => {
  try {
    //Get profile from database
    const rawData = await dbObject.getPatientByUserId(id);
    if (!rawData) {
      return Response.NOT_FOUND({
        message:
          "Patient Profile Not Found. Please Create a profile to continue",
      });
    }

    //destruct properties from database object
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

    //TODO Check if the profile requested belongs to the requesting user
    if (id !== userId || userType !== USERTYPE.PATIENT) {
      return Response.UNAUTHORIZED({ message: "Unauthorized account access." });
    }

    //TODO Get medical Record details
    const medicalRecord = await dbObject.getPatientMedicalInfoByPatientId(
      patientId
    );

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
    } = medicalRecord || null;

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
      dob: moment(dob).format("MMM-DD"),
      mobileNumber,
      email,
      userType,
      medicalInfo: {
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
      },
      isAccountActive,
      isOnline,
    };

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
    const { user_type: userType } = await getUserById(userId);

    if (userType !== USERTYPE.PATIENT) {
      return Response.UNAUTHORIZED({
        message:
          "Unauthorized action, you must register as a patient to create a patient profile",
      });
    }
    const patientExist = await dbObject.getPatientByUserId(userId);
    if (patientExist) {
      return Response.BAD_REQUEST({
        message: "Patient Profile already exist for this user",
      });
    }

    const formattedDate = moment(dateOfBirth).format("YYYY-MM-DD");

    await dbObject.createPatient({
      userId,
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth: formattedDate,
    });

    //TODO send an email with further instructions
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

    const medicalInfoExist = await dbObject.getPatientMedicalInfoByPatientId(
      patientId
    );
    if (medicalInfoExist) {
      console.log(medicalInfoExist);
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

    const medicalInfoExist = await dbObject.getPatientMedicalInfoByPatientId(
      patientId
    );
    if (!medicalInfoExist) {
      console.log(medicalInfoExist);
      return Response.BAD_REQUEST({
        message: "Medical Information Not Found for user",
      });
    }
    const formattedDate = moment(dateOfBirth, "DD/MM/YYYY").format(
      "YYYY-MM-DD"
    );

    console.log("Medical Info Exist");
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
    const { profile_pic_url } = await dbObject.getPatientByUserId(userId);

    if (profile_pic_url) {
      // delete old profile pic from file system
      const file = path.join(
        __dirname,
        "../public/upload/profile_pics/",
        profile_pic_url
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
