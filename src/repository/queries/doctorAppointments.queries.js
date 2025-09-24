const COMMON_SELECT = `
  SELECT medical_appointments.appointment_id, appointment_uuid, p.patient_id, p.first_name, p.last_name, p.gender,
  d.doctor_id, d.first_name AS doctor_first_name, d.last_name AS doctor_last_name, appointment_type,
  medical_appointments.consultation_fee, appointment_date, appointment_time, time_slot_id,
  patient_name_on_prescription, patient_mobile_number, patient_symptoms, d.specialization_id, speciality_name,
  medical_appointments.meeting_id, join_url, start_url, start_time, end_time, appointment_status,
  cancelled_reason, cancelled_at, canceled_by, postponed_by, postponed_date, postponed_reason,
  medical_appointments.created_at, medical_appointments.updated_at, amount_paid, currency, payment_method,
  order_id, transaction_id, payment_status, COUNT(*) OVER() AS totalRows 
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
    LIMIT ?,?
  `,

  GET_ALL_DOCTORS_PENDING_APPOINTMENTS_TODAY: `
  SELECT medical_appointments.appointment_id, appointment_uuid, p.patient_id, p.first_name, p.last_name, p.gender,
  d.doctor_id, d.first_name AS doctor_first_name, d.last_name AS doctor_last_name, appointment_type,
  medical_appointments.consultation_fee, appointment_date, appointment_time, time_slot_id,
  patient_name_on_prescription, patient_mobile_number, patient_symptoms, d.specialization_id, speciality_name,
  medical_appointments.meeting_id, join_url, start_url, start_time, end_time, appointment_status,
  cancelled_reason, cancelled_at, canceled_by, postponed_by, postponed_date, postponed_reason,
  medical_appointments.created_at, medical_appointments.updated_at, amount_paid, currency, payment_method,
  order_id, transaction_id, payment_status, u.mobile_number AS doctor_mobile_number
  FROM medical_appointments
  INNER JOIN patients AS p ON medical_appointments.patient_id = p.patient_id
  INNER JOIN doctors AS d ON medical_appointments.doctor_id = d.doctor_id
  INNER JOIN users AS u ON d.user_id = u.user_id
  INNER JOIN appointment_payments ON medical_appointments.appointment_id = appointment_payments.appointment_id
  INNER JOIN medical_specialities AS ms ON medical_appointments.speciality_id = ms.speciality_id
  LEFT JOIN zoom_meetings ON medical_appointments.meeting_id = zoom_meetings.meeting_id
  WHERE appointment_status = 'pending'
      AND appointment_date = CURDATE()
      AND payment_status = 'success'
    ORDER BY medical_appointments.created_at, d.doctor_id, medical_appointments.appointment_time DESC
  `,

  GET_ALL_DOCTORS_APPROVED_APPOINTMENTS_TODAY: `
  SELECT medical_appointments.appointment_id, appointment_uuid, p.patient_id, p.first_name, p.last_name, p.gender,
  d.doctor_id, d.first_name AS doctor_first_name, d.last_name AS doctor_last_name, appointment_type,
  medical_appointments.consultation_fee, appointment_date, appointment_time, time_slot_id,
  patient_name_on_prescription, patient_mobile_number, patient_symptoms, d.specialization_id, speciality_name,
  medical_appointments.meeting_id, join_url, start_url, start_time, end_time, appointment_status,
  cancelled_reason, cancelled_at, canceled_by, postponed_by, postponed_date, postponed_reason,
  medical_appointments.created_at, medical_appointments.updated_at, amount_paid, currency, payment_method,
  order_id, transaction_id, payment_status, u.mobile_number AS doctor_mobile_number
  FROM medical_appointments
  INNER JOIN patients AS p ON medical_appointments.patient_id = p.patient_id
  INNER JOIN doctors AS d ON medical_appointments.doctor_id = d.doctor_id
  INNER JOIN users AS u ON d.user_id = u.user_id
  INNER JOIN appointment_payments ON medical_appointments.appointment_id = appointment_payments.appointment_id
  INNER JOIN medical_specialities AS ms ON medical_appointments.speciality_id = ms.speciality_id
  LEFT JOIN zoom_meetings ON medical_appointments.meeting_id = zoom_meetings.meeting_id
  WHERE appointment_status = 'approved'
      AND appointment_date = CURDATE()
      AND payment_status = 'success'
    ORDER BY medical_appointments.created_at, d.doctor_id, medical_appointments.appointment_time ASC
  `,

  GET_ALL_DOCTORS_APPOINTMENTS_TODAY: `
  SELECT medical_appointments.appointment_id, appointment_uuid, p.patient_id, p.first_name, p.last_name, p.gender,
  d.doctor_id, d.first_name AS doctor_first_name, d.last_name AS doctor_last_name, appointment_type,
  medical_appointments.consultation_fee, appointment_date, appointment_time, time_slot_id,
  patient_name_on_prescription, patient_mobile_number, patient_symptoms, d.specialization_id, speciality_name,
  medical_appointments.meeting_id, start_time, end_time, appointment_status,
  cancelled_reason, cancelled_at, canceled_by, postponed_by, postponed_date, postponed_reason,
  medical_appointments.created_at, medical_appointments.updated_at, amount_paid, currency, payment_method,
  order_id, transaction_id, payment_status, u.mobile_number AS doctor_mobile_number
  FROM medical_appointments
  INNER JOIN patients AS p ON medical_appointments.patient_id = p.patient_id
  INNER JOIN doctors AS d ON medical_appointments.doctor_id = d.doctor_id
  INNER JOIN users AS u ON d.user_id = u.user_id
  INNER JOIN appointment_payments ON medical_appointments.appointment_id = appointment_payments.appointment_id
  INNER JOIN medical_specialities AS ms ON medical_appointments.speciality_id = ms.speciality_id
  LEFT JOIN zoom_meetings ON medical_appointments.meeting_id = zoom_meetings.meeting_id
  WHERE d.doctor_id = ? AND appointment_status IN('approved', 'pending', 'postponed')
      AND appointment_date = CURDATE()
      AND payment_status = 'success'
    ORDER BY medical_appointments.created_at, d.doctor_id, medical_appointments.appointment_time ASC
  `,

  GET_DOCTOR_APPOINTMENTS_DATE_RANGE: `
  SELECT ma.appointment_id, ma.appointment_date, ma.appointment_time,
           p.first_name, p.last_name
    FROM medical_appointments ma
    INNER JOIN patients p ON ma.patient_id = p.patient_id
    INNER JOIN appointment_payments ap ON ma.appointment_id = ap.appointment_id
    WHERE ma.doctor_id = ? 
      AND ma.appointment_date BETWEEN ? AND ?
      AND ma.appointment_status IN ('pending', 'approved', 'postponed')
      AND ap.payment_status = 'success'
  `,

  GET_DOCTOR_APPOINTMENTS_DASHBOARD_METRICS: `
  SELECT
    -- Today's metrics
    COUNT(CASE WHEN ma.appointment_date = CURDATE() AND ma.appointment_status = 'completed' THEN 1 END) AS today_completed_count,
    COUNT(CASE WHEN ma.appointment_date = CURDATE() AND ma.appointment_status = 'canceled' THEN 1 END) AS today_canceled_count,
    COUNT(CASE WHEN ma.appointment_date = CURDATE() AND TIMESTAMP(ma.appointment_date, ma.appointment_time) > NOW() 
              AND ma.appointment_status IN ('approved', 'pending', 'started') THEN 1 END) AS today_upcoming_count,
    
    -- Total appointments metrics
    COUNT(*) AS total_appointment_count,
    COUNT(CASE WHEN ma.appointment_date > CURDATE() AND ma.appointment_status = 'approved' THEN 1 END) AS future_approved_count,
    COUNT(CASE WHEN ma.appointment_status = 'pending' THEN 1 END) AS total_pending_count,
    COUNT(CASE WHEN ma.appointment_date > CURDATE() AND ma.appointment_status = 'pending' THEN 1 END) AS future_pending_count,
    COUNT(CASE WHEN ma.appointment_date > CURDATE() AND ma.appointment_status = 'canceled' THEN 1 END) AS future_canceled_count,
    -- COUNT(CASE WHEN ma.appointment_date < CURDATE() AND ma.appointment_status = 'pending' THEN 1 END) AS past_pending_count,
    COUNT(CASE WHEN ma.appointment_status = 'postponed' THEN 1 END) AS total_postponed_count,
    COUNT(CASE WHEN ma.appointment_status = 'completed' THEN 1 END) AS total_completed_count,
    COUNT(CASE WHEN ma.appointment_status = 'approved' THEN 1 END) AS total_approved_count,
    COUNT(CASE WHEN ma.appointment_status = 'canceled' THEN 1 END) AS total_canceled_count
  FROM medical_appointments ma
  INNER JOIN appointment_payments ap ON ma.appointment_id = ap.appointment_id
  WHERE ma.doctor_id = ? AND ap.payment_status = 'success';
`,

  GET_DOCTOR_MONTHLY_APPOINTMENT_METRICS: `
  SELECT 
    m.month,
    m.monthName,
    COALESCE(COUNT(a.appointment_id), 0) AS totalAppointments,
    COALESCE(SUM(CASE WHEN a.appointment_status = 'completed' THEN 1 ELSE 0 END), 0) AS completedAppointments,
    COALESCE(SUM(CASE WHEN a.appointment_status = 'approved' THEN 1 ELSE 0 END), 0) AS approvedAppointments,
    COALESCE(SUM(CASE WHEN a.appointment_status = 'pending' THEN 1 ELSE 0 END), 0) AS pendingAppointments,
    COALESCE(SUM(CASE WHEN a.appointment_status = 'postponed' THEN 1 ELSE 0 END), 0) AS postponedAppointments,
    COALESCE(SUM(CASE WHEN a.appointment_status = 'canceled' THEN 1 ELSE 0 END), 0) AS canceledAppointments
    -- COALESCE(SUM(CASE WHEN a.appointment_status = 'started' THEN 1 ELSE 0 END), 0) AS startedAppointments
  FROM (
    SELECT 1 as month, 'January' as monthName UNION ALL
    SELECT 2, 'February' UNION ALL
    SELECT 3, 'March' UNION ALL
    SELECT 4, 'April' UNION ALL
    SELECT 5, 'May' UNION ALL
    SELECT 6, 'June' UNION ALL
    SELECT 7, 'July' UNION ALL
    SELECT 8, 'August' UNION ALL
    SELECT 9, 'September' UNION ALL
    SELECT 10, 'October' UNION ALL
    SELECT 11, 'November' UNION ALL
    SELECT 12, 'December'
  ) m
  LEFT JOIN (
    SELECT a.* 
    FROM medical_appointments a
    INNER JOIN appointment_payments ap ON a.appointment_id = ap.appointment_id 
    WHERE ap.payment_status = 'success'
    AND YEAR(a.appointment_date) = YEAR(CURDATE())
    AND a.doctor_id = ?
  ) a ON MONTH(a.appointment_date) = m.month
  GROUP BY m.month, m.monthName
  ORDER BY m.month
`,

  COUNT_DOCTOR_APPOINTMENTS_BY_ID: `
  SELECT COUNT(*) AS totalRows
  FROM medical_appointments
  INNER JOIN patients AS p ON medical_appointments.patient_id = p.patient_id
  INNER JOIN doctors AS d ON medical_appointments.doctor_id = d.doctor_id
  INNER JOIN appointment_payments ON medical_appointments.appointment_id = appointment_payments.appointment_id
  INNER JOIN medical_specialities AS ms ON medical_appointments.speciality_id = ms.speciality_id
  LEFT JOIN zoom_meetings ON medical_appointments.meeting_id = zoom_meetings.meeting_id
  WHERE medical_appointments.doctor_id = ? AND payment_status = 'success';
`,
  GET_DOCTOR_APPOINTMENT_BY_ID: `
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
  WHERE medical_appointments.doctor_id = ? AND medical_appointments.appointment_id = ? AND payment_status = 'success'
  LIMIT 1;
  `,
  GET_DOCTOR_APPOINTMENT_BY_UUID: `
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
  WHERE medical_appointments.doctor_id = ? AND medical_appointments.appointment_uuid = ? AND payment_status = 'success'
  LIMIT 1;
  `,

  GET_APPOINTMENT_BY_ID: `
    SELECT * FROM medical_appointments WHERE appointment_id = ? LIMIT 1;
  `,

  GET_APPOINTMENT_BY_MEETING_ID: `
    ${COMMON_SELECT}
    WHERE medical_appointments.meeting_id = ? AND payment_status = 'success'
    LIMIT 1;
  `,

  APPROVE_APPOINTMENT: `
    UPDATE medical_appointments
    SET appointment_status = 'approved',
        cancelled_reason = NULL,
        cancelled_at = NULL,
        canceled_by = NULL,
        postponed_by = NULL,
        postponed_date = NULL,
        postponed_reason = NULL
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

  BATCH_UPDATE_END_TIME: `
  UPDATE medical_appointments
  SET end_time = ?, appointment_status = 'completed'
  WHERE appointment_status = 'started'
  AND end_time IS NULL
  AND appointment_date < CURDATE();
      `,

  AUTO_UPDATE_END_TIME: `
  UPDATE medical_appointments
  SET end_time = CURTIME(), appointment_status = 'completed'
  WHERE appointment_status = 'started'
  AND start_time IS NOT NULL
  AND CONCAT(appointment_date, ' ', start_time) < NOW() - INTERVAL 30 MINUTE;
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

  GET_APPOINTMENTS_BY_DATE: `
    ${COMMON_SELECT}
    WHERE medical_appointments.created_at BETWEEN ? AND ?
      AND medical_appointments.doctor_id = ? AND payment_status = 'success'
    ORDER BY medical_appointments.created_at DESC
    LIMIT ?,?
  `,
  COUNT_APPOINTMENTS_BY_DATE: `
  SELECT COUNT(*) AS totalRows
  FROM medical_appointments
  INNER JOIN patients AS p ON medical_appointments.patient_id = p.patient_id
  INNER JOIN doctors AS d ON medical_appointments.doctor_id = d.doctor_id
  INNER JOIN appointment_payments ON medical_appointments.appointment_id = appointment_payments.appointment_id
  INNER JOIN medical_specialities AS ms ON medical_appointments.speciality_id = ms.speciality_id
  LEFT JOIN zoom_meetings ON medical_appointments.meeting_id = zoom_meetings.meeting_id
  WHERE medical_appointments.created_at BETWEEN ? AND ? AND medical_appointments.doctor_id = ? AND payment_status = 'success'`,

  GET_APPOINTMENT_BY_DATE_AND_TIME: `
    ${COMMON_SELECT}
    WHERE appointment_date = ? AND appointment_time = ?
      AND medical_appointments.doctor_id = ? AND payment_status = 'success'
    LIMIT 1;
  `,

  CREATE_ZOOM_MEETING: `
    INSERT INTO zoom_meetings (zoom_id, zoom_uuid, meeting_topic, join_url, start_url, encrypted_password)
    VALUES (?, ?, ?, ?, ?, ?);
  `,
};
