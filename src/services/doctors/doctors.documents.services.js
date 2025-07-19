const {
  getSharedMedicalDocumentsByDoctorId,
  getDoctorSharedMedicalDocumentById,
} = require("../../repository/patient-docs.repository");
const Response = require("../../utils/response.utils");
const { getDoctorByUserId } = require("../../repository/doctors.repository");
const { redisClient } = require("../../config/redis.config");
const { mapDoctorSharedMedicalDocs } = require("../../utils/db-mapper.utils");
const logger = require("../../middlewares/logger.middleware");

exports.getDoctorSharedMedicalDocuments = async (userId) => {
  try {
    const cacheKey = `doctor:shared-medical-documents:${userId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const doctor = await getDoctorByUserId(userId);

    if (!doctor) {
      logger.error(`Doctor profile not found for userId: ${userId}`);
      return Response.NOT_FOUND({ message: "Doctor Profile Not Found" });
    }

    const { doctor_id: doctorId, title } = doctor;

    const rawData = await getSharedMedicalDocumentsByDoctorId(doctorId);

    if (!rawData?.length) {
      return Response.SUCCESS({
        message: "No shared medical documents found at the moment.",
        data: [],
      });
    }

    const sharedMedicalDocuments = await Promise.all(
      rawData.map((row) => mapDoctorSharedMedicalDocs(row, title)),
    );
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(sharedMedicalDocuments),
    });
    return Response.SUCCESS({ data: sharedMedicalDocuments });
  } catch (error) {
    logger.error("getDoctorSharedMedicalDocuments: ", error);
    throw error;
  }
};
exports.getDoctorSharedMedicalDocument = async ({ userId, sharedDocId }) => {
  try {
    const cacheKey = `doctor:shared-medical-documents:${sharedDocId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const doctor = await getDoctorByUserId(userId);

    if (!doctor) {
      logger.error(`Doctor profile not found for userId: ${userId}`);
      return Response.NOT_FOUND({ message: "Doctor Profile Not Found" });
    }
    const { doctor_id: doctorId, title } = doctor;

    const document = await getDoctorSharedMedicalDocumentById({
      doctorId,
      sharedDocumentId: sharedDocId,
    });

    if (!document) {
      logger.error(
        `Shared Medical Document not found for doctorId: ${doctorId} and sharedDocId: ${sharedDocId}`,
      );
      return Response.NOT_FOUND({
        message: "Shared Medical Document Not Found.",
      });
    }

    const sharedMedicalDocument = await mapDoctorSharedMedicalDocs(
      document,
      title,
      true,
    );

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(sharedMedicalDocument),
    });

    return Response.SUCCESS({ data: sharedMedicalDocument });
  } catch (error) {
    logger.error("getDoctorSharedMedicalDocument: ", error);
    throw error;
  }
};
