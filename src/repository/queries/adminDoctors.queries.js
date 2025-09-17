const ADMIN_DOCTOR_COLUMNS = `
  d.doctor_id, d.title, d.first_name, d.middle_name, d.last_name, 
  d.gender, d.professional_summary, d.profile_pic_url, 
  d.specialization_id, ms.speciality_name, d.qualifications, 
  d.consultation_fee, c.city_name, c.latitude, c.longitude, 
  d.years_of_experience, d.is_profile_approved, d.user_id, 
  u.mobile_number, u.email, u.user_type, u.is_account_active, u.notification_token
`;

const ADMIN_COUNCIL_REGISTRATION_COLUMNS = `
  dcr.council_registration_id, dcr.doctor_id, 
  d.first_name, d.last_name, d.gender, d.specialization_id, 
  ms.speciality_name, d.profile_pic_url, mc.council_name, 
  dcr.registration_number, dcr.registration_year, dcr.registration_document_url, 
  dcr.certificate_issued_date, dcr.certificate_expiry_date, 
  dcr.registration_status, dcr.rejection_reason, 
  a.fullname as 'verified_by'
`;

const ADMIN_COUNCIL_REGISTRATION_JOINS = `
  FROM doctors_council_registration dcr
  INNER JOIN doctors d ON dcr.doctor_id = d.doctor_id
  INNER JOIN medical_councils mc ON dcr.medical_council_id = mc.council_id
  INNER JOIN medical_specialities ms ON d.specialization_id = ms.speciality_id
  LEFT JOIN admins a ON dcr.verified_by = a.admin_id
`;

module.exports = {
  GET_ALL_DOCTORS: `
  SELECT ${ADMIN_DOCTOR_COLUMNS}
  FROM doctors d
  INNER JOIN users u ON d.user_id = u.user_id
  INNER JOIN medical_specialities ms ON d.specialization_id = ms.speciality_id
  INNER JOIN cities c ON d.city_id = c.city_id
  ORDER BY d.updated_at DESC
  `,

  COUNT_DOCTORS: `
    SELECT COUNT(*) AS totalRows
    FROM doctors d
    INNER JOIN users u ON d.user_id = u.user_id
    INNER JOIN medical_specialities ms ON d.specialization_id = ms.speciality_id
    INNER JOIN cities c ON d.city_id = c.city_id  
  `,

  SEARCH_DOCTOR_BY_QUERY: `
  SELECT ${ADMIN_DOCTOR_COLUMNS}
  FROM doctors d
  INNER JOIN users u ON d.user_id = u.user_id
  INNER JOIN medical_specialities ms ON d.specialization_id = ms.speciality_id
  INNER JOIN cities c ON d.city_id = c.city_id
  WHERE d.city_id = ?
  AND (
    d.first_name LIKE ?
    OR d.middle_name LIKE ?
    OR d.last_name LIKE ?
    OR d.specialization_id LIKE ?
    OR ms.speciality_name LIKE ?
  )
  ORDER BY d.updated_at DESC
  `,

  GET_DOCTOR_BY_ID: `
  SELECT ${ADMIN_DOCTOR_COLUMNS}
  FROM doctors d
  INNER JOIN users u ON d.user_id = u.user_id
  INNER JOIN medical_specialities ms ON d.specialization_id = ms.speciality_id
  INNER JOIN cities c ON d.city_id = c.city_id
  WHERE d.doctor_id = ? 
  LIMIT 1
  `,

  GET_DOCTOR_BY_USER_ID: `
    SELECT ${ADMIN_DOCTOR_COLUMNS}
    FROM doctors d
    INNER JOIN users u ON d.user_id = u.user_id
    INNER JOIN medical_specialities ms ON d.specialization_id = ms.speciality_id
    INNER JOIN cities c ON d.city_id = c.city_id  
    WHERE d.user_id = ? 
    LIMIT 1
  `,

  GET_DOCTOR_BY_CITY_ID: `
    SELECT ${ADMIN_DOCTOR_COLUMNS}
    FROM doctors d
    INNER JOIN users u ON d.user_id = u.user_id
    INNER JOIN medical_specialities ms ON d.specialization_id = ms.speciality_id
    INNER JOIN cities c ON d.city_id = c.city_id  
    WHERE d.city_id = ?
    ORDER BY d.updated_at DESC
  `,

  GET_DOCTOR_COUNCIL_REGISTRATION_COUNT: `
    SELECT COUNT(*) AS totalRows
    FROM doctors_council_registration
  `,

  GET_DOCTOR_BY_SPECIALIZATION_ID: `
    SELECT ${ADMIN_DOCTOR_COLUMNS}
    FROM doctors d
    INNER JOIN users u ON d.user_id = u.user_id
    INNER JOIN medical_specialities ms ON d.specialization_id = ms.speciality_id
    INNER JOIN cities c ON d.city_id = c.city_id  
    WHERE d.specialization_id = ?
    ORDER BY d.updated_at DESC
  `,

  GET_DOCTOR_BY_HOSPITAL_ID: `
    SELECT ${ADMIN_DOCTOR_COLUMNS}
    FROM doctors d
    INNER JOIN users u ON d.user_id = u.user_id
    INNER JOIN medical_specialities ms ON d.specialization_id = ms.speciality_id
    INNER JOIN cities c ON d.city_id = c.city_id  
    WHERE d.hospital_id = ?
    ORDER BY d.updated_at DESC
  `,

  GET_DOCTOR_COUNCIL_REGISTRATION_BY_DOCTOR_ID: `
    SELECT ${ADMIN_COUNCIL_REGISTRATION_COLUMNS}
    ${ADMIN_COUNCIL_REGISTRATION_JOINS}
    WHERE dcr.doctor_id = ? 
    LIMIT 1
  `,

  GET_DOCTOR_ALL_COUNCIL_REGISTRATIONS: `
    SELECT 
      dcr.council_registration_id, dcr.doctor_id, d.first_name, d.last_name, 
      d.specialization_id, ms.speciality_name, d.profile_pic_url, mc.council_name,
      d.years_of_experience, d.is_profile_approved, 
      dcr.registration_number, dcr.registration_year, dcr.registration_document_url, 
      dcr.certificate_issued_date, dcr.certificate_expiry_date, 
      dcr.registration_status, dcr.rejection_reason, dcr.verified_by, 
      dcr.created_at
    FROM doctors_council_registration dcr
    INNER JOIN medical_councils mc ON dcr.medical_council_id = mc.council_id
    INNER JOIN doctors d ON dcr.doctor_id = d.doctor_id
    INNER JOIN medical_specialities ms ON d.specialization_id = ms.speciality_id
    ORDER BY dcr.updated_at DESC
  `,

  GET_DOCTOR_COUNCIL_REGISTRATION_BY_ID: `
    SELECT 
      dcr.council_registration_id, dcr.doctor_id, d.first_name, d.last_name, 
      d.specialization_id, ms.speciality_name, d.profile_pic_url, mc.council_name,
      d.years_of_experience, d.is_profile_approved, 
      dcr.registration_number, dcr.registration_year, dcr.registration_document_url, 
      dcr.certificate_issued_date, dcr.certificate_expiry_date, 
      dcr.registration_status, dcr.rejection_reason, dcr.verified_by, 
      dcr.created_at
    FROM doctors_council_registration dcr
    INNER JOIN medical_councils mc ON dcr.medical_council_id = mc.council_id
    INNER JOIN doctors d ON dcr.doctor_id = d.doctor_id
    INNER JOIN medical_specialities ms ON d.specialization_id = ms.speciality_id
    WHERE dcr.council_registration_id = ? 
    LIMIT 1
  `,
  GET_DOCTOR_COUNCIL_REGISTRATION_BY_REG_NUMBER: `
    SELECT council_registration_id, doctors_council_registration.doctor_id, first_name, last_name, doctors.specialization_id, speciality_name, profile_pic_url, council_name, years_of_experience, is_profile_approved, registration_number, registration_year, registration_document_url, certificate_issued_date, certificate_expiry_date, registration_status, rejection_reason, verified_by, doctors_council_registration.created_at
    FROM doctors_council_registration
    INNER JOIN medical_councils on doctors_council_registration.medical_council_id = medical_councils.council_id
    INNER JOIN doctors on doctors_council_registration.doctor_id = doctors.doctor_id
    INNER JOIN medical_specialities on doctors.specialization_id = medical_specialities.speciality_id
    WHERE registration_number = ? LIMIT 1;
  `,

  CREATE_DOCTOR: `
    INSERT INTO doctors (user_id, title, first_name, middle_name, last_name, gender, professional_summary, specialization_id, qualifications, consultation_fee, city_id, years_of_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,

  CREATE_DOCTOR_COUNCIL_REGISTRATION: `
    INSERT INTO doctors_council_registration (doctor_id, medical_council_id, registration_number, registration_year, registration_document_url, certificate_issued_date, certificate_expiry_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,

  UPDATE_DOCTOR_COUNCIL_REGISTRATION: `
    UPDATE doctors_council_registration
    SET medical_council_id = ?, registration_number = ?, registration_year = ?, registration_document_url = ?, certificate_issued_date = ?, certificate_expiry_date = ?
    WHERE council_registration_id = ? AND doctor_id = ?
  `,

  UPDATE_DOCTOR: `
    UPDATE doctors
    SET title = ?, first_name = ?, middle_name = ?, last_name = ?, gender = ?, professional_summary = ?, specialization_id = ?, qualifications = ?, consultation_fee = ?, city_id = ?, years_of_experience = ?
    WHERE doctor_id = ?
  `,

  UPDATE_DOCTOR_PROFILE_PICTURE: `
    UPDATE doctors 
    SET profile_pic_url = ? 
    WHERE doctor_id = ?
  `,

  APPROVE_DOCTOR_PROFILE: `
    UPDATE doctors 
    SET is_profile_approved = 1, approved_by = ? 
    WHERE doctor_id = ?
  `,

  APPROVE_DOCTOR_COUNCIL_REGISTRATION: `
    UPDATE doctors_council_registration 
    SET registration_status = 'approved', verified_by = ? 
    WHERE council_registration_id = ?
  `,

  REJECT_DOCTOR_COUNCIL_REGISTRATION: `
    UPDATE doctors_council_registration 
    SET registration_status = 'rejected', rejection_reason = ?, verified_by = ? 
    WHERE council_registration_id = ?
  `,
};
