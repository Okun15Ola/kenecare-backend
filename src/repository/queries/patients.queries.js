module.exports = {
  GET_ALL_PATIENTS: `
    SELECT patient_id, title, first_name, middle_name, last_name, gender, profile_pic_url, dob, mobile_number, email, user_type, is_account_active, is_online
    FROM patients
    INNER JOIN users ON patients.user_id = users.user_id
  `,
  GET_PATIENT_BY_ID: `
    SELECT patient_id, title, first_name, middle_name, last_name, gender, profile_pic_url, dob, booked_first_appointment, mobile_number, email, users.user_id, notification_token, user_type, is_account_active, is_online
    FROM patients
    INNER JOIN users ON patients.user_id = users.user_id
    WHERE patient_id = ? LIMIT 1;
  `,
  GET_PATIENT_BY_USER_ID: `
    SELECT patient_id, first_name, middle_name, last_name, gender, dob, booked_first_appointment, patients.user_id, mobile_number, email, notification_token, profile_pic_url, user_type, is_account_active
    FROM patients
    INNER JOIN users ON patients.user_id = users.user_id
    WHERE patients.user_id = ? LIMIT 1;
  `,
  GET_PATIENTS_BY_CITY_ID: `
    SELECT * FROM doctors WHERE city_id = ?;
  `,
  CREATE_PATIENT: `
    INSERT INTO patients (user_id, first_name, middle_name, last_name, gender, dob)
    VALUES (?, ?, ?, ?, ?, ?);
  `,
  CREATE_PATIENT_MEDICAL_INFO: `
    INSERT INTO patient_medical_history (patient_id, height, weight, allergies, is_patient_disabled, disability_description, tobacco_use, tobacco_use_frequency, alcohol_use, alcohol_use_frequency, caffine_use, caffine_use_frequency)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `,
  GET_PATIENT_MEDICAL_INFO_BY_PATIENT_ID: `
    SELECT * FROM patient_medical_history WHERE patient_id = ? LIMIT 1;
  `,
  GET_DOCTORS_PATIENT_HAS_MET: `
  SELECT DISTINCT d.doctor_id, d.first_name, d.last_name, d.title, d.specialization_id, ms.speciality_name
  FROM medical_appointments ma
  INNER JOIN doctors d ON ma.doctor_id = d.doctor_id
  INNER JOIN medical_specialities ms ON d.specialization_id = ms.speciality_id
  WHERE ma.patient_id = ? AND ma.appointment_status IN ('approved', 'started', 'completed');`,
  UPDATE_PATIENT_BY_ID: `
    UPDATE patients SET first_name = ?, middle_name = ?, last_name = ?, gender = ?, dob = ? WHERE patient_id = ?;
  `,
  UPDATE_PATIENT_FIRST_APPOINTMENT_STATUS: `
    UPDATE patients SET booked_first_appointment = 1 WHERE patient_id = ?;
  `,
  UPDATE_PATIENT_PROFILE_PICTURE_BY_USER_ID: `
    UPDATE patients SET profile_pic_url = ? WHERE user_id = ?;
  `,
  UPDATE_PATIENT_MEDICAL_HISTORY: `
    UPDATE patient_medical_history
    SET height = ?, weight = ?, allergies = ?, is_patient_disabled = ?, disability_description = ?, tobacco_use = ?, tobacco_use_frequency = ?, alcohol_use = ?, alcohol_use_frequency = ?, caffine_use = ?, caffine_use_frequency = ?
    WHERE patient_id = ?;
  `,
};
