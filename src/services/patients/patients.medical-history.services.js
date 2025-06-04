const repo = require("../../repository/patients.repository");
const Response = require("../../utils/response.utils");
const redisClient = require("../../config/redis.config");

exports.getPatientMedicalHistory = async (userId) => {
  try {
    const cacheKey = "patient-medicalHistory:all";
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const patient = await repo.getPatientByUserId(userId);
    if (!patient) {
      return Response.BAD_REQUEST({
        message:
          "Patient Profile Does not exist for the logged in user. Please create a patient profile",
      });
    }
    const { patient_id: patientID } = patient;

    const data = await repo.getPatientMedicalInfoByPatientId(patientID);
    if (!data) {
      return Response.NOT_FOUND({
        message: "Medical History Not Found.",
      });
    }
    const {
      medical_history_id: medicalHistoryId,
      patient_id: patientId,
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
    } = data;
    const medicalHistory = {
      medicalHistoryId,
      patientId,
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
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(medicalHistory),
    });
    return Response.SUCCESS({ data: medicalHistory });
  } catch (error) {
    console.error("GET PATIENT MEDICAL HISTORY ERROR: ", error);
    throw error;
  }
};

exports.createPatientMedicalHistory = async ({
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
    const patient = await repo.getPatientByUserId(userId);
    if (!patient) {
      return Response.BAD_REQUEST({
        message:
          "Patient Profile Does not exist for the logged in user. Please create a patient profile",
      });
    }
    const { patient_id: patientId } = patient;

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
    console.error("CREATE PATIENT MEDICAL HISTORY ERROR: ", error);
    throw error;
  }
};

exports.updatePatientMedicalHistory = async ({
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
    const patient = await repo.getPatientByUserId(userId);
    if (!patient) {
      return Response.BAD_REQUEST({
        message:
          "Patient Profile Does not exist for the logged in user. Please create a patient profile",
      });
    }
    const { patient_id: patientId } = patient;

    const data = await repo.getPatientMedicalInfoByPatientId(patientId);
    if (!data) {
      return Response.NOT_FOUND({
        message:
          "Medical History Not Found. Create one before trying to update",
      });
    }
    await repo.updatePatientMedicalHistory({
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
      message: "Patient Medical Info Updated Successfully.",
    });
  } catch (error) {
    console.error("UPDATE PATIENT MEDICAL HISTORY ERROR: ", error);
    throw error;
  }
};
