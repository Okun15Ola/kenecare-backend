module.exports = {
  GET_ALL_COMMON_SYMPTOMS: `
    SELECT symptom_id, symptom_name, symptom_descriptions, common_symptoms.image_url, general_consultation_fee, common_symptoms.tags, common_symptoms.is_active, common_symptoms.inputted_by, speciality_name
    FROM common_symptoms
    INNER JOIN medical_specialities ON common_symptoms.speciality_id = medical_specialities.speciality_id
  `,
  COUNT_COMMON_SYMPTOMS: "SELECT COUNT(*) AS totalRows FROM common_symptoms;",
  GET_COMMON_SYMPTOMS_BY_ID:
    "SELECT * FROM common_symptoms WHERE symptom_id = ? LIMIT 1",
  GET_COMMON_SYMPTOMS_BY_NAME:
    "SELECT * FROM common_symptoms WHERE symptom_name = ? LIMIT 1",
  CREATE_COMMON_SYMPTOMS: `
    INSERT INTO common_symptoms (symptom_name, symptom_descriptions, speciality_id, image_url, general_consultation_fee, tags, inputted_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
  UPDATE_COMMON_SYMPTOMS_BY_ID: `
    UPDATE common_symptoms
    SET symptom_name = ?, symptom_descriptions = ?, speciality_id = ?, image_url = ?, general_consultation_fee = ?, tags = ?
    WHERE symptom_id = ?
  `,
  DELETE_COMMON_SYMPTOMS_BY_ID:
    "DELETE FROM common_symptoms WHERE symptom_id = ?",
};
