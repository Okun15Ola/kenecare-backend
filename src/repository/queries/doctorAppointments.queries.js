const COMMON_SELECT = `
  SELECT medical_appointments.appointment_id, appointment_uuid, p.patient_id, p.first_name, p.last_name, p.gender,
  d.doctor_id, d.first_name AS doctor_first_name, d.last_name AS doctor_last_name, appointment_type,
  medical_appointments.consultation_fee, appointment_date, appointment_time, time_slot_id,
  patient_name_on_prescription, patient_mobile_number, patient_symptoms, d.specialization_id, speciality_name,
  medical_appointments.meeting_id, join_url, start_url, start_time, end_time, appointment_status,
  cancelled_reason, cancelled_at, canceled_by, postponed_by, postponed_date, postponed_reason,
  medical_appointments.created_at, medical_appointments.updated_at, amount_paid, currency, payment_method,
  order_id, transaction_id, payment_status 
  FROM medical_appointments
  INNER JOIN patients AS p ON medical_appointments.patient_id = p.patient_id
  INNER JOIN doctors AS d ON medical_appointments.doctor_id = d.doctor_id
  INNER JOIN appointment_payments ON medical_appointments.appointment_id = appointment_payments.appointment_id
  INNER JOIN medical_specialities AS ms ON medical_appointments.speciality_id = ms.speciality_id
  LEFT JOIN zoom_meetings ON medical_appointments.meeting_id = zoom_meetings.meeting_id
`;

module.exports = {
  GET_APPOINTMENTS_BY_DOCTOR_ID: `
    ${COMMON_SELECT}
    WHERE medical_appointments.doctor_id = ? AND payment_status = 'success'
    ORDER BY medical_appointments.appointment_id DESC 
  `,

  GET_DOCTOR_APPOINTMENT_BY_ID: `
    ${COMMON_SELECT}
    WHERE medical_appointments.doctor_id = ? AND medical_appointments.appointment_id = ? AND payment_status = 'success'
    LIMIT 1;
  `,

  GET_APPOINTMENT_BY_MEETING_ID: `
    ${COMMON_SELECT}
    WHERE medical_appointments.meeting_id = ? AND payment_status = 'success'
    LIMIT 1;
  `,

  APPROVE_APPOINTMENT: `
    UPDATE medical_appointments
    SET appointment_status = 'approved',
        cancelled_reason = NULL, cancelled_at = NULL, canceled_by = NULL,
        postponed_by = NULL, postponed_date = NULL, postponed_reason = NULL
    WHERE appointment_id = ? AND doctor_id = ?;
  `,

  UPDATE_MEETING_ID: `
    UPDATE medical_appointments
    SET meeting_id = ?
    WHERE appointment_id = ? AND doctor_id = ?;
  `,

  UPDATE_START_TIME: `
    UPDATE medical_appointments
    SET start_time = ?, appointment_status = 'started'
    WHERE appointment_id = ?;
  `,

  UPDATE_END_TIME: `
    UPDATE medical_appointments
    SET end_time = ?, appointment_status = 'completed'
    WHERE appointment_id = ?;
  `,

  CANCEL_APPOINTMENT: `
    UPDATE medical_appointments
    SET appointment_status = 'canceled',
        canceled_by = 'doctor', cancelled_reason = ?,
        postponed_by = NULL, postponed_date = NULL, postponed_reason = NULL
    WHERE appointment_id = ? AND doctor_id = ?;
  `,

  POSTPONE_APPOINTMENT: `
    UPDATE medical_appointments
    SET appointment_status = 'postponed',
        postponed_by = 'doctor', postponed_reason = ?, postponed_date = ?, appointment_date = ?, appointment_time = ?,
        cancelled_reason = NULL, cancelled_at = NULL, canceled_by = NULL
    WHERE appointment_id = ? AND doctor_id = ?;
  `,

  GET_APPOINTMENTS_BY_DATE: (startDate, endDate) => `
    ${COMMON_SELECT}
    WHERE medical_appointments.created_at BETWEEN '${startDate}' AND '${endDate}'
      AND medical_appointments.doctor_id = ? AND payment_status = 'success'
  `,

  GET_APPOINTMENT_BY_DATE_AND_TIME: `
    ${COMMON_SELECT}
    WHERE appointment_date = ? AND appointment_time = ?
      AND doctor_id = ? AND payment_status = 'success'
    LIMIT 1;
  `,

  CREATE_ZOOM_MEETING: `
    INSERT INTO zoom_meetings (zoom_id, zoom_uuid, meeting_topic, join_url, start_url, encrypted_password)
    VALUES (?, ?, ?, ?, ?, ?);
  `,
};
