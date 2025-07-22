module.exports = {
  GET_PRESCRIPTIONS_BY_APPOINTMENT_ID: `
    SELECT * FROM appointment_prescriptions WHERE appointment_id = ? LIMIT 1;
  `,
  COUNT_PRESCRIPTIONS_BY_APPOINTMENT_ID: `
    SELECT COUNT(*) AS totalRows FROM appointment_prescriptions WHERE appointment_id = ?
  `,
  GET_PRESCRIPTION_BY_ID: `
    SELECT * FROM appointment_prescriptions WHERE prescription_id = ?;
  `,
  GET_SIMILAR_PRESCRIPTION: `
    SELECT * FROM appointment_prescriptions WHERE appointment_id = ? AND diagnosis = ? AND medicines = ? AND doctors_comment = ? LIMIT 1;
  `,
  CREATE_PRESCRIPTION: `
    INSERT INTO appointment_prescriptions (appointment_id, diagnosis, medicines, doctors_comment, access_jwt)
    VALUES (?, ?, ?, ?, ?);
  `,
  UPDATE_PRESCRIPTION: `
    UPDATE appointment_prescriptions
    SET diagnosis = ?, medicines = ?, doctors_comment = ?
    WHERE prescription_id = ? AND appointment_id = ? LIMIT 1;
  `,
};
