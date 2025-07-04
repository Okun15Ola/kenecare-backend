const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
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
  getFileUrlFromS3Bucket,
} = require("../../utils/aws-s3.utils");
const { documentSharedWithDoctorSMS } = require("../../utils/sms.utils");
const { getDoctorById } = require("../../repository/doctors.repository");
const redisClient = require("../../config/redis.config");

exports.getPatientMedicalDocuments = async (userId) => {
  try {
    const patient = await getPatientByUserId(userId).catch((error) => {
      throw error;
    });
    if (!patient) {
      return Response.NOT_FOUND({ message: "Patient Record Not Found" });
    }
    const { patient_id: patientId } = patient;
    const cacheKey = `patient-documents-${patientId}:all`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await getMedicalDocumentsByPatientId(patientId);

    const documents = rawData.map(
      ({
        medical_document_id: documentId,
        document_uuid: documentUUID,
        document_title: documentTitle,
      }) => {
        return {
          documentId,
          documentUUID,
          documentTitle,
        };
      },
    );

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(documents),
    });
    return Response.SUCCESS({ data: documents });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getPatientMedicalDocument = async ({ userId, docId }) => {
  try {
    const cacheKey = `patient-documents:${docId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const patient = await getPatientByUserId(userId);

    const { patient_id: patientId } = patient;
    const rawData = await getPatientMedicalDocumentByDocumentId({
      documentId: docId,
      patientId,
    });

    const {
      medical_document_id: documentId,
      document_uuid: documentUUID,
      document_title: documentTitle,
      mimetype: mimeType,
    } = rawData;

    // const buffer = await getObjectFromS3Bucket(documentUUID);

    // const decryptedBuffer = decryptFile({ buffer, password });

    const fileUrl = await getFileUrlFromS3Bucket(documentUUID);

    const document = {
      documentId,
      documentUUID,
      documentTitle,
      mimeType,
      fileUrl,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(document),
    });
    return Response.SUCCESS({ data: document });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.createPatientMedicalDocument = async ({
  userId,
  file,
  documentTitle,
}) => {
  try {
    // const user = await getUserById(userId);
    // const { password } = user;
    const patient = await getPatientByUserId(userId);
    if (!patient) {
      return Response.NOT_FOUND({ message: "Patient Record Not Found" });
    }

    if (!file) {
      return Response.BAD_REQUEST({
        message: "Please upload medical document file",
      });
    }
    const { patient_id: patientId } = patient;

    const documentUuid = uuidv4();

    // const encryptedFileBuffer = encryptFile({ buffer: file.buffer, password });

    const uploaded = await uploadFileToS3Bucket({
      fileName: documentUuid,
      buffer: file.buffer,
      mimetype: file.mimetype,
    });

    if (uploaded.$metadata.httpStatusCode !== 200) {
      return Response.INTERNAL_SERVER_ERROR({
        message: "Error Uploading Medical Document, please try again",
      });
    }

    await createPatientMedicalDocument({
      documentUuid,
      documentTitle,
      patientId,
      mimeType: file.mimetype,
    });

    // send response to user
    return Response.CREATED({
      message: "Medical Document Saved Successfully",
    });
  } catch (error) {
    console.error(error);
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
      return Response.NOT_FOUND({ message: "Patient Record Not Found" });
    }

    const { patient_id: patientId } = patient;
    const document = await getPatientMedicalDocumentByDocumentId({
      patientId,
      documentId: docId,
    });
    if (!document) {
      return Response.NOT_FOUND({
        message: "Specified Medical Document Not Found!",
      });
    }

    if (!file) {
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
      return Response.INTERNAL_SERVER_ERROR({
        message: "Error Uploading Medical Document, please try again",
      });
    }

    // save to database

    await updatePatientMedicalDocumentById({
      patientId,
      documentTitle,
      documentId: docId,
    });

    // send response to user
    return Response.CREATED({
      message: "Medical Document Updated Successfully",
    });
  } catch (error) {
    console.error(error);
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
    await Promise.all([
      deleteFileFromS3Bucket(documentUUID),
      deletePatientDocById({ documentId, patientId }),
    ]);

    return Response.SUCCESS({
      message: "Medical Document Deleted Successfully",
    });
  } catch (error) {
    console.error(error);
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

    // TODO move to a middle ware function requirePatientProfile()
    if (!patient) {
      return Response.NOT_FOUND({ message: "Patient Record Not Found" });
    }
    if (!doctor) {
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
    // check if the document was previously shared with the doctor
    const alreadyShared = await getSharedMedicalDocumentByIdAndDoctorId({
      documentId,
      doctorId,
    });
    if (alreadyShared) {
      return Response.NOT_MODIFIED();
    }

    // TODO generate OTP

    // create new sharing record in the database
    await createPatientDocumentSharing({
      documentId,
      patientId,
      doctorId,
      otp: 123455,
      note,
    });

    //  send sms alert to doctor
    await documentSharedWithDoctorSMS({
      doctorName: `${doctorFirstName} ${doctorLastName}`,
      mobileNumber: doctorMobileNumber,
      patientName: `${firstName} ${lastName}`,
    });

    return Response.SUCCESS({
      message: "Medical Document Shared Successfully",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getPatientSharedMedicalDocuments = async (userId) => {
  try {
    const patient = await getPatientByUserId(userId);

    if (!patient) {
      return Response.NOT_FOUND({ message: "Patient Record Not Found" });
    }

    const { patient_id: patientId } = patient;
    const rawData = await getPatientSharedMedicalDocuments(patientId);

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
          patientId,
          documentUrl,
          patientName: `${patientFirstName} ${patientLastName}`,
          doctorName: `Dr. ${doctorFirstName} ${doctorLastName}`,
          note,
          createdAt: moment(createdAt).format("YYYY-MM-DD"),
        };
      },
    );
    const data = await Promise.all(dataPromises);
    return Response.SUCCESS({ data });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.getPatientSharedMedicalDocument = async ({ userId, documentId }) => {
  try {
    const patient = await getPatientByUserId(userId);

    if (!patient) {
      return Response.NOT_FOUND({ message: "Patient Record Not Found" });
    }

    const { patient_id: patientId } = patient;

    // create new sharing record in the database
    const rawData = await getPatientSharedMedicalDocument({
      patientId,
      documentId,
    });
    if (!rawData) {
      return Response.NOT_FOUND({
        message: "Shared Medical Document Not Found",
      });
    }

    const {
      sharing_id: sharingId,
      document_uuid: documentUUID,
      document_title: documentTitle,
      patient_first_name: patientFirstName,
      patient_last_name: patientLastName,
      doctor_first_name: doctorFirstName,
      doctor_last_name: doctorLastName,
      note,
      created_at: createdAt,
    } = rawData;

    const documentUrl = await getFileUrlFromS3Bucket(documentUUID);

    const data = {
      sharingId,
      documentId,
      documentUUID,
      documentUrl,
      documentTitle,
      patientId,
      patientFirstName,
      patientLastName,
      doctorFirstName,
      doctorLastName,
      note,
      createdAt: moment(createdAt).format("YYYY-MM-DD"),
    };

    return Response.SUCCESS({ data });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.deletePatientSharedMedicalDocument = async ({ userId, documentId }) => {
  try {
    const patient = await getPatientByUserId(userId);
    if (!patient) {
      return Response.NOT_FOUND({ message: "Patient Record Not Found" });
    }

    const { patient_id: patientId } = patient;

    // create new sharing record in the database
    await deletePatientSharedMedicalDocument({
      patientId,
      documentId,
    });

    return Response.SUCCESS({
      message: "Shared Medical Document Deleted Successfully",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
