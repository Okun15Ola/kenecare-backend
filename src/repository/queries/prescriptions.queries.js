module.exports = {
  GET_PRESCRIPTIONS_BY_APPOINTMENT_ID: `
    SELECT * FROM appointment_prescriptions WHERE appointment_id = ? LIMIT 1;
  `,
  GET_PRESCRIPTION_BY_ID: `
    SELECT * FROM appointment_prescriptions WHERE prescription_id = ? LIMIT 1;
  `,
  GET_SIMILAR_PRESCRIPTION: `
    SELECT * FROM appointment_prescriptions WHERE appointment_id = ? AND diagnosis = ? AND medicines = ? AND doctors_comment = ? LIMIT 1;
  `,
  CREATE_PRESCRIPTION: `
    INSERT INTO appointment_prescriptions (appointment_id, diagnosis, medicines, doctors_comment)
    VALUES (?, ?, ?, ?);
  `,
  UPDATE_PRESCRIPTION: `
    UPDATE appointment_prescriptions
    SET diagnosis = ?, medicines = ?, doctors_comment = ?
    WHERE prescription_id = ? AND appointment_id = ? LIMIT 1;
  `,
  VERIFY_DOCTOR_PRESCRIPTION: `
      SELECT 
        d.doctor_id, d.title, d.first_name, d.middle_name, d.last_name,
        d.gender, d.signature_url, d.professional_summary, d.profile_pic_url,
        d.specialization_id, ms.speciality_name, d.qualifications,
        c.city_name, d.years_of_experience, d.is_profile_approved,
        u.mobile_number, u.email, dcr.registration_status, dcr.certificate_expiry_date,
        ap.prescription_id, ap.appointment_id, ap.diagnosis,
        ap.medicines, ap.doctors_comment, ap.created_at, ap.updated_at
      FROM appointment_prescriptions ap
      INNER JOIN medical_appointments ma ON ma.appointment_id = ap.appointment_id
      INNER JOIN doctors d ON d.doctor_id = ma.doctor_id
      INNER JOIN users u ON u.user_id = d.user_id
      INNER JOIN medical_specialities ms ON ms.speciality_id = d.specialization_id
      INNER JOIN cities c ON d.city_id = c.city_id
      INNER JOIN doctors_council_registration dcr ON d.doctor_id = dcr.doctor_id  
      WHERE ap.prescription_id = ? AND d.doctor_id = ? 
      AND d.is_profile_approved = 1
      AND dcr.registration_status = 'approved'
      AND dcr.certificate_expiry_date >= CURDATE(); 
  `,
};
