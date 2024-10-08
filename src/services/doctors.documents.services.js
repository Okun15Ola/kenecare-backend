const {
  getSharedMedicalDocumentsByDoctorId,
  getDoctorSharedMedicalDocumentById,
} = require("../db/db.patient-docs");
const Response = require("../utils/response.utils");
// const { getFileFromS3Bucket } = require("../utils/aws-s3.utils");
const { getDoctorByUserId } = require("../db/db.doctors");
const { getFileUrlFromS3Bucket } = require("../utils/aws-s3.utils");

exports.getDoctorSharedMedicalDocuments = async (userId) => {
  try {
    const doctor = await getDoctorByUserId(userId);
    // console.log(doctor);

    if (!doctor) {
      return Response.NOT_FOUND({ message: "Doctor Profile Not Found" });
    }

    const { doctor_id: doctorId, title } = doctor;

    const rawData = await getSharedMedicalDocumentsByDoctorId(doctorId);

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
        doctorName: `${title} ${doctorFirstName} ${doctorLastName}`,
        note,
      }),
    );

    return Response.SUCCESS({ data });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.getDoctorSharedMedicalDocument = async ({ userId, sharedDocId }) => {
  try {
    const doctor = await getDoctorByUserId(userId);

    if (!doctor) {
      return Response.NOT_FOUND({ message: "Doctor Profile Not Found" });
    }
    const { doctor_id: doctorId, title } = doctor;

    // const document = await getSharedMedicalDocumentById(sharedDocId);
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
    } = document;

    const documentUrl = await getFileUrlFromS3Bucket(documentUUID);

    const data = {
      sharingId,
      documentId,
      documentUUID,
      documentUrl,
      documentTitle,
      patientId,
      patientName: `${patientFirstName} ${patientLastName}`,
      doctorName: `${title} ${doctorFirstName} ${doctorLastName}`,
      note,
    };

    return Response.SUCCESS({ data });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
