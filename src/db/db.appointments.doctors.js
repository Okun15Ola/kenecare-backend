const { connectionPool } = require("./db.connection");

exports.getAppointmentsByDoctorId = (doctorId) => {
  const sql =
    "SELECT appointment_id,appointment_uuid, patients.patient_id,patients.first_name, patients.last_name, doctors.doctor_id, doctors.first_name, doctors.last_name,appointment_type, appointment_date, appointment_time, time_slot_id, patient_name_on_prescription, patient_mobile_number, patient_symptoms,  speciality_name,meeting_url, start_time, end_time, appointment_status,cancelled_reason,cancelled_at,canceled_by,postponed_by,postponed_date,postponed_reason,medical_appointments.created_at, medical_appointments.updated_at FROM medical_appointments INNER JOIN patients on medical_appointments.patient_id = patients.patient_id INNER JOIN doctors on medical_appointments.doctor_id = doctors.doctor_id INNER JOIN medical_specialities on medical_appointments.speciality_id = medical_specialities.speciality_id WHERE medical_appointments.doctor_id = ?;";
  // const sql = "CALL  Sp_GetMedicalAppointmentsByPatientId(?)";
  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [doctorId], (error, results) => {
      if (error) return reject(error);

      const [appointments] = results;
      return resolve(appointments);
    });
  });
};

exports.getDoctorAppointmentById = ({ doctorId, appointmentId }) => {
  const sql =
    "SELECT * FROM medical_appointments WHERE appointment_id = ? AND doctor_id = ? LIMIT 1";
  // const sql = "CALL Sp_GetPatientMedicalAppointmentById(?,?);";

  return new Promise((resolve, reject) => {
    connectionPool.query(sql, [doctorId, appointmentId], (error, results) => {
      if (error) return reject(error);

      return resolve(results);
    });
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
