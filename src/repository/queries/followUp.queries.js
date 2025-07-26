module.exports = {
  CREATE_APPOINTMENT_FOLLOW_UP: `
    INSERT INTO appointment_followup (appointment_id, followup_date, followup_time, reason, followup_type, doctor_id)
    VALUES (?, ?, ?, ?, ?, ?);
  `,
  GET_ALL_APPOINTMENT_FOLLOW_UP_BY_APPOINTMENT_ID: `
    SELECT * FROM appointment_followup WHERE appointment_id = ?
  `,
  COUNT_DOCTOR_FOLLOW_UPS: `
  SELECT
  COUNT(*) AS totalFollowupCount,
  SUM(followup_status = 'completed') AS completedFollowupCount,
  SUM(followup_status = 'canceled') AS canceledFollowupCount,
  SUM(followup_date > CURDATE() AND followup_status = 'pending') AS upcomingFollowupCount,
  SUM(followup_date = CURDATE() AND followup_status = 'pending') AS todayFollowupCount,
  SUM(followup_status IN ('completed', 'canceled')) AS pastFollowupCount
  FROM appointment_followup
  WHERE doctor_id = ?;
  `,
  COUNT_PATIENT_FOLLOW_UPS: `
  SELECT
  COUNT(*) AS totalFollowupCount,
  SUM(followup_status = 'completed') AS completedFollowupCount,
  SUM(followup_status = 'canceled') AS canceledFollowupCount,
  SUM(followup_date > CURDATE() AND followup_status = 'pending') AS upcomingFollowupCount,
  SUM(followup_date = CURDATE() AND followup_status = 'pending') AS todayFollowupCount,
  SUM(followup_status IN ('completed', 'canceled')) AS pastFollowupCount
  FROM appointment_followup
  WHERE appointment_id IN (
  SELECT appointment_id FROM medical_appointments WHERE patient_id = ?
);
  `,
  GET_APPOINTMENT_FOLLOW_UP_BY_ID: `
    SELECT * FROM appointment_followup WHERE followup_id = ? LIMIT 1
  `,
  GET_APPOINTMENT_FOLLOW_UP_BY_ID_AND_DOCTOR: `
    SELECT * FROM appointment_followup WHERE followup_id = ? AND doctor_id = ? LIMIT 1
  `,
  GET_APPOINTMENT_FOLLOW_UP_BY_DATE_AND_TIME: `
    SELECT * FROM appointment_followup WHERE followup_date = ? AND followup_time = ? LIMIT 1
  `,
  GET_APPOINTMENT_FOLLOW_UP_BY_DATE_TIME_AND_DOCTOR: `
    SELECT * FROM appointment_followup WHERE followup_date = ? AND followup_time = ? AND doctor_id = ? LIMIT 1
  `,
  DELETE_APPOINTMENT_FOLLOW_UP_BY_ID: `
    DELETE FROM appointment_followup WHERE followup_id = ? LIMIT 1
  `,
  UPDATE_APPOINTMENT_FOLLOW_UP_BY_ID: `
    UPDATE appointment_followup
    SET followup_date = ?, followup_time = ?, reason = ?, followup_type = ?
    WHERE followup_id = ? AND appointment_id = ?
  `,
};
