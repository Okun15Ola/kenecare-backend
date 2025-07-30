const DOCTOR_COLUMNS = `
  d.doctor_id, d.title, d.first_name, d.middle_name, d.last_name, 
  d.gender, d.professional_summary, d.profile_pic_url, 
  d.specialization_id, ms.speciality_name, d.qualifications, 
  d.consultation_fee, c.city_name, c.latitude, c.longitude, 
  d.years_of_experience, d.is_profile_approved, d.user_id, 
  u.mobile_number, u.email, u.user_type, u.is_account_active, u.is_online, 
  dcr.registration_status
`;

const DOCTOR_JOINS = `
  FROM doctors d
  INNER JOIN users u ON d.user_id = u.user_id
  INNER JOIN medical_specialities ms ON d.specialization_id = ms.speciality_id
  INNER JOIN cities c ON d.city_id = c.city_id
  INNER JOIN doctors_council_registration dcr ON d.doctor_id = dcr.doctor_id
`;

const APPROVED_DOCTOR_CONDITIONS = `
  WHERE d.is_profile_approved = 1
  AND dcr.registration_status = 'approved'
  AND dcr.certificate_expiry_date >= CURDATE()
`;

module.exports = {
  GET_ALL_DOCTORS: `
    SELECT ${DOCTOR_COLUMNS}
    ${DOCTOR_JOINS}
    ${APPROVED_DOCTOR_CONDITIONS}
  `,
  GET_DOCTORS_COUNT: `
    SELECT COUNT(*) as totalRows
    ${DOCTOR_JOINS}
    ${APPROVED_DOCTOR_CONDITIONS}
  `,
  SEARCH_DOCTOR_BY_QUERY: `
    SELECT ${DOCTOR_COLUMNS}
    ${DOCTOR_JOINS}
    WHERE d.city_id = ?
    AND (
      d.first_name LIKE ?
      OR d.middle_name LIKE ?
      OR d.last_name LIKE ?
      OR d.specialization_id LIKE ?
      OR ms.speciality_name LIKE ?
    )
    AND d.is_profile_approved = 1
    AND dcr.registration_status = 'approved'
    AND dcr.certificate_expiry_date >= CURDATE()
  `,
  COUNT_SEARCH_DOCTOR_BY_QUERY: `
  SELECT COUNT(*) AS totalRows
  ${DOCTOR_JOINS}
  WHERE d.city_id = ?
  AND (
    d.first_name LIKE ?
    OR d.middle_name LIKE ?
    OR d.last_name LIKE ?
    OR d.specialization_id LIKE ?
    OR ms.speciality_name LIKE ?
  )
  AND d.is_profile_approved = 1
  AND dcr.registration_status = 'approved'
  AND dcr.certificate_expiry_date >= CURDATE()
  `,
  GET_DOCTOR_BY_ID: `
    SELECT ${DOCTOR_COLUMNS}
    ${DOCTOR_JOINS}
    WHERE d.doctor_id = ?
    AND d.is_profile_approved = 1
    AND dcr.registration_status = 'approved'
    AND dcr.certificate_expiry_date >= CURDATE()
    LIMIT 1
  `,
  GET_DOCTOR_BY_USER_ID: `
    SELECT ${DOCTOR_COLUMNS}, u.notification_token
    ${DOCTOR_JOINS}
    WHERE d.user_id = ?
    LIMIT 1
  `,
  GET_DOCTORS_BY_CITY_ID: `
    SELECT ${DOCTOR_COLUMNS}
    ${DOCTOR_JOINS}
    WHERE d.city_id = ?
    AND d.is_profile_approved = 1
    AND dcr.registration_status = 'approved'
    AND dcr.certificate_expiry_date >= CURDATE()
  `,
  GET_DOCTORS_COUNT_BY_CITY:
    "SELECT COUNT(*) AS totalRows FROM doctors INNER JOIN doctors_council_registration dcr ON doctors.doctor_id = dcr.doctor_id WHERE city_id = ? AND is_profile_approved = 1 AND dcr.registration_status = 'approved' AND dcr.certificate_expiry_date >= CURDATE();",
  GET_DOCTORS_BY_SPECIALIZATION_ID: `
    SELECT ${DOCTOR_COLUMNS}
    ${DOCTOR_JOINS}
    WHERE d.specialization_id = ?
    AND d.is_profile_approved = 1
    AND dcr.registration_status = 'approved'
    AND dcr.certificate_expiry_date >= CURDATE()
  `,
  GET_DOCTORS_BY_SPECIALIZATION_ID_COUNT: `
    SELECT COUNT(*) AS totalRows
    FROM doctors
    INNER JOIN doctors_council_registration dcr ON doctors.doctor_id = dcr.doctor_id
    WHERE specialization_id = ? AND is_profile_approved = 1 AND dcr.registration_status = 'approved' AND dcr.certificate_expiry_date >= CURDATE();
  `,
  GET_DOCTORS_BY_HOSPITAL_ID: `
  SELECT ${DOCTOR_COLUMNS}
    ${DOCTOR_JOINS}
  WHERE hospital_id = ? AND is_profile_approved = 1
  AND dcr.registration_status = 'approved' 
  AND dcr.certificate_expiry_date >= CURDATE()
  `,
  GET_DOCTORS_BY_HOSPITAL_ID_COUNT:
    "SELECT COUNT(*) AS totalRows FROM INNER JOIN doctors_council_registration dcr ON doctors.doctor_id = dcr.doctor_id doctors WHERE hospital_id = ? AND dcr.registration_status = 'approved' AND dcr.certificate_expiry_date >= CURDATE();",
  GET_DOCTOR_COUNCIL_REGISTRATION_BY_DOCTOR_ID: `
    SELECT council_registration_id, dcr.doctor_id, first_name, last_name, gender, doctors.specialization_id, speciality_name, profile_pic_url, council_name, registration_number, registration_year, registration_document_url, certificate_issued_date, certificate_expiry_date, registration_status, rejection_reason, fullname as 'verified_by'
    FROM doctors_council_registration as dcr
    INNER JOIN doctors on dcr.doctor_id = doctors.doctor_id
    INNER JOIN medical_councils on dcr.medical_council_id = medical_councils.council_id
    INNER JOIN medical_specialities on doctors.specialization_id = medical_specialities.speciality_id
    LEFT JOIN admins on dcr.verified_by = admins.admin_id
    WHERE dcr.doctor_id = ? AND is_profile_approved = 1 LIMIT 1;
  `,
  GET_DOCTOR_ALL_COUNCIL_REGISTRATIONS: `
    SELECT council_registration_id, doctors_council_registration.doctor_id, first_name, last_name, doctors.specialization_id, speciality_name, profile_pic_url, council_name, years_of_experience, is_profile_approved, registration_number, registration_year, registration_document_url, certificate_issued_date, certificate_expiry_date, registration_status, rejection_reason, verified_by, doctors_council_registration.created_at
    FROM doctors_council_registration
    INNER JOIN medical_councils on doctors_council_registration.medical_council_id = medical_councils.council_id
    INNER JOIN doctors on doctors_council_registration.doctor_id = doctors.doctor_id
    INNER JOIN medical_specialities on doctors.specialization_id = medical_specialities.speciality_id
  `,
  COUNT_COUNCIL_REGISTRATIONS:
    "SELECT COUNT(*) AS totalRows FROM doctors_council_registration;",
  GET_DOCTOR_COUNCIL_REGISTRATION_BY_ID: `
    SELECT council_registration_id, doctors_council_registration.doctor_id, first_name, last_name, doctors.specialization_id, speciality_name, profile_pic_url, council_name, years_of_experience, is_profile_approved, registration_number, registration_year, registration_document_url, certificate_issued_date, certificate_expiry_date, registration_status, rejection_reason, verified_by, doctors_council_registration.created_at
    FROM doctors_council_registration
    INNER JOIN medical_councils on doctors_council_registration.medical_council_id = medical_councils.council_id
    INNER JOIN doctors on doctors_council_registration.doctor_id = doctors.doctor_id
    INNER JOIN medical_specialities on doctors.specialization_id = medical_specialities.speciality_id
    WHERE council_registration_id = ? AND is_profile_approved = 1 LIMIT 1;
  `,
  GET_DOCTOR_COUNCIL_REGISTRATION_COUNT: `
    SELECT COUNT(*) AS totalRows
    FROM doctors_council_registration;
  `,
  GET_DOCTOR_COUNCIL_REGISTRATION_BY_REG_NUMBER: `
    SELECT council_registration_id, doctors_council_registration.doctor_id, first_name, last_name, doctors.specialization_id, speciality_name, profile_pic_url, council_name, years_of_experience, is_profile_approved, registration_number, registration_year, registration_document_url, certificate_issued_date, certificate_expiry_date, registration_status, rejection_reason, verified_by, doctors_council_registration.created_at
    FROM doctors_council_registration
    INNER JOIN medical_councils on doctors_council_registration.medical_council_id = medical_councils.council_id
    INNER JOIN doctors on doctors_council_registration.doctor_id = doctors.doctor_id
    INNER JOIN medical_specialities on doctors.specialization_id = medical_specialities.speciality_id
    WHERE registration_number = ? AND is_profile_approved = 1 LIMIT 1;
  `,
  CREATE_DOCTOR: `
    INSERT INTO doctors (user_id, title, first_name, middle_name, last_name, gender, professional_summary, specialization_id, qualifications, consultation_fee, city_id, years_of_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `,
  CREATE_DOCTOR_COUNCIL_REGISTRATION: `
    INSERT INTO doctors_council_registration (doctor_id, medical_council_id, registration_number, registration_year, registration_document_url, certificate_issued_date, certificate_expiry_date)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `,
  UPDATE_DOCTOR_COUNCIL_REGISTRATION: `
    UPDATE doctors_council_registration
    SET medical_council_id = ?, registration_number = ?, registration_year = ?, registration_document_url = ?, certificate_issued_date = ?, certificate_expiry_date = ?
    WHERE council_registration_id = ? AND doctor_id = ?;
  `,
  UPDATE_DOCTOR: `
    UPDATE doctors
    SET title = ?, first_name = ?, middle_name = ?, last_name = ?, gender = ?, professional_summary = ?, specialization_id = ?, qualifications = ?, consultation_fee = ?, city_id = ?, years_of_experience = ?
    WHERE doctor_id = ? AND is_profile_approved = 1;
  `,
  UPDATE_DOCTOR_PROFILE_PICTURE:
    "UPDATE doctors SET profile_pic_url = ? WHERE doctor_id = ? AND is_profile_approved = 1",
};
