module.exports = {
  GET_ALL_SPECIALTIES: `
    SELECT ms.*, COUNT(*) OVER() AS totalRows FROM medical_specialities ms LIMIT ?, ?
  `,
  COUNT_SPECIALITY: "SELECT COUNT(*) AS totalRows FROM medical_specialities;",
  GET_SPECIALTY_BY_ID: `
    SELECT * FROM medical_specialities WHERE speciality_id = ? LIMIT 1;
  `,
  GET_SPECIALTY_BY_NAME: `
    SELECT * FROM medical_specialities WHERE speciality_name = ? LIMIT 1;
  `,
  CREATE_SPECIALTY: `
    INSERT INTO medical_specialities (speciality_name, speciality_description, image_url, inputted_by)
    VALUES (?, ?, ?, ?);
  `,
  UPDATE_SPECIALTY_BY_ID: `
    UPDATE medical_specialities
    SET speciality_name = ?, speciality_description = ?, image_url = ?
    WHERE speciality_id = ?;
  `,
  UPDATE_SPECIALTY_STATUS_BY_ID: `
    UPDATE medical_specialities SET is_active = ? WHERE speciality_id = ?;
  `,
  DELETE_SPECIALTY_BY_ID: `
    DELETE FROM medical_specialities WHERE speciality_id = ?;
  `,
};
