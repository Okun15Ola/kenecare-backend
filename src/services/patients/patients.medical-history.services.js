const repo = require("../../repository/patients.repository");
const Response = require("../../utils/response.utils");
const { redisClient } = require("../../config/redis.config");
const { mapPatientMedicalHistoryRow } = require("../../utils/db-mapper.utils");
const logger = require("../../middlewares/logger.middleware");

exports.getPatientMedicalHistory = async (userId) => {
  try {
    const patient = await repo.getPatientByUserId(userId);
    if (!patient) {
      logger.warn(
        `Patient Profile Does not exist for the logged in user ${userId}`,
      );
      return Response.BAD_REQUEST({
        message:
          "Patient Profile Does not exist for the logged in user. Please create a patient profile",
      });
    }
    const { patient_id: patientID } = patient;

    const cacheKey = `patient:${patientID}:medical-history:all`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const data = await repo.getPatientMedicalInfoByPatientId(patientID);
    if (!data) {
      logger.warn(`Medical History Not Found ${userId}`);
      return Response.NOT_FOUND({
        message: "Medical History Not Found.",
      });
    }
    const medicalHistory = mapPatientMedicalHistoryRow(data);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(medicalHistory),
    });
    return Response.SUCCESS({ data: medicalHistory });
  } catch (error) {
    logger.error("getPatientMedicalHistory: ", error);
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
      logger.warn(
        `Patient Profile Does not exist for the logged in use ${userId}`,
      );
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
      logger.error("Failed to create Patient Medical Info");
      return Response.BAD_REQUEST({
        message: "Failed to create Patient Medical Info. Try again",
      });
    }

    const cacheKey = `patient:${patientId}:medical-history:all`;
    await redisClient.delete(cacheKey);
    await redisClient.clearCacheByPattern(`patient:${patientId}:*`);

    return Response.CREATED({
      message: "Patient Medical Info Created Successfully.",
    });
  } catch (error) {
    logger.error("createPatientMedicalHistory: ", error);
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
    const { affectedRows } = await repo.updatePatientMedicalHistory({
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

    if (!affectedRows || affectedRows < 1) {
      return Response.NOT_MODIFIED({});
    }

    const cacheKey = `patient:${patientId}:medical-history:all`;
    await redisClient.delete(cacheKey);
    await redisClient.clearCacheByPattern(`patient:${patientId}:*`);

    return Response.SUCCESS({
      message: "Patient Medical Info Updated Successfully.",
    });
  } catch (error) {
    logger.error("updatePatientMedicalHistory: ", error);
    throw error;
  }
};
