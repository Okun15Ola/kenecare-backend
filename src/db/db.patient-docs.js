const { connectionPool } = require("./db.connection");

exports.getAllPatientDocs = () => {
  const sql =
    "SELECT medical_document_id, patient_medical_documents.patient_id,title,  first_name, middle_name, last_name, document_uuid, patient_medical_documents.medical_document_id, document_title,  access_token FROM patient_medical_documents INNER JOIN patients on patient_medical_documents.patient_id = patients.patient_id ORDER by medical_document_id DESC;";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};

exports.getPatientMedicalDocumentById = (documentId) => {
  const sql =
    "SELECT medical_document_id, patient_medical_documents.patient_id,title,  first_name, middle_name, last_name, document_uuid, patient_medical_documents.medical_document_id, document_title,  access_token FROM patient_medical_documents INNER JOIN patients on patient_medical_documents.patient_id = patients.patient_id WHERE medical_document_id = ? ORDER by medical_document_id DESC;";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [documentId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.getPatientMedicalDocumentByDocumentId = ({ documentId, patientId }) => {
  const sql =
    "SELECT medical_document_id, patient_medical_documents.patient_id,title,  first_name, middle_name, last_name, document_uuid, patient_medical_documents.medical_document_id, document_title,  access_token FROM patient_medical_documents INNER JOIN patients on patient_medical_documents.patient_id = patients.patient_id  WHERE medical_document_id = ? AND patient_medical_documents.patient_id = ? LIMIT 1;";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [documentId, patientId], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};
exports.getMedicalDocumentsByPatientId = (patientId) => {
  const sql =
    "SELECT medical_document_id, patient_medical_documents.patient_id,title,  first_name, middle_name, last_name, document_uuid, patient_medical_documents.medical_document_id, document_title,  access_token FROM patient_medical_documents INNER JOIN patients on patient_medical_documents.patient_id = patients.patient_id  WHERE patient_medical_documents.patient_id = ? ORDER by medical_document_id DESC;";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [patientId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.createPatientMedicalDocument = ({
  documentUuid,
  patientId,
  documentTitle,
}) => {
  const sql =
    "INSERT INTO patient_medical_documents (document_uuid,patient_id,document_title) VALUES (?,?,?)";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [documentUuid, patientId, documentTitle],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};
exports.updatePatientMedicalDocumentById = ({
  patientId,
  documentId,
  documentTitle,
}) => {
  const sql =
    "UPDATE patient_medical_documents SET document_title = ? WHERE medical_document_id = ? AND patient_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [
        documentTitle,
        documentId,
        patientId,
      ],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};
exports.deletePatientDocById = ({ documentId, patientId }) => {
  const sql =
    "DELETE FROM patient_medical_documents WHERE medical_document_id = ? AND patient_id = ?";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [documentId, patientId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
