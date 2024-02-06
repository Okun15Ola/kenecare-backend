const { connectionPool } = require("./db.connection");

exports.getAppointmentsByDoctorId = ({ doctorId, page = 1, limit = 20 }) => {
  page = page || 1;
  limit = limit || 20;

  const offset = (page - 1) * limit;

  const sql = `SELECT appointment_id,appointment_uuid, p.patient_id, p.first_name, p.last_name, d.doctor_id, d.first_name AS 'doctor_first_name', d.last_name AS 'doctor_last_name', appointment_type, medical_appointments.consultation_fee, appointment_date, appointment_time, time_slot_id, patient_name_on_prescription, patient_mobile_number, patient_symptoms,  speciality_name,  medical_appointments.meeting_id, join_url, start_url, start_time, end_time, appointment_status, cancelled_reason, cancelled_at, canceled_by, postponed_by, postponed_date, postponed_reason, medical_appointments.created_at, medical_appointments.updated_at FROM medical_appointments INNER JOIN patients as p on medical_appointments.patient_id = p.patient_id INNER JOIN doctors as d on medical_appointments.doctor_id = d.doctor_id INNER JOIN medical_specialities as ms on medical_appointments.speciality_id = ms.speciality_id LEFT JOIN zoom_meetings on medical_appointments.meeting_id = zoom_meetings.zoom_id  WHERE medical_appointments.doctor_id = ? ORDER BY medical_appointments.created_at DESC  LIMIT ${limit} OFFSET ${offset} ;`;
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [doctorId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};

exports.getDoctorAppointmentById = ({ doctorId, appointmentId }) => {
  const sql =
    "SELECT appointment_id,appointment_uuid, p.patient_id, p.first_name, p.last_name, d.doctor_id, d.first_name AS 'doctor_first_name', d.last_name AS 'doctor_last_name', appointment_type, medical_appointments.consultation_fee, appointment_date, appointment_time, time_slot_id, patient_name_on_prescription, patient_mobile_number, patient_symptoms,  speciality_name,  medical_appointments.meeting_id, join_url, start_url, start_time, end_time, appointment_status, cancelled_reason, cancelled_at, canceled_by, postponed_by, postponed_date, postponed_reason, medical_appointments.created_at, medical_appointments.updated_at FROM medical_appointments INNER JOIN patients as p on medical_appointments.patient_id = p.patient_id INNER JOIN doctors as d on medical_appointments.doctor_id = d.doctor_id INNER JOIN medical_specialities as ms on medical_appointments.speciality_id = ms.speciality_id LEFT JOIN zoom_meetings on medical_appointments.meeting_id = zoom_meetings.zoom_id  WHERE medical_appointments.doctor_id = ? AND medical_appointments.appointment_id = ? LIMIT 1";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [doctorId, appointmentId], (error, results) => {
      if (error) return reject(error);

      return resolve(results[0]);
    });
  });
};
exports.approveDoctorAppointmentById = ({
  doctorId,
  appointmentId,
  meetingId,
}) => {
  const sql =
    "UPDATE medical_appointments SET appointment_status = 'approved', meeting_id = ? cancelled_reason = NULL, cancelled_at = NULL, canceled_by = NULL, postponed_by = NULL, postponed_date = NULL, postponed_reason = NULL WHERE appointment_id = ? AND doctor_id = ?;";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [meetingId, appointmentId, doctorId],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};

exports.createNewZoomMeeting = ({
  meetingId,
  meetingUUID,
  meetingTopic,
  joinUrl,
  startUrl,
  encryptedPassword,
}) => {
  const sql =
    "INSERT INTO zoom_meetings (zoom_id, zoom_uuid, meeting_topic, join_url,start_url,encrypted_password) VALUES (?,?,?,?,?,?);";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [
        meetingId,
        meetingUUID,
        meetingTopic,
        joinUrl,
        startUrl,
        encryptedPassword,
      ],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};

exports.cancelDoctorAppointmentById = ({
  doctorId,
  appointmentId,
  cancelReason,
}) => {
  const sql =
    "UPDATE medical_appointments SET appointment_status = 'canceled', canceled_by = 'doctor', cancelled_reason = ?, postponed_by = NULL, postponed_date = NULL, postponed_reason = NULL  WHERE appointment_id = ? AND doctor_id = ?;";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [cancelReason, appointmentId, doctorId],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};
exports.postponeDoctorAppointmentById = ({
  doctorId,
  appointmentId,
  postponedReason,
  postponedDate,
}) => {
  const sql =
    "UPDATE medical_appointments SET appointment_status = 'postponed', postponed_by = 'doctor', postponed_reason = ?, postponed_date = ?, cancelled_reason = ?, cancelled_at =  NULL, canceled_by = ? WHERE appointment_id = ? AND doctor_id = ?;";

  return new Promise((resolve, reject) => {
    connectionPool.query(
      sql,
      [postponedReason, postponedDate, appointmentId, doctorId],
      (error, results) => {
        if (error) return reject(error);

        return resolve(results);
      }
    );
  });
};
exports.getDoctorAppointByDate = ({ doctorId, appointmentDate }) => {
  const sql =
    "SELECT * FROM medical_appointments WHERE appointment_date = ? AND doctor_id = ?;";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [appointmentDate, doctorId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
  });
};
