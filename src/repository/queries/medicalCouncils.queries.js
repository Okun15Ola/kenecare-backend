module.exports = {
  GET_ALL_MEDICAL_COUNCILS:
    "SELECT mc.*, COUNT(*) OVER() AS totalRows FROM medical_councils mc LIMIT ?,?",
  COUNT_MEDICAL_COUNCILS: "SELECT COUNT(*) AS totalRows FROM medical_councils",
  GET_MEDICAL_COUNCIL_BY_ID:
    "SELECT * FROM medical_councils WHERE council_id = ? LIMIT 1",
  GET_MEDICAL_COUNCIL_BY_EMAIL:
    "SELECT * FROM medical_councils WHERE email = ? LIMIT 1",
  GET_MEDICAL_COUNCIL_BY_MOBILE:
    "SELECT * FROM medical_councils WHERE mobile_number = ? LIMIT 1",
  CREATE_MEDICAL_COUNCIL:
    "INSERT INTO medical_councils (council_name, email, mobile_number, address, inputted_by) VALUES (?,?,?,?,?)",
  UPDATE_MEDICAL_COUNCIL_BY_ID:
    "UPDATE medical_councils SET council_name = ?, email = ?, mobile_number = ?, address = ? WHERE council_id = ?",
  UPDATE_MEDICAL_COUNCIL_STATUS_BY_ID:
    "UPDATE medical_councils SET is_active = ? WHERE council_id = ?",
  DELETE_MEDICAL_COUNCIL_BY_ID:
    "DELETE FROM medical_councils WHERE council_id = ?",
  SELECT_ACTIVE_DOCTOR_REGISTRATIONS_WITH_DETAILS: `
        SELECT
            dcr.council_registration_id,
            dcr.certificate_expiry_date,
            d.doctor_id,
            d.first_name,
            d.last_name,
            d.mobile_number
        FROM
            doctors_council_registration dcr
        INNER JOIN
            doctors d ON dcr.doctor_id = d.doctor_id
        WHERE
            dcr.registration_status = 'approved' AND d.is_profile_approved = 1
    `,
  UPDATE_DOCTOR_REGISTRATIONS_COUNCIL_EXPIRED_STATUS: `
    UPDATE doctors_council_registration SET registration_status = 'expired WHERE council_registration_id = ?';
  `,
};
