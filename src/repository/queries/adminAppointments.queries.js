const baseAppointmentSelect = `
  SELECT 
    appointment_id, appointment_uuid,
    patients.patient_id, patients.first_name, patients.last_name,
    doctors.doctor_id, doctors.first_name AS doc_first_name, doctors.last_name AS doc_last_name,
    medical_appointments.consultation_fee,
    appointment_type, appointment_date, appointment_time,
    time_slot_id, patient_name_on_prescription,
    patient_mobile_number, patient_symptoms,
    speciality_name, meeting_id, start_time, end_time,
    appointment_status, cancelled_reason, cancelled_at,
    canceled_by, postponed_by, postponed_date, postponed_reason,
    medical_appointments.created_at, medical_appointments.updated_at
  FROM medical_appointments
  INNER JOIN patients ON medical_appointments.patient_id = patients.patient_id
  INNER JOIN doctors ON medical_appointments.doctor_id = doctors.doctor_id
  INNER JOIN medical_specialities ON medical_appointments.speciality_id = medical_specialities.speciality_id
`;

module.exports = {
  GET_ALL_APPOINTMENTS: `${baseAppointmentSelect} `,
  GET_APPOINTMENTS: `${baseAppointmentSelect} ORDER BY appointment_id ASC`,
  GET_APPOINTMENTS_BY_DOCTOR_ID: `${baseAppointmentSelect} WHERE medical_appointments.doctor_id = ? ORDER BY medical_appointments.created_at`,
  GET_APPOINTMENT_BY_ID: `${baseAppointmentSelect} WHERE medical_appointments.appointment_id = ?;`,
  GET_APPOINTMENT_BY_UUID: `
    SELECT 
      appointment_id, appointment_uuid,
      p.patient_id, p.first_name, p.last_name,
      d.doctor_id, d.first_name, d.last_name,
      appointment_type, medical_appointments.consultation_fee, appointment_type,
      appointment_date, appointment_time, time_slot_id,
      patient_name_on_prescription, patient_mobile_number, patient_symptoms,
      speciality_name, meeting_url, start_time, end_time, appointment_status,
      cancelled_reason, cancelled_at, canceled_by,
      postponed_by, postponed_date, postponed_reason,
      medical_appointments.created_at, medical_appointments.updated_at
    FROM medical_appointments
    INNER JOIN patients AS p ON medical_appointments.patient_id = p.patient_id
    INNER JOIN doctors AS d ON medical_appointments.doctor_id = d.doctor_id
    INNER JOIN medical_specialities AS ms ON medical_appointments.speciality_id = ms.speciality_id
    WHERE medical_appointments.appointment_uuid = ?
    LIMIT 1;
  `,
};
