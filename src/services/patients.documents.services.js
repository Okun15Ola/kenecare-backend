const {
  getAllPatientDocs,
  getPatientMedicalDocumentByDocumentId,
  getMedicalDocumentsByPatientId,
  createPatientMedicalDocument,
  deletePatientDocById,
  updatePatientMedicalDocumentById: updatePatientMedicalDocumentById,
} = require("../db/db.patient-docs");
const { getPatientByUserId } = require("../db/db.patients");
const Response = require("../utils/response.utils");
const { awsBucketName } = require("../config/default.config");
const {
  uploadFileToS3Bucket,
  getFileFromS3Bucket,
  deleteFileFromS3Bucket,
} = require("../utils/aws-s3.utils");
const { generateFileName } = require("../utils/file-upload.utils");
const { v4: uuidv4 } = require("uuid");

exports.getPatientMedicalDocuments = async (userId) => {
  try {
    const patient = await getPatientByUserId(userId).catch((error) => {
      throw error;
    });
    if (!patient) {
      return Response.NOT_FOUND({ message: "Patient Record Not Found" });
    }
    const { patient_id: patientId } = patient;
    const rawData = await getMedicalDocumentsByPatientId(patientId);

    const documentPromises = rawData.map(
      async ({
        medical_document_id: documentId,
        patient_id: patientId,
        document_uuid: documentUUID,
        first_name: firstName,
        last_name: lastName,
        document_title: documentTitle,
      }) => {
        const url = await getFileFromS3Bucket(documentUUID);
        return {
          documentId,
          documentUUID,
          patientId,
          patientName: `${firstName} ${lastName}`,
          documentTitle,
          documentUrl: url,
        };
      }
    );

    const documents = await Promise.all(documentPromises);

    return Response.SUCCESS({ data: documents });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getPatientMedicalDocument = async ({ userId, docId }) => {
  try {
    const patient = await getPatientByUserId(userId);
    if (!patient) {
      return Response.NOT_FOUND({ message: "Patient Record Not Found" });
    }
    const { patient_id: patientId } = patient;
    const rawData = await getPatientMedicalDocumentByDocumentId({
      documentId: docId,
      patientId,
    });

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Medical Record Not Found" });
    }

    const {
      medical_document_id: documentId,
      document_uuid: documentUUID,
      first_name: firstName,
      last_name: lastName,
      document_title: documentTitle,
    } = rawData;

    const url = await getFileFromS3Bucket(documentUUID);

    const document = {
      documentId,
      patientId,
      patientName: `${firstName} ${lastName}`,
      documentTitle,
      documentUrl: url,
    };

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
    const patient = await getPatientByUserId(userId);
    if (!patient) {
      return Response.NOT_FOUND({ message: "Patient Record Not Found" });
    }

    if (file) {
      const { patient_id: patientId } = patient;

      const documentUuid = uuidv4();

      const uploaded = await uploadFileToS3Bucket({
        fileName: documentUuid,
        buffer: file.buffer,
        mimetype: file.mimetype,
      });

      if (uploaded.$metadata.httpStatusCode === 200) {
        //save to database

        const done = await createPatientMedicalDocument({
          documentUuid,
          documentTitle,
          patientId,
        });

        //send response to user
        return Response.CREATED({
          message: "Medical Document Saved Successfully",
        });
      }
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// exports.updatePatientMedicalDocumentAccessToken = async ({
//   userId,
//   docId,
//   documentTitle,
// }) => {
//   try {

//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };
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
        message: "Please upload a medical document",
      });
    }

    const { document_uuid: documentUUID } = document;

    const uploaded = await uploadFileToS3Bucket({
      fileName: documentUUID,
      buffer: file.buffer,
      mimetype: file.mimetype,
    });

    if (uploaded.$metadata.httpStatusCode === 200) {
      //save to database

      const done = await updatePatientMedicalDocumentById({
        patientId,
        documentTitle,
        documentId: docId,
      });

      //send response to user
      return Response.CREATED({
        message: "Medical Document Updated Successfully",
      });
    }
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
