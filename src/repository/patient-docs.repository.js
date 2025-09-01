const { query } = require("./db.connection");
const queries = require("./queries/patientDocs.queries");

exports.getAllPatientDocs = async (limit, offset) => {
  const optimizedQuery = `${queries.GET_ALL_PATIENT_DOCS} LIMIT ${limit} OFFSET ${offset}`;
  return query(optimizedQuery);
};

exports.getPatientMedicalDocumentById = async (documentId) => {
  const result = await query(queries.GET_PATIENT_DOC_BY_ID, [documentId]);
  return result[0];
};

exports.getPatientMedicalDocumentByDocumentId = async ({
  documentId,
  patientId,
}) => {
  const result = await query(queries.GET_PATIENT_DOC_BY_DOC_AND_PATIENT_ID, [
    documentId,
    patientId,
  ]);
  return result[0];
};

exports.getMedicalDocumentsByPatientId = async (patientId, limit, offset) => {
  const optimizedQuery = `${queries.GET_DOCS_BY_PATIENT_ID} LIMIT ${limit} OFFSET ${offset}`;
  return query(optimizedQuery, [patientId]);
};

exports.countMedicalDocumentByPatientId = async (patientId) => {
  const result = await query(queries.COUNT_DOCS_BY_PATIENT_ID, [patientId]);
  return result[0];
};

exports.createPatientMedicalDocument = async ({
  documentUuid,
  patientId,
  documentTitle,
  mimeType,
}) => {
  return query(queries.CREATE_PATIENT_DOC, [
    documentUuid,
    patientId,
    documentTitle,
    mimeType,
  ]);
};

exports.updatePatientMedicalDocumentById = async ({
  patientId,
  documentId,
  documentTitle,
}) => {
  return query(queries.UPDATE_PATIENT_DOC_BY_ID, [
    documentTitle,
    documentId,
    patientId,
  ]);
};

exports.deletePatientDocById = async ({ documentId, patientId }) => {
  return query(queries.DELETE_PATIENT_DOC_BY_ID, [documentId, patientId]);
};

// MEDICAL DOCUMENT SHARING

exports.createPatientDocumentSharing = async ({
  documentId,
  patientId,
  doctorId,
  otp,
  note,
}) => {
  return query(queries.CREATE_DOC_SHARING, [
    documentId,
    patientId,
    doctorId,
    note,
    otp,
  ]);
};

exports.getSharedMedicalDocumentByIdAndDoctorId = async ({
  documentId,
  doctorId,
}) => {
  const result = await query(queries.GET_SHARED_DOC_BY_ID_AND_DOCTOR, [
    documentId,
    doctorId,
  ]);
  return result[0];
};

exports.getPatientSharedMedicalDocuments = async (patientId) => {
  return query(queries.GET_PATIENT_SHARED_DOCS, [patientId]);
};

exports.getSharedMedicalDocumentsByDoctorId = async (doctorId) => {
  return query(queries.GET_SHARED_DOCS_BY_DOCTOR_ID, [doctorId]);
};

exports.getPatientSharedMedicalDocument = async ({ patientId, documentId }) => {
  const result = await query(queries.GET_PATIENT_SHARED_DOC, [
    patientId,
    documentId,
  ]);
  return result[0];
};

exports.getSharedMedicalDocumentById = async (sharedDocumentId) => {
  const result = await query(queries.GET_SHARED_DOC_BY_SHARING_ID, [
    sharedDocumentId,
  ]);
  return result[0];
};

exports.getDoctorSharedMedicalDocumentById = async ({
  doctorId,
  sharedDocumentId,
}) => {
  const result = await query(queries.GET_DOCTOR_SHARED_DOC_BY_ID, [
    sharedDocumentId,
    doctorId,
  ]);
  return result[0];
};

exports.updatePatientSharedMedicalDocument = async ({
  documentId,
  patientId,
  doctorId,
  note,
}) => {
  return query(queries.UPDATE_PATIENT_SHARED_DOC, [
    doctorId,
    note,
    patientId,
    documentId,
  ]);
};

exports.deletePatientSharedMedicalDocument = async ({
  documentId,
  patientId,
}) => {
  return query(queries.DELETE_PATIENT_SHARED_DOC, [patientId, documentId]);
};
