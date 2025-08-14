const COMMON_SELECT = `
    SELECT mds.sharing_id, mds.document_id, pmd.document_uuid, pmd.document_title, mds.patient_id, p.first_name as patient_first_name, p.last_name as patient_last_name, d.first_name as doctor_first_name, d.last_name as doctor_last_name, mds.note, mds.created_at
    FROM medical_document_sharing as mds
    INNER JOIN patient_medical_documents as pmd ON mds.document_id = pmd.medical_document_id
    INNER JOIN patients as p ON mds.patient_id = p.patient_id
    INNER JOIN doctors as d ON mds.doctor_id = d.doctor_id
`;

module.exports = {
  GET_ALL_PATIENT_DOCS: `
    SELECT medical_document_id, patient_medical_documents.patient_id, title, first_name, middle_name, last_name, document_uuid, patient_medical_documents.medical_document_id, document_title, mimetype, access_token
    FROM patient_medical_documents
    INNER JOIN patients ON patient_medical_documents.patient_id = patients.patient_id
    ORDER BY medical_document_id DESC
  `,
  GET_PATIENT_DOC_BY_ID: `
    SELECT medical_document_id, patient_medical_documents.patient_id, title, first_name, middle_name, last_name, document_uuid, patient_medical_documents.medical_document_id, document_title, mimetype, access_token
    FROM patient_medical_documents
    INNER JOIN patients ON patient_medical_documents.patient_id = patients.patient_id
    WHERE medical_document_id = ? LIMIT 1;
  `,
  GET_PATIENT_DOC_BY_DOC_AND_PATIENT_ID: `
    SELECT medical_document_id, patient_medical_documents.patient_id, title, first_name, middle_name, last_name, document_uuid, patient_medical_documents.medical_document_id, document_title, mimetype, access_token
    FROM patient_medical_documents
    INNER JOIN patients ON patient_medical_documents.patient_id = patients.patient_id
    WHERE medical_document_id = ? AND patient_medical_documents.patient_id = ? LIMIT 1;
  `,
  GET_DOCS_BY_PATIENT_ID: `
    SELECT medical_document_id, patient_medical_documents.patient_id, title, first_name, middle_name, last_name, document_uuid, patient_medical_documents.medical_document_id, document_title, mimetype, access_token
    FROM patient_medical_documents
    INNER JOIN patients ON patient_medical_documents.patient_id = patients.patient_id
    WHERE patient_medical_documents.patient_id = ? ORDER BY medical_document_id DESC;
  `,
  CREATE_PATIENT_DOC: `
    INSERT INTO patient_medical_documents (document_uuid, patient_id, document_title, mimetype) VALUES (?,?,?,?)
  `,
  UPDATE_PATIENT_DOC_BY_ID: `
    UPDATE patient_medical_documents SET document_title = ? WHERE medical_document_id = ? AND patient_id = ?
  `,
  DELETE_PATIENT_DOC_BY_ID: `
    DELETE FROM patient_medical_documents WHERE medical_document_id = ? AND patient_id = ?
  `,
  // SHARING
  CREATE_DOC_SHARING: `
    INSERT INTO medical_document_sharing (document_id, patient_id, doctor_id, note, otp) VALUES (?,?,?,?,?)
  `,
  GET_SHARED_DOC_BY_ID_AND_DOCTOR: `
    SELECT * FROM medical_document_sharing WHERE document_id = ? AND doctor_id = ? LIMIT 1;
  `,
  GET_PATIENT_SHARED_DOCS: `
    ${COMMON_SELECT}
    WHERE mds.patient_id = ?;
  `,
  GET_SHARED_DOCS_BY_DOCTOR_ID: `
    ${COMMON_SELECT}
    WHERE mds.doctor_id = ?;
  `,
  GET_PATIENT_SHARED_DOC: `
    ${COMMON_SELECT}
    WHERE mds.patient_id = ? AND mds.document_id = ? LIMIT 1;
  `,
  GET_SHARED_DOC_BY_SHARING_ID: `
    ${COMMON_SELECT}
    WHERE mds.sharing_id = ? LIMIT 1;
  `,
  GET_DOCTOR_SHARED_DOC_BY_ID: `
    ${COMMON_SELECT}
    WHERE mds.sharing_id = ? AND mds.doctor_id = ? LIMIT 1;
  `,
  UPDATE_PATIENT_SHARED_DOC: `
    UPDATE medical_document_sharing SET doctor_id = ?, note = ? WHERE patient_id = ? AND document_id = ?;
  `,
  DELETE_PATIENT_SHARED_DOC: `
    DELETE FROM medical_document_sharing WHERE patient_id = ? AND document_id = ?;
  `,
};
