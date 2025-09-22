const { v4: uuidv4 } = require("uuid");
const {
  getPatientMedicalDocumentByDocumentId,
  getMedicalDocumentsByPatientId,
  createPatientMedicalDocument,
  deletePatientDocById,
  updatePatientMedicalDocumentById,
  createPatientDocumentSharing,
  getSharedMedicalDocumentByIdAndDoctorId,
  getPatientSharedMedicalDocuments,
  getPatientSharedMedicalDocument,
  deletePatientSharedMedicalDocument,
} = require("../../repository/patient-docs.repository");
const { getPatientByUserId } = require("../../repository/patients.repository");
const Response = require("../../utils/response.utils");
const {
  uploadFileToS3Bucket,
  deleteFileFromS3Bucket,
} = require("../../utils/aws-s3.utils");
const { documentSharedWithDoctorSMS } = require("../../utils/sms.utils");
const { getDoctorById } = require("../../repository/doctors.repository");
const { redisClient } = require("../../config/redis.config");
const {
  mapPatientMedicalDocumentRow,
  mapPatientDocumentRow,
} = require("../../utils/db-mapper.utils");
const logger = require("../../middlewares/logger.middleware");
const {
  generateVerificationToken,
  decryptText,
} = require("../../utils/auth.utils");
const {
  cacheKeyBulider,
  getPaginationInfo,
} = require("../../utils/caching.utils");

exports.getPatientMedicalDocuments = async (userId, page, limit) => {
  try {
    const patient = await getPatientByUserId(userId);
    if (!patient) {
      logger.warn(`Patient Record Not Found for user ${userId}`);
      return Response.NOT_FOUND({ message: "Patient Record Not Found" });
    }
    const { patient_id: patientId } = patient;
    const offset = (page - 1) * limit;

    const cacheKey = cacheKeyBulider(
      `patient:${patientId}:documents:all`,
      limit,
      offset,
    );
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({
        data,
        pagination,
      });
    }
    const rawData = await getMedicalDocumentsByPatientId(
      patientId,
      limit,
      offset,
    );
    if (!rawData?.length) {
      return Response.SUCCESS({
        message: "No patient medical documents found",
        data: [],
      });
    }

    const { totalRows } = rawData[0];

    const documents = await Promise.all(
      rawData.map((document) => mapPatientDocumentRow(document)),
    );

    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const valueToCache = {
      data: documents,
      pagination: paginationInfo,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(valueToCache),
    });
    return Response.SUCCESS({ data: documents, pagination: paginationInfo });
  } catch (error) {
    logger.error("getPatientMedicalDocuments: ", error);
    throw error;
  }
};

exports.getPatientMedicalDocument = async ({ userId, docId }) => {
  try {
    const patient = await getPatientByUserId(userId);

    if (!patient) {
      logger.warn(`Patient Record Not Found for user ${userId}`);
      return Response.NOT_FOUND({ message: "Patient Record Not Found" });
    }

    const { patient_id: patientId } = patient;
    const cacheKey = `patient:${patientId}:documents:${docId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await getPatientMedicalDocumentByDocumentId({
      documentId: docId,
      patientId,
    });

    if (!rawData) {
      logger.warn(
        `Patient Medical Document ${docId} Not Found for user ${userId}`,
      );
      return Response.NOT_FOUND({
        message: "Patient Medical Document Not Found",
      });
    }

    const document = await mapPatientDocumentRow(rawData, true);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(document),
    });
    return Response.SUCCESS({ data: document });
  } catch (error) {
    logger.error("getPatientMedicalDocument: ", error);
    throw error;
  }
};

exports.createPatientMedicalDocument = async ({
  userId,
  file,
  documentTitle,
}) => {
  try {
    const patient = await getPatientByUserId(userId);
    if (!patient) {
      logger.warn(`Patient Record Not Found for user ${userId}`);
      return Response.NOT_FOUND({ message: "Patient Record Not Found" });
    }

    if (!file) {
      logger.warn("No medical document file provided for upload");
      return Response.BAD_REQUEST({
        message: "Please upload medical document file",
      });
    }
    const { patient_id: patientId } = patient;

    const documentUuid = uuidv4();

    const uploaded = await uploadFileToS3Bucket({
      fileName: documentUuid,
      buffer: file.buffer,
      mimetype: file.mimetype,
    });

    if (uploaded.$metadata.httpStatusCode !== 200) {
      logger.error("Error uploading medical document to S3", {
        userId,
        documentTitle,
        fileName: documentUuid,
      });
      return Response.INTERNAL_SERVER_ERROR({
        message: "Error Uploading Medical Document, please try again",
      });
    }

    const { insertId } = await createPatientMedicalDocument({
      documentUuid,
      documentTitle,
      patientId,
      mimeType: file.mimetype,
    });

    if (!insertId) {
      logger.error("Error saving medical document to database", {
        userId,
        documentTitle,
        fileName: documentUuid,
      });
      return Response.INTERNAL_SERVER_ERROR({
        message: "Error Saving Medical Document, please try again",
      });
    }

    // clear cache
    await redisClient.clearCacheByPattern(`patient:${patientId}:documents:*`);
    await redisClient.clearCacheByPattern("patient_doc:*");
    await redisClient.delete(`patient_med_doc:${patientId}`);
    // send response to user
    return Response.CREATED({
      message: "Medical Document Saved Successfully",
    });
  } catch (error) {
    logger.error("createPatientMedicalDocument: ", error);
    throw error;
  }
};

exports.updatePatientMedicalDocument = async ({
  userId,
  docId,
  file,
  documentTitle,
}) => {
  try {
    const patient = await getPatientByUserId(userId);
    if (!patient) {
      logger.warn(`Patient Record Not Found for user ${userId}`);
      return Response.NOT_FOUND({ message: "Patient Record Not Found" });
    }

    const { patient_id: patientId } = patient;
    const document = await getPatientMedicalDocumentByDocumentId({
      patientId,
      documentId: docId,
    });
    if (!document) {
      logger.warn(
        `Patient Medical Document ${docId} Not Found for user ${userId}`,
      );
      return Response.NOT_FOUND({
        message: "Specified Medical Document Not Found!",
      });
    }

    if (!file) {
      logger.warn("No medical document file provided for update");
      return Response.BAD_REQUEST({
        message: "Please upload a medical document.",
      });
    }

    const { document_uuid: documentUUID } = document;

    const uploaded = await uploadFileToS3Bucket({
      fileName: documentUUID,
      buffer: file.buffer,
      mimetype: file.mimetype,
    });
    if (uploaded.$metadata.httpStatusCode !== 200) {
      logger.error("Error uploading medical document to S3", {
        userId,
        documentTitle,
        fileName: documentUUID,
      });
      return Response.INTERNAL_SERVER_ERROR({
        message: "Error Uploading Medical Document, please try again",
      });
    }

    const { affectedRows } = await updatePatientMedicalDocumentById({
      patientId,
      documentTitle,
      documentId: docId,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.error("Error updating medical document in database", {
        userId,
        documentTitle,
        fileName: documentUUID,
      });
      return Response.NOT_MODIFIED({});
    }

    await redisClient.clearCacheByPattern(`patient:${patientId}:documents:*`);
    await redisClient.delete(`patient:${patientId}:documents:${docId}`);
    await redisClient.delete(`patient_doc:${docId}`);
    await redisClient.delete(`patient_med_doc:${patientId}`);

    // send response to user
    return Response.CREATED({
      message: "Medical Document Updated Successfully",
    });
  } catch (error) {
    logger.error("updatePatientMedicalDocument: ", error);
    throw error;
  }
};
exports.deletePatientMedicalDocument = async ({ userId, documentId }) => {
  try {
    const patient = await getPatientByUserId(userId);
    if (!patient) {
      return Response.NOT_FOUND({ message: "Patient Record Not Found" });
    }
    const { patient_id: patientId } = patient;
    const document = await getPatientMedicalDocumentByDocumentId({
      patientId,
      documentId,
    });
    if (!document) {
      return Response.NOT_FOUND({ message: "Medical Document Not Found" });
    }
    const { document_uuid: documentUUID } = document;
    const [s3Delete, dbDelete] = await Promise.allSettled([
      deleteFileFromS3Bucket(documentUUID),
      deletePatientDocById({ documentId, patientId }),
    ]);

    if (s3Delete.status === "rejected" || dbDelete.status === "rejected") {
      logger.error("Error deleting medical document from S3 & DB", {
        userId,
        documentId,
        documentUUID,
      });
      return Response.NOT_MODIFIED({});
    }

    await redisClient.clearCacheByPattern(`patient:${patientId}:documents:*`);
    await redisClient.delete(`patient:${patientId}:documents:${documentId}`);
    await redisClient.delete(`patient_doc:${documentId}`);
    await redisClient.delete(`patient_med_doc:${patientId}`);

    return Response.SUCCESS({
      message: "Medical Document Deleted Successfully",
    });
  } catch (error) {
    logger.error("deletePatientMedicalDocument: ", error);
    throw error;
  }
};

// medical document sharing
exports.createPatientSharedMedicalDocument = async ({
  userId,
  documentId,
  doctorId,
  note,
}) => {
  try {
    const [{ value: patient }, { value: doctor }] = await Promise.allSettled([
      getPatientByUserId(userId),
      getDoctorById(doctorId),
    ]);

    if (!patient) {
      logger.warn(`Patient Record Not Found for user ${userId}`);
      return Response.NOT_FOUND({ message: "Patient Record Not Found" });
    }
    if (!doctor) {
      logger.warn(`Doctor Record Not Found for ID ${doctorId}`);
      return Response.NOT_FOUND({ message: "Selected Doctor Not Found" });
    }

    const {
      patient_id: patientId,
      first_name: firstName,
      last_name: lastName,
    } = patient;
    const {
      mobile_number: doctorMobileNumber,
      first_name: doctorFirstName,
      last_name: doctorLastName,
    } = doctor;

    const patientFirstName = decryptText(firstName);
    const patientLastName = decryptText(lastName);

    // check if the document was previously shared with the doctor
    const alreadyShared = await getSharedMedicalDocumentByIdAndDoctorId({
      documentId,
      doctorId,
    });

    if (alreadyShared) {
      logger.warn(
        `Medical Document ${documentId} already shared with Doctor ${doctorId}`,
      );
      return Response.NOT_MODIFIED({
        message: "Medical Document already shared with this doctor",
      });
    }

    const docOtp = generateVerificationToken();

    const { insertId } = await createPatientDocumentSharing({
      documentId,
      patientId,
      doctorId,
      otp: docOtp,
      note,
    });

    if (!insertId) {
      logger.error("Failed to create Patient Document Sharing Record");
      return Response.BAD_REQUEST({
        message: "Failed to share Medical Document. Try again",
      });
    }

    //  send sms alert to doctor
    await documentSharedWithDoctorSMS({
      doctorName: `${doctorFirstName} ${doctorLastName}`,
      mobileNumber: doctorMobileNumber,
      patientName: `${patientFirstName} ${patientLastName}`,
    });

    await Promise.all([
      redisClient.clearCacheByPattern(`patient:${patientId}:documents:*`),
      redisClient.delete(`doctor:${doctorId}:documents`),
      redisClient.clearCacheByPattern(`doctor:${doctorId}:documents:*`),
      redisClient.delete(`patient:${patientId}:documents:${documentId}`),
    ]);

    return Response.SUCCESS({
      message: "Medical Document Shared Successfully",
    });
  } catch (error) {
    logger.error("createPatientSharedMedicalDocument: ", error);
    throw error;
  }
};

exports.getPatientSharedMedicalDocuments = async (userId) => {
  try {
    const patient = await getPatientByUserId(userId);

    if (!patient) {
      logger.warn(`Patient Record Not Found for user ${userId}`);
      return Response.NOT_FOUND({ message: "Patient Record Not Found" });
    }

    const { patient_id: patientId } = patient;
    const rawData = await getPatientSharedMedicalDocuments(patientId);

    if (!rawData?.length) {
      return Response.SUCCESS({
        message: "No patient shared medical documents found",
        data: [],
      });
    }

    const data = await Promise.all(
      rawData.map((doc) => mapPatientMedicalDocumentRow(doc)),
    );
    return Response.SUCCESS({ data });
  } catch (error) {
    logger.error("getPatientSharedMedicalDocuments: ", error);
    throw error;
  }
};
exports.getPatientSharedMedicalDocument = async ({ userId, documentId }) => {
  try {
    const patient = await getPatientByUserId(userId);

    if (!patient) {
      logger.warn(`Patient Record Not Found for user ${userId}`);
      return Response.NOT_FOUND({ message: "Patient Record Not Found" });
    }

    const { patient_id: patientId } = patient;

    const rawData = await getPatientSharedMedicalDocument({
      patientId,
      documentId,
    });

    if (!rawData) {
      logger.warn(
        `Shared Medical Document ${documentId} Not Found for user ${userId}`,
      );
      return Response.NOT_FOUND({
        message: "Shared Medical Document Not Found",
      });
    }

    const data = await mapPatientMedicalDocumentRow(rawData, true);

    return Response.SUCCESS({ data });
  } catch (error) {
    logger.error("getPatientSharedMedicalDocument: ", error);
    throw error;
  }
};
exports.deletePatientSharedMedicalDocument = async ({ userId, documentId }) => {
  try {
    const patient = await getPatientByUserId(userId);
    if (!patient) {
      logger.warn(`Patient Record Not Found for user ${userId}`);
      return Response.NOT_FOUND({ message: "Patient Record Not Found" });
    }

    const { patient_id: patientId } = patient;

    const sharedDoc = await getPatientSharedMedicalDocument({
      patientId,
      documentId,
    });

    if (!sharedDoc) {
      return Response.NOT_FOUND({
        message: "Shared Medical Document Not Found",
      });
    }

    const { doctor_id: doctorId } = sharedDoc;

    const { affectedRows } = await deletePatientSharedMedicalDocument({
      patientId,
      documentId,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.warn(
        `Shared Medical Document ${documentId} Not Found for user ${userId}`,
      );
      return Response.NOT_FOUND({
        message: "Shared Medical Document Not Found",
      });
    }

    await Promise.allSettled([
      redisClient.clearCacheByPattern(`patient:${patientId}:documents:*`),
      redisClient.delete(`doctor:${doctorId}:documents`),
      redisClient.clearCacheByPattern(`doctor:${doctorId}:documents:*`),
      redisClient.delete(`patient:${patientId}:documents:${documentId}`),
      redisClient.delete(`patient_doc:${documentId}`),
      redisClient.delete(`patient_med_doc:${patientId}`),
    ]);

    return Response.SUCCESS({
      message: "Shared Medical Document Deleted Successfully",
    });
  } catch (error) {
    logger.error("deletePatientSharedMedicalDocument: ", error);
    throw error;
  }
};
