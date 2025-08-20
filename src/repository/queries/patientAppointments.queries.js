const COMMON_SELECT = `
SELECT medical_appointments.appointment_id, appointment_uuid, p.patient_id, p.first_name, p.last_name, p.gender,
      d.doctor_id, d.first_name AS doctor_first_name, d.last_name AS doctor_last_name, appointment_type,
      medical_appointments.consultation_fee, appointment_date, appointment_time, time_slot_id,
      patient_name_on_prescription, patient_mobile_number, patient_symptoms,
      d.specialization_id, speciality_name, medical_appointments.meeting_id, join_url, start_url,
      start_time, end_time, appointment_status, cancelled_reason, cancelled_at, canceled_by,
      postponed_by, postponed_date, postponed_reason, medical_appointments.created_at,
      medical_appointments.updated_at, amount_paid, currency, payment_method, order_id,
      transaction_id, payment_status
    FROM medical_appointments
    INNER JOIN patients AS p ON medical_appointments.patient_id = p.patient_id
    INNER JOIN doctors AS d ON medical_appointments.doctor_id = d.doctor_id
    INNER JOIN medical_specialities AS ms ON medical_appointments.speciality_id = ms.speciality_id
    LEFT JOIN appointment_payments ON medical_appointments.appointment_id = appointment_payments.appointment_id
    LEFT JOIN zoom_meetings ON medical_appointments.meeting_id = zoom_meetings.meeting_id
`;

module.exports = {
  GET_ALL_PATIENT_APPOINTMENTS: `
    ${COMMON_SELECT}
    WHERE medical_appointments.patient_id = ? AND payment_status = 'success'
    ORDER BY medical_appointments.appointment_id DESC
  `,

  GET_PATIENT_APPOINTMENTS_DASHBOARD_COUNTS: `
  SELECT
  SUM(appointment_status = 'completed') AS completedCount,
  SUM(appointment_status = 'canceled') AS canceledAppointmentCount,
  SUM(appointment_date > CURDATE() AND appointment_status IN ('pending')) AS pendingAppointmentCount,
  SUM(appointment_date = CURDATE() AND appointment_status IN ('approved', 'pending', 'started')) AS todayAppointmentCount,
  SUM(appointment_status = 'postponed') AS postponeAppointmentCount
  FROM medical_appointments
  INNER JOIN patients AS p ON medical_appointments.patient_id = p.patient_id
  INNER JOIN appointment_payments ON medical_appointments.appointment_id = appointment_payments.appointment_id
  WHERE medical_appointments.patient_id = ? AND appointment_payments.payment_status = 'success';
  `,

  COUNT_PATIENT_APPOINTMENTS: `SELECT COUNT(*) AS totalRows FROM medical_appointments
    INNER JOIN patients AS p ON medical_appointments.patient_id = p.patient_id
    INNER JOIN doctors AS d ON medical_appointments.doctor_id = d.doctor_id
    INNER JOIN appointment_payments ON medical_appointments.appointment_id = appointment_payments.appointment_id
    INNER JOIN medical_specialities AS ms ON medical_appointments.speciality_id = ms.speciality_id
    LEFT JOIN zoom_meetings ON medical_appointments.meeting_id = zoom_meetings.meeting_id
    WHERE medical_appointments.patient_id = ? AND payment_status = 'success'
    `,

  GET_PATIENT_APPOINTMENT_BY_ID: `
    ${COMMON_SELECT}
    WHERE medical_appointments.patient_id = ? AND payment_status = 'success' AND medical_appointments.appointment_id = ?
    LIMIT 1
  `,

  GET_EXISITING_APPOINTMENTS: `
  SELECT appointment_date, appointment_time
  FROM medical_appointments
  WHERE doctor_id = ?
  AND appointment_date = ?
  AND appointment_status IN ('approved', 'pending', 'started', 'postponed')
  ORDER BY appointment_date, appointment_time;
  `,

  GET_PATIENT_APPOINTMENT_BY_UUID: `
    ${COMMON_SELECT}
    WHERE medical_appointments.patient_id = ? AND medical_appointments.appointment_uuid = ?
    LIMIT 1
  `,

  GET_APPOINTMENT_BY_UUID: `
    ${COMMON_SELECT}
    WHERE medical_appointments.appointment_uuid = ? LIMIT 1
  `,

  GET_APPOINTMENT_BY_ID: `
    ${COMMON_SELECT}
    WHERE medical_appointments.appointment_id = ?
    LIMIT 1
  `,

  CREATE_NEW_PATIENT_APPOINTMENT: `
    INSERT INTO medical_appointments (
      appointment_uuid, patient_id, doctor_id, appointment_type,
      patient_name_on_prescription, patient_mobile_number, speciality_id,
      patient_symptoms, consultation_fee, appointment_date, appointment_time
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?)
  `,

  DELETE_APPOINTMENT_BY_ID: `
    DELETE FROM medical_appointments WHERE appointment_id = ? LIMIT 1
  `,
};
