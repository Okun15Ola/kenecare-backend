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
} = require("../db/db.patient-docs");
const { getPatientByUserId } = require("../db/db.patients");
const Response = require("../utils/response.utils");
const {
  uploadFileToS3Bucket,
  getFileFromS3Bucket,
  deleteFileFromS3Bucket,
  getObjectFromS3Bucket,
} = require("../utils/aws-s3.utils");
const { documentSharedWithDoctorSMS } = require("../utils/sms.utils");
const { getDoctorById } = require("../db/db.doctors");
const { encryptFile, decryptFile } = require("../utils/file-upload.utils");
const { getUserById } = require("../db/db.users");

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

    return Response.SUCCESS({ data: documents });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getPatientMedicalDocument = async ({ userId, docId }) => {
  try {
    const { password } = await getUserById(userId);
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

    const buffer = await getObjectFromS3Bucket(documentUUID);

    const decryptedBuffer = decryptFile({ buffer, password });

    const document = {
      documentId,
      documentUUID,
      documentTitle,
      mimeType,
      documentBuffer: decryptedBuffer,
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
    const user = await getUserById(userId);
    const { password } = user;
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

    const encryptedFileBuffer = encryptFile({ buffer: file.buffer, password });

    const uploaded = await uploadFileToS3Bucket({
      fileName: documentUuid,
      buffer: encryptedFileBuffer,
      mimetype: "enc",
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

    const data = rawData.map(
      ({
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
      }) => ({
        sharingId,
        documentId,
        documentUUID,
        documentTitle,
        patientId,
        patientName: `${patientFirstName} ${patientLastName}`,
        doctorName: `Dr. ${doctorFirstName} ${doctorLastName}`,
        note,
      }),
    );

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
    } = rawData;

    const url = await getFileFromS3Bucket(documentUUID);

    const data = {
      sharingId,
      documentId,
      documentUUID,
      documentUrl: url,
      documentTitle,
      patientId,
      patientFirstName,
      patientLastName,
      doctorFirstName,
      doctorLastName,
      note,
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
