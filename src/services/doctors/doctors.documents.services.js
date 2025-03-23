const moment = require("moment");
const {
  getSharedMedicalDocumentsByDoctorId,
  getDoctorSharedMedicalDocumentById,
} = require("../../db/db.patient-docs");
const Response = require("../../utils/response.utils");
const { getDoctorByUserId } = require("../../db/db.doctors");
const { getFileUrlFromS3Bucket } = require("../../utils/aws-s3.utils");
const redisClient = require("../../config/redis.config");

exports.getDoctorSharedMedicalDocuments = async (userId) => {
  try {
    const cacheKey = `doctor-shared-medical-documents:${userId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const doctor = await getDoctorByUserId(userId);

    if (!doctor) {
      return Response.NOT_FOUND({ message: "Doctor Profile Not Found" });
    }

    const { doctor_id: doctorId, title } = doctor;

    const rawData = await getSharedMedicalDocumentsByDoctorId(doctorId);

    const dataPromises = rawData.map(
      async ({
        sharing_id: sharingId,
        document_id: documentId,
        document_uuid: documentUUID,
        document_title: documentTitle,
        patient_id: patientId,
        patient_first_name: patientFirstName,
        patient_last_name: patientLastName,
        doctor_first_name: doctorFirstName,
        doctor_last_name: doctorLastName,
        note,
        created_at: createdAt,
      }) => {
        const documentUrl = await getFileUrlFromS3Bucket(documentUUID);
        return {
          sharingId,
          documentId,
          documentUUID,
          documentTitle,
          documentUrl,
          patientId,
          patientName: `${patientFirstName} ${patientLastName}`,
          doctorName: `${title} ${doctorFirstName} ${doctorLastName}`,
          note,
          createdAt: moment(createdAt).format("YYYY-MM-DD"),
        };
      },
    );
    const sharedMedicalDocuments = await Promise.all(dataPromises);
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(sharedMedicalDocuments),
    });
    return Response.SUCCESS({ data: sharedMedicalDocuments });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.getDoctorSharedMedicalDocument = async ({ userId, sharedDocId }) => {
  try {
    const cacheKey = `doctor-shared-medical-documents:${sharedDocId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const doctor = await getDoctorByUserId(userId);

    if (!doctor) {
      return Response.NOT_FOUND({ message: "Doctor Profile Not Found" });
    }
    const { doctor_id: doctorId, title } = doctor;

    const document = await getDoctorSharedMedicalDocumentById({
      doctorId,
      sharedDocumentId: sharedDocId,
    });

    if (!document) {
      return Response.NOT_FOUND({
        message: "Shared Medical Document Not Found.",
      });
    }

    const {
      sharing_id: sharingId,
      document_id: documentId,
      document_uuid: documentUUID,
      document_title: documentTitle,
      patient_id: patientId,
      patient_first_name: patientFirstName,
      patient_last_name: patientLastName,
      doctor_first_name: doctorFirstName,
      doctor_last_name: doctorLastName,
      note,
      created_at: createdAt,
    } = document;

    const documentUrl = await getFileUrlFromS3Bucket(documentUUID);

    const sharedMedicalDocument = {
      sharingId,
      documentId,
      documentUUID,
      documentUrl,
      documentTitle,
      patientId,
      patientName: `${patientFirstName} ${patientLastName}`,
      doctorName: `${title} ${doctorFirstName} ${doctorLastName}`,
      note,
      createdAt: moment(createdAt).format("YYYY-MM-DD"),
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(sharedMedicalDocument),
    });

    return Response.SUCCESS({ data: sharedMedicalDocument });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
