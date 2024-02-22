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
    "SELECT medical_document_id, patient_medical_documents.patient_id,title,  first_name, middle_name, last_name, document_uuid, patient_medical_documents.medical_document_id, document_title,  access_token FROM patient_medical_documents INNER JOIN patients on patient_medical_documents.patient_id = patients.patient_id WHERE medical_document_id = ? LIMIT 1;";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [documentId], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
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
      [documentTitle, documentId, patientId],
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

//MEDICAL DOCUMENT SHARING
exports.createPatientDocumentSharing = ({
  documentId,
  patientId,
  doctorId,
  otp,
  note,
}) => {
  const sql =
    "INSERT INTO medical_document_sharing (document_id,patient_id,doctor_id, note, otp) VALUES (?,?,?,?,?)";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [documentId, patientId, doctorId, note, otp],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};
exports.getSharedMedicalDocumentByIdAndDoctorId = ({
  documentId,
  doctorId,
}) => {
  const sql =
    "SELECT * FROM medical_document_sharing WHERE document_id = ? AND doctor_id = ? LIMIT 1;";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [documentId, doctorId], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};
exports.getPatientSharedMedicalDocuments = (patientId) => {
  const sql =
    "SELECT mds.sharing_id, mds.document_id, pmd.document_uuid, pmd.document_title, mds.patient_id, p.first_name as 'patient_first_name', p.last_name as 'patient_last_name', d.first_name as 'doctor_first_name' ,d.last_name as 'doctor_last_name', mds.note, mds.created_at FROM medical_document_sharing as mds INNER JOIN patient_medical_documents as pmd on mds.document_id = pmd.medical_document_id INNER JOIN patients as p on mds.patient_id = p.patient_id INNER JOIN doctors as d on mds.doctor_id = d.doctor_id WHERE mds.patient_id = ?;";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [patientId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.getSharedMedicalDocumentsByDoctorId = (doctorId) => {
  const sql =
    "SELECT mds.sharing_id, mds.document_id, pmd.document_uuid, pmd.document_title, mds.patient_id, p.first_name as 'patient_first_name', p.last_name as 'patient_last_name', d.first_name as 'doctor_first_name' ,d.last_name as 'doctor_last_name', mds.note, mds.created_at FROM medical_document_sharing as mds INNER JOIN patient_medical_documents as pmd on mds.document_id = pmd.medical_document_id INNER JOIN patients as p on mds.patient_id = p.patient_id INNER JOIN doctors as d on mds.doctor_id = d.doctor_id WHERE mds.doctor_id = ?;";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [doctorId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
exports.getPatientSharedMedicalDocument = ({ patientId, documentId }) => {
  console.log("PATIENT_ID: ", patientId);
  console.log("DOCUMENT_ID: ", documentId);
  const sql =
    "SELECT mds.sharing_id, mds.document_id, pmd.document_uuid, pmd.document_title, mds.patient_id, p.first_name as 'patient_first_name', p.last_name as 'patient_last_name', d.first_name as 'doctor_first_name' ,d.last_name as 'doctor_last_name', mds.note, mds.created_at FROM medical_document_sharing as mds INNER JOIN patient_medical_documents as pmd on mds.document_id = pmd.medical_document_id INNER JOIN patients as p on mds.patient_id = p.patient_id INNER JOIN doctors as d on mds.doctor_id = d.doctor_id WHERE mds.patient_id = ? AND mds.document_id = ? LIMIT 1;";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [patientId, documentId], (error, results) => {
      if (error) return reject(error);

      console.log(results);
      return resolve(results[0]);
    });
  });
};

exports.updatePatientSharedMedicalDocument = ({
  documentId,
  patientId,
  doctorId,
  note,
}) => {
  const sql =
    "UPDATE medical_document_sharing SET  doctor_id = ? , note = ? WHERE patient_id = ? AND document_id = ?;";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [doctorId, note, patientId, documentId],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};
exports.deletePatientSharedMedicalDocument = ({ documentId, patientId }) => {
  const sql =
    "DELETE FROM medical_document_sharing WHERE patient_id = ? AND document_id = ?;";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [patientId, documentId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
