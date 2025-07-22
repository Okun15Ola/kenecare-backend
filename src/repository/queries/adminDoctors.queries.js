module.exports = {
  GET_ALL_DOCTORS: `
    SELECT doctor_id, title, first_name, middle_name, last_name, gender, professional_summary, profile_pic_url, doctors.specialization_id, speciality_name, qualifications, consultation_fee, city_name, latitude, longitude, years_of_experience, is_profile_approved, doctors.user_id, mobile_number, email, user_type, is_account_active
    FROM doctors
    INNER JOIN users ON doctors.user_id = users.user_id
    INNER JOIN medical_specialities ON doctors.specialization_id = medical_specialities.speciality_id
    INNER JOIN cities ON doctors.city_id = cities.city_id
  `,
  COUNT_DOCTORS: "SELECT COUNT(*) AS totalRows FROM doctors;",
  SEARCH_DOCTOR_BY_QUERY: `
  SELECT doctor_id, title, first_name, middle_name, last_name, gender, professional_summary, profile_pic_url,
         doctors.specialization_id, speciality_name, qualifications, consultation_fee, city_name, latitude, longitude,
         years_of_experience, is_profile_approved, doctors.user_id, mobile_number, email, user_type, is_account_active
  FROM doctors
  INNER JOIN users ON doctors.user_id = users.user_id
  INNER JOIN medical_specialities ON doctors.specialization_id = medical_specialities.speciality_id
  INNER JOIN cities ON doctors.city_id = cities.city_id
  WHERE doctors.city_id = ?
    AND (
      doctors.first_name LIKE ?
      OR doctors.middle_name LIKE ?
      OR doctors.last_name LIKE ?
      OR doctors.specialization_id LIKE ?
      OR speciality_name LIKE ?
    )
`,

  // SEARCH_DOCTOR_BY_QUERY: `
  //   SELECT doctor_id, title, first_name, middle_name, last_name, gender, professional_summary, profile_pic_url, doctors.specialization_id, speciality_name, qualifications, consultation_fee, city_name, latitude, longitude, years_of_experience, is_profile_approved, doctors.user_id, mobile_number, email, user_type, is_account_active
  //   FROM doctors
  //   INNER JOIN users ON doctors.user_id = users.user_id
  //   INNER JOIN medical_specialities ON doctors.specialization_id = medical_specialities.speciality_id
  //   INNER JOIN cities ON doctors.city_id = cities.city_id
  //   WHERE doctors.city_id = ? AND (doctors.first_name LIKE ? OR doctors.middle_name LIKE ? OR doctors.last_name
  //   LIKE ? OR doctors.specialization_id,speciality_name LIKE ?)
  // `,
  GET_DOCTOR_BY_ID: `
    SELECT doctor_id, title, first_name, middle_name, last_name, gender, professional_summary, profile_pic_url, doctors.specialization_id, speciality_name, qualifications, consultation_fee, city_name, years_of_experience, is_profile_approved, doctors.user_id, mobile_number, email, user_type, is_account_active
    FROM doctors
    INNER JOIN users ON doctors.user_id = users.user_id
    INNER JOIN medical_specialities ON doctors.specialization_id = medical_specialities.speciality_id
    INNER JOIN cities ON doctors.city_id = cities.city_id
    WHERE doctor_id = ? LIMIT 1;
  `,
  GET_DOCTOR_BY_USER_ID: `
    SELECT doctor_id, title, first_name, middle_name, last_name, gender, professional_summary, profile_pic_url, doctors.specialization_id, speciality_name, qualifications, consultation_fee, city_name, years_of_experience, is_profile_approved, doctors.user_id, notification_token, mobile_number, email, user_type, is_account_active
    FROM doctors
    INNER JOIN users ON doctors.user_id = users.user_id
    INNER JOIN medical_specialities ON doctors.specialization_id = medical_specialities.speciality_id
    INNER JOIN cities ON doctors.city_id = cities.city_id
    WHERE doctors.user_id = ? LIMIT 1;
  `,
  GET_DOCTOR_BY_CITY_ID: "SELECT * FROM doctors WHERE city_id = ?",
  GET_DOCTOR_BY_SPECIALIZATION_ID: `
    SELECT doctor_id, title, first_name, middle_name, last_name, gender, professional_summary, profile_pic_url, doctors.specialization_id, speciality_name, qualifications, consultation_fee, city_name, years_of_experience, is_profile_approved, doctors.user_id, mobile_number, email, user_type, is_account_active
    FROM doctors
    INNER JOIN users ON doctors.user_id = users.user_id
    INNER JOIN medical_specialities ON doctors.specialization_id = medical_specialities.speciality_id
    INNER JOIN cities ON doctors.city_id = cities.city_id
    WHERE doctors.specialization_id = ?
  `,
  GET_DOCTOR_BY_HOSPITAL_ID: "SELECT * FROM doctors WHERE hospital_id = ?",
  GET_DOCTOR_COUNCIL_REGISTRATION_BY_DOCTOR_ID: `
    SELECT council_registration_id, dcr.doctor_id, first_name, last_name, gender, doctors.specialization_id, speciality_name, profile_pic_url, council_name, registration_number, registration_year, registration_document_url, certificate_issued_date, certificate_expiry_date, registration_status, rejection_reason, fullname as 'verified_by'
    FROM doctors_council_registration as dcr
    INNER JOIN doctors on dcr.doctor_id = doctors.doctor_id
    INNER JOIN medical_councils on dcr.medical_council_id = medical_councils.council_id
    INNER JOIN medical_specialities on doctors.specialization_id = medical_specialities.speciality_id
    LEFT JOIN admins on dcr.verified_by = admins.admin_id
    WHERE dcr.doctor_id = ? LIMIT 1;
  `,
  GET_DOCTOR_ALL_COUNCIL_REGISTRATIONS: `
    SELECT council_registration_id, doctors_council_registration.doctor_id, first_name, last_name, doctors.specialization_id, speciality_name, profile_pic_url, council_name, years_of_experience, is_profile_approved, registration_number, registration_year, registration_document_url, certificate_issued_date, certificate_expiry_date, registration_status, rejection_reason, verified_by, doctors_council_registration.created_at
    FROM doctors_council_registration
    INNER JOIN medical_councils on doctors_council_registration.medical_council_id = medical_councils.council_id
    INNER JOIN doctors on doctors_council_registration.doctor_id = doctors.doctor_id
    INNER JOIN medical_specialities on doctors.specialization_id = medical_specialities.speciality_id
  `,
  GET_DOCTOR_COUNCIL_REGISTRATION_BY_ID: `
    SELECT council_registration_id, doctors_council_registration.doctor_id, first_name, last_name, doctors.specialization_id, speciality_name, profile_pic_url, council_name, years_of_experience, is_profile_approved, registration_number, registration_year, registration_document_url, certificate_issued_date, certificate_expiry_date, registration_status, rejection_reason, verified_by, doctors_council_registration.created_at
    FROM doctors_council_registration
    INNER JOIN medical_councils on doctors_council_registration.medical_council_id = medical_councils.council_id
    INNER JOIN doctors on doctors_council_registration.doctor_id = doctors.doctor_id
    INNER JOIN medical_specialities on doctors.specialization_id = medical_specialities.speciality_id
    WHERE council_registration_id = ? LIMIT 1;
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
    WHERE doctor_id = ?;
  `,
  UPDATE_DOCTOR_PROFILE_PICTURE:
    "UPDATE doctors SET profile_pic_url = ? WHERE doctor_id = ?",
  APPROVE_DOCTOR_PROFILE:
    "UPDATE doctors SET is_profile_approved = 1, approved_by = ? WHERE doctor_id = ?",
  APPROVE_DOCTOR_COUNCIL_REGISTRATION:
    "UPDATE doctors_council_registration SET registration_status = 'approved', verified_by = ? WHERE council_registration_id = ?",
  REJECT_DOCTOR_COUNCIL_REGISTRATION:
    "UPDATE doctors_council_registration SET registration_status = 'rejected', rejection_reason= ?, verified_by = ? WHERE council_registration_id = ?",
};
